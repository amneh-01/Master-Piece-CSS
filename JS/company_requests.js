/* =====================================================
   SHAMSTECH JO - OPEN REQUESTS & TENDERS MARKET JS (js/company_requests.js)
   Explanation of what was done in this file:
   1. Route Guard: Ensures only authenticated Solar Companies
      can access the market.
   2. Tab Switching between:
      - 🏢 Institutional & Major Project Tenders (Image 2: comp-requ1 2)
      - 👤 Individual & Residential Requests (Image 2: copm-req 0 1)
   3. Dynamically reflects newly submitted client requests from
      'shamstech_user_requests' in the Individual tab with live
      counters and specifications.
   4. Search, Category filtering (All | Solar Systems | Maintenance),
      and City filtering (Amman | Irbid | Zarqa | Mafraq | Aqaba).
   5. Interactive Price Quotation Modal for bidding on any tender.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Route Guard Verification
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
  const toastEl = document.getElementById('market-toast');
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.style.display = 'block';
    setTimeout(function () {
      toastEl.style.display = 'none';
    }, 4000);
  }

  // 3. Static Institutional Tenders Data (Image 2: comp-requ1 2)
  const INSTITUTIONAL_TENDERS = [
    {
      id: 'TND-2026-0101',
      title: 'Supply & Installation Tender of 100 kWp Solar Power System for Specialty Hospital',
      tag: 'Solar Installation',
      tagClass: 'solar-installation',
      location: 'Irbid - Specialty Hospital Street',
      city: 'Irbid',
      cat: 'solar',
      spec1: 'Commercial Rooftop',
      spec1Label: 'Scope',
      spec2: 'Solar Installation',
      spec2Label: 'Service Type',
      spec3: '10-Year Comprehensive',
      spec3Label: 'Warranty',
      deadline: '3 Days Remaining (Oct 15)',
      submitted: '3 certified companies',
      client: 'Specialty Hospital Mgmt',
      tenderUrl: 'https://www.moh.gov.jo/',
      suggestedPrice: '68,500 JOD',
      btnText: 'Submit Proposal / Quote'
    },
    {
      id: 'TND-2026-0199',
      title: 'Lightweight Mounting Solar Project for Yarmouk University Campus (120 kW)',
      tag: 'Solar Installation',
      tagClass: 'solar-installation',
      location: 'Irbid - University District',
      city: 'Irbid',
      cat: 'solar',
      spec1: 'Educational Buildings',
      spec1Label: 'Scope',
      spec2: 'Solar Installation',
      spec2Label: 'Service Type',
      spec3: '45 Business Days',
      spec3Label: 'Target Completion',
      deadline: '4 Days Remaining (Oct 16)',
      submitted: '2 certified companies',
      client: 'Yarmouk University Campus',
      tenderUrl: 'https://www.yu.edu.jo/',
      suggestedPrice: '82,000 JOD',
      btnText: 'Submit Proposal / Quote'
    },
    {
      id: 'TND-2026-0312',
      title: 'Construction of 80 kWp Solar Steam Plant for Jordan Plastics Factory',
      tag: 'Solar Installation',
      tagClass: 'solar-installation',
      location: 'Zarqa - Industrial Zone',
      city: 'Zarqa',
      cat: 'solar',
      spec1: 'Heavy Industrial Rooftop',
      spec1Label: 'Scope',
      spec2: 'Solar Installation',
      spec2Label: 'Service Type',
      spec3: 'Steam Offset & Licensing',
      spec3Label: 'Output',
      deadline: '6 Days Remaining (Oct 18)',
      submitted: '4 certified companies',
      client: 'Jordan Plastics Factory Co.',
      tenderUrl: 'https://mit.gov.jo/',
      suggestedPrice: '54,000 JOD',
      btnText: 'Submit Proposal / Quote'
    },
    {
      id: 'TND-2026-0440',
      title: 'Queen Rania Hospital Solar PV & Hybrid Storage System (50 kW)',
      tag: 'Solar Installation',
      tagClass: 'solar-installation',
      location: 'Amman - Queen Rania St.',
      city: 'Amman',
      cat: 'solar',
      spec1: 'Healthcare Critical Power',
      spec1Label: 'Scope',
      spec2: 'Solar Installation',
      spec2Label: 'Service Type',
      spec3: 'Hospital Emergency Backup',
      spec3Label: 'Target',
      deadline: '5 Days Remaining',
      submitted: '3 certified companies',
      client: 'Queen Rania Hospital Administration',
      tenderUrl: 'https://www.moh.gov.jo/',
      suggestedPrice: '42,000 JOD',
      btnText: 'Submit Proposal / Quote'
    },
    {
      id: 'TND-2026-0515',
      title: 'Al-Baraka Agricultural Solar Pumping Station 35 kWp',
      tag: 'Solar Installation',
      tagClass: 'solar-installation',
      location: 'Mafraq - Agricultural Sector',
      city: 'Mafraq',
      cat: 'solar',
      spec1: 'Ground-Mount Field Array',
      spec1Label: 'Scope',
      spec2: 'Solar Installation',
      spec2Label: 'Service Type',
      spec3: '3-Year Operation & Maint',
      spec3Label: 'Warranty',
      deadline: '7 Days Remaining',
      submitted: '2 certified companies',
      client: 'Al-Baraka Farm Holdings',
      tenderUrl: 'https://www.jo-pacc.com/',
      suggestedPrice: '26,500 JOD',
      btnText: 'Submit Proposal / Quote'
    },
    {
      id: 'TND-2026-0680',
      title: 'Preventive Deionized Cleaning & Thermal Diagnostic (180 Panels)',
      tag: 'Maintenance & Wash',
      tagClass: 'maint-wash',
      location: 'Irbid - King Abdullah Hospital Area',
      city: 'Irbid',
      cat: 'wash-maintenance',
      spec1: 'Deionized Pure Water Washing',
      spec1Label: 'Scope',
      spec2: 'Maintenance & Wash',
      spec2Label: 'Service Type',
      spec3: 'Certified Solar Technician Team',
      spec3Label: 'Requirement',
      deadline: '2 Days Remaining',
      submitted: '5 certified companies',
      client: 'Commercial Medical Center',
      tenderUrl: 'https://www.moh.gov.jo/',
      suggestedPrice: '850 JOD',
      btnText: 'Submit Proposal / Quote'
    },
    {
      id: 'TND-2026-0790',
      title: 'Annual Inverter & Electrical Maintenance Contract (250 kW)',
      tag: 'Maintenance',
      tagClass: 'maintenance-only',
      location: 'Amman - Sahab Industrial City',
      city: 'Amman',
      cat: 'maintenance',
      spec1: 'Preventive Inverter Inspection',
      spec1Label: 'Scope',
      spec2: 'Maintenance',
      spec2Label: 'Service Type',
      spec3: '12 Months SLA Coverage',
      spec3Label: 'Contract',
      deadline: '4 Days Remaining',
      submitted: '3 certified companies',
      client: 'Amman Industrial Association',
      tenderUrl: 'https://mit.gov.jo/',
      suggestedPrice: '4,200 JOD',
      btnText: 'Submit Proposal / Quote'
    },
    {
      id: 'TND-2026-0850',
      title: 'Bi-Monthly Solar Panels Pure Deionized Wash (400 Panels)',
      tag: 'Wash',
      tagClass: 'wash-only',
      location: 'Irbid - Irbid Development Area',
      city: 'Irbid',
      cat: 'wash',
      spec1: '400 High-Output Panels',
      spec1Label: 'Scope',
      spec2: 'Wash',
      spec2Label: 'Service Type',
      spec3: 'Automated Deionized Pressure Wash',
      spec3Label: 'Method',
      deadline: '3 Days Remaining',
      submitted: '2 certified companies',
      client: 'Al-Isra Education Campus',
      tenderUrl: 'https://www.isra.edu.jo/',
      suggestedPrice: '1,800 JOD',
      btnText: 'Submit Proposal / Quote'
    }
  ];

  // 4. Default Individual & Residential Requests Data (Image 2: copm-req 0 1)
  const DEFAULT_INDIVIDUAL_REQUESTS = [
    {
      id: 'REQ-2026-0019',
      title: 'Supply & Installation of 6.5 kW Residential Solar System',
      tag: 'Solar Installation',
      tagClass: 'solar-installation',
      location: 'Irbid - Al-Huson Highway',
      city: 'Irbid',
      cat: 'solar',
      spec1: '6.5 kW Peak Capacity',
      spec1Label: 'System',
      spec2: 'Solar Installation',
      spec2Label: 'Service Type',
      spec3: 'Villa (140 m² Flat Roof)',
      spec3Label: 'Property',
      deadline: '18 Hours Remaining',
      submitted: '4 Price Quotations',
      client: 'Eng. Tariq Al-Zoubi',
      suggestedPrice: '3,650 JOD',
      btnText: 'Submit Offer & Apply'
    },
    {
      id: 'REQ-2026-0418',
      title: 'Solar Panels Cleaning & Inverter Health Check (24 Panels)',
      tag: 'Maintenance & Wash',
      tagClass: 'maint-wash',
      location: 'Amman - Abdoun',
      city: 'Amman',
      cat: 'wash-maintenance',
      spec1: 'Soft Wash + Inspection',
      spec1Label: 'Scope',
      spec2: 'Maintenance & Wash',
      spec2Label: 'Service Type',
      spec3: 'Within 24-48 Hours',
      spec3Label: 'Urgent',
      deadline: '2 Days Remaining',
      submitted: '2 Companies',
      client: 'Dr. Khaled Al-Momani',
      suggestedPrice: '90 JOD',
      btnText: 'View Request & Quote'
    },
    {
      id: 'REQ-2026-0614',
      title: 'Agricultural Solar Power System 18 kW with Energy Storage',
      tag: 'Solar Installation',
      tagClass: 'solar-installation',
      location: 'Mafraq - Al-Khabab Farm',
      city: 'Mafraq',
      cat: 'solar',
      spec1: '18 kW Peak Capacity',
      spec1Label: 'System',
      spec2: 'Solar Installation',
      spec2Label: 'Service Type',
      spec3: 'Agricultural Submersible Pump',
      spec3Label: 'Purpose',
      deadline: '5 Days Remaining',
      submitted: '1 Contractor',
      client: 'Abu Omar Al-Mashaqbeh',
      suggestedPrice: '14,800 JOD',
      btnText: 'Submit Official Proposal'
    },
    {
      id: 'REQ-2026-0775',
      title: 'Inverter Maintenance & Thermal Hotspot Repair',
      tag: 'Maintenance',
      tagClass: 'maintenance-only',
      location: 'Amman - Dabouq',
      city: 'Amman',
      cat: 'maintenance',
      spec1: 'Thermal Hotspot Repair',
      spec1Label: 'Scope',
      spec2: 'Maintenance',
      spec2Label: 'Service Type',
      spec3: 'Immediate Site Visit',
      spec3Label: 'Schedule',
      deadline: '1 Day Remaining',
      submitted: '3 Offers',
      client: 'Mansour Ali Al-Kofahi',
      suggestedPrice: '120 JOD',
      btnText: 'Submit Offer & Apply'
    },
    {
      id: 'REQ-2026-0889',
      title: 'Supply & Installation of 10 kW 3-Phase Solar System (Residential)',
      tag: 'Solar Installation',
      tagClass: 'solar-installation',
      location: 'Zarqa - New Zarqa',
      city: 'Zarqa',
      cat: 'solar',
      spec1: '10 kWp 3-Phase Net-Metering',
      spec1Label: 'System',
      spec2: 'Solar Installation',
      spec2Label: 'Service Type',
      spec3: 'Private House (Tile Roof)',
      spec3Label: 'Property',
      deadline: '3 Days Remaining',
      submitted: '2 Offers',
      client: 'Abu Hani Al-Tamimi',
      suggestedPrice: '5,600 JOD',
      btnText: 'Submit Offer & Apply'
    },
    {
      id: 'REQ-2026-0940',
      title: 'Quarterly Routine Deionized Wash & Panel Dust Cleaning (36 Panels)',
      tag: 'Wash',
      tagClass: 'wash-only',
      location: 'Aqaba - Fifth Area',
      city: 'Aqaba',
      cat: 'wash',
      spec1: '36x High-Wattage Panels',
      spec1Label: 'Panels',
      spec2: 'Wash',
      spec2Label: 'Service Type',
      spec3: 'Salt Mist & Dust Removal',
      spec3Label: 'Focus',
      deadline: '4 Days Remaining',
      submitted: '1 Company',
      client: 'Coastal Residence Mgmt',
      suggestedPrice: '140 JOD',
      btnText: 'View Request & Quote'
    }
  ];

  // 5. Build dynamic Individual Requests list including user-submitted requests from localStorage
  /* SERVICE COLORS (same as the client pages): green installation, orange maintenance, blue cleaning, yellow other */
  const SVC = {
    install: { label: 'Installation', color: '#16a34a', icon: '#i-zap' },
    repair: { label: 'Maintenance', color: '#ea580c', icon: '#i-wrench' },
    clean: { label: 'Cleaning', color: '#2563eb', icon: '#i-sun' },
    other: { label: 'Other Services', color: '#ca8a04', icon: '#i-settings' }
  };
  function svcFromText(t, icon) {
    t = (t || '').toLowerCase(); icon = icon || '';
    if (/i-settings/.test(icon)) return 'other';
    if (/clean|wash/.test(t)) return 'clean';
    if (/repair|maint|fault|diagnos|inverter/.test(t) || /i-wrench|i-cpu/.test(icon)) return 'repair';
    if (/i-zap/.test(icon) || /install|system|on-grid|off-grid|hybrid|solar/.test(t)) return 'install';
    return 'other';
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function getIndividualRequestsList() {
    let userReqs = [];
    try {
      const raw = localStorage.getItem('shamstech_user_requests');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) userReqs = parsed;
      }
    } catch (e) {}

    const mappedUserReqs = userReqs.map(function (r) {
      const titleLower = ((r.title || '') + ' ' + (r.category || '')).toLowerCase();
      const svc = r.service || svcFromText((r.title || '') + ' ' + (r.metric1Value || ''), r.icon);
      const isWash = svc === 'clean' || titleLower.indexOf('wash') !== -1 || titleLower.indexOf('clean') !== -1;
      const isMaint = svc === 'repair' || (r.id && r.id.indexOf('MNT') !== -1) || (r.id && r.id.indexOf('AI') !== -1) || titleLower.indexOf('maint') !== -1 || titleLower.indexOf('repair') !== -1;

      let tag = 'Solar Installation';
      let tagClass = 'solar-installation';
      let cat = 'solar';

      if (isWash && isMaint) {
        tag = 'Maintenance & Wash';
        tagClass = 'maint-wash';
        cat = 'wash-maintenance';
      } else if (isWash) {
        tag = 'Wash';
        tagClass = 'wash-only';
        cat = 'wash';
      } else if (isMaint) {
        tag = 'Maintenance';
        tagClass = 'maintenance-only';
        cat = 'maintenance';
      }

      const lbl = function (s) { s = (s || 'Detail').toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); };
      // Extract city if present in meta or metric
      let city = 'Amman';
      const textToSearch = (r.meta || '') + ' ' + (r.metric3Value || '') + ' ' + (r.title || '');
      ['Irbid', 'Zarqa', 'Mafraq', 'Aqaba', 'Amman'].forEach(function (c) {
        if (textToSearch.indexOf(c) !== -1) city = c;
      });

      return {
        id: (r.id || 'REQ-2026-USER').replace('#', ''),
        title: r.title || 'Client Solar Service Request',
        tag: tag,
        tagClass: tagClass,
        location: r.location || (city + ' Governorate'),
        city: city,
        cat: cat,
        svc: svc,
        details: r.details || [],
        photos: Array.isArray(r.photos) ? r.photos.filter(function (p) { return p && p.url; }) : [],
        spec1: r.metric1Value || '-',
        spec1Label: lbl(r.metric1Label),
        spec2: r.metric2Value || '-',
        spec2Label: lbl(r.metric2Label),
        spec3: r.metric3Value || '-',
        spec3Label: lbl(r.metric3Label),
        deadlineLabel: 'Submitted',
        deadline: r.dateLabel || 'Today',
        submitted: 'Open for offers',
        client: r.client || r.clientName || 'Verified Homeowner',
        suggestedPrice: (isWash || isMaint) ? '95 JOD' : '3,450 JOD',
        btnText: 'Submit Offer & Apply'
      };
    });

    DEFAULT_INDIVIDUAL_REQUESTS.forEach(function (d) {
      d.svc = d.svc || svcFromText(d.title + ' ' + d.tag);
      d.details = d.details || [[d.spec1Label, d.spec1], [d.spec2Label, d.spec2], [d.spec3Label, d.spec3], ['Location', d.location], ['Client', d.client]];
    });
    return mappedUserReqs.concat(DEFAULT_INDIVIDUAL_REQUESTS);
  }

  // 6. Tab & Filter State
  let currentTab = 'institutional'; // 'institutional' | 'individual'
  let currentCat = 'all'; // 'all' | 'solar' | 'wash-maintenance' | 'maintenance' | 'wash'
  let currentCity = 'all'; // 'all' | 'Amman' | ...
  let currentSearch = '';

  // Check URL params for pre-selecting tab
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tab') === 'individual') {
    currentTab = 'individual';
  }

  const tabBtnInst = document.getElementById('tab-btn-institutional');
  const tabBtnIndiv = document.getElementById('tab-btn-individual');
  const countInstEl = document.getElementById('count-institutional');
  const countIndivEl = document.getElementById('count-individual');
  const cardsContainer = document.getElementById('market-cards-container');
  const searchInput = document.getElementById('market-search-input');
  const catPillBtns = document.querySelectorAll('.cat-pill-btn');
  const citySelect = document.getElementById('market-city-select');

  function updateTabCounters() {
    const indivList = getIndividualRequestsList();
    if (countInstEl) countInstEl.textContent = INSTITUTIONAL_TENDERS.length + ' Tenders';
    if (countIndivEl) countIndivEl.textContent = indivList.length + ' Requests';
  }

  function renderMarketCards() {
    if (!cardsContainer) return;
    updateTabCounters();

    const sourceList = currentTab === 'institutional'
      ? INSTITUTIONAL_TENDERS
      : getIndividualRequestsList();

    const filtered = sourceList.filter(function (item) {
      // The service filters match the same four service types in both tabs.
      if (currentCat !== 'all') {
        const matchesService = {
          solar: currentTab === 'individual' ? item.svc === 'install' : (item.cat === 'solar' || item.tag === 'Solar Installation'),
          maintenance: currentTab === 'individual' ? item.svc === 'repair' : (item.cat === 'maintenance' || item.tag === 'Maintenance' || item.tag === 'Maintenance & Wash'),
          cleaning: currentTab === 'individual' ? item.svc === 'clean' : (item.cat === 'wash' || item.cat === 'wash-maintenance' || item.tag === 'Wash' || item.tag === 'Maintenance & Wash'),
          other: currentTab === 'individual' ? item.svc === 'other' : (item.cat === 'other' || item.tag === 'Other Services')
        }[currentCat];
        if (!matchesService) return false;
      }

      // City filter
      if (currentCity !== 'all' && item.city !== currentCity) return false;

      // Search keyword filter
      if (currentSearch.trim()) {
        const q = currentSearch.toLowerCase().trim();
        const fullText = (item.title + ' ' + item.location + ' ' + item.id + ' ' + item.tag + ' ' + item.spec1 + ' ' + item.spec2 + ' ' + item.spec3).toLowerCase();
        if (fullText.indexOf(q) === -1) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      cardsContainer.innerHTML =
        '<div style="text-align:center;padding:3.5rem 1.5rem;background:var(--cream-2);border-radius:1.75rem;border:1px dashed rgba(22,33,27,0.2);color:rgba(22,33,27,0.65);">' +
          '<h3 class="display" style="font-size:1.25rem;color:var(--forest);margin-bottom:0.4rem;">No matching tenders or requests found</h3>' +
          '<p style="font-size:14px;">Try adjusting your keyword, category, or selected city.</p>' +
        '</div>';
      return;
    }

    cardsContainer.innerHTML = filtered.map(function (item) {
      if (currentTab === 'institutional') {
        var tenderService = item.cat === 'solar' ? 'install' : (item.cat === 'wash' ? 'clean' : 'repair');
        var tenderServiceStyle = SVC[tenderService];
        return '<article class="market-item-card tender-compact-card svc-card" data-svc="' + tenderService + '" style="--svc:' + tenderServiceStyle.color + '">' +
          '<div class="market-card-top-row"><div class="card-badges-left"><span class="svc-ico"><svg class="icon"><use href="' + tenderServiceStyle.icon + '"/></svg></span><span class="svc-chip">' + tenderServiceStyle.label + '</span><span class="card-no-label">ID: ' + item.id + '</span></div></div>' +
          '<h2 class="market-item-title display">' + item.title + '</h2>' +
          '<div class="card-specs-row"><div class="spec-chip">Request type: <strong>' + item.tag + '</strong></div><div class="spec-chip">Governorate: <strong>' + item.city + '</strong></div><div class="spec-chip">Issuing organization: <strong>' + item.client + '</strong></div></div>' +
          '<div class="market-card-footer"><span class="meta-stat-item deadline"><svg class="icon"><use href="#i-clock"/></svg><span>Closes in: ' + item.deadline + '</span></span>' +
          '<a class="btn-submit-green display tender-link" href="' + item.tenderUrl + '" target="_blank" rel="noopener noreferrer">Visit tender website <svg class="icon"><use href="#i-arrow-up-right"/></svg></a></div></article>';
      }
      return (
        '<article class="market-item-card' + (item.svc && currentTab === 'individual' ? ' svc-card' : '') + '"' + (item.svc && currentTab === 'individual' ? ' data-svc="' + item.svc + '" style="--svc:' + SVC[item.svc].color + '"' : '') + '>' +
          '<div class="market-card-top-row">' +
            '<div class="card-badges-left">' +
              (item.svc && currentTab === 'individual'
                ? '<span class="svc-ico"><svg class="icon"><use href="' + SVC[item.svc].icon + '"/></svg></span><span class="svc-chip">' + SVC[item.svc].label + '</span>'
                : '<span class="card-type-tag ' + item.tagClass + '">' + item.tag + '</span>') +
              '<span class="card-no-label display">ID: ' + item.id + '</span>' +
            '</div>' +
            '<div class="card-loc-right">' +
              '<svg class="icon"><use href="#i-map-pin"/></svg>' +
              '<span>' + item.location + '</span>' +
            '</div>' +
          '</div>' +

          '<h2 class="market-item-title display">' + item.title + '</h2>' +

          '<div class="card-specs-row">' +
            '<div class="spec-chip"><span>' + item.spec1Label + ':</span> <strong>' + item.spec1 + '</strong></div>' +
            '<div class="spec-chip"><span>' + item.spec2Label + ':</span> <strong>' + item.spec2 + '</strong></div>' +
            '<div class="spec-chip"><span>' + item.spec3Label + ':</span> <strong>' + item.spec3 + '</strong></div>' +
          '</div>' +

          (currentTab === 'individual' && item.photos && item.photos.length
            ? '<div class="req-photos" aria-label="Customer attached photos">' + item.photos.map(function (p) { return '<img src="' + esc(p.url) + '" alt="' + esc(p.name || 'Customer attachment') + '" loading="lazy">'; }).join('') + '</div>'
            : '') +
          (item.svc && currentTab === 'individual' && item.details && item.details.length
            ? '<div class="req-detail-grid">' + item.details.map(function (d) { return '<div><span>' + esc(d[0]) + '</span><strong>' + esc(d[1]) + '</strong></div>'; }).join('') + '</div>'
            : '') +

          '<div class="market-card-footer">' +
            '<div class="footer-meta-stats">' +
              '<span class="meta-stat-item deadline">' +
                '<svg class="icon"><use href="#i-clock"/></svg>' +
                '<span>' + (item.deadlineLabel || 'Deadline') + ': ' + item.deadline + '</span>' +
              '</span>' +
              '<span class="meta-stat-item competitors">' +
                '<svg class="icon"><use href="#i-users"/></svg>' +
                '<span>' + item.submitted + '</span>' +
              '</span>' +
            '</div>' +

            '<div>' +
              '<button type="button" class="btn-submit-green display" data-open-market-modal="' + item.id + '" data-title="' + encodeURIComponent(item.title) + '" data-client="' + encodeURIComponent(item.client) + '" data-suggested="' + encodeURIComponent(item.suggestedPrice) + '">' +
                '<span class="btn-label"><span>' + item.btnText + '</span><span aria-hidden="true">' + item.btnText + '</span></span>' +
                '<svg class="icon"><use href="#i-arrow-up-right"/></svg>' +
              '</button>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  // Switcher Tab Buttons Events
  if (tabBtnInst && tabBtnIndiv) {
    tabBtnInst.addEventListener('click', function () {
      currentTab = 'institutional';
      tabBtnInst.classList.add('active');
      tabBtnIndiv.classList.remove('active');
      renderMarketCards();
    });

    tabBtnIndiv.addEventListener('click', function () {
      currentTab = 'individual';
      tabBtnIndiv.classList.add('active');
      tabBtnInst.classList.remove('active');
      renderMarketCards();
    });

    // Set initial active tab
    if (currentTab === 'individual') {
      tabBtnIndiv.classList.add('active');
      tabBtnInst.classList.remove('active');
    } else {
      tabBtnInst.classList.add('active');
      tabBtnIndiv.classList.remove('active');
    }
  }

  // Search Input Event
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      currentSearch = searchInput.value;
      renderMarketCards();
    });
  }

  // Category Pills Event
  catPillBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      catPillBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentCat = btn.getAttribute('data-cat') || 'all';
      renderMarketCards();
    });
  });

  // City Select Event
  if (citySelect) {
    citySelect.addEventListener('change', function () {
      currentCity = citySelect.value;
      renderMarketCards();
    });
  }

  // Initial Render
  renderMarketCards();

  // 7. Interactive Quotation Modal
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

  let activeRecordId = '';
  let activeRecordTitle = '';
  let activeRecordClient = '';

  function openModal(id, title, client, suggested) {
    activeRecordId = id;
    activeRecordTitle = decodeURIComponent(title);
    activeRecordClient = decodeURIComponent(client || 'Verified Client');

    if (modalBadge) modalBadge.textContent = 'OFFICIAL BID SUBMISSION';
    if (modalTitle) modalTitle.textContent = 'Submit Technical & Financial Offer';
    if (modalSub) modalSub.textContent = activeRecordTitle + ' (ID: ' + activeRecordId + ') • Client: ' + activeRecordClient;

    if (priceInput) priceInput.value = decodeURIComponent(suggested || '3,450 JOD');
    if (timelineInput) timelineInput.value = '20 Business Days';
    if (scopeInput) scopeInput.value = 'Turnkey engineering, Tier-1 solar equipment, and full workmanship warranty.';

    if (modalBackdrop) {
      modalBackdrop.classList.add('open');
      modalBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // Navigate to Submit Proposal Page (Image 1) on click
  if (cardsContainer) {
    cardsContainer.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-open-market-modal]');
      if (!btn) return;
      const targetId = (btn.getAttribute('data-open-market-modal') || 'REQ-2026-0814').replace('#', '');
      window.location.href = '/html/company_submit_proposal.html?id=' + encodeURIComponent(targetId);
    });
  }

  if (modalForm) {
    modalForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const rawPrice = priceInput ? priceInput.value.trim() : '3,450 JOD';
      const formattedPrice = rawPrice.toUpperCase().indexOf('JOD') !== -1 ? rawPrice : (rawPrice + ' JOD');
      const timeline = timelineInput ? timelineInput.value.trim() : '20 Business Days';
      const scope = scopeInput ? scopeInput.value.trim() : 'Full turnkey solar package.';

      try {
        let bids = [];
        const raw = localStorage.getItem('shamstech_company_bids');
        if (raw) bids = JSON.parse(raw);
        if (!Array.isArray(bids)) bids = [];
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
        localStorage.setItem('shamstech_company_bids', JSON.stringify(bids));
      } catch (err) {}

      closeModal();
      showToast('✓ Official proposal (' + formattedPrice + ') successfully submitted for "' + activeRecordTitle + '"!');
    });
  }
});
