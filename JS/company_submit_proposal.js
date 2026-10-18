/* =====================================================
   SHAMSTECH JO - SUBMIT PROPOSAL FULL PAGE JS (js/company_submit_proposal.js)
   Matches Image 1 ("comp-requ2 2"):
   1. Route Guard: Ensures only authenticated Solar Companies access this.
   2. Parses request ID from URL query param (?id=REQ-...)
   3. Reads actual customer details submitted by the client from
      'shamstech_user_requests' (or institutional tenders database)
      and dynamically populates the left column.
   4. Keeps the right column bid form EMPTY for the company to enter
      their price, timeline, PDF proposal, and remarks.
   5. Handles submission to 'shamstech_company_bids' and confirmation.
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

  // 2. Company Name & Avatar in Navbar
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

  // Logout Handlers
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
  const toastEl = document.getElementById('proposal-toast');
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    setTimeout(function () {
      toastEl.style.display = 'none';
    }, 4500);
  }

  // 3. Parse Request ID from URL (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  let targetId = (urlParams.get('id') || '').replace('#', '');

  // 4. Load Customer Request Details
  // Check localStorage 'shamstech_user_requests' first for live customer requests
  let matchedUserReq = null;
  try {
    const raw = localStorage.getItem('shamstech_user_requests');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        matchedUserReq = parsed.find(function (r) {
          return targetId && r.id && String(r.id).replace('#', '') === targetId;
        });
      }
    }
  } catch (e) {}

  // Preset fallback records if not found in custom user requests
  const PRESET_REQUESTS = {
    'REQ-2026-0814': {
      title: '6.5 kWp Residential Solar System Installation',
      id: 'REQ-2026-0814',
      date: 'Posted: Today 10:30 AM',
      location: 'Irbid - Eastern District',
      fullLocation: 'Irbid Governorate - Eastern District (Near Al-Ansar School)',
      client: 'Samer Ali (Customer)',
      sector: 'Residential Sector | Roof Connection Type: Flat Concrete',
      m1Label: 'Est. Monthly Bill',
      m1Val: '110 JOD / Month',
      m2Label: 'System Connection Type',
      m2Val: 'On-Grid System',
      m3Label: 'Required Capacity',
      m3Val: '6.5 kWp',
      m4Label: 'Available Roof Surface',
      m4Val: 'Approx. 60 Sq. Meters',
      instructions: '"I prefer hybrid-ready inverters (Hybrid Ready 6kW). Is it possible to receive a quote that includes shadow angle calculations for the south side?"',
      photo1: 'South Roof Photo',
      photo1Img: '/images/panel.jpg',
      photo2: 'Electrical Panel Diagram',
      photo2Img: '/images/inverter.jpg'
    },
    'REQ-2026-0019': {
      title: '6.5 kW Residential Solar System Installation',
      id: 'REQ-2026-0019',
      date: 'Posted: Today 09:15 AM',
      location: 'Irbid - Al-Huson Highway',
      fullLocation: 'Irbid Governorate - Al-Huson Highway (Near Nuaimah Intersection)',
      client: 'Eng. Tariq Al-Zoubi (Customer)',
      sector: 'Residential Sector | Roof Connection Type: Flat Concrete Villa Roof',
      m1Label: 'Est. Monthly Bill',
      m1Val: '135 JOD / Month',
      m2Label: 'System Connection Type',
      m2Val: 'On-Grid 3-Phase',
      m3Label: 'Required Capacity',
      m3Val: '6.5 kWp Peak',
      m4Label: 'Available Roof Surface',
      m4Val: 'Approx. 140 Sq. Meters',
      instructions: '"Ready for immediate site survey. Priority given to installers offering European or Tier-1 inverters with 5-year workmanship warranty."',
      photo1: 'Villa Roof Top View',
      photo1Img: '/images/panel.jpg',
      photo2: 'Electricity Bill Attachment',
      photo2Img: '/images/racks.jpg'
    },
    'MNT-2026-4006': {
      title: 'Electrical & Inverter Health Check (5 kW)',
      id: 'MNT-2026-4006',
      date: 'Posted: Today 08:45 AM',
      location: 'Amman - Abdoun',
      fullLocation: 'Amman - Abdoun Residential Area (Near Circle)',
      client: 'Al-Rabi Commercial Complex',
      sector: 'Commercial Complex | Service: Maintenance & Cleaning',
      m1Label: 'Service Type',
      m1Val: 'Electrical & Inverter Check',
      m2Label: 'System Scale',
      m2Val: '24 Mono Panels',
      m3Label: 'Inverter Model',
      m3Val: 'Growatt 5kW 1-Phase',
      m4Label: 'Scheduled Slot',
      m4Val: 'Oct 15, 2026 (Morning)',
      instructions: '"Notice slight efficiency drop on string 2. Need certified engineer with thermal camera to check connectors and inverter firmware."',
      photo1: 'Inverter Installation Photo',
      photo1Img: '/images/inverter.jpg',
      photo2: 'Array Layout Diagram',
      photo2Img: '/images/panel.jpg'
    },
    'AI-2026-1716': {
      title: 'AI Fault Diagnosis Scan (Solar_Panel_Array.jpg)',
      id: 'AI-2026-1716',
      date: 'Posted: Today 11:20 AM',
      location: 'Irbid - University District',
      fullLocation: 'Irbid - University District (Opposite Yarmouk Campus)',
      client: 'Mansour Ali Al-Kofahi (Customer)',
      sector: 'Residential Sector | AI Diagnostics Dispatch',
      m1Label: 'Detected Issue',
      m1Val: 'Soiling Defect (Heavy Dust)',
      m2Label: 'AI Confidence',
      m2Val: '94% Accuracy',
      m3Label: 'Yield Impact',
      m3Val: '-18% Output Loss',
      m4Label: 'Recommended Action',
      m4Val: 'Soft-Wash Deionized Cleaning',
      instructions: '"AI analysis revealed severe micro-dust coating. Requesting water-jet deionized wash and electrical health verification."',
      photo1: 'Thermal AI Scan Photo',
      photo1Img: '/images/panel.jpg',
      photo2: 'Electrical Junction Box',
      photo2Img: '/images/racks.jpg'
    },
    'TND-2026-0101': {
      title: 'Supply & Installation of 100 kWp Solar Power System for Specialty Hospital',
      id: 'TND-2026-0101',
      date: 'Posted: Oct 10, 2026',
      location: 'Irbid - Specialty Hospital Street',
      fullLocation: 'Irbid Governorate - Specialty Hospital Campus, Main Building Roof',
      client: 'Specialty Hospital Mgmt',
      sector: 'Commercial Healthcare Sector | Class-A Contractor Tender',
      m1Label: 'Tender Capacity',
      m1Val: '100 kWp Tier-1 Array',
      m2Label: 'Grid Synchronization',
      m2Val: '3-Phase High Voltage',
      m3Label: 'Execution Deadline',
      m3Val: '30 Business Days',
      m4Label: 'Warranty Requirement',
      m4Val: '10-Year Full Workmanship',
      instructions: '"Official institutional tender. Bidders must attach company license, certified engineer CVs, and manufacturer datasheets in PDF format."',
      photo1: 'Hospital Rooftop Layout',
      photo1Img: '/images/panel.jpg',
      photo2: 'Substation Schematic',
      photo2Img: '/images/inverter.jpg'
    }
  };

  // Populate Details
  const displayTitle = document.getElementById('display-req-title');
  const displayId = document.getElementById('display-req-id');
  const displayDate = document.getElementById('display-req-date');
  const displayLocation = document.getElementById('display-req-location');
  const fullLocationText = document.getElementById('full-location-text');

  const custNameDisplay = document.getElementById('cust-name-display');
  const custSectorMeta = document.getElementById('cust-sector-meta');

  const m1Lbl = document.getElementById('metric-1-lbl');
  const m1Val = document.getElementById('metric-1-val');
  const m2Lbl = document.getElementById('metric-2-lbl');
  const m2Val = document.getElementById('metric-2-val');
  const m3Lbl = document.getElementById('metric-3-lbl');
  const m3Val = document.getElementById('metric-3-val');
  const m4Lbl = document.getElementById('metric-4-lbl');
  const m4Val = document.getElementById('metric-4-val');

  const custInstructionsText = document.getElementById('cust-instructions-text');
  const photo1Title = document.getElementById('photo-1-title');
  const photo2Title = document.getElementById('photo-2-title');

  let currentPhoto1Img = '/images/panel.jpg';
  let currentPhoto2Img = '/images/inverter.jpg';

  const displayTypeBadge = document.getElementById('display-req-type-badge');
  const thumbImg1 = document.getElementById('thumb-img-1');
  const thumbImg2 = document.getElementById('thumb-img-2');

  let currentReqType = 'solar-installation';
  let currentReqTag = 'Solar Installation';

  if (matchedUserReq) {
    // Dynamically populate from actual customer submission
    const titleLower = (matchedUserReq.title || '').toLowerCase();
    const isWash = titleLower.indexOf('wash') !== -1 || titleLower.indexOf('clean') !== -1;
    const service = matchedUserReq.service || ({ maintenance: 'repair', cleaning: 'clean', installation: 'install' }[matchedUserReq.category]) || '';
    const isMaint = service === 'repair' || /maint|repair|fault|diagnos/.test(titleLower) || /wrench|cpu/.test(matchedUserReq.icon || '');
    const isOther = service === 'other' || matchedUserReq.category === 'other';

    if (isWash && isMaint) {
      currentReqType = 'maint-wash';
      currentReqTag = 'Maintenance & Wash';
      currentPhoto1Img = '/images/clean.jpg';
      currentPhoto2Img = '/images/maintain.jpg';
    } else if (isWash || service === 'clean') {
      currentReqType = 'wash-only';
      currentReqTag = 'Wash';
      currentPhoto1Img = '/images/clean.jpg';
      currentPhoto2Img = '/images/panel.jpg';
    } else if (isMaint) {
      currentReqType = 'maintenance-only';
      currentReqTag = 'Maintenance';
      currentPhoto1Img = '/images/inverter.jpg';
      currentPhoto2Img = '/images/maintain.jpg';
    } else if (isOther) {
      currentReqType = 'other';
      currentReqTag = 'Other Services';
      currentPhoto1Img = '';
      currentPhoto2Img = '';
    } else {
      currentReqType = 'solar-installation';
      currentReqTag = 'Solar Installation';
      currentPhoto1Img = '/images/install.jpg';
      currentPhoto2Img = '/images/panel.jpg';
    }

    const clientName = matchedUserReq.client || matchedUserReq.clientName || 'Samer Ali (Customer)';
    const cleanId = (matchedUserReq.id || targetId).replace('#', '');
    const cleanTitle = matchedUserReq.title || 'Residential Solar System Installation';

    const metaLocation = ((matchedUserReq.meta || '').match(/(?:Location|Governorate):\s*([^•|]+)/i) || [])[1];
    const locStr = matchedUserReq.location || metaLocation || matchedUserReq.metric2Value || 'Location not provided';

    if (displayTitle) displayTitle.textContent = 'Request Details: ' + cleanTitle;
    if (displayId) displayId.textContent = cleanId;
    if (displayDate) displayDate.textContent = 'Posted: ' + (matchedUserReq.dateLabel || (matchedUserReq.createdAt ? new Date(matchedUserReq.createdAt).toLocaleDateString() : 'Date not provided'));
    if (displayLocation) displayLocation.textContent = locStr;
    if (fullLocationText) fullLocationText.textContent = locStr + ' - Verified Property Location';

    if (custNameDisplay) custNameDisplay.textContent = clientName;
    if (custSectorMeta) custSectorMeta.textContent = matchedUserReq.sector || (isMaint ? 'Maintenance & Technical Request' : (isWash || service === 'clean' ? 'Cleaning Request' : (isOther ? 'Specialized Service Request' : 'Solar Installation Request')));
    const requestMetrics = [
      [matchedUserReq.metric1Label, matchedUserReq.metric1Value],
      [matchedUserReq.metric2Label, matchedUserReq.metric2Value],
      [matchedUserReq.metric3Label, matchedUserReq.metric3Value],
      (matchedUserReq.details || []).find(function (d) { return d && d[1] && !/location|photo|attachment/i.test(d[0] || ''); }) || []
    ];
    [[m1Lbl, m1Val], [m2Lbl, m2Val], [m3Lbl, m3Val], [m4Lbl, m4Val]].forEach(function (els, i) {
      const metric = requestMetrics[i] || [];
      if (els[0]) els[0].textContent = metric[0] || 'Request detail';
      if (els[1]) els[1].textContent = metric[1] || 'Not provided';
    });

    // Customer instructions
    const noteDetail = (matchedUserReq.details || []).find(function (d) { return d && d[1] && /notes|description|requirement/i.test(d[0] || ''); });
    let cleanNotes = (noteDetail && noteDetail[1]) || (matchedUserReq.statusNote ? matchedUserReq.statusNote.replace(/<[^>]*>?/gm, '').replace(/^\s*[^:]+:\s*/, '').trim() : 'No additional instructions provided.');
    if (custInstructionsText) custInstructionsText.textContent = '"' + cleanNotes + '"';

    const requestPhotos = Array.isArray(matchedUserReq.photos) ? matchedUserReq.photos.filter(function (p) { return p && p.url; }) : [];
    currentPhoto1Img = requestPhotos[0] ? requestPhotos[0].url : '';
    currentPhoto2Img = requestPhotos[1] ? requestPhotos[1].url : '';
    if (photo1Title) photo1Title.textContent = requestPhotos[0] ? (requestPhotos[0].name || 'Customer attachment') : 'No attachment';
    if (photo2Title) photo2Title.textContent = requestPhotos[1] ? (requestPhotos[1].name || 'Customer attachment') : 'No attachment';
    const photoSection = document.querySelector('.attached-photos-section');
    if (photoSection) photoSection.hidden = requestPhotos.length === 0;
    const photoCard1 = document.getElementById('btn-preview-photo-1');
    const photoCard2 = document.getElementById('btn-preview-photo-2');
    if (photoCard1) photoCard1.hidden = !requestPhotos[0];
    if (photoCard2) photoCard2.hidden = !requestPhotos[1];
  } else {
    // Use preset data matching Image 1
    const preset = PRESET_REQUESTS[targetId];

    if (!preset) {
      currentReqType = 'unavailable';
      currentReqTag = 'Request unavailable';
      if (displayTitle) displayTitle.textContent = 'Request details are unavailable';
      if (displayId) displayId.textContent = targetId || 'No request ID';
      if (displayDate) displayDate.textContent = '';
      if (displayLocation) displayLocation.textContent = 'Location unavailable';
      if (fullLocationText) fullLocationText.textContent = 'This request could not be found. Return to Open Requests and select it again.';
      if (custNameDisplay) custNameDisplay.textContent = 'Customer details unavailable';
      if (custSectorMeta) custSectorMeta.textContent = 'The selected request is not available in the current request data.';
      [[m1Lbl, m1Val], [m2Lbl, m2Val], [m3Lbl, m3Val], [m4Lbl, m4Val]].forEach(function (els) {
        if (els[0]) els[0].textContent = 'Request detail';
        if (els[1]) els[1].textContent = 'Unavailable';
      });
      if (custInstructionsText) custInstructionsText.textContent = 'No request data is available.';
      const photoSection = document.querySelector('.attached-photos-section');
      if (photoSection) photoSection.hidden = true;
      currentPhoto1Img = '';
      currentPhoto2Img = '';
      const bidSubmit = document.getElementById('btn-submit-proposal');
      if (bidSubmit) bidSubmit.disabled = true;
    } else {

    if (targetId.indexOf('MNT') !== -1) {
      currentReqType = 'maint-wash';
      currentReqTag = 'Maintenance & Wash';
    } else if (targetId.indexOf('AI') !== -1) {
      currentReqType = 'maintenance-only';
      currentReqTag = 'Maintenance';
    } else {
      currentReqType = 'solar-installation';
      currentReqTag = 'Solar Installation';
    }

    if (displayTitle) displayTitle.textContent = 'Request Details: ' + preset.title;
    if (displayId) displayId.textContent = preset.id;
    if (displayDate) displayDate.textContent = preset.date;
    if (displayLocation) displayLocation.textContent = preset.location;
    if (fullLocationText) fullLocationText.textContent = preset.fullLocation;

    if (custNameDisplay) custNameDisplay.textContent = preset.client;
    if (custSectorMeta) custSectorMeta.textContent = preset.sector;

    if (m1Lbl) m1Lbl.textContent = preset.m1Label;
    if (m1Val) m1Val.textContent = preset.m1Val;
    if (m2Lbl) m2Lbl.textContent = preset.m2Label;
    if (m2Val) m2Val.textContent = preset.m2Val;
    if (m3Lbl) m3Lbl.textContent = preset.m3Label;
    if (m3Val) m3Val.textContent = preset.m3Val;
    if (m4Lbl) m4Lbl.textContent = preset.m4Label;
    if (m4Val) m4Val.textContent = preset.m4Val;

    if (custInstructionsText) custInstructionsText.textContent = preset.instructions;

    if (photo1Title) photo1Title.textContent = preset.photo1;
    if (photo2Title) photo2Title.textContent = preset.photo2;
    currentPhoto1Img = preset.photo1Img;
    currentPhoto2Img = preset.photo2Img;
    }
  }

  // Set request badge type
  if (displayTypeBadge) {
    displayTypeBadge.textContent = currentReqTag;
    displayTypeBadge.className = 'card-type-tag ' + currentReqType + ' display';
  }

  // Populate small thumbnail images
  if (thumbImg1) thumbImg1.src = currentPhoto1Img;
  if (thumbImg2) thumbImg2.src = currentPhoto2Img;

  // 5. Image Preview Modal
  const previewModal = document.getElementById('image-preview-modal');
  const previewCloseBtn = document.getElementById('btn-close-preview');
  const previewImg = document.getElementById('preview-modal-img');
  const previewTitle = document.getElementById('preview-modal-title');
  const btnPrev1 = document.getElementById('btn-preview-photo-1');
  const btnPrev2 = document.getElementById('btn-preview-photo-2');

  function openPreview(imgSrc, title) {
    if (!previewModal || !imgSrc) return;
    if (previewImg) previewImg.src = imgSrc;
    if (previewTitle) previewTitle.textContent = title;
    previewModal.classList.add('open');
    previewModal.setAttribute('aria-hidden', 'false');
  }

  function closePreview() {
    if (!previewModal) return;
    previewModal.classList.remove('open');
    previewModal.setAttribute('aria-hidden', 'true');
  }

  if (btnPrev1) {
    btnPrev1.addEventListener('click', function () {
      openPreview(currentPhoto1Img, photo1Title ? photo1Title.textContent : 'Attached Photo');
    });
  }
  if (btnPrev2) {
    btnPrev2.addEventListener('click', function () {
      openPreview(currentPhoto2Img, photo2Title ? photo2Title.textContent : 'Attached Layout');
    });
  }
  if (previewCloseBtn) previewCloseBtn.addEventListener('click', closePreview);
  if (previewModal) {
    previewModal.addEventListener('click', function (e) {
      if (e.target === previewModal) closePreview();
    });
  }

  // 6. Right Column: Bid Form Logic (Inputs are EMPTY for Company Entry)
  const bidForm = document.getElementById('company-bid-form');
  const priceInput = document.getElementById('bid-total-price');
  const timelineInput = document.getElementById('bid-timeline');
  const remarksInput = document.getElementById('bid-remarks');
  const dropZone = document.getElementById('pdf-drop-zone');
  const pdfFileInput = document.getElementById('pdf-file-input');
  const pdfChosenBadge = document.getElementById('pdf-chosen-badge');
  const pdfFileNameText = document.getElementById('pdf-file-name-text');

  let selectedPdfFileName = '';
  let selectedPdfFile = null;

  // Drag & drop or file click
  if (dropZone && pdfFileInput) {
    dropZone.addEventListener('click', function () {
      pdfFileInput.click();
    });

    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--forest)';
      dropZone.style.background = '#fefce8';
    });

    dropZone.addEventListener('dragleave', function () {
      dropZone.style.borderColor = '';
      dropZone.style.background = '';
    });

    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.style.borderColor = '';
      dropZone.style.background = '';
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handlePdfSelection(e.dataTransfer.files[0]);
      }
    });

    pdfFileInput.addEventListener('change', function () {
      if (pdfFileInput.files && pdfFileInput.files.length > 0) {
        handlePdfSelection(pdfFileInput.files[0]);
      }
    });
  }

  function handlePdfSelection(file) {
    if (!file || !/\.pdf$/i.test(file.name) || file.size > 10 * 1024 * 1024) {
      showToast('Please select a PDF file up to 10 MB.');
      selectedPdfFile = null;
      selectedPdfFileName = '';
      if (pdfFileInput) pdfFileInput.value = '';
      if (pdfChosenBadge) pdfChosenBadge.style.display = 'none';
      return;
    }
    selectedPdfFile = file;
    selectedPdfFileName = file.name;
    if (pdfFileNameText) pdfFileNameText.textContent = selectedPdfFileName;
    if (pdfChosenBadge) pdfChosenBadge.style.display = 'inline-flex';
  }

  function saveProposalPdf(key, file) {
    return new Promise(function (resolve, reject) {
      const request = indexedDB.open('shamstech_proposal_files', 1);
      request.onupgradeneeded = function () {
        if (!request.result.objectStoreNames.contains('files')) request.result.createObjectStore('files');
      };
      request.onerror = function () { reject(request.error); };
      request.onsuccess = function () {
        const db = request.result;
        const tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put(file, key);
        tx.oncomplete = function () { db.close(); resolve(); };
        tx.onerror = function () { db.close(); reject(tx.error); };
      };
    });
  }

  // Submit Bid Form
  if (bidForm) {
    bidForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const priceVal = priceInput ? priceInput.value.trim() : '';
      const timelineVal = timelineInput ? timelineInput.value.trim() : '';
      const remarksVal = remarksInput ? remarksInput.value.trim() : '';

      if (!priceVal) {
        showToast('Please enter the total required price in JOD.');
        if (priceInput) priceInput.focus();
        return;
      }
      if (!timelineVal) {
        showToast('Please specify the execution timeline.');
        if (timelineInput) timelineInput.focus();
        return;
      }
      if (!targetId || !selectedPdfFile) {
        showToast(!targetId ? 'This request could not be identified. Return to Open Requests and select it again.' : 'Please attach the technical proposal PDF.');
        return;
      }

      const formattedPrice = priceVal + ' JOD';
      const cleanReqTitle = displayTitle ? displayTitle.textContent.replace('Request Details: ', '') : 'Solar System Request';
      const clientName = custNameDisplay ? custNameDisplay.textContent : 'Samer Ali';

      // Save proposal into 'shamstech_company_bids'
      try {
        let bids = [];
        const raw = localStorage.getItem('shamstech_company_bids');
        if (raw) bids = JSON.parse(raw);
        if (!Array.isArray(bids)) bids = [];

        const companyEmail = (localStorage.getItem('shamstech_user_email') || '').trim().toLowerCase();
        const companyName = localStorage.getItem('shamstech_company_name') || rawCompName;
        const pdfKey = targetId + '::' + (companyEmail || companyName.toLowerCase());
        await saveProposalPdf(pdfKey, selectedPdfFile);
        const existingIdx = bids.findIndex(function (b) {
          return String(b.id || '').replace('#', '') === targetId && (b.companyEmail || b.company || '').toLowerCase() === (companyEmail || companyName.toLowerCase());
        });
        const newBidRecord = {
          id: targetId,
          bidKey: pdfKey,
          title: cleanReqTitle,
          client: clientName,
          company: companyName,
          companyEmail: companyEmail,
          submittedAt: new Date().toISOString(),
          value: formattedPrice,
          timeline: timelineVal,
          scope: remarksVal || 'No additional remarks provided.',
          pdfKey: pdfKey,
          pdfFile: selectedPdfFileName,
          status: 'Under Review',
          statusClass: 'review',
          actionType: 'modify'
        };

        if (existingIdx !== -1) {
          bids[existingIdx] = newBidRecord;
        } else {
          bids.unshift(newBidRecord);
        }

        localStorage.setItem('shamstech_company_bids', JSON.stringify(bids));
      } catch (err) {
        showToast('The proposal could not be saved. Please try again.');
        return;
      }

      showToast('🚀 Proposal successfully sent to ' + clientName + '! Total: ' + formattedPrice);

      // Disable submit button state
      const submitBtn = document.getElementById('btn-submit-proposal');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>✓ Proposal Sent Successfully!</span>';
        submitBtn.style.background = '#15803d';
      }

      // Show Proposal Success Modal with Two Options
      const successModal = document.getElementById('proposal-success-modal');
      const sumPrice = document.getElementById('modal-sum-price');
      const sumTimeline = document.getElementById('modal-sum-timeline');
      const sumId = document.getElementById('modal-sum-id');
      const sumClient = document.getElementById('modal-sum-client');

      if (sumPrice) sumPrice.textContent = formattedPrice;
      if (sumTimeline) sumTimeline.textContent = timelineVal;
      if (sumId) sumId.textContent = targetId;
      if (sumClient) sumClient.textContent = clientName;

      if (successModal) {
        successModal.classList.add('open');
        successModal.setAttribute('aria-hidden', 'false');
      }
    });
  }
});
