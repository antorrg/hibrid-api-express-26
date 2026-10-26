# Configuracion rate limit

| Endpoint | Límite inicial | Cómo identificar al cliente |
|---|---:|---|
| **Login** | 5 intentos fallidos por cuenta cada 15 min; además, un límite más amplio por IP, por ejemplo 20 cada 15 min | Cuenta y también IP |
| **Enviar email** —verificación o recuperación— | 1 envío por dirección cada minuto y hasta 5 por hora | Dirección destinataria y también IP |
| **Consultar cartas** —si es una lectura sencilla— | 60 solicitudes por minuto | IP o usuario autenticado |
| **Crear o modificar cartas** | 10 operaciones por minuto | Usuario autenticado |