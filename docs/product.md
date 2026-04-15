# FEG Platform — Product & Engineering Spec

## Objetivo
Desarrollar una plataforma PWA para la Federación de Golf que centralice torneos, resultados, rankings, noticias, caddie digital y gestión administrativa.

## Principios UX
- Usuarios entre 15 y 70+ años
- Navegación simple y visible
- Máximo 3 clics para ver torneos, resultados y ranking
- Tipografía legible, alto contraste
- Evitar scroll infinito, modales complejos y pantallas vacías
- Los dashboards deben ser aún más simples que Excel

## Reglas de negocio clave
- Las inscripciones no se realizan desde la web; las recibe el club sede
- Los clubes cargan resultados desde su dashboard
- Carga principal: hoyo por hoyo
- Debe existir alternativa para score total / importación futura
- Las fotos subidas por los clubes NO se publican automáticamente
- Toda foto pasa a estado `pending` y debe ser aprobada por prensa
- Los jugadores no tienen cuenta; tienen perfil público automático
- Los dashboards sí requieren autenticación por roles

## Roles
- Public user
- CLUB
- PRESS
- DIRECTOR
- TREASURER
- ADMIN

## Secciones públicas
- Inicio
- Torneos
- Ranking
- Clubes
- Noticias
- Caddie Digital
- Perfil público de jugador

## Dashboards
### Club
- Ver torneo asignado / torneos del club
- Cargar resultados
- Subir fotos (pendientes)
- Enviar gastos
- Ver estado de aprobación

### Prensa
- Aprobar / rechazar / destacar fotos
- Publicar noticias
- Administrar banners
- Enviar notificaciones push

### Directivos
- Ver estado de torneos
- Ver rankings
- Ver actividad de clubes
- Ver métricas generales

### Tesorería
- Revisar gastos enviados
- Aprobar / rechazar / marcar pagado
- Exportar reportes

## Torneos y cálculos
Usar siempre el reglamento cargado por la usuaria para cálculos:
- Modalidad: Medal Play 18 hoyos
- Categorías:
  - Damas Scratch
  - Damas hasta 30
  - Damas 31–59
  - Senior Damas +50
  - Caballeros Scratch
  - Caballeros hasta 9
  - Caballeros 10–16
  - Caballeros 17–24
  - Caballeros 25–54
  - Senior Caballeros +55
- Scratch compite gross
- Resto compite neto

### Ranking individual anual
Puntos por posición:
1=20, 2=10, 3=8, 4=5, 5=2, 6=1
Tomar las 6 mejores fechas.
Desempate:
1. más primeros puestos
2. más segundos puestos
3. mejor resultado en fecha descartada
4. sorteo

### Equipos
- Cada club presenta 3 o 4 jugadores
- Se computan las 3 mejores tarjetas
- Ranking por equipos toma las 6 mejores fechas
- Hay fechas con multiplicador 1.5 y final con multiplicador 2

### Desempate de torneo
Usar:
- últimos 9
- últimos 6
- últimos 3
- último hoyo hacia atrás
- sorteo

## Notificaciones
Implementar push notifications para:
- resultados publicados
- noticias importantes
- avisos de torneos
No hacer spam. El usuario debe poder aceptar o no.

## Seguridad
- Auth.js o equivalente
- RBAC real en backend
- Zod para validar inputs
- Sanitización de textos
- Rate limiting
- Upload seguro de archivos
- CSP headers
- Logs básicos de acciones administrativas
