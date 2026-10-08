(()=>{
  const feedback=document.querySelector('[data-security-feedback]'),storageKey='primeboostly.preview.authenticator-enabled';
  let enabled=localStorage.getItem(storageKey)==='1';
  const toast=message=>{if(!feedback)return;feedback.textContent=message;feedback.classList.add('show');clearTimeout(feedback._t);feedback._t=setTimeout(()=>feedback.classList.remove('show'),1800)};
  const render=()=>document.querySelectorAll('[data-enable-authenticator]').forEach((button,i)=>{button.textContent=enabled?(i===0?'Two Factor Authenticator Enabled':'Authenticator Enabled'):(i===0?'Enable Two Factor Authenticator':'Enable Authenticator')});
  document.querySelectorAll('[data-enable-authenticator]').forEach(button=>button.addEventListener('click',()=>{enabled=!enabled;localStorage.setItem(storageKey,enabled?'1':'0');render();toast(enabled?'Authenticator enabled in this preview.':'Authenticator disabled in this preview.')}));
  document.querySelector('[data-download-authenticator]')?.addEventListener('click',()=>toast('Open your device app store and search for Google Authenticator.'));
  render();
})();
