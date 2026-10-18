/* =====================================================
   SHAMSTECH JO - SHARED TRACKING DATA (js/tracking_flows.js)
   Used by BOTH sides:
   - Client page (my_requests.html): READ-ONLY view.
   - Company page (company_proposals.html): moves the stages
     and presses "Deliver Project".
   Data lives in localStorage 'shamstech_tracking':
   { reqId: {title, flow, step, times, company, confirmed} }
   step = index of the current stage. Stages 0-1 happen before
   a company is chosen; from ACCEPT (2) on, only the company
   moves the tracking forward. The last stage = delivered.
   ===================================================== */
window.ShamsTracking = (function () {
  var KEY = 'shamstech_tracking', ACCEPT = 2;
  var HEAD = [['Request posted', 'Your request was sent to certified companies.'], ['Offers received', 'Companies sent proposals. Compare and choose one.'], ['Offer accepted', 'The company confirmed your project.']];
  function mk(label, color, icon, rest) { return { label: label, color: color, icon: icon, steps: HEAD.concat(rest) }; }
  /* One flow per service. Colors: green install, orange maintenance, blue cleaning, yellow other. */
  var FLOWS = {
    install: mk('Installation', '#16a34a', '#i-zap', [
      ['Preparations & technical studies', 'Site survey, system design and utility paperwork.'],
      ['Material supply to site', 'Panels, inverter and mounting arrive at your site.'],
      ['Installation & work start', 'The team starts installing the system.'],
      ['Inspection & commissioning', 'Safety inspection, grid hookup and commissioning test.'],
      ['Project delivered', 'The company handed over the finished system.']]),
    repair: mk('Maintenance', '#ea580c', '#i-wrench', [
      ['Technician visit & fault diagnosis', 'A technician inspects the system and finds the fault.'],
      ['Spare parts sourcing', 'Required parts are prepared and brought to the site.'],
      ['Repair & replacement work', 'The faulty parts are repaired or replaced.'],
      ['Testing & performance check', 'Output is tested and compared with normal values.'],
      ['Service delivered', 'The company handed over the repaired system with a report.']]),
    clean: mk('Cleaning', '#2563eb', '#i-sun', [
      ['Visit scheduled & confirmed', 'The company confirmed the date and time with you.'],
      ['Team arrives at site', 'The cleaning team reached your location.'],
      ['Cleaning in progress', 'Panels are soft-washed with deionized water.'],
      ['Result check & before / after photos', 'Photos and output reading are added.'],
      ['Service delivered', 'The company finished the cleaning.']]),
    other: mk('Other Services', '#ca8a04', '#i-settings', [
      ['Request review by the company', 'The company studies your request and its requirements.'],
      ['Site visit & assessment', 'A specialist checks the site if needed.'],
      ['Work execution', 'The requested work is carried out.'],
      ['Final check', 'The result is checked against your request.'],
      ['Service delivered', 'The company completed the service.']])
  };
  function all() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} }
  function flowOf(t) {
    t = (t || '').toLowerCase();
    if (/clean|wash/.test(t)) return 'clean';
    if (/repair|fault|diagnos|maint|inverter/.test(t)) return 'repair';
    if (/install|system|on-grid|off-grid|hybrid/.test(t)) return 'install';
    return 'other';
  }
  /* which service is a request? (icon first, then the title) */
  function detect(title, icon, hint) {
    var s = (title || '') + ' ' + (hint || ''); icon = icon || '';
    if (/i-settings/.test(icon)) return 'other';
    if (/clean|wash/i.test(s)) return 'clean';
    if (/repair|maint|fault|diagnos|inverter/i.test(s) || /i-wrench|i-cpu/.test(icon)) return 'repair';
    if (/i-zap/.test(icon) || /install|system|on-grid|off-grid|hybrid/i.test(s)) return 'install';
    return 'other';
  }
  function ensure(id, info) {
    var m = all();
    if (!m[id]) { m[id] = { id: id, title: info.title, flow: info.flow || flowOf(info.title + ' ' + (info.hint || '')), step: info.step || 0, times: {}, company: info.company || '', confirmed: false }; save(m); }
    else if (info.company && !m[id].company) { m[id].company = info.company; save(m); }
    return m[id];
  }
  function set(id, patch) { var m = all(); if (!m[id]) return null; for (var k in patch) m[id][k] = patch[k]; save(m); return m[id]; }
  function advance(id) {                       // company only
    var m = all(), j = m[id]; if (!j) return null;
    if (j.step < FLOWS[j.flow].steps.length - 1) { j.step++; j.times[j.step] = Date.now(); save(m); }
    return j;
  }
  function isDelivered(j) { return j && j.step >= FLOWS[j.flow].steps.length - 1; }
  function when(ts) { return ts ? new Date(ts).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''; }
  return { detect: detect, FLOWS: FLOWS, ACCEPT: ACCEPT, all: all, ensure: ensure, set: set, advance: advance, isDelivered: isDelivered, when: when };
})();
