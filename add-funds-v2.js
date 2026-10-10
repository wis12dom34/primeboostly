(() => {
  const root = document.querySelector('.add-funds-v2');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const validSteps = ['home','amount','amount-entered','method','selected','review','handoff'];
  const step = validSteps.includes(params.get('step')) ? params.get('step') : 'home';
  const amount = params.get('amount') || '';
  const method = params.get('method') || '';

  const title = root.querySelector('[data-fund-title]');
  const back = root.querySelector('[data-fund-back]');
  const rows = [...root.querySelectorAll('[data-fund-row]')];
  const noticeTitle = root.querySelector('[data-fund-notice-title]');
  const noticeCopy = root.querySelector('[data-fund-notice-copy]');

  const makeUrl = (nextStep, overrides = {}) => {
    const url = new URL('/add-funds.html', location.origin);
    url.searchParams.set('step', nextStep);
    const nextAmount = overrides.amount ?? amount;
    const nextMethod = overrides.method ?? method;
    if (nextAmount) url.searchParams.set('amount', nextAmount);
    if (nextMethod) url.searchParams.set('method', nextMethod);
    return url.pathname + url.search;
  };

  const setRow = (index, {title: rowTitle, copy, action, href = '#', locked = false, disabled = false, input = false}) => {
    const row = rows[index];
    if (!row) return;
    row.classList.toggle('locked', locked);
    row.setAttribute('aria-disabled', String(disabled));
    row.href = href;
    const titleNode = row.querySelector('[data-fund-row-title]');
    const copyNode = row.querySelector('[data-fund-row-copy]');
    const actionNode = row.querySelector('[data-fund-row-action]');
    if (titleNode) titleNode.textContent = rowTitle;
    if (copyNode) copyNode.textContent = copy;
    if (!actionNode) return;
    actionNode.textContent = '';
    if (input) {
      const field = document.createElement('input');
      field.className = 'afv2-amount-input';
      field.type = 'number';
      field.min = '1';
      field.inputMode = 'numeric';
      field.placeholder = 'Input amount';
      field.value = amount;
      field.setAttribute('aria-label', 'Funding amount');
      actionNode.appendChild(field);
      field.addEventListener('click', event => event.preventDefault());
      field.addEventListener('input', () => {
        const continueRow = rows[2];
        const ready = Number(field.value) > 0;
        continueRow?.setAttribute('aria-disabled', String(!ready));
        continueRow?.classList.toggle('locked', !ready);
        if (continueRow) continueRow.href = ready ? makeUrl('amount-entered', {amount: field.value, method: ''}) : '#';
      });
    } else {
      actionNode.textContent = action;
    }
  };

  const setNotice = (heading, copy) => {
    if (noticeTitle) noticeTitle.textContent = heading;
    if (noticeCopy) noticeCopy.textContent = copy;
  };

  if (step === 'home') {
    if (title) title.textContent = 'Add funds';
    if (back) back.href = '/settings.html';
    setRow(0, {title:'Funding amount', copy:'Enter the amount in production checkout', action:'Enter amount', href:makeUrl('amount', {amount:'', method:''})});
    setRow(1, {title:'Payment method', copy:'Available after a funding amount is entered', action:'Enter amount first', locked:true, disabled:true});
    setRow(2, {title:'Funding summary', copy:'Available after amount and payment method', action:'Complete previous steps', locked:true, disabled:true});
    setNotice('Secure production checkout','Exact methods, fees and limits come from the live funding system.');
    return;
  }

  if (step === 'amount') {
    if (title) title.textContent = 'Enter amount';
    if (back) back.href = '/add-funds.html';
    setRow(0, {title:'Funding amount', copy:'Enter your funding amount in production', input:true, href:'#'});
    setRow(1, {title:'Currency', copy:'Current wallet funding currency', action:'NGN', href:'#', disabled:true});
    const validAmount = Number(amount) > 0;
    setRow(2, {title:'Continue', copy:'Choose a live payment method next', action:'Next ›', href:validAmount ? makeUrl('amount-entered') : '#', locked:!validAmount, disabled:!validAmount});
    setNotice('Runtime validation','Funding minimums, maximums and eligibility are checked by production.');
    return;
  }

  if (step === 'amount-entered') {
    if (title) title.textContent = 'Amount entered';
    if (back) back.href = makeUrl('amount');
    setRow(0, {title:'Funding amount', copy:'Entered amount from the production form', action:amount ? `₦${Number(amount).toLocaleString('en-NG')}` : 'Runtime amount', href:makeUrl('amount')});
    setRow(1, {title:'Currency', copy:'Current wallet funding currency', action:'NGN', href:'#', disabled:true});
    setRow(2, {title:'Continue', copy:'Choose a live payment method next', action:'Next ›', href:makeUrl('method')});
    setNotice('Runtime validation','Production validates the entered amount and exposes eligible payment methods.');
    return;
  }

  if (step === 'method') {
    if (title) title.textContent = 'Payment method';
    if (back) back.href = makeUrl('amount-entered');
    setRow(0, {title:'Live payment option', copy:'Loaded from the connected funding provider', action:'Select', href:makeUrl('selected', {method:'paystack'})});
    setRow(1, {title:'Another live option', copy:'Availability can vary by amount and account', action:'Select', href:makeUrl('selected', {method:'alternate'})});
    setRow(2, {title:'More payment methods', copy:'Production can expose additional methods', action:'Browse', href:makeUrl('method')});
    setNotice('Provider-driven methods','No processor, fee or payment method is invented in this prototype.');
    return;
  }

  if (step === 'selected') {
    if (title) title.textContent = 'Payment selected';
    if (back) back.href = makeUrl('method');
    setRow(0, {title:'Selected live method', copy:'Method supplied by the connected funding provider', action:'Selected', href:'#', disabled:true});
    setRow(1, {title:'Change payment method', copy:'Return to currently available provider methods', action:'Change ›', href:makeUrl('method', {method:''})});
    setRow(2, {title:'Continue to review', copy:'Fees and exact total are confirmed next', action:'Review ›', href:makeUrl('review')});
    setNotice('Live method selected','The exact provider method and availability remain production-driven.');
    return;
  }

  if (step === 'review') {
    if (title) title.textContent = 'Review funding';
    if (back) back.href = makeUrl('selected');
    setRow(0, {title:'Funding amount', copy:'Entered amount from the previous step', action:amount ? `₦${Number(amount).toLocaleString('en-NG')}` : 'Runtime', href:makeUrl('amount')});
    setRow(1, {title:'Payment method', copy:'Selected from the live funding provider', action:'Live method', href:makeUrl('method')});
    setRow(2, {title:'Continue to checkout', copy:'Final total is confirmed before payment', action:'Continue ›', href:makeUrl('handoff')});
    setNotice('Review before payment','Fees, limits and the exact total are returned by production before checkout.');
    return;
  }

  if (step === 'handoff') {
    if (title) title.textContent = 'Checkout handoff';
    if (back) back.href = makeUrl('review');
    setRow(0, {title:'Funding amount', copy:'Amount confirmed by production', action:'Confirmed', href:'#', disabled:true});
    setRow(1, {title:'Payment method', copy:'Selected from the live funding provider', action:'Selected', href:'#', disabled:true});
    const checkoutHref = method === 'paystack' ? '/paystack-checkout.html' : makeUrl('method', {method:''});
    setRow(2, {title:'Secure checkout', copy:'Production creates the checkout session', action:method === 'paystack' ? 'Continue ›' : 'Choose method ›', href:checkoutHref});
    setNotice('Provider checkout','The live funding system supplies the checkout destination, fees and final total.');
  }
})();
