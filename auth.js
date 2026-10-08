(()=>{
  const ACCOUNT='primeboostly.preview.account.v1',SESSION='primeboostly.preview.session.v1',RESET='primeboostly.preview.reset.v1';
  const $=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
  const read=(k,store=localStorage)=>{try{return JSON.parse(store.getItem(k)||'null')}catch{return null}};
  const write=(k,v,store=localStorage)=>store.setItem(k,JSON.stringify(v));
  const drop=k=>{localStorage.removeItem(k);sessionStorage.removeItem(k)};
  const session=()=>read(SESSION,sessionStorage)||read(SESSION,localStorage);
  const value=(form,...names)=>{for(const name of names){const el=$(`[name="${name}"]`,form);if(el&&el.value.trim())return el.value.trim()}return''};
  async function hash(v){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  function error(form,msg){const el=$('[data-auth-error]',form);if(el){el.textContent=msg;el.classList.add('show')}}
  function success(form,msg){const el=$('[data-auth-success]',form);if(el){el.textContent=msg;el.classList.add('show')}}
  function clear(form){all('[data-auth-error],[data-auth-success]',form).forEach(x=>{x.textContent='';x.classList.remove('show')});all('[aria-invalid=true]',form).forEach(x=>x.removeAttribute('aria-invalid'))}
  function loading(form,on,label){const b=$('[type=submit]',form);if(!b)return;if(on){b.dataset.labelHtml=b.innerHTML;b.textContent=label;b.disabled=true}else{if(b.dataset.labelHtml)b.innerHTML=b.dataset.labelHtml;b.disabled=false}}
  function nextUrl(){const n=new URLSearchParams(location.search).get('next');return n&&n.startsWith('/')&&!n.startsWith('//')?n:'/dashboard.html'}
  function makeToken(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`}

  all('[data-password-toggle]').forEach(btn=>btn.addEventListener('click',()=>{const input=document.getElementById(btn.dataset.passwordToggle);if(!input)return;const show=input.type==='password';input.type=show?'text':'password';btn.textContent=show?'Hide':'Show';btn.setAttribute('aria-pressed',String(show))}));

  const protectedPage=document.body.dataset.authProtected==='true';
  if(protectedPage&&!session()){location.replace('/login.html?next='+encodeURIComponent(location.pathname+location.search));return}
  const s=session();
  if(s){all('[data-auth-avatar]').forEach(el=>el.textContent=(s.username||s.email||'PB').slice(0,2).toUpperCase());all('[data-auth-name]').forEach(el=>el.textContent=s.username||s.email)}
  all('[data-auth-logout]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();drop(SESSION);location.href='/login.html'}));

  all('[data-auth-login]').forEach(form=>form.addEventListener('submit',async e=>{
    e.preventDefault();clear(form);
    const id=value(form,'identity'),pw=value(form,'password');
    if(!id||!pw){error(form,'Enter your username/email and password.');return}
    loading(form,true,'Signing in…');
    try{
      const a=read(ACCOUNT);
      if(!a){error(form,'No preview account exists yet. Create an account first.');return}
      const match=[a.username,a.email].some(v=>(v||'').toLowerCase()===id.toLowerCase());
      if(!match||await hash(pw)!==a.passwordHash){error(form,'Incorrect username/email or password.');return}
      const payload={username:a.username,email:a.email,firstName:a.firstName||'',lastName:a.lastName||'',loginAt:new Date().toISOString()};
      drop(SESSION);write(SESSION,payload,$('[name=remember]',form)?.checked?localStorage:sessionStorage);location.href=nextUrl();
    }catch{error(form,'Could not sign in. Please try again.')}finally{loading(form,false,'')}
  }));

  const reg=$('[data-auth-register]');
  if(reg)reg.addEventListener('submit',async e=>{
    e.preventDefault();clear(reg);
    const firstName=value(reg,'firstName'),lastName=value(reg,'lastName'),u=value(reg,'username','username-mobile'),em=value(reg,'email','email-mobile'),phone=value(reg,'phone'),pw=value(reg,'password','password-mobile'),cf=value(reg,'confirm','confirm-mobile');
    if(!firstName||!lastName){error(reg,'Enter your first and last name.');return}
    if(u.length<3){error(reg,'Username must be at least 3 characters.');return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){error(reg,'Enter a valid email address.');return}
    if(!phone){error(reg,'Enter your phone number.');return}
    if(pw.length<8){error(reg,'Password must be at least 8 characters.');return}
    if(pw!==cf){error(reg,'Passwords do not match.');return}
    loading(reg,true,'Creating account…');
    try{
      const existing=read(ACCOUNT);
      if(existing&&((existing.email||'').toLowerCase()===em.toLowerCase()||(existing.username||'').toLowerCase()===u.toLowerCase())){error(reg,'That preview account already exists. Sign in instead.');return}
      const account={firstName,lastName,username:u,email:em,phone,passwordHash:await hash(pw),createdAt:new Date().toISOString()};
      write(ACCOUNT,account);drop(SESSION);write(SESSION,{username:u,email:em,firstName,lastName,loginAt:new Date().toISOString()},sessionStorage);success(reg,'Account created. Opening your dashboard…');setTimeout(()=>location.href='/dashboard.html',450);
    }catch{error(reg,'Could not create the account. Please try again.')}finally{loading(reg,false,'')}
  });

  const reset=$('[data-auth-reset]');
  if(reset)reset.addEventListener('submit',e=>{
    e.preventDefault();clear(reset);
    const em=value(reset,'email'),a=read(ACCOUNT);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){error(reset,'Enter a valid email address.');return}
    if(!a||(a.email||'').toLowerCase()!==em.toLowerCase()){error(reset,'No preview account was found with that email.');return}
    const t=makeToken();write(RESET,{email:a.email,token:t,requestedAt:Date.now()});
    success(reset,'Reset link prepared. Opening the password reset screen…');
    setTimeout(()=>location.href=`/reset-password.html?email=${encodeURIComponent(a.email)}&token=${encodeURIComponent(t)}`,350);
  });

  const change=$('[data-auth-new-password],[data-password-change]');
  if(change){
    const q=new URLSearchParams(location.search),stored=read(RESET),a=read(ACCOUNT),active=session();
    const emailInput=$('[data-reset-email]',change)||$('[name="changeEmail"]',change);
    const hinted=q.get('email')||stored?.email||active?.email||a?.email||'';
    if(emailInput&&hinted)emailInput.value=hinted;
    change.addEventListener('submit',async e=>{
      e.preventDefault();clear(change);
      const em=value(change,'email','changeEmail'),pw=value(change,'password','newPassword'),cf=value(change,'confirm','confirmNewPassword');
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){error(change,'Enter a valid email address.');return}
      if(pw.length<8){error(change,'Password must be at least 8 characters.');return}
      if(pw!==cf){error(change,'Passwords do not match.');return}
      const account=read(ACCOUNT),request=read(RESET),queryToken=q.get('token');
      if(!account||(account.email||'').toLowerCase()!==em.toLowerCase()){error(change,'No preview account was found with that email.');return}
      const fresh=request&&Date.now()-Number(request.requestedAt||0)<30*60*1000;
      const fromLink=Boolean(fresh&&queryToken&&request.token===queryToken&&(request.email||'').toLowerCase()===em.toLowerCase());
      const fromSession=Boolean(active&&(active.email||'').toLowerCase()===em.toLowerCase());
      if(!fromLink&&!fromSession){error(change,'This reset request is missing or expired. Request a new reset link.');return}
      loading(change,true,'Resetting…');
      try{
        write(ACCOUNT,{...account,passwordHash:await hash(pw),passwordUpdatedAt:new Date().toISOString()});
        drop(RESET);drop(SESSION);success(change,'Password updated. Opening sign in…');setTimeout(()=>location.href='/login.html',450);
      }catch{error(change,'Could not reset the password. Please try again.')}finally{loading(change,false,'')}
    });
  }
})();