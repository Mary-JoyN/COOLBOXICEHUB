/**
 * CoolerBox Ice Hub — Admin Side Tab
 * Pinned neatly to the right edge of the page.
 * Protected: ONLY opens when double-tapped (mobile touch) or double-clicked (desktop).
 */

(() => {
  // Do not run on the admin portal page itself
  if (window.location.pathname.startsWith('/admin')) return;

  const style = document.createElement('style');
  style.textContent = `
    /* Visible Admin Tab Handle on Right Edge */
    .cbx-admin-side-handle {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 99998;
      background: linear-gradient(180deg, #002b49 0%, #001f35 100%);
      color: #ffffff;
      border: 1.5px solid #00a5ef;
      border-right: none;
      border-radius: 12px 0 0 12px;
      padding: 12px 7px 12px 9px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 7px;
      box-shadow: -4px 0 20px rgba(0, 43, 73, 0.4), 0 0 12px rgba(0, 165, 239, 0.25);
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s, background 0.2s;
    }

    .cbx-admin-side-handle:hover {
      background: linear-gradient(180deg, #003a63 0%, #002b49 100%);
      box-shadow: -6px 0 24px rgba(0, 165, 239, 0.45);
      transform: translateY(-50%) translateX(-2px);
    }

    .cbx-admin-side-handle.shake {
      animation: cbx-tab-shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }

    @keyframes cbx-tab-shake {
      10%, 90% { transform: translateY(-50%) translate3d(-3px, 0, 0); }
      20%, 80% { transform: translateY(-50%) translate3d(4px, 0, 0); }
      30%, 50%, 70% { transform: translateY(-50%) translate3d(-4px, 0, 0); }
      40%, 60% { transform: translateY(-50%) translate3d(4px, 0, 0); }
    }

    .cbx-admin-side-icon {
      font-size: 15px;
      line-height: 1;
      display: inline-block;
      transition: transform 0.25s ease;
    }

    .cbx-admin-side-text {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      transform: rotate(180deg);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #38bdf8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Tooltip banner prompt on single tap */
    .cbx-admin-tooltip {
      position: fixed;
      right: 48px;
      top: 50%;
      transform: translateY(-50%) translateX(10px);
      background: #001f35;
      color: #ffffff;
      border: 1px solid #00a5ef;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      z-index: 99998;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cbx-admin-tooltip.visible {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }

    /* Full Slide-In Admin Drawer */
    .cbx-admin-side-tab {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%) translateX(110%);
      width: min(320px, calc(100vw - 20px));
      background: linear-gradient(150deg, #00233b 0%, #001726 100%);
      color: #ffffff;
      border: 1.5px solid #00a5ef;
      border-right: none;
      border-radius: 18px 0 0 18px;
      padding: 22px;
      box-shadow: -10px 0 35px rgba(0, 30, 50, 0.55);
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      pointer-events: none;
      visibility: hidden;
    }

    .cbx-admin-side-tab.revealed {
      transform: translateY(-50%) translateX(0);
      pointer-events: auto;
      visibility: visible;
    }

    .cbx-admin-side-tab-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .cbx-admin-side-tab-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #38bdf8;
      background: rgba(0, 165, 239, 0.15);
      border: 1px solid rgba(0, 165, 239, 0.35);
      padding: 4px 8px;
      border-radius: 20px;
    }

    .cbx-admin-side-tab-close {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: color 0.2s, background 0.2s;
    }

    .cbx-admin-side-tab-close:hover {
      color: #ffffff;
      background: rgba(239, 68, 68, 0.3);
      border-color: #ef4444;
    }

    .cbx-admin-side-tab-title {
      font-size: 17px;
      font-weight: 800;
      margin: 0 0 5px;
      color: #ffffff;
    }

    .cbx-admin-side-tab-desc {
      font-size: 12px;
      color: #94a3b8;
      margin: 0 0 16px;
      line-height: 1.45;
    }

    .cbx-admin-side-tab-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      background: linear-gradient(135deg, #00a5ef 0%, #006da6 100%);
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 12px 14px;
      border-radius: 9px;
      box-shadow: 0 4px 14px rgba(0, 165, 239, 0.4);
      border: none;
      cursor: pointer;
      box-sizing: border-box;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .cbx-admin-side-tab-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(0, 165, 239, 0.55);
    }

    .cbx-admin-quick-links {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .cbx-admin-quick-link {
      font-size: 12.5px;
      font-weight: 600;
      color: #bae6fd;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 9px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.03);
      transition: background 0.2s, color 0.2s;
    }

    .cbx-admin-quick-link:hover {
      color: #ffffff;
      background: rgba(0, 165, 239, 0.15);
    }

    /* Dim backdrop */
    .cbx-admin-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 10, 20, 0.5);
      backdrop-filter: blur(2px);
      z-index: 99997;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }

    .cbx-admin-backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }

    @media (max-width: 600px) {
      .cbx-admin-side-handle {
        padding: 10px 6px 10px 8px;
        top: 55%;
      }
      .cbx-admin-side-text {
        font-size: 10px;
        letter-spacing: 1.5px;
      }
    }
  `;
  document.head.appendChild(style);

  // 1. Create Handle Button on Right Edge
  const handle = document.createElement('div');
  handle.className = 'cbx-admin-side-handle';
  handle.setAttribute('role', 'button');
  handle.setAttribute('tabindex', '0');
  handle.setAttribute('aria-label', 'CoolerBox Admin Tab (Double-tap to open)');
  handle.title = 'Admin Tab (Double-tap to open)';
  handle.innerHTML = `
    <span class="cbx-admin-side-icon" id="cbx-lock-icon">🔒</span>
    <span class="cbx-admin-side-text">ADMIN</span>
  `;

  // 2. Create Tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'cbx-admin-tooltip';
  tooltip.innerHTML = `<span>🔒</span> Double-tap to open Admin`;

  // 3. Create Backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'cbx-admin-backdrop';

  // 4. Create Drawer
  const drawer = document.createElement('aside');
  drawer.className = 'cbx-admin-side-tab';
  drawer.setAttribute('role', 'complementary');
  drawer.setAttribute('aria-label', 'Staff Admin Console');
  drawer.innerHTML = `
    <div class="cbx-admin-side-tab-head">
      <div class="cbx-admin-side-tab-badge">
        <span>🔓</span> Staff Console
      </div>
      <button class="cbx-admin-side-tab-close" id="cbx-close-admin-tab" aria-label="Close admin panel">&times;</button>
    </div>
    <div class="cbx-admin-side-tab-title">CoolerBox Admin Portal</div>
    <div class="cbx-admin-side-tab-desc">Operations console for products, image uploads, customer quotations and contact details.</div>
    <a class="cbx-admin-side-tab-btn" href="/admin">
      <span>Open Full Admin Portal</span>
      <span aria-hidden="true">↗</span>
    </a>
    <div class="cbx-admin-quick-links">
      <a class="cbx-admin-quick-link" href="/admin#pane-products"><span>🛍️</span> Add / Edit Products &amp; Images</a>
      <a class="cbx-admin-quick-link" href="/admin#pane-contacts"><span>📞</span> Change Phone / WhatsApp</a>
      <a class="cbx-admin-quick-link" href="/admin#pane-orders"><span>📋</span> Quotations &amp; Enquiries</a>
      <a class="cbx-admin-quick-link" href="/admin#pane-business"><span>⚙️</span> Opening Hours &amp; Policies</a>
    </div>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(handle);
  document.body.appendChild(tooltip);
  document.body.appendChild(drawer);

  let isRevealed = false;
  let tooltipTimeout = null;

  function showTooltip(message) {
    if (message) tooltip.innerHTML = `<span>🔒</span> ${message}`;
    tooltip.classList.add('visible');
    if (tooltipTimeout) clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => {
      tooltip.classList.remove('visible');
    }, 2200);
  }

  function revealAdminDrawer() {
    isRevealed = true;
    drawer.classList.add('revealed');
    backdrop.classList.add('active');
    tooltip.classList.remove('visible');
    const lock = document.getElementById('cbx-lock-icon');
    if (lock) lock.textContent = '🔓';
  }

  function hideAdminDrawer() {
    isRevealed = false;
    drawer.classList.remove('revealed');
    backdrop.classList.remove('active');
    const lock = document.getElementById('cbx-lock-icon');
    if (lock) lock.textContent = '🔒';
  }

  function onSingleTap() {
    // Single tap shakes the handle and tells the user to double tap
    handle.classList.remove('shake');
    void handle.offsetWidth; // trigger reflow
    handle.classList.add('shake');
    showTooltip('Double-tap tab to open Admin');
  }

  function onDoubleTap() {
    if (isRevealed) {
      window.location.href = '/admin';
    } else {
      revealAdminDrawer();
    }
  }

  // Double-tap vs Single-tap detection for both Touch and Mouse
  let clickCount = 0;
  let clickTimer = null;

  function registerTap() {
    clickCount++;
    if (clickCount === 1) {
      clickTimer = setTimeout(() => {
        if (clickCount === 1) {
          onSingleTap();
        }
        clickCount = 0;
      }, 350);
    } else if (clickCount >= 2) {
      clearTimeout(clickTimer);
      clickCount = 0;
      onDoubleTap();
    }
  }

  // Touch handling
  handle.addEventListener('touchend', e => {
    e.preventDefault();
    registerTap();
  }, { passive: false });

  // Click handling (desktop)
  handle.addEventListener('click', e => {
    e.preventDefault();
    registerTap();
  });

  // Native desktop dblclick fallback
  handle.addEventListener('dblclick', e => {
    e.preventDefault();
    onDoubleTap();
  });

  // Close handlers
  const closeBtn = document.getElementById('cbx-close-admin-tab');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideAdminDrawer);
  }

  backdrop.addEventListener('click', hideAdminDrawer);

  // Keyboard shortcut: Ctrl+Shift+A or Alt+A
  window.addEventListener('keydown', e => {
    if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
      e.preventDefault();
      if (isRevealed) hideAdminDrawer();
      else revealAdminDrawer();
    }
  });
})();
