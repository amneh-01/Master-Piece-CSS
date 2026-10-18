/* =====================================================
   SHAMSTECH JO - CLIENT REQUESTS LAYER (js/request_tracking.js)
   Runs after my_requests.js on the Active Requests page.
   1. SERVICE COLORS: every card gets its service color
      (green installation, orange maintenance, blue cleaning,
      yellow other). The card border and the icon share it,
      and the icon is the same one used on the home page.
   2. STATES (no tracking on open requests):
      - Open for proposals  -> button "View Request"
      - Offer accepted      -> badge "Under Process" and
                               button "View Tracking"
      - Delivered by company -> badge "Delivered", client
                               presses Done.
   3. "View Tracking" opens a READ-ONLY timeline: the
      company moves the stages, the client only follows.
   4. Click a request (title or View Request) > popup with all
      the details the client entered (photos, location, system,
      property & roof, phone, notes). Compare Proposals is inside.
   5. Done > evaluation screen (rate the company and its
      work, or Skip) > request moves to History.
   5. Requests cannot be edited (only deleted) and open
      requests show no filler status text.
   ===================================================== */
document.addEventListener('DOMContentLoaded', function () {
  var T = window.ShamsTracking, list = document.getElementById('submitted-requests-list');
  if (!T || !list) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var accepted = {}; try { accepted = JSON.parse(localStorage.getItem('shamstech_accepted_proposals')) || {}; } catch (e) {}
  function acceptedFor(id) {
    var clean = String(id || '').replace('#', '');
    return accepted[id] || accepted[clean] || accepted['#' + clean] || null;
  }
  var openId = null, doneId = null, ratings = {}, rec = null;
  var CRITERIA = [['quality', 'Quality of work'], ['time', 'On-time & schedule'], ['comm', 'Communication & professionalism'], ['safety', 'Safety & site cleanliness'], ['value', 'Value for price']];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function detect(card) { return T.detect(card.getAttribute('data-title'), card.getAttribute('data-icon'), card.getAttribute('data-m1-val')); }
  function companyOf(card, id) {
    if (/CONTRACTOR/i.test(card.getAttribute('data-m2-label') || '')) return card.getAttribute('data-m2-val');
    var offer = acceptedFor(id);
    return (offer && offer.contractorName) || '';
  }
  function offerCount(id) {
    var clean = String(id || '').replace('#', ''), bids = [];
    try { bids = JSON.parse(localStorage.getItem('shamstech_company_bids')) || []; } catch (e) {}
    return Array.isArray(bids) ? bids.filter(function (b) { return String(b.id || '').replace('#', '') === clean; }).length : 0;
  }
  function jobOf(card) {
    var id = card.getAttribute('data-id'), exec = card.getAttribute('data-category') === 'execution';
    var j = T.ensure(id, { title: card.getAttribute('data-title'), flow: card.getAttribute('data-svc'), step: exec ? T.ACCEPT : 1, company: companyOf(card, id) });
    if (exec && j.step < T.ACCEPT) j = T.set(id, { step: T.ACCEPT, company: companyOf(card, id) || j.company });
    return j;
  }

  function decorate(card) {
    if (card.getAttribute('data-trk')) return; card.setAttribute('data-trk', '1');
    var svc = detect(card), f = T.FLOWS[svc];
    card.setAttribute('data-svc', svc); card.setAttribute('data-icon', f.icon);           // same icon as the home page; History keeps it too
    card.style.setProperty('--svc', f.color);
    var ic = $('.sub-req-icon', card); if (ic) { ic.classList.remove('amber'); var u = ic.querySelector('use'); if (u) u.setAttribute('href', f.icon); }
    var tg = $('.sub-req-title-group > div', card); if (tg) { var chip = document.createElement('span'); chip.className = 'svc-chip'; chip.textContent = f.label; tg.insertBefore(chip, tg.firstChild); }
    var badge = $('.sub-req-badge', card); if (badge) badge.setAttribute('data-orig', badge.outerHTML);
    var ed = $('a[href*="request_solar"]', card); if (ed) ed.remove();               // requests cannot be edited, only deleted
    ['[data-toast]', '[data-req-action="complete"]'].forEach(function (s) { var b = $(s, card); if (b) b.classList.add('trk-hide'); });
    var cmp = $('.btn-compare-offers', card); if (cmp) { var sp = cmp.querySelector('span'); if (sp) sp.textContent = 'View Request'; cmp.setAttribute('data-rd-open', ''); }
    var ttl = $('.sub-req-title-group h2', card); if (ttl) { ttl.removeAttribute('onclick'); ttl.setAttribute('data-rd-open', ''); ttl.style.cursor = 'pointer'; }   // click the request = see all its details   // open state: "View Request"
    var group = $('.sub-req-btn-group', card);
    var view = document.createElement('button'); view.type = 'button'; view.className = 'btn-track-work display'; view.setAttribute('data-trk-open', '');
    view.innerHTML = '<span>View Tracking</span><svg class="icon"><use href="#i-arrow-right"/></svg>'; group.insertBefore(view, group.firstChild);
    var done = document.createElement('button'); done.type = 'button'; done.className = 'btn-compare-offers display trk-done-btn'; done.setAttribute('data-trk-done', '');
    done.innerHTML = '<span>✓ Delivered: Review &amp; Confirm</span>'; group.insertBefore(done, group.firstChild);
  }

  function refresh(card) {
    var j = jobOf(card), exec = card.getAttribute('data-category') === 'execution', del = exec && T.isDelivered(j);
    card.classList.toggle('state-open', !exec); card.classList.toggle('state-proc', exec && !del); card.classList.toggle('state-del', del);
    var sb = $('.sub-req-status-box', card); if (sb) sb.style.display = (!exec && !$('.rec-highlight', card)) ? 'none' : '';   // no filler status text on open requests
    var badge = $('.sub-req-badge', card); if (!badge) return;
    if (del) { badge.className = 'sub-req-badge delivered display'; badge.textContent = '● Delivered: confirm'; }
    else if (exec) { badge.className = 'sub-req-badge in-execution display'; badge.textContent = '● Under Process'; }
    else {
      var count = offerCount(card.getAttribute('data-id'));
      badge.className = 'sub-req-badge offers-ready display';
      badge.textContent = count ? '● ' + count + (count === 1 ? ' Offer Received' : ' Offers Received') : '● Open for Proposals';
    }
  }

  function summary() {
    var c = { open: 0, proc: 0, del: 0 };
    list.querySelectorAll('.submitted-req-card').forEach(function (card) { if (card.classList.contains('state-del')) c.del++; else if (card.classList.contains('state-proc')) c.proc++; else c.open++; });
    var box = $('.trk-summary'); if (!box) { box = document.createElement('div'); box.className = 'trk-summary'; var bar = $('.requests-filter-bar'); bar.parentNode.insertBefore(box, bar); }
    box.innerHTML = '<div><b>' + c.open + '</b><span>Open for proposals</span></div><div><b>' + c.proc + '</b><span>Under process</span></div><div class="' + (c.del ? 'alert' : '') + '"><b>' + c.del + '</b><span>' + (c.del ? 'Delivered: confirm now' : 'Delivered') + '</span></div>';
  }
  function cardById(id) { return Array.prototype.filter.call(list.querySelectorAll('.submitted-req-card'), function (c) { return c.getAttribute('data-id') === id; })[0]; }
  function refreshAll() { list.querySelectorAll('.submitted-req-card').forEach(function (c) { decorate(c); refresh(c); }); summary(); if (openId) drawer(openId); }

  /* ---- read-only tracking drawer ---- */
  function drawer(id) {
    var j = T.all()[id]; if (!j) return; openId = id;
    var f = T.FLOWS[j.flow], del = T.isDelivered(j);
    var chip = $('#trk-chip'); chip.textContent = f.label; chip.style.background = f.color;
    $('#trk-title').textContent = j.title; $('#trk-sub').textContent = j.company ? 'Company: ' + j.company : '';
    $('#trk-steps').innerHTML = f.steps.map(function (s, i) {
      var st = i < j.step || (del && i === j.step) ? 'done' : i === j.step ? 'now' : '';
      return '<li class="' + st + '"><div><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div><time>' + esc(i === 0 ? '' : T.when(j.times[i])) + '</time></li>';
    }).join('');
    $('#trk-done-box').style.display = del ? '' : 'none';
    $('#trk-backdrop').classList.add('open');
  }
  function close(id) { $(id).classList.remove('open'); if (id === '#trk-backdrop') openId = null; }

  /* ---- evaluation screen (company + its work), then History ---- */
  function avg() { var v = Object.keys(ratings).map(function (k) { return ratings[k]; }); return v.length ? Math.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length * 10) / 10 : 0; }
  function paint() {
    $('#rv-avg').textContent = avg() || '–';
    document.querySelectorAll('#rev-criteria .rv-row').forEach(function (row) { var n = ratings[row.getAttribute('data-k')] || 0; row.querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('on', i < n); }); });
    document.querySelectorAll('.rv-rec button').forEach(function (b) { b.classList.toggle('on', rec !== null && +b.getAttribute('data-rec') === rec); });
  }
  $('#rev-criteria').innerHTML = CRITERIA.map(function (c) { return '<div class="rv-row" data-k="' + c[0] + '"><span>' + c[1] + '</span><div>' + '<button type="button">★</button>'.repeat(5) + '</div></div>'; }).join('');
  function startDone(id) {
    var j = T.all()[id]; if (!j) return; doneId = id; ratings = {}; rec = null; paint();
    $('#rev-company').textContent = j.company || 'the company'; $('#rev-text').value = '';
    close('#trk-backdrop'); $('#rev-backdrop').classList.add('open');
  }
  function finish(withReview) {
    var id = doneId, j = T.all()[id], card = cardById(id); if (!j) return;
    var score = avg(), rated = withReview && score > 0;
    if (rated) { var r = []; try { r = JSON.parse(localStorage.getItem('shamstech_reviews')) || []; } catch (e) {} r.push({ id: id, company: j.company, service: j.flow, stars: score, ratings: ratings, recommend: rec, text: $('#rev-text').value, ts: Date.now() }); try { localStorage.setItem('shamstech_reviews', JSON.stringify(r)); } catch (e) {} }
    T.set(id, { confirmed: true }); close('#rev-backdrop'); doneId = null;
    var btn = card && $('[data-req-action="complete"]', card); if (btn) btn.click();      // existing archive-to-History logic
    try {
      var h = JSON.parse(localStorage.getItem('shamstech_requests_history')) || [];
      h.forEach(function (x) { if (x.id === id) { x.statusNote = '✓ Delivered' + (j.company ? ' by ' + j.company : '') + (rated ? ' · Rated ' + score + '/5' : ' · Evaluation skipped'); x.service = j.flow; if (rated) x.review = { stars: score, ratings: ratings, recommend: rec, text: $('#rev-text').value }; } });
      localStorage.setItem('shamstech_requests_history', JSON.stringify(h));
    } catch (e) {}
    setTimeout(summary, 400);
  }

  /* ---- request details popup: photos, location, system, property & roof, phone, notes ---- */
  function openDetails(id) {
    var card = cardById(id); if (!card) return;
    var rec = get('shamstech_user_requests', []).filter(function (x) { return x.id === id; })[0] || {};
    var svc = card.getAttribute('data-svc'), f = T.FLOWS[svc];
    var chip = $('#rd-chip'); chip.textContent = f.label; chip.style.background = f.color; chip.style.color = svc === 'other' ? '#3b2f00' : '#fff';
    $('#rd-title').textContent = rec.title || card.getAttribute('data-title');
    $('#rd-sub').textContent = ($('.sub-req-meta', card) || { textContent: id }).textContent.replace(/\s+/g, ' ').trim();
    var det = rec.details && rec.details.length ? rec.details : [1, 2, 3].map(function (n) { return [card.getAttribute('data-m' + n + '-label'), card.getAttribute('data-m' + n + '-val')]; }).filter(function (d) { return d[0] && d[1]; });
    $('#rd-grid').innerHTML = det.map(function (d) { return '<div class="' + (String(d[1]).length > 60 ? 'wide' : '') + '"><span>' + esc(d[0]) + '</span><strong>' + esc(d[1]) + '</strong></div>'; }).join('');
    var ph = rec.photos || [];
    $('#rd-photos-wrap').style.display = ph.length ? '' : 'none';
    $('#rd-photos').innerHTML = ph.map(function (p) { return '<img src="' + esc(p.url) + '" alt="' + esc(p.name || 'Photo') + '">'; }).join('');
    var offers = $('#rd-offers'); offers.style.display = card.classList.contains('state-open') ? '' : 'none'; offers.setAttribute('data-req', id);
    $('#rd-backdrop').classList.add('open');
  }
  function get(k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } }

  document.addEventListener('click', function (e) {
    var rd = e.target.closest('[data-rd-open]'); if (rd) { var rc = rd.closest('.submitted-req-card'); if (rc) { e.preventDefault(); openDetails(rc.getAttribute('data-id')); } return; }
    if (e.target.closest('#rd-close') || e.target.closest('#rd-close2') || e.target.id === 'rd-backdrop') { close('#rd-backdrop'); return; }
    var of = e.target.closest('#rd-offers'); if (of) { try { localStorage.setItem('shamstech_active_offer_req_id', of.getAttribute('data-req')); } catch (x) {} return; }
    var o = e.target.closest('[data-trk-open]'); if (o) { var c = o.closest('.submitted-req-card'); if (c) drawer(c.getAttribute('data-id')); return; }
    var d = e.target.closest('[data-trk-done]'); if (d) { var c2 = d.closest('.submitted-req-card'); startDone(c2 ? c2.getAttribute('data-id') : openId); return; }
    if (e.target.closest('#trk-done')) { startDone(openId); return; }
    if (e.target.closest('#trk-close') || e.target.id === 'trk-backdrop') close('#trk-backdrop');
    if (e.target.closest('#rev-skip')) finish(false);
    if (e.target.closest('#rev-send')) finish(true);
    var s = e.target.closest('#rev-criteria .rv-row button'); if (s) { var row = s.closest('.rv-row'); ratings[row.getAttribute('data-k')] = Array.prototype.indexOf.call(row.querySelectorAll('button'), s) + 1; paint(); }
    var rb = e.target.closest('.rv-rec button'); if (rb) { rec = +rb.getAttribute('data-rec'); paint(); }
  });
  window.addEventListener('storage', refreshAll);
  setInterval(refreshAll, 3000);
  refreshAll();
  var q = new URLSearchParams(location.search).get('track');            // coming from the home page: open that tracking
  if (q && T.all()[q]) drawer(q);
});
