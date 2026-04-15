# Score Entry UX Spec (Enhanced)

## Objetivo
Diseñar la carga de resultados para que un club pueda ingresar rápidamente una fecha completa sin frustración.

## Problema
Muchos clubes cargan resultados manualmente. Si el flujo es lento o confuso:
- se equivocan los scores
- se rompen desempates
- se retrasa la publicación
- el sistema se abandona y vuelven a Excel

## Principios UX
- Más rápido que Excel
- Navegable con teclado
- Sin reingresar datos del jugador
- Total automático siempre visible
- Separar ida (1–9) y vuelta (10–18)
- Vista previa obligatoria antes de publicar
- Guardado de borrador
- Estados claros por jugador

## Dos modos de carga

### Modo A — Carga rápida por jugador
Pensado para MVP y clubes que prefieren validar una tarjeta a la vez.

Flujo:
1. Entrar al torneo
2. Ver lista de jugadores precargada
3. Elegir "Cargar score"
4. Completar hoyos 1–18
5. Guardar borrador o guardar y siguiente
6. Repetir
7. Ver vista previa
8. Publicar resultados

### Modo B — Planilla masiva
Pensado para torneos con muchos jugadores.

Tabla:
Jugador | H1 | H2 | H3 | ... | H18 | Total | Estado

Requisitos:
- navegación con Tab
- Enter puede pasar al siguiente jugador
- total calculado automáticamente
- validación por celda
- soportar edición rápida

## Lista de jugadores precargada
La carga de score no debe pedir:
- nombre
- club
- categoría

Eso ya debe venir del torneo.

Cada fila debe mostrar:
- jugador
- club
- handicap
- categoría
- estado (Pendiente / Borrador / Completo / Publicado)

## Validaciones
- 18 hoyos obligatorios
- strokes enteros
- rango recomendado 1–15
- no publicar si hay tarjetas incompletas
- resaltar errores en línea, no con mensajes técnicos

## Estados de scorecard
- pending
- draft
- complete
- published
- disqualified

## Vista previa previa a publicación
Antes de publicar, mostrar:
- posición
- jugador
- gross
- neto
- posibles empates
- estado del torneo

Acciones:
- volver a editar
- publicar resultados

## Comportamiento recomendado
- autosave cada pocos segundos o al cambiar de fila
- confirmar publicación final
- mensajes claros:
  - "Borrador guardado"
  - "Faltan hoyos por completar"
  - "Resultados publicados"

## Recomendación de implementación
Versión 1:
- modo carga rápida por jugador
- lista de jugadores
- guardar y siguiente
- vista previa
- publicar

Versión 2:
- planilla masiva tipo spreadsheet
- navegación avanzada por teclado
