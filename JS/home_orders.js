/* =====================================================
   SHAMSTECH JO - HOME: LATEST 2 REQUESTS (js/home_orders.js)
   Fills "My Active Orders & Tracking" on client_home.html
   with the client's 2 newest requests, using the same
   service design as the requests page (service color border,
   icon, chip). Status logic is the same too:
   open -> "View Request", accepted -> "View Tracking".
   Also drives the marketplace arrows.
   ===================================================== */
document.addEventListener('DOMContentLoaded', function () {
  var T = window.ShamsTracking, box = document.getElementById('home-orders');
  var get = function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  if (T && box) {
    var archived = get('shamstech_archived_request_ids', []), accepted = get('shamstech_accepted_proposals', {});
    var companyBids = get('shamstech_company_bids', []);
    var DEMO = [
      { id: '#REQ-2026-0914', title: 'Solar Panel Cleaning & Efficiency Maintenance', date: 'Oct 08, 2026', icon: '#i-sun', exec: true, offers: 0, info: [['Agreed price', '45 JOD'], ['Contractor', 'Jordan SunWash Ltd.']] },
      { id: '#REQ-2026-0892', title: 'New On-Grid Solar System Installation (5.5 kWp)', date: 'Oct 06, 2026', icon: '#i-zap', exec: false, offers: 3, info: [['System type', 'On-Grid System'], ['Roof & property', 'Private Property']] }
    ];
    var mine = get('shamstech_user_requests', []).map(function (r) {            // newest first (saved with unshift)
      var d = r.dateLabel || ((r.meta || '').match(/[A-Z][a-z]{2} \d{2}, \d{4}/) || [''])[0];
      var cleanId = String(r.id || '').replace('#', '');
      var offerCount = Array.isArray(companyBids) ? companyBids.filter(function (b) { return String(b.id || '').replace('#', '') === cleanId; }).length : 0;
      return { id: r.id, title: r.title, date: d, icon: r.icon, exec: !!(accepted[r.id] || accepted[cleanId]), offers: offerCount, info: [[r.metric1Label, r.metric1Value], [r.metric2Label, r.metric2Value]] };
    });
    var list = mine.concat(DEMO).filter(function (r) { return archived.indexOf(r.id) === -1; }).slice(0, 2);
    var low = function (s) { s = String(s || '').toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); };

    box.innerHTML = list.length ? list.map(function (r) {
      var svc = T.detect(r.title, r.icon, r.info[0][1]), f = T.FLOWS[svc], job = r.exec ? T.ensure(r.id, { title: r.title, flow: svc, step: T.ACCEPT }) : null;
      var del = job && T.isDelivered(job), st, note, btn, href;
      if (del) { st = ['delivered', '● Delivered: confirm']; note = 'The company delivered your project. Confirm to close it.'; btn = 'Review & Confirm'; href = '/html/my_requests.html?track=' + encodeURIComponent(r.id); }
      else if (r.exec) { st = ['proc', '● Under Process']; note = 'Current stage: <b>' + esc(f.steps[job.step][0]) + '</b> (' + (job.step + 1) + ' of ' + f.steps.length + ')'; btn = 'View Tracking'; href = '/html/my_requests.html?track=' + encodeURIComponent(r.id); }
      else { st = ['open', r.offers ? '● ' + r.offers + ' Offers Received' : '● Open for Proposals']; note = r.offers ? r.offers + ' offers received from certified companies. Review &amp; select.' : 'Waiting for certified companies to send their proposals.'; btn = 'View Request'; href = '/html/request_offers.html?id=' + encodeURIComponent(r.id); }
      return '<article class="ho-card" data-svc="' + svc + '" style="--svc:' + f.color + '">' +
        '<div class="ho-top"><span class="ho-ico"><svg class="icon"><use href="' + f.icon + '"/></svg></span>' +
        '<div><span class="svc-chip">' + f.label + '</span><h3 class="display">' + esc(r.title) + '</h3><p>' + esc(r.id) + (r.date ? ' · Submitted: ' + esc(r.date) : '') + '</p></div>' +
        '<span class="ho-badge ' + st[0] + '">' + st[1] + '</span></div>' +
        '<div class="ho-info">' + r.info.map(function (i) { return '<div><span>' + esc(i[0]) + '</span><strong>' + esc(i[1]) + '</strong></div>'; }).join('') + '</div>' +
        '<div class="ho-foot"><p>' + note + '</p><a class="btn btn-dark" href="' + href + '" data-req="' + esc(r.id) + '"><span class="btn-label"><span>' + btn + '</span><span aria-hidden="true">' + btn + '</span></span><svg class="icon"><use href="#i-arrow-up-right"/></svg></a></div></article>';
    }).join('') : '<div class="ho-empty"><h3 class="display">No active requests yet</h3><p>Start with any service and your request will show up here.</p><a class="btn btn-gold" href="/html/request_solar.html"><span>Request a service</span></a></div>';
    box.addEventListener('click', function (e) { var a = e.target.closest('a[data-req]'); if (a && /request_offers/.test(a.href)) { try { localStorage.setItem('shamstech_active_offer_req_id', a.getAttribute('data-req')); } catch (x) {} } });
  }

  /* ===== MARKETPLACE: the 5 newest items posted (the client's own new listings first, then the default items) ===== */
  var track = document.getElementById('client-track');
  if (track) {
    var DEFAULTS = [
      { id: 'jinko-550w', title: 'Trina Solar 550W Panels (x6)', img: '/images/panel.jpg', price: '180 JOD', meta: 'Excellent Condition · 1 Year Used', loc: 'Amman, Jordan' },
      { id: 'growatt-5kw', title: 'Growatt 8kW On-Grid Inverter', img: '/images/inverter.jpg', price: '320 JOD', meta: 'Very Good Condition · With Warranty', loc: 'Irbid, Jordan' },
      { id: 'longi-450w', title: 'Aluminum Racks for 12 Panels', img: '/images/install.jpg', price: '75 JOD', meta: 'Like New · Rust-Free Alloy', loc: 'Zarqa, Jordan' },
      { id: 'felicity-10kwh', title: 'Lithium Storage · 10kWh', img: '/images/battery.jpg', price: '600 JOD', meta: 'Used · 80% Cycle Life Left', loc: 'Madaba, Jordan' },
      { id: 'jinko-540w', title: "Jinko 540W Panel (Brand New)", img: '/images/panel.jpg', price: "100 JOD", meta: "Like New \u00b7 Less than 3 Months", loc: "Mafraq, Jordan" }
    ];
    var gone = get('shamstech_archived_market_ids', []);
    var posted = get('shamstech_user_market_items', []).filter(function (i) { return gone.indexOf(i.id) === -1; }).map(function (i) {
      var p = String(i.price || '').replace(/[^\d.]/g, '');
      return { id: i.id, title: i.title, img: i.img || '/images/panel.jpg', price: (p || i.price || '-') + ' JOD', meta: [i.condition ? i.condition + ' Condition' : '', i.usage ? i.usage + ' Used' : ''].filter(Boolean).join(' · '), loc: (i.city || 'Jordan') + ', Jordan' };
    });
    track.innerHTML = posted.concat(DEFAULTS).slice(0, 5).map(function (m) {
      return '<article class="product" onclick="window.location.href=\'/html/market_item.html?item=' + encodeURIComponent(m.id) + '\'" style="cursor:pointer;">' +
        '<div class="product-img"><img src="' + esc(m.img) + '" alt="' + esc(m.title) + '" onerror="this.parentNode.classList.add(\'img-fail\')"><span class="price">' + esc(m.price) + '</span></div>' +
        '<h3 class="display">' + esc(m.title) + '</h3><p class="product-meta">' + esc(m.meta) + '</p>' +
        '<p class="product-loc"><svg class="icon"><use href="#i-map-pin"/></svg> ' + esc(m.loc) + '</p></article>';
    }).join('');
  }
});
