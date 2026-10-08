(()=>{
  const fields=[...document.querySelectorAll('[data-email-field]')],feedback=document.querySelector('[data-send-email-feedback]');
  fields.forEach(field=>{const key=field.dataset.emailField;const sync=()=>document.querySelectorAll(`[data-email-field="${CSS.escape(key)}"]`).forEach(peer=>{if(peer!==field)peer.value=field.value});field.addEventListener('input',sync);field.addEventListener('change',sync)});
  const audienceCounts={'All users':'18,442 users','Funded users':'2,840 users','New users':'194 users','Single user':'1 user'};
  const updateCount=()=>{const value=document.querySelector('[data-email-field="audience"]')?.value||'All users';document.querySelectorAll('[data-recipient-count]').forEach(x=>x.textContent=audienceCounts[value]||'18,442 users')};
  document.querySelectorAll('[data-email-field="audience"]').forEach(x=>x.addEventListener('change',updateCount));
  const toast=message=>{if(!feedback)return;feedback.textContent=message;feedback.classList.add('show');clearTimeout(feedback._t);feedback._t=setTimeout(()=>feedback.classList.remove('show'),2200)};
  document.querySelectorAll('[data-toggle-email]').forEach(button=>button.addEventListener('click',()=>{button.classList.toggle('enabled');button.textContent=button.classList.contains('enabled')?'Email enabled':'Email disabled'}));
  document.querySelectorAll('[data-toggle-link]').forEach(button=>button.addEventListener('click',()=>button.classList.toggle('enabled')));
  document.querySelectorAll('[data-send-email-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const subject=document.querySelector('[data-email-field="subject"]')?.value.trim(),message=document.querySelector('[data-email-field="message"]')?.value.trim();if(!subject||!message){toast('Add a subject and message.');return}toast('Preview email prepared. No production email was sent.')}));
  updateCount();
})();
