# Primer acceso como administrador (Gestión)

El login de Gestión usa **email + contraseña** y exige que el campo **`emailVerified`** esté definido en la base de datos.

Si no podés entrar con tu correo, suele deberse a una de estas causas:

1. **No existe** un usuario con ese email.
2. El usuario existe pero **`role` no es `ADMIN`** (el panel de “Crear usuario” solo crea CLUB / PRENSA / TESORERÍA).
3. **`emailVerified` es null** (cuenta sin verificar).

## Opción recomendada: script local

Con `DATABASE_URL` configurado (por ejemplo en `.env` o `.env.local`):

En **PowerShell**:

```powershell
cd ruta\al\repo\web-feg
$env:ADMIN_EMAIL="tu@email.com"
$env:ADMIN_PASSWORD="tu_contraseña_segura"
node scripts/bootstrap-admin.cjs
```

Luego entrá a `/auth/signin` con ese email y contraseña y abrí `/gestion`.

## Opción Supabase (SQL)

Si preferís hacerlo en el SQL Editor de Supabase, tenés que:

- Poner **`role` = `'ADMIN'`** (enum en Prisma).
- Poner **`emailVerified`** a un timestamp no nulo.
- Guardar **`password`** como hash **bcrypt** (no texto plano).

La forma más segura de obtener el hash es ejecutar el script de arriba una sola vez, o generar el hash con Node:

```bash
node -e "require('bcryptjs').hash('tu_contraseña', 12).then(console.log)"
```

## Emails (verificación / recuperación)

Para que lleguen los correos de verificación o recuperación de contraseña, configurá en el entorno de despliegue:

- `RESEND_API_KEY`
- `EMAIL_FROM`
- `NEXTAUTH_URL` o `NEXT_PUBLIC_APP_URL`
