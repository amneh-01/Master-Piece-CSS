/* =====================================================
   SHAMSTECH JO - CLIENT HOME PAGE JS (js/client_home.js)
   1. Displays the logged-in client's name in the navbar and welcome card.
   2. Opens/closes the client dropdown menu (Settings, Available Services, Log Out).
   3. Controls the Used Marketplace slider arrows and mobile menu.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // Load user name from localStorage if available
  const savedName = localStorage.getItem('shamstech_user_name') || 'Ahmad Ali';
  const navUserName = document.getElementById('nav-user-name');
  const navUserAvatar = document.getElementById('nav-user-avatar');
  const welcomeUserName = document.getElementById('welcome-user-name');

  if (navUserName) navUserName.textContent = savedName;
  if (navUserAvatar) navUserAvatar.textContent = savedName.charAt(0).toUpperCase();
  if (welcomeUserName) welcomeUserName.textContent = savedName.split(' ')[0];

  // Toggle Client Profile Dropdown (Settings, Available Services, Log Out)
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

  // Mobile menu toggle
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      menuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  // Marketplace slider arrows
  const track = document.getElementById('client-track');
  const prev = document.getElementById('client-prev');
  const next = document.getElementById('client-next');
  if (track && prev && next) {
    prev.addEventListener('click', function () {
      track.scrollBy({ left: -340, behavior: 'smooth' });
    });
    next.addEventListener('click', function () {
      track.scrollBy({ left: 340, behavior: 'smooth' });
    });
  }
});
