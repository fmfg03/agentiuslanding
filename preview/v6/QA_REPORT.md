# QA de Agentius V6 — registro de verificación

Cambios: contraste del resultado corregido; el botón genera y descarga en una sola acción; resumen copiable para entrega manual al formulario público.

**Limitación comercial:** no existe integración confirmada con Magnus ni transmisión automática de diagnóstico. El usuario debe pegar y enviar el texto en el sitio público.

**Imágenes:** los rótulos/incrustaciones dentro de fotografías generadas continúan. No se presentan como UI operativa. Para su separación completa se requieren fotografías limpias y superposiciones independientes HTML/SVG.

## Validaciones
Pendientes de agregar después de ejecutar smoke tests en Chromium.

- `node --check app.js`: pasó.
- Intento Playwright/Chromium sobre `http://127.0.0.1:8765/`: **bloqueado** con `net::ERR_BLOCKED_BY_ADMINISTRATOR`. No hay capturas ni verificación visual aprobada.
- La acción de descarga automática requiere verificación en navegador externo o staging accesible.
