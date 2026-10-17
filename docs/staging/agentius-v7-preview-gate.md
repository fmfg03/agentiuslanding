# Agentius Home V7 — Staging deployment gate

Estado: PREPARACIÓN, NO DESPLEGADO.
Fuente del candidato: `agentius-home-comercial-v7-rc.zip` (artefacto generado en conversación; **aún no versionado en esta rama**).
No confundir esta rama de preparación con el sitio listo para preview.

## Despliegue previsto
1. Incorporar en esta rama los 18 archivos del ZIP conservando rutas relativas, sin tocar `main` ni `agentius.ai`.
2. Confirmar la cuenta y el proyecto Cloudflare Pages autorizado para Agentius. No asumir que ya existe ni que apunta a este repositorio.
3. Vincular preview de rama; framework: None/static; directorio raíz del sitio: `/` si los archivos se incorporan en root; comando build vacío.
4. Confirmar dominio `*.pages.dev` del proyecto y comprobar que no afecta DNS ni dominio de producción.
5. Ejecutar QA real desktop (1440px), tablet (768px) y móvil (390px y 360px): navegación, foco, contraste, alternador antes/después, Authority Surface, diagnóstico, copia, primera y segunda descarga TXT, enlaces a tres soluciones.
6. Mantener traspaso manual; no afirmar que se han enviado datos a Magnus.
7. BLOQUEO DE PUBLICACIÓN: fotografías actuales contienen overlays/textos integrados en píxeles. Regenerar masters limpios y reconstruir overlays semánticos HTML/SVG. Revisar contraste de pies de foto y etiquetado V7.

## Gate de aceptación
- Preview real comprobada con URL específica, captura móvil y escritorio.
- 0 errores JS de consola y 0 enlaces internos rotos.
- Descargas/copia verificadas y protección de datos explicada.
- Aprobación visual del dueño.
- Integración con Magnus en cambio separado, después de contrato y recibo confirmado.

No fusionar la rama con main para obtener staging. No publicar una URL de preview no confirmada.
