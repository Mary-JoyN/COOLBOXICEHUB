(async () => {
  const $ = id => document.getElementById(id);
  const { node: n } = CB;
  const FALLBACK_FAQS = [
    {
      id: 'availability',
      category: 'Products & availability',
      question: 'Which products are available to order?',
      answer: 'Bagged ice, 30 kg ice blocks, 300 ml and 500 ml ice cups, 330 ml and 500 ml bottled water, and purified water refills are listed in our catalogue. Availability and final pricing are confirmed by our team.',
      keywords: 'products,available,ice,water,blocks,cups,refills',
    },
    {
      id: 'hours-delivery',
      category: 'Collection & delivery',
      question: 'Where are you located and how do collection and delivery work?',
      answer: 'Shop 14, Makalani Mall, Ongwediva, Namibia. Orders require advance notice, and collection or delivery windows are confirmed by our team.',
      keywords: 'location,makalani mall,ongwediva,hours,delivery,collection',
    },
  ];
  let rows = [];

  function render() {
    const q = ($('faq-search')?.value || '').trim().toLowerCase();
    const list = $('faq-list');
    if (!list) return;
    list.replaceChildren();
    let current = '';
    let count = 0;
    for (const row of rows) {
      if (q && !(row.question + ' ' + row.answer + ' ' + (row.keywords || '')).toLowerCase().includes(q)) continue;
      count++;
      if (row.category !== current) {
        current = row.category;
        const h = n('h2', current);
        h.style.cssText = 'font-size:25px;text-align:left;margin:30px 0 12px';
        list.append(h);
      }
      const d = n('details');
      const summary = n('summary', row.question);
      const ans = n('p', row.answer);
      ans.style.whiteSpace = 'pre-line';
      d.append(summary, ans);
      d.open = !!q;
      list.append(d);
    }
    if ($('faq-status')) {
      $('faq-status').textContent = count
        ? (q ? count + ' matching answers' : '')
        : 'No matching answer. Try another search or contact us via Send Enquiry.';
    }
  }

  try {
    const loaded = await CB.api('/api/faqs');
    rows = Array.isArray(loaded) && loaded.length ? loaded : FALLBACK_FAQS;
  } catch {
    rows = FALLBACK_FAQS;
    if ($('faq-status')) {
      $('faq-status').textContent = 'Showing core FAQs. For specific enquiries, please use Send Enquiry or WhatsApp.';
    }
  }
  const groups = [...new Set(rows.map(r => r.category))];
  rows.sort((a, b) => groups.indexOf(a.category) - groups.indexOf(b.category));
  render();
  if ($('faq-search')) $('faq-search').oninput = render;
})();
