/* Shared presentation helpers. No requests, wallet mutations or authentication changes. */
(() => {
  const paths = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    grid:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    orders:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v4H9zM9 12h6M9 16h4"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M2 20v-2a7 7 0 0 1 14 0v2M17 5a3 3 0 0 1 0 6M19 14a5 5 0 0 1 3 5v1"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 17h.01"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>',
    back:'<path d="m15 5-7 7 7 7"/>',
    chart:'<path d="M4 20V4M4 20h16M8 15l4-5 4 2 5-8"/>',
    search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
    settings:'<path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/><circle cx="12" cy="12" r="5"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    check:'<path d="m5 12 4 4L19 6"/>'
  };
  function icon(node,name){if(!paths[name])return;node.replaceChildren();node.classList.add('pb-icon');node.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;}
  document.querySelectorAll('[data-icon]').forEach(n=>icon(n,n.dataset.icon));
  const navIcons={Home:'home',Services:'grid',Order:'plus',Orders:'orders',Profile:'user'};
  document.querySelectorAll('.pb-primary-nav').forEach(nav=>{
    nav.querySelectorAll('a').forEach(a=>{
      const label=Object.keys(navIcons).find(k=>a.querySelector('span:last-child')?.textContent.trim()===k||a.textContent.trim()===k)||a.textContent.trim();
      let target=new URL(a.href);let current=new URL(location.href);
      const route=current.pathname.replace(/\.html$/,'');
      const normal=/normal-smm$/.test(route),ordering=normal&&['order','review','price','submitted'].includes(current.searchParams.get('step'));
      const section=/dashboard$/.test(route)?(current.searchParams.has('mode')?'Order':'Home'):/order-detail$|order-history$|refund-confirmation$|orders$/.test(route)?'Orders':/services$|services-search$|global-search$/.test(route)||normal&&!ordering?'Services':ordering?'Order':'Profile';
      const active=label===section;
      a.classList.toggle('active',active);a.removeAttribute('aria-current');if(active)a.setAttribute('aria-current','page');
      a.replaceChildren();const i=document.createElement('span');icon(i,navIcons[label]);const text=document.createElement('span');text.textContent=label;a.append(i,text);
    });
  });
  document.querySelectorAll('.pb-screen [class]').forEach(n=>{
    if(n.closest('.pb-primary-nav')||n.matches('[data-icon]')||n.querySelector('svg'))return;
    const c=[...n.classList];let name;
    if(c.some(x=>x.endsWith('-back')))name='back';
    else if(c.some(x=>x.endsWith('-help')))name='help';
    else if(c.some(x=>x.endsWith('-settings')))name='settings';
    else if(c.some(x=>x.endsWith('-profile')))name='user';
    else if(c.some(x=>x.endsWith('-close')))name='close';
    else if(c.some(x=>x.endsWith('-search-icon'))||n.matches('[data-orders-search-button]'))name=n.getAttribute('aria-label')?.startsWith('Back')?'back':'search';
    else if(c.some(x=>x.endsWith('-menu')))name='grid';
    else if(n.tagName==='SPAN'&&c.some(x=>x.endsWith('-info')||x.endsWith('-info-icon')))name='info';
    else if(c.some(x=>x.endsWith('-arrow')||x.endsWith('-row-arrow'))&&n.textContent.trim()==='›')name='chevron';
    if(name){const span=document.createElement('span');icon(span,name);n.replaceChildren(span);}
    const status=n.textContent.trim().toLowerCase();
    if(['pending','processing','completed','cancelled','refunded','failed'].includes(status)&&!['A','BUTTON','H1','H2'].includes(n.tagName)){
      n.classList.add('pb-status');n.dataset.status=status;
    }
  });
  document.querySelectorAll('.ordrv2-field').forEach((field,i)=>{
    const input=field.querySelector('input');if(!input)return;
    input.id=i===1?'pb-profile-url':'pb-order-quantity';
    input.setAttribute('aria-label',i===1?'Profile link':'Quantity');
    input.required=true;
  });
  // Existing static history lists: enable local filtering without requesting or inventing data.
  for(const prefix of ['transactions-mobile','fund-history-mobile']){
    const search=document.querySelector(`.${prefix}-search div`);
    const cards=[...document.querySelectorAll(prefix==='transactions-mobile'?'.transactions-mobile-card':'.fund-history-card')];
    let term='',filter='all';
    function refresh(){let count=0;cards.forEach(card=>{const text=card.textContent.toLowerCase();const credit=card.querySelector('.credit-amount');const debit=card.querySelector('.debit-amount');const match=(!term||text.includes(term))&&(filter==='all'||filter==='credit'&&credit||filter==='debit'&&debit||filter==='complete'&&text.includes('completed')||filter==='pending'&&text.includes('pending')||filter==='cancel'&&text.includes('cancel'));card.hidden=!match;if(match)count++});let empty=document.querySelector(`[data-empty-for="${prefix}"]`);if(!empty){empty=document.createElement('div');empty.className='pb-empty';empty.dataset.emptyFor=prefix;const title=document.createElement('strong');title.textContent='No transactions found';const copy=document.createElement('p');copy.textContent='Try another search or view all transactions.';const button=document.createElement('button');button.textContent='Clear filters';button.className='pb-primary-button';button.onclick=()=>{term='';filter='all';if(search?.querySelector('input'))search.querySelector('input').value='';refresh()};empty.append(title,copy,button);cards.at(-1)?.after(empty)}empty.hidden=count>0;}
    if(search){const input=document.createElement('input');input.type='search';input.placeholder=search.textContent.trim();input.setAttribute('aria-label','Search transactions');search.replaceChildren(input);input.addEventListener('input',()=>{term=input.value.trim().toLowerCase();refresh()})}
    document.querySelectorAll(`.${prefix}-tabs span`).forEach(span=>{const b=document.createElement('button');b.type='button';b.className=span.className;b.textContent=span.textContent;b.classList.toggle('active',span.className==='all');b.setAttribute('aria-pressed',String(span.className==='all'));span.replaceWith(b);b.onclick=()=>{filter=b.classList[0];b.parentElement.querySelectorAll('button').forEach(n=>{n.classList.toggle('active',n===b);n.setAttribute('aria-pressed',String(n===b))});refresh()}});
  }
  document.addEventListener('click',e=>{const a=e.target.closest('a[aria-disabled=true]');if(a)e.preventDefault()});
})();
/* Empty service/search states use existing routes, never fake catalog data. */
(() => {
  const search=document.querySelector('[data-service-search]');
  if(search){
    const empty=document.createElement('div');empty.className='pb-empty';empty.hidden=true;empty.innerHTML='<strong>No services found</strong><p>Try a different platform or service name.</p><button class="pb-primary-button" type="button">Clear search</button>';
    search.closest('.pb-page-content')?.append(empty);
    const update=()=>empty.hidden=[...document.querySelectorAll('[data-search-item]')].some(n=>!n.hidden);
    search.addEventListener('input',update);empty.querySelector('button').onclick=()=>{search.value='';search.dispatchEvent(new Event('input'));search.focus()};
  }
  const screen=document.querySelector('.nsm-screen[data-screen=services]');
  screen?.querySelectorAll('.is-placeholder').forEach(n=>n.hidden=true);
  const unavailable=screen&&[...screen.querySelectorAll('[data-provider-service]')].every(n=>n.getAttribute('aria-disabled')==='true');
  if(unavailable){screen.querySelectorAll('[data-provider-service]').forEach(n=>n.hidden=true);const empty=document.createElement('div');empty.className='pb-empty';empty.innerHTML='<strong>No services available yet</strong><p>Choose another platform or check back for available services.</p><a href="/normal-smm.html">Choose a platform</a>';screen.querySelector('.pb-page-content')?.append(empty)}
  const quantity=document.querySelector('#nsm-quantity');
  const params=new URLSearchParams(location.search);const min=params.get('min'),max=params.get('max'),rate=Number(params.get('rate'));
  if(quantity){const help=document.createElement('p');help.id='pb-quantity-help';help.textContent=[min?`Minimum ${Number(min).toLocaleString()}`:'',max?`Maximum ${Number(max).toLocaleString()}`:''].filter(Boolean).join(' · ')||'Choose a service to see its quantity limits.';quantity.closest('.nsm-field')?.append(help);quantity.setAttribute('aria-describedby',help.id);quantity.step='1';}
  const priceRows=[...document.querySelectorAll('[data-review-price]')];
  function estimate(){const q=Number(quantity?.value||params.get('quantity'));const total=Number.isFinite(rate)&&rate>0&&q>0?rate*q/1000:null;priceRows.forEach(n=>n.textContent=total===null?'Shown before confirmation':`₦${total.toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})} estimated`)}
  quantity?.addEventListener('input',estimate);estimate();
})();
