# Scorecard Module Spec

## Objetivo
Permitir a los clubes cargar scores hoyo por hoyo dentro del dashboard del torneo, de forma más fácil que Excel.

## UX obligatoria
- Tabla tipo planilla
- Navegable con teclado
- Autocálculo del total
- Validación inmediata
- Guardado de borrador
- Vista previa antes de publicar
- Mensajes de éxito/error muy claros

## Reglas
- 18 hoyos obligatorios
- strokes enteros entre 1 y 15
- no se publica si falta un hoyo
- el sistema calcula gross, net y desempates
- luego recalcula ranking

## Flujo
1. Club entra al torneo
2. Selecciona jugador o grupo
3. Ingresa hoyos
4. Guarda borrador o publica
5. El sistema recalcula resultados del torneo
6. El sistema recalcula ranking anual afectado

## Estados de scorecard
- draft
- submitted
- official
- disqualified
