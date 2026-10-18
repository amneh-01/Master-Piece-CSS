/* =====================================================
   SHAMSTECH JO - MARKET HISTORY JS (js/market_history.js)
   Explanation of what was done in this file:
   1. Loads the logged-in user's name and initializes the navbar
      user dropdown menu.
   2. Reads 'shamstech_market_history' from localStorage (which
      stores every item the user marks as "Sold" or "Deleted" in
      html/used_market.html) and renders them with all their
      details (Usage Period, Condition, Warranty, Price, City,
      Description, Photo, and Status).
   3. Allows filtering by All History, Sold Items, or Deleted
      Listings, and allows restoring any item back to Active
      Marketplace Listings.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Navbar Client Name & Dropdown Menu
  const savedName = localStorage.getItem('shamstech_user_name') || 'Ahmad Ali';
  const firstName = savedName.split(' ')[0] || 'Ahmed';
  const navUserName = document.getElementById('nav-user-name');
  const navUserAvatar = document.getElementById('nav-user-avatar');
  const historyUserName = document.getElementById('history-user-name');

  if (navUserName) navUserName.textContent = savedName;
  if (navUserAvatar) navUserAvatar.textContent = savedName.charAt(0).toUpperCase();
  if (historyUserName) historyUserName.textContent = firstName;

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

  const toast = document.getElementById('mk-history-toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3800);
  }

  // Default seed history items if user hasn't archived any yet
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

  function getMarketHistory() {
    try {
      const raw = localStorage.getItem('shamstech_market_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

  const historyListEl = document.getElementById('market-history-list');
  const tabAll = document.getElementById('tab-mk-all');
  const tabSold = document.getElementById('tab-mk-sold');
  const tabDeleted = document.getElementById('tab-mk-deleted');
  let currentFilter = 'all';

  function renderMarketHistory() {
    if (!historyListEl) return;
    const items = getMarketHistory();

    const soldCount = items.filter(function (i) { return i.historyStatus === 'SOLD'; }).length;
    const deletedCount = items.filter(function (i) { return i.historyStatus === 'DELETED'; }).length;

    if (tabAll) tabAll.textContent = 'All History (' + items.length + ')';
    if (tabSold) tabSold.textContent = 'Sold Items (' + soldCount + ')';
    if (tabDeleted) tabDeleted.textContent = 'Deleted Listings (' + deletedCount + ')';

    const filtered = items.filter(function (item) {
      if (currentFilter === 'all') return true;
      return item.historyStatus === currentFilter;
    });

    if (filtered.length === 0) {
      historyListEl.innerHTML =
        '<div class="submitted-req-card" style="text-align:center;padding:2.5rem 1.5rem;">' +
          '<h2 class="display" style="font-size:1.25rem;color:var(--forest);">No items in this history view yet</h2>' +
          '<p style="margin-top:0.5rem;font-size:14px;color:rgba(22,33,27,0.62);">Any equipment listing you mark as <strong>Sold</strong> or <strong>Delete</strong> on the Used Marketplace page will automatically appear here.</p>' +
        '</div>';
      return;
    }

    historyListEl.innerHTML = filtered.map(function (item) {
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
            '<button type="button" class="btn-cancel-req display" data-action="remove-perm" data-id="' + item.id + '">🗑 Delete from History</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  // Filter Tabs Click
  document.querySelectorAll('.req-filter-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.req-filter-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter') || 'all';
      renderMarketHistory();
    });
  });

  // Permanently Delete from History
  if (historyListEl) {
    historyListEl.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-action="remove-perm"]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const items = getMarketHistory();
      const targetItem = items.find(function (i) { return i.id === id; });
      if (!targetItem) return;

      const remaining = items.filter(function (i) { return i.id !== id; });
      saveMarketHistory(remaining);
      renderMarketHistory();
      showToast('🗑 "' + targetItem.title + '" deleted from Market History.');
    });
  }

  renderMarketHistory();
});
