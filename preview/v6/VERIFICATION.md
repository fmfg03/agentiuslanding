# Integración Agentius V6 → Magnus, 2026-10-17

Estado: candidato en rama/PR, sin despliegue en producción. Cloudflare reporta una preview automática, sin acceso verificado (403 en la revisión). La recepción directa está **deshabilitada**.

## Procedencia

ZIP `agentius-home-comercial-v6.zip`, recuperado desde «Descargar sitio completo V6» en
[Propuesta de posicionamiento Agentius](https://chatgpt.com/c/6ad2b48d-afc4-83e8-b9f4-dbf18cde46de).
SHA-256: `db74215db1406b1ee51bfd8e9259c525a9a98a8fc820e247478d6cd08cb20ce5`.
Los documentos QA_REPORT.md e INTEGRATION.md son el registro original; este documento describe
el trabajo posterior. La ruta preview/v6 preserva el sitio raíz existente. No es el V7 anunciado.

## Comportamiento

- Generar el diagnóstico descarga el TXT y mantiene la copia con alternativa manual. Se añade
  «Volver a descargar TXT» para repetir una descarga sin regenerar ni enviar.
- Al habilitar configuración revisada, el resumen muestra un formulario opcional de contacto.
  Ningún POST se ejecuta al generar, copiar, descargar o cargar la página.
- Contacto y marketing tienen casillas independientes, desmarcadas; marketing es opcional.
- Se envían área, fricción y frecuencia del V6, la solución elegida explícitamente y los datos
  de contacto del formulario separado. Volumen numérico y correo del TXT permanecen locales;
  la UI lo explica antes de enviar. El esquema v1 de Magnus no admite volumen libre.
- El primer envío fija su resumen y consentimientos durante la espera de Turnstile y ante
  resultado incierto. Regenerar TXT no reemplaza ese formulario ni cambia su UUID.
- Reintentar recupera un recibo válido sin duplicar la solicitud. Solo un recibo válido muestra
  «recibido». Los datos/UUID son de memoria: mantener la página abierta tras error; no hay
  recuperación tras recargar ni almacenamiento local de datos personales.
- Los módulos `agentius-diagnostic-{client,form}.js` son copias de [Magnus PR #17](https://github.com/fmfg03/magnus/pull/17), commit `5437a99550c256ebe87dc3f951583a3ea371809f`;
  futuras actualizaciones deben sincronizarse y pasar estas mismas pruebas.

## Configuración pendiente

`intake-config.js` contiene únicamente configuración pública vacía. Requiere destino staging
verificado, URL/versión de aviso aprobado y sitekey Turnstile para ese dominio. Nunca incluir
API key de Magnus, service_role ni secreto de Turnstile. El widget carga solo tras un envío
voluntario. Su acción es `diagnostic_submit` y Magnus valida el token en servidor.
Referencia técnica: [renderizado explícito de Cloudflare](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/).

`agentius-v6-catalog.json` coincide con selects reales y rutas de las tres soluciones.
`noticeVersions` está vacío intencionalmente; completar solo tras revisar el aviso.
En Magnus hay que configurar el mismo catálogo, origen exacto, sitio/workspace y operador activo.
Falta comprobar CSP/proxy/HTTPS y challenge real en un staging permanente. No se modificaron
credenciales, permisos operativos ni producción. No se habilita mediante parámetros de URL.

## Evidencia

`scripts/verify-v6-browser.mjs` prueba Chrome a 1280 y 390 px con el HTML, CSS, JS e imágenes
recuperados. Ambos tamaños aprobados: navegación móvil/Escape, generación TXT, re-descarga,
copia alternativa, catálogo, contacto obligatorio, marketing opcional, fallo de red, reintento
idéntico y recibo, regeneración durante challenge pendiente, ausencia de desbordamiento,
honeypot oculto y contraste del estado. Configuración apagada: cero solicitudes externas.
Pruebas adicionales aprobadas: timeout del script Turnstile (plazo acelerado solo en el test),
recarga del script y reintento con el mismo UUID; rechazo seguro de validación seguido de
corrección/regeneración del diagnóstico y nuevo UUID. Revisión independiente final sin defectos
accionables en la lógica revisada.

Los recibos y Turnstile del navegador son simulados. El PR de Magnus verifica por separado
12/12 pruebas con PostgreSQL 15 y PostgREST 12.2.12 reales aislados: concurrencia, pérdida de
conexión después del commit, duplicados/conflictos, validación, rollback, cuota e historial.
Esto **no** sustituye la aceptación E2E del staging permanente solicitado, todavía no identificado.

Reproducción (Node >=22 y Playwright instalado aparte):

```sh
node scripts/verify-v6-browser.mjs
# Opcionales: MAGNUS_PLAYWRIGHT_MODULE, MAGNUS_CHROMIUM_EXECUTABLE, V6_SCREENSHOTS.
```

Pendiente visual heredado: las fotografías contienen interfaces ilustrativas incrustadas.
No se afirma que sean UI funcional ni que esta revisión cierre el rediseño V7.
No se ha desplegado en producción, fusionado ni aplicado ninguna migración de producción.

## Revisión reproducida posterior

El informe `/tmp/agentius-magnus-review-20261017.md` verifica este V6 en SHA `53eaff23d723046dfc9c2828495e54f6055a918a` y Magnus `5437a99550c256ebe87dc3f951583a3ea371809f`: 48/48 enfocadas, 12/12 SQL y navegador escritorio/móvil aprobado con challenge/recibos simulados. Suite completa posterior: 200 aprobadas, 0 fallos, 1 omitida; el fallo externo anterior ya no se reproduce y no se modificó su manifiesto.

Cloudflare reportó `https://a6bbfaa2.agentiuslanding.pages.dev/preview/v6/index.html`, pero la revisión obtuvo 403. No se verificó accesibilidad ni contenido servido. La propuesta de staging se documenta en Magnus PR #17, `docs/product/agentius-staging-proposal-20261017.md`; no se ha provisionado. Siguen pendientes HTTPS/proxy, aviso, Turnstile real y operador. Esta actualización solo modifica documentación; no vuelve a ejecutar pruebas ni habilita intake.
