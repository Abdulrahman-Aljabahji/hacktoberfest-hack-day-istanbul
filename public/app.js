const $ = id => document.getElementById(id);
const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

const sample = {
  en: {
    sourceLang: 'tr-TR',
    headline: 'Your next creative adventure starts here.',
    summary: 'This fictional Turkish notice invites you to a free coding workshop. There is a registration deadline, a time and place, and two things to bring.',
    facts: [
      {label:'REGISTER BY',value:'Oct 28 · 3:00 PM',source:"28 Ekim saat 15.00'e kadar"},
      {label:'WORKSHOP',value:'Oct 29 · 2:00 PM',source:"29 Ekim saat 14.00'te"},
      {label:'LOCATION',value:'Block B · Ground floor · Room 2',source:"B Blok Zemin Kat Salon 2'de"}
    ],
    steps: [
      {title:'Fill out the registration form',detail:'Register before October 28 at 3 PM. The sample notice does not contain a form link.',source:"Kayıt için 28 Ekim saat 15.00'e kadar formu doldurunuz."},
      {title:'Bring your ID and laptop',detail:'Have both ready before leaving.',source:'Kimliğinizi ve dizüstü bilgisayarınızı getirmeyi unutmayınız.'},
      {title:'Go to the workshop',detail:'Arrive October 29 at 2 PM, Block B, ground floor, Room 2.',source:"Atölye 29 Ekim saat 14.00'te B Blok Zemin Kat Salon 2'de yapılacaktır."}
    ],
    phrase:{native:'Merhaba, yazılım atölyesine kayıt olmak istiyorum.',meaning:'Hello, I would like to register for the coding workshop.'},
    caution:'Demo content only. This is an illustrative notice, not a real workshop.'
  },
  ar: {
    sourceLang: 'tr-TR',
    headline:'خطوتك التالية نحو الإبداع تبدأ هنا.',
    summary:'هذا الإعلان التركي الافتراضي يدعوك إلى ورشة برمجة مجانية. توجد مهلة للتسجيل وموعد ومكان محددان وأشياء يجب إحضارها.',
    facts:[
      {label:'آخر موعد للتسجيل',value:'28 أكتوبر · 3:00 مساءً',source:"28 Ekim saat 15.00'e kadar"},
      {label:'موعد الورشة',value:'29 أكتوبر · 2:00 ظهرًا',source:"29 Ekim saat 14.00'te"},
      {label:'المكان',value:'المبنى B · الطابق الأرضي · القاعة 2',source:"B Blok Zemin Kat Salon 2'de"}
    ],
    steps:[
      {title:'املأ استمارة التسجيل',detail:'سجّل قبل 28 أكتوبر الساعة 3 مساءً. لا يحتوي الإعلان التجريبي على رابط للاستمارة.',source:"Kayıt için 28 Ekim saat 15.00'e kadar formu doldurunuz."},
      {title:'أحضر هويتك وحاسوبك المحمول',detail:'تأكد من وجودهما معك قبل المغادرة.',source:'Kimliğinizi ve dizüstü bilgisayarınızı getirmeyi unutmayınız.'},
      {title:'اذهب إلى الورشة',detail:'الموعد 29 أكتوبر الساعة 2 ظهرًا، المبنى B، الطابق الأرضي، القاعة 2.',source:"Atölye 29 Ekim saat 14.00'te B Blok Zemin Kat Salon 2'de yapılacaktır."}
    ],
    phrase:{native:'Merhaba, yazılım atölyesine kayıt olmak istiyorum.',meaning:'مرحبًا، أريد التسجيل في ورشة البرمجة.'},
    caution:'محتوى توضيحي فقط. هذا الإعلان افتراضي ولا يشير إلى ورشة حقيقية.'
  },
  tr: {
    sourceLang: 'tr-TR',
    headline:'Yeni bir şey üretmeye hazır mısın?',
    summary:'Bu örnek duyuru ücretsiz bir yazılım atölyesini anlatıyor. Kayıt son tarihi, etkinlik yeri ve getirmen gereken eşyalar aşağıda.',
    facts:[
      {label:'SON KAYIT',value:'28 Ekim · 15.00',source:"28 Ekim saat 15.00'e kadar"},
      {label:'ATÖLYE',value:'29 Ekim · 14.00',source:"29 Ekim saat 14.00'te"},
      {label:'YER',value:'B Blok · Zemin Kat · Salon 2',source:"B Blok Zemin Kat Salon 2'de"}
    ],
    steps:[
      {title:'Kayıt formunu doldur',detail:'28 Ekim saat 15.00’ten önce kayıt ol. Örnek duyuruda form bağlantısı yok.',source:"Kayıt için 28 Ekim saat 15.00'e kadar formu doldurunuz."},
      {title:'Kimliğini ve bilgisayarını hazırla',detail:'Çıkmadan önce ikisini de yanına al.',source:'Kimliğinizi ve dizüstü bilgisayarınızı getirmeyi unutmayınız.'},
      {title:'Atölyeye git',detail:'29 Ekim saat 14.00’te B Blok, zemin kat, Salon 2’de ol.',source:"Atölye 29 Ekim saat 14.00'te B Blok Zemin Kat Salon 2'de yapılacaktır."}
    ],
    phrase:{native:'Merhaba, yazılım atölyesine kayıt olmak istiyorum.',meaning:'Atölye görevlisine söyleyebileceğin yararlı bir cümle.'},
    caution:'Yalnızca tanıtım amaçlı örnek duyurudur; gerçek bir etkinlik değildir.'
  }
};

