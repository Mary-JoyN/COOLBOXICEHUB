/**
 * CoolerBox Ice Hub — Client Admin Portal Logic
 * Provides full control over Product Catalogue (with image upload), Phone & Contact Details,
 * Quotations & Orders, Customer Reviews, and Announcements.
 */

(() => {
  const $ = id => document.getElementById(id);
  const money = num => (num !== null && num !== undefined ? 'N$' + Number(num).toFixed(2) : 'Quote');

  // State
  let catalogue = [];
  let siteSettings = {};
  let businessSettings = {};
  let orders = [];
  let reviews = [];
  let posts = [];
  let editingProductId = null;

  // Toast Helper
  function showToast(msg, type = 'success') {
    let toast = $('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.className = 'admin-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.className = `admin-toast show ${type}`;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }

  // Tab Navigation
  document.querySelectorAll('[data-adm-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-adm-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-pane').forEach(p => (p.hidden = true));
      btn.classList.add('active');
      const pane = $('pane-' + btn.dataset.admTab);
      if (pane) pane.hidden = false;
    });
  });

  // Initial Load
  async function init() {
    try {
      const [catRes, setRes, bizRes, ordRes, revRes, postRes] = await Promise.all([
        fetch('/api/catalogue').then(r => r.json()),
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/business').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/reviews').then(r => r.json()),
        fetch('/api/posts').then(r => r.json()),
      ]);

      catalogue = Array.isArray(catRes) ? catRes : [];
      siteSettings = setRes || {};
      businessSettings = bizRes || {};
      orders = ordRes.orders || [];
      reviews = Array.isArray(revRes) ? revRes : [];
      posts = Array.isArray(postRes) ? postRes : [];

      renderStats();
      renderCatalogue();
      populateContactForm();
      renderOrders();
      renderReviews();
      renderPosts();
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Error loading management data: ' + err.message, 'error');
    }
  }

  // -------------------------------------------------------------
  // Stats Bar
  // -------------------------------------------------------------
  function renderStats() {
    if ($('stat-products-count')) $('stat-products-count').textContent = catalogue.length;
    if ($('stat-orders-count')) $('stat-orders-count').textContent = orders.length;
    if ($('stat-pending-quotes')) $('stat-pending-quotes').textContent = orders.filter(o => o.status === 'new').length;
    if ($('stat-reviews-count')) $('stat-reviews-count').textContent = reviews.length;
    if ($('stat-active-phone')) $('stat-active-phone').textContent = siteSettings.phone || ('+' + (siteSettings.whatsapp || '264852485426'));
  }

  // -------------------------------------------------------------
  // Products Management
  // -------------------------------------------------------------
  function renderCatalogue() {
    const list = $('admin-products-list');
    if (!list) return;
    list.replaceChildren();

    const search = ($('search-products') ? $('search-products').value : '').toLowerCase().trim();
    const filterCat = $('filter-products-cat') ? $('filter-products-cat').value : 'all';

    const filtered = catalogue.filter(p => {
      if (search && !p.name.toLowerCase().includes(search) && !p.description.toLowerCase().includes(search)) {
        return false;
      }
      if (filterCat !== 'all' && p.unit !== filterCat && !p.id.includes(filterCat)) {
        return false;
      }
      return true;
    });

    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'admin-card';
      empty.style.gridColumn = '1 / -1';
      empty.style.textAlign = 'center';
      empty.style.padding = '40px 20px';
      empty.innerHTML = `
        <div style="font-size:36px;margin-bottom:10px">📦</div>
        <h3 style="margin:0 0 6px;color:#0b2b5b">No products match your criteria</h3>
        <p style="color:#64748b;font-size:14px;margin:0">Click <strong>"+ Add New Product"</strong> above to add ice, water, cups, or new offerings to your storefront.</p>
      `;
      list.appendChild(empty);
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-admin-card';

      const top = document.createElement('div');
      top.className = 'product-admin-top';

      const thumbFrame = document.createElement('div');
      thumbFrame.className = 'product-thumb-frame';
      const img = document.createElement('img');
      img.src = p.image || '/assets/ice-product.webp';
      img.alt = p.name;
      img.onerror = () => { img.src = '/assets/ice-product.webp'; };
      thumbFrame.appendChild(img);

      const info = document.createElement('div');
      info.className = 'product-admin-info';

      const title = document.createElement('h4');
      title.className = 'product-admin-title';
      title.textContent = p.name;

      const spec = document.createElement('div');
      spec.className = 'product-admin-spec';
      spec.textContent = `${p.size} ${p.sizeUnit} (${p.unit})`;

      const stockBadge = document.createElement('span');
      stockBadge.className = `badge-stock ${p.availability || 'available'}`;
      stockBadge.textContent = (p.availability || 'available').replace('-', ' ');

      info.append(title, spec, stockBadge);
      top.append(thumbFrame, info);

      // Price breakdown box
      const priceBox = document.createElement('div');
      priceBox.className = 'product-admin-prices';

      priceBox.innerHTML = `
        <div class="price-item">
          <span style="color:#64748b">Retail</span>
          <strong>${p.retailPrice !== null ? money(p.retailPrice) : 'Quote'}</strong>
        </div>
        <div class="price-item">
          <span style="color:#64748b">Bulk</span>
          <strong>${p.bulkPrice !== null ? money(p.bulkPrice) : '—'}</strong>
        </div>
        ${p.gourmetRetailPrice ? `
        <div class="price-item">
          <span style="color:#64748b">Gourmet</span>
          <strong>${money(p.gourmetRetailPrice)}</strong>
        </div>` : ''}
      `;

      // Actions
      const actions = document.createElement('div');
      actions.className = 'product-admin-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-admin-pill ghost';
      editBtn.innerHTML = '✏️ Edit';
      editBtn.onclick = () => openProductModal(p);

      const toggleStockBtn = document.createElement('button');
      toggleStockBtn.className = 'btn-admin-pill ghost';
      toggleStockBtn.textContent = p.availability === 'sold-out' ? '✓ Mark In Stock' : '⏸ Mark Sold Out';
      toggleStockBtn.onclick = async () => {
        const nextStatus = p.availability === 'sold-out' ? 'available' : 'sold-out';
        try {
          await fetch(`/api/catalogue/${p.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ availability: nextStatus }),
          });
          p.availability = nextStatus;
          renderCatalogue();
          showToast(`Updated stock status for "${p.name}" to ${nextStatus}.`);
        } catch (e) {
          showToast('Failed to update stock: ' + e.message, 'error');
        }
      };

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-admin-pill ghost';
      delBtn.style.color = '#ef4444';
      delBtn.style.borderColor = '#fecaca';
      delBtn.innerHTML = '🗑️';
      delBtn.title = 'Delete Product';
      delBtn.onclick = async () => {
        if (!confirm(`Are you sure you want to remove "${p.name}" from the product catalogue?`)) return;
        try {
          const res = await fetch(`/api/catalogue/${p.id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Could not delete product');
          catalogue = catalogue.filter(item => item.id !== p.id);
          renderCatalogue();
          renderStats();
          showToast(`Deleted "${p.name}" from catalogue.`);
        } catch (e) {
          showToast('Failed to delete: ' + e.message, 'error');
        }
      };

      actions.append(editBtn, toggleStockBtn, delBtn);

      card.append(top, priceBox, actions);
      list.appendChild(card);
    });
  }

  // Open Product Modal (Add or Edit)
  function openProductModal(prod = null) {
    editingProductId = prod ? prod.id : null;
    const modal = $('product-modal-overlay');
    const title = $('modal-product-title');
    const form = $('product-form');

    if (!modal || !form) return;

    title.textContent = prod ? `Edit Product: ${prod.name}` : 'Add New Product to Storefront';
    form.reset();

    if (prod) {
      $('prod-name').value = prod.name || '';
      $('prod-unit').value = prod.unit || 'bag';
      $('prod-size').value = prod.size || 1;
      $('prod-size-unit').value = prod.sizeUnit || 'kg';
      $('prod-retail-price').value = prod.retailPrice !== null ? prod.retailPrice : '';
      $('prod-bulk-price').value = prod.bulkPrice !== null ? prod.bulkPrice : '';
      $('prod-bulk-min').value = prod.bulkMinimum || 20;
      $('prod-gourmet-retail').value = prod.gourmetRetailPrice || '';
      $('prod-gourmet-bulk').value = prod.gourmetBulkPrice || '';
      $('prod-availability').value = prod.availability || 'available';
      $('prod-lead-days').value = prod.leadDays !== undefined ? prod.leadDays : 1;
      $('prod-description').value = prod.description || '';
      $('prod-image-url').value = prod.image || '';
      $('prod-image-preview').src = prod.image || '/assets/ice-product.webp';
    } else {
      $('prod-image-preview').src = '/assets/ice-product.webp';
      $('prod-image-url').value = '/assets/ice-product.webp';
    }

    modal.classList.add('open');
  }

  function closeProductModal() {
    const modal = $('product-modal-overlay');
    if (modal) modal.classList.remove('open');
    editingProductId = null;
  }

  if ($('btn-close-prod-modal')) $('btn-close-prod-modal').onclick = closeProductModal;
  if ($('btn-cancel-prod-modal')) $('btn-cancel-prod-modal').onclick = closeProductModal;
  if ($('btn-add-product')) $('btn-add-product').onclick = () => openProductModal(null);

  // Image Upload Handling in Modal
  const imageFileInput = $('prod-image-file');
  const imagePreview = $('prod-image-preview');
  const imageUrlInput = $('prod-image-url');

  if (imageFileInput) {
    imageFileInput.onchange = async () => {
      const file = imageFileInput.files[0];
      if (!file) return;

      const uploadStatus = $('prod-upload-status');
      if (uploadStatus) uploadStatus.textContent = 'Uploading image…';

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/images', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        if (data.url) {
          imageUrlInput.value = data.url;
          imagePreview.src = data.url;
          if (uploadStatus) uploadStatus.textContent = '✓ Image uploaded successfully!';
          showToast('Image uploaded successfully!');
        }
      } catch (e) {
        if (uploadStatus) uploadStatus.textContent = 'Upload error: ' + e.message;
        showToast('Image upload failed: ' + e.message, 'error');
      }
    };
  }

  if (imageUrlInput) {
    imageUrlInput.oninput = () => {
      if (imageUrlInput.value.trim()) {
        imagePreview.src = imageUrlInput.value.trim();
      }
    };
  }

  // Save Product Submit
  if ($('product-form')) {
    $('product-form').onsubmit = async e => {
      e.preventDefault();

      const payload = {
        name: $('prod-name').value.trim(),
        unit: $('prod-unit').value.trim(),
        size: parseFloat($('prod-size').value) || 1,
        sizeUnit: $('prod-size-unit').value.trim(),
        retailPrice: $('prod-retail-price').value ? parseFloat($('prod-retail-price').value) : null,
        bulkPrice: $('prod-bulk-price').value ? parseFloat($('prod-bulk-price').value) : null,
        bulkMinimum: parseInt($('prod-bulk-min').value, 10) || 1,
        gourmetRetailPrice: $('prod-gourmet-retail').value ? parseFloat($('prod-gourmet-retail').value) : null,
        gourmetBulkPrice: $('prod-gourmet-bulk').value ? parseFloat($('prod-gourmet-bulk').value) : null,
        availability: $('prod-availability').value,
        leadDays: parseInt($('prod-lead-days').value, 10) || 1,
        description: $('prod-description').value.trim(),
        image: $('prod-image-url').value.trim() || '/assets/ice-product.webp',
      };

      try {
        if (editingProductId) {
          // Update existing
          const res = await fetch(`/api/catalogue/${editingProductId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Failed to update product');
          const data = await res.json();
          const idx = catalogue.findIndex(p => p.id === editingProductId);
          if (idx !== -1) catalogue[idx] = data.product;
          showToast(`✓ Updated "${payload.name}" successfully!`);
        } else {
          // Create new
          const res = await fetch('/api/catalogue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Failed to create product');
          const created = await res.json();
          catalogue.unshift(created);
          showToast(`✓ Created new product "${payload.name}"!`);
        }

        closeProductModal();
        renderCatalogue();
        renderStats();
      } catch (err) {
        showToast('Error saving product: ' + err.message, 'error');
      }
    };
  }

  if ($('search-products')) $('search-products').oninput = renderCatalogue;
  if ($('filter-products-cat')) $('filter-products-cat').onchange = renderCatalogue;

  // -------------------------------------------------------------
  // Phone, WhatsApp & Store Contact Management
  // -------------------------------------------------------------
  function populateContactForm() {
    if ($('cfg-phone')) $('cfg-phone').value = siteSettings.phone || '+264 85 248 5426';
    if ($('cfg-whatsapp')) $('cfg-whatsapp').value = siteSettings.whatsapp || '264852485426';
    if ($('cfg-email')) $('cfg-email').value = siteSettings.email || 'info@coolerboxicehub.com';
    if ($('cfg-location')) $('cfg-location').value = businessSettings.location || 'Makalani Mall, Ongwediva, Namibia';
    if ($('cfg-hours')) $('cfg-hours').value = businessSettings.hours || 'Monday–Thursday: 09:00–19:00. Friday–Saturday: 09:00–20:00. Sunday: 10:00–18:00.';
    if ($('cfg-delivery')) $('cfg-delivery').value = businessSettings.deliveryAreas || 'Free delivery within 25 km of Makalani Mall on Thursdays for 3+ catalogue products.';

    const socials = siteSettings.socials || {};
    if ($('cfg-facebook')) $('cfg-facebook').value = socials.facebook || '';
    if ($('cfg-instagram')) $('cfg-instagram').value = socials.instagram || '';
    if ($('cfg-tiktok')) $('cfg-tiktok').value = socials.tiktok || '';
    if ($('cfg-linkedin')) $('cfg-linkedin').value = socials.linkedin || '';

    updateContactPreview();
  }

  function updateContactPreview() {
    const phone = $('cfg-phone') ? $('cfg-phone').value : '';
    const wa = $('cfg-whatsapp') ? $('cfg-whatsapp').value : '';
    const email = $('cfg-email') ? $('cfg-email').value : '';
    const loc = $('cfg-location') ? $('cfg-location').value : '';

    if ($('prev-phone')) $('prev-phone').textContent = phone || '—';
    if ($('prev-phone-link')) $('prev-phone-link').href = 'tel:' + phone.replace(/\s+/g, '');
    if ($('prev-wa')) $('prev-wa').textContent = '+' + wa.replace(/\D/g, '');
    if ($('prev-wa-link')) $('prev-wa-link').href = 'https://wa.me/' + wa.replace(/\D/g, '');
    if ($('prev-email')) $('prev-email').textContent = email || '—';
    if ($('prev-email-link')) $('prev-email-link').href = 'mailto:' + email;
    if ($('prev-location')) $('prev-location').textContent = loc || '—';
  }

  ['cfg-phone', 'cfg-whatsapp', 'cfg-email', 'cfg-location'].forEach(id => {
    if ($(id)) $(id).oninput = updateContactPreview;
  });

  // Test WhatsApp button
  if ($('btn-test-whatsapp')) {
    $('btn-test-whatsapp').onclick = () => {
      const wa = ($('cfg-whatsapp') ? $('cfg-whatsapp').value : '').replace(/\D/g, '');
      if (!wa) {
        showToast('Please enter a WhatsApp number first.', 'error');
        return;
      }
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent('Hello CoolerBox Ice Hub! This is a test message from your Admin Portal.')}`, '_blank');
    };
  }

  // Save Contact Settings Form
  if ($('contact-settings-form')) {
    $('contact-settings-form').onsubmit = async e => {
      e.preventDefault();

      const phone = $('cfg-phone').value.trim();
      const whatsapp = $('cfg-whatsapp').value.trim();
      const email = $('cfg-email').value.trim();
      const location = $('cfg-location').value.trim();
      const hours = $('cfg-hours').value.trim();
      const deliveryAreas = $('cfg-delivery').value.trim();

      const socials = {
        facebook: $('cfg-facebook') ? $('cfg-facebook').value.trim() : '',
        instagram: $('cfg-instagram') ? $('cfg-instagram').value.trim() : '',
        tiktok: $('cfg-tiktok') ? $('cfg-tiktok').value.trim() : '',
        linkedin: $('cfg-linkedin') ? $('cfg-linkedin').value.trim() : '',
      };

      try {
        const [setRes, bizRes] = await Promise.all([
          fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, whatsapp, email, socials }),
          }).then(r => r.json()),
          fetch('/api/business', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, hours, deliveryAreas }),
          }).then(r => r.json()),
        ]);

        siteSettings = setRes.settings || siteSettings;
        businessSettings = bizRes.business || businessSettings;

        renderStats();
        updateContactPreview();
        showToast('✓ Contact and phone details updated across entire website!');
      } catch (err) {
        showToast('Error saving contact settings: ' + err.message, 'error');
      }
    };
  }

  // -------------------------------------------------------------
  // Orders & Quotations
  // -------------------------------------------------------------
  function renderOrders() {
    const list = $('dash-orders-list');
    if (!list) return;
    list.replaceChildren();

    const filterStatus = $('dash-filter-status') ? $('dash-filter-status').value : 'all';
    const searchVal = $('dash-order-search') ? $('dash-order-search').value.trim().toLowerCase() : '';

    const filtered = orders.filter(o => {
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (searchVal) {
        const str = (o.reference + ' ' + (o.customer?.name || '') + ' ' + (o.customer?.phone || '')).toLowerCase();
        if (!str.includes(searchVal)) return false;
      }
      return true;
    });

    if (!filtered.length) {
      const p = document.createElement('p');
      p.className = 'empty-note';
      p.style.color = '#64748b';
      p.style.textAlign = 'center';
      p.style.padding = '30px';
      p.textContent = 'No matching quotation enquiries found.';
      list.appendChild(p);
      return;
    }

    filtered.forEach(o => {
      const card = document.createElement('article');
      card.className = 'admin-card';
      card.style.marginBottom = '18px';

      const head = document.createElement('div');
      head.className = 'admin-card-head';
      head.style.marginBottom = '12px';
      head.style.paddingBottom = '10px';

      const titleWrap = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = o.reference;
      title.style.margin = '0 0 4px';
      const dateText = document.createElement('span');
      dateText.style.fontSize = '12px';
      dateText.style.color = '#64748b';
      dateText.textContent = `Received: ${o.createdAt ? o.createdAt.slice(0, 16).replace('T', ' ') : '—'}`;
      titleWrap.append(title, dateText);

      const badge = document.createElement('span');
      badge.className = `badge-stock ${o.status === 'confirmed' ? 'available' : (o.status === 'new' ? 'advance-booking' : 'sold-out')}`;
      badge.textContent = o.status.toUpperCase();

      head.append(titleWrap, badge);

      const cust = o.customer || {};
      const det = o.details || {};
      const app = det.approval || {};

      const custInfo = document.createElement('p');
      custInfo.style.fontSize = '14px';
      custInfo.style.margin = '6px 0';
      custInfo.innerHTML = `<strong>Customer:</strong> ${cust.name || '—'} · <strong>Tel:</strong> <a href="tel:${cust.phone}" style="color:#006da6">${cust.phone || '—'}</a> · <strong>Email:</strong> ${cust.email || '—'}${cust.business ? ' · ' + cust.business : ''}`;

      const schedInfo = document.createElement('p');
      schedInfo.style.fontSize = '13px';
      schedInfo.style.color = '#536b7f';
      schedInfo.style.margin = '4px 0 12px';
      schedInfo.textContent = `Requested Date: ${det.date || '—'} ${det.time || ''} · Fulfilment: ${det.fulfilment || 'collection'}${det.address ? ' (' + det.address + ')' : ''}`;

      const itemsList = document.createElement('ul');
      itemsList.style.paddingLeft = '20px';
      itemsList.style.fontSize = '13px';
      itemsList.style.margin = '8px 0';
      o.items.forEach(it => {
        const li = document.createElement('li');
        li.textContent = `${it.quantity} × ${it.name} (${it.size} ${it.sizeUnit}) — ${it.unitPrice ? money(it.unitPrice) + ' ea' : 'Quote required'}`;
        itemsList.appendChild(li);
      });

      const totalInfo = document.createElement('p');
      totalInfo.style.margin = '10px 0';
      totalInfo.style.fontWeight = 'bold';
      totalInfo.style.color = '#006da6';
      totalInfo.textContent = o.totalCents !== null ? `Estimated Total: ${money(o.totalCents / 100)}` : 'Estimated Total: Quote required';

      // Actions / Milestones
      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '8px';
      actions.style.flexWrap = 'wrap';
      actions.style.alignItems = 'center';
      actions.style.paddingTop = '14px';
      actions.style.borderTop = '1px solid #f1f5f9';

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
          const ordRes = await fetch('/api/orders').then(r => r.json());
          orders = ordRes.orders || [];
          renderOrders();
          showToast(`Milestone updated: ${label}`);
        } catch (e) {
          showToast(e.message, 'error');
        }
      };

      const btnPrice = document.createElement('button');
      btnPrice.className = 'btn-admin-pill ghost';
      btnPrice.style.fontSize = '12px';
      btnPrice.textContent = app.priceConfirmed ? '✓ Price Confirmed' : 'Confirm Price';
      if (app.priceConfirmed) btnPrice.style.background = '#d1fae5';
      btnPrice.onclick = () => toggleMilestone('priceConfirmed', !app.priceConfirmed, 'Price');

      const btnAvail = document.createElement('button');
      btnAvail.className = 'btn-admin-pill ghost';
      btnAvail.style.fontSize = '12px';
      btnAvail.textContent = app.availabilityConfirmed ? '✓ Stock Confirmed' : 'Confirm Stock';
      if (app.availabilityConfirmed) btnAvail.style.background = '#d1fae5';
      btnAvail.onclick = () => toggleMilestone('availabilityConfirmed', !app.availabilityConfirmed, 'Stock Availability');

      const btnProd = document.createElement('button');
      btnProd.className = 'btn-admin-pill ghost';
      btnProd.style.fontSize = '12px';
      btnProd.textContent = app.productionAuthorised ? '✓ Production Ready' : 'Authorise Production';
      if (app.productionAuthorised) btnProd.style.background = '#d1fae5';
      btnProd.onclick = () => toggleMilestone('productionAuthorised', !app.productionAuthorised, 'Production');

      // WhatsApp Customer Link
      if (cust.phone) {
        const cleanPhone = cust.phone.replace(/\D/g, '');
        const waBtn = document.createElement('a');
        waBtn.className = 'btn-admin-pill ghost';
        waBtn.style.color = '#059669';
        waBtn.style.fontSize = '12px';
        waBtn.target = '_blank';
        waBtn.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello ${cust.name || 'valued customer'}, regarding your CoolerBox order enquiry ${o.reference}:`)}`;
        waBtn.innerHTML = '💬 WhatsApp Customer';
        actions.appendChild(waBtn);
      }

      // Status selector
      const statusSelect = document.createElement('select');
      statusSelect.className = 'form-control';
      statusSelect.style.width = 'auto';
      statusSelect.style.padding = '6px 12px';
      statusSelect.style.fontSize = '12px';
      ['new', 'quoted', 'confirmed', 'completed', 'cancelled'].forEach(st => {
        const opt = document.createElement('option');
        opt.value = st;
        opt.textContent = 'Status: ' + st;
        if (o.status === st) opt.selected = true;
        statusSelect.appendChild(opt);
      });
      statusSelect.onchange = async () => {
        await fetch(`/api/orders/${o.reference}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: statusSelect.value, note: `Status updated to ${statusSelect.value}.` }),
        });
        const ordRes = await fetch('/api/orders').then(r => r.json());
        orders = ordRes.orders || [];
        renderOrders();
        renderStats();
        showToast(`Order status updated to ${statusSelect.value}`);
      };

      actions.append(btnPrice, btnAvail, btnProd, statusSelect);

      card.append(head, custInfo, schedInfo, itemsList, totalInfo, actions);
      list.appendChild(card);
    });
  }

  if ($('dash-filter-status')) $('dash-filter-status').onchange = renderOrders;
  if ($('dash-order-search')) $('dash-order-search').oninput = renderOrders;

  // -------------------------------------------------------------
  // Reviews Moderation & Add Review
  // -------------------------------------------------------------
  function renderReviews() {
    const list = $('dash-rev-list');
    if (!list) return;
    list.replaceChildren();

    if (!reviews.length) {
      const p = document.createElement('p');
      p.className = 'empty-note';
      p.style.color = '#64748b';
      p.style.padding = '20px 0';
      p.textContent = 'No reviews submitted yet. Use the form below to publish store reviews.';
      list.appendChild(p);
      return;
    }

    reviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'admin-card';
      card.style.marginBottom = '12px';
      card.style.padding = '16px';

      const top = document.createElement('div');
      top.style.display = 'flex';
      top.style.justifyContent = 'space-between';
      top.style.alignItems = 'center';

      const stars = document.createElement('div');
      stars.style.color = '#f59e0b';
      stars.style.fontSize = '16px';
      stars.textContent = '★'.repeat(r.rating || 5);

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-admin-pill ghost';
      delBtn.style.color = '#ef4444';
      delBtn.style.padding = '4px 10px';
      delBtn.style.fontSize = '12px';
      delBtn.textContent = 'Delete';
      delBtn.onclick = async () => {
        if (!confirm('Delete this review?')) return;
        await fetch(`/api/reviews/${r.id}`, { method: 'DELETE' });
        reviews = reviews.filter(item => item.id !== r.id);
        renderReviews();
        renderStats();
        showToast('Review removed.');
      };

      top.append(stars, delBtn);

      const title = document.createElement('h4');
      title.textContent = r.title;
      title.style.margin = '8px 0 4px';

      const body = document.createElement('p');
      body.textContent = r.body;
      body.style.margin = '4px 0 8px';
      body.style.fontSize = '13.5px';
      body.style.color = '#334155';

      const meta = document.createElement('div');
      meta.style.fontSize = '12px';
      meta.style.color = '#64748b';
      meta.textContent = `By ${r.author || 'Anonymous customer'} · ${r.createdAt ? r.createdAt.slice(0, 10) : ''}`;

      card.append(top, title, body, meta);
      list.appendChild(card);
    });
  }

  // Add Review Form
  if ($('admin-add-review-form')) {
    $('admin-add-review-form').onsubmit = async e => {
      e.preventDefault();
      const name = $('rev-author').value.trim() || 'Valued Customer';
      const rating = parseInt($('rev-rating').value, 10) || 5;
      const title = $('rev-title').value.trim();
      const comment = $('rev-body').value.trim();

      if (!title || !comment) return;

      try {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: 'rev-' + Date.now(),
            name,
            rating,
            title,
            comment,
            anonymous: false,
          }),
        });

        const revRes = await fetch('/api/reviews').then(r => r.json());
        reviews = Array.isArray(revRes) ? revRes : [];
        $('admin-add-review-form').reset();
        renderReviews();
        renderStats();
        showToast('✓ Review published to storefront!');
      } catch (err) {
        showToast('Error publishing review: ' + err.message, 'error');
      }
    };
  }

  // -------------------------------------------------------------
  // Announcements & Noticeboard
  // -------------------------------------------------------------
  function renderPosts() {
    const list = $('dash-post-list');
    if (!list) return;
    list.replaceChildren();

    if (!posts.length) {
      const p = document.createElement('p');
      p.className = 'empty-note';
      p.style.color = '#64748b';
      p.textContent = 'No announcements published yet.';
      list.appendChild(p);
      return;
    }

    posts.forEach(p => {
      const card = document.createElement('div');
      card.className = 'admin-card';
      card.style.marginBottom = '12px';
      card.style.padding = '16px';

      const top = document.createElement('div');
      top.style.display = 'flex';
      top.style.justifyContent = 'space-between';
      top.style.alignItems = 'center';

      const tag = document.createElement('span');
      tag.className = 'badge-stock available';
      tag.textContent = (p.category || 'news').toUpperCase();

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-admin-pill ghost';
      delBtn.style.color = '#ef4444';
      delBtn.style.padding = '4px 10px';
      delBtn.style.fontSize = '12px';
      delBtn.textContent = 'Delete';
      delBtn.onclick = async () => {
        if (!confirm('Delete this announcement?')) return;
        await fetch(`/api/posts/${p.id}`, { method: 'DELETE' });
        posts = posts.filter(item => item.id !== p.id);
        renderPosts();
        showToast('Announcement removed.');
      };

      top.append(tag, delBtn);

      const title = document.createElement('h4');
      title.textContent = p.title;
      title.style.margin = '8px 0 4px';

      const body = document.createElement('p');
      body.textContent = p.body;
      body.style.margin = '4px 0 8px';
      body.style.fontSize = '13.5px';

      const meta = document.createElement('div');
      meta.style.fontSize = '12px';
      meta.style.color = '#64748b';
      meta.textContent = `${p.location || 'Makalani Mall'} · ${p.createdAt ? p.createdAt.slice(0, 10) : ''}`;

      card.append(top, title, body, meta);
      list.appendChild(card);
    });
  }

  // Create Post
  if ($('dash-new-post-form')) {
    $('dash-new-post-form').onsubmit = async e => {
      e.preventDefault();
      const title = $('post-title').value.trim();
      const category = $('post-category').value;
      const body = $('post-body').value.trim();
      const location = $('post-location').value.trim();

      if (!title || !body) return;

      try {
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, category, body, location }),
        });

        const postRes = await fetch('/api/posts').then(r => r.json());
        posts = Array.isArray(postRes) ? postRes : [];
        $('dash-new-post-form').reset();
        renderPosts();
        showToast('✓ Announcement published to noticeboard!');
      } catch (err) {
        showToast('Error publishing announcement: ' + err.message, 'error');
      }
    };
  }

  // Initialize on dom ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
