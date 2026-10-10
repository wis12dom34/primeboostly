(() => {
  const params = new URLSearchParams(location.search);
  const valid = ['all','orders','wallet','security'];
  const filter = valid.includes(params.get('filter')) ? params.get('filter') : 'all';
  const filters = [...document.querySelectorAll('[data-notification-filter]')];
  const alerts = [...document.querySelectorAll('[data-alert-type]')];

  filters.forEach(link => {
    const active = link.dataset.notificationFilter === filter;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  alerts.forEach(alert => {
    const visible = filter === 'all' || alert.dataset.alertType === filter;
    alert.hidden = !visible;
    alert.classList.toggle('is-filtered', filter !== 'all' && visible);
  });
})();
