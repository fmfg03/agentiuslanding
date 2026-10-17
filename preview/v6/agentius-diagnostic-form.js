import { createDiagnosticClient } from './agentius-diagnostic-client.js';

// Mount beside the existing V6 download/copy controls, never in their place.
// getDiagnostic must return the final approved version, answers, offer and origin.
// getChallengeToken is supplied by the site's Turnstile widget; no secret belongs here.
export function mountDiagnosticSubmission(container, { endpoint, noticeUrl, noticeVersion,
  getDiagnostic, getChallengeToken, fetchImpl, timeoutMs } = {}) {
  const notice = new URL(noticeUrl);
  if (notice.protocol !== 'https:' || !noticeVersion || typeof getDiagnostic !== 'function' ||
      typeof getChallengeToken !== 'function') throw new Error('Missing approved intake configuration');
  const client = createDiagnosticClient({ endpoint, fetchImpl, timeoutMs });
  const doc = container.ownerDocument;
  const form = doc.createElement('form');
  const fieldset = doc.createElement('fieldset');
  const legend = doc.createElement('legend');
  legend.textContent = 'Enviar mi diagnóstico a Agentius (opcional)';
  fieldset.append(legend);
  const intro = doc.createElement('p');
  intro.textContent = 'Puedes descargar o copiar tu resumen sin enviarlo. Solo enviaremos tus datos cuando pulses Enviar.';
  fieldset.append(intro);
  function input(name, label, type, required, maxLength) {
    const wrapper = doc.createElement('label');
    const control = doc.createElement('input');
    control.name = name; control.type = type; control.required = required;
    if (maxLength) control.maxLength = maxLength;
    wrapper.append(doc.createTextNode(label + ' '), control); fieldset.append(wrapper, doc.createElement('br'));
    return control;
  }
  const name = input('name', 'Nombre', 'text', true, 120); name.minLength = 2; name.autocomplete = 'name';
  const email = input('email', 'Correo electrónico', 'email', true, 254); email.autocomplete = 'email';
  const phone = input('phone', 'Teléfono (opcional)', 'tel', false, 30); phone.autocomplete = 'tel';
  const company = input('company', 'Empresa (opcional)', 'text', false, 160); company.autocomplete = 'organization';
  const contact = input('contact_request', 'Autorizo enviar este diagnóstico y mis datos a Agentius para atender mi solicitud.', 'checkbox', true);
  const marketing = input('marketing_subscription', 'Quiero recibir comunicaciones comerciales adicionales (opcional).', 'checkbox', false);
  // Both are unchecked by default; requesting contact does not opt in to marketing.
  const privacy = doc.createElement('a'); privacy.href = notice.href; privacy.textContent = 'Aviso de privacidad';
  privacy.target = '_blank'; privacy.rel = 'noopener noreferrer'; fieldset.append(privacy);
  const trap = input('website_url', 'Dejar vacío', 'text', false, 200);
  trap.tabIndex = -1; trap.autocomplete = 'off'; trap.parentElement.hidden = true;
  const button = doc.createElement('button'); button.type = 'submit'; button.textContent = 'Enviar diagnóstico';
  const status = doc.createElement('p'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  fieldset.append(button); form.append(fieldset, status); container.append(form);
  let busy = false, frozen;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    busy = true; fieldset.disabled = true; status.textContent = 'Enviando diagnóstico…';
    try {
      if (!frozen) frozen = structuredClone({ ...getDiagnostic(), contact: { name: name.value, email: email.value,
        phone: phone.value || null, company: company.value || null },
        consent: { contact_request: contact.checked, marketing_subscription: marketing.checked, notice_version: noticeVersion } });
      // An empty/expired token can still recover a previously committed receipt.
      let token = '';
      try { token = await getChallengeToken(); } catch { /* recovery still works without a new token */ }
      const receipt = await client.send(frozen, { challengeToken: token, honeypot: trap.value });
      status.textContent = `Diagnóstico recibido. Recibo: ${receipt.receipt_id}.`;
      button.textContent = 'Diagnóstico recibido';
      form.dispatchEvent(new CustomEvent('diagnostic-received', { detail: receipt }));
    } catch (error) {
      const validation = ['INVALID_PAYLOAD', 'INVALID_CONSENT', 'UNSUPPORTED_SCHEMA_VERSION'].includes(error.code);
      // Keep the exact data/consents for retries after uncertain network or backend outcomes.
      if (client.canEdit) frozen = undefined;
      status.textContent = validation ? 'Revisa los datos y el diagnóstico antes de volver a enviar. Puedes descargar o copiar tu resumen.'
        : error.code === 'SPAM_CHECK_FAILED' ? 'Completa la verificación y vuelve a intentar. Puedes descargar o copiar tu resumen.'
        : error.code === 'IDEMPOTENCY_CONFLICT' ? 'El identificador ya corresponde a otros datos. No podemos confirmar este envío. Conserva el resumen para atención manual.'
        : 'No pudimos confirmar la recepción. Mantén esta página abierta: reintentar conservará el mismo envío y sus consentimientos. Puedes descargar o copiar tu resumen.';
      fieldset.disabled = false;
      if (frozen) for (const control of [name, email, phone, company, contact, marketing]) control.disabled = true;
      else for (const control of [name, email, phone, company, contact, marketing]) control.disabled = false;
      button.textContent = 'Reintentar envío';
    } finally { busy = false; }
  });
  return { form, client };
}
