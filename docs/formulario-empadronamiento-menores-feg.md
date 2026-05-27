# Formulario: Empadronamiento Menores y Juveniles FEG 2026

> **Sección nueva del sitio:** `/empadronamiento-menores`
> Formulario de empadronamiento para jugadores menores interesados en participar en las actividades y/o competencias de la temporada 2026.
> Plataforma original: KoboToolbox — `https://ee.kobotoolbox.org/x/kAUN3ZTC`

---

## Aviso importante (mostrar como banner destacado)

> **IMPORTANTE:** la planilla deberá ser completada por los padres del jugador (madre, padre y/o tutor) en carácter de declaración jurada. Es un proceso anual y solo debe realizarse **una vez** durante la temporada. La FGL asegura su trato confidencial.

- [ ] He leído y acepto las condiciones — **OK** _(checkbox obligatorio para habilitar el formulario)_

---

## Sección 1 — Responsable de la carga

| Campo | Tipo | Obligatorio | Placeholder / Nota |
|---|---|---|---|
| Nombre del responsable de la carga | Texto | Sí | Padre, madre o tutor |
| Teléfono de contacto del responsable | Teléfono | Sí | Ej. 3434876922 |

---

## Sección 2 — Datos del jugador

| Campo | Tipo | Obligatorio | Opciones / Nota |
|---|---|---|---|
| Apellido del jugador | Texto | Sí | — |
| Nombres del jugador | Texto | Sí | — |
| Sexo | Radio | Sí | `Varón` / `Mujer` |
| Fecha de nacimiento | Fecha | Sí | Selector de fecha; nota: "Puede seleccionar el año haciendo click arriba" |
| Edad al 31 de diciembre de 2026 | Calculado automático | — | Se calcula a partir de la fecha de nacimiento |
| Categoría | Calculado automático | — | Se asigna automáticamente según edad (ver referencia de categorías) |
| DNI | Número | Sí | — |
| Dirección | Texto | Sí | — |
| Departamento | Select | Sí | Ver lista de departamentos |
| Localidad | Texto | Sí | — |
| Teléfono | Teléfono | Sí | — |
| Correo electrónico | Email | Sí | — |
| Nombre del club de opción | Select | Sí | Ver lista de clubes |
| Código de club | Texto | No | Se completa automáticamente al seleccionar club |

### Lista de departamentos (select)

```
COLON · CONCORDIA · DIAMANTE · FEDERACION · FEDERAL · FELICIANO
GUALEGUAY · GUALEGUAYCHU · ISLAS DEL IBICUY · LA PAZ · NOGOYA · PARANA
SAN SALVADOR · TALA · URUGUAY · VICTORIA · VILLAGUAY · DESCONOCIDO
```

