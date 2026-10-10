(() => {
  const params = new URLSearchParams(location.search);
  const validPlatforms = ['instagram', 'tiktok', 'facebook', 'youtube'];
  const rawPlatform = (params.get('platform') || '').toLowerCase();
  const platform = validPlatforms.includes(rawPlatform) ? rawPlatform : 'instagram';
  const allowedSteps = ['platform', 'services', 'order', 'review', 'price', 'submitted'];
  const step = allowedSteps.includes(params.get('step'))
    ? params.get('step')
    : (params.has('platform') ? 'services' : 'platform');

  const platformLabels = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    facebook: 'Facebook',
    youtube: 'YouTube'
  };

  const platformLabel = platformLabels[platform] || 'Platform';
  const serviceId = params.get('serviceId') || params.get('service') || '';
  const serviceName = params.get('serviceName') || '';
  const serviceMin = params.get('min') || '';
  const serviceMax = params.get('max') || '';
  const serviceRate = params.get('rate') || '';
  const profile = params.get('profile') || '';
  const quantity = params.get('quantity') || '';

  document.querySelectorAll('[data-screen]').forEach(node => {
    node.classList.toggle('active', node.dataset.screen === step);
  });

  const title = document.querySelector('[data-platform-services-title]');
  if (title) title.textContent = `${platformLabel} provider services`;

  const normalizeService = item => {
    if (!item || typeof item !== 'object') return null;
    const id = item.id ?? item.service ?? item.serviceId ?? '';
    const name = item.name ?? item.serviceName ?? item.title ?? '';
    if (!id && !name) return null;
    return {
      id: String(id || ''),
      name: String(name || 'Live service'),
      min: item.min ?? item.minimum ?? '',
      max: item.max ?? item.maximum ?? '',
      rate: item.rate ?? item.price ?? '',
      platform: String(item.platform || item.category || '')
    };
  };

  const injected = [
    window.PRIMEBOOSTLY_LIVE_SERVICES,
    window.__PRIMEBOOSTLY_SMM_SERVICES__,
    window.__SMM_SERVICES__
  ].find(Array.isArray) || [];

  const runtimeServices = injected
    .map(normalizeService)
    .filter(Boolean)
    .filter(item => !item.platform || item.platform.toLowerCase().includes(platform));

  const makeServiceUrl = item => {
    const url = new URL('/normal-smm.html', location.origin);
    url.searchParams.set('platform', platform);
    url.searchParams.set('step', 'order');
    if (item.id) url.searchParams.set('serviceId', item.id);
    if (item.name) url.searchParams.set('serviceName', item.name);
    if (item.min !== '') url.searchParams.set('min', item.min);
    if (item.max !== '') url.searchParams.set('max', item.max);
    if (item.rate !== '') url.searchParams.set('rate', item.rate);
    return url.pathname + url.search;
  };

  const providerCards = [...document.querySelectorAll('[data-provider-service]')];
  providerCards.forEach((card, index) => {
    const item = runtimeServices[index];
    const name = card.querySelector('strong');
    const meta = card.querySelector('small');
    const icon = card.querySelector('.nsm-provider-icon');

    if (!item) {
      card.removeAttribute('href');
      card.setAttribute('aria-disabled', 'true');
      card.classList.add('is-placeholder');
      return;
    }

    card.classList.remove('is-placeholder');
    card.removeAttribute('aria-disabled');
    card.href = makeServiceUrl(item);
    if (name) name.textContent = item.name;

    const metaParts = [];
    if (item.min !== '' || item.max !== '') {
      const minText = item.min !== '' ? `Min ${item.min}` : null;
      const maxText = item.max !== '' ? `Max ${item.max}` : null;
      metaParts.push([minText, maxText].filter(Boolean).join(' • '));
    }
    if (item.rate !== '') metaParts.push(`Live rate ${item.rate}`);
    if (meta) meta.textContent = metaParts.length ? metaParts.join(' • ') : 'Live provider service';
    if (icon) icon.textContent = item.name.trim().charAt(0).toUpperCase() || 'S';
  });

  const selectedName = serviceName || 'Selected live service';
  const selectedMeta = serviceId ? `Service ${serviceId}` : 'runtime selection';

  document.querySelectorAll('.nsm-live-summary .nsm-summary-copy strong').forEach(node => {
    node.textContent = selectedName;
  });
  document.querySelectorAll('.nsm-live-summary .nsm-summary-copy small').forEach(node => {
    node.textContent = `Normal SMM • ${selectedMeta}`;
  });
  document.querySelectorAll('[data-review-platform]').forEach(node => {
    node.textContent = platformLabel;
  });
  document.querySelectorAll('[data-review-service]').forEach(node => {
    node.textContent = serviceName || (serviceId ? `Service ${serviceId}` : 'Runtime service');
  });
  document.querySelectorAll('[data-review-profile]').forEach(node => {
    node.textContent = profile || 'Target URL';
  });
  document.querySelectorAll('[data-review-quantity]').forEach(node => {
    node.textContent = quantity || 'Runtime quantity';
  });

  const orderBack = document.querySelector('[data-order-back]');
  if (orderBack) {
    orderBack.href = `/normal-smm.html?platform=${encodeURIComponent(platform)}&step=services`;
  }

  const profileInput = document.querySelector('#nsm-profile');
  const quantityInput = document.querySelector('#nsm-quantity');
  const reviewButton = document.querySelector('[data-review-button]');
  if (profileInput) profileInput.value = profile;
  if (quantityInput) {
    quantityInput.value = quantity;
    if (serviceMin !== '' && Number(serviceMin) > 0) quantityInput.min = serviceMin;
    if (serviceMax !== '' && Number(serviceMax) > 0) quantityInput.max = serviceMax;
  }

  const currentProfile = () => profileInput?.value.trim() || profile;
  const currentQuantity = () => quantityInput?.value.trim() || quantity;

  const makeUrl = nextStep => {
    const url = new URL('/normal-smm.html', location.origin);
    url.searchParams.set('platform', platform);
    url.searchParams.set('step', nextStep);
    if (serviceId) url.searchParams.set('serviceId', serviceId);
    if (serviceName) url.searchParams.set('serviceName', serviceName);
    if (serviceMin) url.searchParams.set('min', serviceMin);
    if (serviceMax) url.searchParams.set('max', serviceMax);
    if (serviceRate) url.searchParams.set('rate', serviceRate);
    const liveProfile = currentProfile();
    const liveQuantity = currentQuantity();
    if (liveProfile) url.searchParams.set('profile', liveProfile);
    if (liveQuantity) url.searchParams.set('quantity', liveQuantity);
    return url.pathname + url.search;
  };

  const makeDetailUrl = () => {
    const url = new URL('/order-detail.html', location.origin);
    url.searchParams.set('type', 'normal');
    url.searchParams.set('platform', platform);
    if (serviceId) url.searchParams.set('serviceId', serviceId);
    if (serviceName) url.searchParams.set('serviceName', serviceName);
    const liveProfile = currentProfile();
    const liveQuantity = currentQuantity();
    if (liveProfile) url.searchParams.set('profile', liveProfile);
    if (liveQuantity) url.searchParams.set('quantity', liveQuantity);
    return url.pathname + url.search;
  };

  const updateReviewButton = () => {
    if (!reviewButton) return;
    const q = Number(quantityInput?.value);
    const minOkay = !serviceMin || q >= Number(serviceMin);
    const maxOkay = !serviceMax || q <= Number(serviceMax);
    const ready = Boolean(profileInput?.value.trim()) && q > 0 && minOkay && maxOkay;
    reviewButton.disabled = !ready;
    if (!profileInput?.value.trim() || !(q > 0)) {
      reviewButton.textContent = 'Enter details to review';
    } else if (!minOkay || !maxOkay) {
      reviewButton.textContent = 'Quantity outside live limits';
    } else {
      reviewButton.textContent = 'Review order';
    }
  };

  profileInput?.addEventListener('input', updateReviewButton);
  quantityInput?.addEventListener('input', updateReviewButton);
  updateReviewButton();

  reviewButton?.addEventListener('click', () => {
    if (!reviewButton.disabled) location.href = makeUrl('review');
  });

  const reviewBack = document.querySelector('[data-review-back]');
  if (reviewBack) reviewBack.href = makeUrl('order');
  const priceLink = document.querySelector('[data-price-link]');
  if (priceLink) priceLink.href = makeUrl('price');
  const priceBack = document.querySelector('[data-price-back]');
  if (priceBack) priceBack.href = makeUrl('review');
  const submitLink = document.querySelector('[data-submit-link]');
  if (submitLink) submitLink.href = makeUrl('submitted');

  const submittedStatusLink = document.querySelector('[data-screen="submitted"] .nsm-primary');
  if (submittedStatusLink) {
    submittedStatusLink.href = makeDetailUrl();
    submittedStatusLink.textContent = 'View order status';
  }
})();