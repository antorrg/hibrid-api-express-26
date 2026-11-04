# Invalidation de Sesiones por Usuario (Guía para Boilerplates Multi-ORM)

Este documento detalla la arquitectura, el flujo de responsabilidades y la implementación práctica para invalidar sesiones activas de un usuario en un generador de boilerplates (compatible con **Sequelize**, **Prisma** y **Drizzle**).

---

## 1. Problema de Seguridad que Resuelve

Cuando un usuario:
- Cambia su contraseña.
- Es deshabilitado (`enabled = false`).
- Es cambiado de rol (ej: de `ADMIN` a `USER`).
- Es eliminado del sistema.

Las sesiones HTTP basadas en cookies (`express-session`) persistidas en base de datos quedan activas hasta que expira su TTL natural. Si un atacante o una sesión antigua persiste en otro dispositivo, conserva el acceso con permisos obsoletos.
Para cerrar esta brecha, el backend debe destruir inmediatamente todas las sesiones pertenecientes a ese `userId`.

---

## 2. Arquitectura y Reglas de Diseño (Clean Architecture / Service-Repository)

Siguiendo las directrices de `AGENTS.md`:
1. **`UserService` (Capa de Servicio)**:
   - Contiene la orquestación del negocio y los efectos secundarios.
   - No interactúa directamente con la tabla ni el driver de sesiones ni con SQL.
   - Recibe a través de su constructor un callback opcional inyectado:
     ```ts
     handleSessionInvalidation?: (userId: string) => Promise<void | number>
     ```
   - Invoca `await this.handleSessionInvalidation?.(userId)` tras ejecutar con éxito operaciones críticas (`changePassword`, `upgradeUser`, `deleteUser`).

2. **`SessionAdapter` / `ConnectDb` (Capa de Infraestructura de Sesión)**:
   - Implementa la interfaz `ISessionAdapter`.
   - Agrega el método `destroyByUserId(userId: string)`.
   - Se encarga de la consulta de eliminación según el ORM utilizado.

3. **`dependencies.ts` (Contenedor de Inyección de Dependencias)**:
   - Instancia el repositorio y el adaptador de sesión.
   - Inyecta la función delegada `(userId) => sessionAdapter.destroyByUserId(userId)` al instanciar `UserService`.

---

## 3. Formato del Payload de Sesión en Base de Datos

En `express-session`, el store serializa los datos como un string JSON en la columna `data` (tipo `TEXT` o `VARCHAR`):

```json
{"cookie":{"originalMaxAge":1800000,"expires":"..."},"csrfSecret":"...","user":{"id":"3fa85f64-5717-4562-b3fc-2c963f66afa6","email":"admin@test.com","role":"ADMIN"}}
```

Dado que el UUID de usuario es único y está prefijado por `"id":`, la condición de búsqueda segura es:
`%"id":"<userId>"%`

---

## 4. Implementación en `types.ts`

En `server/shared/auth/session/types.ts`:

```typescript
export interface ISessionAdapter {
  get(sid: string): Promise<{ sid: string; expires: Date; data: string; [key: string]: unknown } | null>;
  set(sid: string, defaults: DefaultFields): Promise<void>;
  touch(sid: string, expires: Date): Promise<void>;
  destroy(sid: string): Promise<void>;
  destroyByUserId?(userId: string): Promise<void | number>; // <-- Nuevo método
  length(): Promise<number>;
  clearExpiredSessions(now?: Date): Promise<void>;
}
```

---

## 5. Implementación por ORM en `ConnectDb` / `SessionAdapter`

### A. Sequelize
```typescript
import { Op } from 'sequelize'

class ConnectDb implements ISessionAdapter {
  // ...
  async destroyByUserId(userId: string): Promise<number> {
    return await this.sessionModel.destroy({
      where: {
        data: {
          [Op.like]: `%"id":"${userId}"%`
        }
      }
    })
  }
}
```

