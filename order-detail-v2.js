(() => {
  const root = document.querySelector('.order-detail-v2');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const normal = (params.get('type') || '').toLowerCase() === 'normal';
  const platformKey = (params.get('platform') || 'instagram').toLowerCase();
  const platformLabels = {instagram:'Instagram', tiktok:'TikTok', facebook:'Facebook', youtube:'YouTube'};
  const platformIcons = {instagram:'IG', tiktok:'TT', facebook:'f', youtube:'YT'};
  const serviceKey = (params.get('service') || (platformKey === 'youtube' ? 'subscribers' : 'followers')).toLowerCase();
  const serviceLabels = {followers:'Followers', subscribers:'Subscribers', likes:'Likes', views:'Views', engagement:'Engagement'};
  const platform = platformLabels[platformKey] || 'Instagram';
  const service = serviceLabels[serviceKey] || 'Followers';
  const profile = params.get('profile') || 'Not available';
  const quantity = params.get('quantity') || 'Not available';

  const summary = root.querySelector('.odv2-summary');
  const icon = root.querySelector('[data-order-icon]');
  const title = root.querySelector('[data-order-title]');
  const subtitle = root.querySelector('[data-order-subtitle]');
  const pill = root.querySelector('[data-order-pill]');
  const card = root.querySelector('.odv2-card');
  const notice = root.querySelector('.odv2-notice');
  const action = root.querySelector('.odv2-action');
  const foot = root.querySelector('.odv2-foot');

  if (normal) {
    summary?.classList.add('normal');
    card?.classList.add('normal');
    notice?.classList.add('normal');
    if (icon) icon.textContent = platformIcons[platformKey] || 'IG';
    if (title) title.textContent = `${platform} ${service}`;
    if (subtitle) subtitle.textContent = `Normal SMM • ${platform}`;
    if (pill) pill.textContent = 'Global';
    if (action) { action.textContent = 'Back to orders'; action.href = '/orders.html'; }
    if (foot) foot.hidden = true;
  } else {
    if (icon) icon.textContent = 'NG';
    if (title) title.textContent = 'Real Nigeria Followers';
    if (subtitle) subtitle.textContent = 'Local audience • Higher trust';
    if (pill) pill.textContent = 'Nigeria';
    if (action) { action.textContent = 'Back home'; action.href = '/dashboard.html'; }
    if (foot) { foot.hidden = false; foot.textContent = 'Status, price and reference values come from production data.'; }
  }

  const rows = card ? [...card.querySelectorAll('.odv2-row')] : [];
  const rowMap = new Map(rows.map(row => [row.dataset.key, row]));
  const serviceRow = rowMap.get('service');
  if (serviceRow) serviceRow.hidden = !normal;

  const setRow = (key, value) => {
    const row = rowMap.get(key);
    if (!row) return;
    const strong = row.querySelector('strong');
    if (strong) strong.textContent = value;
  };
  setRow('platform', platform);
  setRow('service', service);
  setRow('profile', profile);
  setRow('quantity', quantity);
  setRow('price', 'Shown after confirmation');
})();
