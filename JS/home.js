/* =====================================================
   SHAMSTECH JO - HOME PAGE JS (js/home.js)
   1 Navbar  2 Mobile menu  3 Scroll reveal  4 Count-up numbers
   5 Hero sun follows the mouse  6 Hero scroll effect
   7 Services accordion  8 Marketplace arrows
   ===================================================== */

/* ---------- 1. Navbar gets a dark glass background after 40px of scrolling ---------- */
const navbar = document.getElementById('navbar');
function onScroll() {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);
  heroScroll();
}

/* ---------- 2. Mobile menu: open/close with the button, close when a link is clicked ---------- */
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', function () {
    menuBtn.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      menuBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
    });
  });
}

/* ---------- 3. Scroll reveal: elements with class "reveal" fade up when you reach them ---------- */
const revealObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const stagger = parseFloat(el.dataset.stagger || 0);
    if (stagger) {
      Array.from(el.children).forEach(function (child, i) {
        child.style.transition = 'opacity .9s cubic-bezier(.215,.61,.355,1) ' + i * stagger + 's, transform .9s cubic-bezier(.215,.61,.355,1) ' + i * stagger + 's';
        child.style.opacity = 0; child.style.transform = 'translateY(36px)';
        requestAnimationFrame(function () { child.style.opacity = 1; child.style.transform = 'none'; });
      });
      el.style.transition = 'none'; el.style.opacity = 1; el.style.transform = 'none';
    }
    el.classList.add('in');
    revealObserver.unobserve(el);
  });
}, { rootMargin: '0px 0px -14% 0px' });
document.querySelectorAll('.reveal').forEach(function (el) {
  if (el.dataset.stagger) Array.from(el.children).forEach(function (c) { c.style.opacity = 0; });
  revealObserver.observe(el);
});

