(() => {
  const root = document.querySelector('.pfv2');
  if (!root) return;
  const params = new URLSearchParams(location.search);
  const validViews = ['account','wallet','transactions','currency','notifications','security'];
  const view = validViews.includes(params.get('view')) ? params.get('view') : 'account';
  const title = root.querySelector('[data-profile-title]');
  const body = root.querySelector('[data-profile-body]');
  const back = root.querySelector('.pfv2-back');
  if (!title || !body) return;
  if (back) back.href = ['transactions','currency'].includes(view) ? '/profile-flow.html?view=wallet' : '/settings.html';

  const row = ({title, copy, action, href = '#', green = false, toggle}) => {
    const wrap = document.createElement(href === '#' ? 'div' : 'a');
    wrap.className = 'pfv2-row';
    if (wrap.tagName === 'A') wrap.href = href;
    const text = document.createElement('span');
    text.className = 'pfv2-row-copy';
    const strong = document.createElement('strong'); strong.textContent = title;
    const small = document.createElement('small'); small.textContent = copy;
    text.append(strong, small);
    wrap.appendChild(text);
    if (toggle !== undefined) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pfv2-toggle';
      button.setAttribute('aria-pressed', String(toggle));
      button.setAttribute('aria-label', `${title}: ${toggle ? 'on' : 'off'}`);
      const img = document.createElement('img');
      img.alt = '';
      img.src = toggle ? '/assets/v2-toggle-on.svg' : '/assets/v2-toggle-off.svg';
      button.appendChild(img);
      button.addEventListener('click', event => {
        event.preventDefault();
        const next = button.getAttribute('aria-pressed') !== 'true';
        button.setAttribute('aria-pressed', String(next));
        button.setAttribute('aria-label', `${title}: ${next ? 'on' : 'off'}`);
        img.src = next ? '/assets/v2-toggle-on.svg' : '/assets/v2-toggle-off.svg';
        try { localStorage.setItem(`primeboostly:${title}`, String(next)); } catch {}
      });
      wrap.appendChild(button);
    } else {
      const end = document.createElement('span');
      end.className = `pfv2-action${green ? ' green' : ''}`;
      end.textContent = action;
      wrap.appendChild(end);
    }
    return wrap;
  };

  const notice = (heading, copy) => {
    const box = document.createElement('div'); box.className = 'pfv2-notice';
    const info = document.createElement('span'); info.className = 'pfv2-info'; info.textContent = 'i';
    const text = document.createElement('span'); text.className = 'pfv2-notice-copy';
    const strong = document.createElement('strong'); strong.textContent = heading;
    const small = document.createElement('small'); small.textContent = copy;
    text.append(strong, small); box.append(info, text); return box;
  };

  const wallet = (label = 'Available balance', value = '₦48,250.00') => {
    const box = document.createElement('div'); box.className = 'pfv2-wallet';
    const small = document.createElement('small'); small.textContent = label;
    const strong = document.createElement('strong'); strong.textContent = value;
    box.append(small, strong); return box;
  };

  body.textContent = '';
  if (view === 'account') {
    title.textContent = 'Account details';
    body.append(
      notice('Signed-in account data','Manage the name and contact details on your account. Changes are not saved to a live account in this preview.'),
      row({title:'Profile name',copy:'Name used across your account',action:'Edit ›',href:'/account-edit.html?type=name'}),
      row({title:'Email address',copy:'Primary sign-in and recovery email',action:'Change ›',href:'/account-edit.html?type=email'}),
      row({title:'Phone number',copy:'Optional account contact',action:'Change ›',href:'/account-edit.html?type=phone'}),
      row({title:'Account status',copy:'Current account access state',action:'Active',green:true})
    );
    return;
  }

  if (view === 'wallet') {
    title.textContent = 'Wallet & billing';
    body.append(
      wallet(),
      row({title:'Wallet funding',copy:'Add money to your PrimeBoostly wallet',action:'Add funds ›',href:'/add-funds.html'}),
      row({title:'Transaction history',copy:'Funding and wallet activity',action:'View history ›',href:'/profile-flow.html?view=transactions'}),
      row({title:'Billing currency',copy:'Primary wallet display currency',action:'NGN',href:'/profile-flow.html?view=currency'}),
      notice('Live wallet data','Balance and transaction values are supplied by production wallet data.')
    );
    return;
  }

  if (view === 'transactions') {
    title.textContent = 'Transaction details';
    body.append(
      notice('Wallet activity','Review wallet credits, purchases and refunds below.'),
      row({title:'Latest transactions',copy:'Funding and wallet movements',action:'View history ›',href:'/transactions.html'}),
      row({title:'Transaction history',copy:'Amount, method, status and reference',action:'View history ›',href:'/transactions.html'}),
      row({title:'History source',copy:'Transactions from the production wallet',action:'Live'}),
      notice('Live transaction history','Real transactions appear here when production wallet data is connected.')
    );
    return;
  }

  if (view === 'currency') {
    title.textContent = 'Billing currency';
    body.append(
      wallet('Wallet currency','NGN'),
      row({title:'Nigerian Naira',copy:'Current wallet display currency',action:'Active'}),
      row({title:'Additional currencies',copy:'Loaded from production configuration',action:'Not available'}),
      row({title:'Billing currency',copy:'Enabled by live wallet settings',action:'NGN'}),
      notice('Production currency configuration','Only currencies enabled by the live wallet should appear here.')
    );
    return;
  }

  const storedToggle = (key, fallback) => {
    try {
      const value = localStorage.getItem(`primeboostly:${key}`);
      return value === null ? fallback : value === 'true';
    } catch { return fallback; }
  };

  if (view === 'notifications') {
    title.textContent = 'Notifications';
    body.append(
      row({title:'Order updates',copy:'Status changes for your active orders',toggle:storedToggle('Order updates', true),href:'#'}),
      row({title:'Wallet alerts',copy:'Funding and wallet activity alerts',toggle:storedToggle('Wallet alerts', true),href:'#'}),
      row({title:'Account alerts',copy:'Important sign-in and security notices',toggle:storedToggle('Account alerts', true),href:'#'}),
      row({title:'Promotions',copy:'Product news and service announcements',toggle:storedToggle('Promotions', false),href:'#'}),
      notice('Notification preferences','Choose the updates you want to receive. Preferences are saved locally in this preview.')
    );
    return;
  }

  title.textContent = 'Security';
  body.append(
    row({title:'Password',copy:'Manage your sign-in password',action:'Protected ›',href:'/security-flow.html?view=password'}),
    row({title:'Two-step verification',copy:'Extra verification for sensitive account actions',action:'Manage ›',href:'/security-flow.html?view=2fa'}),
    row({title:'Active sessions',copy:'Review devices currently signed in',action:'Review ›',href:'/security-flow.html?view=sessions'}),
    row({title:'Sign-in activity',copy:'Recent authentication activity',action:'Review ›',href:'/security-flow.html?view=activity'}),
    notice('Security data','Review your password, verification settings and recent sign-ins.')
  );
})();
