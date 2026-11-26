<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Enquiry Status | CoolerBox Ice Hub</title>
  <meta name="description" content="Check your CoolerBox Ice Hub enquiry or order status. Ongwediva, Namibia.">
  <link rel="stylesheet" href="/home-base.css">
  <link rel="stylesheet" href="/premium.css">
  <link rel="stylesheet" href="/commerce.css">
  <link rel="stylesheet" href="/community.css">
  <link rel="stylesheet" href="/ice-company.css">
  <link rel="icon" type="image/jpeg" href="/assets/logo-symbol-blue.jpeg">
</head>
<body class="premium-page">
  <!-- Top Bar -->
  <div class="site-top-bar">
    <div class="site-top-inner">
      <div class="top-bar-location">
        <span>📍 Makalani Mall · Ongwediva, Namibia</span>
      </div>
      <div class="top-bar-contact">
        <a href="mailto:info@coolerboxicehub.com">✉ info@coolerboxicehub.com</a>
        <a href="https://wa.me/264852485426" target="_blank" rel="noopener">💬 WhatsApp +264 85 248 5426</a>
      </div>
    </div>
  </div>

  <!-- Header Navigation -->
  <header class="site-header">
    <div class="site-nav-container">
      <a class="site-brand" href="/" aria-label="CoolerBox Ice Hub Home">
        <img class="brand-logo" src="/assets/logo-primary.jpeg" alt="The CoolerBox — Ice, Water, Refreshment">
      </a>
      <ul class="site-nav-menu">
        <li><a class="site-nav-link" href="/">Home</a></li>
        <li><a class="site-nav-link" href="/products">Products</a></li>
        <li><a class="site-nav-link" href="/services">Business &amp; Events</a></li>        <li><a class="site-nav-link" href="/contact">Contact</a></li>
        <li><a class="site-nav-link" href="/express">Express</a></li>
      </ul>
      <a class="btn-header-order" href="/order">Order Now ↗</a>
      <button class="mobile-menu-toggle" id="menu-btn" aria-label="Toggle navigation">☰</button>
    </div>
    <div class="mobile-drawer" id="mobile-drawer">
      <a href="/">Home</a>
      <a href="/products">Products</a>
      <a href="/services">Business &amp; Events</a>      <a href="/contact">Contact</a>
      <a href="/express">Express</a>
      <a href="/order" style="color:var(--cb-cyan);font-weight:700">Order Now ↗</a>
    </div>
  </header>

  <main class="wrap" style="padding-top:40px;padding-bottom:80px;min-height:75vh">
    <section class="page-hero">
      <div class="eyebrow">ORDER REFERENCE LOOKUP</div>
      <h1>Enquiry Status Lookup</h1>
      <p>Enter your CoolerBox reference (e.g. <strong>CBX-2610-1042</strong>) to view quotation status, availability confirmation, and production milestones.</p>
    </section>

    <div style="background:var(--surface,#ffffff);border:1px solid var(--border,#d4e3eb);border-radius:18px;padding:32px;box-shadow:0 10px 30px rgba(11,43,91,0.06);margin-bottom:40px">
      <form id="track-search" style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">
        <div style="flex:1;min-width:280px">
          <label for="track-reference" style="display:block;font-weight:700;margin-bottom:8px;font-size:14px;color:#0b2b5b">Enquiry Reference Number</label>
          <input id="track-reference" type="text" placeholder="e.g. CBX-2610-8492" style="width:100%;padding:14px 18px;border:1px solid #c2d6e3;border-radius:10px;font-size:16px;text-transform:uppercase" required>
        </div>
        <button class="btn" type="submit" style="padding:15px 28px;height:52px">Find enquiry ↗</button>
        <button id="track-refresh" class="btn outline" type="button" style="padding:15px 22px;height:52px">Refresh</button>
        <button id="track-read" class="btn outline" type="button" style="padding:15px 22px;height:52px">Mark notifications read</button>
      </form>
      <p id="track-status" style="margin-top:14px;font-weight:600;color:#0b2b5b" role="status"></p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:28px">
      <section>
        <div class="eyebrow" style="margin-bottom:12px">STATUS &amp; MILESTONES</div>
        <div id="track-orders" style="display:flex;flex-direction:column;gap:18px">
          <p style="color:#64748b">Enter your reference above to inspect your order details.</p>
        </div>
      </section>

      <section>
        <div class="eyebrow" style="margin-bottom:12px">RECENT NOTIFICATIONS</div>
        <div id="track-updates" style="display:flex;flex-direction:column;gap:14px">
          <p style="color:#64748b">Updates from the CoolerBox team will appear here.</p>
        </div>
      </section>
    </div>
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-col footer-col-brand">
        <div class="footer-brand-card">
          <img class="footer-logo" src="/assets/logo-primary.jpeg" alt="The CoolerBox — Ice, Water, Refreshment">
          <p>Your premier pure ice manufacturer, purified bottled water supplier, and reliable refreshment partner in Ongwediva, Namibia.</p>
        </div>
      </div>
      <div class="footer-col">
        <h4>Products &amp; Ice</h4>
        <ul>
          <li><a href="/products">2 kg Pure Ice Bags</a></li>
          <li><a href="/products">5 kg Gourmet Ice</a></li>
          <li><a href="/products">Slow-Melt Block Ice</a></li>
          <li><a href="/products">Purified Bottled Water</a></li>
          <li><a href="/products">Personalised Label Water</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Solutions &amp; Support</h4>
        <ul>
          <li><a href="/services">Business &amp; Event Supply</a></li>          <li><a href="/services">Event &amp; Wedding Supply</a></li>
          <li><a href="/services">Bulk Ice &amp; Water Orders</a></li>
          <li><a href="/supplier">Become a Local Reseller</a></li>
          <li><a href="/contact">Get a Formal Quotation</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact &amp; Location</h4>
        <div class="footer-contact-info">
          <p>📍 Shop 14, Makalani Mall<br>Ongwediva, Oshana Region, Namibia</p>
          <p>✉ <a href="mailto:info@coolerboxicehub.com">info@coolerboxicehub.com</a></p>
          <p>💬 <a href="https://wa.me/264852485426" target="_blank" rel="noopener">WhatsApp: +264 85 248 5426</a></p>
          <p>🕒 Mon – Sat: 08:00 – 19:00<br>Sun &amp; Public Holidays: 09:00 – 15:00</p>
        </div>
      </div>
    </div>
    <div class="footer-bottom-bar">
      <span>&copy; The CoolerBox Ice Hub. All rights reserved. Makalani Mall, Ongwediva, Namibia.</span>
      <div style="display:flex;gap:16px">
        <a href="mailto:info@coolerboxicehub.com">Email Us</a>
        <a href="/privacy">Privacy Policy</a>
      </div>
    </div>
  </footer>

  <script src="/commerce-ui.js"></script>
  <script src="/track.js"></script>
  <script src="/qa.js"></script>
  <script src="/contacts.js"></script>
  <script src="/catalogue-link.js"></script>
  <script src="/specials.js"></script>
  <script src="/premium.js"></script>
  <script>
    const menuBtn = document.getElementById('menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (menuBtn && drawer) {
      menuBtn.addEventListener('click', () => { drawer.classList.toggle('open'); });
    }
  </script>
</body>
</html>
