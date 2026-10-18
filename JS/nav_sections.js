/* =====================================================
   SHAMSTECH JO - NAVBAR SECTION HIGHLIGHT (js/nav_sections.js)
   On client_home.html and company_home.html the navbar links
   point to sections of the same page. This file marks the
   link of the section that is on screen as "active".
   ===================================================== */
(function () {
  var links = [].slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var items = links.map(function (a) { return { a: a, el: document.getElementById(a.getAttribute('href').slice(1)) }; }).filter(function (x) { return x.el; });
  if (!items.length) return;
  function spy() {
    var y = 140, cur = items[0];
    items.forEach(function (x) { if (x.el.getBoundingClientRect().top <= y) cur = x; });
    links.forEach(function (l) { l.classList.remove('active'); });
    cur.a.classList.add('active');
  }
  window.addEventListener('scroll', spy, { passive: true }); spy();
})();