const state = { kind:'initial', image:'', text:'', plan:null, lastAction:null, evidence:[], toastTimer:null, lang:'en' };

function toast(message) {
  $('toast').textContent = message;
  $('toast').hidden = false;
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4500);
}

function view(name) {
  for (const key of ['empty','loading','error','plan']) $(`${key}-state`).hidden = key !== name;
}

function setSourceSample() {
  $('source-type').textContent = 'DEMO NOTICE';
  $('source-description').textContent = 'Explore a fictional Turkish workshop notice. Sample mode runs offline; custom content is interpreted by Gemma 4.';
  $('source-footnote').textContent = 'Sample notice invented for demonstration. Not an actual event announcement.';
  $('source-preview').className = 'original-content';
  $('source-preview').innerHTML = `<div class="original-kicker">ORIGINAL / TÜRKÇE</div><h3>ÜCRETSİZ YAZILIM ATÖLYESİ</h3><p>Kayıt için 28 Ekim saat 15.00'e kadar formu doldurunuz.</p><p>Atölye 29 Ekim saat 14.00'te B Blok Zemin Kat Salon 2'de yapılacaktır.</p><p>Kimliğinizi ve dizüstü bilgisayarınızı getirmeyi unutmayınız.</p>`;
  $('evidence-box').hidden = true;
}

function updateSource(kind, value) {
  $('evidence-box').hidden = true;
  $('source-footnote').textContent = kind === 'image' ? 'Your image is processed only for this request. Custom images are sent to the Gemini API; avoid private documents.' : 'Your text is processed only for this request. Custom text is sent to the Gemini API; avoid private documents.';
  $('source-description').textContent = 'Here is the original. KÖPRÜ turns it into actions while preserving its wording for verification.';
  if (kind === 'image') {
    $('source-type').textContent = 'UPLOADED IMAGE';
    $('source-preview').className = 'original-content is-image';
    $('source-preview').innerHTML = `<img src="${safe(value)}" alt="Your uploaded notice" />`;
  } else {
    $('source-type').textContent = 'PASTED TEXT';
    $('source-preview').className = 'original-content is-text';
    $('source-preview').textContent = value;
  }
}

function showSample(scroll = true) {
  state.kind = 'sample';
  state.plan = sample[state.lang];
  state.lastAction = null;
  setSourceSample();
  renderPlan(state.plan, 'INTERACTIVE SAMPLE');
  if (scroll) $('experience').scrollIntoView({ behavior:'smooth', block:'start' });
}

function evidenceControl(quote) {
  if (!quote) return '';
  const index = state.evidence.push(quote) - 1;
  return `<button type="button" class="evidence-btn" data-evidence="${index}" aria-label="Show original evidence">↗ View original wording</button>`;
}

function renderPlan(plan, mode) {
  state.plan = plan;
  state.evidence = [];
  $('mode-label').textContent = mode;
  const facts = (plan.facts || []).map(f => `<div class="fact"><span class="fact-label">${safe(f.label)}</span><span class="fact-value">${safe(f.value)}</span>${evidenceControl(f.source)}</div>`).join('');
  const steps = (plan.steps || []).map((s,i) => `<div class="step"><div class="step-number">${String(i+1).padStart(2,'0')}</div><div class="step-main"><h4>${safe(s.title)}</h4><p>${safe(s.detail)}</p>${evidenceControl(s.source)}</div></div>`).join('');
  const phrase = plan.phrase?.native ? `<div class="phrase-card"><div><small>YOUR SAY-IT CARD / TÜRKÇE OR ORIGINAL LANGUAGE</small><p class="phrase-native" lang="tr" dir="auto">${safe(plan.phrase.native)}</p><p class="phrase-meaning">${safe(plan.phrase.meaning)}</p></div><div class="phrase-actions"><button type="button" class="circle-btn" id="speak-btn" aria-label="Speak the useful phrase" title="Read aloud">◖))</button><button type="button" class="circle-btn" id="copy-btn" aria-label="Copy the useful phrase" title="Copy text">⧉</button></div></div>` : '';
  $('plan-state').setAttribute('dir', state.lang === 'ar' ? 'rtl' : 'ltr');
  $('plan-state').innerHTML = `<div class="plan-topline">✳ &nbsp; UNDERSTOOD WITH KÖPRÜ</div><h3 class="plan-headline">${safe(plan.headline)}</h3><p class="plan-summary">${safe(plan.summary)}</p>${facts ? `<div class="facts">${facts}</div>` : ''}<div class="steps-title">${steps ? 'YOUR NEXT STEPS' : 'NO RELIABLE STEPS EXTRACTED'}</div>${steps || `<p class="plan-summary">Try a clearer picture or paste the text.</p>`}${phrase}${plan.caution ? `<div class="caution">ⓘ ${safe(plan.caution)}</div>` : ''}`;
  view('plan');
}

