/* =====================================================
   SHAMSTECH JO - MAINTENANCE & CLEANING JS (js/maintenance_cleaning.js)
   1. Loads client name & controls the navbar user dropdown menu.
   2. Switches Required Service Type (Panel Washing & Cleaning,
      Electrical & Inverter Check, Full Maintenance + Wash).
   3. Submits the booking, saves it to 'shamstech_user_requests'
      so it appears on the User's Requests screen (my_requests.html
      and client_home.html), and redirects to my_requests.html.
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

  // 2. Required Service Type Switcher
  const sysBtns = document.querySelectorAll('.sys-type-btn');
  const sysInput = document.getElementById('selected-maint-type');

  sysBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      sysBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (sysInput) {
        sysInput.value = btn.getAttribute('data-type') || 'Panel Washing & Cleaning';
      }
    });
  });

  // 3. Submit Maintenance Booking -> Save to 'shamstech_user_requests' & Open Confirmation Modal
  const maintForm = document.getElementById('maintenance-booking-form');
  const confirmBackdrop = document.getElementById('service-confirm-backdrop');
  const scMaintId = document.getElementById('sc-maint-id');
  const scMaintType = document.getElementById('sc-maint-type');
  const scMaintSlot = document.getElementById('sc-maint-slot');

  if (maintForm) {
    maintForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const serviceType = sysInput ? sysInput.value : 'Panel Washing & Cleaning';
      const panelsEl = document.getElementById('maint-panels');
      const dateEl = document.getElementById('maint-datetime');
      const phoneEl = document.getElementById('maint-phone');

      const panels = panelsEl && panelsEl.value.trim() ? panelsEl.value.trim() : '12 Panels';
      const rawDate = dateEl && dateEl.value ? dateEl.value.replace('T', ' ') : 'Next Available Slot';
      const phone = phoneEl && phoneEl.value.trim() ? phoneEl.value.trim() : '079XXXXXXX';
      const reqId = '#MNT-2026-' + Math.floor(1100 + Math.random() * 8800);

      const newMaintRequest = {
        id: reqId,
        title: serviceType + ' (' + panels + ')',
        meta: 'ID: ' + reqId + ' • Service: Maintenance & Cleaning • Oct 11, 2026',
        category: 'bids',
        badgeText: '● Open for Proposals',
        icon: '#i-wrench',
        metric1Label: 'SERVICE TYPE',
        metric1Value: serviceType,
        metric2Label: 'NUMBER OF PANELS',
        metric2Value: panels,
        metric3Label: 'APPOINTMENT & PHONE',
        metric3Value: rawDate + ' (' + phone + ')',
        client: (localStorage.getItem('shamstech_user_role') === 'client' ? localStorage.getItem('shamstech_user_name') : '') || localStorage.getItem('shamstech_client_name') || 'Dr. Khaled Al-Momani',
        statusNote: '⚡ <strong>Status:</strong> Maintenance & cleaning request submitted for ' + rawDate + '. Review proposals or confirm contractor to begin execution.'
      };

      try {
        const raw = localStorage.getItem('shamstech_user_requests');
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(newMaintRequest);
        localStorage.setItem('shamstech_user_requests', JSON.stringify(list));
      } catch (err) {}

      if (scMaintId) scMaintId.textContent = reqId;
      if (scMaintType) scMaintType.textContent = serviceType;
      if (scMaintSlot) scMaintSlot.textContent = panels + ' • ' + rawDate;

      if (confirmBackdrop) {
        confirmBackdrop.classList.add('open');
        confirmBackdrop.setAttribute('aria-hidden', 'false');
      }
    });
  }
});
