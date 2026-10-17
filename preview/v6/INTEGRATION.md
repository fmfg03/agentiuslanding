# Agentius Home V4 — Estado e integración

## Qué funciona localmente
- Navegación responsive con menú móvil y enlaces de tres landings.
- Simulación interactiva manual vs flujo objetivo con dependencias descritas; no es un motor de procesos.
- Secuencia Authority Surface bajo demanda con bloqueo y revisión humana ilustrativos; no llama a Zaubern.
- Formulario validado en el navegador, crea resumen descargable `.txt`; no transmite información a servidor.
- Imágenes WebP responsive. Sin librerías de terceros ni scripts de tracking.

## Qué no está conectado
- Envío de leads a Magnus/CRM, notificaciones y seguimiento.
- Agendamiento de llamadas.
- Medición analytics y atribución de campañas.
- Motor real de diagnóstico con costos/volúmenes y cálculo de ahorro.
- Ejecución en vivo de Agentius / Zaubern.

## Contrato propuesto para Magnus (pendiente de autorización)
Evento `diagnostic_completed`: anonymous_session_id, timestamp, source, medium, campaign, landing_path, solution_interest, area, problem, frequency, weekly_volume, consent_version, consent_at, lead_id (si se acepta contactar), event_id idempotente.
Evento `lead_submitted`: campos permitidos bajo consentimiento separado; PII solo a CRM seguro (no a Google Analytics). No incluir el texto libre ni correo en parámetros de campañas.
Eventos de negocio downstream: meeting_booked, opportunity_qualified, proposal_sent, won, lost (deduplicación por event_id).

## Antes de activar envío a CRM
1. Confirmar endpoint y esquema permitido, política de privacidad y responsable de datos.
2. Añadir consentimiento comercial **separado y desmarcado**; definir retención, finalidad y borrado.
3. Validación servidor, limitación de tasa, antispam y entrega segura; nunca exponer tokens en HTML.
4. Mapear UTM y referrer respetando consentimiento analítico.
5. Estado accesible de entrega real / errores y pruebas E2E.
6. Sustituir elementos con texto/UI incrustados en fotografías por fotografías limpias y overlays HTML/SVG. Actualmente se señalan como conceptuales; no es correcto atribuirles interacción.
7. Revisión editorial y técnica de afirmaciones y permisos para casos reales.
8. Integración en repositorio/sitio canónico mediante PR, previa revisión; este paquete no cambia producción.

## Verificación local
Abrir con servidor HTTP local, por ejemplo `python -m http.server 8000` desde la carpeta; visitar `http://localhost:8000/`. Probar menú a 375px, 768px y desktop; alternar demos; completar formulario, descargar resumen; seguir enlaces a landings; revisar consola y red.


## Estado V6 del traspaso
Generación y descarga local inmediata. El usuario puede copiar y pegar su resumen en el formulario público. Esta solución **no** garantiza recepción, atribución ni creación de lead. Para integrar Magnus se requiere confirmar URL del endpoint, autenticación, consentimientos, privacidad, esquema de eventos, reglas de retención y recuperación de errores, así como un acuse verificable antes de mostrar “enviado”.
