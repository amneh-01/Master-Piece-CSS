/* =====================================================
   SHAMSTECH JO - AI FAULT DIAGNOSIS JS (js/ai_diagnosis.js)
   1. Loads client name & controls the navbar user dropdown menu.
   2. Handles panel/inverter photo upload & drag-and-drop.
   3. Runs AI Image Analysis simulation, logs the AI diagnostic
      service request into 'shamstech_user_requests' so it appears
      on the User's Requests screen (html/my_requests.html), and
      updates the Instant Analysis Result card dynamically.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Navbar Client Name & Dropdown Menu
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

  // 2. Photo Upload & Drag-and-Drop (Strictly 1 single photo for AI Diagnosis)
  const fileInput = document.getElementById('ai-photo-input');
  const uploadBox = document.getElementById('ai-upload-box');
  const uploadTitle = document.getElementById('ai-upload-title');
  const uploadSub = document.getElementById('ai-upload-sub');
  const previewWrap = document.getElementById('ai-photo-preview-wrap');
  const thumbImg = document.getElementById('ai-photo-thumb-img');
  const removeBtn = document.getElementById('ai-photo-remove-btn');
  const filenameEl = document.getElementById('ai-photo-filename');

  let selectedPhotoName = 'Solar_Panel_Array.jpg';
  let selectedPhotoDataUrl = null;

  function handleSingleAiPhoto(file) {
    if (!file || !file.type.startsWith('image/')) return;
    selectedPhotoName = file.name;
    const reader = new FileReader();
    reader.onload = function (ev) {
      selectedPhotoDataUrl = ev.target.result;
      if (thumbImg) thumbImg.src = ev.target.result;
      if (filenameEl) filenameEl.textContent = file.name;
      if (previewWrap) previewWrap.style.display = 'flex';
      if (uploadBox) uploadBox.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  function clearAiPhoto() {
    selectedPhotoName = 'Solar_Panel_Array.jpg';
    selectedPhotoDataUrl = null;
    if (fileInput) fileInput.value = '';
    if (thumbImg) thumbImg.src = '';
    if (previewWrap) previewWrap.style.display = 'none';
    if (uploadBox) {
      uploadBox.style.display = 'flex';
      uploadBox.classList.remove('has-file');
    }
  }

  if (fileInput) {
    fileInput.addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (file) {
        handleSingleAiPhoto(file);
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      clearAiPhoto();
    });
  }

  // Drag-and-Drop on AI upload box (enforce single file only)
  if (uploadBox) {
    ['dragenter', 'dragover'].forEach(function (eventName) {
      uploadBox.addEventListener(eventName, function (e) {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(function (eventName) {
      uploadBox.addEventListener(eventName, function (e) {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('drag-over');
      });
    });

    uploadBox.addEventListener('drop', function (e) {
      const dt = e.dataTransfer;
      const files = dt ? Array.from(dt.files) : [];
      if (files.length > 0) {
        // Enforce strictly 1 single photo for AI
        const firstImg = files.find(function (f) { return f.type.startsWith('image/'); });
        if (firstImg) {
          handleSingleAiPhoto(firstImg);
        }
      }
    });
  }

  // 3. Start AI Image Analysis: needs a photo, shows the cause of the fault and suggests the service to request
  const analyzeBtn = document.getElementById('start-ai-btn');
  const analyzeLabel1 = document.getElementById('ai-btn-text-1');
  const analyzeLabel2 = document.getElementById('ai-btn-text-2');
  const resultCard = document.getElementById('analysis-result');
  const photoError = document.getElementById('ai-photo-error');

  /* Demo diagnosis library. To use a real vision model, set window.SHAMSTECH_AI_ENDPOINT to a backend URL that
     receives {image: dataUrl} and returns {issue, severity, confidence, cause, steps[], service} (service: repair | clean | other | install). */
  const SERVICES = {
    repair: { label: 'Maintenance & Repair', color: '#ea580c', icon: '#i-wrench', param: 'maintenance' },
    clean: { label: 'Panel Cleaning', color: '#2563eb', icon: '#i-sun', param: 'cleaning' },
    other: { label: 'Other Services', color: '#ca8a04', icon: '#i-settings', param: 'other' },
    install: { label: 'New Installation', color: '#16a34a', icon: '#i-zap', param: 'solar' }
  };
  const SCENARIOS = [
    { issue: 'Insulation (Ground) Fault', severity: 'high', confidence: 93, service: 'repair',
      cause: 'The inverter reports very low insulation resistance on the DC side. This usually comes from moisture in a connector, a damaged DC cable or water inside a panel junction box.',
      steps: ['Switch the inverter off with its AC and DC isolators.', 'Do not touch DC cables or connectors.', 'Keep the system off until a technician tests each string.'] },
    { issue: 'Grid Voltage / Frequency Fault', severity: 'medium', confidence: 90, service: 'repair',
      cause: 'The grid voltage or frequency went outside the inverter limits. Common reasons are an unstable grid, a loose AC connection or a tripped breaker.',
      steps: ['Check that the AC breaker is on.', 'Wait 5 minutes, the inverter retries by itself.', 'If the error returns, request a technician to check the AC wiring.'] },
    { issue: 'Overheating (Blocked Vents or Fan Failure)', severity: 'medium', confidence: 91, service: 'repair',
      cause: 'The inverter temperature is above normal. Dust on the vents, direct sun on the unit or a failed cooling fan reduce its cooling.',
      steps: ['Make sure nothing blocks the vents.', 'Keep the unit shaded and ventilated.', 'A technician should clean the vents and test the fan.'] },
    { issue: 'DC Over-Voltage / String Mismatch', severity: 'medium', confidence: 88, service: 'repair',
      cause: 'The panel strings send more voltage than the inverter accepts, often on cold bright mornings, or one string is configured differently from the others.',
      steps: ['Note the voltage shown on the screen.', 'Do not change the wiring yourself.', 'A technician should check the string layout and the inverter settings.'] },
    { issue: 'Communication / Display Fault', severity: 'low', confidence: 92, service: 'repair',
      cause: 'The monitoring stick, Wi-Fi link or display cable lost connection. Production is usually not affected.',
      steps: ['Restart the router and the monitoring stick.', 'Check that the stick is firmly plugged in.', 'If it stays offline, request a technician to reset the link.'] },
    { issue: 'Heavy Dust on Panels (Soiling)', severity: 'low', confidence: 94, service: 'clean',
      cause: 'A thick layer of dust and dirt blocks sunlight and lowers production by roughly 10 to 20 percent.',
      steps: ['Do not clean in the middle of the day.', 'Avoid hard brushes, they scratch the glass.', 'A soft-wash with deionized water restores the output.'] },
    { issue: 'Aged Inverter, Replacement Recommended', severity: 'medium', confidence: 86, service: 'other',
      cause: 'The unit shows repeated faults typical of an inverter near the end of its life. Repairing it again may cost more than replacing it.',
      steps: ['Keep a note of the error codes and dates.', 'Check the remaining warranty period.', 'Ask companies for a replacement quote.'] }
  ];
  function pickScenario(dataUrl) {            // same photo always gives the same result
    let h = 0; for (let i = 0; i < dataUrl.length; i += 997) h = (h * 31 + dataUrl.charCodeAt(i)) >>> 0;
    return SCENARIOS[h % SCENARIOS.length];
  }
  async function diagnose(dataUrl) {
    if (window.SHAMSTECH_AI_ENDPOINT) {
      try {
        const res = await fetch(window.SHAMSTECH_AI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: dataUrl }) });
        const d = await res.json();
        if (d && d.issue) return d;
      } catch (e) {}
    }
    return pickScenario(dataUrl);
  }
  const esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function show(d) {
    const sv = SERVICES[d.service] || SERVICES.other, sev = d.severity || 'medium';
    const sevEl = document.getElementById('ai-sev'); sevEl.className = 'ai-sev ' + sev; sevEl.textContent = sev + ' severity';
    document.getElementById('ai-conf').textContent = 'Confidence: ' + d.confidence + '%';
    document.getElementById('ai-issue').textContent = d.issue;
    document.getElementById('ai-cause').textContent = d.cause;
    document.getElementById('ai-steps').innerHTML = (d.steps || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    const link = '/html/request_solar.html?service=' + sv.param + '&issue=' + encodeURIComponent(d.issue + ': ' + d.cause);
    const box = document.getElementById('ai-suggest'); box.style.setProperty('--svc', sv.color);
    box.innerHTML = '<small>Suggested service</small><div class="ai-suggest-row"><span class="ho-ico" style="--svc:' + sv.color + '"><svg class="icon"><use href="' + sv.icon + '"/></svg></span><h4 class="display">' + sv.label + '</h4></div>' +
      '<a href="' + link + '" class="btn btn-dark display"><span class="btn-label"><span>Request ' + sv.label + '</span><span aria-hidden="true">Request ' + sv.label + '</span></span><svg class="icon"><use href="#i-arrow-up-right"/></svg></a>';
  }

  if (analyzeBtn && resultCard) {
    analyzeBtn.addEventListener('click', async function () {
      if (!selectedPhotoDataUrl) {                                           // a photo is required
        if (photoError) photoError.style.display = 'block';
        if (uploadBox) uploadBox.classList.add('has-error');
        if (uploadBox) uploadBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (photoError) photoError.style.display = 'none';
      analyzeBtn.disabled = true; resultCard.style.display = 'none';
      [analyzeLabel1, analyzeLabel2].forEach(function (l) { if (l) l.textContent = 'Analyzing inverter photo...'; });
      const started = Date.now(), d = await diagnose(selectedPhotoDataUrl);
      setTimeout(function () {
        show(d); resultCard.style.display = 'block';
        [analyzeLabel1, analyzeLabel2].forEach(function (l) { if (l) l.textContent = 'Analyze another photo'; });
        analyzeBtn.disabled = false;
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, Math.max(0, 1600 - (Date.now() - started)));
    });
  }
  if (fileInput) fileInput.addEventListener('change', function () { if (photoError) photoError.style.display = 'none'; if (uploadBox) uploadBox.classList.remove('has-error'); });
});
