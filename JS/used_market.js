/* =====================================================
   SHAMSTECH JO - USED MARKETPLACE JS (js/used_market.js)
   Explanation of what was done in this file:
   1. Loads client name & controls the navbar user dropdown menu
      (including links to Market History & Requests History).
   2. Renders any custom items added by the user from localStorage
      ('shamstech_user_market_items') so newly added items stay on the
      page with all entered details.
   3. Handles the three user item action buttons on the user's offered
      items (#user-offered-grid):
      - "Edit": Opens the Edit Equipment Listing Modal pre-populated
        with the item's current info (including Usage Period, Condition,
        and Warranty) so the user can modify and save it.
      - "Sold" & "Delete": Opens a Confirmation Modal asking the user if
        they are sure, and once confirmed, stores the item (with all its
        details and SOLD / DELETED status) in 'shamstech_market_history'
        so it appears on the Market History page (html/market_history.html).
   4. Persists newly added items and edits in localStorage so opening
      any product in html/market_item.html displays the exact updated
      information.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  // 1. Navbar Client Name & Dropdown Menu
  const savedName = localStorage.getItem('shamstech_user_name') || 'Ahmad Ali';
  const navUserName = document.getElementById('nav-user-name');
  const navUserAvatar = document.getElementById('nav-user-avatar');
  if (navUserName) navUserName.textContent = savedName;
  if (navUserAvatar) navUserAvatar.textContent = savedName.charAt(0).toUpperCase();

  // Also display the logged-in user's first name on their offered items section
  const firstName = savedName.split(' ')[0] || 'Ahmed';
  document.querySelectorAll('.seller-user-name').forEach(function (el) {
    el.textContent = firstName;
  });

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

  // Helper: Show action toast on Used Market page
  const marketActionToast = document.getElementById('market-action-toast');
  function showMarketToast(msg) {
    if (!marketActionToast) return;
    marketActionToast.textContent = msg;
    marketActionToast.classList.add('show');
    setTimeout(function () {
      marketActionToast.classList.remove('show');
    }, 4200);
  }

  // Helper: Get & Save Marketplace Item Overrides in localStorage (for market_item.html)
  function getMarketOverrides() {
    try {
      const raw = localStorage.getItem('shamstech_market_overrides');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveMarketOverride(itemId, data) {
    try {
      const overrides = getMarketOverrides();
      overrides[itemId] = Object.assign({}, overrides[itemId] || {}, data);
      localStorage.setItem('shamstech_market_overrides', JSON.stringify(overrides));
    } catch (e) {
      // ignore storage quota errors
    }
  }

  // Helpers: User-Added Active Market Items & Market History (Sold / Deleted)
  function getUserAddedItems() {
    try {
      const raw = localStorage.getItem('shamstech_user_market_items');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveUserAddedItems(items) {
    try {
      localStorage.setItem('shamstech_user_market_items', JSON.stringify(items));
    } catch (e) {}
  }

  function getArchivedMarketIds() {
    try {
      const raw = localStorage.getItem('shamstech_archived_market_ids');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveArchivedMarketIds(ids) {
    try {
      localStorage.setItem('shamstech_archived_market_ids', JSON.stringify(ids));
    } catch (e) {}
  }

  function getMarketHistory() {
    try {
      const raw = localStorage.getItem('shamstech_market_history');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function addItemToMarketHistory(itemRecord) {
    try {
      const history = getMarketHistory();
      // Remove duplicate id if already present
      const filtered = history.filter(function (h) { return h.id !== itemRecord.id; });
      filtered.unshift(itemRecord);
      localStorage.setItem('shamstech_market_history', JSON.stringify(filtered));
    } catch (e) {}
  }

  const userOfferedGrid = document.getElementById('user-offered-grid');

  // Helper to build a user-offered card element
  function createOfferedCardElement(itemData) {
    const card = document.createElement('article');
    card.className = 'featured-deal-card';
    card.setAttribute('data-id', itemData.id);
    card.setAttribute('data-title', itemData.title);
    card.setAttribute('data-city', itemData.city);
    card.setAttribute('data-phone', itemData.phone);
    card.setAttribute('data-price', itemData.price);
    card.setAttribute('data-usage', itemData.usage);
    card.setAttribute('data-condition', itemData.condition);
    card.setAttribute('data-warranty', itemData.warranty);
    card.setAttribute('data-description', itemData.description);
    card.setAttribute('data-img', itemData.img);
    card.setAttribute('data-status', 'active');

    const itemUrl = '/html/market_item.html?item=' + encodeURIComponent(itemData.id);

    card.innerHTML =
      '<a href="' + itemUrl + '" class="featured-deal-img deal-card-link">' +
        '<img src="' + itemData.img + '" alt="' + itemData.title + '" class="deal-card-img">' +
      '</a>' +
      '<div class="featured-deal-info">' +
        '<div>' +
          '<span class="browse-verified-tag deal-status-badge display" style="display:inline-block;margin-bottom:0.4rem;font-size:11.5px;">● Offered by You (<span class="seller-user-name">' + firstName + '</span>) · <span class="status-text">Active</span></span>' +
          '<h3 class="display deal-card-title" onclick="window.location.href=\'' + itemUrl + '\'">' + itemData.title + '</h3>' +
          '<p class="featured-deal-meta"><span class="deal-card-desc">Condition: ' + itemData.condition + ' · Usage: ' + itemData.usage + ' · ' + itemData.warranty + '</span> | <span class="deal-card-city">' + itemData.city + '</span></p>' +
          '<p class="featured-deal-price display"><span class="deal-card-price">' + itemData.price + '</span> JOD</p>' +
        '</div>' +
        '<div class="featured-deal-actions">' +
          '<button type="button" class="btn-user-action btn-item-edit display" data-action="edit">' +
            '<svg class="icon"><use href="#i-edit"/></svg>' +
            '<span>Edit</span>' +
          '</button>' +
          '<button type="button" class="btn-user-action btn-item-sold display" data-action="sold">' +
            '<svg class="icon"><use href="#i-check-circle"/></svg>' +
            '<span class="sold-btn-text">Sold</span>' +
          '</button>' +
          '<button type="button" class="btn-user-action btn-item-delete display" data-action="delete">' +
            '<svg class="icon"><use href="#i-trash"/></svg>' +
            '<span>Delete</span>' +
          '</button>' +
        '</div>' +
      '</div>';

    return card;
  }

  // Hide any default cards that were already moved to Market History (Sold or Deleted)
  const archivedIds = getArchivedMarketIds();
  document.querySelectorAll('#user-offered-grid .featured-deal-card').forEach(function (card) {
    const id = card.getAttribute('data-id');
    if (id && archivedIds.indexOf(id) !== -1) {
      card.remove();
    }
  });

  // Render any custom items added by the user from localStorage
  if (userOfferedGrid) {
    const savedCustomItems = getUserAddedItems();
    // Render in reverse so the newest is at the very top
    for (let i = savedCustomItems.length - 1; i >= 0; i--) {
      const item = savedCustomItems[i];
      if (archivedIds.indexOf(item.id) === -1) {
        const cardEl = createOfferedCardElement(item);
        userOfferedGrid.prepend(cardEl);
      }
    }
  }

  // Apply any previously saved edits to existing cards on the page
  const savedOverrides = getMarketOverrides();
  document.querySelectorAll('.featured-deal-card').forEach(function (card) {
    const itemId = card.getAttribute('data-id');
    if (itemId && savedOverrides[itemId]) {
      const ov = savedOverrides[itemId];
      if (ov.title) card.setAttribute('data-title', ov.title);
      if (ov.city) card.setAttribute('data-city', ov.city);
      if (ov.realPhone) card.setAttribute('data-phone', ov.realPhone);
      if (ov.price) card.setAttribute('data-price', String(ov.price));
      if (ov.usage) card.setAttribute('data-usage', ov.usage);
      if (ov.condition) card.setAttribute('data-condition', ov.condition);
      if (ov.warranty) card.setAttribute('data-warranty', ov.warranty);
      if (ov.desc) card.setAttribute('data-description', ov.desc);
      if (ov.image) card.setAttribute('data-img', ov.image);

      const titleEl = card.querySelector('.deal-card-title');
      const descEl = card.querySelector('.deal-card-desc');
      const cityEl = card.querySelector('.deal-card-city');
      const priceEl = card.querySelector('.deal-card-price');
      const imgEl = card.querySelector('.deal-card-img');

      if (titleEl && ov.title) titleEl.textContent = ov.title;
      if (descEl && ov.condition && ov.usage && ov.warranty) {
        descEl.textContent = 'Condition: ' + ov.condition + ' · Usage: ' + ov.usage + ' · ' + ov.warranty;
      }
      if (cityEl && ov.city) cityEl.textContent = ov.city;
      if (priceEl && ov.price) priceEl.textContent = ov.price;
      if (imgEl && ov.image) imgEl.src = ov.image;
    }
  });

  // =========================================================================
  // 2. EDIT, SOLD & DELETE MODALS FOR USER'S OFFERED ITEMS
  // =========================================================================
  const editModal = document.getElementById('edit-listing-modal');
  const closeEditModalBtn = document.getElementById('close-edit-modal');
  const editForm = document.getElementById('edit-listing-form');
  const editEquipType = document.getElementById('edit-equip-type');
  const editCity = document.getElementById('edit-city');
  const editPhone = document.getElementById('edit-phone');
  const editPrice = document.getElementById('edit-price');
  const editUsage = document.getElementById('edit-usage');
  const editCondition = document.getElementById('edit-condition');
  const editWarranty = document.getElementById('edit-warranty');
  const editDescription = document.getElementById('edit-description');
  const editPhotoInput = document.getElementById('edit-photo-input');
  const editPhotoLabel = document.getElementById('edit-photo-label');

  const confirmModal = document.getElementById('confirm-action-modal');
  const closeConfirmModalBtn = document.getElementById('close-confirm-modal');
  const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');
  const proceedConfirmBtn = document.getElementById('proceed-confirm-btn');
  const confirmModalTitle = document.getElementById('confirm-modal-title');
  const confirmModalMsg = document.getElementById('confirm-modal-msg');
  const confirmModalIconWrap = document.getElementById('confirm-modal-icon-wrap');
  const confirmModalIcon = document.getElementById('confirm-modal-icon');

  let activeCardForEdit = null;
  let activeCardForConfirm = null;
  let activeConfirmAction = null; // 'delete' | 'sold'
  const editPhotosGrid = document.getElementById('edit-photos-preview-grid');
  let editUploadedPhotos = []; // array of { id, url, name }

  function renderEditPhotosGrid() {
    if (!editPhotosGrid) return;
    if (editUploadedPhotos.length === 0) {
      editPhotosGrid.style.display = 'none';
      editPhotosGrid.innerHTML = '';
      if (editPhotoLabel) {
        editPhotoLabel.textContent = 'Upload Product Photos (You can add multiple photos)';
      }
      return;
    }

    editPhotosGrid.style.display = 'flex';
    editPhotosGrid.innerHTML = editUploadedPhotos.map(function (photo) {
      return (
        '<div class="sell-photo-thumb-card" data-photo-id="' + photo.id + '">' +
          '<img src="' + photo.url + '" alt="' + (photo.name || 'Equipment Photo') + '" class="sell-photo-thumb-img">' +
          '<button type="button" class="sell-photo-remove-btn" data-remove-edit-photo="' + photo.id + '" title="Remove Photo" aria-label="Remove Photo">✕</button>' +
        '</div>'
      );
    }).join('');

    if (editPhotoLabel) {
      editPhotoLabel.textContent = '+ Add More Photos (' + editUploadedPhotos.length + ' attached)';
    }
  }

  // Open Edit Modal & pre-populate with item's current info
  function openEditModal(card) {
    activeCardForEdit = card;

    const title = card.getAttribute('data-title') || '';
    const city = card.getAttribute('data-city') || '';
    const phone = card.getAttribute('data-phone') || '+962 79 582 4190';
    const price = card.getAttribute('data-price') || '';
    const usage = card.getAttribute('data-usage') || '1 Year';
    const condition = card.getAttribute('data-condition') || 'Excellent';
    const warranty = card.getAttribute('data-warranty') || 'Has Official Warranty';
    const desc = card.getAttribute('data-description') || '';
    const currentImg = card.getAttribute('data-img') || '/images/panel.jpg';

    if (editEquipType) editEquipType.value = title;
    if (editCity) editCity.value = city;
    if (editPhone) editPhone.value = phone;
    if (editPrice) editPrice.value = price;
    if (editUsage) editUsage.value = usage;
    if (editCondition) editCondition.value = condition;
    if (editWarranty) editWarranty.value = warranty;
    if (editDescription) editDescription.value = desc;
    if (editPhotoInput) editPhotoInput.value = '';

    editUploadedPhotos = [];
    if (currentImg) {
      editUploadedPhotos.push({
        id: 'existing_' + Date.now(),
        name: 'Current Photo',
        url: currentImg
      });
    }
    renderEditPhotosGrid();

    if (editModal) {
      editModal.classList.add('open');
      editModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeEditModal() {
    if (editModal) {
      editModal.classList.remove('open');
      editModal.setAttribute('aria-hidden', 'true');
    }
    activeCardForEdit = null;
    editUploadedPhotos = [];
  }

  if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener('click', closeEditModal);
  }
  if (editModal) {
    editModal.addEventListener('click', function (e) {
      if (e.target === editModal) closeEditModal();
    });
  }

  // Handle multi-photo upload inside Edit Modal
  if (editPhotoInput) {
    editPhotoInput.addEventListener('change', function (e) {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      let processed = 0;
      files.forEach(function (file) {
        if (!file.type.startsWith('image/')) {
          processed++;
          return;
        }
        const reader = new FileReader();
        reader.onload = function (ev) {
          editUploadedPhotos.push({
            id: 'photo_edit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            name: file.name,
            url: ev.target.result
          });
          processed++;
          if (processed === files.length) {
            renderEditPhotosGrid();
          }
        };
        reader.readAsDataURL(file);
      });

      editPhotoInput.value = '';
    });
  }

  // Remove photo delegation inside Edit Modal
  if (editPhotosGrid) {
    editPhotosGrid.addEventListener('click', function (e) {
      const removeBtn = e.target.closest('[data-remove-edit-photo]');
      if (!removeBtn) return;
      e.preventDefault();
      e.stopPropagation();
      const photoId = removeBtn.getAttribute('data-remove-edit-photo');
      editUploadedPhotos = editUploadedPhotos.filter(function (p) { return p.id !== photoId; });
      renderEditPhotosGrid();
    });
  }

  // Save edited listing details back to the card AND to localStorage
  if (editForm) {
    editForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!activeCardForEdit) return;

      const itemId = activeCardForEdit.getAttribute('data-id') || 'jinko-550w';
      const updatedTitle = editEquipType.value.trim();
      const updatedCity = editCity.value.trim();
      const updatedPhone = editPhone.value.trim();
      const updatedPrice = editPrice.value.trim();
      const updatedUsage = editUsage ? editUsage.value : '1 Year';
      const updatedCondition = editCondition ? editCondition.value : 'Excellent';
      const updatedWarranty = editWarranty ? editWarranty.value : 'Has Official Warranty';
      const updatedDesc = editDescription.value.trim();
      const updatedImg = (editUploadedPhotos.length > 0 && editUploadedPhotos[0].url)
        ? editUploadedPhotos[0].url
        : (activeCardForEdit.getAttribute('data-img') || '/images/panel.jpg');
      const allEditPhotos = editUploadedPhotos.map(function (p) { return p.url; });

      // Update data attributes on the card
      activeCardForEdit.setAttribute('data-title', updatedTitle);
      activeCardForEdit.setAttribute('data-city', updatedCity);
      activeCardForEdit.setAttribute('data-phone', updatedPhone);
      activeCardForEdit.setAttribute('data-price', updatedPrice);
      activeCardForEdit.setAttribute('data-usage', updatedUsage);
      activeCardForEdit.setAttribute('data-condition', updatedCondition);
      activeCardForEdit.setAttribute('data-warranty', updatedWarranty);
      activeCardForEdit.setAttribute('data-description', updatedDesc);
      activeCardForEdit.setAttribute('data-img', updatedImg);

      // Update DOM elements inside the card
      const titleEl = activeCardForEdit.querySelector('.deal-card-title');
      const descEl = activeCardForEdit.querySelector('.deal-card-desc');
      const cityEl = activeCardForEdit.querySelector('.deal-card-city');
      const priceEl = activeCardForEdit.querySelector('.deal-card-price');
      const imgEl = activeCardForEdit.querySelector('.deal-card-img');

      if (titleEl) titleEl.textContent = updatedTitle;
      if (descEl) {
        descEl.textContent =
          'Condition: ' + updatedCondition + ' · Usage: ' + updatedUsage + ' · ' + updatedWarranty;
      }
      if (cityEl) cityEl.textContent = updatedCity;
      if (priceEl) priceEl.textContent = updatedPrice;
      if (imgEl && updatedImg) {
        imgEl.src = updatedImg;
      }

      // If this is a custom user-added item, update it in 'shamstech_user_market_items'
      const customItems = getUserAddedItems();
      const updatedCustom = customItems.map(function (it) {
        if (it.id === itemId) {
          return Object.assign({}, it, {
            title: updatedTitle,
            city: updatedCity,
            phone: updatedPhone,
            price: updatedPrice,
            usage: updatedUsage,
            condition: updatedCondition,
            warranty: updatedWarranty,
            description: updatedDesc,
            img: updatedImg,
            photos: allEditPhotos
          });
        }
        return it;
      });
      saveUserAddedItems(updatedCustom);

      // Persist changes so opening the item in market_item.html shows the updated values
      saveMarketOverride(itemId, {
        title: updatedTitle,
        shortItem: updatedTitle,
        city: updatedCity,
        location: updatedCity + ', Jordan',
        realPhone: updatedPhone,
        price: Number(updatedPrice) || 200,
        usage: updatedUsage,
        condition: updatedCondition,
        warranty: updatedWarranty,
        badge: updatedCondition + ' · ' + updatedUsage,
        desc: updatedDesc,
        image: updatedImg,
        photos: allEditPhotos
      });

      closeEditModal();
      showMarketToast('✓ Listing details for "' + updatedTitle + '" have been updated.');
    });
  }

  // Open Confirmation Modal for Delete or Sold
  function openConfirmModal(card, action) {
    activeCardForConfirm = card;
    activeConfirmAction = action;
    const itemTitle = card.getAttribute('data-title') || 'this equipment';

    if (action === 'delete') {
      if (confirmModalTitle) confirmModalTitle.textContent = 'Delete Equipment Listing?';
      if (confirmModalMsg) {
        confirmModalMsg.textContent =
          'Are you sure you want to delete "' + itemTitle + '"? It will be moved to your Market History page.';
      }
      if (confirmModalIconWrap) confirmModalIconWrap.classList.remove('sold-mode');
      if (confirmModalIcon) confirmModalIcon.setAttribute('href', '#i-alert-triangle');
      if (proceedConfirmBtn) {
        proceedConfirmBtn.classList.remove('sold-mode');
        proceedConfirmBtn.textContent = 'Yes, Delete & Move to History';
      }
    } else if (action === 'sold') {
      if (confirmModalTitle) confirmModalTitle.textContent = 'Mark Item as Sold?';
      if (confirmModalMsg) {
        confirmModalMsg.textContent =
          'Are you sure you want to mark "' + itemTitle + '" as Sold? It will be archived in your Market History page.';
      }
      if (confirmModalIconWrap) confirmModalIconWrap.classList.add('sold-mode');
      if (confirmModalIcon) confirmModalIcon.setAttribute('href', '#i-check-circle');
      if (proceedConfirmBtn) {
        proceedConfirmBtn.classList.add('sold-mode');
        proceedConfirmBtn.textContent = 'Yes, Mark Sold & Save to History';
      }
    }

    if (confirmModal) {
      confirmModal.classList.add('open');
      confirmModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeConfirmModal() {
    if (confirmModal) {
      confirmModal.classList.remove('open');
      confirmModal.setAttribute('aria-hidden', 'true');
    }
    activeCardForConfirm = null;
    activeConfirmAction = null;
  }

  if (closeConfirmModalBtn) closeConfirmModalBtn.addEventListener('click', closeConfirmModal);
  if (cancelConfirmBtn) cancelConfirmBtn.addEventListener('click', closeConfirmModal);
  if (confirmModal) {
    confirmModal.addEventListener('click', function (e) {
      if (e.target === confirmModal) closeConfirmModal();
    });
  }

  // Execute confirmed Delete or Sold action -> Store in Market History & remove from active
  if (proceedConfirmBtn) {
    proceedConfirmBtn.addEventListener('click', function () {
      if (!activeCardForConfirm || !activeConfirmAction) return;

      const card = activeCardForConfirm;
      const action = activeConfirmAction;
      const itemId = card.getAttribute('data-id') || ('item-' + Date.now());
      const itemTitle = card.getAttribute('data-title') || 'Solar Equipment';
      const itemCity = card.getAttribute('data-city') || 'Amman';
      const itemPhone = card.getAttribute('data-phone') || '+962 79 582 4190';
      const itemPrice = card.getAttribute('data-price') || '200';
      const itemUsage = card.getAttribute('data-usage') || '1 Year';
      const itemCondition = card.getAttribute('data-condition') || 'Excellent';
      const itemWarranty = card.getAttribute('data-warranty') || 'Has Official Warranty';
      const itemDesc = card.getAttribute('data-description') || '';
      const itemImg = card.getAttribute('data-img') || '/images/panel.jpg';

      // 1. Save full record to Market History ('shamstech_market_history')
      addItemToMarketHistory({
        id: itemId,
        title: itemTitle,
        city: itemCity,
        phone: itemPhone,
        price: itemPrice,
        usage: itemUsage,
        condition: itemCondition,
        warranty: itemWarranty,
        description: itemDesc,
        img: itemImg,
        historyStatus: action === 'sold' ? 'SOLD' : 'DELETED',
        historyDate: 'Oct 11, 2026'
      });

      // 2. Mark ID as archived so it doesn't show in active listings
      const currentArchived = getArchivedMarketIds();
      if (currentArchived.indexOf(itemId) === -1) {
        currentArchived.push(itemId);
        saveArchivedMarketIds(currentArchived);
      }

      // 3. Remove from active DOM grid and show confirmation toast
      card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(function () {
        card.remove();
      }, 240);

      if (action === 'sold') {
        showMarketToast('✓ "' + itemTitle + '" marked as SOLD and stored in your Market History.');
      } else {
        showMarketToast('🗑 "' + itemTitle + '" deleted and archived in your Market History.');
      }

      closeConfirmModal();
    });
  }

  // Event delegation for Edit / Sold / Delete buttons on #user-offered-grid
  if (userOfferedGrid) {
    userOfferedGrid.addEventListener('click', function (e) {
      const actionBtn = e.target.closest('.btn-user-action');
      if (!actionBtn) return;

      const card = actionBtn.closest('.featured-deal-card');
      if (!card) return;

      const action = actionBtn.getAttribute('data-action');
      if (action === 'edit') {
        openEditModal(card);
      } else if (action === 'sold') {
        openConfirmModal(card, 'sold');
      } else if (action === 'delete') {
        openConfirmModal(card, 'delete');
      }
    });
  }

  // =========================================================================
  // 3. SELL TO PLATFORM DIRECT FORM (Multi-photo upload with small squares & X remove button)
  // =========================================================================
  const sellFileInput = document.getElementById('sell-photo-input');
  const sellFileLabel = document.getElementById('sell-photo-label');
  const sellPhotosGrid = document.getElementById('sell-photos-preview-grid');
  let sellUploadedPhotos = []; // array of { id, url, name }

  function renderSellPhotosGrid() {
    if (!sellPhotosGrid) return;
    if (sellUploadedPhotos.length === 0) {
      sellPhotosGrid.style.display = 'none';
      sellPhotosGrid.innerHTML = '';
      if (sellFileLabel) {
        sellFileLabel.textContent = 'Upload Product Photos (You can add multiple photos)';
      }
      return;
    }

    sellPhotosGrid.style.display = 'flex';
    sellPhotosGrid.innerHTML = sellUploadedPhotos.map(function (photo) {
      return (
        '<div class="sell-photo-thumb-card" data-photo-id="' + photo.id + '">' +
          '<img src="' + photo.url + '" alt="' + (photo.name || 'Equipment Photo') + '" class="sell-photo-thumb-img">' +
          '<button type="button" class="sell-photo-remove-btn" data-remove-photo="' + photo.id + '" title="Remove Photo" aria-label="Remove Photo">✕</button>' +
        '</div>'
      );
    }).join('');

    if (sellFileLabel) {
      sellFileLabel.textContent = '+ Add More Photos (' + sellUploadedPhotos.length + ' attached)';
    }
  }

  if (sellFileInput) {
    sellFileInput.addEventListener('change', function (e) {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;

      let processed = 0;
      files.forEach(function (file) {
        if (!file.type.startsWith('image/')) {
          processed++;
          return;
        }
        const reader = new FileReader();
        reader.onload = function (ev) {
          sellUploadedPhotos.push({
            id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            name: file.name,
            url: ev.target.result
          });
          processed++;
          if (processed === files.length) {
            renderSellPhotosGrid();
          }
        };
        reader.readAsDataURL(file);
      });

      // Reset file input value so user can upload additional photos or re-upload same file
      sellFileInput.value = '';
    });
  }

  // Event delegation to remove photo when clicking 'X'
  if (sellPhotosGrid) {
    sellPhotosGrid.addEventListener('click', function (e) {
      const removeBtn = e.target.closest('[data-remove-photo]');
      if (!removeBtn) return;
      e.preventDefault();
      e.stopPropagation();
      const photoId = removeBtn.getAttribute('data-remove-photo');
      sellUploadedPhotos = sellUploadedPhotos.filter(function (p) { return p.id !== photoId; });
      renderSellPhotosGrid();
    });
  }

  const sellForm = document.getElementById('sell-direct-form');
  const sellToast = document.getElementById('sell-toast');
  if (sellForm) {
    sellForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const equipTypeEl = document.getElementById('sell-equip-type');
      const cityEl = document.getElementById('sell-city');
      const phoneEl = document.getElementById('sell-phone');
      const priceEl = document.getElementById('sell-price');
      const usageEl = document.getElementById('sell-usage');
      const conditionEl = document.getElementById('sell-condition');
      const warrantyEl = document.getElementById('sell-warranty');
      const descEl = document.getElementById('sell-description');

      const equipType = equipTypeEl && equipTypeEl.value.trim() ? equipTypeEl.value.trim() : 'Solar Equipment';
      const city = cityEl && cityEl.value.trim() ? cityEl.value.trim() : 'Amman';
      const phone = phoneEl && phoneEl.value.trim() ? phoneEl.value.trim() : '+962 79 582 4190';
      const price = priceEl && priceEl.value.trim() ? priceEl.value.trim() : '150';
      const usage = usageEl && usageEl.value ? usageEl.value : '1 Year';
      const condition = conditionEl && conditionEl.value ? conditionEl.value : 'Excellent';
      const warranty = warrantyEl && warrantyEl.value ? warrantyEl.value : 'Has Official Warranty';
      const desc = descEl && descEl.value.trim() ? descEl.value.trim() : 'Upgrading system';
      const mainImgSrc = (sellUploadedPhotos.length > 0 && sellUploadedPhotos[0].url)
        ? sellUploadedPhotos[0].url
        : '/images/panel.jpg';
      const allPhotos = sellUploadedPhotos.map(function (p) { return p.url; });
      const newItemId = 'custom-' + Date.now();

      const newItemRecord = {
        id: newItemId,
        title: equipType,
        city: city,
        phone: phone,
        price: price,
        usage: usage,
        condition: condition,
        warranty: warranty,
        description: desc,
        img: mainImgSrc,
        photos: allPhotos,
        createdAt: 'Oct 14, 2026'
      };

      // 1. Persist in 'shamstech_user_market_items' so it stays on the page across reloads
      const currentCustomItems = getUserAddedItems();
      currentCustomItems.unshift(newItemRecord);
      saveUserAddedItems(currentCustomItems);

      // 2. Save to 'shamstech_market_overrides' so clicking the card opens market_item.html with all entered details
      saveMarketOverride(newItemId, {
        title: equipType,
        shortItem: equipType,
        priceCaption: 'TOTAL ASKING PRICE',
        price: Number(price) || 150,
        unlockFee: '2.50',
        badge: condition + ' · ' + usage,
        usage: usage,
        condition: condition,
        warranty: warranty,
        city: city,
        location: city + ', Jordan',
        brand: condition + ' physical condition · Inspected',
        status: '96% Tested',
        accessories: 'Standard mounting & cables included',
        desc: desc,
        image: mainImgSrc,
        photos: allPhotos,
        seller: savedName + ' (Private Seller)',
        sellerShort: savedName + ' (' + city + ')',
        sellerAvatar: savedName.charAt(0).toUpperCase(),
        sellerSub: '✓ Identity Verified by ShamsTech',
        maskedPhone: '+962 79 *** ****',
        realPhone: phone,
        cleanPhone: phone.replace(/\D/g, '') || '962795824190'
      });

      // 3. Render immediately at the top of #user-offered-grid and scroll smoothly to it
      if (userOfferedGrid) {
        const newCard = createOfferedCardElement(newItemRecord);
        userOfferedGrid.prepend(newCard);
        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (sellToast) {
        sellToast.classList.add('show');
        sellForm.reset();
        sellUploadedPhotos = [];
        renderSellPhotosGrid();
        setTimeout(function () {
          sellToast.classList.remove('show');
        }, 4000);
      }
    });
  }

  // =========================================================================
  // 4. LIVE SEARCH FILTER FOR MARKETPLACE ITEMS
  // =========================================================================
  const searchInput = document.getElementById('market-search-input');
  const searchBtn = document.getElementById('market-search-btn');
  const itemCards = document.querySelectorAll('.mk-item-card');

  function filterItems() {
    if (!searchInput) return;
    const query = searchInput.value.trim().toLowerCase();
    itemCards.forEach(function (card) {
      const text = card.textContent.toLowerCase();
      card.style.display = !query || text.indexOf(query) !== -1 ? 'flex' : 'none';
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterItems);
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', filterItems);
  }
});
