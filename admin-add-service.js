(()=>{
  const params=new URLSearchParams(location.search),serviceId=params.get('service'),isEdit=Boolean(serviceId);
  const services={
    '101':{serviceName:'Instagram Followers | Fast',provider:'Mercury',providerId:'8441',category:'Instagram',rate:'₦1,850',minimum:'100',maximum:'100,000',averageTime:'0–2 hours',refill:'30 days',visibility:'Active',description:'Fast Instagram followers with gradual delivery. Keep the account public while the order is processing.'},
    '217':{serviceName:'TikTok Views | Instant',provider:'Atlas',providerId:'217',category:'TikTok',rate:'₦720',minimum:'100',maximum:'1,000,000',averageTime:'Instant',refill:'No refill',visibility:'Active',description:'Fast TikTok views with instant-start delivery.'},
    '344':{serviceName:'YouTube Views | HQ',provider:'Mercury',providerId:'344',category:'YouTube',rate:'₦1,200',minimum:'100',maximum:'500,000',averageTime:'0–6 hours',refill:'No refill',visibility:'Hidden',description:'High-quality YouTube views with gradual delivery.'},
    '418':{serviceName:'Telegram Members',provider:'Nova',providerId:'418',category:'Telegram',rate:'₦2,150',minimum:'50',maximum:'100,000',averageTime:'0–4 hours',refill:'30 days',visibility:'Active',description:'Telegram members with gradual delivery.'}
  };
  const data=services[serviceId]||services['101'];
  if(isEdit){
    document.title=`Edit Service #${serviceId} · Prime Boostly Admin`;
    document.querySelectorAll('.ase-header h1').forEach(x=>x.textContent=`Edit Service #${serviceId}`);
    document.querySelectorAll('.ase-header p').forEach(x=>x.textContent='Update provider mapping, rate, limits, visibility, and customer-facing service copy');
    document.querySelectorAll('.asem-title h1').forEach(x=>x.textContent=`Edit Service #${serviceId}`);
    document.querySelectorAll('.asem-title p').forEach(x=>x.textContent='Update the live service configuration.');
    document.querySelectorAll('.ase-nav').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.ase-nav[href="/admin-services.html"]').forEach(x=>x.classList.add('active'));
    document.querySelectorAll('.ase-primary,.asem-primary').forEach(x=>x.textContent='Save Service');
    const health=document.querySelector('.ase-health');if(health)health.innerHTML='<h2>Service Health</h2><span class="ase-pill">Provider online</span><small>Provider rate</small><strong>₦1,340 / 1K</strong><small>Current markup</small><strong>₦510 / 1K</strong><small>Orders today</small><strong>82</strong>';
  }
  const fields=[...document.querySelectorAll('[data-service-field]')],feedback=document.querySelector('[data-service-feedback]'),key=isEdit?`primeboostly.admin.service.${serviceId}.preview`:'primeboostly.admin.add-service.preview';
  const set=(name,value)=>document.querySelectorAll(`[data-service-field="${CSS.escape(name)}"]`).forEach(x=>x.value=value||'');
  if(isEdit)Object.entries(data).forEach(([name,value])=>set(name,value));
  const get=(name)=>document.querySelector(`[data-service-field="${CSS.escape(name)}"]`)?.value||'';
  const sync=(source)=>{const name=source.dataset.serviceField;document.querySelectorAll(`[data-service-field="${CSS.escape(name)}"]`).forEach(peer=>{if(peer!==source)peer.value=source.value});render()};
  const render=()=>{document.querySelectorAll('[data-preview-name]').forEach(x=>x.textContent=get('serviceName')||'New service');document.querySelectorAll('[data-preview-rate]').forEach(x=>x.textContent=`${get('rate')||'₦0'} / 1K`);document.querySelectorAll('[data-preview-limits]').forEach(x=>x.textContent=`${get('minimum')||'0'} – ${get('maximum')||'0'}`);document.querySelectorAll('[data-preview-provider]').forEach(x=>x.textContent=`${get('provider')||'Provider'} · ${get('providerId')||'ID'}`);document.querySelectorAll('[data-service-provider-summary]').forEach(x=>x.value=`${get('provider')||'Mercury'} · ${get('providerId')||'8441'}`)};
  fields.forEach(field=>{field.addEventListener('input',()=>sync(field));field.addEventListener('change',()=>sync(field))});
  document.querySelectorAll('[data-service-provider-summary]').forEach(field=>field.addEventListener('change',()=>{const [provider,id]=field.value.split('·').map(v=>v.trim());const p=document.querySelector('[data-service-field="provider"]'),i=document.querySelector('[data-service-field="providerId"]');if(p&&provider)p.value=provider;if(i&&id)i.value=id;render()}));
  const toast=message=>{if(!feedback)return;feedback.textContent=message;feedback.classList.add('show');clearTimeout(feedback._t);feedback._t=setTimeout(()=>feedback.classList.remove('show'),2200)};
  document.querySelectorAll('[data-service-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const name=get('serviceName').trim();if(!name){toast('Enter a service name.');return}const payload={serviceId:serviceId||null,serviceName:name,provider:get('provider'),providerId:get('providerId'),category:get('category'),rate:get('rate'),minimum:get('minimum'),maximum:get('maximum'),averageTime:get('averageTime'),refill:get('refill'),visibility:get('visibility'),description:get('description'),updatedAt:new Date().toISOString()};localStorage.setItem(key,JSON.stringify(payload));toast(isEdit?'Service saved in this preview.':'Service created in this preview.')}));
  document.querySelectorAll('.asem-menu').forEach(x=>x.href='/admin-mobile-menu.html');
  render();
})();