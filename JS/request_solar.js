/* =====================================================
   SHAMSTECH JO - REQUEST SOLAR & MULTI-SERVICES JS (js/request_solar.js)
   1. Dynamic Service Switcher (5 Services on one page):
      - 1. Solar Installation (service=solar)
      - 2. Solar Maintenance & Repair (service=maintenance)
      - 3. Panel Cleaning (service=cleaning) [Reordered as 3]
      - 4. Other Services (service=other) [Reordered as 4]
      - 5. Selling Used Parts (service=used_parts -> marketplace portal)
   2. Reads URL query param `?service=...` to set the active dropdown and panel.
   3. Multi-Photo Upload:
      - Solar System & Maintenance retain multi-photo range upload.
      - Panel Cleaning & Other Services have photos and time removed per user request.
   4. Form submissions for all services -> Saves into 'shamstech_user_requests'
      and triggers the confirmation modal.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Client Navbar & Dropdown
  const savedName = localStorage.getItem('shamstech_user_name') || 'Ahmad Ali';
  const navUserName = document.getElementById('nav-user-name');
  const navUserAvatar = document.getElementById('nav-user-avatar');
  if (navUserName) navUserName.textContent = savedName;
  if (navUserAvatar) navUserAvatar.textContent = savedName.charAt(0).toUpperCase();

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

  // 2. Reusable Multi-Photo Upload Handler Factory
  // Image pattern: 0 photos -> big upload box. 1+ photos -> inside dashed range with small squares & X, plus slim button underneath!
  function shrinkImage(dataUrl, done) {
    const img = new Image();
    img.onload = function () {
      const s = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); done(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = function () { done(dataUrl); };
    img.src = dataUrl;
  }
  function createMultiPhotoUploader(config) {
    const fileInput = document.getElementById(config.inputId);
    const uploadBox = document.getElementById(config.boxId);
    const grid = document.getElementById(config.gridId);
    const addMoreBtn = document.getElementById(config.btnId);
    const addMoreLabel = document.getElementById(config.labelId);

    const photos = [];

    function renderGrid() {
      if (!grid) return;
      if (photos.length === 0) {
        grid.style.display = 'none';
        grid.innerHTML = '';
        if (uploadBox) {
          uploadBox.style.display = 'flex';
          uploadBox.classList.remove('has-file');
        }
        if (addMoreBtn) {
          addMoreBtn.style.display = 'none';
        }
        return;
      }

      // Photos inside dashed range container with small square preview and 'X' button
      grid.style.display = 'flex';
      grid.innerHTML = photos.map(function (photo) {
        return (
          '<div class="sell-photo-thumb-card" data-photo-id="' + photo.id + '">' +
            '<img src="' + photo.url + '" alt="' + (photo.name || config.fallbackName) + '" class="sell-photo-thumb-img">' +
            '<button type="button" class="sell-photo-remove-btn" data-remove-id="' + photo.id + '" title="Remove Photo" aria-label="Remove Photo">✕</button>' +
          '</div>'
        );
      }).join('');

      if (uploadBox) {
        uploadBox.style.display = 'none';
      }
      if (addMoreBtn) {
        addMoreBtn.style.display = 'flex';
        if (addMoreLabel) {
          addMoreLabel.textContent = '+ Add More Photos (' + photos.length + ' attached)';
        }
      }
    }

    if (addMoreBtn && fileInput) {
      addMoreBtn.addEventListener('click', function (e) {
        e.preventDefault();
        fileInput.click();
      });
    }

    function processFiles(fileList) {
      const files = Array.from(fileList || []);
      if (!files.length) return;

      let processed = 0;
      files.forEach(function (file) {
        if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
          processed++;
          return;
        }
        const reader = new FileReader();
        reader.onload = function (ev) {
          const finish = function (url) {
            photos.push({ id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6), name: file.name, url: url });
            processed++;
            if (processed === files.length) renderGrid();
          };
          if (file.type.includes('pdf')) finish('/images/panel.jpg'); else shrinkImage(ev.target.result, finish);   // small copy keeps browser storage light
        };
        reader.readAsDataURL(file);
      });

      if (fileInput) fileInput.value = '';
    }

    if (fileInput) {
      fileInput.addEventListener('change', function (e) {
        processFiles(e.target.files);
      });
    }

    [uploadBox, grid].forEach(function (zone) {
      if (!zone) return;
      ['dragenter', 'dragover'].forEach(function (evName) {
        zone.addEventListener(evName, function (e) {
          e.preventDefault();
          e.stopPropagation();
          zone.classList.add('has-file');
        });
      });
      ['dragleave', 'drop'].forEach(function (evName) {
        zone.addEventListener(evName, function (e) {
          e.preventDefault();
          e.stopPropagation();
          zone.classList.remove('has-file');
        });
      });
      zone.addEventListener('drop', function (e) {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length) {
          processFiles(dt.files);
        }
      });
    });

    if (grid) {
      grid.addEventListener('click', function (e) {
        const removeBtn = e.target.closest('[data-remove-id]');
        if (!removeBtn) return;
        e.preventDefault();
        e.stopPropagation();
        const photoId = removeBtn.getAttribute('data-remove-id');
        const idx = photos.findIndex(function (p) { return p.id === photoId; });
        if (idx !== -1) {
          photos.splice(idx, 1);
          renderGrid();
        }
      });
    }

    return {
      getPhotos: function () { return photos; },
      getFirstPhotoName: function () {
        return photos.length > 0 ? photos[0].name : config.fallbackName;
      }
    };
  }

  // Initialize uploaders for services with photos (Solar Installation & Maintenance)
  const solarUploader = createMultiPhotoUploader({
    inputId: 'sanad-bill-input',
    boxId: 'sanad-upload-box',
    gridId: 'sanad-photos-preview-grid',
    btnId: 'sanad-add-more-btn',
    labelId: 'sanad-add-more-label',
    fallbackName: 'Sanad Statement Uploaded'
  });

  const maintUploader = createMultiPhotoUploader({
    inputId: 'maint-photo-input',
    boxId: 'maint-upload-box',
    gridId: 'maint-photos-preview-grid',
    btnId: 'maint-add-more-btn',
    labelId: 'maint-add-more-label',
    fallbackName: 'Maintenance Defect Photo'
  });

  // 3. System Type Switcher in Solar Panel
  const sysBtns = document.querySelectorAll('.sys-type-btn');
  const sysInput = document.getElementById('selected-system-type');
  sysBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      sysBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (sysInput) {
        sysInput.value = btn.getAttribute('data-type') || 'On-Grid System';
      }
    });
  });

  // 4. Dynamic Service Switcher (The First Option on the Page with 5 Services)
  // Ordering: 1. Solar, 2. Maintenance, 3. Cleaning, 4. Other Services, 5. Used Parts
  const serviceSelector = document.getElementById('service-selector');
  const mainBadgeIcon = document.getElementById('main-badge-icon');
  const mainBadgeText = document.getElementById('main-badge-text');
  const mainHeadTitle = document.getElementById('main-head-title');
  const mainHeadDesc = document.getElementById('main-head-desc');

  const panels = {
    solar: document.getElementById('service-panel-solar'),
    maintenance: document.getElementById('service-panel-maintenance'),
    cleaning: document.getElementById('service-panel-cleaning'),
    other: document.getElementById('service-panel-other'),
    used_parts: document.getElementById('service-panel-used_parts')
  };

  const serviceMeta = {
    solar: {
      icon: '#i-zap',
      badge: 'Solar Installation Service',
      titleHtml: '<span id="main-title-start">Request New </span><em class="gold-text" id="main-title-gold">Solar System</em><span id="main-title-end"> Installation</span>',
      desc: 'Fill in your information to receive competitive bids from certified solar installers in Jordan'
    },
    maintenance: {
      icon: '#i-wrench',
      badge: 'Solar Maintenance & Repair',
      titleHtml: '<span id="main-title-start">Solar System </span><em class="gold-text" id="main-title-gold">Maintenance & Repair</em><span id="main-title-end"> Request</span>',
      desc: 'Add an issue photo, specify your governorate, describe the fault, and get expert technician repairs'
    },
    cleaning: {
      icon: '#i-sun',
      badge: 'Panel Soft-Wash Service',
      titleHtml: '<span id="main-title-start">Solar Panel </span><em class="gold-text" id="main-title-gold">Soft-Wash Cleaning</em><span id="main-title-end"> Booking</span>',
      desc: 'Enter the number of boards, choose your relevant date, and book certified panel cleaning teams'
    },
    other: {
      icon: '#i-settings',
      badge: 'Other Solar Services',
      titleHtml: '<span id="main-title-start">Specialized </span><em class="gold-text" id="main-title-gold">Other Solar Solutions</em><span id="main-title-end"> & Upgrades</span>',
      desc: 'Dismantling, battery storage expansion, rewiring, energy audits, and custom engineering projects'
    },
    used_parts: {
      icon: '#i-box',
      badge: 'Used Equipment Marketplace',
      titleHtml: '<span id="main-title-start">Selling Used </span><em class="gold-text" id="main-title-gold">Parts & Equipment</em><span id="main-title-end"> Marketplace</span>',
      desc: 'Sell surplus panels, inverters or batteries with instant cash evaluation across Jordan'
    }
  };

  function activateService(serviceKey, updateUrl) {
    const key = panels[serviceKey] ? serviceKey : 'solar';

    // Update Dropdown
    if (serviceSelector) {
      serviceSelector.value = key;
    }

    // Toggle Panels
    Object.keys(panels).forEach(function (k) {
      if (panels[k]) {
        panels[k].style.display = (k === key) ? 'flex' : 'none';
      }
    });

    // Update Header
    const meta = serviceMeta[key];
    if (meta) {
      if (mainBadgeIcon) mainBadgeIcon.setAttribute('href', meta.icon);
      if (mainBadgeText) mainBadgeText.textContent = meta.badge;
      if (mainHeadTitle) mainHeadTitle.innerHTML = meta.titleHtml;
      if (mainHeadDesc) mainHeadDesc.textContent = meta.desc;
    }

    // Sync URL query without page reload
    if (updateUrl && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('service', key);
      window.history.replaceState({}, '', url.toString());
    }
  }

  // Detect query param on load (e.g. ?service=maintenance, ?service=cleaning, ?service=other)
  const urlParams = new URLSearchParams(window.location.search);
  const initialService = urlParams.get('service') || 'solar';
  activateService(initialService, false);
  // Coming from AI Fault Diagnosis: pre-fill the problem description
  const aiIssue = urlParams.get('issue');
  if (aiIssue) { const t = document.getElementById(initialService === 'cleaning' ? 'cleaning-notes' : initialService === 'other' ? 'other-desc' : 'maint-problem'); if (t && !t.value) t.value = aiIssue; }

  if (serviceSelector) {
    serviceSelector.addEventListener('change', function () {
      activateService(this.value, true);
    });
  }

  // ===== VALIDATION: every required field is checked before the request is sent =====
  const phoneCheck = function (v) { return /^07[789]\d{7}$/.test((v || '').replace(/[\s-]/g, '')) ? '' : 'Enter a valid Jordanian mobile number (07XXXXXXXX)'; };
  const needed = function (msg) { return function (v) { return (v || '').trim() ? '' : msg; }; };
  const textMin = function (msg) { return function (v) { return (v || '').trim().length >= 10 ? '' : msg; }; };
  const CHECKS = {
    solar: [['req-area', needed('Choose your governorate / area')], ['req-roof', needed('Choose the roof & property type')],
            ['solar-phone', phoneCheck], ['sanad-upload-box', function () { return solarUploader.getPhotos().length ? '' : 'Upload a photo of your electricity bill (SANAD)'; }]],
    maintenance: [['maint-area', needed('Choose your governorate / area')], ['maint-problem', textMin('Describe the fault in at least 10 characters')],
            ['maint-datetime', needed('Choose a preferred inspection date and time')], ['maint-phone', phoneCheck],
            ['maint-upload-box', function () { return maintUploader.getPhotos().length ? '' : 'Upload at least one photo of the fault'; }]],
    cleaning: [['cleaning-panels', function (v) { return parseInt(v, 10) > 0 ? '' : 'Enter the number of panels (e.g. 16)'; }],
            ['cleaning-capacity', function (v) { const n = parseInt(v, 10); return n >= 50 && n <= 1000 ? '' : 'Enter the capacity of one panel in watts (e.g. 550)'; }],
            ['cleaning-area', needed('Choose your governorate / area')], ['cleaning-phone', phoneCheck]],
    other: [['other-service-type', needed('Choose the service category')], ['other-area', needed('Choose your governorate / area')],
            ['other-desc', textMin('Describe what you need in at least 10 characters')], ['other-phone', phoneCheck]]
  };
  function clearErrors() { document.querySelectorAll('.req-error').forEach(function (n) { n.remove(); }); document.querySelectorAll('.has-error').forEach(function (n) { n.classList.remove('has-error'); }); }
  function validateService(svc) {
    clearErrors(); let first = null;
    (CHECKS[svc] || []).forEach(function (c) {
      const el = document.getElementById(c[0]); if (!el) return;
      const msg = c[1](el.value); if (!msg) return;
      el.classList.add('has-error');
      const p = document.createElement('p'); p.className = 'req-error'; p.setAttribute('role', 'alert'); p.textContent = msg;
      const anchor = el.closest('.req-select-wrap') || el; anchor.parentNode.insertBefore(p, anchor.nextSibling);
      if (!first) first = el;
    });
    if (first) { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (first.focus && first.tagName !== 'LABEL') { try { first.focus({ preventScroll: true }); } catch (e) {} } }
    return !first;
  }
  document.addEventListener('input', function (e) { if (e.target.classList && e.target.classList.contains('has-error')) { e.target.classList.remove('has-error'); const n = (e.target.closest('.req-select-wrap') || e.target).nextSibling; if (n && n.classList && n.classList.contains('req-error')) n.remove(); } });
  document.addEventListener('change', function (e) { if (e.target.type === 'file' || e.target.tagName === 'SELECT') { if (e.target.type === 'file') clearErrors(); else { e.target.classList.remove('has-error'); const n = (e.target.closest('.req-select-wrap') || e.target).nextSibling; if (n && n.classList && n.classList.contains('req-error')) n.remove(); } } });

  // 5. Unified Form Submissions & Confirmation Modal
  const reqForm = document.getElementById('request-solar-form');
  const confirmBackdrop = document.getElementById('service-confirm-backdrop');
  const scReqId = document.getElementById('sc-req-id');
  const scReqType = document.getElementById('sc-req-type');
  const scReqLoc = document.getElementById('sc-req-loc');
  const scModalTitle = document.getElementById('sc-modal-title');
  const scModalSub = document.querySelector('.service-confirm-sub');

  if (reqForm) {
    reqForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateService(serviceSelector ? serviceSelector.value : 'solar')) return;   // stop if anything is missing

      const currentService = serviceSelector ? serviceSelector.value : 'solar';
      const reqId = '#REQ-2026-' + Math.floor(1100 + Math.random() * 8800);
      let newRecord = null;
      let displayType = 'Solar Installation';
      let displayLoc = 'Amman - Abdoun';

      const clientName = (localStorage.getItem('shamstech_user_role') === 'client' ? localStorage.getItem('shamstech_user_name') : '') ||
                         localStorage.getItem('shamstech_client_name') || 'Eng. Tariq Al-Zoubi';

      if (currentService === 'solar') {
        const areaEl = document.getElementById('req-area');
        const roofEl = document.getElementById('req-roof');
        const notesEl = document.getElementById('req-notes');
        const phoneEl = document.getElementById('solar-phone');

        displayLoc = areaEl ? areaEl.value : 'Amman - Abdoun';
        const sysType = sysInput ? sysInput.value : 'On-Grid System';
        displayType = sysType;
        const roof = roofEl ? roofEl.value : 'Private Property (Flat Concrete Roof Ready)';
        const notes = notesEl && notesEl.value.trim() ? notesEl.value.trim() : 'Standard certified solar installation requested.';
        const phone = phoneEl ? phoneEl.value.trim() : '0795824190';

        newRecord = {
          id: reqId,
          title: 'New ' + sysType + ' Installation (' + displayLoc.split(' - ')[0] + ')',
          meta: 'ID: ' + reqId + ' • Location: ' + displayLoc + ' • Phone: ' + phone,
          category: 'bids',
          badgeText: '● Open for Proposals',
          icon: '#i-zap',
          metric1Label: 'SYSTEM TYPE',
          metric1Value: sysType,
          metric2Label: 'ROOF & PROPERTY',
          metric2Value: roof.split(' (')[0],
          metric3Label: 'SANAD BILL',
          metric3Value: solarUploader.getFirstPhotoName(),
          client: clientName,
          statusNote: '⚡ <strong>Status:</strong> Request broadcast to certified installers in ' + displayLoc + '. Notes: ' + notes
        };
      } else if (currentService === 'maintenance') {
        // Maintenance: image, governorate, describe problem, phone number
        const areaEl = document.getElementById('maint-area');
        const problemEl = document.getElementById('maint-problem');
        const phoneEl = document.getElementById('maint-phone');

        displayLoc = areaEl ? areaEl.value : 'Irbid - City Center';
        displayType = 'Solar Maintenance & Repair';
        const problem = problemEl && problemEl.value.trim() ? problemEl.value.trim() : 'System fault inspection and repair.';
        const phone = phoneEl ? phoneEl.value.trim() : '0795824190';

        newRecord = {
          id: reqId,
          title: 'Solar Maintenance & Repair (' + displayLoc.split(' - ')[0] + ')',
          meta: 'ID: ' + reqId + ' • Governorate: ' + displayLoc + ' • Phone: ' + phone,
          category: 'maintenance',
          badgeText: '● Inspection Scheduled',
          icon: '#i-wrench',
          metric1Label: 'ISSUE REPORTED',
          metric1Value: problem.substring(0, 26) + (problem.length > 26 ? '...' : ''),
          metric2Label: 'STATUS',
          metric2Value: 'Technician Dispatched',
          metric3Label: 'FAULT PHOTO',
          metric3Value: maintUploader.getFirstPhotoName(),
          client: clientName,
          statusNote: '🔧 <strong>Status:</strong> Maintenance dispatched to certified solar technicians in ' + displayLoc + '. Details: ' + problem
        };
      } else if (currentService === 'cleaning') {
        // Cleaning: number of boards, relevant date, phone number (no photo, no time)
        const panelsEl = document.getElementById('cleaning-panels');
        const dateEl = document.getElementById('cleaning-date');
        const phoneEl = document.getElementById('cleaning-phone');
        const areaEl = document.getElementById('cleaning-area');
        const notesEl = document.getElementById('cleaning-notes');

        const boardCount = panelsEl && panelsEl.value.trim() ? panelsEl.value.trim() : '12 Panels';
        const cleaningDate = dateEl && dateEl.value ? dateEl.value : 'Preferred Date';
        const phone = phoneEl ? phoneEl.value.trim() : '0795824190';
        displayLoc = areaEl ? areaEl.value : 'Amman - Abdoun';
        displayType = 'Panel Soft-Wash Cleaning (' + boardCount + ')';
        const notes = notesEl && notesEl.value.trim() ? notesEl.value.trim() : 'Soft-wash deionised cleaning requested.';

        newRecord = {
          id: reqId,
          title: 'Panel Soft-Wash Cleaning - ' + boardCount,
          meta: 'ID: ' + reqId + ' • Location: ' + displayLoc + ' • Phone: ' + phone,
          category: 'cleaning',
          badgeText: '● Cleaning Scheduled',
          icon: '#i-sun',
          metric1Label: 'BOARD COUNT',
          metric1Value: boardCount,
          metric2Label: 'RELEVANT DATE',
          metric2Value: cleaningDate,
          metric3Label: 'SERVICE',
          metric3Value: 'Soft-Wash Cleaning',
          client: clientName,
          statusNote: '✨ <strong>Status:</strong> Soft-wash cleaning team confirmed for ' + cleaningDate + ' in ' + displayLoc + '. Notes: ' + notes
        };
      } else if (currentService === 'other') {
        // Other Services: category, governorate, description, phone number (no photo, no time)
        const typeEl = document.getElementById('other-service-type');
        const areaEl = document.getElementById('other-area');
        const descEl = document.getElementById('other-desc');
        const phoneEl = document.getElementById('other-phone');

        const cat = typeEl ? typeEl.value : 'System Dismantling & Safe Relocation';
        displayLoc = areaEl ? areaEl.value : 'Amman - Abdoun';
        displayType = cat.split(' (')[0];
        const desc = descEl && descEl.value.trim() ? descEl.value.trim() : 'Specialized solar engineering request.';
        const phone = phoneEl ? phoneEl.value.trim() : '0795824190';

        newRecord = {
          id: reqId,
          title: displayType + ' (' + displayLoc.split(' - ')[0] + ')',
          meta: 'ID: ' + reqId + ' • Category: ' + displayType + ' • Phone: ' + phone,
          category: 'other',
          badgeText: '● Open for Bids',
          icon: '#i-settings',
          metric1Label: 'SERVICE TYPE',
          metric1Value: displayType,
          metric2Label: 'LOCATION',
          metric2Value: displayLoc.split(' - ')[0],
          metric3Label: 'STATUS',
          metric3Value: 'Under Engineering Review',
          client: clientName,
          statusNote: '⚙️ <strong>Status:</strong> Custom service inquiry broadcast to verified solar engineering providers in ' + displayLoc + '. Specs: ' + desc
        };
      } else if (currentService === 'used_parts') {
        window.location.href = '/html/used_market.html';
        return;
      }

      if (newRecord) {
        // ---- LOGICAL CARD INFO: only what the client filled in the form (+ full details for companies)
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        const v = function (id) { const el = document.getElementById(id); return el && el.value ? el.value.trim() : ''; };
        const cut = function (s, n) { return s.length > n ? s.substring(0, n) + '...' : s; };
        const when = function (s) { const d = new Date(s); return s && !isNaN(d) && s.indexOf('T') !== -1 ? d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : s; };
        let service = 'other', det = [], m = [], phone = '';
        if (currentService === 'solar') {
          service = 'install'; phone = v('solar-phone');
          det = [['System type', sysInput ? sysInput.value : ''], ['Location', v('req-area')], ['Roof & property', v('req-roof')], ['Contact phone', phone], ['Notes', v('req-notes')], ['Attached photos', solarUploader.getPhotos().length ? solarUploader.getPhotos().length + ' file(s)' : '']];
          m = [['SYSTEM TYPE', sysInput ? sysInput.value : 'On-Grid System'], ['ROOF & PROPERTY', v('req-roof').split(' (')[0] || 'Not specified'], ['CONTACT PHONE', phone || '-']];
        } else if (currentService === 'maintenance') {
          service = 'repair'; phone = v('maint-phone');
          det = [['Location', v('maint-area')], ['Fault description', v('maint-problem')], ['Preferred inspection', when(v('maint-datetime'))], ['Contact phone', phone], ['Fault photos', maintUploader.getPhotos().length ? maintUploader.getPhotos().length + ' file(s)' : '']];
          m = [['ISSUE REPORTED', cut(v('maint-problem') || 'Fault inspection', 40)], ['PREFERRED VISIT', when(v('maint-datetime')) || 'Flexible'], ['CONTACT PHONE', phone || '-']];
        } else if (currentService === 'cleaning') {
          service = 'clean'; phone = v('cleaning-phone');
          const cap = parseInt(v('cleaning-capacity'), 10) || 0, cnt = parseInt(v('cleaning-panels'), 10) || 0;
          det = [['Number of panels', v('cleaning-panels')], ['Panel capacity', cap ? cap + ' W per panel' : ''], ['Total system size', cap && cnt ? (cap * cnt / 1000).toFixed(1) + ' kWp' : ''], ['Location', v('cleaning-area')], ['Contact phone', phone], ['Notes', v('cleaning-notes')]];
          m = [['NUMBER OF PANELS', v('cleaning-panels') || '-'], ['PANEL CAPACITY', cap ? cap + ' W' : '-'], ['CONTACT PHONE', phone || '-']];
        } else if (currentService === 'other') {
          service = 'other'; phone = v('other-phone');
          det = [['Service category', v('other-service-type')], ['Location', v('other-area')], ['Description', v('other-desc')], ['Contact phone', phone]];
          m = [['SERVICE TYPE', displayType], ['DESCRIPTION', cut(v('other-desc') || '-', 40)], ['CONTACT PHONE', phone || '-']];
        }
        newRecord.service = service; newRecord.createdAt = new Date().toISOString(); newRecord.dateLabel = today;
        newRecord.location = displayLoc; newRecord.phone = phone;
        const LABELS = { 'Contact phone': 'Contact & WhatsApp', 'Notes': 'Notes & special requirements', 'Location': 'Governorate & residential area', 'Roof & property': 'Property ownership & roof status' };
        newRecord.details = det.filter(function (d) { return d[1]; }).map(function (d) { return [LABELS[d[0]] || d[0], d[1]]; });
        const up = service === 'install' ? solarUploader : service === 'repair' ? maintUploader : null;   // photos the client attached (kept small)
        newRecord.photos = up ? up.getPhotos().map(function (p) { return { name: p.name, url: p.url }; }) : [];
        newRecord.meta = 'ID: ' + reqId + ' • Location: ' + displayLoc + ' • Submitted: ' + today;
        newRecord.badgeText = '● Open for Proposals'; newRecord.statusNote = '';
        newRecord.metric1Label = m[0][0]; newRecord.metric1Value = m[0][1];
        newRecord.metric2Label = m[1][0]; newRecord.metric2Value = m[1][1];
        newRecord.metric3Label = m[2][0]; newRecord.metric3Value = m[2][1];
        try {
          const raw = localStorage.getItem('shamstech_user_requests');
          const list = raw ? JSON.parse(raw) : [];
          list.unshift(newRecord);
          try { localStorage.setItem('shamstech_user_requests', JSON.stringify(list)); }
          catch (qe) { newRecord.photos = []; localStorage.setItem('shamstech_user_requests', JSON.stringify(list)); }   // storage full: save without photos
        } catch (err) {}
      }

      if (scReqId) scReqId.textContent = reqId;
      if (scReqType) scReqType.textContent = displayType;
      if (scReqLoc) scReqLoc.textContent = displayLoc;
      if (scModalTitle) scModalTitle.textContent = 'Service Request Confirmed!';
      if (scModalSub) {
        scModalSub.textContent = 'Your ' + displayType + ' request has been submitted and registered successfully.';
      }

      if (confirmBackdrop) {
        confirmBackdrop.classList.add('open');
        confirmBackdrop.setAttribute('aria-hidden', 'false');
      }
    });
  }
});
