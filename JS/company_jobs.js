/* =====================================================
   SHAMSTECH JO - COMPANY ACTIVE JOBS (js/company_jobs.js)
   Shown on company_proposals.html. The company moves each
   accepted job through its stages and finally presses
   "Deliver Project". The client sees every change live
   (read-only) and then confirms and rates.
   ===================================================== */
document.addEventListener('DOMContentLoaded', function () {
  var T = window.ShamsTracking, box = document.getElementById('company-jobs-list');
  if (!T || !box) return;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  T.ensure('#REQ-2026-0914', { title: 'Solar Panel Cleaning & Efficiency Maintenance', flow: 'clean', step: T.ACCEPT, company: 'Jordan SunWash Ltd.' });   // demo job linked to the client's demo request
  function reviewOf(id) { try { return (JSON.parse(localStorage.getItem('shamstech_reviews')) || []).filter(function (r) { return r.id === id; })[0]; } catch (e) { return null; } }
  function render() {
    var m = T.all(), ids = Object.keys(m).filter(function (id) { return m[id].step >= T.ACCEPT; });
    box.innerHTML = ids.length ? ids.map(function (id) {
      var j = m[id], f = T.FLOWS[j.flow], n = f.steps.length, del = T.isDelivered(j), last = j.step === n - 2, rv = reviewOf(id);
      var segs = f.steps.map(function (s, i) { return '<i class="' + (i < j.step || (del && i === j.step) ? 'on' : i === j.step ? 'now' : '') + '"></i>'; }).join('');
      var action = j.confirmed ? '<span class="cj-state ok">Closed' + (rv ? ' · Client rated ' + rv.stars + '/5' + (rv.recommend === 1 ? ' · Recommends you' : '') : ' · Client skipped rating') + '</span>'
        : del ? '<span class="cj-state wait">Delivered: waiting for the client to confirm</span>'
        : '<button type="button" class="btn-submit-green display" data-adv="' + esc(id) + '"><span>' + (last ? 'Deliver Project' : 'Complete: ' + esc(f.steps[j.step][0])) + '</span></button>';
      return '<article class="cj-card"><div class="cj-head"><div><span class="trk-type">' + esc(f.label) + '</span><h3 class="display">' + esc(j.title) + '</h3><p>' + esc(id) + '</p></div>' + action + '</div>' +
        '<div class="trk-segs">' + segs + '</div><p class="cj-now"><b>' + (del ? 'Delivered' : 'Current stage: ' + esc(f.steps[j.step][0])) + '</b> · ' + (del ? 'Project handed over.' : esc(f.steps[j.step][1])) + '</p></article>';
    }).join('') : '<p class="cj-empty">No active jobs yet. Jobs appear here once a client accepts your proposal.</p>';
  }
  box.addEventListener('click', function (e) { var b = e.target.closest('[data-adv]'); if (b) { T.advance(b.getAttribute('data-adv')); render(); } });
  window.addEventListener('storage', render); render();
});
