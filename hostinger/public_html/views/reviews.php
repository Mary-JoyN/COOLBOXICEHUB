<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#0b2b5b">
  <title>Customer Ratings &amp; Reviews | The CoolerBox Ice Hub — Ongwediva, Namibia</title>
  <meta name="description" content="Read customer experiences and rate your visit to The CoolerBox Ice Hub at Makalani Mall, Ongwediva. Pure ice cubes, bottled water, and event supply.">
  <link rel="icon" type="image/jpeg" href="/assets/logo-symbol-blue.jpeg">
  <link rel="stylesheet" href="/commerce.css?v=20261103d">
  <link rel="stylesheet" href="/ice-company.css?v=20261103d">
  <style>
    .reviews-page-grid {
      display: grid;
      grid-template-columns: 1.25fr 0.85fr;
      gap: 32px;
      align-items: start;
      margin-bottom: 48px;
    }

    .review-panel {
      background: #ffffff;
      border: 1px solid var(--cb-border, #d4e3ef);
      border-radius: var(--cb-radius-md, 14px);
      padding: 32px;
      box-shadow: var(--cb-shadow-sm, 0 2px 8px rgba(0, 79, 132, 0.06));
    }

    .review-panel h2 {
      font-family: var(--cb-font-heading, system-ui, sans-serif);
      font-size: 24px;
      font-weight: 700;
      color: var(--cb-navy, #004f84);
      margin: 0 0 8px;
    }

    .review-panel .panel-sub {
      color: var(--cb-text-muted, #4e6b84);
      font-size: 14px;
      margin: 0 0 24px;
      line-height: 1.6;
    }

    /* Star Rating Selector */
    .review-stars {
      border: 1px solid var(--cb-border, #d4e3ef);
      border-radius: var(--cb-radius-sm, 8px);
      padding: 16px 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      margin: 16px 0 20px;
      background: var(--cb-surface-alt, #f0f6fb);
    }

    .review-stars legend {
      font-family: var(--cb-font-heading, system-ui, sans-serif);
      font-size: 13.5px;
      font-weight: 700;
      color: var(--cb-navy, #004f84);
      padding: 0 8px;
    }

    .review-stars label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ffffff;
      border: 1px solid var(--cb-border, #d4e3ef);
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      color: var(--cb-text-main, #062842);
      transition: all 0.2s ease;
      margin: 0;
    }

    .review-stars label span {
      color: #f59e0b;
      font-size: 18px;
    }

    .review-stars input[type="radio"] {
      width: auto !important;
      accent-color: var(--cb-cyan, #00a5ef);
      margin: 0;
      cursor: pointer;
    }

    .review-stars label:hover,
    .review-stars label:has(input:checked) {
      background: #e8f5fd;
      border-color: var(--cb-cyan, #00a5ef);
      color: var(--cb-navy, #004f84);
      box-shadow: 0 2px 6px rgba(0, 165, 239, 0.15);
    }

    /* QR Code Aside Card */
    .qr-card {
      background: #ffffff;
      border: 1px solid var(--cb-border, #d4e3ef);
      border-radius: var(--cb-radius-md, 14px);
      padding: 32px 28px;
      box-shadow: var(--cb-shadow-sm, 0 2px 8px rgba(0, 79, 132, 0.06));
      text-align: center;
    }

    .qr-card .eyebrow {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      color: var(--cb-cyan, #00a5ef);
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .qr-card h2 {
      font-family: var(--cb-font-heading, system-ui, sans-serif);
      font-size: 22px;
      font-weight: 700;
      color: var(--cb-navy, #004f84);
      margin: 0 0 16px;
    }

    .qr-img-wrap {
      background: #ffffff;
      border: 1px solid var(--cb-border, #d4e3ef);
      border-radius: 12px;
      padding: 16px;
      display: inline-block;
      margin: 8px auto 16px;
      box-shadow: 0 4px 14px rgba(0, 79, 132, 0.07);
    }

    .qr-img-wrap img {
      max-width: 170px;
      height: auto;
      display: block;
    }

    .qr-card p {
      color: var(--cb-text-muted, #4e6b84);
      font-size: 13.5px;
      line-height: 1.6;
      margin: 0 0 18px;
    }

    .qr-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .qr-actions .btn {
      width: 100%;
      padding: 11px 16px;
      font-size: 13px;
    }

    /* Published Reviews Section */
    .reviews-published-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 16px;
      border-bottom: 2px solid var(--cb-border, #d4e3ef);
      padding-bottom: 16px;
      margin-bottom: 28px;
    }

    .reviews-published-header h2 {
      font-family: var(--cb-font-heading, system-ui, sans-serif);
      font-size: clamp(22px, 2.5vw, 28px);
      font-weight: 700;
      color: var(--cb-navy, #004f84);
      margin: 0;
    }

    #review-average {
      font-family: var(--cb-font-heading, system-ui, sans-serif);
      font-size: 15px;
      font-weight: 700;
      color: var(--cb-cyan-dark, #0087c5);
      background: var(--cb-surface-alt, #f0f6fb);
      border: 1px solid var(--cb-border, #d4e3ef);
      padding: 6px 14px;
      border-radius: 20px;
      margin: 0;
    }

    #review-published {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 22px;
      margin-bottom: 60px;
    }

    .post-card {
      background: #ffffff;
      border: 1px solid var(--cb-border, #d4e3ef);
      border-radius: var(--cb-radius-md, 14px);
      padding: 24px 26px;
      box-shadow: var(--cb-shadow-sm, 0 2px 8px rgba(0, 79, 132, 0.06));
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      flex-direction: column;
    }

    .post-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--cb-shadow-md, 0 8px 24px rgba(0, 79, 132, 0.09));
    }

    .post-copy {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .post-meta {
      color: #f59e0b;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .post-copy h3 {
      font-family: var(--cb-font-heading, system-ui, sans-serif);
      font-size: 17px;
      font-weight: 700;
      color: var(--cb-navy, #004f84);
      margin: 0 0 10px;
      line-height: 1.35;
    }

    .post-copy p {
      color: var(--cb-text-muted, #4e6b84);
      font-size: 14px;
      line-height: 1.65;
      margin: 0 0 14px;
      flex-grow: 1;
    }

    .post-copy p:last-child {
      color: var(--cb-navy-deep, #003a63);
      font-weight: 700;
      font-size: 13px;
      margin: 0;
      padding-top: 10px;
      border-top: 1px solid var(--cb-border-subtle, #e6eef5);
    }

    .empty-note {
      grid-column: 1 / -1;
      background: #ffffff;
      border: 2px dashed var(--cb-border, #d4e3ef);
      border-radius: var(--cb-radius-md, 14px);
      padding: 48px 24px;
      text-align: center;
      color: var(--cb-text-muted, #4e6b84);
      font-size: 15px;
      box-shadow: var(--cb-shadow-sm, 0 2px 8px rgba(0, 79, 132, 0.04));
      margin: 0;
    }

    @media (max-width: 900px) {
      .reviews-page-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
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
        <li><a class="site-nav-link" href="/">Home</a></li>
        <li><a class="site-nav-link" href="/products">Products</a></li>
        <li><a class="site-nav-link" href="/services">Business &amp; Events</a></li>        <li><a class="site-nav-link" href="/contact">Contact</a></li>
        <li><a class="site-nav-link" href="/order?express=1">Express</a></li>
      </ul>
      <a class="btn-header-order" href="/order">Order Now ↗</a>
      <button class="mobile-menu-toggle" id="menu-btn" aria-label="Toggle navigation">☰</button>
    </div>
    <div class="mobile-drawer" id="mobile-drawer">
      <a href="/">Home</a>
      <a href="/products">Products</a>
      <a href="/services">Business &amp; Events</a>      <a href="/contact">Contact</a>
      <a href="/order?express=1">Express</a>
      <a href="/order" style="color:var(--cb-cyan);font-weight:700">Order Now ↗</a>
    </div>
  </header>

  <!-- Title Banner -->
  <section class="page-title-banner">
    <div class="page-title-inner">
      <span class="page-title-tag">RATINGS &amp; REVIEWS</span>
      <h1>Rate Your Visit. Help Us Improve.</h1>
      <p>Tell us about your CoolerBox pure ice, everyday water, or event supply experience. Honest feedback helps us improve our service across Ongwediva.</p>
    </div>
  </section>

  <!-- Main Content -->
  <main class="wrap">
    <div class="reviews-page-grid">
      <!-- Review Submission Form -->
      <section class="review-panel">
        <h2>Leave a Rating &amp; Review</h2>
        <p class="panel-sub">Reviews are checked before publication. Only your selected display name, rating, title, and comment will be published.</p>

        <form id="review-form">
          <fieldset class="review-stars">
            <legend>Your rating</legend>
            <label><input type="radio" name="rating" value="1" required><span>★</span> 1</label>
            <label><input type="radio" name="rating" value="2"><span>★</span> 2</label>
            <label><input type="radio" name="rating" value="3"><span>★</span> 3</label>
            <label><input type="radio" name="rating" value="4"><span>★</span> 4</label>
            <label><input type="radio" name="rating" value="5"><span>★</span> 5</label>
          </fieldset>

          <label for="review-title">Review title</label>
          <input id="review-title" maxlength="100" minlength="2" required placeholder="Summarise your experience">

          <label for="review-comment">Your review</label>
          <textarea id="review-comment" minlength="10" maxlength="1500" required placeholder="What went well? What could we improve?"></textarea>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div>
              <label for="review-name">Display name</label>
              <input id="review-name" minlength="2" maxlength="80" required placeholder="Name to show with your review">
            </div>
            <div>
              <label for="review-reference">Enquiry reference (optional)</label>
              <input id="review-reference" maxlength="50" placeholder="e.g. CBX-2610-1042">
            </div>
          </div>

          <label class="event-toggle" style="margin:16px 0 8px">
            <input id="review-anonymous" type="checkbox"> Publish as “Anonymous customer” instead
          </label>

          <label class="event-toggle" style="margin:8px 0 20px">
            <input id="review-permission" type="checkbox" required> I agree that my display name, rating, and review may be published after review by CoolerBox.
          </label>

          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px">
            <button class="btn" type="submit" id="review-submit">Submit Review ↗</button>
            <a href="/privacy" class="owner-link" target="_blank" rel="noopener" style="font-size:13px;color:var(--cb-text-muted)">Read privacy information ↗</a>
          </div>

          <p id="review-status" class="news-status" role="status" style="margin-top:14px;font-weight:600;font-size:14px;color:var(--cb-cyan-dark)"></p>
        </form>
      </section>

      <!-- Scan & Print Card -->
      <aside class="qr-card" id="review-qr-card">
        <span class="eyebrow">SCAN · RATE · REVIEW</span>
        <h2>How Did We Do?</h2>
        <div class="qr-img-wrap">
          <img src="/review-qr.png" alt="QR code linking to CoolerBox customer rating form" loading="lazy">
        </div>
        <p>Scan with your phone to leave a quick 1–5 star rating and comment on the go.</p>
        <div class="qr-actions">
          <button class="btn outline" type="button" id="review-print">Print QR Card</button>
          <a class="btn outline" href="/review-qr.png" download="CoolerBox-Review-QR.png">Download QR Image</a>
        </div>
      </aside>
    </div>

    <!-- Published Testimonials Section -->
    <section>
      <div class="reviews-published-header">
        <h2>Published Customer Feedback</h2>
        <p id="review-average" class="product-price"></p>
      </div>
      <div id="review-published"></div>
    </section>
  </main>

  <!-- Global Footer -->
  <footer class="site-footer-new">
    <div class="footer-inner-grid">
      <div class="footer-col-brand">
        <img src="/assets/logo-primary.jpeg" alt="The CoolerBox Ice Hub">
        <p>Pure Ice. Everyday Water. Reliable Supply across Ongwediva &amp; Northern Namibia.</p>
        <p style="margin-top:12px;font-size:13px;color:#8dafc9">📍 Shop 14, Makalani Mall, Ongwediva</p>
      </div>
      <div class="footer-col">
        <h4>Navigation</h4>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/products">Products</a></li>
          <li><a href="/services">Business &amp; Events</a></li>
          <li></li>
          <li><a href="/order">Order &amp; Estimates</a></li>
          <li><a href="/contact">Contact Us</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Help &amp; Info</h4>
        <ul>
          <li><a href="/questions">Questions &amp; Answers</a></li>
          <li><a href="/reviews">Customer Reviews</a></li>
          <li><a href="/privacy">Privacy Notice</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Direct Contact</h4>
        <ul>
          <li><a href="mailto:info@coolerboxicehub.com">✉ info@coolerboxicehub.com</a></li>
          <li><a href="https://wa.me/264852485426" target="_blank" rel="noopener">💬 WhatsApp +264 85 248 5426</a></li>
          <li><a href="tel:+264852485426">📞 Phone: +264 85 248 5426</a></li>
          <li><span style="color:#8dafc9;font-size:13px">Deliveries: Thursdays 08:00–10:00 &amp; 16:00–17:00 (bulk contract clients only; all other orders pick up at agreed time once confirmed)</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom-bar">
      <span>© 2026 The CoolerBox Ice Hub. All rights reserved. Makalani Mall, Ongwediva.</span>
    </div>
  </footer>

  <script src="/commerce-ui.js?v=20261103d"></script>
  <script src="/reviews.js?v=20261103d"></script>
  <script src="/qa.js?v=20261103d"></script>
  <script>
    const menuBtn = document.getElementById('menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    if (menuBtn && drawer) {
      menuBtn.addEventListener('click', () => { drawer.classList.toggle('open'); });
    }
  </script>
</body>
</html>