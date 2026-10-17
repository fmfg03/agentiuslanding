// Browser-only transport. No request is made until send() is explicitly called.
const SCHEMA = 'agentius-diagnostic/v1';
const sorted = value => Array.isArray(value) ? value.map(sorted) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])])) : value;

export class SubmissionError extends Error {
  constructor(code, retryable = false) { super(code); this.code = code; this.retryable = retryable; }
}

export function createDiagnosticClient({ endpoint, fetchImpl = globalThis.fetch,
  uuid = () => globalThis.crypto.randomUUID(), timeoutMs = 15000 } = {}) {
  const url = new URL(endpoint);
  if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) ||
      url.username || url.password || url.search || url.hash || url.pathname !== '/v1/public/diagnostic-submissions') {
    throw new SubmissionError('INVALID_ENDPOINT');
  }
  // Kept in memory only: no PII, tokens or consent persisted in browser storage.
  let pending, inFlight;
  return {
    get submissionId() { return pending?.id ?? null; },
    get canEdit() { return !pending || !!pending.rejected; },
    send(logical, { challengeToken = '', honeypot = '' } = {}) {
      if (logical?.consent?.contact_request !== true || typeof logical?.consent?.marketing_subscription !== 'boolean') {
        return Promise.reject(new SubmissionError('INVALID_CONSENT'));
      }
      const snapshot = JSON.parse(JSON.stringify({ ...logical, schema_version: SCHEMA }));
      if ('submission_id' in snapshot || 'anti_spam' in snapshot) return Promise.reject(new SubmissionError('INVALID_PAYLOAD'));
      const key = JSON.stringify(sorted(snapshot));
      if (inFlight) return pending.key === key ? inFlight : Promise.reject(new SubmissionError('PENDING_SUBMISSION_CHANGED'));
      // Do not change an uncertain request into a different request behind the user's back.
      if (pending && pending.key !== key && !pending.receipt && !pending.rejected) {
        return Promise.reject(new SubmissionError('PENDING_SUBMISSION_CHANGED'));
      }
      if (!pending || pending.key !== key) pending = { id: uuid(), key, snapshot };
      if (pending.receipt) return Promise.resolve(structuredClone(pending.receipt));
      const attempt = pending;
      // A prior validation rejection says nothing about this new attempt's outcome.
      attempt.rejected = false;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      inFlight = (async () => {
        try {
          const response = await fetchImpl(url.href, {
            method: 'POST', credentials: 'omit', cache: 'no-store', redirect: 'error',
            headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
            body: JSON.stringify({ ...attempt.snapshot, submission_id: attempt.id,
              anti_spam: { honeypot, challenge_token: challengeToken } })
          });
          const body = await response.json();
          if (response.status !== 200 && response.status !== 201) {
            const code = body?.error?.code;
            // Only known validation failures prove that THIS attempt did not commit.
            // A previous network failure may still have committed, so never reset its ID here.
            if (!attempt.uncertain && ['INVALID_CONSENT', 'INVALID_PAYLOAD', 'UNSUPPORTED_SCHEMA_VERSION'].includes(code)) attempt.rejected = true;
            throw new SubmissionError(typeof code === 'string' ? code : 'RECEIPT_UNCONFIRMED',
              [429, 503, 504].includes(response.status) || code === 'SUBMISSION_IN_PROGRESS');
          }
          if (body?.ok !== true || body.schema_version !== SCHEMA || body.status !== 'received' ||
              body.submission_id !== attempt.id || typeof body.receipt_id !== 'string' || !body.receipt_id.trim() ||
              typeof body.received_at !== 'string' || !Number.isFinite(Date.parse(body.received_at)) ||
              typeof body.duplicate !== 'boolean' || (response.status === 201 && body.duplicate !== false)) {
            throw new SubmissionError('RECEIPT_UNCONFIRMED', true);
          }
          attempt.receipt = body;
          return structuredClone(body);
        } catch (error) {
          if (!(error instanceof SubmissionError)) error = new SubmissionError('NETWORK_UNCERTAIN', true);
          if (error.retryable) attempt.uncertain = true;
          throw error;
        } finally { clearTimeout(timer); inFlight = undefined; }
      })();
      return inFlight;
    }
  };
}
