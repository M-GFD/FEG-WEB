# Guía: Crear usuarios Club y flujo de primer login

## Resumen

Como administrador (rol ADMIN), puedes crear cuentas para representantes de clubes. Cada usuario Club recibe una **contraseña temporal** que debe cambiar en su primer acceso.

---

## 1. Acceso al panel de administración

1. Inicia sesión con tu cuenta de administrador.
2. En el dashboard, haz clic en **"Crear usuarios"** (visible solo para ADMIN).
3. Serás redirigido a `/dashboard/admin/usuarios`.

---

## 2. Crear un usuario Club

En el formulario debes completar:

| Campo | Descripción |
|-------|-------------|
| **Email** | Correo electrónico del representante del club (ej: `secretaria@clubgolf.com`). Debe ser único. |
| **Club** | Selecciona el club al que pertenece el usuario. Solo verá torneos y datos de ese club. |
| **Contraseña temporal** | Contraseña inicial que entregarás al club. Mínimo 6 caracteres. |

Al hacer clic en **"Crear usuario Club"**:

- Se crea la cuenta con rol `CLUB` y `clubId` asignado.
- Se marca `mustChangePassword: true` para forzar el cambio en el primer login.

---

## 3. Entregar credenciales al club

**Medio recomendado:** Comunicación segura (email cifrado, llamada, entrega en persona).

Indica al club:

- **URL de acceso:** `https://tu-dominio.com/auth/signin`
- **Email:** el que registraste
- **Contraseña temporal:** la que definiste en el formulario

---

## 4. Flujo del usuario Club (primer login)

1. El usuario accede a `/auth/signin` e introduce email y contraseña temporal.
2. Tras iniciar sesión, es redirigido automáticamente a `/auth/change-password` (no al dashboard).
3. En esa pantalla define una **nueva contraseña** y la confirma.
4. Al guardar, se actualiza la contraseña y se pone `mustChangePassword: false`.
5. A partir de ese momento, accede al dashboard con normalidad.

---

## 5. Seguridad

- La contraseña temporal debe entregarse por un canal seguro.
- Recomendación: usar contraseñas temporales aleatorias (ej: generador de contraseñas) y comunicarlas por separado del email.
- El usuario no puede acceder al dashboard hasta cambiar la contraseña.
