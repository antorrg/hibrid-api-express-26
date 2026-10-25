# 📧 Email Service - Documentación

## Arquitectura

El servicio de email sigue el patrón de **Inyección de Dependencias** para ser testeable y flexible:

```plain
EmailService (lógica de negocio)
    ↓
IEmailTransport (interfaz)
    ↓
├── NodemailerTransport (producción - SMTP real)
└── MockEmailTransport (testing - sin SMTP)
```

## Componentes

### 1. **EmailService** (`MailService.ts`)

Clase principal que orquesta el envío de emails.

**Métodos:**

- `sendTemplateEmail()` - Envía email usando HTML template

- `sendRawEmail()` - Envía email directo sin template

### 2. **NodemailerTransport**

Implementación real usando Nodemailer + Gmail SMTP.

### 3. **MockEmailTransport**

Mock para testing que NO envía emails reales, solo los almacena en memoria.

### 4. **EmailController**

Controlador HTTP con endpoints para enviar emails.

### 5. **Template System** (`emailAux.ts`)

Sistema de templates que reemplaza variables `{{nombre}}` en archivos HTML.

## Configuración

### Variables de entorno

Crea tus archivos `.env.*` con:

```env
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASS=tu-app-password
```

⚠️ **Importante:** Necesitas una **App Password** de Gmail, no tu contraseña normal.

[Cómo crear una App Password](https://support.google.com/accounts/answer/185833)

## Uso

### 1. Enviar email con template

```typescript
import { emailService } from './Service/MailService.js'

await emailService.sendTemplateEmail(
  'email-verify',
  { verification_link: 'https://ejemplo.com/verify/abc123' },
  {
    to: 'usuario@example.com',
    subject: 'Verifica tu correo'
  }
)
```

### 2. Enviar email directo (sin template)

```typescript
await emailService.sendRawEmail({
  to: 'contacto@example.com',
  subject: 'Mensaje importante',
  html: '<h1>Hola</h1><p>Este es el mensaje</p>',
  text: 'Hola\n\nEste es el mensaje'
})
```

### 3. Usar endpoints HTTP

**POST** `/api/email/verify`

```json

{
  "email": "usuario@example.com",
  "verificationLink": "https://ejemplo.com/verify/abc123"
}
```

**POST** `/api/email/contact`

```json
{
  "email": "contacto@example.com",
  "subject": "Consulta",
  "message": "Hola, tengo una pregunta..."
}
```

## Testing

### Opción 1: Mock interno (sin testing framework)

```typescript
import { EmailService, MockEmailTransport } from './Service/MailService.js'

const mockTransport = new MockEmailTransport()
const testEmailService = new EmailService(mockTransport)

await testEmailService.sendTemplateEmail(
  'email-verify',
  { verification_link: 'https://test.com' },
  { to: 'test@test.com', subject: 'Test' }
)

console.log(mockTransport.sent) // Ver emails "enviados"
```

### Opción 2: Ejecutar test de ejemplo

```bash
pnpm tsx tests/emailService.test.ts
```

## Templates

Los templates HTML viven en `src/Service/emails/`:

```plain
src/Service/emails/
├── email-verify.html    # Template de verificación
└── email.verify.txt     # Versión texto (opcional)
```

### Crear nuevo template

- 1: Crea `src/Service/emails/mi-template.html`

- 2: Usa variables con sintaxis `{{variable}}`

```html
 <h1>Hola {{nombre}}</h1>
 <p>Tu código es: {{codigo}}</p>
```

- 3: Úsalo:

```typescript
await emailService.sendTemplateEmail(
  'mi-template',
  { nombre: 'Antonio', codigo: '1234' },
  { to: 'user@example.com', subject: 'Tu código' }
)
```

## Estructura de archivos

```plain
src/Service/
├── MailService.ts        # Servicio principal + transports
├── emailAux.ts           # Sistema de templates
├── EmailController.ts    # Controlador HTTP
├── email.routes.ts       # Rutas Express
└── emails/
    └── email-verify.html # Template de verificación

tests/
└── emailService.test.ts  # Tests de ejemplo
```

## Integrar en la app

```typescript
// src/router.ts
import emailRouter from './Service/email.routes.js'

app.use('/api/email', emailRouter)
```

## Ventajas de esta arquitectura

✅ **Testeable** - Mock transport para tests sin SMTP  
✅ **Flexible** - Cambiar de proveedor sin tocar EmailService  
✅ **Type-safe** - Todo tipado con TypeScript  
✅ **Escalable** - Fácil agregar SES, SendGrid, etc.  
✅ **Clean** - Separación de responsabilidades clara  

## Próximos pasos

- [ ] Agregar rate limiting
- [ ] Implementar cola de emails (Bull, BullMQ)
- [ ] Agregar más templates
- [ ] Implementar reintentos automáticos
- [ ] Logging estructurado
- [ ] Métricas de emails enviados
