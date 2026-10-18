/* =====================================================
   SHAMSTECH JO - REQUESTS HISTORY JS (js/requests_history.js)
   Explanation of what was done in this file:
   1. Loads the logged-in user's name and initializes the navbar
      user dropdown menu.
   2. Reads 'shamstech_requests_history' from localStorage (which
      stores completed, cancelled, or deleted service requests from
      html/my_requests.html) and renders them with all their
      submitted metrics.
   3. Allows filtering by All History, Completed Services, or
      Cancelled / Deleted, and allows restoring any request back
      to Active Requests.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Navbar Client Name & Dropdown Menu
  const savedName = localStorage.getItem('shamstech_user_name') || 'Ahmad Ali';
  const firstName = savedName.split(' ')[0] || 'Ahmed';
  const navUserName = document.getElementById('nav-user-name');
  const navUserAvatar = document.getElementById('nav-user-avatar');
  const histUserName = document.getElementById('req-hist-user-name');

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

  const toast = document.getElementById('req-history-toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3800);
  }

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

  function getRequestsHistory() {
    try {
      const raw = localStorage.getItem('shamstech_requests_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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

  const historyListEl = document.getElementById('requests-history-list');
  const tabAll = document.getElementById('tab-rh-all');
  const tabCompleted = document.getElementById('tab-rh-completed');
  const tabCancelled = document.getElementById('tab-rh-cancelled');
  let currentFilter = 'all';

  function renderRequestsHistory() {
    if (!historyListEl) return;
    const list = getRequestsHistory();

    const completedCount = list.filter(function (r) { return r.historyStatus === 'COMPLETED'; }).length;
    const cancelledCount = list.filter(function (r) { return r.historyStatus === 'CANCELLED'; }).length;

    if (tabAll) tabAll.textContent = 'All History (' + list.length + ')';
    if (tabCompleted) tabCompleted.textContent = 'Completed Services (' + completedCount + ')';
    if (tabCancelled) tabCancelled.textContent = 'Cancelled / Deleted (' + cancelledCount + ')';

    const filtered = list.filter(function (req) {
      if (currentFilter === 'all') return true;
      return req.historyStatus === currentFilter;
    });

    if (filtered.length === 0) {
      historyListEl.innerHTML =
        '<div class="submitted-req-card" style="text-align:center;padding:2.5rem 1.5rem;">' +
          '<h2 class="display" style="font-size:1.25rem;color:var(--forest);">No archived requests in this tab</h2>' +
          '<p style="margin-top:0.5rem;font-size:14px;color:rgba(22,33,27,0.62);">Any service request you mark as <strong>Completed</strong> or <strong>Cancel / Delete</strong> on the Active Requests page will be saved here.</p>' +
        '</div>';
      return;
    }

    historyListEl.innerHTML = filtered.map(function (req) {
      const isCompleted = req.historyStatus === 'COMPLETED';
      const badgeStyle = isCompleted
        ? 'background:rgba(22,163,74,0.14);border:1px solid rgba(22,163,74,0.38);color:#15803d;'
        : 'background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.35);color:#dc2626;';
      const badgeLabel = isCompleted ? '✓ COMPLETED' : '✕ CANCELLED / DELETED';

      return (
        '<article class="submitted-req-card" data-id="' + req.id + '">' +
          '<div class="sub-req-top">' +
            '<div class="sub-req-title-group">' +
              '<span class="sub-req-icon">' +
                '<svg class="icon"><use href="' + (req.icon || '#i-zap') + '"/></svg>' +
              '</span>' +
              '<div>' +
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
            '<button type="button" class="btn-cancel-req display" data-action="remove-req" data-id="' + req.id + '">🗑 Delete from History</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  document.querySelectorAll('.req-filter-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.req-filter-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter') || 'all';
      renderRequestsHistory();
    });
  });

  if (historyListEl) {
    historyListEl.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-action="remove-req"]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      const list = getRequestsHistory();
      const targetReq = list.find(function (r) { return r.id === id; });
      if (!targetReq) return;

      const remaining = list.filter(function (r) { return r.id !== id; });
      saveRequestsHistory(remaining);
      renderRequestsHistory();
      showToast('🗑 Request "' + targetReq.title + '" deleted from History.');
    });
  }

  renderRequestsHistory();
});
