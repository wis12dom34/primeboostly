(()=>{
  const defaults={primary:'#2DB05E',dark:'#23924D',background:'#F8FBF8',surface:'#FFFFFF',text:'#16212D',muted:'#6C7B88'};
  const cssVars={primary:'--primary',dark:'--dark',background:'--page',surface:'--surface',text:'--text',muted:'--muted'};
  const valid=v=>/^#[0-9a-f]{6}$/i.test(v||'');
  const state={...defaults};
  const displayValue=(key,value)=>key==='dark'&&value.toUpperCase()==='#23924D'?'#24934D':value.toUpperCase();
  const applyColor=(key,value)=>{if(!valid(value)||!(key in defaults))return false;value=value.toUpperCase();state[key]=value;document.body.style.setProperty(cssVars[key],value);document.querySelectorAll(`[data-picker="${key}"]`).forEach(el=>el.value=value.toLowerCase());document.querySelectorAll(`[data-swatch="${key}"]`).forEach(el=>el.style.background=value);document.querySelectorAll(`[data-color-label="${key}"]`).forEach(el=>el.textContent=displayValue(key,value));return true};
  let saved={};try{saved=JSON.parse(localStorage.getItem('primeboostly.admin.colors')||'{}')}catch{}
  Object.keys(defaults).forEach(k=>applyColor(k,valid(saved[k])?saved[k]:defaults[k]));
  document.querySelectorAll('[data-picker]').forEach(p=>p.addEventListener('input',()=>applyColor(p.dataset.picker,p.value)));
  document.querySelectorAll('[data-colors-reset]').forEach(btn=>btn.addEventListener('click',()=>{Object.entries(defaults).forEach(([k,v])=>applyColor(k,v));localStorage.removeItem('primeboostly.admin.colors');document.querySelectorAll('[data-color-feedback]').forEach(x=>x.textContent='Defaults restored.')}));
  document.querySelectorAll('[data-colors-save]').forEach(btn=>btn.addEventListener('click',()=>{localStorage.setItem('primeboostly.admin.colors',JSON.stringify(state));document.querySelectorAll('[data-color-feedback]').forEach(x=>x.textContent='Theme saved for this preview.')}));

  const pluginGroups=[...document.querySelectorAll('.plugins-desktop,.plugins-mobile')].filter(g=>g.querySelector('[data-plugin]'));
  const pluginLabels={enabled:'Enabled',disabled:'Disabled','needs-setup':'Needs setup'};
  pluginGroups.forEach(group=>{
    const plugins=[...group.querySelectorAll('[data-plugin]')],feedback=group.querySelector('[data-plugin-feedback]');
    const renderPlugin=p=>{const state=p.dataset.state||'disabled',badge=p.querySelector('[data-plugin-status]');if(badge){badge.textContent=pluginLabels[state]||'Disabled';badge.className=`plugin-state ${state}`}};
    plugins.forEach(p=>{renderPlugin(p);p.querySelector('[data-plugin-config]')?.addEventListener('click',()=>{if(feedback)feedback.textContent=`${p.dataset.name} configuration is ready to edit in this preview.`})});
    if(group.classList.contains('plugins-desktop')){const enabled=plugins.filter(p=>p.dataset.state==='enabled').length,needsSetup=plugins.filter(p=>p.dataset.state==='needs-setup').length,disabled=plugins.length-enabled;group.querySelectorAll('[data-plugin-enabled]').forEach(x=>x.textContent=enabled);group.querySelectorAll('[data-plugin-disabled]').forEach(x=>x.textContent=disabled);group.querySelectorAll('[data-plugin-needs-setup]').forEach(x=>x.textContent=needsSetup)}
  });
})();
