/* =====================================================
   SHAMSTECH JO - CLIENT PROFILE (js/profile.js)
   1. Shows the client's details: name, phone, e-mail,
      governorate and address (entered at sign up).
   2. "Edit profile" unlocks the fields. Save checks them,
      stores them in 'shamstech_client_profile' and updates
      the keys the rest of the site reads (name, e-mail,
      phone, city), so the navbar name changes everywhere.
   3. Cancel restores the saved values.
   ===================================================== */
document.addEventListener('DOMContentLoaded', function () {
  var KEY = 'shamstech_client_profile';
  var $ = function (id) { return document.getElementById(id); };
  var form = $('pf-form'); if (!form) return;
  var F = { name: $('pf-name'), phone: $('pf-phone'), email: $('pf-email'), city: $('pf-city'), area: $('pf-area') };
  var ls = function (k) { return localStorage.getItem(k) || ''; };

  function load() {
    var p = {}; try { p = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    return { name: p.name || ls('shamstech_user_name'), phone: p.phone || ls('shamstech_user_phone'), email: p.email || ls('shamstech_user_email'), city: p.city || ls('shamstech_user_city') || 'Amman', area: p.area || '' };
  }
  var data = load();

  function fill() {
    F.name.value = data.name; F.phone.value = data.phone; F.email.value = data.email; F.city.value = data.city; F.area.value = data.area;
    var t = data.name || 'Your name';
    $('pf-avatar').textContent = t.charAt(0).toUpperCase(); $('pf-title').textContent = t;
    $('pf-s-phone').textContent = data.phone || 'Not added yet'; $('pf-s-email').textContent = data.email || 'Not added yet';
    $('pf-s-addr').textContent = data.city + (data.area ? ', ' + data.area : '');
  }
  function clearErrors() { form.querySelectorAll('.req-error').forEach(function (n) { n.remove(); }); form.querySelectorAll('.has-error').forEach(function (n) { n.classList.remove('has-error'); }); }
  function message(text) { var m = $('pf-msg'); m.textContent = text; m.classList.add('show'); clearTimeout(message.t); message.t = setTimeout(function () { m.classList.remove('show'); }, 3500); }
  function setEditing(on) {
    form.classList.toggle('editing', on);
    Object.keys(F).forEach(function (k) { F[k].disabled = !on; F[k].placeholder = on ? (F[k].getAttribute('data-ph') || '') : 'Not added yet'; });
    $('pf-edit').style.display = on ? 'none' : '';
    if (on) F.name.focus();
  }

  var RULES = [
    ['name', function (v) { return v.trim().length >= 3 ? '' : 'Enter your full name (at least 3 letters)'; }],
    ['phone', function (v) { return /^07[789]\d{7}$/.test(v.replace(/[\s-]/g, '')) ? '' : 'Enter a valid Jordanian mobile number (07XXXXXXXX)'; }],
    ['email', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address'; }],
    ['city', function (v) { return v ? '' : 'Choose your governorate / city'; }]
  ];
  function validate() {
    clearErrors(); var first = null;
    RULES.forEach(function (r) {
      var el = F[r[0]], msg = r[1](el.value); if (!msg) return;
      el.classList.add('has-error');
      var p = document.createElement('p'); p.className = 'req-error'; p.setAttribute('role', 'alert'); p.textContent = msg; el.parentNode.appendChild(p);
      if (!first) first = el;
    });
    if (first) first.focus();
    return !first;
  }

  $('pf-edit').addEventListener('click', function () { clearErrors(); setEditing(true); });
  $('pf-cancel').addEventListener('click', function () { clearErrors(); data = load(); fill(); setEditing(false); });
  form.addEventListener('input', function (e) { if (e.target.classList.contains('has-error')) { e.target.classList.remove('has-error'); var n = e.target.parentNode.querySelector('.req-error'); if (n) n.remove(); } });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); if (!validate()) return;
    var next = { name: F.name.value.trim(), phone: F.phone.value.replace(/[\s-]/g, ''), email: F.email.value.trim(), city: F.city.value, area: F.area.value.trim() };
    var changed = Object.keys(next).some(function (k) { return next[k] !== data[k]; });
    if (changed) {
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
        localStorage.setItem('shamstech_user_name', next.name); localStorage.setItem('shamstech_client_name', next.name);   // the rest of the site reads these
        localStorage.setItem('shamstech_user_email', next.email); localStorage.setItem('shamstech_user_phone', next.phone); localStorage.setItem('shamstech_user_city', next.city);
      } catch (err) { message('Could not save. Browser storage is full or blocked.'); return; }
      data = next; fill();
      var nn = $('nav-user-name'), na = $('nav-user-avatar'); if (nn) nn.textContent = next.name; if (na) na.textContent = next.name.charAt(0).toUpperCase();
    }
    setEditing(false); message(changed ? '✓ Your changes were saved.' : 'No changes to save.');
  });

  fill(); setEditing(false);
});
