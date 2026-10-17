import { intakeConfig as config } from './intake-config.js';
import { mountDiagnosticSubmission } from './agentius-diagnostic-form.js';

const host = document.querySelector('#diagnostic-intake');
let mounted;
let submissionStarted = false;
let observer;
let scriptReady;
let widget;
function challengeToken(container) {
  if (!scriptReady) scriptReady = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    const fail = () => { clearTimeout(timer); script.onload = null; script.onerror = null; script.remove(); scriptReady = undefined; reject(Error('Challenge unavailable')); };
    const timer = setTimeout(fail, 15000);
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = fail;
    document.head.append(script);
  });
  return scriptReady.then(() => new Promise((resolve, reject) => {
    if (widget !== undefined) window.turnstile.remove(widget);
    let settled = false;
    const finish = (token) => { if (settled) return; settled = true; clearTimeout(timer); resolve(token); };
    const timer = setTimeout(() => finish(''), 60000);
    try {
      widget = window.turnstile.render(container, {
        sitekey: config.turnstileSiteKey, action: 'diagnostic_submit', size: 'flexible',
        callback: finish, 'error-callback': () => finish(''), 'expired-callback': () => finish(''),
        'timeout-callback': () => finish('')
      });
    } catch (error) { clearTimeout(timer); reject(error); }
  }));
}

document.addEventListener('agentius-diagnostic-generated', event => {
  if (!config.enabled || !host) return;
  // Preserve the first submitted snapshot, UUID and consent through regeneration/retries.
  if (submissionStarted || (mounted?.client.submissionId && !mounted.client.canEdit)) return;
  observer?.disconnect();
  host.replaceChildren();
  const snapshot = structuredClone(event.detail);
  const explanation = document.createElement('p');
  explanation.textContent = 'El envío opcional incluye el área, la fricción y la frecuencia del resumen mostrado aquí. El volumen y el correo del TXT permanecen locales. Completa por separado tus datos para solicitar contacto. Si regeneras el TXT después de enviar, el envío pendiente conserva estos datos.';
  const preview = document.createElement('p');
  preview.textContent = `${snapshot.area} · ${snapshot.problem} · ${snapshot.frequency}`;
  const label = document.createElement('label'); label.textContent = 'Solución que te interesa ';
  const offer = document.createElement('select'); offer.required = true; offer.name = 'solution_interest';
  for (const [value, text] of [['', 'Selecciona'], ['automatizacion-operativa', 'Automatización operativa'],
    ['seguimiento-comercial', 'Seguimiento comercial'], ['inventarios-trazabilidad', 'Inventarios y trazabilidad']]) {
    const option = document.createElement('option'); option.value = value; option.textContent = text; offer.append(option);
  }
  label.append(offer);
  const challenge = document.createElement('div');
  host.append(explanation, preview, challenge);
  try {
    if (!config.turnstileSiteKey) throw Error('Missing challenge configuration');
    mounted = mountDiagnosticSubmission(host, { ...config,
      getDiagnostic: () => ({ diagnostic: { version: 'agentius-home-v6', answers: snapshot },
        interest: { offer_id: offer.value }, origin: { page_path: location.pathname } }),
      getChallengeToken: () => challengeToken(challenge)
    });
    mounted.form.querySelector('fieldset').prepend(label);
    mounted.form.addEventListener('submit', () => {
      if (mounted.form.reportValidity()) { submissionStarted = true; offer.disabled = true; }
    });
    // A safe validation rejection permits correcting the interest on the next attempt.
    observer = new MutationObserver(() => {
      const pending = mounted.form.querySelector('fieldset').disabled;
      if (!pending && mounted.client.canEdit) submissionStarted = false;
      offer.disabled = pending || !mounted.client.canEdit;
    });
    observer.observe(mounted.form.querySelector('[role=status]'), { childList: true });
  } catch {
    host.replaceChildren();
    host.textContent = 'El envío directo no está disponible. Puedes descargar o copiar el resumen y usar el contacto público.';
  }
});