async function analyze(kind, value, options = {}) {
  state.kind = kind;
  state.image = kind === 'image' ? value : '';
  state.text = kind === 'text' ? value : '';
  state.lastAction = { kind, value };
  updateSource(kind, value);
  $('mode-label').textContent = 'GEMMA 4 • WORKING';
  view('loading');
  if (!options.noScroll) $('experience').scrollIntoView({ behavior:'smooth', block:'start' });
  try {
    const response = await fetch('/api/interpret', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ lang:state.lang, image:kind === 'image' ? value : null, text:kind === 'text' ? value : null })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unknown model error');
    renderPlan(data.plan, 'LIVE • GEMMA 4');
  } catch (error) {
    $('mode-label').textContent = 'NEEDS ATTENTION';
    $('error-message').textContent = error.message || 'Please try again.';
    view('error');
  }
}

function uploadFile(file) {
  if (!file) return;
  if (!['image/png','image/jpeg','image/webp'].includes(file.type)) return toast('Choose a JPG, PNG or WebP image.');
  if (file.size > 4*1024*1024) return toast('That image is too large. Please choose one under 4 MB.');
  const reader = new FileReader();
  reader.onload = () => analyze('image',reader.result);
  reader.onerror = () => toast('Could not read the image.');
  reader.readAsDataURL(file);
}

$('upload-btn').addEventListener('click', () => $('file-input').click());
$('file-input').addEventListener('change', event => uploadFile(event.target.files?.[0]));
$('sample-btn').addEventListener('click', () => showSample());
$('empty-demo-btn').addEventListener('click', () => showSample());
$('text-toggle').addEventListener('click', () => {
  const panel = $('text-panel');
  panel.hidden = !panel.hidden;
  $('text-toggle').setAttribute('aria-expanded', String(!panel.hidden));
  if (!panel.hidden) $('text-input').focus();
});
$('analyze-text').addEventListener('click', () => {
  const content = $('text-input').value.trim();
  if (!content) return toast('Paste a short notice first.');
  analyze('text', content);
});
$('retry-btn').addEventListener('click', () => { if (state.lastAction) analyze(state.lastAction.kind, state.lastAction.value); });
$('language-select').addEventListener('change', event => {
  state.lang = event.target.value;
  if (state.kind === 'sample') return showSample(false);
  if ((state.kind === 'image' || state.kind === 'text') && state.lastAction) analyze(state.lastAction.kind, state.lastAction.value, { noScroll:true });
});
$('plan-state').addEventListener('click', async event => {
  const evidenceButton = event.target.closest('[data-evidence]');
  if (evidenceButton) {
    const quote = state.evidence[Number(evidenceButton.dataset.evidence)];
    if (!quote) return;
    $('evidence-text').textContent = quote;
    $('evidence-box').hidden = false;
    $('evidence-box').scrollIntoView({ behavior:'smooth', block:'nearest' });
  }
  if (event.target.closest('#copy-btn')) {
    try { await navigator.clipboard.writeText(state.plan.phrase.native); toast('Phrase copied!'); }
    catch { toast('Clipboard access is unavailable in this browser.'); }
  }
  if (event.target.closest('#speak-btn')) {
    if (!('speechSynthesis' in window)) return toast('Speech synthesis is unavailable in this browser.');
    const utterance = new SpeechSynthesisUtterance(state.plan.phrase.native);
    utterance.lang = state.plan.sourceLang || 'tr-TR'; utterance.rate = .9;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance);
  }
});
const dropZone = $('drop-zone');
for (const name of ['dragenter','dragover']) dropZone.addEventListener(name, event => { event.preventDefault(); dropZone.classList.add('dragging'); });
for (const name of ['dragleave','drop']) dropZone.addEventListener(name, event => { event.preventDefault(); dropZone.classList.remove('dragging'); });
dropZone.addEventListener('drop', event => uploadFile(event.dataTransfer?.files?.[0]));

fetch('/api/health').then(response => response.json()).then(status => {
  $('connection-label').textContent = status.connected ? 'Gemma 4 connected' : 'Sample mode ready';
}).catch(() => { $('connection-label').textContent = 'Sample mode ready'; });
