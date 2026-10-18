/* =====================================================
   SHAMSTECH JO - ROLE-AWARE NAVBAR (js/role_nav.js)
   Used by the pages that BOTH roles can open: used_market,
   market_item, history_archives, market_history,
   requests_history.
   Problem it fixes: a company opening the market saw the
   CLIENT navbar (with the company name).
   - role = company -> this file puts the COMPANY navbar in
     the header (same links, dropdown and mobile menu as the
     company pages; every item goes to its section of
     company_home.html).
   - role = client (or none) -> nothing changes: the page keeps
     its own client navbar.
   The dropdown / mobile menu buttons keep the same ids, so the
   page's own script still opens and closes them.
   The company HTML below is a copy of the navbar in
   company_home.html (source of truth).
   ===================================================== */
(function () {
  if (localStorage.getItem('shamstech_user_role') !== 'company') return;
  var header = document.getElementById('navbar'); if (!header) return;

  var NAV = "\n    <!-- NAVBAR (company): the same navbar on every company page. Every item goes to its section of company_home.html (not a new page). Company Profile uses a person icon. Source of truth: company_home.html. -->\n    <div class=\"container\">\n      <a href=\"/html/company_home.html\" class=\"brand\">\n        <span class=\"brand-icon\"><svg class=\"icon\"><use href=\"#i-sun\"/></svg></span>\n        <span>\n          <span class=\"brand-name display\">SHAMS<b>TECH</b></span>\n          <span class=\"brand-sub\">JORDAN \u00b7 \u0634\u0645\u0633 \u0627\u0644\u0623\u0631\u062f\u0646</span>\n        </span>\n      </a>\n      <nav class=\"nav-links\">\n        <a href=\"/html/company_home.html#navbar\">Company Home</a>\n        <a href=\"/html/company_home.html#tenders-section\">Open Requests</a>\n        <a href=\"/html/company_home.html#bids-status-section\">Submitted Proposals</a>\n        <a href=\"/html/company_home.html#company-market-section\">Used Market</a>\n        <a href=\"/html/company_home.html#company-footer\">About Platform</a>\n      </nav>\n\n      <!-- Company Account Button with Name + Arrow Dropdown -->\n      <div class=\"nav-actions\">\n        <div class=\"client-menu-wrap\" id=\"client-menu-wrap\">\n          <button type=\"button\" class=\"client-name-btn\" id=\"client-name-btn\">\n            <span class=\"client-avatar display\" id=\"nav-comp-avatar\">AF</span>\n            <span class=\"display\" id=\"nav-comp-name\">Al-Fanar Energy Co.</span>\n            <svg class=\"icon client-arrow\"><use href=\"#i-chevron-down\"/></svg>\n          </button>\n\n          <div class=\"client-dropdown\" id=\"client-dropdown\">\n            <div class=\"dropdown-label\">Company Portal</div>\n            <a href=\"/html/company_home.html#navbar\" class=\"dropdown-item\">\n              <svg class=\"icon\"><use href=\"#i-building\"/></svg>\n              <span>Company Dashboard</span>\n            </a>\n            <a href=\"/html/company_home.html#bids-status-section\" class=\"dropdown-item\">\n              <svg class=\"icon\"><use href=\"#i-badge-check\"/></svg>\n              <span>Submitted Bids &amp; Offers</span>\n            </a>\n            <a href=\"/html/company_home.html#tenders-section\" class=\"dropdown-item\">\n              <svg class=\"icon\"><use href=\"#i-zap\"/></svg>\n              <span>Open Requests &amp; Tenders</span>\n            </a>\n            <a href=\"/html/company_home.html#company-market-section\" class=\"dropdown-item\">\n              <svg class=\"icon\"><use href=\"#i-box\"/></svg>\n              <span>Used Equipment Market</span>\n            </a>\n            <a href=\"/html/history_archives.html\" class=\"dropdown-item\">\n              <svg class=\"icon\"><use href=\"#i-settings\"/></svg>\n              <span>History &amp; Archives</span>\n            </a>\n            <!-- Company Profile: new item that opens company_profile.html -->\n            <a href=\"/html/company_profile.html\" class=\"dropdown-item\">\n              <svg class=\"icon\"><use href=\"#i-user\"/></svg>\n              <span>Company Profile</span>\n            </a>\n\n            <button type=\"button\" class=\"dropdown-item logout\" id=\"company-logout-btn\" style=\"background:none;border:none;cursor:pointer;text-align:left;\">\n              <svg class=\"icon\"><use href=\"#i-log-out\"/></svg>\n              <span>Log Out</span>\n            </button>\n          </div>\n        </div>\n      </div>\n\n      <button class=\"menu-btn\" id=\"menu-btn\" aria-label=\"Menu\">\n        <svg class=\"icon i-open\"><use href=\"#i-menu\"/></svg>\n        <svg class=\"icon i-close\"><use href=\"#i-x\"/></svg>\n      </button>\n    </div>\n\n    <div class=\"mobile-menu\" id=\"mobile-menu\">\n      <a href=\"/html/company_home.html#navbar\">Company Dashboard</a>\n      <a href=\"/html/company_home.html#tenders-section\">Open Requests &amp; Tenders</a>\n      <a href=\"/html/company_home.html#bids-status-section\">Submitted Proposals &amp; Offers</a>\n      <a href=\"/html/company_home.html#company-market-section\">Used Equipment Market</a>\n      <a href=\"/html/history_archives.html\">History &amp; Archives</a>\n      <!-- Company Profile: mobile menu link -->\n      <a href=\"/html/company_profile.html\">Company Profile</a>\n      <button type=\"button\" class=\"nav-cta\" id=\"mobile-logout-btn\" style=\"border:none;cursor:pointer;width:100%;text-align:center;\">Log Out</button>\n    </div>\n  ";
  var ICONS = ["<symbol id=\"i-badge-check\" viewBox=\"0 0 24 24\"><path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\"/><path d=\"m9 12 2 2 4-4\"/></symbol>", "<symbol id=\"i-box\" viewBox=\"0 0 24 24\"><path d=\"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z\"/><path d=\"m3.3 7 8.7 5 8.7-5M12 22V12\"/></symbol>", "<symbol id=\"i-building\" viewBox=\"0 0 24 24\"><rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"/><path d=\"M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01\"/></symbol>", "<symbol id=\"i-chevron-down\" viewBox=\"0 0 24 24\"><path d=\"m6 9 6 6 6-6\"/></symbol>", "<symbol id=\"i-log-out\" viewBox=\"0 0 24 24\"><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/><polyline points=\"16 17 21 12 16 7\"/><line x1=\"21\" y1=\"12\" x2=\"9\" y2=\"12\"/></symbol>", "<symbol id=\"i-menu\" viewBox=\"0 0 24 24\"><path d=\"M4 6h16M4 12h16M4 18h16\"/></symbol>", "<symbol id=\"i-settings\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z\"/></symbol>", "<symbol id=\"i-sun\" viewBox=\"0 0 24 24\"><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41\"/></symbol>", "<symbol id=\"i-user\" viewBox=\"0 0 24 24\"><path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></symbol>", "<symbol id=\"i-x\" viewBox=\"0 0 24 24\"><path d=\"M18 6 6 18M6 6l12 12\"/></symbol>", "<symbol id=\"i-zap\" viewBox=\"0 0 24 24\"><polygon points=\"13 2 3 14 12 14 11 22 21 10 12 10 13 2\"/></symbol>"];

  // icons the shared page may not have yet
  var missing = ICONS.filter(function (s) { var m = s.match(/id="([^"]+)"/); return m && !document.getElementById(m[1]); });
  if (missing.length) {
    var box = document.createElement('div'); box.style.display = 'none';
    box.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + missing.join('') + '</svg>';
    document.body.insertBefore(box, document.body.firstChild);
  }

  header.innerHTML = NAV;

  // company name + initials in the navbar
  function paint() {
    var p = {}; try { p = JSON.parse(localStorage.getItem('shamstech_company_profile')) || {}; } catch (e) {}
    var name = p.name || localStorage.getItem('shamstech_company_name') || localStorage.getItem('shamstech_user_name') || 'Company';
    var w = name.trim().split(/\s+/), ini = (w.length > 1 ? w[0].charAt(0) + w[1].charAt(0) : name.slice(0, 2)).toUpperCase();
    var n = document.getElementById('nav-comp-name'), a = document.getElementById('nav-comp-avatar');
    if (n) n.textContent = name; if (a) a.textContent = ini;
  }
  paint(); window.addEventListener('load', paint);

  // log out (same as the company pages)
  function logout() { localStorage.removeItem('shamstech_user_role'); localStorage.removeItem('shamstech_company_name'); window.location.href = '/html/login.html?role=company'; }
  ['company-logout-btn', 'mobile-logout-btn'].forEach(function (id) { var b = document.getElementById(id); if (b) b.addEventListener('click', logout); });
})();
