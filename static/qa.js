(() => {
  const FALLBACK_FAQS = [
    {
      id: 'availability',
      category: 'Products & availability',
      question: 'Which products are available to order?',
      answer: 'Bagged ice (2 kg, 3 kg, 5 kg where approved), 30 kg ice blocks, 300 ml and 500 ml ice cups, 330 ml and 500 ml bottled water, and purified water refills are listed in our catalogue. Availability and final pricing are confirmed by our team before fulfilment.',
      keywords: 'products,available,ice,water,blocks,cups,refills',
    },
    {
      id: 'bottled-water',
      category: 'Purified water & packaging',
      question: 'Why choose CoolerBox bottled water?',
      answer: 'CoolerBox supplies hygienically filled purified still bottled water in 330 ml and 500 ml packs for homes, businesses and events across Ongwediva and Northern Namibia.',
      keywords: 'why bottled water,purified,drinking water,330ml,500ml',
    },
    {
      id: 'funeral-events',
      category: 'Events & custom branding',
      question: 'Can I order bottled water for a funeral or celebration?',
      answer: 'Yes. We supply bulk bottled water and custom-labelled 500 ml event bottles for funerals, weddings, birthdays, anniversaries and corporate gatherings. Submit your event date, quantity and label wording through the Order / Quote form.',
      keywords: 'water for a funeral,funeral,wedding,birthday,event,personalised,custom label',
    },
    {
      id: 'storage',
      category: 'Storage & handling',
      question: 'How is ice and bottled water stored?',
      answer: 'Ice is stored frozen in dedicated insulated storage prior to collection or delivery. Bottled water is kept in clean, hygienic storage until dispatch. Storage and transport instructions are confirmed with your order.',
      keywords: 'how is it stored,storage,freezer,temperature,hygiene',
    },
    {
      id: 'combo-specials',
      category: 'Pricing & specials',
      question: 'Do you offer combo specials or bulk pricing?',
      answer: 'Bulk pricing is available on qualifying quantities, and seasonal or event packages can be quoted via our Event Calculator and Order form. All totals are estimates until confirmed by the CoolerBox team.',
      keywords: 'combo specials,bulk,discount,wholesale,price',
    },
    {
      id: 'hours-delivery',
      category: 'Collection & delivery',
      question: 'Where are you located and how do collection and delivery work?',
      answer: 'We are located at Shop 14, Makalani Mall, Ongwediva, Namibia. Orders require advance notice (typically 48–72 hours for bulk or custom branding), and scheduled deliveries or collection windows are confirmed by our team.',
      keywords: 'location,makalani mall,ongwediva,hours,delivery,collection',
    },
  ];

  const host = document.createElement('div');
  document.body.append(host);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>
    :host{font-family:Inter,Arial,Helvetica,sans-serif;color:#0b2b5b}
    *{box-sizing:border-box}
    button,input{font:inherit}
    button{cursor:pointer}
    button:focus-visible,input:focus-visible,a:focus-visible{outline:3px solid #006da6;outline-offset:2px}
    .launcher{position:fixed;bottom:18px;left:18px;background:#bdeaff;color:#0b2b5b;border:1px solid #6dbfe8;border-radius:40px;padding:12px 16px;min-height:44px;font-weight:700;font-size:13px;z-index:900;box-shadow:0 6px 22px rgba(11,43,91,0.18)}
    dialog{position:fixed;inset:auto auto 74px 18px;margin:0;width:min(390px,calc(100vw - 24px));max-width:calc(100vw - 24px);max-height:min(540px,calc(100dvh - 96px));border:1px solid #c5d3dd;border-radius:16px;padding:0;box-shadow:0 18px 60px rgba(11,43,91,0.28);color:#0b2b5b;background:#ffffff;overflow:hidden}
    dialog[open]{display:flex;flex-direction:column}
    dialog::backdrop{background:rgba(11,43,91,0.42)}
    .head{padding:14px 16px;background:#0b2b5b;color:#ffffff;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-shrink:0}
    .head strong{display:block;font-size:15px}
    .head small{display:block;margin-top:3px;color:#c7d5de;font-size:11.5px}
    .close{border:0;color:#ffffff;background:rgba(255,255,255,0.12);border-radius:8px;min-width:44px;min-height:44px;font-size:22px;line-height:1;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
    .inside{padding:14px;display:flex;flex-direction:column;gap:10px;min-height:0;flex:1;overflow:hidden}
    .log{flex:1;min-height:100px;overflow-y:auto;-webkit-overflow-scrolling:touch;display:flex;flex-direction:column;gap:10px;padding-right:2px}
    .reply,.question{font-size:14px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;padding:10px 12px;border-radius:10px;margin:0;background:#eff4f7;max-width:100%}
    .question{background:#dcefff;align-self:flex-end}
    .suggestions{display:flex;gap:6px;flex-wrap:wrap;flex-shrink:0}
    .suggestions button{background:#ffffff;border:1px solid #b6c7d2;border-radius:20px;padding:8px 12px;min-height:36px;font-size:12px;color:#0b2b5b}
    form{display:flex;gap:8px;flex-shrink:0;align-items:stretch}
    input{flex:1;min-width:0;padding:10px 12px;min-height:44px;border:1px solid #a4bac9;border-radius:8px;font-size:16px;background:#ffffff;color:#0b2b5b}
    form button{background:#006da6;color:#ffffff;border:0;border-radius:8px;padding:0 16px;min-height:44px;font-weight:700;font-size:14px;flex-shrink:0}
    .note{font-size:11px;line-height:1.4;color:#526c78;margin:0;flex-shrink:0}
    .links{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;color:#006da6;flex-shrink:0}
    .links a{color:#006da6;text-decoration:underline;min-height:28px;display:inline-flex;align-items:center}
    @media(max-width:600px){
      .launcher{bottom:12px;left:12px;padding:10px 14px;font-size:12.5px}
      dialog{inset:10px 10px auto 10px;width:calc(100vw - 20px);max-width:calc(100vw - 20px);max-height:calc(100dvh - 20px)}
    }
  </style>
  <button class="launcher" type="button" aria-haspopup="dialog">Q&amp;A · Ask CoolerBox</button>
  <dialog aria-labelledby="qa-title">
    <div class="head">
      <div><strong id="qa-title">Ask CoolerBox</strong><small>Quick answers to common questions</small></div>
      <button class="close" type="button" aria-label="Close Q&A">&times;</button>
    </div>
    <div class="inside">
      <div class="log" role="log" aria-live="polite" aria-relevant="additions">
        <p class="reply">Hello. Ask about bagged ice, 30 kg blocks, ice cups, bottled water, custom branding, refills or delivery.</p>
      </div>
      <div class="suggestions">
        <button type="button">Why bottled water?</button>
        <button type="button">Water for a funeral?</button>
        <button type="button">How is it stored?</button>
        <button type="button">Combo specials</button>
      </div>
      <form>
        <input aria-label="Your question" placeholder="Type your question…" maxlength="300" required>
        <button type="submit">Ask</button>
      </form>
      <p class="note">Answers reflect published website details. Orders, stock and prices require team confirmation.</p>
      <div class="links">
        <a href="/products">Products</a>
        <a href="/questions">All Q&amp;A</a>
        <a href="/contact">Send Enquiry</a>
        <a href="https://wa.me/264852485426" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
  </dialog>`;

  const $ = s => root.querySelector(s);
  const dialog = $('dialog');
  const input = $('input');
  const log = $('.log');
  let savedScrollY = 0;

  function syncViewportHeight() {
    if (!dialog.open) return;
    if (window.visualViewport && window.innerWidth <= 600) {
      dialog.style.maxHeight = Math.max(260, Math.floor(window.visualViewport.height - 20)) + 'px';
    } else {
      dialog.style.maxHeight = '';
    }
    log.scrollTop = log.scrollHeight;
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncViewportHeight);
  }

  $('.launcher').onclick = () => {
    savedScrollY = window.scrollY;
    dialog.showModal();
    syncViewportHeight();
    input.focus();
  };

  $('.close').onclick = () => dialog.close();
  dialog.addEventListener('close', () => {
    dialog.style.maxHeight = '';
    window.scrollTo({ top: savedScrollY, behavior: 'instant' });
    $('.launcher').focus();
  });

  const normalize = value =>
    String(value || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  let faqCache = null;
  let faqLoadedAt = 0;

  async function loadFaqs() {
    if (faqCache && Date.now() - faqLoadedAt < 30000) return faqCache;
    try {
      const r = await fetch('/api/faqs');
      if (!r.ok) throw Error();
      const raw = await r.text();
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length) {
        faqCache = parsed;
        faqLoadedAt = Date.now();
        return faqCache;
      }
    } catch {
      // Fall back to approved static FAQs if network/API is temporarily unavailable
    }
    return FALLBACK_FAQS;
  }

  function matchFaq(question, rows) {
    const q = normalize(question);
    let best = null;
    let score = 0;
    const stop = new Set([
      'what', 'which', 'where', 'when', 'how', 'why', 'your', 'you', 'our',
      'the', 'and', 'can', 'are', 'for', 'does', 'with', 'that', 'this', 'water',
    ]);
    for (const row of rows) {
      let s = normalize(row.question) === q ? 1000 : 0;
      const keys = String(row.keywords || '').split(',');
      for (const key of keys) {
        const k = normalize(key);
        if (k && (' ' + q + ' ').includes(' ' + k + ' ')) s = Math.max(s, 20 + k.length);
      }
      const words = normalize(row.question).split(' ').filter(w => w.length > 2 && !stop.has(w));
      const matches = words.filter(w => (' ' + q + ' ').includes(' ' + w + ' ')).length;
      if (matches >= 2) s = Math.max(s, matches * 5);
      if (s > score) {
        score = s;
        best = row;
      }
    }
    return best;
  }

  async function answer(question) {
    const q = normalize(question);
    if (/^(hi|hello|hey|good morning|good afternoon)$/.test(q)) {
      return 'Hello. Ask about bottled water, event supply, products, prices or collection.';
    }
    try {
      const rows = await loadFaqs();
      const best = matchFaq(q, rows);
      if (!best) {
        return 'That answer has not been confirmed on the website. Please use Send Enquiry (/contact) or WhatsApp +264 85 248 5426, or browse /questions.';
      }
      if (best.id === 'upcoming') {
        try {
          const r = await fetch('/api/posts');
          if (r.ok) {
            const posts = await r.json();
            const today = new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Africa/Windhoek', year: 'numeric', month: '2-digit', day: '2-digit',
            }).format(new Date());
            const events = posts
              .filter(p => p.category === 'events' && p.eventDate >= today)
              .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
            if (events.length) {
              return events.slice(0, 3).map(p => p.title + ' — ' + p.eventDate + (p.location ? ' · ' + p.location : '')).join('\n\n');
            }
          }
        } catch {}
        return 'No upcoming events have been published yet. Check News & Community for new announcements.';
      }
      return best.answer;
    } catch {
      return 'Answers are temporarily unavailable. Please use Send Enquiry on /contact or WhatsApp +264 85 248 5426.';
    }
  }

  function bubble(text, cls) {
    const p = document.createElement('p');
    p.className = cls;
    p.textContent = text;
    log.append(p);
    log.scrollTop = log.scrollHeight;
    return p;
  }

  async function ask(text) {
    if (!text.trim()) return;
    input.value = '';
    bubble(text, 'question');
    const reply = bubble('Checking…', 'reply');
    reply.textContent = await answer(text);
    log.scrollTop = log.scrollHeight;
  }

  $('form').onsubmit = e => {
    e.preventDefault();
    ask(input.value);
  };
  root.querySelectorAll('.suggestions button').forEach(b => {
    b.onclick = () => ask(b.textContent);
  });
})();
