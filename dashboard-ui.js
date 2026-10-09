/* Presentation state only. Authentication and order submission stay in their existing flows. */
(() => {
  const platforms = [...document.querySelectorAll('[data-platform]')];
  const category = document.querySelector('[data-category-select]');
  const modes = [...document.querySelectorAll('[data-order-mode]')];
  const panels = [...document.querySelectorAll('[data-order-panel]')];

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
    // Use an existing matching option if the catalogue has supplied one.
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
      if (mode === 'new') url.searchParams.delete('mode');
      else url.searchParams.set('mode', mode);
      history.pushState(null, '', url);
    }
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
  const readMode = () => showMode(new URLSearchParams(location.search).get('mode'));
  window.addEventListener('popstate', readMode);
  readMode();
})();