### B. Prisma
```typescript
import type { PrismaClient } from '@prisma/client'

class PrismaSessionAdapter implements ISessionAdapter {
  constructor(private prisma: PrismaClient) {}

  // ...
  async destroyByUserId(userId: string): Promise<number> {
    const result = await this.prisma.session.deleteMany({
      where: {
        data: {
          contains: `"id":"${userId}"`
        }
      }
    })
    return result.count
  }
}
```

### C. Drizzle
```typescript
import { like } from 'drizzle-orm'
import { sessions } from '../db/schema' // Tu esquema de drizzle

class DrizzleSessionAdapter implements ISessionAdapter {
  constructor(private db: any) {}

  // ...
  async destroyByUserId(userId: string): Promise<void> {
    await this.db.delete(sessions).where(
      like(sessions.data, `%"id":"${userId}"%`)
    )
  }
}
```

---

## 6. Modificaciones en `UserService.ts`

```typescript
export class UserService {
  private userRepository: IUserRepository
  private handleImageDelete: (url: string) => Promise<string | undefined>
  private handleSessionInvalidation?: (userId: string) => Promise<void | number>

  constructor(
    userRepository: IUserRepository,
    handleImageDelete: (url: string) => Promise<string | undefined>,
    handleSessionInvalidation?: (userId: string) => Promise<void | number>
  ) {
    this.userRepository = userRepository
    this.handleImageDelete = handleImageDelete
    this.handleSessionInvalidation = handleSessionInvalidation
  }

  async changePassword(data: { id: string, password: string, newPassword: string }): Promise<IUser> {
    // 1. Validar usuario y password anterior
    // ...
    // 2. Persistir nuevo password
    const updatedUser = await this.userRepository.update(data.id, user!)
    
    // 3. Invalidar sesiones activas
    await this.handleSessionInvalidation?.(data.id)
    
    return updatedUser
  }

  async upgradeUser(userId: string, data: { role: string, enabled: boolean }): Promise<IUser> {
    // 1. Validar y cambiar scope
    // ...
    const updatedUser = await this.userRepository.update(userId, user!)
    
    // 2. Invalidar sesiones activas
    await this.handleSessionInvalidation?.(userId)
    
    return updatedUser
  }

  async deleteUser(userId: string) {
    // 1. Validar y eliminar
    // ...
    await this.userRepository.delete(userId)
    await this.handleImageDelete(oldPictureUrl)
    
    // 2. Invalidar sesiones activas
    await this.handleSessionInvalidation?.(userId)
    
    return `User with email: ${message} deleted successfully`
  }
}
```

---

## 7. Cableado en `dependencies.ts`

```typescript
import sessionAdapter from './auth/session/connect-db.js'

const userRepository = new UserRepository()
export const userService = new UserService(
  userRepository,
  fileStorageService.deleteOldImage,
  (userId: string) => sessionAdapter.destroyByUserId(userId)
)
```

---

## 8. Estrategia de Testing (Vitest / Jest)

En `UserService.test.ts`:
```typescript
const mockHandleSessionInvalidation = vi.fn()

function makeService() {
  return new UserService(
    mockRepo as unknown as IUserRepository,
    mockHandleImageDelete,
    mockHandleSessionInvalidation
  )
}

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('debe invalidar la sesión al cambiar password', async () => {
    // ...
    await service.changePassword({ id: user.id, password: 'old', newPassword: 'new' })
    expect(mockHandleSessionInvalidation).toHaveBeenCalledWith(user.id)
  })

  it('debe invalidar la sesión al modificar rol o bloqueo', async () => {
    // ...
    await service.upgradeUser(user.id, { role: 'ADMIN', enabled: false })
    expect(mockHandleSessionInvalidation).toHaveBeenCalledWith(user.id)
  })

  it('debe invalidar la sesión al eliminar usuario', async () => {
    // ...
    await service.deleteUser(user.id)
    expect(mockHandleSessionInvalidation).toHaveBeenCalledWith(user.id)
  })
})
```

