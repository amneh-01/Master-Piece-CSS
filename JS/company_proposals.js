/* =====================================================
   SHAMSTECH JO - SUBMITTED PROPOSALS & OFFERS JS (js/company_proposals.js)
   Matches Image 3:
   1. Route Guard: Ensures only authenticated Solar Companies access this.
   2. Loads all bids submitted by company from 'shamstech_company_bids',
      backfilled with rich initial bids across all request types.
   3. Color-codes badges by request type:
      - Cleaning & Maintenance (Cyan/Sky Blue)
      - Solar Installation (Solar Orange)
      - Institutional Tenders (Deep Emerald)
      - AI Diagnosis (Royal Purple)
   4. Live KPI statistics (Total, Accepted, Under Review, In Progress).
   5. Interactive filtering by Request Type and Status.
   6. View & Modify Offer Modal with live local storage updates.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Route Guard
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

  // 2. Company Name & Avatar
  const rawCompName = localStorage.getItem('shamstech_company_name') || localStorage.getItem('shamstech_user_name') || 'Al-Fanar Energy Co.';
  const navCompName = document.getElementById('nav-comp-name');
  const navCompAvatar = document.getElementById('nav-comp-avatar');
  if (navCompName) navCompName.textContent = rawCompName;
  if (navCompAvatar) {
    const words = rawCompName.trim().split(/\s+/);
    const initials = words.length > 1
      ? (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
      : rawCompName.slice(0, 2).toUpperCase();
    navCompAvatar.textContent = initials;
  }
  // Navbar Dropdown Toggle
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

  // Mobile Menu Toggle
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      menuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  // Log Out Handlers
  function performLogout() {
    localStorage.removeItem('shamstech_user_role');
    localStorage.removeItem('shamstech_company_name');
    window.location.href = '/html/login.html?role=company';
  }
  const logoutBtn = document.getElementById('company-logout-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', performLogout);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', performLogout);

  // Toast Helper
  const toastEl = document.getElementById('proposals-toast');
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    setTimeout(function () {
      toastEl.style.display = 'none';
    }, 4500);
  }

  // 3. Default Initial Proposals Data across the 4 exact service types (Image 3)
  const INITIAL_DEFAULT_BIDS = [
    {
      id: 'REQ-2026-0814',
      title: '6.5 kWp Residential Solar System Installation',
      client: 'Samer Ali (Customer)',
      location: 'Irbid - Eastern District',
      type: 'solar-installation',
      typeTag: 'Solar Installation',
      typeClass: 'solar-installation',
      value: '2,850 JOD',
      timeline: '20 Business Days',
      warranty: '5 Years Full Workmanship & 25 Years Panels',
      scope: 'Turnkey European hybrid-ready inverter, tier-1 half-cell panels, and official grid connection approvals.',
      pdfFile: 'AlFanar_Official_Proposal_REQ-2026-0814.pdf',
      status: 'Under Review',
      statusClass: 'review'
    },
    {
      id: 'MNT-2026-4006',
      title: 'Preventive Panels Wash & Inverter Check (24 Panels)',
      client: 'Al-Rabi Commercial Complex',
      location: 'Amman - Abdoun',
      type: 'maint-wash',
      typeTag: 'Maintenance & Wash',
      typeClass: 'maint-wash',
      value: '90 JOD',
      timeline: 'Scheduled Within 48 Hours',
      warranty: '6 Months Performance Guarantee',
      scope: 'Thermal drone imaging of array, inverter firmware diagnostic, and deionized pure water wash.',
      pdfFile: 'Maintenance_Quotation_MNT-2026-4006.pdf',
      status: 'Accepted',
      statusClass: 'accepted'
    },
    {
      id: 'TND-2026-0101',
      title: '100 kWp Commercial Solar Power System Installation',
      client: 'Specialty Hospital Mgmt',
      location: 'Irbid - Specialty Hospital Street',
      type: 'solar-installation',
      typeTag: 'Solar Installation',
      typeClass: 'solar-installation',
      value: '68,500 JOD',
      timeline: '30 Business Days',
      warranty: '10 Years Full Turnkey Workmanship',
      scope: 'Class-A engineering supply, high-voltage 3-phase synchronization, and Tier-1 bifacial panels.',
      pdfFile: 'Hospital_Turnkey_Tender_Proposal.pdf',
      status: 'Under Review',
      statusClass: 'review'
    },
    {
      id: 'REQ-2026-0775',
      title: 'Inverter Maintenance & Thermal Hotspot Repair',
      client: 'Mansour Ali Al-Kofahi',
      location: 'Amman - Dabouq',
      type: 'maintenance',
      typeTag: 'Maintenance',
      typeClass: 'maintenance-only',
      value: '120 JOD',
      timeline: 'Immediate Dispatch (24h)',
      warranty: '1-Year System Health Monitoring',
      scope: 'Thermal hotspot rectification, bypass diode replacement, and terminal testing.',
      pdfFile: 'Maintenance_Remediation_Report.pdf',
      status: 'In Progress',
      statusClass: 'progress'
    },
    {
      id: 'REQ-2026-0019',
      title: 'Supply & Installation of 6.5 kW Residential Solar System',
      client: 'Eng. Tariq Al-Zoubi',
      location: 'Irbid - Al-Huson Highway',
      type: 'solar-installation',
      typeTag: 'Solar Installation',
      typeClass: 'solar-installation',
      value: '3,450 JOD',
      timeline: '25 Business Days',
      warranty: '5 Years Comprehensive Maintenance',
      scope: 'Turnkey 3-phase system, aluminum racking, and net-metering licensing.',
      pdfFile: 'AlFanar_Residential_Offer_0019.pdf',
      status: 'Accepted',
      statusClass: 'accepted'
    },
    {
      id: 'REQ-2026-0940',
      title: 'Quarterly Routine Deionized Panels Wash (36 Panels)',
      client: 'Coastal Residence Mgmt',
      location: 'Aqaba - Fifth Area',
      type: 'wash',
      typeTag: 'Wash',
      typeClass: 'wash-only',
      value: '140 JOD',
      timeline: 'Scheduled Within 3 Days',
      warranty: '3 Months Cleanliness Guarantee',
      scope: 'Deionized pressure wash, dust & salt mist removal, and visual cable check.',
      pdfFile: 'Aqaba_Routine_Wash_Contract.pdf',
      status: 'In Progress',
      statusClass: 'progress'
    }
  ];

  // Helper: Retrieve all company bids from localStorage
  function getAllCompanyBids() {
    let saved = [];
    try {
      const raw = localStorage.getItem('shamstech_company_bids');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) saved = parsed;
      }
    } catch (e) {}

    // Map saved items to ensure they strictly map to the 4 exact service types
    const mappedSaved = saved.map(function (s) {
      const titleLower = ((s.title || '') + ' ' + (s.typeTag || '') + ' ' + (s.type || '')).toLowerCase();
      const isWash = titleLower.indexOf('wash') !== -1 || titleLower.indexOf('clean') !== -1;
      const isMaint = (s.id && s.id.indexOf('MNT') !== -1) || (s.id && s.id.indexOf('AI') !== -1) || titleLower.indexOf('maint') !== -1 || titleLower.indexOf('repair') !== -1;

      let type = 'solar-installation';
      let typeTag = 'Solar Installation';
      let typeClass = 'solar-installation';

      if (isWash && isMaint) {
        type = 'maint-wash';
        typeTag = 'Maintenance & Wash';
        typeClass = 'maint-wash';
      } else if (isWash) {
        type = 'wash';
        typeTag = 'Wash';
        typeClass = 'wash-only';
      } else if (isMaint) {
        type = 'maintenance';
        typeTag = 'Maintenance';
        typeClass = 'maintenance-only';
      }

      let status = s.status || 'Under Review';
      let statusClass = 'review';
      if (status.toLowerCase().indexOf('accept') !== -1) statusClass = 'accepted';
      if (status.toLowerCase().indexOf('progress') !== -1) statusClass = 'progress';

      return {
        id: (s.id || 'REQ-2026-BID').replace('#', ''),
        title: s.title || 'Client Service Proposal',
        client: s.client || 'Verified Customer',
        location: s.location || 'Jordan',
        type: type,
        typeTag: typeTag,
        typeClass: typeClass,
        value: s.value || '2,850 JOD',
        timeline: s.timeline || '20 Business Days',
        warranty: s.warranty || '5-Year Workmanship Warranty',
        scope: s.scope || 'Full turnkey certified solar installation & warranty.',
        pdfFile: s.pdfFile || ('Proposal_' + (s.id || 'REQ') + '.pdf'),
        status: status,
        statusClass: statusClass
      };
    });

    // Merge: saved user proposals first, then default items that don't have duplicate ID
    const merged = mappedSaved.slice();
    INITIAL_DEFAULT_BIDS.forEach(function (d) {
      if (!merged.some(function (m) { return m.id === d.id; })) merged.push(d);
    });

    return merged;
  }

  // 4. State
  let currentTypeFilter = 'all';
  let currentStatusFilter = 'all';

  // Elements
  const cardsContainer = document.getElementById('proposals-cards-container');
  const kpiTotal = document.getElementById('kpi-total-proposals');
  const kpiAccepted = document.getElementById('kpi-accepted-count');
  const kpiReview = document.getElementById('kpi-review-count');
  const kpiProgress = document.getElementById('kpi-progress-count');
  const typeFilterBtns = document.querySelectorAll('[data-type-filter]');
  const statusSelect = document.getElementById('proposals-status-select');

  // Update KPIs
  function updateKPIs(allBids) {
    if (kpiTotal) kpiTotal.textContent = String(allBids.length);
    const acceptedCount = allBids.filter(function (b) { return b.statusClass === 'accepted'; }).length;
    const reviewCount = allBids.filter(function (b) { return b.statusClass === 'review'; }).length;
    const progressCount = allBids.filter(function (b) { return b.statusClass === 'progress'; }).length;

    if (kpiAccepted) kpiAccepted.textContent = String(acceptedCount);
    if (kpiReview) kpiReview.textContent = String(reviewCount);
    if (kpiProgress) kpiProgress.textContent = String(progressCount);
  }

  // Render Proposals List
  function renderProposals() {
    if (!cardsContainer) return;
    const allBids = getAllCompanyBids();
    updateKPIs(allBids);

    const filtered = allBids.filter(function (bid) {
      // Type Filter
      if (currentTypeFilter !== 'all') {
        if (bid.type !== currentTypeFilter && bid.typeClass !== currentTypeFilter) return false;
      }

      // Status Filter
      if (currentStatusFilter !== 'all' && bid.status !== currentStatusFilter) return false;

      return true;
    });

    if (filtered.length === 0) {
      cardsContainer.innerHTML =
        '<div style="text-align:center;padding:3.5rem 1.5rem;background:var(--cream-2);border-radius:1.75rem;border:1px dashed rgba(22,33,27,0.2);color:rgba(22,33,27,0.65);">' +
          '<h3 class="display" style="font-size:1.25rem;color:var(--forest);margin-bottom:0.4rem;">No matching proposals found</h3>' +
          '<p style="font-size:14px;">Try selecting another request type or status filter.</p>' +
        '</div>';
      return;
    }

    cardsContainer.innerHTML = filtered.map(function (bid) {
      const isReview = bid.statusClass === 'review';
      const modifyBtnHtml = isReview
        ? '<button type="button" class="btn-prop-outline display" data-edit-bid="' + bid.id + '"><svg class="icon" style="width:0.85rem;height:0.85rem;"><use href="#i-edit"/></svg> <span>Modify Offer</span></button>'
        : '';

      // Determine theme class for unified icon color per card
      let themeClass = 'theme-solar';
      if (bid.type === 'maint-wash' || bid.typeClass === 'maint-wash') {
        themeClass = 'theme-maint-wash';
      } else if (bid.type === 'wash' || bid.typeClass === 'wash-only') {
        themeClass = 'theme-wash';
      } else if (bid.type === 'maintenance' || bid.typeClass === 'maintenance-only') {
        themeClass = 'theme-maintenance';
      }

      return (
        '<article class="proposal-item-card ' + themeClass + '" data-bid-id="' + bid.id + '">' +
          '<div class="proposal-card-top">' +
            '<div class="proposal-badge-wrap">' +
              '<span class="card-type-tag ' + bid.typeClass + '">' + bid.typeTag + '</span>' +
              '<span class="proposal-order-id">Order ID: ' + bid.id + '</span>' +
            '</div>' +
            '<div>' +
              '<span class="proposal-status-pill ' + bid.statusClass + ' display">● ' + bid.status + '</span>' +
            '</div>' +
          '</div>' +

          '<h2 class="proposal-item-title display">' + bid.title + '</h2>' +

          '<div class="proposal-client-row">' +
            '<span>Client: <strong>' + bid.client + '</strong></span>' +
            '<span class="dot">•</span>' +
            '<span class="prop-client-loc" style="display:inline-flex;align-items:center;gap:0.35rem;"><svg class="icon" style="width:0.85rem;height:0.85rem;"><use href="#i-map-pin"/></svg> ' + bid.location + '</span>' +
          '</div>' +

          '<div class="proposal-offer-metrics-grid">' +
            '<div class="offer-metric-card">' +
              '<div class="metric-head">' +
                '<svg class="icon"><use href="#i-zap"/></svg>' +
                '<span class="label">Offered Price</span>' +
              '</div>' +
              '<span class="val gold display">' + bid.value + '</span>' +
            '</div>' +
            '<div class="offer-metric-card">' +
              '<div class="metric-head">' +
                '<svg class="icon"><use href="#i-clock"/></svg>' +
                '<span class="label">Execution Timeline</span>' +
              '</div>' +
              '<span class="val display">' + bid.timeline + '</span>' +
            '</div>' +
            '<div class="offer-metric-card">' +
              '<div class="metric-head">' +
                '<svg class="icon"><use href="#i-badge-check"/></svg>' +
                '<span class="label">Warranty Coverage</span>' +
              '</div>' +
              '<span class="val green display">' + (bid.warranty || '5-Year Workmanship') + '</span>' +
            '</div>' +
          '</div>' +

          '<div class="proposal-card-footer">' +
            '<div class="proposal-pdf-indicator">' +
              '<svg class="icon"><use href="#i-file-text"/></svg>' +
              '<span>' + bid.pdfFile + '</span>' +
            '</div>' +

            '<div class="proposal-btn-actions">' +
              '<a href="/html/company_submit_proposal.html?id=' + encodeURIComponent(bid.id) + '" class="btn-prop-outline display">' +
                '<svg class="icon" style="width:0.85rem;height:0.85rem;"><use href="#i-eye"/></svg>' +
                '<span>View Client Request</span>' +
              '</a>' +
              modifyBtnHtml +
              '<button type="button" class="btn-prop-primary display" data-view-bid="' + bid.id + '">' +
                '<span>View Offer Details</span>' +
                '<svg class="icon" style="width:0.85rem;height:0.85rem;"><use href="#i-arrow-up-right"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  // Filter Buttons Events
  typeFilterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      typeFilterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentTypeFilter = btn.getAttribute('data-type-filter') || 'all';
      renderProposals();
    });
  });

  if (statusSelect) {
    statusSelect.addEventListener('change', function () {
      currentStatusFilter = statusSelect.value;
      renderProposals();
    });
  }

  // Initial Render
  renderProposals();

  // 5. Interactive Offer View & Modify Modal
  const modalBackdrop = document.getElementById('offer-view-modal');
  const modalCloseBtn = document.getElementById('btn-close-offer-modal');
  const modalTypeTag = document.getElementById('modal-offer-type-tag');
  const modalTitle = document.getElementById('modal-offer-title');
  const modalSub = document.getElementById('modal-offer-sub');
  const modalForm = document.getElementById('modify-offer-form');
  const modalPrice = document.getElementById('modal-input-price');
  const modalTimeline = document.getElementById('modal-input-timeline');
  const modalScope = document.getElementById('modal-input-scope');
  const modalViewReqLink = document.getElementById('modal-view-request-link');

  let activeBidId = '';

  function openBidModal(bidId, isEditMode) {
    const allBids = getAllCompanyBids();
    const bid = allBids.find(function (b) { return b.id === bidId; });
    if (!bid) return;

    activeBidId = bidId;

    if (modalTypeTag) {
      modalTypeTag.textContent = bid.typeTag;
      modalTypeTag.className = 'card-type-tag ' + bid.typeClass + ' display';
    }
    if (modalTitle) {
      modalTitle.textContent = isEditMode ? 'Modify Submitted Offer' : 'Submitted Proposal Details';
    }
    if (modalSub) {
      modalSub.textContent = bid.title + ' (Order ID: ' + bid.id + ') • Client: ' + bid.client + ' • Status: ' + bid.status;
    }

    if (modalPrice) {
      modalPrice.value = bid.value;
      modalPrice.disabled = !isEditMode;
    }
    if (modalTimeline) {
      modalTimeline.value = bid.timeline;
      modalTimeline.disabled = !isEditMode;
    }
    if (modalScope) {
      modalScope.value = bid.scope;
      modalScope.disabled = !isEditMode;
    }

    const saveBtn = document.getElementById('modal-save-offer-btn');
    if (saveBtn) {
      saveBtn.style.display = isEditMode ? 'inline-flex' : 'none';
    }

    if (modalViewReqLink) {
      modalViewReqLink.href = '/html/company_submit_proposal.html?id=' + encodeURIComponent(bid.id);
    }

    if (modalBackdrop) {
      modalBackdrop.classList.add('open');
      modalBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeBidModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeBidModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) closeBidModal();
    });
  }

  // Delegation on Cards Container
  if (cardsContainer) {
    cardsContainer.addEventListener('click', function (e) {
      const viewBtn = e.target.closest('button[data-view-bid]');
      if (viewBtn) {
        const id = viewBtn.getAttribute('data-view-bid');
        openBidModal(id, false);
        return;
      }

      const editBtn = e.target.closest('button[data-edit-bid]');
      if (editBtn) {
        const id = editBtn.getAttribute('data-edit-bid');
        openBidModal(id, true);
        return;
      }
    });
  }

  // Handle Form Submission for Modifying Offer
  if (modalForm) {
    modalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const updatedPrice = modalPrice ? modalPrice.value.trim() : '';
      const updatedTimeline = modalTimeline ? modalTimeline.value.trim() : '';
      const updatedScope = modalScope ? modalScope.value.trim() : '';

      if (!updatedPrice || !updatedTimeline) {
        showToast('Please fill in both the price and timeline.');
        return;
      }

      const formattedPrice = updatedPrice.toUpperCase().indexOf('JOD') !== -1 ? updatedPrice : (updatedPrice + ' JOD');

      // Update in localStorage
      try {
        let bids = [];
        const raw = localStorage.getItem('shamstech_company_bids');
        if (raw) bids = JSON.parse(raw);
        if (!Array.isArray(bids)) bids = [];
        const existingIdx = bids.findIndex(function (b) { return b.id === activeBidId; });
        if (existingIdx !== -1) {
          bids[existingIdx].value = formattedPrice;
          bids[existingIdx].timeline = updatedTimeline;
          bids[existingIdx].scope = updatedScope;
        } else {
          // Add to bids
          bids.unshift({
            id: activeBidId,
            title: modalTitle ? modalTitle.textContent : 'Solar Proposal',
            client: 'Customer',
            value: formattedPrice,
            timeline: updatedTimeline,
            scope: updatedScope,
            status: 'Under Review',
            statusClass: 'review'
          });
        }
        localStorage.setItem('shamstech_company_bids', JSON.stringify(bids));
      } catch (err) {}

      closeBidModal();
      showToast('✓ Offer for ID ' + activeBidId + ' updated successfully to ' + formattedPrice + '!');
      renderProposals();
    });
  }
});
