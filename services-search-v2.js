(() => {
  const input = document.querySelector('[data-service-search]');
  const items = [...document.querySelectorAll('[data-search-item]')];
  const typeHeading = document.querySelector('[data-service-type-heading]');
  const platformHeading = document.querySelector('[data-platform-heading]');
  const platformGrid = document.querySelector('[data-platform-grid]');
  if (!input) return;

  const typeItems = items.filter(item => item.classList.contains('ssv2-type'));
  const platformItems = items.filter(item => item.classList.contains('ssv2-platform'));

  const apply = () => {
    const query = input.value.trim().toLowerCase();
    items.forEach(item => {
      const haystack = (item.dataset.searchText || item.textContent || '').toLowerCase();
      item.hidden = Boolean(query) && !haystack.includes(query);
    });
    const typeVisible = typeItems.some(item => !item.hidden);
    const platformVisible = platformItems.some(item => !item.hidden);
    if (typeHeading) typeHeading.hidden = !typeVisible;
    if (platformHeading) platformHeading.hidden = !platformVisible;
    if (platformGrid) platformGrid.hidden = !platformVisible;
  };

  input.addEventListener('input', apply);
  apply();
})();
