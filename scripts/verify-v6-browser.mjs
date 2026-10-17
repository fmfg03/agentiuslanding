// Synthetic HTTP receipts/challenge; real recovered V6 DOM, scripts and assets.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.MAGNUS_PLAYWRIGHT_MODULE || 'playwright');
const root = resolve('preview/v6');
const catalog = JSON.parse(await readFile(resolve(root, 'agentius-v6-catalog.json'), 'utf8'));
const server = createServer(async (req, res) => {
  const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!path.startsWith(root + '/') && !path.startsWith(root + '\\')) { res.writeHead(404).end(); return; }
  try {
    const content = await readFile(path);
    res.setHeader('content-type', ({ '.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.webp':'image/webp' })[extname(path)] || 'text/plain');
    res.end(content);
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless:true, executablePath:process.env.MAGNUS_CHROMIUM_EXECUTABLE });
  for (const width of [1280,390]) {
    const context = await browser.newContext({viewport:{width,height:900},acceptDownloads:true});
    const page = await context.newPage();
    const errors=[], requests=[]; let external=0;
    page.on('pageerror', e=>errors.push(e.message));
    page.on('request', req=>{ if (!req.url().startsWith(origin)) external++; });
    await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}}}));
    await page.goto(origin+'/index.html');
    async function generate(area='Operaciones') {
      await page.locator('#area').selectOption(area);
      await page.locator('#problem').selectOption('Captura y recaptura manual');
      await page.locator('#frequency').selectOption('diario');
      await page.locator('#volume').fill('250');
      await page.locator('#email').fill('local-only@example.invalid');
      await page.locator('[name=ack]').check();
      const download=page.waitForEvent('download');
      await page.getByRole('button',{name:'Generar resumen y descargar TXT'}).click();
      const file=await download;
      assert.equal(file.suggestedFilename(),'diagnostico-agentius-preliminar.txt');
      assert.match(await readFile(await file.path(),'utf8'),/Volumen estimado: 250/);
    }
    await generate();
    assert.equal(await page.locator('#diagnostic-intake form').count(),0);
    assert.equal(external,0,'disabled feature performs no external requests');
    await page.route('**/intake-config.js', route=>route.fulfill({contentType:'application/javascript',body:`export const intakeConfig={enabled:true,endpoint:'${origin}/v1/public/diagnostic-submissions',noticeUrl:'https://example.invalid/privacy',noticeVersion:'synthetic-only',turnstileSiteKey:'synthetic-only'};`}));
    await page.route('https://challenges.cloudflare.com/**', route=>route.fulfill({contentType:'application/javascript',body:'let count=0;window.turnstile={remove(){},render(el,opts){if(count++===0)window.finishSyntheticChallenge=()=>opts.callback("synthetic-token");else setTimeout(()=>opts.callback("synthetic-token"),0);return "synthetic-widget"}};'}));
    await page.route('**/v1/public/diagnostic-submissions',async route=>{
      const body=route.request().postDataJSON();requests.push(body);
      if(requests.length===1)return route.abort('connectionreset');
      return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,status:'received',schema_version:'agentius-diagnostic/v1',submission_id:body.submission_id,receipt_id:'rec_v6_synthetic',received_at:'2026-10-17T18:00:00Z',duplicate:true})});
    });
    await page.reload();
    // The recovered menu is exercised at its real mobile breakpoint.
    if(width===390){await page.locator('.menu-toggle').click();assert.equal(await page.locator('.mobile-nav').evaluate(el=>el.classList.contains('open')),true);await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');}
    await generate();
    const intake=page.locator('#diagnostic-intake');
    await intake.getByRole('button',{name:'Enviar diagnóstico',exact:true}).waitFor();
    assert.equal(requests.length,0);
    for(const key of ['area','problem','frequency']) assert.deepEqual(await page.locator(`#${key} option`).evaluateAll(els=>els.map(e=>e.value).filter(Boolean)),catalog.diagnosticCatalog['agentius-home-v6'][key]);
    assert.equal(await intake.locator('[name=contact_request]').isChecked(),false);
    assert.equal(await intake.locator('[name=marketing_subscription]').isChecked(),false);
    assert.equal(await intake.locator('[name=website_url]').isVisible(),false);
    await intake.locator('[name=solution_interest]').selectOption('automatizacion-operativa');
    await intake.locator('[name=name]').fill('Synthetic V6 Visitor');
    await intake.locator('[name=email]').fill('synthetic@example.invalid');
    await intake.getByRole('button',{name:'Enviar diagnóstico',exact:true}).click();assert.equal(requests.length,0);
    await intake.locator('[name=contact_request]').check();
    await intake.getByRole('button',{name:'Enviar diagnóstico',exact:true}).click();
    await page.waitForFunction(()=>typeof window.finishSyntheticChallenge==='function');
    await generate('Inventarios');
    assert.equal(await intake.locator('[name=email]').inputValue(),'synthetic@example.invalid');
    assert.equal(await intake.getByRole('button',{name:'Enviar diagnóstico',exact:true}).isDisabled(),true);
    assert.equal(requests.length,0);
    await page.evaluate(()=>window.finishSyntheticChallenge());
    await intake.getByRole('button',{name:'Reintentar envío'}).waitFor();
    assert.equal(requests.length,1);assert.equal(requests[0].consent.marketing_subscription,false);
    assert.equal(await intake.locator('[name=solution_interest]').isDisabled(),true);
    assert.deepEqual(Object.keys(requests[0].diagnostic.answers).sort(),['area','frequency','problem']);
    assert.equal(requests[0].diagnostic.answers.area,'Operaciones');
    assert.equal(JSON.stringify(requests[0]).includes('local-only@example.invalid'),false);
    await page.getByRole('button',{name:'Copiar resumen para enviarlo'}).click();
    assert.equal(await page.getByLabel('Resumen para copiar manualmente').isVisible(),true);
    const repeated=page.waitForEvent('download');await page.getByRole('button',{name:'Volver a descargar TXT'}).click();await repeated;
    // Regenerating the local TXT must never replace an uncertain submitted snapshot.
    await generate();
    await intake.getByRole('button',{name:'Reintentar envío'}).click();
    await intake.getByRole('button',{name:'Diagnóstico recibido',exact:true}).waitFor();
    assert.deepEqual(requests[0],requests[1]);
    assert.match(await intake.getByRole('status').innerText(),/rec_v6_synthetic/);
    assert.equal(await intake.getByRole('status').evaluate(el=>getComputedStyle(el).color),'rgb(22, 35, 27)');
    assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true);
    assert.deepEqual(errors,[]);
    if(process.env.V6_SCREENSHOTS){await mkdir(process.env.V6_SCREENSHOTS,{recursive:true});await intake.scrollIntoViewIfNeeded();await page.screenshot({path:resolve(process.env.V6_SCREENSHOTS,`v6-${width}.png`)});}
    await context.close();
    console.log(`PASS V6 ${width}px: disabled default, local TXT/re-download/copy, catalog, independent consent, network retry and immutable receipt`);
  }
  // Accelerate only the 15-second CDN deadline; the first script never responds.
  const recovery = await browser.newContext({acceptDownloads:true});
  const page = await recovery.newPage();
  let scriptLoads=0, stalledRoute, rejectCode='SPAM_CHECK_FAILED'; const attempts=[];
  await page.addInitScript(()=>{const timer=window.setTimeout.bind(window);window.setTimeout=(fn,ms,...args)=>timer(fn,ms===15000?100:ms,...args);});
  await page.route('**/intake-config.js',route=>route.fulfill({contentType:'application/javascript',body:`export const intakeConfig={enabled:true,endpoint:'${origin}/v1/public/diagnostic-submissions',noticeUrl:'https://example.invalid/privacy',noticeVersion:'synthetic-only',turnstileSiteKey:'synthetic-only'};`}));
  await page.route('https://challenges.cloudflare.com/**',route=>{
    if(++scriptLoads===1){stalledRoute=route;return;}
    return route.fulfill({contentType:'application/javascript',body:'window.turnstile={remove(){},render(el,opts){setTimeout(()=>opts.callback("recovered-token"),0);return "recovered-widget"}};'});
  });
  await page.route('**/v1/public/diagnostic-submissions',route=>{
    const body=route.request().postDataJSON();attempts.push(body);
    return route.fulfill({status:attempts.length===1?422:201,contentType:'application/json',body:JSON.stringify(attempts.length===1?{error:{code:rejectCode}}:{ok:true,status:'received',schema_version:'agentius-diagnostic/v1',submission_id:body.submission_id,receipt_id:'rec_recovered',received_at:'2026-10-17T18:00:00Z',duplicate:false})});
  });
  await page.goto(origin+'/index.html');
  await page.locator('#area').selectOption('Ventas');
  await page.locator('#problem').selectOption('Seguimiento tardío');
  await page.locator('#frequency').selectOption('semanal');
  await page.locator('[name=ack]').check();
  await page.getByRole('button',{name:'Generar resumen y descargar TXT'}).click();
  const form=page.locator('#diagnostic-intake');
  await form.locator('[name=solution_interest]').selectOption('seguimiento-comercial');
  await form.locator('[name=name]').fill('Synthetic Recovery');
  await form.locator('[name=email]').fill('recovery@example.invalid');
  await form.locator('[name=contact_request]').check();
  await form.getByRole('button',{name:'Enviar diagnóstico',exact:true}).click();
  await form.getByRole('button',{name:'Reintentar envío'}).waitFor();
  assert.equal(attempts[0].anti_spam.challenge_token,'');
  await stalledRoute.abort().catch(()=>{});
  await form.getByRole('button',{name:'Reintentar envío'}).click();
  await form.getByRole('button',{name:'Diagnóstico recibido',exact:true}).waitFor();
  assert.equal(scriptLoads,2);
  assert.equal(attempts[1].anti_spam.challenge_token,'recovered-token');
  assert.equal(attempts[0].submission_id,attempts[1].submission_id);
  rejectCode='INVALID_PAYLOAD';attempts.length=0;
  await page.reload();
  async function localSummary(area){
    await page.locator('#area').selectOption(area);
    await page.locator('#problem').selectOption('Seguimiento tardío');
    await page.locator('#frequency').selectOption('semanal');
    await page.locator('[name=ack]').check();
    await page.getByRole('button',{name:'Generar resumen y descargar TXT'}).click();
  }
  async function submitCorrectable(){
    await form.locator('[name=solution_interest]').selectOption('seguimiento-comercial');
    await form.locator('[name=name]').fill('Synthetic Correction');
    await form.locator('[name=email]').fill('correction@example.invalid');
    await form.locator('[name=contact_request]').check();
    await form.getByRole('button',{name:'Enviar diagnóstico',exact:true}).click();
  }
  await localSummary('Ventas');await submitCorrectable();
  await form.getByRole('button',{name:'Reintentar envío'}).waitFor();
  await localSummary('Inventarios');await submitCorrectable();
  await form.getByRole('button',{name:'Diagnóstico recibido',exact:true}).waitFor();
  assert.equal(attempts[0].diagnostic.answers.area,'Ventas');
  assert.equal(attempts[1].diagnostic.answers.area,'Inventarios');
  assert.notEqual(attempts[0].submission_id,attempts[1].submission_id);
  await recovery.close();
  console.log('PASS V6: stalled Turnstile script recovery; same-ID retry; safe validation rejection permits corrected diagnostic');
} finally {await browser?.close();await new Promise(r=>server.close(r));}
