<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#0b2b5b">
  <title>The CoolerBox Ice Hub | Ice, Bottled Water & Refills in Ongwediva</title>
  <meta name="description"
    content="Trusted supplier of purified gourmet ice, ice blocks, crushed ice, bottled water (500ml, 1.5L, 5L) and water refills at Makalani Mall, Ongwediva.">
  <link rel="icon" type="image/jpeg" href="/assets/logo-symbol-blue.jpeg">
  <link rel="preconnect" href="https://maps.google.com">
  <link rel="preconnect" href="https://maps.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="https://maps.google.com">
  <link rel="stylesheet" href="/ice-company.css">
</head>

<body>
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
        <img src="/assets/logo-primary.jpeg" alt="The CoolerBox — Ice, Water, Refreshment">
      </a>
      <ul class="site-nav-menu">
        <li><a class="site-nav-link active" href="/">Home</a></li>
        <li><a class="site-nav-link" href="/products">Products</a></li>
        <li><a class="site-nav-link" href="/order#calculator">Event Calculator</a></li>
        <li><a class="site-nav-link" href="/services">Business &amp; Events</a></li>
        <li><a class="site-nav-link" href="/#about">About</a></li>
        <li><a class="site-nav-link" href="/contact">Contact</a></li>
      </ul>
      <a class="btn-header-order" href="/order">Order / Quote ↗</a>
      <button class="mobile-menu-toggle" id="menu-btn" aria-label="Toggle navigation" aria-expanded="false">☰</button>
    </div>
    <div class="mobile-drawer" id="mobile-drawer">
      <a class="active" href="/">Home</a>
      <a href="/products">Products</a>
      <a href="/order#calculator">Event Calculator</a>
      <a href="/services">Business &amp; Events</a>
      <a href="/#about">About</a>
      <a href="/contact">Contact</a>
      <a href="/order" style="color:var(--cb-cyan);font-weight:700">Order / Quote ↗</a>
    </div>
  </header>

  <!-- Ice Cubes Dropping in Water Hero Section -->
  <section class="hero-video-banner">
    <div class="hero-video-overlay" style="z-index:1"></div>
    <canvas id="hero-ice-canvas" class="hero-video-bg" style="opacity:0.95;z-index:2;pointer-events:none" aria-hidden="true"></canvas>
    <div class="hero-content-wrap">
      <span class="hero-pill-tag">ICE · BOTTLED WATER · WATER REFILLS</span>
      <h1>
        Ice. Water.
        <em>Stay Cooler.</em>
      </h1>
      <p class="hero-subtitle">
        Your local source of ice, bottled water and water refills in Ongwediva. From everyday purchases to bulk orders, The CoolerBox serves homes, businesses and events.
      </p>
      <div class="hero-cta-group">
        <a class="btn-hero-primary" href="/products">View Our Products ↗</a>        <a class="btn-hero-outline" href="/contact">Send an Enquiry ✉</a>
      </div>
    </div>
  </section>

  <!-- Main Content -->
  <main class="content-section">
    <!-- 2. Popular Products & Event Calculator Entry (L02) -->
    <section id="popular-products" style="margin-bottom:56px">
      <div class="section-header-centered">
        <span class="section-pre-title">POPULAR PRODUCTS</span>
        <h2>Ice, Bottled Water &amp; Refills</h2>
        <p>Select a product to view pack sizes and price bases, or estimate quantities for your event.</p>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin-bottom:22px">
        <div style="background:#fff;border:1px solid var(--cb-border);border-radius:14px;padding:20px;box-shadow:var(--cb-shadow-sm)">
          <strong style="color:var(--cb-navy);font-size:17px;display:block;margin-bottom:6px">Bagged Ice (2 kg · 3 kg · 5 kg)</strong>
          <p style="color:var(--cb-text-muted);font-size:14px;margin:0 0 10px">Clean ice for drinks, cooler boxes, bucket cooling and ice baths. From N$15.00 retail (2 kg).</p>
          <a href="/order?product=ice" style="color:var(--cb-cyan);font-weight:700;font-size:14px;text-decoration:none">Request Enquiry ↗</a>
        </div>
        <div style="background:#fff;border:1px solid var(--cb-border);border-radius:14px;padding:20px;box-shadow:var(--cb-shadow-sm)">
          <strong style="color:var(--cb-navy);font-size:17px;display:block;margin-bottom:6px">30 kg Ice Blocks</strong>
          <p style="color:var(--cb-text-muted);font-size:14px;margin:0 0 10px">Whole 30 kg blocks for long-lasting cooling and events. N$45.00 retail / N$40.00 bulk.</p>
          <a href="/order?product=blocks" style="color:var(--cb-cyan);font-weight:700;font-size:14px;text-decoration:none">Request Enquiry ↗</a>
        </div>
        <div style="background:#fff;border:1px solid var(--cb-border);border-radius:14px;padding:20px;box-shadow:var(--cb-shadow-sm)">
          <strong style="color:var(--cb-navy);font-size:17px;display:block;margin-bottom:6px">Ice Cups (300 ml · 500 ml)</strong>
          <p style="color:var(--cb-text-muted);font-size:14px;margin:0 0 10px">Ready-filled ice cups—just pour your own drink. N$10.00 (300 ml) / N$12.00 (500 ml).</p>
          <a href="/order?product=cups" style="color:var(--cb-cyan);font-weight:700;font-size:14px;text-decoration:none">Request Enquiry ↗</a>
        </div>
        <div style="background:#fff;border:1px solid var(--cb-border);border-radius:14px;padding:20px;box-shadow:var(--cb-shadow-sm)">
          <strong style="color:var(--cb-navy);font-size:17px;display:block;margin-bottom:6px">Bottled Water &amp; Refills</strong>
          <p style="color:var(--cb-text-muted);font-size:14px;margin:0 0 10px">330 ml (N$9) &amp; 500 ml (N$12) still water, plus 25 L refills (N$25 retail / N$20 bulk).</p>
          <a href="/order?product=water" style="color:var(--cb-cyan);font-weight:700;font-size:14px;text-decoration:none">Request Enquiry ↗</a>
        </div>
      </div>
      <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:14px">
        <a class="btn-hero-primary" href="/products" style="padding:12px 24px;font-size:14px">View All Products &amp; Prices ↗</a>
        <a class="btn-hero-outline" href="/order#calculator" style="color:var(--cb-navy);background:var(--cb-ice-white);border-color:#b8d3ea;padding:12px 24px;font-size:14px">Open Event Calculator ↗</a>
      </div>
    </section>

    <!-- 3. How to Order (L02) -->
    <section style="background:#ffffff;border:1px solid var(--cb-border);border-radius:var(--cb-radius-md);padding:34px 32px;margin-bottom:56px;box-shadow:var(--cb-shadow-sm)">
      <span class="section-pre-title">HOW TO ORDER</span>
      <h2 style="font-family:var(--cb-font-heading);font-size:26px;color:var(--cb-navy);margin:0 0 18px">Three Simple Steps</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:18px">
        <div><strong style="color:var(--cb-navy)">1. Choose Products or Estimate</strong><p style="color:var(--cb-text-muted);font-size:14px;margin:6px 0 0">Pick exact products or use the Event Calculator for guest-based estimates.</p></div>
        <div><strong style="color:var(--cb-navy)">2. Submit Enquiry &amp; Get Reference</strong><p style="color:var(--cb-text-muted);font-size:14px;margin:6px 0 0">Receive a unique reference immediately. Submitting an enquiry does not lock stock yet.</p></div>
        <div><strong style="color:var(--cb-navy)">3. Team Confirmation &amp; Fulfilment</strong><p style="color:var(--cb-text-muted);font-size:14px;margin:6px 0 0">We confirm availability, final pricing, payment and collection or delivery arrangements.</p></div>
      </div>
    </section>

    <!-- 4 & 5. Custom Branding & Business Partner Programme (B01, B03) -->
    <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px;margin-bottom:56px">
      <div style="background:#ffffff;border:1px solid var(--cb-border);border-radius:var(--cb-radius-md);padding:30px;box-shadow:var(--cb-shadow-sm)">
        <span class="section-pre-title">CUSTOM EVENT BRANDING</span>
        <h3 style="font-family:var(--cb-font-heading);font-size:22px;color:var(--cb-navy);margin:0 0 10px">Personalised Bottled Water</h3>
        <p style="color:var(--cb-text-muted);font-size:15px;line-height:1.6;margin:0 0 16px">Select bottle size, supply wording or artwork, approve your design proof, complete payment and schedule production.</p>
        <a class="btn-hero-primary" href="/services#custom-branding" style="padding:10px 20px;font-size:14px">Explore Custom Branding ↗</a>
      </div>
      <div style="background:#ffffff;border:1px solid var(--cb-border);border-radius:var(--cb-radius-md);padding:30px;box-shadow:var(--cb-shadow-sm)">
        <span class="section-pre-title">BUSINESS PARTNER PROGRAMME</span>
        <h3 style="font-family:var(--cb-font-heading);font-size:22px;color:var(--cb-navy);margin:0 0 10px">Become a CoolerBox Stockist</h3>
        <p style="color:var(--cb-text-muted);font-size:15px;line-height:1.6;margin:0 0 16px">Supply-only and approved freezer-placement partnerships for shops, service stations, hotels, guesthouses and bars, subject to terms and availability.</p>
        <a class="btn-hero-outline" href="/order?supplier=1" style="color:var(--cb-navy);background:var(--cb-ice-white);border-color:#b8d3ea;padding:10px 20px;font-size:14px">Join Our Business Partner Programme ↗</a>
      </div>
    </section>

    <!-- 6 & 7. Quality & About The CoolerBox Ice Hub cc (B05, P03) -->
    <div id="about" style="background:#ffffff;border:1px solid var(--cb-border);border-radius:var(--cb-radius-md);padding:44px 40px;margin-bottom:60px;box-shadow:var(--cb-shadow-sm)">
      <div class="story-hub-grid">
        <div>
          <span class="section-pre-title">ABOUT THE COOLERBOX ICE HUB CC</span>
          <h2 style="font-family:var(--cb-font-heading);font-size:clamp(26px, 3.2vw, 36px);color:var(--cb-navy);margin:0 0 16px;line-height:1.25">
            Your Neighbourhood Ice &amp; Refreshment Hub in Ongwediva.
          </h2>
          <p style="color:var(--cb-text-muted);font-size:16px;line-height:1.7;margin:0 0 14px">
            <strong>Vision:</strong> To become Northern Namibia’s trusted choice for ice and purified water, serving households, businesses and events with consistent quality and dependable supply.
          </p>
          <p style="color:var(--cb-text-muted);font-size:16px;line-height:1.7;margin:0 0 14px">
            <strong>Mission:</strong> To produce and supply quality ice and purified water at fair prices, with convenient ordering, reliable service and personalised branding, while creating local employment and supporting business partnerships.
          </p>
          <p style="color:var(--cb-text-muted);font-size:15px;line-height:1.65;margin:0 0 22px">
            <strong>Quality &amp; Values:</strong> Consistency, fair pricing, quality, convenience and credibility guide our daily operations at Shop 14, Makalani Mall—backed by clean handling and hygienic packaging. Planned student attachments and community initiatives will be announced once active.
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:14px">
            <a class="btn-hero-primary" href="/products" style="padding:12px 24px;font-size:14px">View Product Catalogue ↗</a>
            <a class="btn-hero-outline" href="/services" style="color:var(--cb-navy);background:var(--cb-ice-white);border-color:#b8d3ea;padding:12px 24px;font-size:14px">Business &amp; Event Supply ↗</a>
          </div>
        </div>
        <div class="story-hub-image-wrap" style="border-radius:var(--cb-radius-md);overflow:hidden;box-shadow:0 10px 26px rgba(0,79,132,0.12);border:1px solid var(--cb-border)">
          <img src="/assets/coolerbox-cool-starts-here.jpg" alt="The CoolerBox Ice Hub cc storefront display" style="width:100%;height:100%;object-fit:cover;max-height:340px;display:block" loading="lazy">
        </div>
      </div>
    </div>

    <!-- Location & Google Map Section (Makalani Mall, Ongwediva) -->
    <div style="background:#ffffff;border:1px solid var(--cb-border);border-radius:var(--cb-radius-md);padding:44px 40px;margin-bottom:60px;box-shadow:var(--cb-shadow-sm)">
      <div class="hub-map-grid">
        <div>
          <span class="section-pre-title">VISIT OUR HUB</span>
          <h2 style="font-family:var(--cb-font-heading);font-size:clamp(26px, 3.2vw, 36px);color:var(--cb-navy);margin:0 0 16px;line-height:1.25">
            Find Your Cool at Makalani Mall, Ongwediva.
          </h2>
          <p style="color:var(--cb-text-muted);font-size:16px;line-height:1.7;margin:0 0 22px">
            Drop by our shop to collect crisp purified ice cubes, block ice, or chilled bottled water. Convenient parking and swift loading make stock-ups fast and hassle-free.
          </p>

          <div style="display:flex;flex-direction:column;gap:14px;margin-bottom:26px">
            <div style="display:flex;align-items:flex-start;gap:12px">
              <span style="font-size:20px;line-height:1">📍</span>
              <div>
                <strong style="color:var(--cb-navy);font-size:15px;display:block">Physical Location</strong>
                <span style="color:var(--cb-text-muted);font-size:14px">Shop 14, Makalani Mall, Main Road, Ongwediva, Namibia</span>
              </div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:12px">
              <span style="font-size:20px;line-height:1">⏰</span>
              <div>
                <strong style="color:var(--cb-navy);font-size:15px;display:block">Trading Hours</strong>
                <span style="color:var(--cb-text-muted);font-size:14px">Monday – Thursday: 09:00 – 19:00 &nbsp;|&nbsp; Friday – Saturday: 09:00 – 20:00 &nbsp;|&nbsp; Sunday: 10:00 – 18:00</span>
              </div>
            </div>
            <div style="display:flex;align-items:flex-start;gap:12px">
              <span style="font-size:20px;line-height:1">✉️</span>
              <div>
                <strong style="color:var(--cb-navy);font-size:15px;display:block">Orders & Enquiries</strong>
                <span style="color:var(--cb-text-muted);font-size:14px"><a href="mailto:info@coolerboxicehub.com" style="color:var(--cb-navy);text-decoration:none;font-weight:600">info@coolerboxicehub.com</a> &nbsp;•&nbsp; WhatsApp: +264 85 248 5426</span>
              </div>
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:14px">
            <a class="btn-hero-primary" href="https://maps.google.com/?q=Makalani+Mall,+Ongwediva,+Namibia" target="_blank" rel="noopener noreferrer" style="padding:12px 24px;font-size:14px">Get Directions ↗</a>
            <a class="btn-hero-outline" href="/contact" style="color:var(--cb-navy);background:var(--cb-ice-white);border-color:#b8d3ea;padding:12px 24px;font-size:14px">Send an Enquiry ✉</a>
          </div>
        </div>

        <div id="hub-map-box" style="border-radius:var(--cb-radius-md);overflow:hidden;box-shadow:0 8px 24px rgba(0,79,132,0.12);border:1px solid var(--cb-border);background:#e8f1f8;min-height:320px;position:relative;display:flex;align-items:center;justify-content:center">
          <div id="hub-map-fallback" style="position:absolute;inset:0;padding:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--cb-navy);z-index:0">
            <strong style="font-size:16px;margin-bottom:6px">📍 Shop 14, Makalani Mall, Ongwediva</strong>
            <span id="hub-map-status" style="font-size:13.5px;color:var(--cb-text-muted);margin-bottom:14px">Loading Makalani Mall map…</span>
            <a class="btn-hero-primary" href="https://maps.google.com/?q=Makalani+Mall,+Ongwediva,+Namibia" target="_blank" rel="noopener noreferrer" style="padding:10px 20px;font-size:14px">Get Directions ↗</a>
          </div>
          <iframe
            id="hub-map-iframe"
            src="https://maps.google.com/maps?q=-17.7783,15.7646+(Makalani+Mall,+Ongwediva,+Namibia)&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
            width="100%"
            height="360"
            style="border:0;display:block;position:relative;z-index:1"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="The CoolerBox Ice Hub location map at Makalani Mall, Ongwediva">
          </iframe>
        </div>
      </div>
    </div>

    <!-- Section Preview: Business & Event Supply -->
    <div style="background:linear-gradient(135deg, var(--cb-navy) 0%, var(--cb-navy-deep) 100%);border-radius:var(--cb-radius-md);padding:46px 40px;color:#ffffff;margin-bottom:60px">
      <div style="max-width:820px">
        <span class="hero-pill-tag">BUSINESS & EVENT SUPPLY</span>
        <h2 style="font-family:var(--cb-font-heading);font-size:clamp(26px, 3.2vw, 36px);margin:0 0 16px;line-height:1.25">
          Ice & Water Supply for Businesses and Events
        </h2>
        <p style="color:#d5e7f5;font-size:16.5px;line-height:1.65;margin:0 0 26px">
          Planning an event or looking for a regular ice and water supplier? The CoolerBox caters for retailers, bars, restaurants, accommodation establishments and event organisers. Contact us to discuss product options, quantities and supply arrangements for your business or occasion.
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:14px">
          <a class="btn-hero-primary" href="/services" style="padding:12px 26px;font-size:14px">Explore Business & Event Supply ↗</a>
          <a class="btn-hero-outline" href="/order" style="padding:12px 26px;font-size:14px">Request a Quote ↗</a>
        </div>
      </div>
    </div>

    <!-- Closing Call to Action Banner -->
    <div style="background:#ffffff;border:1px solid var(--cb-border);border-radius:var(--cb-radius-md);padding:44px 36px;text-align:center;box-shadow:var(--cb-shadow-sm)">
      <h2 style="font-family:var(--cb-font-heading);font-size:30px;color:var(--cb-navy);margin:0 0 12px">
        From Ice to Bottled Water, We've Got You Covered.
      </h2>
      <p style="color:var(--cb-text-muted);font-size:16px;max-width:640px;margin:0 auto 28px;line-height:1.6">
        Ready to place an order, request an official quotation, or discuss commercial partnership? Message our team directly at <strong>info@coolerboxicehub.com</strong> or WhatsApp <strong>+264 85 248 5426</strong>.
      </p>
      <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:14px">
        <a class="btn-hero-primary" href="/order">Order Now / Estimate ↗</a>
        <a class="btn-hero-outline" href="/contact" style="color:var(--cb-navy);background:var(--cb-ice-white);border-color:#b5d1e8">Send an Enquiry ✉</a>
      </div>
    </div>
  </main>

  <!-- Global Footer -->
  <footer class="site-footer-new">
    <div class="footer-inner-grid">
      <div class="footer-col-brand">
        <img src="/assets/logo-primary.jpeg" alt="The CoolerBox Ice Hub">
        <p>Pure Ice. Everyday Water. Reliable Supply across Ongwediva & Northern Namibia.</p>
        <p style="margin-top:12px;font-size:13px;color:#8dafc9">📍 Shop 14, Makalani Mall, Ongwediva</p>
      </div>
      <div class="footer-col">
        <h4>Navigation</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/products">Products</a></li>
          <li><a href="/services">Business & Events</a></li>
          <li></li>
          <li><a href="/express">CoolerBox Express</a></li>
          <li><a href="/order">Order Now</a></li>
          <li><a href="/contact">Contact Us</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Help & Info</h4>
        <ul>
          <li><a href="/questions">Questions & Answers</a></li>
          <li><a href="/reviews">Customer Reviews</a></li>
          <li><a href="/privacy">Privacy Notice</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Direct Contact</h4>
        <ul>
          <li><a href="mailto:info@coolerboxicehub.com">✉ info@coolerboxicehub.com</a></li>
          <li><a href="https://wa.me/264852485426">💬 WhatsApp +264 85 248 5426</a></li>
          <li><a href="tel:+264852485426">📞 Phone: +264 85 248 5426</a></li>
          <li><span style="color:#8dafc9;font-size:13px">Deliveries: Thursdays 08:00–10:00 &amp; 16:00–17:00 (bulk contract clients only; all other orders pick up at agreed time once confirmed) (bulk contract clients only; all other orders pick up at agreed time once confirmed)</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom-bar">
      <span>© 2026 The CoolerBox Ice Hub cc. All rights reserved. Shop 14, Makalani Mall, Ongwediva.</span>
    </div>
  </footer>

  <script src="/hero-ice.js?v=2"></script>
  <script>
    const menuBtn = document.getElementById('menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (menuBtn && drawer) {
      menuBtn.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        menuBtn.textContent = isOpen ? '✕' : '☰';
      });
      drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          drawer.classList.remove('open');
          menuBtn.setAttribute('aria-expanded', 'false');
          menuBtn.textContent = '☰';
        });
      });
    }
    const mapIframe = document.getElementById('hub-map-iframe');
    const mapStatus = document.getElementById('hub-map-status');
    if (mapIframe && mapStatus) {
      let mapLoaded = false;
      mapIframe.addEventListener('load', () => { mapLoaded = true; });
      setTimeout(() => {
        if (!mapLoaded) {
          mapStatus.textContent = 'Map preview timed out on your connection. Use Get Directions below to open Makalani Mall, Ongwediva.';
          mapIframe.style.display = 'none';
        }
      }, 4500);
    }
  </script>
</body>
</html>