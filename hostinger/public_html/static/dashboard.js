(async () => {
  const $ = id => document.getElementById(id);
  const { node: n, money } = window.CB || {
    node: (tag, text, cls) => {
      const el = document.createElement(tag);
      if (text) el.textContent = text;
      if (cls) el.className = cls;
      return el;
    },
    money: num => 'N$' + num.toFixed(2),
  };

  let orders = [];
  let products = [];
  let reviews = [];
  let posts = [];

  // Tab switching
  document.querySelectorAll('[data-dash-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-dash-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.dash-section').forEach(s => s.hidden = true);
      btn.classList.add('active');
      const targetId = 'tab-' + btn.dataset.dashTab;
      if ($(targetId)) $(targetId).hidden = false;
    });
  });

  async function loadDashboard() {
    try {
      $('dash-status').textContent = 'Loading management data…';

      const [ordersRes, catRes, revRes, postRes] = await Promise.all([
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/catalogue').then(r => r.json()),
        fetch('/api/reviews').then(r => r.json()),
        fetch('/api/posts').then(r => r.json()),
      ]);

      orders = ordersRes.orders || [];
      products = catRes || [];
      reviews = revRes || [];
      posts = postRes || [];

      $('dash-status').textContent = '';
      renderStats();
      renderOrders();
      renderCatalogue();
      renderReviews();
      renderPosts();
    } catch (e) {
      $('dash-status').textContent = 'Error loading dashboard: ' + e.message;
    }
  }

  function renderStats() {
    $('stat-orders').textContent = orders.length;
    $('stat-pending-quotes').textContent = orders.filter(o => o.status === 'new').length;
    $('stat-reviews').textContent = reviews.length;
    $('stat-posts').textContent = posts.length;
  }

  function renderOrders() {
    const list = $('dash-orders-list');
    list.replaceChildren();

    const filterStatus = $('dash-filter-status').value;
    const searchVal = $('dash-order-search').value.trim().toLowerCase();

    const filtered = orders.filter(o => {
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (searchVal) {
        const str = (o.reference + ' ' + (o.customer?.name || '') + ' ' + (o.customer?.phone || '')).toLowerCase();
        if (!str.includes(searchVal)) return false;
      }
      return true;
    });

    if (!filtered.length) {
      list.append(n('p', 'No matching enquiries found.', 'empty-note'));
      return;
    }

    filtered.forEach(o => {
      const card = n('article', null, 'post-card dashboard-order-card');
      card.style.border = '1px solid #d0e2ec';
      card.style.borderRadius = '14px';
      card.style.padding = '20px';
      card.style.marginBottom = '18px';
      card.style.background = '#ffffff';

      const head = n('div', null, 'dash-order-head');
      head.style.display = 'flex';
      head.style.justifyContent = 'space-between';
      head.style.flexWrap = 'wrap';
      head.style.gap = '10px';

      const title = n('h3', o.reference, null);
      title.style.margin = '0';
      title.style.color = '#0b2b5b';

      const badge = n('span', o.status.toUpperCase(), 'status-badge ' + o.status);
      badge.style.padding = '4px 12px';
      badge.style.borderRadius = '20px';
      badge.style.fontSize = '12px';
      badge.style.fontWeight = 'bold';
      badge.style.background = o.status === 'new' ? '#ffeb3b' : (o.status === 'confirmed' ? '#4caf50' : '#e0e0e0');

      head.append(title, badge);

      const cust = o.customer || {};
      const det = o.details || {};
      const app = det.approval || {};

      const custInfo = n('p', `Customer: ${cust.name || '—'} · Tel: ${cust.phone || '—'} · Email: ${cust.email || '—'}${cust.business ? ' · ' + cust.business : ''}`);
      custInfo.style.fontSize = '14px';
      custInfo.style.color = '#334155';

      const schedInfo = n('p', `Requested Date: ${det.date || '—'} ${det.time || ''} · Fulfilment: ${det.fulfilment || 'collection'}${det.address ? ' (' + det.address + ')' : ''}`);
      schedInfo.style.fontSize = '13px';
      schedInfo.style.color = '#64748b';

      const itemsList = n('ul', null, 'dash-items');
      itemsList.style.paddingLeft = '20px';
      itemsList.style.fontSize = '13px';
      o.items.forEach(it => {
        itemsList.append(n('li', `${it.quantity} × ${it.name} (${it.size} ${it.sizeUnit}) — ${it.unitPrice ? money(it.unitPrice) + ' ea' : 'Quote required'}`));
      });

      const totalInfo = n('p', o.totalCents !== null ? `Estimated Total: ${money(o.totalCents / 100)}` : 'Total: Quote required.', 'product-price');
      totalInfo.style.margin = '10px 0';
      totalInfo.style.fontWeight = 'bold';

      // Milestones controls
      const actions = n('div', null, 'dash-milestones');
      actions.style.display = 'flex';
      actions.style.gap = '8px';
      actions.style.flexWrap = 'wrap';
      actions.style.marginTop = '14px';
      actions.style.paddingTop = '14px';
      actions.style.borderTop = '1px solid #edf2f7';

      const toggleMilestone = async (key, val, label) => {
        try {
          await fetch(`/api/orders/${o.reference}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              approval: { [key]: val },
              note: `Milestone updated: ${label} marked as ${val ? 'CONFIRMED' : 'PENDING'}.`,
            }),
          });
          loadDashboard();
        } catch (e) {
          alert(e.message);
        }
      };

      const btnPrice = n('button', (app.priceConfirmed ? '✓ Price Confirmed' : 'Confirm Price'), 'btn outline');
      btnPrice.style.fontSize = '12px';
      btnPrice.style.padding = '8px 12px';
      if (app.priceConfirmed) btnPrice.style.background = '#e6fffa';
      btnPrice.onclick = () => toggleMilestone('priceConfirmed', !app.priceConfirmed, 'Price');

      const btnAvail = n('button', (app.availabilityConfirmed ? '✓ Availability Confirmed' : 'Confirm Stock'), 'btn outline');
      btnAvail.style.fontSize = '12px';
      btnAvail.style.padding = '8px 12px';
      if (app.availabilityConfirmed) btnAvail.style.background = '#e6fffa';
      btnAvail.onclick = () => toggleMilestone('availabilityConfirmed', !app.availabilityConfirmed, 'Stock Availability');

      const btnProd = n('button', (app.productionAuthorised ? '✓ Production Authorised' : 'Authorise Production'), 'btn outline');
      btnProd.style.fontSize = '12px';
      btnProd.style.padding = '8px 12px';
      if (app.productionAuthorised) btnProd.style.background = '#e6fffa';
      btnProd.onclick = () => toggleMilestone('productionAuthorised', !app.productionAuthorised, 'Production');

      const statusSelect = n('select', null, 'status-sel');
      statusSelect.style.padding = '6px 10px';
      statusSelect.style.borderRadius = '8px';
      statusSelect.style.border = '1px solid #cbd5e1';
      ['new', 'quoted', 'confirmed', 'completed', 'cancelled'].forEach(st => {
        const opt = document.createElement('option');
        opt.value = st;
        opt.textContent = 'Status: ' + st;
        if (o.status === st) opt.selected = true;
        statusSelect.append(opt);
      });
      statusSelect.onchange = async () => {
        await fetch(`/api/orders/${o.reference}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: statusSelect.value, note: `Status updated to ${statusSelect.value}.` }),
        });
        loadDashboard();
      };

      actions.append(btnPrice, btnAvail, btnProd, statusSelect);

      card.append(head, custInfo, schedInfo, itemsList, totalInfo, actions);
      list.append(card);
    });
  }

  function renderCatalogue() {
    const list = $('dash-cat-list');
    list.replaceChildren();

    products.forEach(p => {
      const row = n('div', null, 'cat-admin-row');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '14px 18px';
      row.style.background = '#f8fafc';
      row.style.border = '1px solid #e2e8f0';
      row.style.borderRadius = '10px';
      row.style.marginBottom = '10px';
      row.style.flexWrap = 'wrap';
      row.style.gap = '12px';

      const info = n('div');
      info.append(
        n('strong', p.name),
        n('span', ` · ${p.size} ${p.sizeUnit} · Retail: ${p.retailPrice !== null ? money(p.retailPrice) : 'Quote'} · Bulk: ${p.bulkPrice !== null ? money(p.bulkPrice) : '—'}`, 'small')
      );

      const priceForm = n('div');
      priceForm.style.display = 'flex';
      priceForm.style.gap = '8px';
      priceForm.style.alignItems = 'center';

      const input = document.createElement('input');
      input.type = 'number';
      input.step = '0.5';
      input.value = p.retailPrice || '';
      input.placeholder = 'N$ Price';
      input.style.width = '100px';
      input.style.padding = '6px 10px';
      input.style.border = '1px solid #cbd5e1';
      input.style.borderRadius = '6px';

      const saveBtn = n('button', 'Save', 'btn');
      saveBtn.style.padding = '6px 14px';
      saveBtn.style.fontSize = '12px';
      saveBtn.onclick = async () => {
        const val = input.value ? parseFloat(input.value) : null;
        await fetch(`/api/catalogue/${p.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ retailPrice: val }),
        });
        loadDashboard();
      };

      priceForm.append(input, saveBtn);
      row.append(info, priceForm);
      list.append(row);
    });
  }

  function renderReviews() {
    const list = $('dash-rev-list');
    list.replaceChildren();

    if (!reviews.length) {
      list.append(n('p', 'No reviews submitted yet.', 'empty-note'));
      return;
    }

    reviews.forEach(r => {
      const card = n('div', null, 'rev-admin-card');
      card.style.border = '1px solid #e2e8f0';
      card.style.padding = '16px';
      card.style.borderRadius = '10px';
      card.style.marginBottom = '12px';
      card.style.background = '#ffffff';

      card.append(
        n('div', '★'.repeat(r.rating || 5) + ` · By ${r.author || 'Anonymous'} · ${r.createdAt ? r.createdAt.slice(0, 10) : ''}`, 'post-meta'),
        n('h4', r.title),
        n('p', r.body)
      );
      list.append(card);
    });
  }

  function renderPosts() {
    const list = $('dash-post-list');
    list.replaceChildren();

    if (!posts.length) {
      list.append(n('p', 'No announcements published yet.', 'empty-note'));
      return;
    }

    posts.forEach(p => {
      const card = n('div', null, 'post-admin-card');
      card.style.border = '1px solid #e2e8f0';
      card.style.padding = '16px';
      card.style.borderRadius = '10px';
      card.style.marginBottom = '12px';
      card.style.background = '#ffffff';

      card.append(
        n('div', `${p.category.toUpperCase()} · ${p.createdAt ? p.createdAt.slice(0, 10) : ''}`, 'post-meta'),
        n('h4', p.title),
        n('p', p.body)
      );
      list.append(card);
    });
  }

  // Create post form
  if ($('dash-new-post-form')) {
    $('dash-new-post-form').onsubmit = async e => {
      e.preventDefault();
      const title = $('post-title').value.trim();
      const category = $('post-category').value;
      const body = $('post-body').value.trim();
      const location = $('post-location').value.trim();

      if (!title || !body) return;
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, body, location }),
      });
      $('dash-new-post-form').reset();
      loadDashboard();
    };
  }

  $('dash-filter-status').onchange = renderOrders;
  $('dash-order-search').oninput = renderOrders;

  loadDashboard();
})();
