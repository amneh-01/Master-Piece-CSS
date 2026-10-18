/* =====================================================
   SHAMSTECH JO - BROWSE-ONLY MARKETPLACE JS (js/browse_market.js)
   Explanation of what was done in this file:
   1. Initializes the global Dark / Light Mode toggle in the navbar
      and persists the theme across all pages via localStorage.
   2. Filters the read-only equipment cards live by search keyword
      and category pill (All, Solar Panels, Inverters, Batteries, Rails).
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Mobile Menu Toggle
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      menuBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  // 2. Search & Category Filter for Browse-Only Equipment Cards
  const searchInput = document.getElementById('browse-search-input');
  const catBtns = document.querySelectorAll('.browse-cat-btn');
  const cards = document.querySelectorAll('.browse-card');
  let activeCat = 'all';

  function filterCatalog() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      const cat = card.getAttribute('data-category');
      const text = card.textContent.toLowerCase();
      const matchesCat = activeCat === 'all' || cat === activeCat;
      const matchesQuery = !query || text.indexOf(query) !== -1;
      card.style.display = matchesCat && matchesQuery ? 'flex' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCatalog);
  }

  catBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      catBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-cat') || 'all';
      filterCatalog();
    });
  });
});
