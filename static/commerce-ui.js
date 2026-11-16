window.CB = {
  uid() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'cbx-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  },
  productGroup(id) {
    return ['water', 'water330', 'refill'].includes(id)
      ? 'Purified drinking water'
      : ['slushies', 'icelollies'].includes(id)
        ? 'Cold refreshments'
        : 'Ice products';
  },
  earliestDate(lead, cutoff) {
    const now = new Date();
    const date = this.today();
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Windhoek',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(now);
    const d = new Date(date + 'T12:00:00+02:00');
    d.setUTCDate(d.getUTCDate() + lead + (cutoff && time >= cutoff ? 1 : 0));
    return d.toISOString().slice(0, 10);
  },
  node(tag, text, cls) {
    const n = document.createElement(tag);
    if (text !== undefined && text !== null) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  },
  async api(url, options) {
    let r;
    try {
      r = await fetch(url, options);
    } catch {
      throw Error('Unable to connect right now. Please check your connection or contact us on WhatsApp (+264 85 248 5426).');
    }
    const raw = await r.text();
    let d = null;
    if (raw && raw.trim() !== '') {
      try {
        d = JSON.parse(raw);
      } catch {
        d = null;
      }
    }
    if (!r.ok) {
      const msg = (d && (d.error || d.detail || d.message)) || `Server returned ${r.status}. Please try again or contact us on WhatsApp.`;
      throw Error(msg);
    }
    if (d === null) {
      throw Error('We could not read the server response. Please refresh and try again.');
    }
    return d;
  },
  money(n) {
    return 'N$' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  today() {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Windhoek',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  },
  async upload(file) {
    if (!file) return null;
    if (file.size > 5000000) throw Error('Use a JPG, PNG or WebP image smaller than 5 MB.');
    const f = new FormData();
    f.append('file', file);
    return (await this.api('/api/images', { method: 'POST', body: f })).url;
  },
  active(p) {
    return p.type === 'promotion' && p.status === 'published' && (!p.expires || p.expires >= this.today());
  },
  price(p, q, iceType) {
    const retail = iceType === 'gourmet' ? (p.gourmetRetailPrice ?? null) : p.retailPrice;
    const bulk = iceType === 'gourmet' ? (p.gourmetBulkPrice ?? null) : p.bulkPrice;
    return q >= p.bulkMinimum && bulk !== null ? bulk : retail;
  },
};
