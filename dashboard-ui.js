/* Presentation state only. Authentication and order submission stay in their existing flows. */
(() => {
  const platforms = [...document.querySelectorAll('[data-platform]')];
  const category = document.querySelector('[data-category-select]');
  const modes = [...document.querySelectorAll('[data-order-mode]')];
  const panels = [...document.querySelectorAll('[data-order-panel]')];

  const normalSmmCard = document.querySelector('.v2-service-normal');
  const nigeriaFollowersCard = document.querySelector('.v2-service-real');
  if (normalSmmCard) normalSmmCard.href = '/normal-smm.html';
  if (nigeriaFollowersCard) nigeriaFollowersCard.href = '/dashboard.html?mode=new';

  function markPlatform(value) {
    platforms.forEach(button => {
      const selected = button.dataset.platform === value;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  platforms.forEach(button => button.addEventListener('click', () => {
    if (!category) return;
    const platform = button.dataset.platform;
    let option = [...category.options].find(item =>
      item.value === platform || item.textContent.trim() === platform);
    if (!option) {
      option = new Option(platform, platform);
      category.add(option);
    }
    category.value = option.value;
    category.dispatchEvent(new Event('change', { bubbles: true }));
    markPlatform(platform);
  }));

  category?.addEventListener('change', () => {
    const option = category.selectedOptions[0];
    const platform = platforms.find(button =>
      button.dataset.platform === category.value ||
      button.dataset.platform === option?.textContent.trim());
    markPlatform(platform?.dataset.platform || '');
  });

  function applyV2OrderState(params) {
    const validSteps = ['details', 'platform', 'ready', 'review', 'price', 'submitted'];
    const requestedStep = params.get('step');
    const step = validSteps.includes(requestedStep) ? requestedStep : 'details';
    const rawPlatform = (params.get('platform') || '').toLowerCase();
    const platformLabels = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      facebook: 'Facebook',
      youtube: 'YouTube'
    };
    const selectedPlatform = platformLabels[rawPlatform] ? rawPlatform : '';
    const platformLabel = selectedPlatform ? platformLabels[selectedPlatform] : 'Select platform';
    const queryProfile = params.get('profile') || '';
    const queryQuantity = params.get('quantity') || '';

    document.body.dataset.orderStep = step;
    if (selectedPlatform) document.body.dataset.selectedPlatform = selectedPlatform;
    else delete document.body.dataset.selectedPlatform;

    const readySection = document.querySelector('.order-ready-v2');
    const readyFields = readySection ? [...readySection.querySelectorAll('.ordrv2-field')] : [];
    const platformField = readyFields[0] || null;
    const profileField = readyFields[1] || null;
    const quantityField = readyFields[2] || null;
    const profileBox = profileField?.querySelector('.ordrv2-box');
    const quantityBox = quantityField?.querySelector('.ordrv2-box');

    let profileInput = profileBox?.querySelector('input');
    if (profileBox && !profileInput) {
      profileBox.textContent = '';
      profileInput = document.createElement('input');
      profileInput.className = 'ordrv2-input';
      profileInput.type = 'url';
      profileInput.autocomplete = 'url';
      profileInput.placeholder = 'Paste the profile URL';
      profileBox.appendChild(profileInput);
    }
    let quantityInput = quantityBox?.querySelector('input');
    if (quantityBox && !quantityInput) {
      quantityBox.textContent = '';
      quantityInput = document.createElement('input');
      quantityInput.className = 'ordrv2-input';
      quantityInput.type = 'number';
      quantityInput.min = '1';
      quantityInput.inputMode = 'numeric';
      quantityInput.placeholder = 'Enter quantity';
      quantityBox.appendChild(quantityInput);
    }

    if (profileInput && document.activeElement !== profileInput) profileInput.value = queryProfile;
    if (quantityInput && document.activeElement !== quantityInput) quantityInput.value = queryQuantity;

    const currentProfile = () => profileInput?.value.trim() || queryProfile;
    const currentQuantity = () => quantityInput?.value.trim() || queryQuantity;
    const buildOrderUrl = (nextStep, platformOverride = selectedPlatform) => {
      const url = new URL('/dashboard.html', location.origin);
      url.searchParams.set('mode', 'new');
      if (platformOverride) url.searchParams.set('platform', platformOverride);
      url.searchParams.set('step', nextStep);
      const profile = currentProfile();
      const quantity = currentQuantity();
      if (profile) url.searchParams.set('profile', profile);
      if (quantity) url.searchParams.set('quantity', quantity);
      return url.pathname + url.search;
    };
    const buildDetailUrl = () => {
      const url = new URL('/order-detail.html', location.origin);
      url.searchParams.set('type', 'real');
      if (selectedPlatform) url.searchParams.set('platform', selectedPlatform);
      const profile = currentProfile();
      const quantity = currentQuantity();
      if (profile) url.searchParams.set('profile', profile);
      if (quantity) url.searchParams.set('quantity', quantity);
      return url.pathname + url.search;
    };

    document.querySelectorAll('[data-selected-platform]').forEach(node => {
      node.textContent = platformLabel;
    });

    if (platformField) {
      platformField.href = buildOrderUrl('platform');
      const box = platformField.querySelector('.ordrv2-box');
      if (box) {
        box.textContent = '';
        const value = document.createElement('span');
        value.dataset.selectedPlatform = '';
        value.textContent = platformLabel;
        const chev = document.createElement('span');
        chev.className = 'chev';
        chev.textContent = '›';
        box.append(value, chev);
      }
    }

    const headCopy = readySection?.querySelector('.ordrv2-headcopy p');
    if (headCopy) headCopy.textContent = 'Fill in the details below to continue';
    const priceNote = readySection?.querySelector('.ordrv2-info p');
    if (priceNote) priceNote.textContent = selectedPlatform
      ? 'Final amount is fetched from the live service rate before confirmation.'
      : 'Price is calculated after you select a platform and quantity.';
    const readyFoot = readySection?.querySelector('.ordrv2-foot');
    if (readyFoot) readyFoot.textContent = selectedPlatform
      ? 'Entered order details appear here at runtime.'
      : 'Enter your details before reviewing the order';

    const selectorBack = document.querySelector('.order-v2 .orv2-back');
    if (selectorBack) selectorBack.href = buildOrderUrl('details');
    const readyBack = document.querySelector('.order-ready-v2 .ordrv2-back');
    if (readyBack) readyBack.href = selectedPlatform ? buildOrderUrl('platform') : '/services.html';

    document.querySelectorAll('.orv2-platform').forEach(link => {
      const linkUrl = new URL(link.href, location.origin);
      const platformFromLink = (linkUrl.searchParams.get('platform') || '').toLowerCase();
      if (platformLabels[platformFromLink]) link.href = buildOrderUrl('ready', platformFromLink);
    });

    const reviewLink = document.querySelector('.ordrv2-review');
    const syncReadyActions = () => {
      const profile = currentProfile();
      const quantity = currentQuantity();
      if (platformField) platformField.href = buildOrderUrl('platform');
      if (!reviewLink) return;
      const complete = Boolean(selectedPlatform && profile && Number(quantity) > 0);
      reviewLink.classList.toggle('disabled', !complete);
      reviewLink.setAttribute('aria-disabled', String(!complete));
      reviewLink.href = complete ? buildOrderUrl('review') : '#';
    };

    [profileInput, quantityInput].forEach(input => {
      if (!input || input.dataset.orderBound === 'true') return;
      input.dataset.orderBound = 'true';
      input.addEventListener('input', syncReadyActions);
    });
    syncReadyActions();

    const writeSummaryValues = section => {
      if (!section) return;
      section.querySelectorAll('.orrv2-summary-row').forEach(row => {
        const key = row.querySelector('span')?.textContent.trim();
        const value = row.querySelector('strong');
        if (!value) return;
        if (key === 'Platform') value.textContent = selectedPlatform ? platformLabels[selectedPlatform] : '—';
        if (key === 'Profile') value.textContent = queryProfile || 'Runtime profile';
        if (key === 'Quantity') value.textContent = queryQuantity || 'Runtime quantity';
      });
    };
    writeSummaryValues(document.querySelector('.order-review-v2'));
    writeSummaryValues(document.querySelector('.order-price-v2'));
    writeSummaryValues(document.querySelector('.order-submitted-v2'));

    const reviewBack = document.querySelector('.orrv2-back');
    if (reviewBack) reviewBack.href = buildOrderUrl('ready');
    const priceBack = document.querySelector('.orprice-back');
    if (priceBack) priceBack.href = buildOrderUrl('review');
    document.querySelectorAll('[data-order-next="price"]').forEach(link => { link.href = buildOrderUrl('price'); });
    document.querySelectorAll('[data-order-next="submitted"]').forEach(link => { link.href = buildOrderUrl('submitted'); });
    const submittedStatusLink = document.querySelector('.order-submitted-v2 .orrv2-confirm');
    if (submittedStatusLink) {
      submittedStatusLink.href = buildDetailUrl();
      submittedStatusLink.textContent = 'View order status';
    }
  }

  function applyMobileView(mode, hasExplicitMode) {
    const mobile = window.matchMedia('(max-width: 900px)').matches;
    const orderView = mobile && hasExplicitMode;
    document.body.classList.toggle('mobile-order-view', orderView);

    if (orderView) {
      document.body.dataset.orderMode = mode;
      applyV2OrderState(new URLSearchParams(location.search));
    } else {
      delete document.body.dataset.orderMode;
      delete document.body.dataset.orderStep;
      delete document.body.dataset.selectedPlatform;
    }
  }

  function showMode(requested, updateUrl = false) {
    const mode = modes.some(link => link.dataset.orderMode === requested) ? requested : 'new';
    modes.forEach(link => {
      const active = link.dataset.orderMode === mode;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.orderPanel !== mode; });

    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('mode', mode);
      history.pushState(null, '', url);
    }

    const params = new URLSearchParams(location.search);
    applyMobileView(mode, params.has('mode'));
  }

  modes.forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    showMode(link.dataset.orderMode, true);
  }));

  document.querySelectorAll('[data-return-new]').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    showMode('new', true);
    modes[0]?.focus();
  }));

  const readMode = () => {
    const params = new URLSearchParams(location.search);
    showMode(params.get('mode') || 'new');
  };

  window.addEventListener('popstate', readMode);
  window.addEventListener('resize', readMode);
  readMode();
})();
