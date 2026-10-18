/* =====================================================
   SHAMSTECH JO - MARKETPLACE ITEM DETAILS & UNLOCK CONTACT JS
   File: js/market_item.js
   Description:
   1. Loads the logged-in user's name and initializes the navbar
      user dropdown (User's Home Page, Settings, Services, Log Out).
   2. Reads the `?item=` URL query parameter + any saved edits from
      localStorage ('shamstech_market_overrides') and populates:
      - Usage Period (Less than 3 Months | 6 Months | 1 Year | More than 2 Years)
      - Condition (Like New | Excellent | Good)
      - Warranty (Has Official Warranty | No Warranty)
      - Product Title, Price, Location, Technical Details, and
        Encrypted Seller Contact Card (+962 79 *** **** / HIDDEN).
   3. Handles thumbnail switching in the photo gallery.
   4. Opens the "Unlock Seller Contact Info" payment modal when
      clicking "Unlock Seller Contact", "Contact Seller Directly",
      or the encrypted phone box.
   5. Processes payment and reveals the seller's real phone number
      and WhatsApp link on the page.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Navbar User Name & Dropdown Menu
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

  // 2. Catalog of Used Marketplace Items with Usage Period, Condition & Warranty
  const ITEMS_CATALOG = {
    'jinko-550w': {
      title: 'Jinko Solar 550W Mono-PERC Panels (Set of 10)',
      shortItem: 'Jinko Solar 550W Panels (x10)',
      priceCaption: 'TOTAL PRICE FOR ALL 10 PANELS',
      price: 200,
      unlockFee: '2.50',
      usage: '1 Year',
      condition: 'Excellent',
      warranty: 'Has Official Warranty',
      badge: 'Excellent · 1 Year',
      location: 'Irbid, Jordan',
      brand: 'Clean surface, zero micro-cracks',
      status: '98% Tested',
      accessories: 'Original MC4 Cables + Aluminum Rails',
      desc: 'Upgrading to Commercial 1MW System',
      image: '/images/panel.jpg',
      seller: 'Ahmad (Private Seller)',
      sellerShort: 'Ahmad (Irbid)',
      sellerAvatar: 'A',
      sellerSub: '✓ Identity Verified by ShamsTech',
      maskedPhone: '+962 79 *** ****',
      realPhone: '+962 79 542 8810',
      cleanPhone: '962795428810'
    },
    'felicity-10kwh': {
      title: 'Felicity Lithium Battery 10kWh (LiFePO4)',
      shortItem: 'Felicity Lithium Battery 10kWh',
      priceCaption: 'TOTAL PRICE FOR STORAGE UNIT',
      price: 100,
      unlockFee: '2.50',
      usage: '6 Months',
      condition: 'Like New',
      warranty: 'Has Official Warranty',
      badge: 'Like New · 6 Months',
      location: 'Amman, Jordan',
      brand: 'Grade A enclosure, zero swelling',
      status: '96% Cycle Life Verified',
      accessories: 'Wall Bracket + BMS Communication Cable',
      desc: 'Upgrading storage bank to 20kWh rack',
      image: '/images/battery.jpg',
      seller: 'Tareq Al-Nasser (Private Seller)',
      sellerShort: 'Tareq Al-Nasser (Amman)',
      sellerAvatar: 'T',
      sellerSub: '✓ Identity Verified by ShamsTech',
      maskedPhone: '+962 79 *** ****',
      realPhone: '+962 79 618 4420',
      cleanPhone: '962796184420'
    },
    'longi-450w': {
      title: 'Longi Solar 450W Half-Cell Panels (Set of 4)',
      shortItem: 'Longi Solar 450W Panels (x4)',
      priceCaption: 'TOTAL PRICE FOR ALL 4 PANELS',
      price: 130,
      unlockFee: '2.50',
      usage: 'More than 2 Years',
      condition: 'Good',
      warranty: 'Has Official Warranty',
      badge: 'Good · More than 2 Years',
      location: 'Irbid, Jordan',
      brand: 'Anodized frame, glass 100% intact',
      status: '94% Tested',
      accessories: 'Aluminum Mounting Rails & Mid Clamps',
      desc: 'Replaced with higher-wattage 600W panels',
      image: '/images/racks.jpg',
      seller: 'Sami Obeidat (Private Seller)',
      sellerShort: 'Sami Obeidat (Irbid)',
      sellerAvatar: 'S',
      sellerSub: '✓ Identity Verified by ShamsTech',
      maskedPhone: '+962 78 *** ****',
      realPhone: '+962 78 831 2095',
      cleanPhone: '962788312095'
    },
    'growatt-5kw': {
      title: 'Growatt 5kW On-Grid Solar Inverter',
      shortItem: 'Growatt 5kW On-Grid Inverter',
      priceCaption: 'TOTAL PRICE FOR INVERTER UNIT',
      price: 320,
      unlockFee: '2.50',
      usage: '6 Months',
      condition: 'Excellent',
      warranty: 'Has Official Warranty',
      badge: 'Excellent · 6 Months',
      location: 'Amman, Jordan',
      brand: 'Like-new casing & LCD screen',
      status: '99% Conversion Efficiency',
      accessories: 'ShineWiFi Dongle + Wall Mounting Plate',
      desc: 'Switched to Hybrid Battery System',
      image: '/images/inverter.jpg',
      seller: 'Future Sun Eng. (Verified Seller)',
      sellerShort: 'Future Sun Eng. (Amman)',
      sellerAvatar: 'F',
      sellerSub: '✓ Identity Verified by ShamsTech',
      maskedPhone: '+962 79 *** ****',
      realPhone: '+962 79 904 1175',
      cleanPhone: '962799041175'
    },
    'felicity-150ah': {
      title: 'Felicity 150Ah Deep-Cycle Tubular Battery',
      shortItem: 'Felicity 150Ah Tubular Battery',
      priceCaption: 'TOTAL PRICE FOR BATTERY UNIT',
      price: 350,
      unlockFee: '2.50',
      usage: '1 Year',
      condition: 'Good',
      warranty: 'No Warranty',
      badge: 'Good · 1 Year',
      location: 'Zarqa, Jordan',
      brand: 'Terminals clean, holds full voltage',
      status: '100% Load Test Passed',
      accessories: 'Copper Interconnect Cables Included',
      desc: 'Connected property to 3-phase main grid',
      image: '/images/battery.jpg',
      seller: 'Khaled Al-Zoubi (Private Seller)',
      sellerShort: 'Khaled Al-Zoubi (Zarqa)',
      sellerAvatar: 'K',
      sellerSub: '✓ Identity Verified by ShamsTech',
      maskedPhone: '+962 77 *** ****',
      realPhone: '+962 77 519 3380',
      cleanPhone: '962775193380'
    },
    'jinko-540w': {
      title: 'Jinko 540W Mono-PERC Panel (Brand New)',
      shortItem: 'Jinko 540W Panel (Brand New)',
      priceCaption: 'TOTAL PRICE PER PANEL',
      price: 100,
      unlockFee: '2.50',
      usage: 'Less than 3 Months',
      condition: 'Like New',
      warranty: 'Has Official Warranty',
      badge: 'Like New · Less than 3 Months',
      location: 'Mafraq, Jordan',
      brand: 'Factory sealed with corner protectors',
      status: '100% Factory Output',
      accessories: 'Factory pre-attached MC4 leads',
      desc: 'Surplus stock from agricultural solar project',
      image: '/images/panel.jpg',
      seller: 'Al-Badiya Solar (Verified Supplier)',
      sellerShort: 'Al-Badiya Solar (Mafraq)',
      sellerAvatar: 'B',
      sellerSub: '✓ Identity Verified by ShamsTech',
      maskedPhone: '+962 79 *** ****',
      realPhone: '+962 79 772 6014',
      cleanPhone: '962797726014'
    },
    'deye-8kw': {
      title: 'Deye 8kW Hybrid Solar Inverter (Single Phase)',
      shortItem: 'Deye 8kW Hybrid Inverter',
      priceCaption: 'TOTAL PRICE FOR HYBRID INVERTER',
      price: 720,
      unlockFee: '2.50',
      usage: '6 Months',
      condition: 'Like New',
      warranty: 'Has Official Warranty',
      badge: 'Like New · 6 Months',
      location: 'Aqaba, Jordan',
      brand: 'Spotless touchscreen & cooling fans',
      status: '99% Tested under Full Load',
      accessories: 'CT Sensor, Wi-Fi Logger & Temp Probe',
      desc: 'Upgraded to 16kW 3-Phase Deye System',
      image: '/images/inverter.jpg',
      seller: 'Red Sea Energy (Private Seller)',
      sellerShort: 'Red Sea Energy (Aqaba)',
      sellerAvatar: 'R',
      sellerSub: '✓ Identity Verified by ShamsTech',
      maskedPhone: '+962 79 *** ****',
      realPhone: '+962 79 310 9942',
      cleanPhone: '962793109942'
    },
    'felicity-200ah': {
      title: 'Felicity 200Ah Solar Gel Battery (12V)',
      shortItem: 'Felicity 200Ah Gel Battery',
      priceCaption: 'TOTAL PRICE FOR GEL BATTERY',
      price: 180,
      unlockFee: '2.50',
      usage: '6 Months',
      condition: 'Excellent',
      warranty: 'No Warranty',
      badge: 'Excellent · 6 Months',
      location: 'Amman, Jordan',
      brand: 'Sealed maintenance-free casing',
      status: '93% Capacity Verified',
      accessories: 'Terminal Bolts & Protective Covers',
      desc: 'Upgraded to Lithium wall battery',
      image: '/images/battery.jpg',
      seller: 'Nabil Mansour (Private Seller)',
      sellerShort: 'Nabil Mansour (Amman)',
      sellerAvatar: 'N',
      sellerSub: '✓ Identity Verified by ShamsTech',
      maskedPhone: '+962 78 *** ****',
      realPhone: '+962 78 640 7129',
      cleanPhone: '962786407129'
    }
  };

  // Merge any edits or custom listings saved from used_market.html
  try {
    const rawOverrides = localStorage.getItem('shamstech_market_overrides');
    if (rawOverrides) {
      const overrides = JSON.parse(rawOverrides);
      Object.keys(overrides).forEach(function (k) {
        ITEMS_CATALOG[k] = Object.assign({}, ITEMS_CATALOG['jinko-550w'], ITEMS_CATALOG[k] || {}, overrides[k]);
      });
    }
  } catch (err) {
    // Ignore parse errors
  }

  const params = new URLSearchParams(window.location.search);
  const itemKey = params.get('item') || 'jinko-550w';
  const item = ITEMS_CATALOG[itemKey] || ITEMS_CATALOG['jinko-550w'];

  // Helper to update text content safely
  const setText = function (id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // Populate Product Details (including Usage Period, Condition, and Warranty) & Encrypted Contact Info
  setText('detail-title', item.title);
  setText('price-caption', item.priceCaption);
  setText('detail-price', item.price + ' JOD');
  setText('detail-badge', item.badge || (item.condition + ' · ' + item.usage));
  setText('spec-usage', item.usage || '1 Year');
  setText('spec-condition', item.condition || 'Excellent');
  setText('detail-warranty', item.warranty || 'Has Official Warranty');
  setText('spec-location', item.location);
  setText('spec-brand', item.brand);
  setText('spec-status', item.status);
  setText('spec-accessories', item.accessories);
  setText('detail-desc', item.desc);
  setText('seller-name', item.seller);
  setText('seller-avatar', item.sellerAvatar);
  setText('seller-sub', item.sellerSub);
  setText('masked-phone-number', item.maskedPhone);
  setText('unlock-btn-text', 'Unlock Seller Contact ( ' + item.unlockFee + ' JOD )');

  // Populate Modal Summary
  setText('modal-summary-title', item.shortItem);
  setText('modal-summary-seller', 'Seller: ' + item.sellerShort);
  setText('modal-summary-total', item.unlockFee + ' JOD');
  setText('confirm-pay-btn-label', 'Pay ' + item.unlockFee + ' JOD & Reveal Phone Number →');
  setText('modal-revealed-phone', item.realPhone);

  // Update Call & WhatsApp hrefs
  const directCallLink = document.getElementById('direct-call-link');
  const directWaLink = document.getElementById('direct-wa-link');
  const modalCallBtn = document.getElementById('modal-call-btn');
  if (directCallLink) directCallLink.href = 'tel:+' + item.cleanPhone;
  if (modalCallBtn) modalCallBtn.href = 'tel:+' + item.cleanPhone;
  if (directWaLink) {
    directWaLink.href =
      'https://wa.me/' +
      item.cleanPhone +
      '?text=' +
      encodeURIComponent('Hello, I unlocked your contact on ShamsTech Jo regarding: ' + item.title);
  }

  // Update main image & first thumbnail
  const mainImg = document.getElementById('detail-main-img');
  const thumb1 = document.getElementById('thumb-img-1');
  const thumbBtn1 = document.querySelector('.item-thumb-btn');
  if (mainImg) mainImg.src = item.image;
  if (thumb1) thumb1.src = item.image;
  if (thumbBtn1) thumbBtn1.setAttribute('data-src', item.image);

  // 3. Interactive Thumbnail Switcher
  const thumbBtns = document.querySelectorAll('.item-thumb-btn');
  thumbBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      thumbBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      const src = btn.getAttribute('data-src');
      if (mainImg && src) mainImg.src = src;
    });
  });

  // 4. Open / Close "Unlock Seller Contact Info" Payment Modal
  let isContactUnlocked = false;
  const modalBackdrop = document.getElementById('buy-modal-backdrop');
  const openModalBtn = document.getElementById('open-buy-modal-btn');
  const contactSellerBtn = document.getElementById('contact-seller-btn');
  const maskedPhoneBox = document.getElementById('masked-phone-box');
  const closeModalBtn = document.getElementById('close-buy-modal-btn');
  const doneUnlockBtn = document.getElementById('done-unlock-btn');

  function openUnlockModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }

  function closeUnlockModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }

  if (openModalBtn) {
    openModalBtn.addEventListener('click', openUnlockModal);
  }

  if (contactSellerBtn) {
    contactSellerBtn.addEventListener('click', function () {
      if (!isContactUnlocked) {
        openUnlockModal();
      } else {
        window.location.href = 'tel:+' + item.cleanPhone;
      }
    });
  }

  if (maskedPhoneBox) {
    maskedPhoneBox.style.cursor = 'pointer';
    maskedPhoneBox.addEventListener('click', function () {
      if (!isContactUnlocked) {
        openUnlockModal();
      }
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeUnlockModal);
  if (doneUnlockBtn) doneUnlockBtn.addEventListener('click', closeUnlockModal);

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) closeUnlockModal();
    });
  }

  // Automatically open Unlock Contact Modal if navigated with ?buy=1
  if (params.get('buy') === '1') {
    openUnlockModal();
  }

  // 5. Payment Method Radio Cards inside Modal (Card vs CliQ / Mobile Wallet)
  const methodCards = document.querySelectorAll('.unlock-method-card');
  const cardFieldsGroup = document.getElementById('card-fields-group');
  const cliqFieldsGroup = document.getElementById('cliq-fields-group');
  const cardNumInput = document.getElementById('card-num');
  const cardExpInput = document.getElementById('card-exp');
  const cardCvvInput = document.getElementById('card-cvv');
  const walletPhoneInput = document.getElementById('wallet-phone');

  methodCards.forEach(function (card) {
    card.addEventListener('click', function () {
      methodCards.forEach(function (c) { c.classList.remove('active'); });
      card.classList.add('active');
      const method = card.getAttribute('data-method');

      if (method === 'card') {
        if (cardFieldsGroup) cardFieldsGroup.style.display = 'grid';
        if (cliqFieldsGroup) cliqFieldsGroup.style.display = 'none';
        if (cardNumInput) cardNumInput.required = true;
        if (cardExpInput) cardExpInput.required = true;
        if (cardCvvInput) cardCvvInput.required = true;
        if (walletPhoneInput) walletPhoneInput.required = false;
      } else {
        if (cardFieldsGroup) cardFieldsGroup.style.display = 'none';
        if (cliqFieldsGroup) cliqFieldsGroup.style.display = 'grid';
        if (cardNumInput) cardNumInput.required = false;
        if (cardExpInput) cardExpInput.required = false;
        if (cardCvvInput) cardCvvInput.required = false;
        if (walletPhoneInput) walletPhoneInput.required = true;
      }
    });
  });

  // Format card number & expiry inputs nicely
  if (cardNumInput) {
    cardNumInput.addEventListener('input', function () {
      const digits = cardNumInput.value.replace(/\D/g, '').slice(0, 16);
      cardNumInput.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    });
  }
  if (cardExpInput) {
    cardExpInput.addEventListener('input', function () {
      const digits = cardExpInput.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length >= 3) {
        cardExpInput.value = digits.slice(0, 2) + ' / ' + digits.slice(2);
      } else {
        cardExpInput.value = digits;
      }
    });
  }

  // 6. Submit Payment & Decrypt/Reveal Seller Phone Number
  const checkoutForm = document.getElementById('checkout-payment-form');
  const successBox = document.getElementById('buy-success-box');
  const maskedPhoneNumberEl = document.getElementById('masked-phone-number');
  const maskedStatusBadge = document.getElementById('masked-status-badge');
  const unlockedDirectActions = document.getElementById('unlocked-direct-actions');
  const protectedCardTitle = document.getElementById('protected-card-title');
  const protectedCardSub = document.getElementById('protected-card-sub');

  if (checkoutForm && successBox) {
    checkoutForm.addEventListener('submit', function (e) {
      e.preventDefault();
      isContactUnlocked = true;

      // Show unlocked state inside modal
      checkoutForm.style.display = 'none';
      successBox.classList.add('show');

      // Decrypt & reveal the phone number on the item page immediately
      if (maskedPhoneNumberEl) maskedPhoneNumberEl.textContent = item.realPhone;
      if (maskedPhoneBox) maskedPhoneBox.classList.add('unlocked');
      if (maskedStatusBadge) {
        maskedStatusBadge.textContent = 'UNLOCKED ✓';
        maskedStatusBadge.classList.add('unlocked');
      }
      if (protectedCardTitle) protectedCardTitle.textContent = 'Unlocked Seller Contact Info';
      if (protectedCardSub) protectedCardSub.textContent = 'Payment verified — You can now call or message the seller directly';
      if (openModalBtn) openModalBtn.style.display = 'none';
      if (contactSellerBtn) contactSellerBtn.style.display = 'none';
      if (unlockedDirectActions) unlockedDirectActions.classList.add('show');
    });
  }
});
