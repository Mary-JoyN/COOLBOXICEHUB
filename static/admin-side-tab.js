/**
 * CoolerBox Ice Hub — Secret Admin Side Tab
 * Positioned at the side edge of the page, completely hidden from public view.
 * Accessible ONLY when double-tapped (mobile touch) or double-clicked (desktop).
 */

(() => {
  // Do not run inside the admin portal itself
  if (window.location.pathname.startsWith('/admin')) return;

  const style = document.createElement('style');
  style.textContent = `
    /* Secret side touch trigger zone (virtually invisible to public) */
    .cbx-admin-trigger-edge {
      position: fixed;
      right: 0;
      top: 30%;
      height: 40%;
      width: 22px;
      z-index: 99998;
      cursor: default;
      background: transparent;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
    }

    /* Admin Side Tab Drawer */
    .cbx-admin-side-tab {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%) translateX(110%);
      width: 260px;
      background: linear-gradient(145deg, #002b49 0%, #064573 100%);
      color: #ffffff;
      border: 1px solid #00a5ef;
      border-right: none;
      border-radius: 16px 0 0 16px;
      padding: 20px;
      box-shadow: -8px 0 30px rgba(0, 43, 73, 0.4);
      z-index: 99999;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
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
    }

    .cbx-admin-side-tab-close {
      background: transparent;
      border: none;
      color: #cbd5e1;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      transition: color 0.2s, background 0.2s;
    }

    .cbx-admin-side-tab-close:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.1);
    }

    .cbx-admin-side-tab-title {
      font-size: 16px;
      font-weight: 800;
      margin: 0 0 4px;
      color: #ffffff;
    }

    .cbx-admin-side-tab-desc {
      font-size: 12px;
      color: #94a3b8;
      margin: 0 0 16px;
      line-height: 1.4;
    }

    .cbx-admin-side-tab-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      background: linear-gradient(135deg, #00a5ef 0%, #006da6 100%);
      color: #ffffff;
      font-size: 13.5px;
      font-weight: 700;
      text-decoration: none;
      padding: 11px 14px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 165, 239, 0.35);
      border: none;
      cursor: pointer;
      box-sizing: border-box;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .cbx-admin-side-tab-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(0, 165, 239, 0.5);
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
      font-size: 12px;
      color: #bae6fd;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.2s;
    }

    .cbx-admin-quick-link:hover {
      color: #ffffff;
    }
  `;
  document.head.appendChild(style);

  // Create DOM elements
  const trigger = document.createElement('div');
  trigger.className = 'cbx-admin-trigger-edge';
  trigger.setAttribute('aria-hidden', 'true');
  trigger.title = ''; // keep clean and secret

  const tab = document.createElement('aside');
  tab.className = 'cbx-admin-side-tab';
  tab.setAttribute('role', 'complementary');
  tab.setAttribute('aria-label', 'Administrator Panel');
  tab.innerHTML = `
    <div class="cbx-admin-side-tab-head">
      <div class="cbx-admin-side-tab-badge">
        <span>🔐</span> Staff Only
      </div>
      <button class="cbx-admin-side-tab-close" id="cbx-close-admin-tab" aria-label="Close admin tab">&times;</button>
    </div>
    <div class="cbx-admin-side-tab-title">CoolerBox Admin</div>
    <div class="cbx-admin-side-tab-desc">Operations console for products, images, orders and contact details.</div>
    <a class="cbx-admin-side-tab-btn" href="/admin">
      <span>Open Admin Console</span>
      <span aria-hidden="true">↗</span>
    </a>
    <div class="cbx-admin-quick-links">
      <a class="cbx-admin-quick-link" href="/admin#pane-products"><span>🛍️</span> Add / Edit Products</a>
      <a class="cbx-admin-quick-link" href="/admin#pane-contacts"><span>📞</span> Change Phone / WhatsApp</a>
      <a class="cbx-admin-quick-link" href="/admin#pane-orders"><span>📋</span> Quotations &amp; Orders</a>
    </div>
  `;

  document.body.appendChild(trigger);
  document.body.appendChild(tab);

  let isRevealed = false;

  function revealAdminTab() {
    isRevealed = true;
    tab.classList.add('revealed');
  }

  function hideAdminTab() {
    isRevealed = false;
    tab.classList.remove('revealed');
  }

  function toggleAdminTab() {
    if (isRevealed) {
      // If already open and double tapped, directly navigate to /admin
      window.location.href = '/admin';
    } else {
      revealAdminTab();
    }
  }

  // Double tap detection (touch)
  let lastTapTime = 0;
  function handleTouchTap(e) {
    const now = Date.now();
    const timeDiff = now - lastTapTime;
    if (timeDiff < 400 && timeDiff > 40) {
      e.preventDefault();
      toggleAdminTab();
      lastTapTime = 0;
    } else {
      lastTapTime = now;
    }
  }

  trigger.addEventListener('touchend', handleTouchTap, { passive: false });
  trigger.addEventListener('dblclick', e => {
    e.preventDefault();
    toggleAdminTab();
  });

  // Close button
  const closeBtn = document.getElementById('cbx-close-admin-tab');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideAdminTab);
  }

  // Click outside to hide
  document.addEventListener('click', e => {
    if (isRevealed && !tab.contains(e.target) && !trigger.contains(e.target)) {
      hideAdminTab();
    }
  });
})();
