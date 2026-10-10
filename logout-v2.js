(() => {
  const state = new URLSearchParams(location.search).get('state') === 'signed-out' ? 'signed-out' : 'confirm';
  document.querySelectorAll('[data-logout-screen]').forEach(screen => {
    screen.classList.toggle('active', screen.dataset.logoutScreen === state);
  });
})();
