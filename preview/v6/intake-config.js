// Public configuration only. Supply reviewed staging values before enabling.
// Never put API keys, service-role credentials or the Turnstile secret here.
export const intakeConfig = Object.freeze({
  enabled: false,
  endpoint: '',
  noticeUrl: '',
  noticeVersion: '',
  turnstileSiteKey: ''
});
