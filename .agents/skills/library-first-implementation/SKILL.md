---
name: library-first-implementation
description: >-
  Prioriza investigar si una tarea puede resolverse con una librería existente,
  mantenida y alineada al stack antes de implementar lógica propia desde cero.
  Usar al implementar o diseñar features (validación, fechas, parsing, HTTP,
  colas, cifrado, tablas, PDF, i18n, etc.), al elegir dependencias, o cuando el
  usuario pide “la mejor forma” de cubrir un requisito sin especificar que debe
  ser código manual.
---

# Implementación con enfoque “librería primero”

## Principio

Antes de escribir lógica no trivial **desde cero**, comprobar si el ecosistema ya ofrece una solución **eficaz, segura y consistente** con el proyecto. Solo implementar a mano cuando haya una razón explícita (restricción de bundle, política de cero deps, API demasiado acotada, o la librería adecuada no existe o no es confiable).

## Orden de preferencia

1. **APIs del runtime / del framework** ya usados (p. ej. estándares Web, utilidades de Next.js/React, Node built-ins).
2. **Dependencias ya presentes** en el repo que cubran el caso (reutilizar antes de añadir otra).
3. **Librerías ampliamente adoptadas** en el mismo stack (misma runtime: browser vs Node), con mantenimiento activo y buena reputación en seguridad.
4. **Implementación propia** documentando por qué no aplica (1)–(3).

## Flujo de trabajo (obligatorio para tareas nuevas no triviales)

1. **Acotar el problema**: entradas/salidas, límites de tamaño, entorno (SSR, Edge, cliente), y requisitos de seguridad (parsing, cripto, auth).
2. **Buscar en el proyecto**: `package.json`, imports existentes, convenciones del codebase.
3. **Buscar en el ecosistema** (según stack): registros de paquetes, documentación oficial del framework, comparativas recientes cuando haya varias opciones serias.
4. **Evaluar candidatos** usando la checklist inferior; descartar con motivo breve si no pasan.
5. **Elegir una opción por defecto** (o proponer 2 si el trade-off es real) e implementar **contra la API documentada** de la librería, sin reimplementar lo que la librería ya resuelve bien.
6. **Si se descarta usar librería**: dejar comentario corto o nota en el PR sobre la decisión (evita “reinventar la rueda” sin dejar rastro).

## Checklist de evaluación (seguridad y consistencia)

| Criterio | Pregunta |
|----------|----------|
| **Mantenimiento** | ¿Commits/releases en los últimos meses? ¿Issues sin respuesta masivos? |
| **Seguridad** | ¿Historial de CVEs y tiempo de parche? ¿Superficie exponible (p. ej. parsers complejos)? |
| **Compatibilidad** | ¿Funciona en los runtimes del proyecto (Node/Edge/browser)? ¿Esm/CJS acorde al build? |
| **Licencia** | ¿Compatible con el uso comercial del repo? |
| **Ajuste** | ¿Resuelve el caso sin “wrapper” enorme? ¿Tamaño de bundle aceptable para el beneficio? |
| **Consistencia** | ¿Encaja con patrones ya usados (p. ej. ya usan `zod`, `date-fns`)? Evitar duplicar conceptos. |

## Cuándo **no** añadir una librería

- La necesidad es **trivial y estable** (pocas líneas, sin edge cases de seguridad).
- El paquete está **abandonado**, sin licencia clara, o sustituye algo que el **runtime ya hace bien**.
- El coste de **peso o complejidad** supera el beneficio (micro-optimización o feature de un solo uso muy acotado en código internno).

## Cuándo **sí** favorecer librería

- **Parsing/validación** de formatos complejos (CSV, fechas con zonas, esquemas, etc.).
- **Criptografía, firmas, tokens**: usar implementaciones auditadas; no armar primigenios.
- **Compatibilidad con estándares** (JWT, OAuth helpers, iCal, etc.) donde los detalles importan.
- **Accesibilidad o UI compleja** con componentes probados cuando el proyecto ya usa un sistema de UI.

## Anti-patrones

- Inventar validadores, parsers o formatters “a medida” cuando ya hay **estándar de equipo** o paquete consolidado en el repo.
- Copiar algoritmos de blogs sin comparar con librerías mantenidas (riesgo de bugs y seguridad).
- Acumular **tres librerías** que resuelven el mismo tipo de problema; unificar cuando sea razonable.

## Referencia rápida

- Tras elegir librería: seguir la **documentación oficial**, versionar de forma acorde al `package.json` del proyecto, y ejecutar **lint/build/tests** del repo después de añadir dependencias.
