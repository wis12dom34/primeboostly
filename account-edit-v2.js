(() => {
  const params = new URLSearchParams(location.search);
  const type = ['name','email','phone','verify'].includes(params.get('type')) ? params.get('type') : 'name';
  const method = ['email','phone'].includes(params.get('method')) ? params.get('method') : 'email';
  const existingValue = params.get('value') || '';

  const $ = selector => document.querySelector(selector);
  const title = $('[data-account-title]');
  const noticeTitle = $('[data-account-notice-title]');
  const noticeCopy = $('[data-account-notice-copy]');
  const fieldTitle = $('[data-account-field-title]');
  const fieldCopy = $('[data-account-field-copy]');
  const input = $('[data-account-input]');
  const row2Title = $('[data-account-row2-title]');
  const row2Copy = $('[data-account-row2-copy]');
  const row2Action = $('[data-account-row2-action]');
  const row3Title = $('[data-account-row3-title]');
  const row3Copy = $('[data-account-row3-copy]');
  const row3Action = $('[data-account-row3-action]');
  const submit = $('[data-account-submit]');
  const submitTitle = $('[data-account-submit-title]');
  const submitCopy = $('[data-account-submit-copy]');
  const back = $('.aev2-back');

  const configs = {
    name: {
      title:'Edit profile name', noticeTitle:'Signed-in profile',
      noticeCopy:'Choose the name shown on your account. Changes are not saved to a live account in this preview.',
      fieldTitle:'Profile name', fieldCopy:'Name shown across your account', placeholder:'Enter name', inputType:'text',
      row2Title:'Current value', row2Copy:'Loaded from the authenticated account', row2Action:'Not shown in preview',
      row3Title:'Visibility', row3Copy:'Used across PrimeBoostly account surfaces', row3Action:'Account',
      submitTitle:'Save changes', disabledCopy:'Enter a profile name first', readyCopy:'Ready to continue'
    },
    email: {
      title:'Change email', noticeTitle:'Verification required',
      noticeCopy:'Your sign-in email changes only after the new address is verified. Existing account data remains active until then.',
      fieldTitle:'New email address', fieldCopy:'Enter the replacement sign-in email', placeholder:'Enter email', inputType:'email',
      row2Title:'Current email', row2Copy:'Loaded from the authenticated account', row2Action:'Not shown in preview',
      row3Title:'Verification', row3Copy:'A code is sent before the change is saved', row3Action:'Required',
      submitTitle:'Continue to verification', disabledCopy:'Enter a new email address first', readyCopy:'Verify your contact details'
    },
    phone: {
      title:'Change phone', noticeTitle:'Optional contact',
      noticeCopy:'Include your country code. Verify the number before saving.',
      fieldTitle:'New phone number', fieldCopy:'Enter a new contact number', placeholder:'Enter phone', inputType:'tel',
      row2Title:'Current phone', row2Copy:'Loaded from the authenticated account', row2Action:'Not shown in preview',
      row3Title:'Verification', row3Copy:'Verify your number before saving', row3Action:'Required',
      submitTitle:'Continue to verification', disabledCopy:'Enter a new phone number first', readyCopy:'Verify your contact details'
    },
    verify: {
      title:'Verify change', noticeTitle:'Secure account update',
      noticeCopy:'Enter the code sent to your email or phone. This preview does not change a live account.',
      fieldTitle:'Verification code', fieldCopy:'Enter the code sent by PrimeBoostly', placeholder:'Enter code', inputType:'text',
      row2Title:'Delivery method', row2Copy:'Email or phone selected in the previous step', row2Action:'Selected method',
      row3Title:'Code status', row3Copy:'Expiry and retry state come from production', row3Action:'Live state',
      submitTitle:'Verify and save', disabledCopy:'Enter your verification code', readyCopy:'Ready to verify'
    }
  };

  const cfg = configs[type];
  title.textContent = cfg.title;
  noticeTitle.textContent = cfg.noticeTitle;
  noticeCopy.textContent = cfg.noticeCopy;
  fieldTitle.textContent = cfg.fieldTitle;
  fieldCopy.textContent = cfg.fieldCopy;
  input.type = cfg.inputType;
  input.placeholder = cfg.placeholder;
  input.value = type === 'verify' ? '' : existingValue;
  row2Title.textContent = cfg.row2Title;
  row2Copy.textContent = cfg.row2Copy;
  row2Action.textContent = cfg.row2Action;
  row3Title.textContent = cfg.row3Title;
  row3Copy.textContent = cfg.row3Copy;
  row3Action.textContent = cfg.row3Action;
  submitTitle.textContent = cfg.submitTitle;
  submitCopy.textContent = cfg.disabledCopy;

  if (type === 'verify') back.href = `/account-edit.html?type=${encodeURIComponent(method)}&value=${encodeURIComponent(existingValue)}`;
  else back.href = '/profile-flow.html?view=account';

  const updateReady = () => {
    const value = input.value.trim();
    const ready = Boolean(value)&&input.checkValidity();
    submit.classList.toggle('disabled', !ready);
    submit.setAttribute('aria-disabled', String(!ready));
    submitCopy.textContent = ready ? cfg.readyCopy : cfg.disabledCopy;
    if (!ready) { submit.href = '#'; return; }
    if (type === 'email' || type === 'phone') {
      submit.href = `/account-edit.html?type=verify&method=${encodeURIComponent(type)}&value=${encodeURIComponent(value)}`;
    } else {
      submit.href = '/profile-flow.html?view=account';
    }
  };

  input.addEventListener('input', updateReady);
  updateReady();
})();
