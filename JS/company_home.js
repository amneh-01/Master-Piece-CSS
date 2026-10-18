/* =====================================================
   SHAMSTECH JO - SOLAR COMPANY DASHBOARD JS (js/company_home.js)
   Explanation of what was done in this file:
   1. Route Guard: Ensures only authenticated Solar Companies
      ('shamstech_user_role' === 'company') can access this page.
      Unauthorized visitors are automatically redirected to the
      company login tab.
   2. Loads Company Name & Avatar dynamically into the Navbar
      and Hero Welcome banner.
   3. Handles Company Log Out: Clears the session role and
      safely returns to the login portal.
   4. Renders and manages the "Bids & Offers Submitted Status"
      table, KPI summary counters, and interactive quotation modals.
   5. Dynamically displays client requests submitted through the
      marketplace alongside commercial tenders.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Role Guard Verification
  const userRole = localStorage.getItem('shamstech_user_role');
  if (userRole !== 'company') {
    if (userRole === 'client') {
      window.location.replace('/html/client_home.html');
      return;
    } else {
      window.location.replace('/html/login.html?role=company');
      return;
    }
  }

  // 2. Load Company Name & Avatar into Navbar and Welcome Heading
  let savedCompanyProfile = {};
  try { savedCompanyProfile = JSON.parse(localStorage.getItem('shamstech_company_profile')) || {}; } catch (e) {}
  const rawCompName = savedCompanyProfile.name || localStorage.getItem('shamstech_company_name') || localStorage.getItem('shamstech_user_name') || 'Al-Fanar Energy Co.';
  const navCompName = document.getElementById('nav-comp-name');
  const navCompAvatar = document.getElementById('nav-comp-avatar');
  const welcomeCompName = document.getElementById('welcome-comp-name');

  if (navCompName) navCompName.textContent = rawCompName;
  if (welcomeCompName) welcomeCompName.textContent = rawCompName;
  if (navCompAvatar) {
    const words = rawCompName.trim().split(/\s+/);
    const initials = words.length > 1
      ? (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
      : rawCompName.slice(0, 2).toUpperCase();
    navCompAvatar.textContent = initials;
  }

  // 3. Navbar Dropdown & Mobile Menu
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

  // 4. Log Out Handling
  function performCompanyLogout() {
    localStorage.removeItem('shamstech_user_role');
    localStorage.removeItem('shamstech_company_name');
    window.location.href = '/html/login.html?role=company';
  }

  const logoutBtn = document.getElementById('company-logout-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', performCompanyLogout);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', performCompanyLogout);

  // 5. Toast Feedback Helper
  const toastEl = document.getElementById('company-toast');
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    setTimeout(function () {
      toastEl.style.display = 'none';
    }, 4000);
  }

  // 6. Bids & Offers Submitted Status Data
  const DEFAULT_COMPANY_BIDS = [
    {
      id: 'REQ-2082-001',
      title: 'Supply & install 8.5 kW system',
      client: 'Mansour Ali Al-Kofahi',
      value: '2,850 JOD',
      timeline: '18 Business Days',
      scope: '16x 550W Jinko Mono Panels + Huawei 8kW On-Grid Inverter + Galvanized mounting structure.',
      status: 'Under Review',
      statusClass: 'review',
      actionType: 'modify'
    },
    {
      id: 'REQ-2021-908',
      title: 'Specialty Hospital Tender',
      client: 'Specialty Hospital Mgmt',
      value: '14,000 JOD',
      timeline: '30 Business Days',
      scope: 'Commercial rooftop solar array with 3-phase smart grid synchronization & 10-year warranty.',
      status: 'Under Eval',
      statusClass: 'eval',
      actionType: 'view'
    },
    {
      id: 'REQ-00411',
      title: 'Routine Cleaning Tender',
      client: 'Dr. Khaled Al-Momani',
      value: '90 JOD',
      timeline: '2 Business Days',
      scope: 'Deionized water soft-wash cleaning + thermal hotspot inspection for 28 panels.',
      status: 'In Negotiation',
      statusClass: 'negotiation',
      actionType: 'view'
    },
    {
      id: 'REQ-2026-0892',
      title: '5.5 kWp Residential On-Grid System',
      client: 'Ahmad Ali (Irbid)',
      value: '3,450 JOD',
      timeline: '20 Business Days',
      scope: '10x 550W Mono Half-Cell Panels + Huawei 5kW Hybrid-Ready Inverter.',
      status: 'Under Review',
      statusClass: 'review',
      actionType: 'modify'
    },
    {
      id: 'REQ-2026-0614',
      title: 'Agricultural Water Pump Solar Array',
      client: 'Al-Baraka Olive Farm (Mafraq)',
      value: '9,200 JOD',
      timeline: '25 Business Days',
      scope: '18 kWp ground-mount array + variable frequency solar pump drive.',
      status: 'Under Eval',
      statusClass: 'eval',
      actionType: 'view'
    },
    {
      id: 'REQ-2026-0520',
      title: 'Commercial Bakery 25 kW Hybrid System',
      client: 'Golden Wheat Bakery (Zarqa)',
      value: '16,500 JOD',
      timeline: '28 Business Days',
      scope: '46x 550W Trina Panels + Deye 25kW 3-Phase Hybrid Inverter.',
      status: 'In Negotiation',
      statusClass: 'negotiation',
      actionType: 'modify'
    }
  ];

  function getCompanyBids() {
    try {
      const raw = localStorage.getItem('shamstech_company_bids');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    localStorage.setItem('shamstech_company_bids', JSON.stringify(DEFAULT_COMPANY_BIDS));
    return DEFAULT_COMPANY_BIDS;
  }

  function saveCompanyBids(list) {
    try {
      localStorage.setItem('shamstech_company_bids', JSON.stringify(list));
    } catch (e) {}
  }

  const bidsTbody = document.getElementById('company-bids-tbody');
  const bidsHeading = document.getElementById('bids-table-heading');
  const toggleAllBidsBtn = document.getElementById('toggle-all-bids-btn');
  const kpiReviewCount = document.getElementById('kpi-review-count');
  let showAllBids = false;

  function renderCompanyBidsTable() {
    if (!bidsTbody) return;
    const allBids = getCompanyBids();
    const visibleBids = showAllBids ? allBids : allBids.slice(0, 3);

    if (bidsHeading) {
      bidsHeading.textContent = 'Bids & Offers Submitted Status (' + visibleBids.length + ')';
    }
    if (toggleAllBidsBtn) {
      toggleAllBidsBtn.innerHTML = showAllBids
        ? '<span>Show Top 3 Bids</span>'
        : '<span>View All Bids (' + allBids.length + ')</span>';
    }
    if (kpiReviewCount) {
      kpiReviewCount.textContent = String(allBids.length);
    }

    bidsTbody.innerHTML = visibleBids.map(function (bid) {
      const btnHtml = bid.actionType === 'modify'
        ? '<button type="button" class="btn-table-outline display" data-bid-action="modify" data-bid-id="' + bid.id + '">Modify Offer</button>'
        : '<button type="button" class="btn-table-solid display" data-bid-action="view" data-bid-id="' + bid.id + '">View Details</button>';

      return (
        '<tr>' +
          '<td>' +
            '<div class="bid-req-title">' + bid.title + '</div>' +
            '<div class="bid-req-id">ID: ' + bid.id + '</div>' +
          '</td>' +
          '<td class="bid-client-name">' + bid.client + '</td>' +
          '<td class="bid-offer-val display">' + bid.value + '</td>' +
          '<td><span class="bid-status-pill ' + (bid.statusClass || 'review') + ' display">● ' + bid.status + '</span></td>' +
          '<td>' + btnHtml + '</td>' +
        '</tr>'
      );
    }).join('');
  }

  if (toggleAllBidsBtn) {
    toggleAllBidsBtn.addEventListener('click', function () {
      showAllBids = !showAllBids;
      renderCompanyBidsTable();
    });
  }

  renderCompanyBidsTable();

  // 7. Render exactly the 4 Most Recent Requests Submitted by Users
  const tendersListEl = document.getElementById('company-tenders-list');
  const kpiOpenCount = document.getElementById('kpi-open-count');

  const DEFAULT_RECENT_REQUESTS = [
    {
      id: '#MNT-2026-4006',
      title: 'Electrical & Inverter Check (5)',
      tag: 'MAINTENANCE & WASH',
      badgeClass: 'maint-wash',
      timeBadge: 'Newly Submitted',
      metaLabel: 'SERVICE TYPE',
      metaValue: 'Electrical & Inverter Check',
      client: 'Al-Rabi Commercial Complex',
      location: 'Amman - Abdoun',
      suggestedPrice: '90 JOD'
    },
    {
      id: '#AI-2026-1716',
      title: 'AI Fault Diagnosis Scan (Solar_Panel_Array.jpg)',
      tag: 'MAINTENANCE',
      badgeClass: 'maintenance-only',
      timeBadge: 'Newly Submitted',
      metaLabel: 'DETECTED ISSUE',
      metaValue: 'Soiling Defect (Heavy Dust)',
      client: 'Mansour Ali Al-Kofahi',
      location: 'Irbid - University District',
      suggestedPrice: '110 JOD'
    },
    {
      id: '#REQ-2026-3240',
      title: 'Supply & Installation of 6.5 kW Residential Solar System',
      tag: 'SOLAR INSTALLATION',
      badgeClass: 'solar-installation',
      timeBadge: 'Newly Submitted',
      metaLabel: 'SYSTEM TYPE',
      metaValue: '6.5 kW On-Grid System',
      client: 'Eng. Tariq Al-Zoubi',
      location: 'Irbid - Al-Huson Highway',
      suggestedPrice: '3,650 JOD'
    },
    {
      id: '#REQ-2026-TND-0101',
      title: 'Supply & Installation of 100 kW Solar Energy System for Specialty Hospital',
      tag: 'SOLAR INSTALLATION',
      badgeClass: 'solar-installation',
      timeBadge: 'Remaining: 3 Days',
      metaLabel: 'TENDER SCOPE',
      metaValue: 'Commercial Rooftop Array',
      client: 'Specialty Hospital Mgmt',
      location: 'Irbid - Specialty Hospital Street',
      suggestedPrice: '68,500 JOD'
    }
  ];

  function renderRecentRequests() {
    if (!tendersListEl) return;

    let userRequests = [];
    try {
      const rawUserReqs = localStorage.getItem('shamstech_user_requests');
      if (rawUserReqs) {
        const parsed = JSON.parse(rawUserReqs);
        if (Array.isArray(parsed)) userRequests = parsed;
      }
    } catch (e) {}

    // ---- SERVICE DESIGN (same as the client pages): green installation, orange maintenance, blue cleaning, yellow other
    const SVC = {
      install: { label: 'Installation', color: '#16a34a', icon: '#i-zap' },
      repair: { label: 'Maintenance', color: '#ea580c', icon: '#i-wrench' },
      clean: { label: 'Cleaning', color: '#2563eb', icon: '#i-sun' },
      other: { label: 'Other Services', color: '#ca8a04', icon: '#i-settings' }
    };
    const svcDetect = function (t, icon) {
      t = (t || '').toLowerCase(); icon = icon || '';
      if (/i-settings/.test(icon)) return 'other';
      if (/clean|wash/.test(t)) return 'clean';
      if (/repair|maint|fault|diagnos|inverter/.test(t) || /i-wrench|i-cpu/.test(icon)) return 'repair';
      if (/i-zap/.test(icon) || /install|system|on-grid|off-grid|hybrid|solar/.test(t)) return 'install';
      return 'other';
    };
    const mappedUserRequests = userRequests.map(function (r) {
      const svc = r.service || svcDetect((r.title || '') + ' ' + (r.metric1Value || ''), r.icon);
      return {
        id: r.id || '#REQ-2026-NEW',
        title: r.title || 'Client Service Request',
        svc: svc,
        timeBadge: r.dateLabel ? 'Submitted: ' + r.dateLabel : 'Newly Submitted',
        metaLabel: r.metric1Label || 'SYSTEM TYPE',
        metaValue: r.metric1Value || 'Solar Power Service',
        client: r.client || r.clientName || 'Client',
        location: r.location || r.metric3Value || 'Jordan',
        suggestedPrice: (svc === 'repair' || svc === 'clean') ? '95 JOD' : '3,450 JOD'
      };
    });
    const svcFromBadge = function (b) { return b === 'solar-installation' ? 'install' : (b === 'maintenance-only' || b === 'maint-wash') ? 'repair' : b === 'wash-only' ? 'clean' : 'other'; };
    DEFAULT_RECENT_REQUESTS.forEach(function (d) { d.svc = d.svc || svcFromBadge(d.badgeClass); });

    // Merge: user submitted requests appear first, backfilled with default recent items to total 4
    const combined = mappedUserRequests.concat(DEFAULT_RECENT_REQUESTS);
    const fourMostRecent = combined.slice(0, 3);   // the 3 latest requests posted on the site

    tendersListEl.innerHTML = fourMostRecent.map(function (item) {
      return (
        '<article class="tender-card svc-card" data-svc="' + item.svc + '" style="--svc:' + SVC[item.svc].color + '" data-id="' + item.id + '">' +
          '<div class="tender-info">' +
            '<div class="tender-tag-row">' +
              '<span class="svc-ico"><svg class="icon"><use href="' + SVC[item.svc].icon + '"/></svg></span><span class="svc-chip">' + SVC[item.svc].label + '</span>' +
              '<span class="tender-id-label display">' + item.id + '</span>' +
              '<span class="tender-time-badge display"><svg class="icon" style="width:0.85rem;height:0.85rem;"><use href="#i-clock"/></svg> ' + item.timeBadge + '</span>' +
            '</div>' +
            '<h3 class="display">' + item.title + '</h3>' +
            '<p class="tender-meta-line">' +
              '<svg class="icon" style="width:0.95rem;height:0.95rem;color:var(--gold);"><use href="#i-map-pin"/></svg> ' +
              item.metaLabel + ': ' + item.metaValue + ' &nbsp;•&nbsp; Client: ' + item.client +
            '</p>' +
            '<p class="tender-req-note"><svg class="icon" style="width:0.95rem;height:0.95rem;"><use href="#i-check"/></svg> Open for contractor price proposals</p>' +
          '</div>' +
          '<div>' +
            '<button type="button" class="btn-submit-green display" data-open-proposal="' + item.id + '" data-title="' + encodeURIComponent(item.title) + '" data-client="' + encodeURIComponent(item.client) + '" data-suggested="' + encodeURIComponent(item.suggestedPrice) + '">' +
              '<span class="btn-label"><span>Submit Price Quote</span><span aria-hidden="true">Submit Price Quote</span></span>' +
              '<svg class="icon" style="width:1rem;height:1rem;"><use href="#i-arrow-up-right"/></svg>' +
            '</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    if (kpiOpenCount) {
      kpiOpenCount.textContent = String(14 + userRequests.length);
    }
  }

  renderRecentRequests();

  // 9. Interactive Modals for Proposal Submissions and Bid Updates
  const modalBackdrop = document.getElementById('comp-proposal-modal');
  const modalCloseBtn = document.getElementById('comp-modal-close');
  const modalCancelBtn = document.getElementById('comp-modal-cancel-btn');
  const modalBadge = document.getElementById('comp-modal-badge');
  const modalTitle = document.getElementById('comp-modal-title');
  const modalSub = document.getElementById('comp-modal-sub');
  const modalForm = document.getElementById('comp-proposal-form');
  const priceInput = document.getElementById('comp-bid-price');
  const timelineInput = document.getElementById('comp-bid-timeline');
  const scopeInput = document.getElementById('comp-bid-scope');
  const submitBtn = document.getElementById('comp-modal-submit-btn');

  let modalMode = 'new';
  let activeRecordId = '';
  let activeRecordTitle = '';
  let activeRecordClient = '';

  function openCompanyModal(mode, config) {
    modalMode = mode;
    activeRecordId = config.id || 'REQ-2026-NEW';
    activeRecordTitle = config.title || 'Solar Project Tender';
    activeRecordClient = config.client || 'Verified Client';

    if (modalBadge) modalBadge.textContent = config.badge || 'OFFICIAL BID SUBMISSION';
    if (modalTitle) modalTitle.textContent = config.heading || 'Submit Technical & Financial Offer';
    if (modalSub) modalSub.textContent = activeRecordTitle + ' (' + activeRecordId + ') • Client: ' + activeRecordClient;

    if (priceInput) {
      priceInput.value = config.price || '';
      priceInput.disabled = mode === 'view';
    }
    if (timelineInput) {
      timelineInput.value = config.timeline || '';
      timelineInput.disabled = mode === 'view';
    }
    if (scopeInput) {
      scopeInput.value = config.scope || '';
      scopeInput.disabled = mode === 'view';
    }

    if (submitBtn) {
      const labelSpan = submitBtn.querySelector('.btn-label span') || submitBtn;
      if (mode === 'view') {
        submitBtn.innerHTML = '<span class="btn-label"><span>✎ Switch to Edit Mode</span><span aria-hidden="true">✎ Switch to Edit Mode</span></span>';
      } else if (mode === 'modify') {
        submitBtn.innerHTML = '<span class="btn-label"><span>✓ Save Updated Offer</span><span aria-hidden="true">✓ Save Updated Offer</span></span>';
      } else {
        submitBtn.innerHTML = '<span class="btn-label"><span>✓ Confirm & Submit Offer</span><span aria-hidden="true">✓ Confirm & Submit Offer</span></span>';
      }
    }

    if (modalBackdrop) {
      modalBackdrop.classList.add('open');
      modalBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeCompanyModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeCompanyModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeCompanyModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) closeCompanyModal();
    });
  }

  // Click delegation on Bids Table
  if (bidsTbody) {
    bidsTbody.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-bid-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-bid-action');
      const bidId = btn.getAttribute('data-bid-id');
      const bids = getCompanyBids();
      const target = bids.find(function (b) { return b.id === bidId; });
      if (!target) return;

      if (action === 'modify') {
        openCompanyModal('modify', {
          id: target.id,
          title: target.title,
          client: target.client,
          badge: 'MODIFY SUBMITTED OFFER',
          heading: 'Modify Offer Value & Scope',
          price: target.value,
          timeline: target.timeline || '20 Business Days',
          scope: target.scope || 'Standard certified solar installation & warranty.'
        });
      } else {
        openCompanyModal('view', {
          id: target.id,
          title: target.title,
          client: target.client,
          badge: 'SUBMITTED BID DETAILS (' + target.status.toUpperCase() + ')',
          heading: 'Submitted Proposal Details',
          price: target.value,
          timeline: target.timeline || '25 Business Days',
          scope: target.scope || 'Full turnkey solar package with official warranty.'
        });
      }
    });
  }

  // Click delegation on Tenders List -> Opens full Proposal Submission Page (Image 1)
  if (tendersListEl) {
    tendersListEl.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-open-proposal]');
      if (!btn) return;
      const targetId = (btn.getAttribute('data-open-proposal') || 'REQ-2026-0814').replace('#', '');
      window.location.href = '/html/company_submit_proposal.html?id=' + encodeURIComponent(targetId);
    });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (modalMode === 'view') {
        modalMode = 'modify';
        if (priceInput) priceInput.disabled = false;
        if (timelineInput) timelineInput.disabled = false;
        if (scopeInput) scopeInput.disabled = false;
        if (submitBtn) {
          submitBtn.innerHTML = '<span class="btn-label"><span>✓ Save Updated Offer</span><span aria-hidden="true">✓ Save Updated Offer</span></span>';
        }
        return;
      }

      const rawPrice = priceInput ? priceInput.value.trim() : '3,450 JOD';
      const formattedPrice = rawPrice.toUpperCase().indexOf('JOD') !== -1 ? rawPrice : (rawPrice + ' JOD');
      const timeline = timelineInput ? timelineInput.value.trim() : '20 Business Days';
      const scope = scopeInput ? scopeInput.value.trim() : 'Full turnkey solar package.';

      const bids = getCompanyBids();
      const existingIdx = bids.findIndex(function (b) { return b.id === activeRecordId; });

      if (existingIdx !== -1) {
        bids[existingIdx].value = formattedPrice;
        bids[existingIdx].timeline = timeline;
        bids[existingIdx].scope = scope;
        saveCompanyBids(bids);
        renderCompanyBidsTable();
        closeCompanyModal();
        showToast('✓ Offer for "' + activeRecordTitle + '" updated to ' + formattedPrice + '!');
      } else {
        bids.unshift({
          id: activeRecordId,
          title: activeRecordTitle,
          client: activeRecordClient,
          value: formattedPrice,
          timeline: timeline,
          scope: scope,
          status: 'Under Review',
          statusClass: 'review',
          actionType: 'modify'
        });
        saveCompanyBids(bids);
        renderCompanyBidsTable();
        closeCompanyModal();
        showToast('✓ Official proposal (' + formattedPrice + ') submitted for "' + activeRecordTitle + '"!');
      }
    });
  }
});
