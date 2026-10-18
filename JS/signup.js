/* =====================================================
   SHAMSTECH JO - SIGN UP PAGE JS (js/signup.js)
   1. Dynamic Tab Switching: Smoothly updates the green card
      content (Fade / Smooth Slide) when switching between
      "Client / Individual" and "Solar Company".
   2. Time-Aware Ambient Sun Glow: Adjusts the green box gradient
      and golden corner glow based on Daytime vs Nighttime.
   3. Validates fields and redirects to Client Homepage on submit.
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {
  const greenBox = document.getElementById('solar-green-box');
  const dynamicPanel = document.getElementById('role-dynamic-panel');
  const roleTag = document.getElementById('green-role-tag');
  const headline = document.getElementById('green-headline');
  const desc = document.getElementById('green-desc');

  const ptIcon1 = document.getElementById('pt-icon-1');
  const ptTitle1 = document.getElementById('pt-title-1');
  const ptSub1 = document.getElementById('pt-sub-1');

  const ptIcon2 = document.getElementById('pt-icon-2');
  const ptTitle2 = document.getElementById('pt-title-2');
  const ptSub2 = document.getElementById('pt-sub-2');

  const ptIcon3 = document.getElementById('pt-icon-3');
  const ptTitle3 = document.getElementById('pt-title-3');
  const ptSub3 = document.getElementById('pt-sub-3');

  // Role-specific content for the Green Box
  const GREEN_BOX_CONTENT = {
    client: {
      tag: 'Solar services · Client Portal',
      headline: 'Invest in solar energy & <em class="gold-text">cut your electricity bill.</em>',
      desc: 'One platform where homeowners meet Jordan’s best solar companies — from first panel to final resale.',
      points: [
        {
          icon: '#i-lock',
          title: '100% Certified & Trusted Companies',
          sub: 'Every company on ShamsTech is licensed and quality-checked'
        },
        {
          icon: '#i-zap',
          title: 'Get the Best Price Offers Within 48 Hours',
          sub: 'Compare transparent quotes, timelines, and ratings side by side'
        },
        {
          icon: '#i-wrench',
          title: 'Guaranteed Workmanship & Installation Quality',
          sub: 'Documented engineering and full warranty on every job'
        }
      ]
    },
    company: {
      tag: 'Partner Network · Solar Companies',
      headline: 'Expand your business & join <em class="gold-text">Jordan’s largest energy market.</em>',
      desc: 'Connect directly with ready-to-buy residential, agricultural, and commercial clients across Jordan.',
      points: [
        {
          icon: '#i-trending-up',
          title: 'Direct Access to Thousands of Interested Clients',
          sub: 'Receive qualified installation, maintenance, and cleaning leads'
        },
        {
          icon: '#i-file-text',
          title: 'Manage All Offers & Requests in One Place',
          sub: 'Streamlined project bidding, client messaging, and order tracking'
        },
        {
          icon: '#i-shield-check',
          title: 'Official Verification & Higher Company Trust',
          sub: 'Stand out to homeowners with an accredited ShamsTech partner badge'
        }
      ]
    }
  };

  function updateGreenBoxContent(role, animate) {
    const data = GREEN_BOX_CONTENT[role] || GREEN_BOX_CONTENT.client;
    if (!dynamicPanel) return;

    if (greenBox) {
      greenBox.classList.toggle('company-mode', role === 'company');
    }

    if (!animate) {
      applyContent(data);
      return;
    }

    // Smooth Fade + Slide Out, swap content, then Smooth Fade + Slide In
    dynamicPanel.classList.add('switching');
    setTimeout(function () {
      applyContent(data);
      dynamicPanel.classList.remove('switching');
    }, 220);
  }

  function applyContent(data) {
    if (roleTag) roleTag.textContent = data.tag;
    if (headline) headline.innerHTML = data.headline;
    if (desc) desc.textContent = data.desc;

    if (ptIcon1) ptIcon1.setAttribute('href', data.points[0].icon);
    if (ptTitle1) ptTitle1.textContent = data.points[0].title;
    if (ptSub1) ptSub1.textContent = data.points[0].sub;

    if (ptIcon2) ptIcon2.setAttribute('href', data.points[1].icon);
    if (ptTitle2) ptTitle2.textContent = data.points[1].title;
    if (ptSub2) ptSub2.textContent = data.points[1].sub;

    if (ptIcon3) ptIcon3.setAttribute('href', data.points[2].icon);
    if (ptTitle3) ptTitle3.textContent = data.points[2].title;
    if (ptSub3) ptSub3.textContent = data.points[2].sub;
  }

  // Time-of-Day Adaptive Background Lighting (Daylight vs Warm Night)
  const timeBtn = document.getElementById('time-mode-btn');
  const timeLabel = document.getElementById('time-mode-label');
  const currentHour = new Date().getHours();
  let isDayMode = currentHour >= 6 && currentHour < 18;

  function applyTimeLighting(day) {
    if (!greenBox) return;
    greenBox.classList.toggle('is-day', day);
    greenBox.classList.toggle('is-night', !day);
    if (timeLabel) {
      timeLabel.textContent = day ? 'Daylight Glow' : 'Warm Night Glow';
    }
  }

  applyTimeLighting(isDayMode);

  if (timeBtn) {
    timeBtn.addEventListener('click', function () {
      isDayMode = !isDayMode;
      applyTimeLighting(isDayMode);
    });
  }

  // Role Switcher (Client / Individual vs Solar Company)
  const tabClient = document.getElementById('tab-client');
  const tabCompany = document.getElementById('tab-company');
  const clientFormWrap = document.getElementById('client-signup-wrap');
  const companyFormWrap = document.getElementById('company-signup-wrap');
  const errorBox = document.getElementById('signup-error');

  function setRole(role, animate) {
    if (errorBox) errorBox.classList.remove('show');
    if (role === 'company') {
      tabCompany.classList.add('active');
      tabClient.classList.remove('active');
      companyFormWrap.style.display = 'block';
      clientFormWrap.style.display = 'none';
    } else {
      tabClient.classList.add('active');
      tabCompany.classList.remove('active');
      clientFormWrap.style.display = 'block';
      companyFormWrap.style.display = 'none';
    }
    updateGreenBoxContent(role, animate);
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('role') === 'company') {
    setRole('company', false);
  }

  if (tabClient && tabCompany) {
    tabClient.addEventListener('click', function () { setRole('client', true); });
    tabCompany.addEventListener('click', function () { setRole('company', true); });
  }

  // File upload label update
  const licenseInput = document.getElementById('company-license');
  const licenseLabel = document.getElementById('license-label-text');
  if (licenseInput && licenseLabel) {
    licenseInput.addEventListener('change', function (e) {
      const file = e.target.files && e.target.files[0];
      if (file) {
        licenseLabel.textContent = 'Selected: ' + file.name;
      }
    });
  }

  // Client Sign Up Form Submit
  const clientForm = document.getElementById('client-signup-form');
  if (clientForm) {
    clientForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('client-name').value.trim();
      const city = document.getElementById('client-city').value;
      const pass = document.getElementById('client-pass').value;
      const confirm = document.getElementById('client-confirm').value;

      if (pass !== confirm) {
        errorBox.textContent = 'Passwords do not match. Please check both fields.';
        errorBox.classList.add('show');
        return;
      }

      localStorage.setItem('shamstech_user_name', name || 'Ahmad Ali');
      localStorage.setItem('shamstech_user_city', city || 'Amman');
      // Save the account details so the Profile page can show and edit them
      const phone = document.getElementById('client-phone').value.trim();
      const email = document.getElementById('client-email').value.trim();
      localStorage.setItem('shamstech_user_phone', phone);
      localStorage.setItem('shamstech_user_email', email);
      localStorage.setItem('shamstech_client_name', name || 'Ahmad Ali');
      localStorage.setItem('shamstech_client_profile', JSON.stringify({ name: name || 'Ahmad Ali', phone: phone, email: email, city: city || 'Amman', area: '' }));
      localStorage.setItem('shamstech_user_role', 'client');
      window.location.href = '/html/client_home.html';
    });
  }

  // Company Sign Up Form Submit -> Redirects to Company Home Dashboard
  const companyForm = document.getElementById('company-signup-form');
  if (companyForm) {
    companyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const compName = document.getElementById('company-name').value.trim();
      const registration = document.getElementById('company-reg').value.trim();
      const email = document.getElementById('company-email').value.trim();
      const phone = document.getElementById('company-phone').value.trim();
      const city = document.getElementById('company-city').value;
      const licenseInput = document.getElementById('company-license');
      const licenseName = licenseInput && licenseInput.files && licenseInput.files[0] ? licenseInput.files[0].name : '';
      const pass = document.getElementById('company-pass').value;
      const confirm = document.getElementById('company-confirm').value;

      if (pass !== confirm) {
        errorBox.textContent = 'Passwords do not match. Please check both fields.';
        errorBox.classList.add('show');
        return;
      }

      const finalCompanyName = compName || 'Al-Fanar Energy Co.';
      localStorage.setItem('shamstech_company_name', finalCompanyName);
      localStorage.setItem('shamstech_user_name', finalCompanyName);
      localStorage.setItem('shamstech_user_city', city || 'Amman');
      localStorage.setItem('shamstech_company_profile', JSON.stringify({ name: finalCompanyName, registration: registration, email: email, phone: phone, city: city || 'Amman', licenseName: licenseName }));
      localStorage.setItem('shamstech_user_role', 'company');
      window.location.href = '/html/company_home.html';
    });
  }
});
