(()=>{
  const key='primeboostly.admin.basic-controls';
  const fields=[...document.querySelectorAll('[data-control-setting]')];
  let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')}catch{}
  fields.forEach(field=>{const name=field.dataset.controlSetting;if(saved[name]!==undefined)field.value=saved[name];const sync=()=>document.querySelectorAll(`[data-control-setting="${CSS.escape(name)}"]`).forEach(peer=>{if(peer!==field)peer.value=field.value});field.addEventListener('input',sync);field.addEventListener('change',sync)});
  const collect=()=>{const out={};fields.forEach(field=>out[field.dataset.controlSetting]=field.value);return out};
  const toast=message=>{let el=document.querySelector('.controls-toast');if(!el){el=document.createElement('div');el.className='controls-toast';el.setAttribute('role','status');el.style.cssText='position:fixed;right:18px;bottom:18px;padding:10px 14px;border-radius:10px;background:#16212d;color:#fff;font:600 11px Poppins,sans-serif;z-index:50';document.body.appendChild(el)}el.textContent=message;clearTimeout(el._t);el._t=setTimeout(()=>el.remove(),1800)};
  document.querySelectorAll('[data-controls-save]').forEach(button=>button.addEventListener('click',()=>{localStorage.setItem(key,JSON.stringify(collect()));toast('Settings saved in this preview.')}));
})();
