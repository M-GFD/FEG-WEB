# Formulario: Inscripción a Torneos — Federación de Golf del Litoral 2026

> **Sección nueva del sitio:** `/inscripcion-torneos-menores`
> Formulario de inscripción a torneos federativos para jugadores menores y juveniles.
> Plataforma original: KoboToolbox — `https://ee.kobotoolbox.org/HZyKbzV2`

---

## Encabezado dinámico del torneo (mostrar como banner destacado)

> **2do Torneo Federativo Prejuveniles/Juveniles** (Sábado 25 y Domingo 26 de Abril)
> **3er Torneo Juniors** — Domingo 26 de Abril
> Sede: Golf Social La Paz

_Este texto debe ser configurable por administrador para cada torneo del calendario._

---

## Aviso importante (mostrar como alerta)

> **IMPORTANTE:** Salvo excepciones (jugadores no pertenecientes a la FGL, etc.), para realizar la inscripción el jugador deberá estar **empadronado**. Las inscripciones deberán ser cargadas por **profesores y/o responsables de los clubes asociados**. Quienes no aparezcan al cargar su DNI, recibirán inscripción manual por única vez y deberán ser empadronados por su padre/madre/tutor en el **Empadronamiento anual FEG**.

- [ ] He leído y acepto las condiciones — **OK** _(checkbox obligatorio para habilitar el formulario)_

---

## Sección 1 — Responsable de la inscripción

| Campo | Tipo | Obligatorio | Placeholder / Nota |
|---|---|---|---|
| Nombre del responsable de la inscripción | Texto | Sí | Profesor o responsable del club |
| Teléfono de contacto del responsable | Teléfono | Sí | — |
| Correo electrónico del responsable | Email | Sí | — |

---

## Sección 2 — Búsqueda del jugador por DNI

| Campo | Tipo | Obligatorio | Nota |
|---|---|---|---|
| DNI del jugador | Número | Sí | Ingrese el DNI para buscar al jugador en el padrón |
| [Botón] Buscar jugador | Acción | — | Consulta la base de empadronados y autocompleta los datos |

### Lógica de búsqueda

- **Jugador encontrado:** autocompletar todos los campos de datos del jugador (solo lectura), permitiendo al responsable confirmar.
- **Jugador NO encontrado:** mostrar alerta `⚠️ El jugador no se encuentra empadronado, ingrese los datos` y habilitar los campos manualmente. Registrar como inscripción manual por única vez.

---

## Sección 3 — Datos del jugador

_Se autocompletan si el jugador fue encontrado por DNI. Si no, se ingresan manualmente._

| Campo | Tipo | Obligatorio | Opciones / Nota |
|---|---|---|---|
| Club de opción | Select / Radio | Sí | Ver lista de clubes |
| Nombre del club no perteneciente a la FGL | Texto | Condicional | Solo si seleccionó "Otro club no perteneciente a la Federación" |
| Apellido del jugador | Texto | Sí | — |
| Nombre del jugador | Texto | Sí | — |
| Sexo | Radio | Sí | `Varón` / `Mujer` |
| ¿Tiene Handicap? | Radio | Sí | `Sí` / `No` |
| Matrícula | Texto | Condicional | Solo si tiene Handicap |
| Fecha de nacimiento | Fecha | Sí | — |
| Edad (al día de la inscripción) | Calculado | — | Se calcula automáticamente |
| Categoría | Calculado | — | Se asigna según edad (ver referencia) |

### Lista de clubes de opción (select / radio)

```
CLUB ATLETICO ESTUDIANTES DE PARANA
CLUB DE CAMPO LIBERTADOR SAN MARTIN
CLUB DE CAMPO LOS BRETES
CLUB SAFRA
CLUB UNIVERSITARIO (CONC. URUGUAY)
CONCORDIA GOLF CLUB
GOLF AERO CLUB VILLAGUAY
GOLF CLUB COLON
GOLF CLUB SOCIAL LA PAZ
GUALEGUAYCHU COUNTRY CLUB
LAS COLINAS GOLF
TERMAS VILLA ELISA
VICTORIA GOLF COUNTRY CLUB
CLUB CICLISTA UNIDOS SAN SALVADOR
OTRO CLUB NO PERTENECIENTE A LA FEDERACION
```

---

## Sección 4 — Categoría y participación especial

| Campo | Tipo | Obligatorio | Opciones / Nota |
|---|---|---|---|
| ¿Juega además la categoría Prejuveniles? | Checkbox | Condicional | **Solo aplicable a categoría Albatros.** Mostrar únicamente si la categoría calculada es Albatros. Opción: `Sí` |
| ¿Es un jugador Principiante? | Checkbox | No | El profesor o responsable de la escuela deberá determinarlo más allá de la categoría asignada por edad. Opción: `Sí` |

---

## Sección 5 — Restricciones alimentarias

| Campo | Tipo | Obligatorio | Opciones |
|---|---|---|---|
| ¿Tiene alguna restricción alimentaria? | Radio | Sí | `Sí` / `No` |
| ¿Qué alimentos no puede consumir? | Texto | Condicional | Solo si responde Sí |

---

## Sección 6 — Comentarios

| Campo | Tipo | Obligatorio | Nota |
|---|---|---|---|
| Comentarios | Textarea | No | "Solicitudes específicas pongalas aquí." |

---

## Botón de envío

> **Para finalizar presione el botón SUBMIT**

Botón primario: `Inscribir jugador` / `Enviar inscripción`

---

## Referencia de categorías (edad que cumple en el año calendario)

| Categoría | Rango de edad | Nota |
|---|---|---|
| Principiante | < 7 años | Y/o jugadores que hayan comenzado recientemente, a criterio del profesor |
| Birdie | 7–9 años | — |
| Águila / Eagle | 10–11 años | — |
| Albatros | 12–13 años | Pueden jugar también en Prejuveniles |
| Prejuveniles | 14–15 años | — |
| Juveniles | 16–18 años | — |
| Sub 23 | 19–22 años | — |

---

## Notas para implementación en Cursor

- Esta sección se integra como nueva página del sitio, bajo una ruta del estilo `/inscripcion-torneos-menores`.
- El **encabezado del torneo** (nombre, fechas, sede) debe ser editable por un administrador sin tocar código; idealmente un campo CMS o config JSON por torneo.
- La **búsqueda por DNI** consulta la base de empadronados (misma base que `formulario-empadronamiento-menores-feg.md`). Si el jugador existe, pre-rellena los campos en modo solo lectura. Si no existe, los campos quedan editables y la inscripción se marca como "manual".
- Los campos **Edad** y **Categoría** deben calcularse automáticamente en el frontend a partir de la Fecha de Nacimiento.
- El campo **"¿Juega además la categoría Prejuveniles?"** solo se muestra si la categoría calculada es `Albatros`.
- El formulario está dirigido a **profesores y responsables de clubes**, no a los padres directamente. Considerar un flujo de acceso diferenciado (login de club o código de responsable) si se desea restringir su uso.
- Vincular el aviso "Empadronamiento anual FEG" con un link a la sección `/empadronamiento-menores`.
- Al enviar, generar un registro en la base de inscripciones del torneo activo, incluyendo el torneo al que corresponde la inscripción (definido por el administrador en el encabezado dinámico).
