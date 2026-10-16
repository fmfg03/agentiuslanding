# Agentius 2.0 — Brief comercial y arquitectura web
Fecha: 2026-10-16
Estado: PROPUESTA PARA REVISIÓN — no desplegar sin validar
Repositorio de trabajo: fmfg03/agentiuslanding

## Objetivo
Transformar agentius.ai de una portada centrada en autoridad operativa a un sistema comercial orientado a resultados, manteniendo la profundidad técnica existente. Magnus opera adquisición y experimentación; Agentius implementa soluciones; Zaubern aporta controles cuando corresponda al nivel de madurez verificable.

## Tesis
El comprador primero debe reconocer una pérdida o fricción, entender qué intervención contratamos, ver evidencia verificable y poder solicitar un diagnóstico. Authority Surface es diferenciador técnico secundario en el recorrido inicial, no el titular del hero.

## Público prioritario
- Dueño / dirección general de pyme mediana: eficiencia y crecimiento, lenguaje financiero.
- Director de Operaciones: tiempos, retrabajos, errores, capacidad.
- Director Comercial: captura, calificación y seguimiento de oportunidades.
- CIO / CTO / compliance: integración, gobernanza, permisos, evidencia.

## Nueva navegación
Inicio | Soluciones | Industrias | Casos | Cómo trabajamos | Tecnología y confianza | Recursos | Diagnóstico
Mantener rutas /es/, /en/, /research/, /es/insights/. Evitar enlaces rotos y preservar canónicos/hreflang.

## Home — contenido v0
Eyebrow: INTELIGENCIA ARTIFICIAL APLICADA A OPERACIONES REALES
H1: Tu empresa pierde tiempo y dinero en procesos que ya pueden funcionar mejor.
Subheading: Identificamos dónde se atasca tu operación, conectamos tus sistemas y automatizamos el trabajo repetitivo con inteligencia artificial. Medimos el cambio y definimos controles para las acciones críticas.
CTA primario: Descubrir oportunidades
CTA secundario: Ver soluciones
Proof-strip: Integración con sistemas existentes · Entregables definidos · Control sobre acciones críticas (sin números inventados)

Secciones:
1. El costo oculto: captura duplicada / seguimientos / autorizaciones / inventarios.
2. Tres soluciones iniciales con alcance y CTA.
3. Cómo trabajamos: diagnóstico -> mapa actual -> piloto delimitado -> medición -> expansión.
4. Demostraciones: solo casos verificables, y marcar explícitamente pilotos o laboratorios.
5. Control operacional: Zaubern, permisos, revisión humana, logs y verificación; distinguir prototipo de producción.
6. Preguntas frecuentes: precio, integración, protección de datos, mantenimiento, métricas.
7. Diagnóstico y agenda.
8. Recursos e insights por industria.

## Tres landings prioritarias (ofertas; precio sujeto a validación)
### /es/soluciones/automatizacion-operativa/
Título: Menos captura manual. Menos retrabajo. Más operación.
Problemas: hojas duplicadas, exportaciones, autorizaciones, conciliación, seguimiento.
Entregable de entrada: mapa de proceso actual/futuro, puntos de integración, estimación basada en volúmenes reales, quick win priorizado.
CTA: Evaluar mi proceso.

### /es/soluciones/ventas-seguimiento/
Título: Que ninguna oportunidad se pierda por falta de seguimiento.
Problemas: velocidad de respuesta, clasificación, traspaso a vendedores, CRM incompleto.
Entregable: auditoría de flujo lead-to-opportunity, propuesta piloto de captura/calificación/seguimiento, criterios de intervención humana.
CTA: Revisar mi embudo.

### /es/soluciones/inventario-trazabilidad/
Título: Inventarios más confiables, sin depender de recapturas.
Problemas: conteo manual, conciliación, diferencias, trazabilidad y movimientos no registrados.
Entregable: mapa de toma de inventario, fuentes de datos, integración y propuesta de control.
CTA: Diagnosticar mis conteos.

No prometer reducción porcentual de costos, aumento de ingresos, días de despliegue ni ROI hasta validar alcance y evidencia.

## Diagnóstico interactivo (MVP)
Preguntas: industria, área, fricción, frecuencia, volumen, tiempo/persona, sistemas utilizados, impacto percibido, autoridad para decidir y preferencia de contacto.
Resultados: mapa de hipótesis de fugas, ranking cualitativo impacto/esfuerzo con supuestos explícitos y siguiente paso.
No calcular ahorro monetario si faltan datos; si se estima, mostrar fórmula y supuestos.
Campos para Magnus CRM: source/medium/campaign, landing, industria, problema, urgencia, sistemas, role, consentimiento, score preliminar y status.
Eventos: diagnostic_start, diagnostic_complete, lead_submit, meeting_booked, opportunity_created, won/lost; no PII en analítica abierta.
Experimentos: copy del hero, CTA diagnóstico vs demo, landings por vertical. Los compradores sintéticos sirven para generar hipótesis, no validan PMF ni conversión.

## Evidencia y confianza
- Caso TrakIT: crear ficha SOLO después de aprobar qué es demostrable, con resultados observados y periodo.
- Casos con clientes: autorización escrita para logos, cifras y testimoniales.
- No usar contadores simulados de agentes, horas ahorradas, proyectos limitados ni urgencia ficticia.
- En Zaubern diferenciar demo local, pruebas y capacidades productivas.
- Mantener contenido técnico existente enlazado desde Tecnología y confianza.

## Dirección visual
Editorial empresarial de alto contraste, fotografía/cine de procesos y negocios reales, diagramas sobrios sobre flujos y evidencias. El espectacular digital es una pieza de marca secundaria; la web debe optimizarse para conversión. Evitar clichés visuales de robots/brains. Reutilizar logo y sistema visual vigente antes de rediseñar marca.

## Plan de implementación
P0: conservar snapshot, comprobar rutas, crear nuevo hero y navegación, formularios válidos, tracking de conversiones, 3 páginas de solución.
P1: caso TrakIT validado, FAQ, diagnóstico MVP, instrumentación de atribución Magnus.
P2: contenido sectorial y AEO, experimentos de conversión, ampliar demos.

## Gate de publicación
Verificar render móvil/escritorio, formularios y destinos, consentimiento, eventos de atribución, SEO técnico, accesibilidad, performance, idioma ES/EN, redirecciones, y afirmaciones revisadas con evidencia.
Métrica norte: reuniones calificadas por semana; secundarias: lead->meeting, meeting->opportunity, opportunity->won, CAC y ciclo.
No modificar producción o main en este documento.
