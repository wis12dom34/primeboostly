(() => {
  const params = new URLSearchParams(location.search);
  const amount = Number(params.get('amount'));
  const returnPath = params.get('return');
  if (Number.isFinite(amount) && amount > 0) {
    const charge = Math.round(amount * 0.015 * 100) / 100;
    const total = amount + charge;
    const money = value => `₦${value.toLocaleString('en-NG', {minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2})}`;
    document.querySelector('[data-pay-due]')?.replaceChildren(document.createTextNode(`Please Pay ${money(total)} NGN`));
    document.querySelectorAll('[data-pay-credit]').forEach(node => node.textContent = `To Get ${money(amount)} NGN${node.classList.contains('mobile-only') ? '' : ' in your Wallet'}`);
    document.querySelector('[data-pay-amount]')?.replaceChildren(document.createTextNode(money(amount)));
    document.querySelector('[data-pay-charge]')?.replaceChildren(document.createTextNode(money(charge)));
  }
  const button = document.querySelector('[data-pay-complete]');
  if (button && returnPath && returnPath.startsWith('/')) button.href = returnPath;
})();
