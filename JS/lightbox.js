/* =====================================================
   SHAMSTECH JO - PHOTO VIEWER (js/lightbox.js)
   Click a request photo (.rd-photos / .req-photos) to see
   it large. Click anywhere or press Esc to close.
   ===================================================== */
document.addEventListener('click', function (e) {
  var img = e.target.closest('.rd-photos img, .req-photos img');
  if (!img) return;
  var box = document.createElement('div'); box.className = 'lb';
  box.innerHTML = '<img alt="">'; box.firstChild.src = img.src;
  var close = function () { box.remove(); document.removeEventListener('keydown', esc); };
  var esc = function (k) { if (k.key === 'Escape') close(); };
  box.addEventListener('click', close); document.addEventListener('keydown', esc);
  document.body.appendChild(box);
});
