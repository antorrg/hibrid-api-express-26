
# hibrid-api-express-26

Aplicación Express 5 + TypeScript + PostgreSQL (Sequelize 6) que combina **tres superficies** en un solo servidor:

| Superficie | Qué es | Rutas | Autenticación |
| :--- | :--- | :--- | :--- |
| **Sitio público (EJS)** | Landing, productos, videos, "acerca" y contacto, renderizados en el servidor | `/`, `/detalles`, `/videos/:id`, `/acerca`, `/contacto` | Ninguna |
| **Panel de administración (React)** | SPA (Vite + React 19 + React Router + Zustand) servida por Express | `/login`, `/admin/*` | Sesión (cookie) + CSRF |
| **API REST** | Alimenta al panel y a un frontend externo | `/api/v1/*` (admin) y `/api/v1/extclients/*` (clientes externos) | Sesión + CSRF (admin) / API key (clientes externos) |

El contenido que se muestra en el sitio público (portada, productos, variantes, videos, "acerca") se administra desde el panel. El frontend externo consume las cartas del proyecto *Cartas al aire* a través de `/api/v1/extclients/letters`.

---

## Índice

1. [Stack](#stack)
2. [Requisitos](#requisitos)
3. [Puesta en marcha local](#puesta-en-marcha-local)
4. [Variables de entorno](#variables-de-entorno)
5. [Base de datos y migraciones](#base-de-datos-y-migraciones)
6. [Scripts](#scripts)
7. [Estructura del proyecto](#estructura-del-proyecto)
8. [Arquitectura y convenciones](#arquitectura-y-convenciones)
9. [Autenticación, sesión y seguridad](#autenticación-sesión-y-seguridad)
10. [Referencia de la API](#referencia-de-la-api)
11. [API para clientes externos](#api-para-clientes-externos)
12. [Formato de errores](#formato-de-errores)
13. [Servicios externos](#servicios-externos)
14. [Tests](#tests)
15. [Despliegue](#despliegue)

---

## Stack

- **Servidor:** Node.js, Express 5, TypeScript, Sequelize 6 (PostgreSQL), `express-session` con store propio en base de datos, Pino (logs), Multer, Nodemailer, `sanitize-html`, `express-rate-limit`, `req-valid-express` (validación).
- **Vistas públicas:** EJS + scripts propios en `src/files/` (compilados por Vite).
- **Panel admin:** React 19, React Router, Zustand, React Bootstrap, React Toastify.
- **Imágenes:** Firebase Storage en producción; carpeta local en desarrollo y test.
- **Tests:** Vitest (unitarios, integración y frontend con jsdom), Supertest, Testing Library.
- **Gestor de paquetes:** pnpm.

## Requisitos

- Node.js **20 o superior**
- pnpm
- PostgreSQL accesible desde `DATABASE_URL`
- Un proyecto de Firebase con Storage (solo producción)
- Una cuenta de Gmail con contraseña de aplicación (para el formulario de contacto y los avisos)

## Puesta en marcha local

```bash
pnpm install
cp .env.example .env.development   # completar los valores (ver tabla más abajo)
pnpm dev
```

`pnpm dev` levanta en paralelo:

- **Vite** (panel React y assets) en `http://localhost:5173`
- **Servidor Express** (`tsx watch`) en el `PORT` configurado

En desarrollo los enlaces de la barra del sitio público hacia `/admin` y `/login` apuntan a `http://localhost:5173/`. En producción son rutas relativas del mismo servidor.

## Variables de entorno

El archivo que se carga depende de `NODE_ENV`:

| `NODE_ENV` | Archivo |
| :--- | :--- |
| `production` (o sin definir) | `.env` (en plataformas como Render/Railway se usan las variables del panel) |
| `development` | `.env.development` |
| `test` | `.env.test` |

Todas las variables marcadas como obligatorias hacen que el servidor **no arranque** si faltan.

| Variable | Obligatoria | Descripción |
| :--- | :---: | :--- |
| `PORT` | Sí | Puerto del servidor |
| `DATABASE_URL` | Sí | Cadena de conexión PostgreSQL. Si el proveedor exige SSL, agregar `?sslmode=require` |
| `SESSION_SECRET` | Sí | Secreto para firmar la cookie de sesión y los tokens HMAC del formulario de contacto. Usar un valor largo y aleatorio |
| `USER_IMG` | Sí | Imagen por defecto de los usuarios. Está protegida: no puede subirse ni borrarse desde el panel |
| `BASE_TEST_URL` | Sí | Carpeta local de imágenes en desarrollo/test (ej.: `serverAssets/uploaded`) |
| `ADMIN_EMAIL` | Sí | Email del usuario OWNER inicial |
| `ADMIN_NAME` | Sí | Nombre del usuario OWNER inicial |
| `ADMIN_PASS` | Sí | Contraseña del usuario OWNER inicial |
| `API_KEY`, `APP_ID`, `AUTH_DOMAIN`, `MEASUREMENT_ID`, `MESSAGIN_SEND_ID`, `PROJECT_ID`, `STORAGE_BUCKET` | Sí | Configuración de Firebase. Aunque solo se use en producción, el servidor las exige siempre |
| `GMAIL_USER` | Sí | Cuenta de Gmail que envía y recibe los mensajes de contacto |
| `GMAIL_PASSWORD` | Sí | Contraseña de aplicación de Gmail |
| `WHATS_APP_NUMBER` | Sí | Número (con código de país, sin `+`) para el botón de WhatsApp |
| `WHATS_APP_MESSAGE` | Sí | Mensaje inicial del enlace de WhatsApp |
| `VITE_BASE_PATH` | Sí | URL pública base de la aplicación (ej.: `https://mi-dominio.com`). Se usa para armar enlaces en las vistas y se agrega a los orígenes permitidos por CORS |
| `COOKIE_SECURE` | No | En producción las cookies son `Secure` salvo que valga `false` |
| `LOG_ERRORS` | No | `false` desactiva el log de errores del manejador central |

## Base de datos y migraciones

El esquema vive en `server/models/` (modelos Sequelize explícitos) y se registra en `server/configs/database.ts`.

Flujo de trabajo del proyecto:

1. **Diseño inicial en local.** En `development`, `startUp(true)` ejecuta `sequelize.sync()` y el seed del usuario OWNER (a partir de `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASS` y `USER_IMG`). Pasar `startUp(true, true)` hace `force: true` y **borra todas las tablas**.
2. **Congelar el esquema.** Una vez estable, el esquema se traslada a una migración inicial de `sequelize-cli` (junto con el seed del OWNER).
3. **Cambios posteriores.** Toda modificación del esquema se hace con una migración nueva.

```bash
pnpm dlx sequelize-cli migration:generate --name <descripcion>
pnpm dlx sequelize-cli db:migrate
pnpm dlx sequelize-cli db:migrate:undo        # revierte la última
```

> `sequelize.sync()` está **deshabilitado en producción** por diseño (`NODE_ENV=production`): ahí el esquema solo cambia mediante migraciones. Ejecutar `db:migrate` antes de iniciar la nueva versión.

Tablas: `users`, `sessions`, `logs`, `images`, `front_page`, `about`, `product`, `variant_product`, `video_group`, `video`, `Client`, `api_key`, `letters`.

## Scripts

| Script | Descripción |
| :--- | :--- |
| `pnpm dev` | Vite + servidor con recarga (`tsx watch`), `NODE_ENV=development` |
| `pnpm build` | `build:client` (Vite → `dist/`) y luego `build:server` (`tsc` → `dist/server/`) |
| `pnpm start` | Ejecuta `dist/server/index.js` con `NODE_ENV=production` |
| `pnpm preview` | Vista previa del build de Vite junto al servidor en desarrollo |
| `pnpm lint` | ESLint (con `--fix`) |
| `pnpm test` | Todos los tests (`NODE_ENV=test`) |
| `pnpm test:unit` | Solo unitarios |
| `pnpm test:integration` | Solo integración (requiere PostgreSQL de test) |

## Estructura del proyecto

```text
.
├── server/
│   ├── index.ts                  # Bootstrap: conecta la DB y levanta el servidor
│   ├── app.ts                    # Pipeline de middlewares de Express
│   ├── index.routes.ts           # /api/v1/extclients (público) y /api/v1 (sesión)
│   ├── routers/                  # mvc.routes (EJS/SPA), public.routes, session.routes
│   ├── configs/                  # env, DB, CORS, logger, errores (AppError, códigos, status)
│   ├── models/                   # Modelos Sequelize
│   ├── features/                 # Un módulo por dominio
│   │   ├── auth/  user/  images/  apiKey/  system-logs/
│   │   ├── product/  videos/  frontPage/  about/
│   │   ├── cartas/               # Cartas al aire (pública + moderación)
│   │   ├── contact/              # Formulario de contacto
│   │   └── frontPageRender/      # Handlers que renderizan las vistas EJS
│   └── shared/
│       ├── auth/                 # Sesión, CSRF, HMAC, middlewares de roles
│       ├── externals/            # Email (Nodemailer) e imágenes (Firebase / Mock)
│       ├── middlewares/          # sanitizeRichText
│       ├── repositories/         # BaseRepository
│       ├── utils/                # Hasher, UuidHandler, responder, createRateLimiter
│       └── dependencies.ts       # Composición manual de repositorios y servicios
├── src/                          # Panel React (Admin/, Auth/, shared/, publicView/) y scripts del sitio EJS (files/)
├── views/                        # Plantillas EJS
├── tests/                        # Tests de integración y helpers
├── serverAssets/uploaded/        # Imágenes locales (dev/test, no versionadas)
├── vite.config.ts  vitest.config.ts  tsconfig*.json
└── AGENTS.md                     # Reglas de arquitectura (servicios vs. repositorios)
```

## Arquitectura y convenciones

Arquitectura por features con capas separadas. Las reglas completas están en [`AGENTS.md`](./AGENTS.md); en resumen:

- **Controller:** traduce HTTP ⇄ servicio. No contiene lógica de negocio.
- **Service:** reglas de negocio, validaciones de dominio, generación de IDs (`UuidHandler`), efectos secundarios (imágenes, emails, logs).
- **Repository:** solo persistencia. Recibe datos ya formados; no genera IDs ni defaults. El mapeo entre registros y DTOs se delega a parsers.
- **Composición:** `server/shared/dependencies.ts` instancia y conecta todo manualmente (sin contenedor de DI).
- **Errores:** se lanzan con `throwError(ERROR_CODE.X, mensaje)` / `middError(...)`. Un único `errorHandler` los convierte en respuesta JSON (o en la vista `error.ejs` para páginas).
- Express 5 propaga automáticamente los rechazos de los handlers `async`; por eso los controllers no usan `try/catch`.
- **Imágenes como galería temporal:** una imagen subida se registra en la tabla `images`; al asignarla a un producto, portada o "acerca" se "consume" (se quita de la galería). Al reemplazarla, la anterior se borra o vuelve a la galería según el flag `saver`.
- **HTML enriquecido:** los textos con formato de productos y variantes pasan por `sanitize-html` (`sanitizeRichText`) antes de guardarse.

## Autenticación, sesión y seguridad

**Sesión.** `express-session` con store propio sobre la tabla `sessions` (`server/shared/auth/session/`). Cookie `app.sid`: `httpOnly`, `sameSite=lax`, `secure` en producción, vigencia de 30 minutos renovable (`rolling`). Al iniciar sesión se regenera el ID (previene session fixation). En `test` se usa `MemoryStore`.

**CSRF (doble cookie).** El servidor guarda un secreto en la sesión y expone un token en la cookie legible `XSRF-TOKEN`. Toda petición `POST`, `PUT`, `PATCH` o `DELETE` bajo `/api/v1` (salvo `/contact`) debe enviar ese valor en el header `x-csrf-token`. El cliente del panel (`HttpClient`) lo hace automáticamente.

**Roles.** `OWNER` > `ADMIN` > `USER`.

- `OWNER` se crea con el seed y no puede ser editado, deshabilitado ni borrado desde la API.
- `ADMIN` gestiona usuarios, contenido, imágenes, API keys, cartas y logs.
- `USER` accede a las rutas que solo exigen autenticación (ver tabla de la API).
- Cada usuario solo puede editar su propio perfil y cambiar su propia contraseña.

**Formulario de contacto.** Usa un token HMAC firmado, de un solo uso (nonce en memoria), con un mínimo de 3 s desde que se renderiza la página y una validez de 15 min, además de un campo *honeypot* (`website`). Los mensajes se reenvían por email a `GMAIL_USER`.

**Rate limiting.** `createRateLimiter` (basado en `express-rate-limit`) devuelve errores con el mismo formato estándar (`RATE_LIMIT_EXCEEDED`, 429). Detrás de un proxy en producción se confía en 1 salto (`trust proxy = 1`). Documentación del helper en [`server/shared/utils/createRateLimiter.md`](./server/shared/utils/createRateLimiter.md).

**CORS.** Los orígenes permitidos se definen en `server/configs/corsConfig.ts` (localhost de desarrollo, el origen de `VITE_BASE_PATH` y los clientes configurados allí). Para habilitar un frontend externo nuevo hay que agregar su origen a esa lista.

**Logs.** Producción: nivel `warn` hacia la tabla `logs` (consultable y depurable desde el panel). Desarrollo: archivo. Test: consola.

## Referencia de la API

Prefijo `/api/v1`. Todas las rutas con sesión requieren la cookie `app.sid` y, en métodos mutantes, el header `x-csrf-token`.

### Autenticación — `/auth`

| Método | Ruta | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Público | `{ email, password }` → usuario de sesión `{ id, email, role }` |
| `POST` | `/auth/logout` | Sesión | Destruye la sesión |
| `GET` | `/auth/me` | Sesión | Usuario de la sesión actual |

### Usuarios — `/user`

| Método | Ruta | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/user` | Autenticado | Lista de usuarios |
| `GET` | `/user/:userId` | Autenticado | Detalle de un usuario |
| `POST` | `/user` | ADMIN | Crea un usuario `{ email, password }` (rol `USER`) |
| `PUT` | `/user/:userId` | Propietario del perfil | Actualiza `{ email, name, nickname, picture }` |
| `POST` | `/user/update-credentials` | Propietario | Cambia contraseña `{ id, password, newPassword }` |
| `PATCH` | `/user/:userId/assign-status` | ADMIN | `{ role: 'ADMIN' \| 'USER', enabled }` |
| `DELETE` | `/user/:userId` | ADMIN | Elimina el usuario |

### Imágenes — `/images` (ADMIN)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/images/upload` | `multipart/form-data`, campo `image`. JPEG, PNG, WebP o GIF, máx. 10 MB |
| `GET` | `/images` | Galería paginada: `?page=&limit=&order=ASC\|DESC` |
| `DELETE` | `/images/:id` | Elimina del storage y de la galería |

### Productos y variantes — `/product`

| Método | Ruta | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/product`, `/product/:id` | Autenticado | Listado y detalle |
| `POST` / `PUT` / `DELETE` | `/product`, `/product/:id` | ADMIN | Alta, edición y baja de producto |
| `GET` | `/product/variant/:id` | Autenticado | Detalle de una variante |
| `POST` / `PUT` / `DELETE` | `/product/variant`, `/product/variant/:id` | ADMIN | Gestión de variantes |

### Videos — `/videos`

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/videos`, `/videos/:id`, `/videos/:id/video` | Grupos y videos |
| `POST` | `/videos`, `/videos/video` | Crea grupo / video |
| `PUT` / `PATCH` | `/videos/:id` | Edita grupo / video |
| `DELETE` | `/videos/:id`, `/videos/:id/video` | Elimina grupo / video |

Acceso: usuario autenticado.

### Portada y "Acerca de" — `/frontpage`, `/about`

| Método | Ruta | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/frontpage`, `/about` | Autenticado | Contenido actual |
| `POST` | `/frontpage`, `/about` | ADMIN | Crea el contenido |
| `PUT` | `/frontpage/:id`, `/about/:id` | ADMIN | Actualiza (`saver` indica si la imagen reemplazada vuelve a la galería) |

### Administración (ADMIN)

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` `POST` | `/apiKey` | Lista clientes con sus keys / registra un cliente `{ name, url }` y devuelve su API key **una sola vez** |
| `GET` `PUT` `PATCH` `DELETE` | `/apiKey/:id` | Detalle, edición del cliente, habilitar/deshabilitar key `{ enabled }`, baja del cliente |
| `DELETE` | `/apiKey/:id/apiKey` | Elimina solo la key |
| `GET` | `/letters/admin` | Cartas paginadas: `?page=&limit=&aprobada=&tema=` |
| `GET` `PATCH` `DELETE` | `/letters/admin/:id` | Detalle, moderación `{ aprobada }` y baja |
| `GET` `PATCH` `DELETE` | `/logs`, `/logs/:id`, `/logs/:id/clean` | Consulta, marca `{ keep }` y limpieza de logs del sistema |

### Contacto — `/contact`

`POST /api/v1/contact` con `{ email, subject, message, _csrf, website }`. `_csrf` es el token HMAC embebido en la página `/contacto`; `website` es el honeypot y debe ir vacío.

## API para clientes externos

Rutas montadas en `/api/v1/extclients`. No usan sesión ni CSRF.

### API key

Cada cliente se registra desde el panel (pestaña Configuración → Clientes / API keys). La key tiene el formato `hbx_<12 hex>_<secreto>`, se muestra **una única vez** y en la base solo se guarda su hash SHA-256. Se envía en el header `x-api-key` (también se acepta `Authorization` con la key tal cual). Una key o un cliente deshabilitado devuelven `401`.

### Cartas — `/api/v1/extclients/letters`

Temas válidos: `Para quien lo necesite`, `Ansiedad`, `Duelo`, `Soledad`, `Empezar de nuevo`, `Gratitud`.

**Crear carta** — requiere API key

```http
POST /api/v1/extclients/letters
x-api-key: hbx_xxxxxxxxxxxx_xxxxxxxx
Content-Type: application/json

{ "tema": "Gratitud", "mensaje": "Texto de la carta..." }
```

Respuesta `201`:

```json
{ "id": "uuid", "tema": "Gratitud", "mensaje": "...", "aprobada": false, "createdAt": "...", "updatedAt": "..." }
```

Toda carta nueva queda con `aprobada: false` y no es visible hasta que un administrador la apruebe. Cada alta envía un aviso por email.

**Listar cartas aprobadas** — sin API key

```http
GET /api/v1/extclients/letters?page=1&limit=10
```

```json
{
  "info": { "currentPage": 1, "totalPages": 3, "totalElements": 27 },
  "data": [ { "id": "uuid", "tema": "Duelo", "mensaje": "..." } ]
}
```

Ambas rutas comparten un límite de **5 solicitudes por hora por IP**; al excederlo responden `429`.

> El contenido de `mensaje` es texto libre ingresado por visitantes. El cliente que lo muestre debe escaparlo (no renderizarlo como HTML).

## Formato de errores

Todos los errores de la API tienen la misma forma:

```json
{ "ok": false, "code": "UNAUTHORIZED", "message": "Unauthenticated" }
```

`code` pertenece al catálogo de `server/configs/errors/errorCodes.ts` y determina el status HTTP (`errorStatusMap.ts`): por ejemplo `VALIDATION_ERROR`/`INVALID_INPUT` → 400, `UNAUTHORIZED` → 401, `FORBIDDEN`/`CSRF_DETECTED`/`ROLE_NOT_ALLOWED` → 403, `NOT_FOUND` → 404, `DUPLICATE_VALUE`/`DATA_CONFLICT` → 409, `RATE_LIMIT_EXCEEDED` → 429. En `NODE_ENV=test` se incluye además `details`.

Las rutas de páginas (no `/api`) renderizan `views/error.ejs`.

## Servicios externos

| Servicio | Uso | Entorno |
| :--- | :--- | :--- |
| **Firebase Storage** | Almacenamiento de imágenes (`imagesApi/`) | Solo producción |
| **Mock de imágenes** | Guarda en `BASE_TEST_URL` y se sirve en `/<BASE_TEST_URL>` | Desarrollo y test |
| **Gmail (SMTP, Nodemailer)** | Contacto y avisos de nuevas cartas. Plantillas en `server/shared/externals/EmailService/emails/` — ver [`EMAIL_README.md`](./server/shared/externals/EmailService/EMAIL_README.md) | Todos (mock en test) |

> Algunos proveedores de hosting bloquean el tráfico saliente SMTP (puertos 25/465/587) en sus planes gratuitos o de entrada. Verificar que el plan elegido lo permita.

## Tests

```bash
pnpm test:unit          # server/**/*.test.ts (servicios, dominio, middlewares, utilidades)
pnpm test:integration   # tests/integration y *.integration.test.ts (requiere PostgreSQL con .env.test)
pnpm test               # todo, incluidos los tests del frontend (src/**/*.test.*)
```

Las pruebas de integración usan `startUp(true, true)`: **recrean las tablas** de la base apuntada por `.env.test`. Nunca apuntarla a una base con datos.

## Despliegue

1. Configurar todas las variables de entorno del proveedor (ver tabla). `NODE_ENV=production` lo fija el script `start`; `VITE_BASE_PATH` debe ser la URL pública con `https`.
2. **Build:** `pnpm install --frozen-lockfile && pnpm build` (necesita las devDependencies: Vite y TypeScript).
3. **Migraciones:** `pnpm dlx sequelize-cli db:migrate` contra la base de producción antes de iniciar.
4. **Inicio:** `pnpm start`.
5. Verificar:
   - La base ya tiene el usuario OWNER (seed) y se puede iniciar sesión en `/login`.
   - Las cookies llegan con `Secure`: requiere HTTPS y que el proxy envíe `X-Forwarded-Proto`.
   - Las reglas de Firebase Storage permiten las operaciones que realiza el servidor sobre `imagesApi/`.
   - El origen del frontend externo figura en `corsConfig.ts`.
   - Existe al menos una portada, un "acerca" y un producto cargados desde el panel.

---

**Autor:** antorrg-software — Antonio Ricardo Rodriguez Gramajo · Licencia ISC