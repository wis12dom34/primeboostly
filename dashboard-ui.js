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
    const step = params.get('step') || 'platform';
    const rawPlatform = (params.get('platform') || 'instagram').toLowerCase();
    const platformLabels = {
      instagram: 'Instagram',
      tiktok: 'TikTok',
      facebook: 'Facebook',
      youtube: 'YouTube'
    };
    const platform = platformLabels[rawPlatform] || 'Instagram';
    const encoded = encodeURIComponent(rawPlatform);

    document.body.dataset.orderStep = step;
    document.body.dataset.selectedPlatform = rawPlatform;
    document.querySelectorAll('[data-selected-platform]').forEach(node => {
      node.textContent = platform;
    });

    const readyUrl = `/dashboard.html?mode=new&platform=${encoded}&step=ready`;
    const reviewUrl = `/dashboard.html?mode=new&platform=${encoded}&step=review`;
    const priceUrl = `/dashboard.html?mode=new&platform=${encoded}&step=price`;
    const submittedUrl = `/dashboard.html?mode=new&platform=${encoded}&step=submitted`;

    document.querySelectorAll('.ordrv2-review').forEach(link => { link.href = reviewUrl; });
    document.querySelectorAll('.orrv2-back').forEach(link => { link.href = readyUrl; });
    document.querySelectorAll('.orprice-back').forEach(link => { link.href = reviewUrl; });
    document.querySelectorAll('[data-order-next="price"]').forEach(link => { link.href = priceUrl; });
    document.querySelectorAll('[data-order-next="submitted"]').forEach(link => { link.href = submittedUrl; });
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
