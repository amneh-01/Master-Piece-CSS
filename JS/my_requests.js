/* =====================================================
   SHAMSTECH JO - MY ACTIVE REQUESTS JS (js/my_requests.js)
   Explanation of what was done in this file:
   1. Reads the logged-in user's name from localStorage
      ('shamstech_user_name') and displays it in the navbar
      user button (#nav-user-name & #nav-user-avatar).
   2. Dynamically loads and renders all service requests submitted
      by the user ('shamstech_user_requests') at the top of
      the user's requests screen (#submitted-requests-list).
   3. Applies any accepted proposals ('shamstech_accepted_proposals')
      so that when a user accepts a proposal, the request's status
      becomes "In Execution" (قيد التنفيذ) and the "Cancel / Delete Request"
      button is removed (cannot delete once In Execution).
   4. Clicking "View Accepted Offer" opens a Modal displaying ONLY
      the accepted offer's full details + the company's submitted PDF
      proposal (with PDF preview and download).
   5. Clicking "Cancel / Delete Request" on an open (non-execution)
      request opens a confirmation modal ("Are you sure you want to
      delete?") before cancelling and archiving to Requests History.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Display the logged-in user's name in the navbar
  const savedName = localStorage.getItem('shamstech_user_name') || 'Ahmad Ali';
  const navUserName = document.getElementById('nav-user-name');
  const navUserAvatar = document.getElementById('nav-user-avatar');

  if (navUserName) navUserName.textContent = savedName;
  if (navUserAvatar) navUserAvatar.textContent = savedName.charAt(0).toUpperCase();

  // Navbar User Dropdown toggle
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

  // Mobile Menu toggle
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      menuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  // Toast Feedback helper
  const toast = document.getElementById('requests-toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 4000);
  }

  // Full reference catalog of Contractor Offers (for View Accepted Offer modal & PDF)
  const CONTRACTOR_CATALOG = {
    ps: {
      initials: 'PS',
      avatarTone: '',
      contractorName: 'Philadelphia Solar Jordan',
      rating: '★ 4.9 (128 Reviews) • Tier-1 Certified Installer',
      price: '3,450 JOD',
      timeline: '20 Business Days',
      scope: '“10x 550W Mono Half-Cell Panels + Huawei 5kW Hybrid-Ready Inverter. Includes full JEPCO/IDECO net-metering paperwork & 10-year workmanship warranty.”',
      bonus: '✓ Free 1st-year panel wash & thermal inspection included',
      pdfName: 'Philadelphia_Solar_Proposal_Signed.pdf',
      manager: 'Eng. Ahmad Al-Majali',
      phone: '📞 +962 79 880 1234',
      email: '✉️ projects@philadelphiasolar.jo',
      loc: '📍 Amman, King Abdullah II Industrial City'
    },
    se: {
      initials: 'SE',
      avatarTone: 'navy',
      contractorName: 'SunEnergy Jordan Ltd.',
      rating: '★ 4.6 (84 Reviews) • Licensed Solar Contractor',
      price: '3,200 JOD',
      timeline: '35 Business Days',
      scope: '“12x 460W Longi Solar Panels + Growatt 5kW On-Grid Inverter. Standard galvanized steel mounting structure, 5-year installation warranty.”',
      bonus: '✓ Includes JEPCO/IDECO grid inspection & structural mounting kit',
      pdfName: 'SunEnergy_Jordan_Proposal_Signed.pdf',
      manager: 'Eng. Rami Al-Zoubi',
      phone: '📞 +962 79 512 9090',
      email: '✉️ bids@sunenergy.jo',
      loc: '📍 Amman, Mecca Street · Building 84'
    },
    ag: {
      initials: 'AG',
      avatarTone: 'bronze',
      contractorName: 'Atlas Green Energy',
      rating: '★ 4.8 (96 Reviews) • Fast-Track Specialist',
      price: '3,900 JOD',
      timeline: '15 Business Days',
      scope: '“10x 550W Trina Vertex S Panels + Deye 6kW Hybrid Inverter. Heavy-duty rust-free aluminum rails + priority grid connection.”',
      bonus: '✓ Priority 15-day fast-track installation & smart monitoring setup',
      pdfName: 'Atlas_Green_Energy_Proposal_Signed.pdf',
      manager: 'Eng. Laith Haddad',
      phone: '📞 +962 77 940 3311',
      email: '✉️ engineering@atlasgreen.jo',
      loc: '📍 Irbid, University Street · Commercial Tower'
    },
    sunwash: {
      initials: 'JS',
      avatarTone: '',
      contractorName: 'Jordan SunWash Ltd.',
      rating: '★ 4.9 (210 Reviews) • Certified Maintenance Specialist',
      price: '45 JOD',
      timeline: 'Oct 12, 10:00 AM',
      scope: '“Specialized deionized water soft-wash cleaning for all solar strings, inverter dust filter service, and full thermal hotspot check.”',
      bonus: '✓ Guaranteed +15% to +22% generation yield recovery',
      pdfName: 'Jordan_SunWash_Maintenance_Offer.pdf',
      manager: 'Eng. Tareq Al-Nasser',
      phone: '📞 +962 79 604 1122',
      email: '✉️ service@jordansunwash.jo',
      loc: '📍 Amman, Al-madina Al-monawara St.'
    }
  };

  // Helpers for Active User Requests, Accepted Proposals, & Requests History
  function getUserRequests() {
    try {
      const raw = localStorage.getItem('shamstech_user_requests');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveUserRequests(list) {
    try {
      localStorage.setItem('shamstech_user_requests', JSON.stringify(list));
    } catch (e) {}
  }

  function getAcceptedProposals() {
    try {
      const raw = localStorage.getItem('shamstech_accepted_proposals');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function getCompanyBidsForRequest(reqId) {
    try {
      const bids = JSON.parse(localStorage.getItem('shamstech_company_bids') || '[]');
      const cleanId = String(reqId || '').replace('#', '');
      return Array.isArray(bids) ? bids.filter(function (bid) { return String(bid.id || '').replace('#', '') === cleanId; }) : [];
    } catch (e) { return []; }
  }

  function getAcceptedForRequest(reqId) {
    const cleanId = String(reqId || '').replace('#', '');
    return acceptedProposals[reqId] || acceptedProposals[cleanId] || acceptedProposals['#' + cleanId] || null;
  }

  function getArchivedRequestIds() {
    try {
      const raw = localStorage.getItem('shamstech_archived_request_ids');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveArchivedRequestIds(ids) {
    try {
      localStorage.setItem('shamstech_archived_request_ids', JSON.stringify(ids));
    } catch (e) {}
  }

  function addRequestToHistory(record) {
    try {
      const raw = localStorage.getItem('shamstech_requests_history');
      let history = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(history)) history = [];
      history = history.filter(function (h) { return h.id !== record.id; });
      history.unshift(record);
      localStorage.setItem('shamstech_requests_history', JSON.stringify(history));
    } catch (e) {}
  }

  const listContainer = document.getElementById('submitted-requests-list');
  const archivedReqIds = getArchivedRequestIds();
  const acceptedProposals = getAcceptedProposals();

  // Remove any default cards that were already archived
  document.querySelectorAll('#submitted-requests-list .submitted-req-card').forEach(function (card) {
    const id = card.getAttribute('data-id');
    if (id && archivedReqIds.indexOf(id) !== -1) {
      card.remove();
    }
  });

  // Update a card's DOM to "In Execution" if its proposal was accepted in request_offers.html
  function upgradeCardToInExecution(card, acceptedData) {
    if (!card || !acceptedData) return;
    const baseInfo = CONTRACTOR_CATALOG[acceptedData.contractorKey] || CONTRACTOR_CATALOG.ps;
    const contractorName = acceptedData.contractorName || baseInfo.contractorName;
    const price = acceptedData.price || baseInfo.price;
    const timeline = acceptedData.timeline || baseInfo.timeline;
    const manager = acceptedData.manager || baseInfo.manager;
    const reqId = card.getAttribute('data-id') || '#REQ-2026-0892';

    card.classList.remove('highlight-bids');
    card.setAttribute('data-category', 'execution');
    card.setAttribute('data-m1-label', 'AGREED PRICE');
    card.setAttribute('data-m1-val', price);
    card.setAttribute('data-m2-label', 'ASSIGNED CONTRACTOR');
    card.setAttribute('data-m2-val', contractorName);
    card.setAttribute('data-m3-label', 'EXECUTION TIMELINE');
    card.setAttribute('data-m3-val', timeline);

    const iconEl = card.querySelector('.sub-req-icon');
    if (iconEl) iconEl.classList.add('amber');

    const titleEl = card.querySelector('.sub-req-title-group h2');
    if (titleEl) {
      titleEl.removeAttribute('onclick');
    }

    const badgeEl = card.querySelector('.sub-req-badge');
    if (badgeEl) {
      badgeEl.className = 'sub-req-badge in-execution display';
      badgeEl.textContent = '● Under Process';
    }

    const metricsEl = card.querySelector('.sub-req-metrics');
    if (metricsEl) {
      metricsEl.innerHTML =
        '<div class="metric-item">' +
          '<span>AGREED PRICE</span>' +
          '<strong class="display">' + price + '</strong>' +
        '</div>' +
        '<div class="metric-item">' +
          '<span>ASSIGNED CONTRACTOR</span>' +
          '<strong class="display contractor-link">' + contractorName + '</strong>' +
        '</div>' +
        '<div class="metric-item">' +
          '<span>EXECUTION TIMELINE</span>' +
          '<strong class="display">' + timeline + '</strong>' +
        '</div>';
    }

    const statusBox = card.querySelector('.sub-req-status-box');
    if (statusBox) {
      statusBox.innerHTML =
        '<p>✓ <strong>Status (In Execution):</strong> Proposal accepted with <strong>' +
        contractorName +
        '</strong> (' + manager +
        '). Project is currently in execution.</p>';
    }

    const btnGroup = card.querySelector('.sub-req-btn-group');
    if (btnGroup) {
      btnGroup.innerHTML =
        '<button type="button" class="btn-track-work display" data-toast="Execution Status: ' +
        contractorName +
        ' engineering team is actively executing your system (' + reqId + ').">' +
          '<span>Track Execution Status</span>' +
        '</button>' +
        '<button type="button" class="btn-req-outline display" data-req-action="view-accepted" data-offer-id="' + reqId + '">' +
          '<span>View Accepted Offer</span>' +
        '</button>' +
        '<button type="button" class="btn-req-outline display" data-req-action="complete">' +
          '<span>✓ Mark Completed</span>' +
        '</button>';
    }

    // Once In Execution, user CANNOT delete/cancel the request -> remove the Cancel/Delete button
    const cancelBtn = card.querySelector('[data-req-action="cancel"]');
    if (cancelBtn) {
      cancelBtn.remove();
    }
  }

  // Render user-submitted service requests from 'shamstech_user_requests'
  function createRequestCardElement(req) {
    const acceptedOffer = getAcceptedForRequest(req.id);
    const isAccepted = Boolean(acceptedOffer);
    const isBids = !isAccepted;   // every new service (install, maintenance, cleaning, other) starts open for proposals
    const offerCount = getCompanyBidsForRequest(req.id).length;
    const card = document.createElement('article');
    card.className = 'submitted-req-card' + (isBids ? ' highlight-bids' : '');
    card.setAttribute('data-id', req.id);
    card.setAttribute('data-title', req.title);
    card.setAttribute('data-meta', req.meta);
    card.setAttribute('data-icon', req.icon || '#i-zap');
    card.setAttribute('data-m1-label', req.metric1Label || 'SERVICE TYPE');
    card.setAttribute('data-m1-val', req.metric1Value || 'Solar Service');
    card.setAttribute('data-m2-label', req.metric2Label || 'DETAILS');
    card.setAttribute('data-m2-val', req.metric2Value || 'Submitted');
    card.setAttribute('data-m3-label', req.metric3Label || 'TIMELINE / CONTACT');
    card.setAttribute('data-m3-val', req.metric3Value || 'Active');
    card.setAttribute('data-category', isBids ? 'bids' : 'execution');

    const badgeClass = isBids ? 'offers-ready' : 'in-execution';
    const iconClass = isBids ? '' : ' amber';
    const primaryActionHtml = isBids
      ? '<a href="/html/request_offers.html?id=' + encodeURIComponent(req.id) + '" class="btn-compare-offers display" data-offer-id="' + req.id + '"><span>View Proposals (' + offerCount + ')</span><svg class="icon"><use href="#i-arrow-right"/></svg></a>'
      : '<button type="button" class="btn-track-work display" data-toast="Service Status: Your submitted service (' + req.id + ') is currently In Execution with our certified technical team."><span>Track Service Status</span></button>' +
        '<button type="button" class="btn-req-outline display" data-req-action="view-accepted" data-offer-id="' + req.id + '"><span>View Accepted Offer</span></button>';

    // Only allow "Cancel / Delete Request" when the request is still open (not In Execution)
    const cancelBtnHtml = isBids
      ? '<button type="button" class="btn-cancel-req display" data-req-action="cancel">Cancel / Delete Request</button>'
      : '';

    card.innerHTML =
      '<div class="sub-req-top">' +
        '<div class="sub-req-title-group">' +
          '<span class="sub-req-icon' + iconClass + '">' +
            '<svg class="icon"><use href="' + (req.icon || '#i-zap') + '"/></svg>' +
          '</span>' +
          '<div>' +
            '<h2 class="display">' + req.title + '</h2>' +
            '<p class="sub-req-meta">' + req.meta + '</p>' +
          '</div>' +
        '</div>' +
        '<span class="sub-req-badge ' + badgeClass + ' display">' + (isAccepted ? '● In Execution' : (offerCount ? '● ' + offerCount + (offerCount === 1 ? ' Offer Received' : ' Offers Received') : (req.badgeText || '● Open for Proposals'))) + '</span>' +
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
          '<strong class="display">' + (req.metric3Value || 'Active') + '</strong>' +
        '</div>' +
      '</div>' +

      '<div class="sub-req-status-box">' +
        '<p>' + (offerCount ? '✓ ' + offerCount + (offerCount === 1 ? ' company proposal is' : ' company proposals are') + ' ready for your review.' : (req.statusNote || '⚡ <strong>Status:</strong> Your service request has been received and shared with certified ShamsTech specialists.')) + '</p>' +
      '</div>' +

      '<div class="sub-req-actions">' +
        '<div class="sub-req-btn-group">' +
          primaryActionHtml +
          '<button type="button" class="btn-req-outline display" data-req-action="complete">' +
            '<span>✓ Mark Completed</span>' +
          '</button>' +
        '</div>' +
        cancelBtnHtml +
      '</div>';

    return card;
  }

  if (listContainer) {
    const userReqs = getUserRequests();
    for (let i = userReqs.length - 1; i >= 0; i--) {
      const r = userReqs[i];
      if (archivedReqIds.indexOf(r.id) === -1) {
        const cardEl = createRequestCardElement(r);
        listContainer.prepend(cardEl);
      }
    }
  }

  // Apply accepted proposal status ("In Execution") to any card whose offer was accepted
  // and ensure NO card in 'execution' has a Cancel/Delete button
  document.querySelectorAll('#submitted-requests-list .submitted-req-card').forEach(function (card) {
    const reqId = card.getAttribute('data-id');
    const acceptedOffer = getAcceptedForRequest(reqId);
    if (reqId && acceptedOffer) {
      upgradeCardToInExecution(card, acceptedOffer);
    } else if (card.getAttribute('data-category') === 'execution') {
      const cancelBtn = card.querySelector('[data-req-action="cancel"]');
      if (cancelBtn) cancelBtn.remove();
    }
  });

  // Update Filter Tab Counts dynamically
  const tabAll = document.getElementById('tab-req-all');
  const tabBids = document.getElementById('tab-req-bids');
  const tabExec = document.getElementById('tab-req-exec');

  function updateTabCounts() {
    const allCards = document.querySelectorAll('#submitted-requests-list .submitted-req-card');
    let bidsCount = 0;
    let execCount = 0;
    allCards.forEach(function (c) {
      if (c.getAttribute('data-category') === 'bids') bidsCount++;
      else execCount++;
    });
    if (tabAll) tabAll.textContent = 'All Active Requests (' + allCards.length + ')';
    if (tabBids) tabBids.textContent = 'Open for Proposals (' + bidsCount + ')';
    if (tabExec) tabExec.textContent = 'Under Process (' + execCount + ')';
  }

  updateTabCounts();

  // 2. Filter Tabs (All Active Requests / Open for Proposals / In Execution)
  const filterTabs = document.querySelectorAll('.req-filter-tab');
  filterTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      filterTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      const filter = tab.getAttribute('data-filter');

      document.querySelectorAll('#submitted-requests-list .submitted-req-card').forEach(function (card) {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // =====================================================
  // 3. ACCEPTED OFFER DETAILS & COMPANY PDF MODAL LOGIC
  // =====================================================
  const aoModalBackdrop = document.getElementById('accepted-offer-modal-backdrop');
  const aoCloseBtn = document.getElementById('close-accepted-offer-modal');
  const aoDoneBtn = document.getElementById('ao-done-btn');
  const aoModalTitle = document.getElementById('accepted-offer-modal-title');
  const aoAvatar = document.getElementById('ao-avatar');
  const aoCompName = document.getElementById('ao-company-name');
  const aoCompRating = document.getElementById('ao-company-rating');
  const aoPrice = document.getElementById('ao-price');
  const aoTimeline = document.getElementById('ao-timeline');
  const aoScope = document.getElementById('ao-scope');
  const aoBonus = document.getElementById('ao-bonus');
  const aoPdfName = document.getElementById('ao-pdf-name');
  const aoPreviewPdfBtn = document.getElementById('ao-preview-pdf-btn');
  const aoDownloadPdfBtn = document.getElementById('ao-download-pdf-btn');
  const aoPdfPreviewBox = document.getElementById('ao-pdf-preview-box');
  const aoPdfPreviewText = document.getElementById('ao-pdf-preview-text');
  const aoManager = document.getElementById('ao-manager');
  const aoPhone = document.getElementById('ao-phone');
  const aoEmail = document.getElementById('ao-email');
  const aoLoc = document.getElementById('ao-loc');

  let activePdfFileName = 'Contractor_Proposal_Signed.pdf';
  let activePdfKey = '';

  function openAcceptedOfferModal(card, reqId) {
    const storedMap = getAcceptedProposals();
    const savedOffer = storedMap[reqId] || {};
    let catalogKey = savedOffer.contractorKey;

    if (!catalogKey) {
      const m2Val = (card ? card.getAttribute('data-m2-val') : '') || '';
      if (m2Val.indexOf('SunEnergy') !== -1) catalogKey = 'se';
      else if (m2Val.indexOf('Atlas') !== -1) catalogKey = 'ag';
      else if (m2Val.indexOf('SunWash') !== -1 || reqId === '#REQ-2026-0914') catalogKey = 'sunwash';
      else catalogKey = 'ps';
    }

    const base = CONTRACTOR_CATALOG[catalogKey] || CONTRACTOR_CATALOG.ps;
    const reqTitle = (card && card.getAttribute('data-title')) || 'Solar Service Request';
    const companyName = savedOffer.contractorName || base.contractorName;
    const price = savedOffer.price || (card && card.getAttribute('data-m1-val')) || base.price;
    const timeline = savedOffer.timeline || (card && card.getAttribute('data-m3-val')) || base.timeline;
    const scope = savedOffer.scope || base.scope;
    const bonus = savedOffer.bonus || base.bonus;
    const manager = savedOffer.manager || base.manager;
    const phone = savedOffer.phone || base.phone;
    const email = savedOffer.email || base.email;
    const loc = savedOffer.loc || base.loc;
    const cleanId = reqId.replace('#', '');
    activePdfFileName = savedOffer.pdfName || (companyName.replace(/[^a-zA-Z0-9]+/g, '_') + '_Proposal_' + cleanId + '.pdf');
    activePdfKey = savedOffer.pdfKey || '';

    if (aoModalTitle) aoModalTitle.textContent = 'Accepted Offer — ' + reqTitle + ' (' + reqId + ')';
    if (aoAvatar) {
      aoAvatar.textContent = savedOffer.initials || base.initials;
      aoAvatar.className = 'comp-avatar-badge display' + (base.avatarTone ? ' ' + base.avatarTone : '');
    }
    if (aoCompName) aoCompName.textContent = companyName;
    if (aoCompRating) aoCompRating.textContent = base.rating;
    if (aoPrice) aoPrice.textContent = price;
    if (aoTimeline) aoTimeline.textContent = '⏱ ' + timeline;
    if (aoScope) aoScope.textContent = scope;
    if (aoBonus) aoBonus.textContent = bonus;
    if (aoPdfName) aoPdfName.textContent = activePdfFileName;
    if (aoManager) aoManager.textContent = manager;
    if (aoPhone) aoPhone.textContent = phone;
    if (aoEmail) aoEmail.textContent = email;
    if (aoLoc) aoLoc.textContent = loc;

    if (aoPdfPreviewBox) {
      aoPdfPreviewBox.classList.remove('open');
    }
    if (aoPdfPreviewText) {
      aoPdfPreviewText.innerHTML =
        '<strong>Document Reference:</strong> ' + activePdfFileName + '<br>' +
        '<strong>Submitted By:</strong> ' + companyName + ' (' + manager + ')<br>' +
        '<strong>Client Request:</strong> ' + reqTitle + ' (' + reqId + ')<br>' +
        '<strong>Total Contract Value (Tax Incl.):</strong> ' + price + '<br>' +
        '<strong>Execution Schedule:</strong> ' + timeline + '<br>' +
        '<strong>Scope Summary:</strong> ' + scope;
    }

    if (aoModalBackdrop) {
      aoModalBackdrop.classList.add('open');
      aoModalBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeAcceptedOfferModal() {
    if (aoModalBackdrop) {
      aoModalBackdrop.classList.remove('open');
      aoModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (aoCloseBtn) aoCloseBtn.addEventListener('click', closeAcceptedOfferModal);
  if (aoDoneBtn) aoDoneBtn.addEventListener('click', closeAcceptedOfferModal);
  if (aoModalBackdrop) {
    aoModalBackdrop.addEventListener('click', function (e) {
      if (e.target === aoModalBackdrop) closeAcceptedOfferModal();
    });
  }

  if (aoPreviewPdfBtn && aoPdfPreviewBox) {
    aoPreviewPdfBtn.addEventListener('click', function () {
      aoPdfPreviewBox.classList.toggle('open');
    });
  }

  if (aoDownloadPdfBtn) {
    aoDownloadPdfBtn.addEventListener('click', function () {
      if (aoPdfPreviewBox) aoPdfPreviewBox.classList.add('open');
      if (activePdfKey && window.indexedDB) {
        const open = indexedDB.open('shamstech_proposal_files', 1);
        open.onsuccess = function () {
          const db = open.result;
          if (!db.objectStoreNames.contains('files')) { db.close(); return; }
          const get = db.transaction('files', 'readonly').objectStore('files').get(activePdfKey);
          get.onsuccess = function () {
            if (get.result) {
              const url = URL.createObjectURL(get.result);
              const link = document.createElement('a'); link.href = url; link.download = activePdfFileName; link.click();
              setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
            }
            db.close();
          };
        };
        return;
      }
      showToast('📄 Downloading official company PDF offer: ' + activePdfFileName);
    });
  }

  // =====================================================
  // 4. CANCEL / DELETE CONFIRMATION MODAL LOGIC
  // =====================================================
  const cancelModalBackdrop = document.getElementById('cancel-confirm-modal-backdrop');
  const cancelReqNameEl = document.getElementById('cancel-confirm-req-name');
  const confirmDeleteBtn = document.getElementById('confirm-delete-req-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-req-btn');

  let pendingCancelCard = null;

  function openCancelConfirmModal(card) {
    pendingCancelCard = card;
    const reqTitle = (card && card.getAttribute('data-title')) || 'this request';
    const reqId = (card && card.getAttribute('data-id')) || '';
    if (cancelReqNameEl) {
      cancelReqNameEl.textContent = '"' + reqTitle + '" (' + reqId + ')';
    }
    if (cancelModalBackdrop) {
      cancelModalBackdrop.classList.add('open');
      cancelModalBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeCancelConfirmModal() {
    pendingCancelCard = null;
    if (cancelModalBackdrop) {
      cancelModalBackdrop.classList.remove('open');
      cancelModalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', closeCancelConfirmModal);
  }
  if (cancelModalBackdrop) {
    cancelModalBackdrop.addEventListener('click', function (e) {
      if (e.target === cancelModalBackdrop) closeCancelConfirmModal();
    });
  }

  function archiveAndRemoveCard(card, action) {
    if (!card) return;
    const reqId = card.getAttribute('data-id') || ('#REQ-' + Date.now());
    const reqTitle = card.getAttribute('data-title') || 'Solar Service Request';
    const reqMeta = card.getAttribute('data-meta') || ('ID: ' + reqId);
    const reqIcon = card.getAttribute('data-icon') || '#i-zap';
    const m1Label = card.getAttribute('data-m1-label') || 'SERVICE TYPE';
    const m1Val = card.getAttribute('data-m1-val') || 'Solar Service';
    const m2Label = card.getAttribute('data-m2-label') || 'DETAILS';
    const m2Val = card.getAttribute('data-m2-val') || 'Verified';
    const m3Label = card.getAttribute('data-m3-label') || 'TIMELINE';
    const m3Val = card.getAttribute('data-m3-val') || 'Archived';
    const cat = card.getAttribute('data-category') || 'execution';

    // Save to Requests History ('shamstech_requests_history')
    addRequestToHistory({
      id: reqId,
      title: reqTitle,
      meta: reqMeta,
      icon: reqIcon,
      category: cat,
      metric1Label: m1Label,
      metric1Value: m1Val,
      metric2Label: m2Label,
      metric2Value: m2Val,
      metric3Label: m3Label,
      metric3Value: m3Val,
      statusNote: action === 'complete'
        ? '✓ Completed: Service marked as completed by user and archived in Requests History.'
        : '✕ Cancelled / Deleted: Request was cancelled by user and moved to Requests History.',
      historyStatus: action === 'complete' ? 'COMPLETED' : 'CANCELLED',
      archivedDate: 'Oct 11, 2026'
    });

    // Record ID in archived list and remove from active user requests
    const arch = getArchivedRequestIds();
    if (arch.indexOf(reqId) === -1) {
      arch.push(reqId);
      saveArchivedRequestIds(arch);
    }

    const remainingReqs = getUserRequests().filter(function (r) { return r.id !== reqId; });
    saveUserRequests(remainingReqs);

    card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.96)';
    setTimeout(function () {
      card.remove();
      updateTabCounts();
    }, 240);

    if (action === 'complete') {
      showToast('✓ "' + reqTitle + '" marked as Completed and saved to Requests History!');
    } else {
      showToast('🗑 "' + reqTitle + '" cancelled and moved to Requests History.');
    }
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', function () {
      if (pendingCancelCard) {
        const cardToRemove = pendingCancelCard;
        closeCancelConfirmModal();
        archiveAndRemoveCard(cardToRemove, 'cancel');
      }
    });
  }

  // 5. Event Delegation for Offer Links, View Accepted Offer Modal, Toast Buttons, Complete & Cancel
  if (listContainer) {
    listContainer.addEventListener('click', function (e) {
      const offerLink = e.target.closest('a[href*="/html/request_offers.html"]');
      if (offerLink) {
        const card = offerLink.closest('.submitted-req-card');
        if (card && card.getAttribute('data-id')) {
          localStorage.setItem('shamstech_active_offer_req_id', card.getAttribute('data-id'));
        }
        return;
      }

      const toastBtn = e.target.closest('[data-toast]');
      if (toastBtn) {
        showToast(toastBtn.getAttribute('data-toast'));
        return;
      }

      const actionBtn = e.target.closest('[data-req-action]');
      if (!actionBtn) return;

      const card = actionBtn.closest('.submitted-req-card');
      if (!card) return;

      const action = actionBtn.getAttribute('data-req-action'); // 'view-accepted' | 'complete' | 'cancel'
      const reqId = card.getAttribute('data-id') || '#REQ-2026-0892';

      if (action === 'view-accepted') {
        openAcceptedOfferModal(card, reqId);
        return;
      }

      if (action === 'cancel') {
        // Prevent deleting if the request is In Execution
        if (card.getAttribute('data-category') === 'execution') {
          showToast('⚠ Requests currently In Execution cannot be deleted.');
          return;
        }
        openCancelConfirmModal(card);
        return;
      }

      if (action === 'complete') {
        archiveAndRemoveCard(card, 'complete');
      }
    });
  }
});
