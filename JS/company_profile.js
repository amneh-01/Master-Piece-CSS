document.addEventListener('DOMContentLoaded', function () {
  if (localStorage.getItem('shamstech_user_role') !== 'company') {
    window.location.replace('/html/login.html?role=company');
    return;
  }
  var $ = function (id) { return document.getElementById(id); };
  var form = $('pf-form');
  var fields = { name: $('pf-name'), registration: $('pf-reg'), email: $('pf-email'), phone: $('pf-phone'), city: $('pf-city') };
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem('shamstech_company_profile')) || {}; } catch (e) {}
  var data = {
    name: saved.name || localStorage.getItem('shamstech_company_name') || localStorage.getItem('shamstech_user_name') || 'Company',
    registration: saved.registration || '', email: saved.email || '', phone: saved.phone || '',
    city: saved.city || localStorage.getItem('shamstech_user_city') || 'Amman', licenseName: saved.licenseName || ''
  };
  function initials(name) { return name.trim().split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0); }).join('').toUpperCase() || 'CO'; }
  function fill() {
    Object.keys(fields).forEach(function (key) { fields[key].value = data[key] || ''; });
    $('pf-avatar').textContent = initials(data.name); $('pf-title').textContent = data.name || 'Company';
    $('pf-s-phone').textContent = data.phone || 'Not added yet'; $('pf-s-email').textContent = data.email || 'Not added yet'; $('pf-s-addr').textContent = data.city || 'Not added yet';
    $('pf-license').textContent = data.licenseName || 'No file recorded';
    $('nav-comp-name').textContent = data.name; $('nav-comp-avatar').textContent = initials(data.name);
  }
  function message(text) {
    var box = $('pf-msg'); box.textContent = text; box.classList.add('show');
    clearTimeout(message.timer); message.timer = setTimeout(function () { box.classList.remove('show'); }, 3500);
  }
  function clearErrors() {
    form.querySelectorAll('.req-error').forEach(function (node) { node.remove(); });
    form.querySelectorAll('.has-error').forEach(function (node) { node.classList.remove('has-error'); });
  }
  function setEditing(on) {
    form.classList.toggle('editing', on);
    Object.keys(fields).forEach(function (key) { fields[key].disabled = !on; });
    $('pf-edit').style.display = on ? 'none' : '';
    if (on) fields.name.focus();
  }
  function validate() {
    clearErrors(); var first = null;
    var checks = [
      ['name', function (v) { return v.trim().length >= 2 ? '' : 'Enter the company name.'; }],
      ['registration', function (v) { return v.trim() ? '' : 'Enter the commercial registration number.'; }],
      ['email', function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid company email.'; }],
      ['phone', function (v) { return /^07[789]\d{7}$/.test(v.replace(/[\s-]/g, '')) ? '' : 'Enter a valid Jordanian mobile number (07XXXXXXXX).'; }]
    ];
    checks.forEach(function (check) {
      var field = fields[check[0]], error = check[1](field.value);
      if (!error) return;
      field.classList.add('has-error'); var note = document.createElement('p'); note.className = 'req-error'; note.setAttribute('role', 'alert'); note.textContent = error; field.parentNode.appendChild(note);
      if (!first) first = field;
    });
    if (first) first.focus();
    return !first;
  }
  $('pf-edit').addEventListener('click', function () { clearErrors(); setEditing(true); });
  $('pf-cancel').addEventListener('click', function () { clearErrors(); try { saved = JSON.parse(localStorage.getItem('shamstech_company_profile')) || {}; } catch (e) { saved = {}; } data = { name: saved.name || localStorage.getItem('shamstech_company_name') || 'Company', registration: saved.registration || '', email: saved.email || '', phone: saved.phone || '', city: saved.city || localStorage.getItem('shamstech_user_city') || 'Amman', licenseName: saved.licenseName || '' }; fill(); setEditing(false); });
  form.addEventListener('input', function (event) { if (event.target.classList.contains('has-error')) { event.target.classList.remove('has-error'); var note = event.target.parentNode.querySelector('.req-error'); if (note) note.remove(); } });
  form.addEventListener('submit', function (event) {
    event.preventDefault(); if (!validate()) return;
    var next = { name: fields.name.value.trim(), registration: fields.registration.value.trim(), email: fields.email.value.trim(), phone: fields.phone.value.replace(/[\s-]/g, ''), city: fields.city.value, licenseName: data.licenseName };
    try {
      localStorage.setItem('shamstech_company_profile', JSON.stringify(next));
      localStorage.setItem('shamstech_company_name', next.name); localStorage.setItem('shamstech_user_name', next.name); localStorage.setItem('shamstech_user_city', next.city);
    } catch (error) { message('Could not save. Browser storage is full or blocked.'); return; }
    data = next; fill(); setEditing(false); message('Your company profile changes were saved.');
  });
  var menu = $('client-menu-wrap');
  $('client-name-btn').addEventListener('click', function (event) { event.stopPropagation(); menu.classList.toggle('open'); });
  document.addEventListener('click', function (event) { if (!menu.contains(event.target)) menu.classList.remove('open'); });
  var menuBtn = $('menu-btn'), mobileMenu = $('mobile-menu');
  menuBtn.addEventListener('click', function () { menuBtn.classList.toggle('open'); mobileMenu.classList.toggle('open'); });
  function logout() { localStorage.removeItem('shamstech_user_role'); window.location.href = '/html/login.html?role=company'; }
  $('company-logout-btn').addEventListener('click', logout); $('mobile-logout-btn').addEventListener('click', function (event) { event.preventDefault(); logout(); });
  fill(); setEditing(false);
});
