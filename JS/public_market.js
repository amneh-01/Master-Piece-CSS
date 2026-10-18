/* =====================================================
   SHAMSTECH JO - PUBLIC BROWSE-ONLY MARKETPLACE JS
   File: js/public_market.js
   Explanation of what was done in this file:
   1. Initializes the persistent Dark / Light Mode toggle in the
      navbar across pages using localStorage ('shamstech_theme').
   2. Filters the browse-only solar equipment cards by category
      (All, Solar Panels, Inverters, Storage Batteries, Rails)
      and live search text.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Dark / Light Mode Toggle in Navbar
  const themeBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-toggle-icon');
  const themeLabel = document.getElementById('theme-toggle-label');

  function applyTheme(isDark) {
    document.documentElement.classList.toggle('dark-mode', isDark);
    if (themeIcon) themeIcon.setAttribute('href', isDark ? '#i-sun' : '#i-moon');
    if (themeLabel) themeLabel.textContent = isDark ? 'Light' : 'Dark';
  }

  let isDarkMode = localStorage.getItem('shamstech_theme') === 'dark';
  applyTheme(isDarkMode);

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      isDarkMode = !isDarkMode;
      localStorage.setItem('shamstech_theme', isDarkMode ? 'dark' : 'light');
      applyTheme(isDarkMode);
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

  // 2. Category & Search Filtering for Browse-Only Equipment Cards
  const searchInput = document.getElementById('browse-search-input');
  const catBtns = document.querySelectorAll('.browse-cat-btn');
  const cards = document.querySelectorAll('.browse-card');
  let activeCat = 'all';

  function filterCatalog() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      const cardCat = card.getAttribute('data-category');
      const matchesCat = activeCat === 'all' || cardCat === activeCat;
      const matchesText = !query || card.textContent.toLowerCase().indexOf(query) !== -1;
      card.style.display = matchesCat && matchesText ? 'flex' : 'none';
    });
  }

  catBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      catBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-cat') || 'all';
      filterCatalog();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', filterCatalog);
  }
});
