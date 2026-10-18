/* =====================================================
   SHAMSTECH JO - UNIFIED HISTORY & ARCHIVES JS (js/history_archives.js)
   Explanation of what was done in this file:
   1. Powers the single unified "History & Archives" page with
      a two-tab switcher:
      - Tab 1: Requests History (سجل الأنشطة والطلبات)
      - Tab 2: Sales History (سجل الأجهزة والمبيعات)
   2. Reads 'shamstech_requests_history' and 'shamstech_market_history'
      from localStorage and renders them inside their respective tabs
      with sub-filters and live counts.
   3. Includes a confirmation modal when permanently deleting any
      archived record from either tab.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Navbar Client Name & Dropdown Menu
  const savedName = localStorage.getItem('shamstech_user_name') || 'Ahmad Ali';
  const firstName = savedName.split(' ')[0] || 'Ahmed';
  const navUserName = document.getElementById('nav-user-name');
  const navUserAvatar = document.getElementById('nav-user-avatar');
  const histUserName = document.getElementById('hist-user-name');

  if (navUserName) navUserName.textContent = savedName;
  if (navUserAvatar) navUserAvatar.textContent = savedName.charAt(0).toUpperCase();
  if (histUserName) histUserName.textContent = firstName;

  const clientMenuWrap = document.getElementById('client-menu-wrap');
  const clientNameBtn = document.getElementById('client-name-btn');
  if (clientMenuWrap && clientNameBtn) {
    clientNameBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      clientMenuWrap.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!clientMenuWrap.contains(e.target)) {
        clientMenuWrap.classList.remove('open');
      }
    });
  }

  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      menuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  const toast = document.getElementById('history-toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3800);
  }

  // =====================================================
  // 2. DATA HELPERS FOR TAB 1 (REQUESTS) & TAB 2 (SALES)
  // =====================================================
  const DEFAULT_REQUESTS_HISTORY = [
    {
      id: '#AI-4410',
      title: 'AI Thermal & Surface Defect Diagnosis Scan',
      meta: 'ID: #AI-4410 • Service: AI Fault Diagnosis • Oct 08, 2026',
      icon: '#i-cpu',
      metric1Label: 'DETECTED ISSUE',
      metric1Value: 'Soiling Defect (Heavy Dust)',
      metric2Label: 'CONFIDENCE RATE',
      metric2Value: '94% AI Accuracy',
      metric3Label: 'EFFICIENCY IMPACT',
      metric3Value: '-18% Output Drop',
      statusNote: '✓ Completed: AI analysis completed and maintenance cleaning recommendations generated.',
      historyStatus: 'COMPLETED',
      archivedDate: 'Oct 08, 2026'
    },
    {
      id: '#REQ-2026-0710',
      title: 'Seasonal Solar Panel Soft-Wash & Inverter Check',
      meta: 'ID: #REQ-2026-0710 • Location: Amman, Khalda • Sep 19, 2026',
      icon: '#i-wrench',
      metric1Label: 'SERVICE TYPE',
      metric1Value: 'Full Maintenance + Wash',
      metric2Label: 'SOLAR PANELS',
      metric2Value: '16 Panels Cleaned',
      metric3Label: 'FINAL INVOICE',
      metric3Value: '55 JOD (Paid)',
      statusNote: '✓ Completed: Deionized water wash and string voltage inspection completed by Jordan SunWash Ltd.',
      historyStatus: 'COMPLETED',
      archivedDate: 'Sep 21, 2026'
    }
  ];

  const DEFAULT_MARKET_HISTORY = [
    {
      id: 'hist-sma-6kw',
      title: 'SMA Sunny Boy 6kW On-Grid Inverter',
      city: 'Amman',
      phone: '+962 79 582 4190',
      price: '310',
      usage: '1 Year',
      condition: 'Excellent',
      warranty: 'Has Official Warranty',
      description: 'Sold to verified homeowner in West Amman after system upgrade.',
      img: '/images/inverter.jpg',
      historyStatus: 'SOLD',
      historyDate: 'Oct 02, 2026'
    },
    {
      id: 'hist-mounting-rails',
      title: 'Galvanized Rooftop Mounting Structure (8 Panels)',
      city: 'Irbid',
      phone: '+962 79 582 4190',
      price: '65',
      usage: 'More than 2 Years',
      condition: 'Good',
      warranty: 'No Warranty',
      description: 'Listing removed by seller — kept for secondary farm shed.',
      img: '/images/racks.jpg',
      historyStatus: 'DELETED',
      historyDate: 'Sep 27, 2026'
    }
  ];

  function getRequestsHistory() {
    try {
      const raw = localStorage.getItem('shamstech_requests_history');
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    localStorage.setItem('shamstech_requests_history', JSON.stringify(DEFAULT_REQUESTS_HISTORY));
    return DEFAULT_REQUESTS_HISTORY;
  }

  function saveRequestsHistory(list) {
    try {
      localStorage.setItem('shamstech_requests_history', JSON.stringify(list));
    } catch (e) {}
  }

  function getMarketHistory() {
    try {
      const raw = localStorage.getItem('shamstech_market_history');
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    localStorage.setItem('shamstech_market_history', JSON.stringify(DEFAULT_MARKET_HISTORY));
    return DEFAULT_MARKET_HISTORY;
  }

  function saveMarketHistory(items) {
    try {
      localStorage.setItem('shamstech_market_history', JSON.stringify(items));
    } catch (e) {}
  }

  // =====================================================
  // 3. MAIN TAB SWITCHER (TAB 1: REQUESTS HISTORY | TAB 2: SALES HISTORY)
  // =====================================================
  const mainTabRequests = document.getElementById('main-tab-requests');
  const mainTabSales = document.getElementById('main-tab-sales');
  const countBadgeRequests = document.getElementById('count-badge-requests');
  const countBadgeSales = document.getElementById('count-badge-sales');
  const panelRequests = document.getElementById('panel-requests-history');
  const panelSales = document.getElementById('panel-sales-history');

  function switchMainTab(targetTab) {
    const isSales = targetTab === 'sales';
    if (mainTabRequests) mainTabRequests.classList.toggle('active', !isSales);
    if (mainTabSales) mainTabSales.classList.toggle('active', isSales);
    if (panelRequests) panelRequests.style.display = isSales ? 'none' : 'block';
    if (panelSales) panelSales.style.display = isSales ? 'block' : 'none';
  }

  if (mainTabRequests) {
    mainTabRequests.addEventListener('click', function () {
      switchMainTab('requests');
    });
  }
  if (mainTabSales) {
    mainTabSales.addEventListener('click', function () {
      switchMainTab('sales');
    });
  }

  // Determine initial main tab from URL (?tab=sales or /market_history.html)
  const params = new URLSearchParams(window.location.search);
  const urlTab = params.get('tab');
  if (urlTab === 'sales' || window.location.pathname.indexOf('market_history') !== -1) {
    switchMainTab('sales');
  } else {
    switchMainTab('requests');
  }

  // =====================================================
  // 4. RENDER TAB 1: REQUESTS HISTORY
  // =====================================================
  const reqHistoryListEl = document.getElementById('requests-history-list');
  const tabRhAll = document.getElementById('tab-rh-all');
  const tabRhCompleted = document.getElementById('tab-rh-completed');
  const tabRhCancelled = document.getElementById('tab-rh-cancelled');
  let currentReqFilter = 'all';

  function renderRequestsHistory() {
    if (!reqHistoryListEl) return;
    const list = getRequestsHistory();

    const completedCount = list.filter(function (r) { return r.historyStatus === 'COMPLETED'; }).length;
    const cancelledCount = list.filter(function (r) { return r.historyStatus === 'CANCELLED'; }).length;

    if (countBadgeRequests) countBadgeRequests.textContent = String(list.length);
    if (tabRhAll) tabRhAll.textContent = 'All Requests (' + list.length + ')';
    if (tabRhCompleted) tabRhCompleted.textContent = 'Completed Services (' + completedCount + ')';
    if (tabRhCancelled) tabRhCancelled.textContent = 'Cancelled / Deleted (' + cancelledCount + ')';

    const filtered = list.filter(function (req) {
      if (currentReqFilter === 'all') return true;
      return req.historyStatus === currentReqFilter;
    });

    if (filtered.length === 0) {
      reqHistoryListEl.innerHTML =
        '<div class="submitted-req-card" style="text-align:center;padding:2.5rem 1.5rem;">' +
          '<h2 class="display" style="font-size:1.25rem;color:var(--forest);">No archived requests in this filter</h2>' +
          '<p style="margin-top:0.5rem;font-size:14px;color:rgba(22,33,27,0.62);">Any service request you mark as <strong>Completed</strong> or <strong>Cancel / Delete</strong> on the Active Requests page will be saved here.</p>' +
        '</div>';
      return;
    }

    reqHistoryListEl.innerHTML = filtered.map(function (req) {
      const isCompleted = req.historyStatus === 'COMPLETED';
      const badgeStyle = isCompleted
        ? 'background:rgba(22,163,74,0.14);border:1px solid rgba(22,163,74,0.38);color:#15803d;'
        : 'background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.35);color:#dc2626;';
      const badgeLabel = isCompleted ? '✓ COMPLETED' : '✕ CANCELLED / DELETED';

      const sv = ShamsTracking.detect(req.title, req.icon, req.metric1Value), sf = ShamsTracking.FLOWS[sv];   // same service colors as the requests page
      return (
        // Service design: same service color, icon and chip as the Active Requests page.
        '<article class="submitted-req-card" data-svc="' + sv + '" style="--svc:' + sf.color + '" data-id="' + req.id + '">' +
          '<div class="sub-req-top">' +
            '<div class="sub-req-title-group">' +
              '<span class="sub-req-icon">' +
                // Service design: the icon is the service icon (same as the home page).
                '<svg class="icon"><use href="' + sf.icon + '"/></svg>' +
              '</span>' +
              '<div>' +
                // Service design: service chip.
                '<span class="svc-chip">' + sf.label + '</span>' +
                '<h2 class="display" style="cursor:default;">' + req.title + '</h2>' +
                '<p class="sub-req-meta">' + req.meta + ' • Archived: ' + (req.archivedDate || 'Oct 11, 2026') + '</p>' +
              '</div>' +
            '</div>' +
            '<span class="sub-req-badge display" style="' + badgeStyle + '">' + badgeLabel + '</span>' +
          '</div>' +

          '<div class="sub-req-metrics">' +
            '<div class="metric-item">' +
              '<span>' + (req.metric1Label || 'SERVICE TYPE') + '</span>' +
              '<strong class="display">' + (req.metric1Value || 'Solar Service') + '</strong>' +
            '</div>' +
            '<div class="metric-item">' +
              '<span>' + (req.metric2Label || 'DETAILS') + '</span>' +
              '<strong class="display">' + (req.metric2Value || 'Verified') + '</strong>' +
            '</div>' +
            '<div class="metric-item">' +
              '<span>' + (req.metric3Label || 'TIMELINE / CONTACT') + '</span>' +
              '<strong class="display">' + (req.metric3Value || 'Completed') + '</strong>' +
            '</div>' +
          '</div>' +

          '<div class="sub-req-status-box">' +
            '<p>' + (req.statusNote || 'Archived service request record.') + '</p>' +
          '</div>' +

          '<div class="sub-req-actions" style="justify-content:flex-end;">' +
            '<button type="button" class="btn-cancel-req display" data-delete-type="request" data-id="' + req.id + '" data-title="' + req.title.replace(/"/g, '&quot;') + '">🗑 Delete from History</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  document.querySelectorAll('[data-req-subfilter]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('[data-req-subfilter]').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentReqFilter = tab.getAttribute('data-req-subfilter') || 'all';
      renderRequestsHistory();
    });
  });

  // =====================================================
  // 5. RENDER TAB 2: SALES HISTORY
  // =====================================================
  const salesHistoryListEl = document.getElementById('market-history-list');
  const tabMkAll = document.getElementById('tab-mk-all');
  const tabMkSold = document.getElementById('tab-mk-sold');
  const tabMkDeleted = document.getElementById('tab-mk-deleted');
  let currentSalesFilter = 'all';

  function renderSalesHistory() {
    if (!salesHistoryListEl) return;
    const items = getMarketHistory();

    const soldCount = items.filter(function (i) { return i.historyStatus === 'SOLD'; }).length;
    const deletedCount = items.filter(function (i) { return i.historyStatus === 'DELETED'; }).length;

    if (countBadgeSales) countBadgeSales.textContent = String(items.length);
    if (tabMkAll) tabMkAll.textContent = 'All Sales & Listings (' + items.length + ')';
    if (tabMkSold) tabMkSold.textContent = 'Sold Items (' + soldCount + ')';
    if (tabMkDeleted) tabMkDeleted.textContent = 'Deleted Listings (' + deletedCount + ')';

    const filtered = items.filter(function (item) {
      if (currentSalesFilter === 'all') return true;
      return item.historyStatus === currentSalesFilter;
    });

    if (filtered.length === 0) {
      salesHistoryListEl.innerHTML =
        '<div class="submitted-req-card" style="text-align:center;padding:2.5rem 1.5rem;">' +
          '<h2 class="display" style="font-size:1.25rem;color:var(--forest);">No items in this sales history view yet</h2>' +
          '<p style="margin-top:0.5rem;font-size:14px;color:rgba(22,33,27,0.62);">Any equipment listing you mark as <strong>Sold</strong> or <strong>Delete</strong> on the Used Marketplace page will automatically appear here.</p>' +
        '</div>';
      return;
    }

    salesHistoryListEl.innerHTML = filtered.map(function (item) {
      const isSold = item.historyStatus === 'SOLD';
      const badgeStyle = isSold
        ? 'background:rgba(22,163,74,0.14);border:1px solid rgba(22,163,74,0.38);color:#15803d;'
        : 'background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.35);color:#dc2626;';
      const badgeLabel = isSold ? '✓ SOLD ITEM' : '🗑 DELETED LISTING';

      return (
        '<article class="submitted-req-card" data-id="' + item.id + '">' +
          '<div class="sub-req-top">' +
            '<div class="sub-req-title-group" style="align-items:center;">' +
              '<img src="' + (item.img || '/images/panel.jpg') + '" alt="' + item.title + '" style="width:4.4rem;height:4.4rem;border-radius:1rem;object-fit:cover;border:1px solid rgba(22,33,27,0.12);flex-shrink:0;">' +
              '<div>' +
                '<h2 class="display" style="cursor:default;">' + item.title + '</h2>' +
                '<p class="sub-req-meta">Location: ' + (item.city || 'Amman') + ' • Seller Phone: ' + (item.phone || '+962 79 582 4190') + ' • Archived: ' + (item.historyDate || 'Oct 11, 2026') + '</p>' +
              '</div>' +
            '</div>' +
            '<span class="sub-req-badge display" style="' + badgeStyle + '">' + badgeLabel + '</span>' +
          '</div>' +

          '<div class="sub-req-metrics" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));">' +
            '<div class="metric-item">' +
              '<span>ASKING PRICE</span>' +
              '<strong class="display">' + item.price + ' JOD</strong>' +
            '</div>' +
            '<div class="metric-item">' +
              '<span>USAGE PERIOD</span>' +
              '<strong class="display">' + (item.usage || '1 Year') + '</strong>' +
            '</div>' +
            '<div class="metric-item">' +
              '<span>CONDITION</span>' +
              '<strong class="display">' + (item.condition || 'Excellent') + '</strong>' +
            '</div>' +
            '<div class="metric-item">' +
              '<span>WARRANTY</span>' +
              '<strong class="display">' + (item.warranty || 'Has Official Warranty') + '</strong>' +
            '</div>' +
          '</div>' +

          '<div class="sub-req-status-box">' +
            '<p>📋 <strong>Seller Notes / Reason for Sale:</strong> ' + (item.description || 'Standard verified solar equipment.') + '</p>' +
          '</div>' +

          '<div class="sub-req-actions" style="justify-content:flex-end;">' +
            '<button type="button" class="btn-cancel-req display" data-delete-type="sales" data-id="' + item.id + '" data-title="' + item.title.replace(/"/g, '&quot;') + '">🗑 Delete from History</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  document.querySelectorAll('[data-sales-subfilter]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('[data-sales-subfilter]').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentSalesFilter = tab.getAttribute('data-sales-subfilter') || 'all';
      renderSalesHistory();
    });
  });

  // =====================================================
  // 6. DELETE FROM HISTORY CONFIRMATION MODAL
  // =====================================================
  const histDeleteModal = document.getElementById('hist-delete-modal-backdrop');
  const histDeleteNameEl = document.getElementById('hist-delete-item-name');
  const histConfirmDeleteBtn = document.getElementById('hist-confirm-delete-btn');
  const histCancelDeleteBtn = document.getElementById('hist-cancel-delete-btn');

  let pendingDeleteType = null; // 'request' | 'sales'
  let pendingDeleteId = null;
  let pendingDeleteTitle = '';

  function openHistDeleteModal(type, id, title) {
    pendingDeleteType = type;
    pendingDeleteId = id;
    pendingDeleteTitle = title || 'this item';
    if (histDeleteNameEl) {
      histDeleteNameEl.textContent = '"' + pendingDeleteTitle + '"';
    }
    if (histDeleteModal) {
      histDeleteModal.classList.add('open');
      histDeleteModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeHistDeleteModal() {
    pendingDeleteType = null;
    pendingDeleteId = null;
    if (histDeleteModal) {
      histDeleteModal.classList.remove('open');
      histDeleteModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (histCancelDeleteBtn) {
    histCancelDeleteBtn.addEventListener('click', closeHistDeleteModal);
  }
  if (histDeleteModal) {
    histDeleteModal.addEventListener('click', function (e) {
      if (e.target === histDeleteModal) closeHistDeleteModal();
    });
  }

  if (histConfirmDeleteBtn) {
    histConfirmDeleteBtn.addEventListener('click', function () {
      if (!pendingDeleteType || !pendingDeleteId) return;
      if (pendingDeleteType === 'request') {
        const remaining = getRequestsHistory().filter(function (r) { return r.id !== pendingDeleteId; });
        saveRequestsHistory(remaining);
        renderRequestsHistory();
        showToast('🗑 Request "' + pendingDeleteTitle + '" permanently deleted from History.');
      } else if (pendingDeleteType === 'sales') {
        const remaining = getMarketHistory().filter(function (i) { return i.id !== pendingDeleteId; });
        saveMarketHistory(remaining);
        renderSalesHistory();
        showToast('🗑 Item "' + pendingDeleteTitle + '" permanently deleted from Sales History.');
      }
      closeHistDeleteModal();
    });
  }

  document.addEventListener('click', function (e) {
    const delBtn = e.target.closest('button[data-delete-type]');
    if (!delBtn) return;
    const type = delBtn.getAttribute('data-delete-type');
    const id = delBtn.getAttribute('data-id');
    const title = delBtn.getAttribute('data-title') || 'Archived Record';
    openHistDeleteModal(type, id, title);
  });

  renderRequestsHistory();
  renderSalesHistory();
});
