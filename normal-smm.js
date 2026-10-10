(() => {
  const params = new URLSearchParams(location.search);
  const validPlatforms = ['instagram', 'tiktok', 'facebook', 'youtube'];
  const platform = validPlatforms.includes((params.get('platform') || '').toLowerCase()) ? params.get('platform').toLowerCase() : 'instagram';
  const step = ['platform', 'services', 'order', 'review', 'price', 'submitted'].includes(params.get('step')) ? params.get('step') : (params.has('platform') ? 'services' : 'platform');
  const requestedService = (params.get('service') || '').toLowerCase();

  const configs = {
    instagram: {
      label: 'Instagram', icon: 'IG', placeholder: 'Paste the Instagram profile URL',
      serviceSubtitle: 'Start with a common Instagram service. The exact catalogue stays provider-driven.',
      notice: 'Pricing, minimums and maximums are fetched live before checkout.',
      services: [
        {key:'followers', name:'Followers', icon:'F', desc:'Grow follower count'},
        {key:'likes', name:'Likes', icon:'♥', desc:'Increase likes on a post'},
        {key:'views', name:'Views', icon:'▶', desc:'Increase video or reel views'},
        {key:'engagement', name:'Engagement', icon:'↗', desc:'Comments, saves or other actions'}
      ]
    },
    tiktok: {
      label: 'TikTok', icon: 'TT', placeholder: 'Paste the TikTok profile or content URL',
      serviceSubtitle: 'Choose a TikTok service category. Exact provider options and limits load live.',
      notice: 'Exact provider services, pricing, minimums and maximums load live before checkout.',
      services: [
        {key:'followers', name:'Followers', icon:'F', desc:'Grow follower count'},
        {key:'likes', name:'Likes', icon:'♥', desc:'Increase likes on content'},
        {key:'views', name:'Views', icon:'▶', desc:'Increase video views'},
        {key:'engagement', name:'Engagement', icon:'↗', desc:'Comments, shares or other actions'}
      ]
    },
    facebook: {
      label: 'Facebook', icon: 'f', placeholder: 'Paste the Facebook profile, page or post URL',
      serviceSubtitle: 'Choose a Facebook service category. Exact provider options and limits load live.',
      notice: 'Exact provider services, pricing, minimums and maximums load live before checkout.',
      services: [
        {key:'followers', name:'Followers', icon:'F', desc:'Grow follower count'},
        {key:'likes', name:'Likes', icon:'♥', desc:'Increase likes on a page or post'},
        {key:'views', name:'Views', icon:'▶', desc:'Increase video views'},
        {key:'engagement', name:'Engagement', icon:'↗', desc:'Comments, shares or other actions'}
      ]
    },
    youtube: {
      label: 'YouTube', icon: 'YT', placeholder: 'Paste the YouTube channel or video URL',
      serviceSubtitle: 'Choose a YouTube service category. Exact provider options and limits load live.',
      notice: 'Exact provider services, pricing, minimums and maximums load live before checkout.',
      services: [
        {key:'subscribers', name:'Subscribers', icon:'S', desc:'Grow subscriber count'},
        {key:'views', name:'Views', icon:'▶', desc:'Increase video views'},
        {key:'likes', name:'Likes', icon:'♥', desc:'Increase likes on a video'},
        {key:'engagement', name:'Engagement', icon:'↗', desc:'Comments or other actions'}
      ]
    }
  };

  const cfg = configs[platform];
  const service = cfg.services.find(item => item.key === requestedService) || cfg.services[0];
  const profile = params.get('profile') || '';
  const quantity = params.get('quantity') || '';

  document.querySelectorAll('[data-screen]').forEach(node => node.classList.toggle('active', node.dataset.screen === step));

  const slots = ['primary','secondary','third','fourth'];
  document.querySelector('[data-platform-services-title]')?.replaceChildren(document.createTextNode(`${cfg.label} services`));
  document.querySelector('[data-platform-services-sub]')?.replaceChildren(document.createTextNode(cfg.serviceSubtitle));
  document.querySelector('[data-service-notice]')?.replaceChildren(document.createTextNode(cfg.notice));

  slots.forEach((slot, index) => {
    const item = cfg.services[index];
    document.querySelector(`[data-service-icon="${slot}"]`)?.replaceChildren(document.createTextNode(item.icon));
    document.querySelector(`[data-service-name="${slot}"]`)?.replaceChildren(document.createTextNode(item.name));
    document.querySelector(`[data-service-desc="${slot}"]`)?.replaceChildren(document.createTextNode(item.desc));
    const link = document.querySelector(`[data-service-link="${slot}"]`);
    if (link) link.href = `/normal-smm.html?platform=${encodeURIComponent(platform)}&service=${encodeURIComponent(item.key)}&step=order`;
  });

  const selectedTitle = `${cfg.label} ${service.name}`;
  document.querySelectorAll('[data-selected-icon]').forEach(node => node.textContent = cfg.icon);
  document.querySelectorAll('[data-selected-title]').forEach(node => node.textContent = selectedTitle);
  document.querySelectorAll('[data-selected-sub]').forEach(node => node.textContent = `Normal SMM • ${cfg.label}`);
  document.querySelectorAll('[data-review-platform]').forEach(node => node.textContent = cfg.label);
  document.querySelectorAll('[data-review-service]').forEach(node => node.textContent = service.name);
  document.querySelectorAll('[data-review-profile]').forEach(node => node.textContent = profile || 'Runtime profile');
  document.querySelectorAll('[data-review-quantity]').forEach(node => node.textContent = quantity || 'Runtime quantity');

  const orderBack = document.querySelector('[data-order-back]');
  if (orderBack) orderBack.href = `/normal-smm.html?platform=${encodeURIComponent(platform)}&step=services`;

  const profileInput = document.querySelector('#nsm-profile');
  const quantityInput = document.querySelector('#nsm-quantity');
  const reviewButton = document.querySelector('[data-review-button]');
  if (profileInput) {
    profileInput.placeholder = cfg.placeholder;
    profileInput.value = profile;
  }
  if (quantityInput) quantityInput.value = quantity;

  const currentProfile = () => profileInput?.value.trim() || profile;
  const currentQuantity = () => quantityInput?.value.trim() || quantity;

  const makeUrl = nextStep => {
    const url = new URL('/normal-smm.html', location.origin);
    url.searchParams.set('platform', platform);
    url.searchParams.set('service', service.key);
    url.searchParams.set('step', nextStep);
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
    url.searchParams.set('service', service.key);
    const liveProfile = currentProfile();
    const liveQuantity = currentQuantity();
    if (liveProfile) url.searchParams.set('profile', liveProfile);
    if (liveQuantity) url.searchParams.set('quantity', liveQuantity);
    return url.pathname + url.search;
  };

  const updateReviewButton = () => {
    if (!reviewButton) return;
    const ready = Boolean(profileInput?.value.trim()) && Number(quantityInput?.value) > 0;
    reviewButton.disabled = !ready;
    reviewButton.textContent = ready ? 'Review order' : 'Enter details to review';
  };
  profileInput?.addEventListener('input', updateReviewButton);
  quantityInput?.addEventListener('input', updateReviewButton);
  updateReviewButton();

  reviewButton?.addEventListener('click', () => {
    if (reviewButton.disabled) return;
    location.href = makeUrl('review');
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