/* ---------- 4. Numbers count up from 0 when they appear ---------- */
const countObserver = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (!entry.isIntersecting) return;
    const node = entry.target;
    const target = parseFloat(node.dataset.count);
    const decimals = parseInt(node.dataset.decimals || 0, 10);
    const start = performance.now();
    (function step(now) {
      const t = Math.min((now - start) / 1800, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      node.textContent = (target * eased).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      if (t < 1) requestAnimationFrame(step);
    })(start);
    countObserver.unobserve(node);
  });
}, { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('[data-count]').forEach(function (n) { countObserver.observe(n); });

/* ---------- 5. The hero sun drifts slowly toward the mouse ---------- */
const hero = document.getElementById('home');
const sun = document.getElementById('sun');
let targetX = 0, targetY = 0, sunX = 0, sunY = 0;
if (hero && sun) {
  hero.addEventListener('pointermove', function (e) {
    const r = hero.getBoundingClientRect();
    targetX = ((e.clientX - r.left) / r.width - 0.5) * 70;
    targetY = ((e.clientY - r.top) / r.height - 0.5) * 50;
  });
  (function glide() {
    sunX += (targetX - sunX) * 0.06;
    sunY += (targetY - sunY) * 0.06;
    sun.style.transform = 'translate(' + sunX + 'px,' + sunY + 'px)';
    requestAnimationFrame(glide);
  })();
}

/* ---------- 6. Scrolling past the hero: text rises and fades, light field moves down ---------- */
const heroContent = document.getElementById('hero-content');
const heroLight = document.getElementById('hero-light');
function heroScroll() {
  if (!hero || !heroContent || !heroLight) return;
  const p = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
  heroContent.style.transform = 'translateY(' + (-18 * p) + '%)';
  heroContent.style.opacity = 1 - 0.75 * p;
  heroLight.style.transform = 'translateY(' + (30 * p) + '%)';
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- 7. Services: click a title to open it and change the picture (or navigate to service page if already open / clicking preview) ---------- */
const items = document.querySelectorAll('.acc-item');
const images = document.querySelectorAll('.preview img');
const previewTitle = document.getElementById('preview-title');
const previewCount = document.getElementById('preview-count');
const previewBox = document.getElementById('service-preview-box');
let currentServiceHref = 'request_solar.html';

items.forEach(function (item, index) {
  const href = item.getAttribute('data-href');
  item.querySelector('.acc-btn').addEventListener('click', function () {
    if (item.classList.contains('open') && href) {
      window.location.href = href;
      return;
    }
    items.forEach(function (x) { x.classList.remove('open'); });
    item.classList.add('open');
    if (href) currentServiceHref = href;
    images.forEach(function (img, i) { img.classList.toggle('on', i === index); });
    if (previewTitle) previewTitle.textContent = item.querySelector('.acc-title').textContent;
    if (previewCount) previewCount.textContent = '0' + (index + 1) + ' / 0' + items.length;
  });
});

if (previewBox) {
  previewBox.addEventListener('click', function () {
    if (currentServiceHref) window.location.href = currentServiceHref;
  });
}

/* ---------- 8. Marketplace: arrow buttons slide the row ---------- */
const track = document.getElementById('track');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
if (track && prevBtn && nextBtn) {
  prevBtn.addEventListener('click', function () { track.scrollBy({ left: -420, behavior: 'smooth' }); });
  nextBtn.addEventListener('click', function () { track.scrollBy({ left: 420, behavior: 'smooth' }); });
}


/* ---------- 9. Hero animation: 4 scenes play one after another and loop ---------- */
const stage = document.getElementById('nx-stage');
if (stage) {
  const scenes = stage.querySelectorAll('.nx-scene');
  const steps = stage.querySelectorAll('.nx-step');
  const caption = document.getElementById('nx-caption');
  const captions = [
    'Post your request in under a minute',
    'Certified companies are notified instantly',
    'Compare competing offers side by side',
    'Pick the best, then follow it all in one place'
  ];
  let current = -1;
  let timer;

  // a number counts from -> to (used for the offer price and the live kW)
  function countTo(el, sceneIndex) {
    const from = parseFloat(el.dataset.from);
    const to = parseFloat(el.dataset.to);
    const dec = parseInt(el.dataset.dec || 0, 10);
    const format = function (n) { return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    el.textContent = format(from);
    setTimeout(function () {
      const start = performance.now();
      (function step(now) {
        const t = Math.min((now - start) / parseFloat(el.dataset.dur), 1);
        el.textContent = format(from + (to - from) * (1 - Math.pow(1 - t, 3)));
        if (t < 1 && current === sceneIndex) requestAnimationFrame(step);
      })(start);
    }, parseFloat(el.dataset.delay));
  }

  function show(i) {
    current = i;
    scenes.forEach(function (s, n) {
      if (n === i) {
        s.classList.remove('active', 'leaving');
        void s.offsetWidth;                       // restart the scene's animations
        s.classList.add('active');
      } else if (s.classList.contains('active')) {
        s.classList.remove('active');
        s.classList.add('leaving');               // fade out, then hide
        setTimeout(function () { s.classList.remove('leaving'); }, 400);
      }
    });
    steps.forEach(function (s, n) {
      s.classList.toggle('done', n < i);
      s.classList.toggle('on', n === i);
    });
    caption.textContent = captions[i];
    caption.classList.remove('in'); void caption.offsetWidth; caption.classList.add('in');
    scenes[i].querySelectorAll('.nx-num').forEach(function (el) { countTo(el, i); });
  }

  function next() {
    show((current + 1) % scenes.length);
    timer = setTimeout(next, 5000);
  }

  // click a step to jump to it
  steps.forEach(function (btn, n) {
    btn.addEventListener('click', function () {
      clearTimeout(timer);
      show(n);
      timer = setTimeout(next, 5000);
    });
  });

  // the card tilts toward the mouse
  if (hero) {
    hero.addEventListener('pointermove', function (e) {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stage.style.transform = 'perspective(1000px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 8) + 'deg)';
    });
    hero.addEventListener('pointerleave', function () { stage.style.transform = ''; });
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { show(2); } else { next(); }
}
