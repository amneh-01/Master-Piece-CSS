/* =====================================================
   SHAMSTECH JO - LOG IN PAGE JS (js/login.js)
   Explanation of what was done in this file:
   1. Dynamic Tab Switching: Smoothly updates the green card
      content (Fade / Smooth Slide) when switching between
      "Client / Individual" and "Solar Company".
   2. Automatic Username Detection from Email:
      Removed the separate "Name" input field. When a user logs in
      with their email and password (e.g., "ahmed@shamstech.jo" or
      "ahmed.ali@gmail.com"), we extract their username from the part
      before "@" and save it to localStorage ('shamstech_user_name')
      so it appears on the Client Home Page and Navbar across all pages.
   3. Interactive "Forgot Password?" Modal Form:
      Clicking "Forgot Password?" opens a modal where the user enters
      their email address and clicks "OK", sending them a password
      reset email notification.
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

  // Role Switcher (Client / Individual vs Solar Company)
  const tabClient = document.getElementById('login-tab-client');
  const tabCompany = document.getElementById('login-tab-company');
  const clientWrap = document.getElementById('client-login-wrap');
  const companyWrap = document.getElementById('company-login-wrap');
  const errorBox = document.getElementById('login-error');

  function setRole(role, animate) {
    if (errorBox) errorBox.classList.remove('show');
    if (role === 'company') {
      tabCompany.classList.add('active');
      tabClient.classList.remove('active');
      companyWrap.style.display = 'block';
      clientWrap.style.display = 'none';
    } else {
      tabClient.classList.add('active');
      tabCompany.classList.remove('active');
      clientWrap.style.display = 'block';
      companyWrap.style.display = 'none';
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

  // Helper: Extracts a clean, capitalized username from an email address
  // Example: "ahmed@shamstech.jo" -> "Ahmed", "ahmed.ali@gmail.com" -> "Ahmed Ali"
  function extractUsernameFromEmail(email) {
    const prefix = (email.split('@')[0] || '').replace(/[._-]+/g, ' ').trim();
    if (!prefix) return 'Ahmed';
    return prefix
      .split(/\s+/)
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }

  // 1. Client Log In Submit -> Derives username from email & redirects to Client Home
  const clientLoginForm = document.getElementById('client-login-form');
  if (clientLoginForm) {
    clientLoginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('client-login-email').value.trim();
      const pass = document.getElementById('client-login-pass').value.trim();

      if (!email || !pass) {
        errorBox.textContent = 'Please enter your email address and password.';
        errorBox.classList.add('show');
        return;
      }

      const username = extractUsernameFromEmail(email);
      localStorage.setItem('shamstech_user_name', username);
      localStorage.setItem('shamstech_client_name', username);
      localStorage.setItem('shamstech_user_email', email);
      localStorage.setItem('shamstech_user_role', 'client');
      window.location.href = '/html/client_home.html';
    });
  }

  // 2. Company Log In Submit -> Derives company username from email & redirects to Company Home
  const companyLoginForm = document.getElementById('company-login-form');
  if (companyLoginForm) {
    companyLoginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = document.getElementById('company-login-email').value.trim();
      const pass = document.getElementById('company-login-pass').value.trim();

      if (!email || !pass) {
        errorBox.textContent = 'Please enter your company email and password.';
        errorBox.classList.add('show');
        return;
      }

      const rawPrefix = (email.split('@')[0] || '').toLowerCase();
      let companyName = extractUsernameFromEmail(email);
      if (rawPrefix.indexOf('fanar') !== -1 || rawPrefix.indexOf('future') !== -1) {
        companyName = 'Al-Fanar Energy Co.';
      } else if (companyName.toLowerCase().indexOf('co') === -1 && companyName.toLowerCase().indexOf('company') === -1) {
        companyName = companyName + ' Co.';
      }

      localStorage.setItem('shamstech_company_name', companyName);
      localStorage.setItem('shamstech_user_name', companyName);
      localStorage.setItem('shamstech_user_email', email);
      localStorage.setItem('shamstech_user_role', 'company');
      window.location.href = '/html/company_home.html';
    });
  }

  // 3. "Forgot Password?" Interactive Modal Form
  const forgotModal = document.getElementById('forgot-password-modal');
  const forgotCloseBtn = document.getElementById('forgot-modal-close');
  const forgotCancelBtn = document.getElementById('forgot-cancel-btn');
  const forgotDoneBtn = document.getElementById('forgot-done-btn');
  const forgotForm = document.getElementById('forgot-password-form');
  const forgotEmailInput = document.getElementById('forgot-email-input');
  const forgotFormStep = document.getElementById('forgot-form-step');
  const forgotSuccessStep = document.getElementById('forgot-success-step');
  const forgotSentEmailDisplay = document.getElementById('forgot-sent-email-display');
  const forgotTriggers = document.querySelectorAll('[data-open-forgot]');

  function openForgotModal(sourceRole) {
    if (!forgotModal) return;
    forgotFormStep.style.display = 'block';
    forgotSuccessStep.style.display = 'none';

    const currentEmailInput = sourceRole === 'company'
      ? document.getElementById('company-login-email')
      : document.getElementById('client-login-email');

    if (forgotEmailInput && currentEmailInput) {
      forgotEmailInput.value = currentEmailInput.value.trim();
    }
    forgotModal.classList.add('open');
    forgotModal.setAttribute('aria-hidden', 'false');
    if (forgotEmailInput) forgotEmailInput.focus();
  }

  function closeForgotModal() {
    if (!forgotModal) return;
    forgotModal.classList.remove('open');
    forgotModal.setAttribute('aria-hidden', 'true');
  }

  forgotTriggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      openForgotModal(btn.getAttribute('data-open-forgot'));
    });
  });

  if (forgotCloseBtn) forgotCloseBtn.addEventListener('click', closeForgotModal);
  if (forgotCancelBtn) forgotCancelBtn.addEventListener('click', closeForgotModal);
  if (forgotDoneBtn) forgotDoneBtn.addEventListener('click', closeForgotModal);

  if (forgotModal) {
    forgotModal.addEventListener('click', function (e) {
      if (e.target === forgotModal) closeForgotModal();
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const targetEmail = forgotEmailInput ? forgotEmailInput.value.trim() : '';
      if (!targetEmail) return;

      if (forgotSentEmailDisplay) {
        forgotSentEmailDisplay.textContent = targetEmail;
      }
      forgotFormStep.style.display = 'none';
      forgotSuccessStep.style.display = 'block';
    });
  }
});
