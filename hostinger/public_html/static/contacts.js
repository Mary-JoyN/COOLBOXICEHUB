(() => {
  let settings = null;

  function formatWaText(wa) {
    if (!wa) return '+264 85 248 5426';
    const digits = wa.replace(/\D/g, '');
    if (digits.startsWith('264') && digits.length >= 11) {
      return `+264 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
    return '+' + digits;
  }

  function syncSiteContacts(data) {
    if (!data) return;
    const waNum = data.whatsapp || '264852485426';
    const phoneNum = data.phone || formatWaText(waNum);
    const emailAddr = data.email || 'info@coolerboxicehub.com';

    // Update all WhatsApp links
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
      a.href = `https://wa.me/${waNum}`;
      if (a.textContent.includes('WhatsApp')) {
        a.textContent = `💬 WhatsApp ${formatWaText(waNum)}`;
      } else if (/\+?264\s*\d+/.test(a.textContent)) {
        a.textContent = formatWaText(waNum);
      }
    });

    // Update all Phone tel: links
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      const cleanPhone = phoneNum.replace(/\s+/g, '');
      a.href = `tel:${cleanPhone}`;
      if (a.textContent.includes('Phone:')) {
        a.textContent = `📞 Phone: ${phoneNum}`;
      } else if (/\+?264\s*\d+/.test(a.textContent)) {
        a.textContent = phoneNum;
      }
    });

    // Update mailto: links
    if (emailAddr) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
        if (!a.href.includes('?')) {
          a.href = `mailto:${emailAddr}`;
          if (a.textContent.includes('@')) {
            a.textContent = `✉ ${emailAddr}`;
          }
        }
      });
    }
  }

  const ready = fetch('/api/settings')
    .then(async r => {
      if (!r.ok) throw Error();
      return r.json();
    })
    .then(data => {
      settings = data;
      render();
      syncSiteContacts(data);
      return data;
    })
    .catch(() => {
      const n = document.getElementById('contact-links');
      if (n) n.textContent = 'Contact details could not be loaded. Please refresh.';
      return null;
    });

  const labels = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
  };

  function render() {
    if (!settings) return;
    const target = document.getElementById('contact-links');
    if (target) {
      target.replaceChildren();
      for (const [text, href] of [
        [settings.email, 'mailto:' + settings.email],
        ['WhatsApp ' + formatWaText(settings.whatsapp), 'https://wa.me/' + settings.whatsapp],
      ]) {
        const a = document.createElement('a');
        a.textContent = text + ' ↗';
        a.href = href;
        if (href.startsWith('https:')) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
        target.append(a);
      }
    }

    const social = document.getElementById('social-links');
    if (social && settings.socials) {
      social.replaceChildren();
      for (const [key, label] of Object.entries(labels)) {
        const url = settings.socials[key];
        if (!url) continue;
        const a = document.createElement('a');
        a.textContent = label + ' ↗';
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.cssText = 'border:1px solid #55707b;border-radius:20px;padding:9px 13px;font-size:12px;';
        social.append(a);
      }
      if (!social.children.length) {
        const note = document.createElement('span');
        note.textContent = 'Social pages coming soon.';
        note.style.cssText = 'font-size:11px;color:#adc4d4';
        social.append(note);
      }
    }
  }

  async function links(prefix, message) {
    const data = settings || (await ready);
    if (!data) return;
    const mail = document.getElementById(prefix + '-email');
    const wa = document.getElementById(prefix + '-whatsapp');
    if (!mail || !wa) return;
    mail.href =
      'mailto:' +
      encodeURIComponent(data.email) +
      '?subject=' +
      encodeURIComponent('CoolerBox ' + (prefix === 'bulk' ? 'bulk supply enquiry' : 'product enquiry') + ' — website sample') +
      '&body=' +
      encodeURIComponent(message);
    wa.href = 'https://wa.me/' + data.whatsapp + '?text=' + encodeURIComponent(message);
  }

  const general = document.getElementById('order-form');
  if (general) {
    general.addEventListener('submit', () => {
      queueMicrotask(() => {
        if (document.getElementById('result').hidden) return;
        document.getElementById('enquiry-send-actions').hidden = false;
        links('enquiry', document.getElementById('message').value);
      });
    });
    document.querySelectorAll('[data-order]').forEach(b =>
      b.addEventListener('click', () => (document.getElementById('enquiry-send-actions').hidden = true))
    );
  }

  const bulk = document.getElementById('bulk-form');
  if (bulk) {
    bulk.addEventListener('submit', () =>
      queueMicrotask(() => {
        if (document.getElementById('bulk-draft').hidden) return;
        links('bulk', document.getElementById('bulk-draft-message').value);
      })
    );
  }
})();

