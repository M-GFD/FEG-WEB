# Prensa, noticias y torneos — lógica de la plataforma

## Resumen

| Área | Qué es | Quién actúa | Dónde se ve |
|------|--------|--------------|-------------|
| **Noticias** | Artículos editoriales de la federación (texto, titular, imagen de cabecera). | Quien redacte y publique en BD (hoy sin panel dedicado; datos en tabla `News`). | `/noticias` (público). |
| **Galería / Prensa (general)** | Fotos aprobadas sin enfoque en un torneo concreto, o mezcla de todas. | Club sube → **Prensa o Admin** aprueba/rechaza. | `/prensa` (masonry). |
| **Fotos de torneo** | Imágenes que el **club organizador** asocia a un **torneo** al enviarlas (“Torneo relacionado”). | Mismo flujo de moderación. | **Card y ficha del torneo** (`/torneos`, `/torneos/[slug]`). |
| **Histórico de torneos** | Listado público de fechas pasadas y futuras con filtros por antigüedad / año. | — | `/torneos` (navbar: **Histórico de torneos**). |

## Flujo de fotos ligadas a torneos

1. Usuario **Club** (o roles que puedan “Enviar fotos”) entra a **Dashboard → Enviar fotos**.
2. Opcional pero recomendado: elige **Torneo relacionado** para que la imagen quede vinculada a esa fecha.
3. Las fotos quedan en estado `PENDING`.
4. Usuario **Prensa** o **Admin** entra a **Moderar prensa** y **aprueba** o **rechaza**.
5. Si se aprueban:
   - Con `tournamentId`: aparecen en la **galería de esa ficha de torneo** y en la **vista previa** del histórico (`/torneos`). También entran en la galería general `/prensa` (todas las aprobadas).
   - Sin `tournamentId`: no se muestran en la ficha del torneo; siguen pudiendo verse en `/prensa` si el equipo quiere usar solo la galería global.

## Resultados vs prensa

- **Resultados** (tarjetas, posiciones): los carga el club desde el dashboard del torneo (`/dashboard/torneos/[id]/scores`).
- **Prensa** no edita resultados; solo **media** (aprobar/rechazar fotos).

## Roles

- **Club**: sube fotos (enlace o archivo), idealmente con torneo asociado.
- **Prensa** y **Admin**: moderan imágenes y marcan destacadas en la galería general.
- **Noticias** no requieren rol Prensa salvo que definan política editorial aparte.
