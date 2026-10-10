(() => {
  const root = document.querySelector('.secv2');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const validViews = ['password','2fa','sessions','activity','verify','complete'];
  const view = validViews.includes(params.get('view')) ? params.get('view') : 'password';
  const kind = params.get('kind') === '2fa' ? '2fa' : 'password';
  const title = root.querySelector('[data-security-title]');
  const body = root.querySelector('[data-security-body]');
  const back = root.querySelector('.secv2-back');
  if (!title || !body || !back) return;

  const makeUrl = (nextView, extra = {}) => {
    const url = new URL('/security-flow.html', location.origin);
    url.searchParams.set('view', nextView);
    const nextKind = extra.kind ?? (['verify','complete'].includes(nextView) ? kind : '');
    if (nextKind) url.searchParams.set('kind', nextKind);
    return url.pathname + url.search;
  };

  const copyBlock = (rowTitle, rowCopy) => {
    const copy = document.createElement('span');
    copy.className = 'secv2-copy';
    const strong = document.createElement('strong'); strong.textContent = rowTitle;
    const small = document.createElement('small'); small.textContent = rowCopy;
    copy.append(strong, small);
    return {copy, strong, small};
  };

  const textRow = ({title: rowTitle, copy: rowCopy, action, href, dark = false, disabled = false}) => {
    const row = document.createElement(href ? 'a' : 'div');
    row.className = `secv2-row${dark ? ' dark' : ''}${disabled ? ' disabled' : ''}`;
    if (href) row.href = href;
    if (disabled) row.setAttribute('aria-disabled', 'true');
    if(href&&(disabled||dark))row.classList.add('pb-primary-button');
    const block = copyBlock(rowTitle, rowCopy);
    const end = document.createElement('span'); end.className = 'secv2-action'; end.textContent = action;
    row.append(block.copy, end);
    return {row, block, end};
  };

  const inputRow = ({title: rowTitle, copy: rowCopy, placeholder = 'Required', type = 'password', hiddenInput = false, withToggle = false}) => {
    const row = document.createElement(hiddenInput ? 'label' : 'div');
    row.className = 'secv2-row';
    row.style.position = 'relative';
    const block = copyBlock(rowTitle, rowCopy);
    const input = document.createElement('input');
    input.type = type;
    input.autocomplete = 'off';
    input.setAttribute('aria-label', rowTitle);
    if (hiddenInput) {
      input.style.position = 'absolute';
      input.style.width = '1px';
      input.style.height = '1px';
      input.style.opacity = '0';
      input.style.pointerEvents = 'none';
      input.style.right = '70px';
    } else {
      input.className = 'secv2-secret';
      input.placeholder = placeholder;
    }
    row.append(block.copy, input);
    let toggle = null;
    if (withToggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'secv2-toggle';
      toggle.setAttribute('aria-label', `Show ${rowTitle.toLowerCase()}`);
      const img = document.createElement('img'); img.alt = ''; img.src = '/assets/v2-eye.svg';
      toggle.appendChild(img);
      let showing = false;
      toggle.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        showing = !showing;
        input.type = showing ? 'text' : 'password';
        img.src = showing ? '/assets/v2-eye-off.svg' : '/assets/v2-eye.svg';
        toggle.setAttribute('aria-label', `${showing ? 'Hide' : 'Show'} ${rowTitle.toLowerCase()}`);
        input.focus();
      });
      row.appendChild(toggle);
    }
    return {row, block, input, toggle};
  };

  const toggleRow = ({title: rowTitle, copy: rowCopy, on = true, interactive = false}) => {
    const row = document.createElement('div'); row.className = 'secv2-row';
    const block = copyBlock(rowTitle, rowCopy);
    const control = document.createElement(interactive ? 'button' : 'span');
    control.className = 'secv2-toggle';
    const img = document.createElement('img'); img.alt = ''; img.src = on ? '/assets/v2-toggle-on.svg' : '/assets/v2-toggle-off.svg';
    control.appendChild(img);
    if (interactive) {
      control.type = 'button';
      control.setAttribute('aria-pressed', String(on));
      control.setAttribute('aria-label', `${rowTitle}: ${on ? 'selected' : 'not selected'}`);
    }
    row.append(block.copy, control);
    return {row, block, control, img};
  };

  const notice = (heading = 'Protected account data', copy = 'Protect your account with a strong password and two-step verification. This is a preview of your security settings.') => {
    const box = document.createElement('div'); box.className = 'secv2-notice';
    const info = document.createElement('span'); info.className = 'secv2-info'; info.textContent = 'i';
    const text = document.createElement('span'); text.className = 'secv2-notice-copy';
    const strong = document.createElement('strong'); strong.textContent = heading;
    const small = document.createElement('small'); small.textContent = copy;
    text.append(strong, small); box.append(info, text); return box;
  };

  body.textContent = '';

  if (view === 'password') {
    title.textContent = 'Password';
    back.href = '/profile-flow.html?view=security';
    const current = inputRow({title:'Current password',copy:'Enter your current password',placeholder:'Current password'});
    const next = inputRow({title:'New password',copy:'Choose a new password',placeholder:'New password',withToggle:true});
    const confirm = inputRow({title:'Confirm password',copy:'Re-enter your new password',placeholder:'Re-enter new password'});
    const submit = textRow({title:'Update password',copy:'Enter required fields first',action:'',href:'#',disabled:true});
    const sync = () => {
      const ready = Boolean(current.input.value && next.input.value && confirm.input.value && next.input.value === confirm.input.value);
      current.input.autocomplete='current-password';next.input.autocomplete=confirm.input.autocomplete='new-password';
      confirm.input.placeholder='Re-enter new password';
      next.block.small.textContent = next.input.value ? 'Choose a new password' : 'Choose a new password';
      submit.row.classList.toggle('disabled', !ready);
      submit.row.setAttribute('aria-disabled', String(!ready));
      submit.block.small.textContent = ready ? 'Continue to verification' : 'Enter required fields first';
      submit.end.textContent = ready ? '›' : '';
      submit.row.href = ready ? makeUrl('verify', {kind:'password'}) : '#';
    };
    [current.input,next.input,confirm.input].forEach(input => input.addEventListener('input', sync));
    body.append(current.row,next.row,confirm.row,submit.row,notice());
    sync();
    return;
  }

  if (view === '2fa') {
    title.textContent = 'Two-step verification';
    back.href = '/profile-flow.html?view=security';
    const status = textRow({title:'Status',copy:'Extra sign-in protection',action:'Off'});
    const method = toggleRow({title:'Verification method',copy:'Choose your verification method',on:false,interactive:true});
    const recovery = textRow({title:'Recovery codes',copy:'Generated only after setup',action:'Unavailable'});
    const enable = textRow({title:'Enable two-step',copy:'Choose a verification method first',action:'',href:'#',disabled:true});
    const apply = selected => {
      method.img.src = selected ? '/assets/v2-toggle-on.svg' : '/assets/v2-toggle-off.svg';
      method.control.setAttribute('aria-pressed', String(selected));
      method.control.setAttribute('aria-label', `Verification method: ${selected ? 'selected' : 'not selected'}`);
      method.block.small.textContent = selected ? 'Verification method selected' : 'Choose your verification method';
      enable.row.classList.toggle('disabled', !selected);
      enable.row.setAttribute('aria-disabled', String(!selected));
      enable.block.small.textContent = selected ? 'Continue to verification' : 'Choose a verification method first';
      enable.end.textContent = selected ? '›' : '';
      enable.row.href = selected ? makeUrl('verify', {kind:'2fa'}) : '#';
    };
    let selected = false;
    method.control.addEventListener('click', () => { selected = !selected; apply(selected); });
    body.append(status.row,method.row,recovery.row,enable.row,notice());
    apply(false);
    return;
  }

  if (view === 'sessions') {
    title.textContent = 'Active sessions';
    back.href = '/profile-flow.html?view=security';
    body.append(
      textRow({title:'Current session',copy:'This device session',action:'Active'}).row,
      toggleRow({title:'Other sessions',copy:'Loaded from production',on:true}).row,
      textRow({title:'Session details',copy:'Device, location and last activity',action:'Production'}).row,
      textRow({title:'Sign out others',copy:'Keeps the current session active',action:'Production action'}).row,
      notice()
    );
    return;
  }

  if (view === 'activity') {
    title.textContent = 'Sign-in activity';
    back.href = '/profile-flow.html?view=security';
    body.append(
      textRow({title:'Recent sign-ins',copy:'Loaded from secure account activity',action:'Live data'}).row,
      toggleRow({title:'Successful sign-ins',copy:'Production history',on:true}).row,
      textRow({title:'Failed attempts',copy:'Production security history',action:'Live data'}).row,
      textRow({title:'Security review',copy:'Check anything you do not recognize',action:'Review',href:'/profile-flow.html?view=security'}).row,
      notice()
    );
    return;
  }

  if (view === 'verify') {
    title.textContent = 'Verify security change';
    back.href = makeUrl(kind === '2fa' ? '2fa' : 'password');
    const verifyNotice = notice('Secure account update','Verification codes, expiry windows and retry rules come from production. This prototype stores no real code or private account data.');
    const code = inputRow({title:'Verification code',copy:'Enter the code for production validation',placeholder:'Provided code',type:'text'});
    code.input.classList.add('code');
    const delivery = textRow({title:'Delivery method',copy:'Email or phone selected in the previous step',action:'Runtime'});
    const state = textRow({title:'Code status',copy:'Expiry and retry state come from production',action:'Live state'});
    const save = textRow({title:'Verify and save',copy:'Enter your verification code',action:'',href:'#',dark:true,disabled:true});
    const sync = () => {
      const ready = Boolean(code.input.value.trim());
      code.block.small.textContent = ready ? 'Code entered for production validation' : 'Enter the code for production validation';
      code.input.placeholder = ready ? 'Provided code' : 'Provided code';
      save.row.classList.toggle('disabled', !ready);
      save.row.setAttribute('aria-disabled', String(!ready));
      save.block.small.textContent = ready ? 'Production validates the code before saving' : 'Enter your verification code';
      save.end.textContent = ready ? '›' : '';
      save.row.href = ready ? makeUrl('complete', {kind}) : '#';
    };
    code.input.addEventListener('input', sync);
    body.append(verifyNotice,code.row,delivery.row,state.row,save.row);
    sync();
    return;
  }

  title.textContent = 'Update confirmed';
  back.href = '/profile-flow.html?view=security';
  body.append(
    notice('Security preview','This preview does not change your live account or store passwords.'),
    textRow({title:'Security status',copy:'Review the result of this preview flow',action:'Confirmed'}).row,
    textRow({title:'Return to security',copy:'Latest state is loaded from your account',action:'Production',href:'/profile-flow.html?view=security'}).row,
    textRow({title:'Security settings',copy:'Review password, two-step verification and sessions',action:'View security ›',href:'/profile-flow.html?view=security'}).row,
    textRow({title:'Back to security',copy:'Review your current security settings',action:'›',href:'/profile-flow.html?view=security',dark:true}).row
  );
})();
