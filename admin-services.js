(()=>{
  const normalize=v=>(v||'').trim().toLowerCase();
  const inputs=[...document.querySelectorAll('[data-service-search]')];
  const provider=document.querySelector('[data-service-provider]');
  const category=document.querySelector('[data-service-category]');
  const rows=[...document.querySelectorAll('[data-service-row]')];
  const cards=[...document.querySelectorAll('[data-service-card]')];
  const run=(source)=>{
    const raw=source?.value||'';
    const q=normalize(raw==='Service ID or name'?'':raw);
    inputs.forEach(input=>{if(input!==source)input.value=raw});
    const p=provider?.value||'all',c=category?.value||'all';
    let visibleRows=0,visibleCards=0;
    rows.forEach(row=>{const text=normalize(`${row.dataset.id} ${row.dataset.name}`),show=(!q||text.includes(q))&&(p==='all'||row.dataset.provider===p)&&(c==='all'||row.dataset.category===c);row.hidden=!show;if(show)visibleRows++});
    cards.forEach(card=>{const text=normalize(`${card.dataset.id} ${card.dataset.name}`),show=!q||text.includes(q);card.hidden=!show;if(show)visibleCards++});
    document.querySelectorAll('[data-services-empty]').forEach((empty,index)=>empty.hidden=(index===0?visibleRows:visibleCards)>0);
  };
  inputs.forEach(input=>{input.addEventListener('focus',()=>{if(input.value==='Service ID or name')input.value=''});input.addEventListener('input',()=>run(input))});
  provider?.addEventListener('change',()=>run(inputs[0]));category?.addEventListener('change',()=>run(inputs[0]));
  document.querySelector('[data-services-filter]')?.addEventListener('submit',e=>{e.preventDefault();run(inputs[0])});
})();
