/* =====================================================
   SHAMSTECH JO - REQUEST OFFERS COMPARISON JS (js/request_offers.js)
   Explanation of what was done in this file:
   1. Loads the logged-in user's name from localStorage
      ('shamstech_user_name') and displays it in the navbar button.
   2. Stores the 3 competing solar company offers (Philadelphia
      Solar Jordan, SunEnergy Jordan Ltd., Atlas Green Energy).
   3. Opens the Proposal Confirmation popup modal when the user
      clicks "Accept Best Proposal" or "Accept Proposal" on any offer.
   4. Inside the popup modal, provides "Accept" and "Cancel":
      - Clicking "Cancel" closes the popup without changing status.
      - Clicking "Accept" updates the request's status to
        "In Execution" (قيد التنفيذ) across request_offers.html,
        my_requests.html, and client_home.html.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Load logged-in user's name into the navbar button
  const savedName = localStorage.getItem('shamstech_user_name') || 'Ahmad Ali';
  const navUserName = document.getElementById('nav-user-name');
  const navUserAvatar = document.getElementById('nav-user-avatar');

  if (navUserName) navUserName.textContent = savedName;
  if (navUserAvatar) navUserAvatar.textContent = savedName.charAt(0).toUpperCase();

  // Navbar dropdown toggle
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

  // Mobile menu toggle
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      menuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  // Determine which Request ID is being viewed
  const params = new URLSearchParams(window.location.search);
  const currentReqId = params.get('id') || localStorage.getItem('shamstech_active_offer_req_id') || '#REQ-2026-0892';
  const cleanReqId = String(currentReqId).replace('#', '');

  const reqHeading = document.getElementById('offers-req-heading');
  const reqSub = document.getElementById('offers-req-sub');
  const statusBadge = document.getElementById('offers-status-badge');

  // If this is a user-submitted request from 'shamstech_user_requests', display its title & meta
  let matchedUserRequest = null;
  try {
    const rawReqs = localStorage.getItem('shamstech_user_requests');
    const userReqs = rawReqs ? JSON.parse(rawReqs) : [];
    matchedUserRequest = userReqs.find(function (r) { return String(r.id || '').replace('#', '') === cleanReqId; }) || null;
    if (matchedUserRequest) {
      if (reqHeading) reqHeading.textContent = matchedUserRequest.title + ' (' + matchedUserRequest.id + ')';
      if (reqSub) reqSub.textContent = matchedUserRequest.meta;
    }
  } catch (e) {}

  // 2. Company Contact & Offer Data
  const CONTRACTORS = {
    ps: {
      initials: 'PS',
      avatarClass: 'comp-avatar green display',
      name: 'Philadelphia Solar Jordan',
      rating: '★ 4.9 (128 Reviews) • Tier-1 Certified Installer',
      price: '3,450 JOD',
      timeline: '20 Business Days',
      scope: '“10x 550W Mono Half-Cell Panels + Huawei 5kW Hybrid-Ready Inverter. Includes full JEPCO/IDECO net-metering paperwork & 10-year workmanship warranty.”',
      bonus: '✓ Free 1st-year panel wash & thermal inspection included',
      pdfName: 'Philadelphia_Solar_Proposal_REQ0892.pdf',
      manager: 'Eng. Ahmad Al-Majali',
      phone: '📞 +962 79 880 1234',
      email: '✉️ projects@philadelphiasolar.jo',
      loc: '📍 Amman, King Abdullah II Industrial City'
    },
    se: {
      initials: 'SE',
      avatarClass: 'comp-avatar navy display',
      name: 'SunEnergy Jordan Ltd.',
      rating: '★ 4.6 (84 Reviews) • Licensed Contractor',
      price: '3,200 JOD',
      timeline: '35 Business Days',
      scope: '“12x 460W Longi Solar Panels + Growatt 5kW On-Grid Inverter. Standard galvanized steel mounting structure, 5-year installation warranty.”',
      bonus: '✓ Includes JEPCO/IDECO grid inspection & structural mounting kit',
      pdfName: 'SunEnergy_Jordan_Proposal_REQ0892.pdf',
      manager: 'Eng. Rami Al-Zoubi',
      phone: '📞 +962 79 512 9090',
      email: '✉️ bids@sunenergy.jo',
      loc: '📍 Amman, Mecca Street · Building 84'
    },
    ag: {
      initials: 'AG',
      avatarClass: 'comp-avatar bronze display',
      name: 'Atlas Green Energy',
      rating: '★ 4.8 (96 Reviews) • Fast-Track Specialist',
      price: '3,900 JOD',
      timeline: '15 Business Days',
      scope: '“10x 550W Trina Vertex S Panels + Deye 6kW Hybrid Inverter. Heavy-duty rust-free aluminum rails + priority grid connection.”',
      bonus: '✓ Priority 15-day fast-track installation & smart monitoring setup',
      pdfName: 'Atlas_Green_Energy_Proposal_REQ0892.pdf',
      manager: 'Eng. Laith Haddad',
      phone: '📞 +962 77 940 3311',
      email: '✉️ engineering@atlasgreen.jo',
      loc: '📍 Irbid, University Street · Commercial Tower'
    }
  };

  // Replace the demo offers with the real offers submitted for this customer's request.
  let submittedOffers = [];
  try {
    const saved = JSON.parse(localStorage.getItem('shamstech_company_bids') || '[]');
    if (Array.isArray(saved)) submittedOffers = saved.filter(function (b) { return String(b.id || '').replace('#', '') === cleanReqId; });
  } catch (e) {}
  if (matchedUserRequest) {
    const stack = document.querySelector('.proposals-stack');
    if (stack) {
      if (statusBadge) statusBadge.textContent = submittedOffers.length + (submittedOffers.length === 1 ? ' Proposal Received' : ' Proposals Received');
      if (!submittedOffers.length) {
        stack.innerHTML = '<div class="proposal-empty-state">No company proposals have been submitted for this request yet.</div>';
      } else {
        stack.innerHTML = submittedOffers.map(function (bid, index) {
          const source = String(bid.bidKey || bid.companyEmail || bid.company || index);
          let hash = 0;
          for (let i = 0; i < source.length; i++) hash = ((hash << 5) - hash + source.charCodeAt(i)) | 0;
          const key = 'submitted-' + Math.abs(hash);
          const name = bid.company || 'Solar Service Company';
          const initials = name.split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase();
          CONTRACTORS[key] = {
            initials: initials || 'SC', avatarClass: 'comp-avatar green display', name: name,
            rating: bid.companyEmail || 'Submitted company proposal', price: bid.value || 'Price not provided',
            timeline: bid.timeline || 'Timeline not provided', scope: bid.scope || 'No additional remarks provided.',
            bonus: '', pdfName: bid.pdfFile || 'Technical_Proposal.pdf', pdfKey: bid.pdfKey || '',
            manager: name, phone: 'Not provided', email: bid.companyEmail || 'Not provided', loc: 'Not provided'
          };
          return '<article class="proposal-card" data-card="' + key + '">' +
            '<div class="comp-profile-row"><span class="' + CONTRACTORS[key].avatarClass + '">' + initials + '</span><div class="comp-info"><h3 class="display">' + escapeHtml(name) + '</h3><p class="comp-rating">' + escapeHtml(bid.companyEmail || 'Company proposal') + '</p></div></div>' +
            '<div class="comp-metrics-grid"><div class="comp-metric-box tinted-green"><span>TOTAL PROPOSED PRICE</span><strong class="display">' + escapeHtml(bid.value || '—') + '</strong></div><div class="comp-metric-box"><span>EXECUTION TIMELINE</span><strong class="display">' + escapeHtml(bid.timeline || '—') + '</strong></div></div>' +
            '<div class="comp-scope-box"><p class="comp-scope-title display">Technical proposal &amp; remarks</p><p>' + escapeHtml(bid.scope || 'No additional remarks provided.') + '</p></div>' +
            '<div class="comp-actions-row"><button type="button" class="btn-req-outline display" data-pdf="' + escapeHtml(bid.pdfFile || 'Technical_Proposal.pdf') + '" data-pdf-key="' + escapeHtml(bid.pdfKey || '') + '"><span>Download Proposal PDF</span></button><button type="button" class="btn-accept-offer display" data-accept="' + key + '"><span>Accept Proposal</span></button></div></article>';
        }).join('');
      }
    }
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  function getAcceptedProposals() {
    try {
      const raw = localStorage.getItem('shamstech_accepted_proposals');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveAcceptedProposal(reqId, contractorKey, data) {
    try {
      const map = getAcceptedProposals();
      const cleanId = String(reqId).replace('#', '');
      map[cleanId] = {
        contractorKey: contractorKey,
        initials: data.initials,
        contractorName: data.name,
        rating: data.rating,
        price: data.price,
        timeline: data.timeline,
        scope: data.scope,
        bonus: data.bonus,
        pdfName: data.pdfName || (data.name.replace(/[^a-zA-Z0-9]+/g, '_') + '_Proposal_' + cleanId + '.pdf'),
        manager: data.manager,
        phone: data.phone,
        email: data.email,
        loc: data.loc,
        pdfKey: data.pdfKey || ''
      };
      localStorage.setItem('shamstech_accepted_proposals', JSON.stringify(map));
    } catch (e) {}

    // Also update if the request exists in 'shamstech_user_requests'
    try {
      const rawReqs = localStorage.getItem('shamstech_user_requests');
      const userReqs = rawReqs ? JSON.parse(rawReqs) : [];
      let updated = false;
      userReqs.forEach(function (r) {
        if (String(r.id || '').replace('#', '') === cleanId) {
          r.category = 'execution';
          r.badgeText = '● In Execution';
          r.metric1Label = 'AGREED PRICE';
          r.metric1Value = data.price;
          r.metric2Label = 'ASSIGNED CONTRACTOR';
          r.metric2Value = data.name;
          r.metric3Label = 'EXECUTION TIMELINE';
          r.metric3Value = data.timeline;
          r.statusNote = '✓ <strong>Status (In Execution):</strong> Proposal accepted with <strong>' + data.name + '</strong> (' + data.manager + '). Project is now in execution.';
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem('shamstech_user_requests', JSON.stringify(userReqs));
      }
    } catch (e) {}
  }

  function applyAcceptedUI(contractorKey) {
    const data = CONTRACTORS[contractorKey];
    if (!data) return;

    if (statusBadge) {
      statusBadge.className = 'sub-req-badge in-execution display';
      statusBadge.textContent = '● In Execution';
    }

    document.querySelectorAll('.proposal-card').forEach(function (card) {
      const key = card.getAttribute('data-card');
      if (key === contractorKey) {
        card.style.display = 'block';
        const btn = card.querySelector('[data-accept]');
        if (btn) {
          btn.className = 'btn-accept-offer display';
          btn.innerHTML = '<span>✓ Accepted — In Execution</span>';
        }
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Check if already accepted previously
  const existingAccepted = getAcceptedProposals()[cleanReqId] || getAcceptedProposals()[currentReqId];
  if (existingAccepted && existingAccepted.contractorKey) {
    applyAcceptedUI(existingAccepted.contractorKey);
  }

  const modalBackdrop = document.getElementById('offer-modal-backdrop');
  const modalAvatar = document.getElementById('modal-comp-avatar');
  const modalName = document.getElementById('modal-comp-name');
  const modalManager = document.getElementById('modal-comp-manager');
  const modalPhone = document.getElementById('modal-comp-phone');
  const modalEmail = document.getElementById('modal-comp-email');
  const modalLoc = document.getElementById('modal-comp-loc');
  const modalConfirmBtn = document.getElementById('modal-confirm-accept-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');

  let pendingContractorKey = 'ps';

  // 3. Open the Proposal Confirmation Modal when clicking any Accept button on the cards
  document.querySelectorAll('[data-accept]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const key = btn.getAttribute('data-accept');
      pendingContractorKey = key || 'ps';
      const data = CONTRACTORS[pendingContractorKey] || CONTRACTORS.ps;

      if (modalAvatar) {
        modalAvatar.textContent = data.initials;
        modalAvatar.className = data.avatarClass;
      }
      if (modalName) modalName.textContent = data.name;
      if (modalManager) modalManager.textContent = data.manager;
      if (modalPhone) modalPhone.textContent = data.phone;
      if (modalEmail) modalEmail.textContent = data.email;
      if (modalLoc) modalLoc.textContent = data.loc;

      if (modalBackdrop) {
        modalBackdrop.classList.add('open');
        modalBackdrop.setAttribute('aria-hidden', 'false');
      }
    });
  });

  function closeOfferModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // Cancel button closes the popup without changing status
  if (modalCancelBtn) {
    modalCancelBtn.addEventListener('click', function () {
      closeOfferModal();
    });
  }

  // Clicking outside the card also closes the popup
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) {
        closeOfferModal();
      }
    });
  }

  // Toast Feedback helper
  const toast = document.getElementById('offers-toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 3600);
  }

  // Accept button inside the popup modal -> updates status to In Execution (قيد التنفيذ)
  if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener('click', function () {
      const data = CONTRACTORS[pendingContractorKey] || CONTRACTORS.ps;
      saveAcceptedProposal(currentReqId, pendingContractorKey, data);
      applyAcceptedUI(pendingContractorKey);
      closeOfferModal();
      showToast('✓ Proposal from ' + data.name + ' accepted! Status updated to In Execution (قيد التنفيذ).');
      setTimeout(function () {
        window.location.href = '/html/my_requests.html';
      }, 1100);
    });
  }

  function downloadStoredPdf(key, filename) {
    if (!key) return;
    const open = indexedDB.open('shamstech_proposal_files', 1);
    open.onsuccess = function () {
      const db = open.result;
      if (!db.objectStoreNames.contains('files')) { db.close(); return; }
      const tx = db.transaction('files', 'readonly');
      const get = tx.objectStore('files').get(key);
      get.onsuccess = function () {
        if (get.result) {
          const url = URL.createObjectURL(get.result);
          const a = document.createElement('a'); a.href = url; a.download = filename || 'Technical_Proposal.pdf'; a.click();
          setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        }
        db.close();
      };
    };
  }
  document.querySelectorAll('[data-pdf]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const key = btn.getAttribute('data-pdf-key');
      if (key) { downloadStoredPdf(key, btn.getAttribute('data-pdf')); return; }
      showToast('Downloading technical & financial offer: ' + btn.getAttribute('data-pdf'));
    });
  });
});