### Lista de clubes de opción (select)

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
AMIGOS DEL GOLF
```

---

## Sección 3 — Datos escolares y deportivos

| Campo | Tipo | Obligatorio | Opciones / Nota |
|---|---|---|---|
| Establecimiento educativo | Texto | No | Educación inicial, secundaria, terciaria y/o universitaria según corresponda |
| ¿Tiene Handicap? | Radio | Sí | `Sí` / `No` |
| Matrícula | Texto | Condicional | Solo si tiene Handicap |
| Profesor a cargo | Select múltiple | No | Ver lista de profesores |
| ¿Quién es el Profesor? (otro) | Texto | Condicional | Solo si selecciona "Otro" |

### Lista de profesores (checkboxes)

```
Federico Arca · Natalia Carrizo · Fernando Duré
Alejandro Fernandez · Gustavo Maneriro · Daniel Nuñez
Adrián Ponce · José Quiroga · José Luis Sanchez
Marcelo Salva · Walter Sotelo · Ayelen Soto
Oscar Valentini · Otro
```

---

## Sección 4 — Padre / Madre / Tutor 1

| Campo | Tipo | Obligatorio |
|---|---|---|
| Nombre y Apellido del padre/madre/tutor 1 | Texto | Sí |
| DNI | Número | Sí |
| Teléfono móvil | Teléfono | Sí |
| Correo electrónico | Email | Sí |

---

## Sección 5 — Padre / Madre / Tutor 2 (si corresponde)

| Campo | Tipo | Obligatorio |
|---|---|---|
| Nombre y Apellido del padre/madre/tutor 2 | Texto | No |
| DNI | Número | No |
| Correo electrónico | Email | No |

---

## Sección 6 — Salud

| Campo | Tipo | Obligatorio | Opciones |
|---|---|---|---|
| ¿Tiene obra social? | Radio | Sí | `Sí` / `No` |
| Obra social | Texto | Condicional | Solo si tiene obra social |
| Número de asociado | Texto | Condicional | Solo si tiene obra social |
| Grupo sanguíneo | Radio | No | `0+` `0-` `A+` `A-` `B+` `B-` `AB+` `AB-` |
| ¿Toma regularmente alguna medicación? | Radio | Sí | `Sí` / `No` |
| ¿Qué medicación? | Texto | Condicional | Solo si responde Sí |
| ¿Recibió vacuna antitetánica? | Radio | No | `Sí` / `No` |

### Condiciones de salud (checkboxes — marcar las que correspondan)

```
[ ] ¿Es diabético?
[ ] ¿Es asmático?
[ ] ¿Es alérgico?
[ ] ¿Tiene antecedentes de epilepsia o convulsiones?
[ ] ¿Sufre hormigueos en las manos?
[ ] ¿Ha tenido traumatismo de cráneo con pérdida del conocimiento?
[ ] ¿Alguna vez experimentó excesiva falta de aire mientras realizaba ejercicios físicos?
[ ] ¿Alguna vez sintió dolores de pecho mientras realizaba ejercicios físicos o inmediatamente después?
[ ] ¿Alguna vez perdió el conocimiento mientras realizaba ejercicios físicos o inmediatamente después?
[ ] ¿Le han detectado alguna vez presión arterial alta?
[ ] ¿Le han detectado alguna vez un soplo cardíaco?
[ ] ¿Otras?
[ ] ¿Fue operado en el último año?
```

| Campo condicional | Activado por | Tipo |
|---|---|---|
| ¿Cuáles? | "¿Otras?" marcado | Texto |
| ¿De qué fue operado? | "¿Fue operado en el último año?" marcado | Texto |
| Especifique a qué es alérgico | "¿Es alérgico?" marcado | Texto |

---

## Sección 7 — Comentarios

| Campo | Tipo | Obligatorio |
|---|---|---|
| Comentarios | Textarea | No |

---

## Mensaje de cierre

> **Gracias por su participación**

---

## Referencia de categorías (por edad que cumple en el año calendario)

| Categoría | Rango de edad |
|---|---|
| Principiante | Menores de 7 años y/o jugadores que hayan comenzado recientemente |
| Birdie | 7–9 años |
| Águila / Eagle | 10–11 años |
| Albatros | 12–13 años |
| Prejuveniles | 14–15 años (clases 2011–2016 en 2026) |
| Juveniles | 16–18 años (clases 2008–2010 en 2026) |
| Sub 23 | 19–22 años |

---

## Notas para implementación en Cursor

- El formulario debe integrarse como una nueva sección o página en el sitio de la FEG, bajo una ruta del estilo `/empadronamiento-menores`.
- El campo **Categoría** y la **Edad al 31/12/2026** deben calcularse automáticamente en base a la Fecha de Nacimiento ingresada.
- Los campos condicionales deben mostrarse u ocultarse con lógica de visibilidad (show/hide) según la respuesta del campo padre.
- El checkbox "OK" del aviso importante debe ser obligatorio para habilitar el resto del formulario.
- El formulario es anual: si el jugador ya está empadronado, mostrar mensaje de aviso y bloquear nueva carga.
- Guardar los datos en la misma base utilizada por la planilla de empadronamiento existente (ver `empadronamiento-fgl-2026.md`).
