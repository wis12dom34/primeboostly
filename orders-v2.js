(() => {
  const params = new URLSearchParams(location.search);
  const view = params.get('view') === 'search' ? 'search' : 'orders';
  const validFilters = ['all','processing','completed','failed'];
  const filter = validFilters.includes(params.get('filter')) ? params.get('filter') : 'all';

  const title = document.querySelector('[data-orders-title]');
  const subtitle = document.querySelector('[data-orders-subtitle]');
  const searchButton = document.querySelector('[data-orders-search-button]');
  const filters = document.querySelector('[data-orders-filters]');
  const filterLinks = [...document.querySelectorAll('[data-orders-filter]')];
  const searchField = document.querySelector('[data-orders-search-field]');
  const sectionTitle = document.querySelector('[data-orders-section-title]');
  const sectionMeta = document.querySelector('[data-orders-section-meta]');
  const realCard = document.querySelector('[data-order-card="real"]');
  const normalCard = document.querySelector('[data-order-card="normal"]');
  const empty = document.querySelector('[data-orders-empty]');
  const emptyIcon = document.querySelector('[data-orders-empty-icon]');
  const emptyTitle = document.querySelector('[data-orders-empty-title]');
  const emptyCopy = document.querySelector('[data-orders-empty-copy]');
  const notice = document.querySelector('[data-orders-notice]');
  const noticeTitle = document.querySelector('[data-orders-notice-title]');
  const noticeCopy = document.querySelector('[data-orders-notice-copy]');

  const showCard = (card, show) => { if (card) card.hidden = !show; };
  const showEmpty = (show, search = false) => {
    if (!empty) return;
    empty.hidden = !show;
    empty.classList.toggle('search', Boolean(search));
  };

  if (view === 'search') {
    if (title) title.textContent = 'Search orders';
    if (subtitle) subtitle.textContent = 'Find service or reference';
    if (searchButton) { searchButton.textContent = '‹'; searchButton.href = '/orders.html'; searchButton.setAttribute('aria-label','Back to orders'); }
    if (filters) filters.hidden = true;
    if (searchField) searchField.hidden = false;
    if (sectionTitle) sectionTitle.textContent = 'Search results';
    if (sectionMeta) sectionMeta.textContent = 'Live data';
    showCard(realCard,false); showCard(normalCard,false);
    showEmpty(true,true);
    if (emptyIcon) emptyIcon.textContent = '⌕';
    if (emptyTitle) emptyTitle.textContent = 'Search your orders';
    if (emptyCopy) emptyCopy.textContent = 'The live app returns matching production orders as you search.';
    if (notice) notice.hidden = true;
    return;
  }

  if (searchButton) { searchButton.textContent = '⌕'; searchButton.href = '/orders.html?view=search'; searchButton.setAttribute('aria-label','Search orders'); }
  if (filters) filters.hidden = false;
  if (searchField) searchField.hidden = true;
  filterLinks.forEach(link => {
    const active = link.dataset.ordersFilter === filter;
    link.classList.toggle('active',active);
    if (active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
  });
  if (notice) notice.hidden = false;

  if (filter === 'processing') {
    if (sectionTitle) sectionTitle.textContent = 'Processing orders';
    if (sectionMeta) sectionMeta.textContent = '2 active';
    showCard(realCard,true); showCard(normalCard,true); showEmpty(false);
    if (noticeTitle) noticeTitle.textContent = 'Live order updates';
    if (noticeCopy) noticeCopy.textContent = 'Status, amount and references come from production data.';
    return;
  }

  if (filter === 'completed' || filter === 'failed') {
    const completed = filter === 'completed';
    if (sectionTitle) sectionTitle.textContent = completed ? 'Completed orders' : 'Failed orders';
    if (sectionMeta) sectionMeta.textContent = 'Live data';
    showCard(realCard,false); showCard(normalCard,false); showEmpty(true,false);
    if (emptyIcon) emptyIcon.textContent = completed ? '✓' : '!';
    if (emptyTitle) emptyTitle.textContent = completed ? 'Completed orders' : 'Failed orders';
    if (emptyCopy) emptyCopy.textContent = completed ? 'Production-completed orders will appear here.' : 'Production-failed orders will appear here.';
    if (noticeTitle) noticeTitle.textContent = 'Production records only';
    if (noticeCopy) noticeCopy.textContent = 'This prototype does not fabricate completed or failed order history.';
    return;
  }

  if (sectionTitle) sectionTitle.textContent = 'Recent orders';
  if (sectionMeta) sectionMeta.textContent = '1 active';
  showCard(realCard,true); showCard(normalCard,false); showEmpty(false);
  if (noticeTitle) noticeTitle.textContent = 'Live order updates';
  if (noticeCopy) noticeCopy.textContent = 'Status, amount and references come from production data.';
})();
