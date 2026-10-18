/* =====================================================
   SHAMSTECH JO - ROI CALCULATOR (js/roi_calculator.js)
   1. Reads bill + tariff + roof type from the sliders.
   2. Sizes the system:  kWp = yearly kWh needed / 1650.
   3. Cost = kWp x 650 JD, area = kWp x 6 m2.
   4. Payback = cost / yearly savings; 25-year gain
      includes 0.5% yearly panel degradation.
   5. Saves the estimate so request_solar can reuse it.
   ===================================================== */
document.addEventListener('DOMContentLoaded', function () {
  var YIELD = 1650, COST_KW = 650, M2_KW = 6, DEGRADE = 0.005;   // editable assumptions
  var $ = function (id) { return document.getElementById(id); };
  var factor = 1;

  function calc() {
    var bill = +$('in-bill').value, tariff = +$('in-tariff').value;
    $('v-bill').textContent = bill; $('v-tariff').textContent = tariff.toFixed(2);
    var yearlyKwh = (bill / tariff) * 12;
    var kw = Math.max(1, Math.round((yearlyKwh / YIELD) * factor * 2) / 2);   // round to 0.5 kWp
    var cost = kw * COST_KW, save = Math.min(kw * YIELD, yearlyKwh) * tariff;
    var gain = 0, bars = '';
    for (var y = 1; y <= 25; y++) {
      gain += save * Math.pow(1 - DEGRADE, y - 1);
      var net = gain - cost, h = Math.min(100, Math.abs(net) / (cost * 3) * 100);
      bars += '<i class="' + (net < 0 ? 'neg' : '') + '" style="height:' + Math.max(6, h) + '%"></i>';
    }
    $('o-kw').textContent = kw + ' kWp';
    $('o-area').textContent = Math.round(kw * M2_KW) + ' m²';
    $('o-cost').textContent = cost.toLocaleString() + ' JD';
    $('o-save').textContent = Math.round(save).toLocaleString() + ' JD';
    $('o-pay').textContent = (cost / save).toFixed(1) + ' yrs';
    $('o-gain').textContent = Math.round(gain - cost).toLocaleString() + ' JD';
    $('bars').innerHTML = bars;
    try { localStorage.setItem('shamstech_roi_estimate', JSON.stringify({ kw: kw, cost: cost, bill: bill })); } catch (e) {}
  }
  ['in-bill', 'in-tariff'].forEach(function (id) { $(id).addEventListener('input', calc); });
  document.querySelectorAll('#seg-roof button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('#seg-roof button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on'); factor = +b.dataset.k; calc();
    });
  });
  calc();
});
