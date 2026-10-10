(() => {
  const root = document.querySelector('.spfv2');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  const validTypes = ['order','wallet','account','general'];
  const type = validTypes.includes(params.get('type')) ? params.get('type') : 'order';
  const submitted = params.get('state') === 'submitted';
  const title = root.querySelector('[data-support-title]');
  const body = root.querySelector('[data-support-body]');
  const back = root.querySelector('.spfv2-back');
  if (!title || !body || !back) return;

  const configs = {
    order: {
      title:'Order Support', notice:'Order Support',
      noticeCopy:'Tell us which order needs attention and what happened.',
      firstTitle:'Order reference', firstCopy:'Enter the order ID you need help with', firstPlaceholder:'Required',
      secondTitle:'Issue details', secondCopy:'Describe what went wrong', secondPlaceholder:'Required',
      optionalTitle:'Evidence', optionalCopy:'Attach screenshot or proof'
    },
    wallet: {
      title:'Wallet Support', notice:'Wallet Support',
      noticeCopy:'Use this flow for funding, balance or wallet issues. Real transaction records are attached in production.',
      firstTitle:'Transaction', firstCopy:'Choose the affected wallet activity', firstPlaceholder:'Required',
      secondTitle:'Issue details', secondCopy:'Describe the wallet or funding problem', secondPlaceholder:'Required',
      optionalTitle:'Evidence', optionalCopy:'Attach receipt or screenshot'
    },
    account: {
      title:'Account Access Support', notice:'Account Access Support',
      noticeCopy:'Use this flow when you cannot sign in or need account-access assistance. Sensitive credentials are never displayed here.',
      firstTitle:'Access issue', firstCopy:'Choose login, password or verification', firstPlaceholder:'Required',
      secondTitle:'Issue details', secondCopy:'Describe what is blocking access', secondPlaceholder:'Required',
      staticTitle:'Contact email', staticCopy:'Uses your verified account email', staticAction:'Account email'
    },
    general: {
      title:'General Support', notice:'General Support',
      noticeCopy:'Ask a question or tell us how we can help.',
      firstTitle:'Topic', firstCopy:'Choose the closest help topic', firstPlaceholder:'Required',
      secondTitle:'Question', secondCopy:'Describe what you need help with', secondPlaceholder:'Required',
      optionalTitle:'Attachment', optionalCopy:'Add supporting evidence if useful'
    }
  };
  const cfg = configs[type];

  const copyBlock = (rowTitle,rowCopy) => {
    const copy = document.createElement('span'); copy.className = 'spfv2-copy';
    const strong = document.createElement('strong'); strong.textContent = rowTitle;
    const small = document.createElement('small'); small.textContent = rowCopy;
    copy.append(strong,small); return {copy,strong,small};
  };
  const notice = (heading,copy) => {
    const box = document.createElement('div'); box.className = 'spfv2-notice';
    const info = document.createElement('span'); info.className = 'spfv2-info'; info.textContent = 'i';
    const text = document.createElement('span'); text.className = 'spfv2-notice-copy';
    const strong = document.createElement('strong'); strong.textContent = heading;
    const small = document.createElement('small'); small.textContent = copy;
    text.append(strong,small); box.append(info,text); return box;
  };
  const textRow = ({title:rowTitle,copy:rowCopy,action,href,dark=false,disabled=false}) => {
    const row = document.createElement(href ? 'a' : 'div');
    row.className = `spfv2-row${dark ? ' dark' : ''}${disabled ? ' disabled' : ''}`;
    if (href) row.href = href;
    if (disabled) row.setAttribute('aria-disabled','true');
    const block = copyBlock(rowTitle,rowCopy);
    const end = document.createElement('span'); end.className = 'spfv2-action'; end.textContent = action;
    row.append(block.copy,end); return {row,block,end};
  };
  const inputRow = ({title:rowTitle,copy:rowCopy,placeholder}) => {
    const row = document.createElement('div'); row.className = 'spfv2-row';
    const block = copyBlock(rowTitle,rowCopy);
    const input = document.createElement(/details|question/i.test(rowTitle)?'textarea':'input'); input.className = 'spfv2-input'; input.placeholder = placeholder; input.setAttribute('aria-label',rowTitle);
    row.append(block.copy,input); return {row,block,input};
  };
  const evidenceRow = ({title:rowTitle,copy:rowCopy}) => {
    const row = document.createElement('label'); row.className = 'spfv2-row spfv2-evidence';
    const block = copyBlock(rowTitle,rowCopy);
    const end = document.createElement('span'); end.className = 'spfv2-action'; end.textContent = 'Optional';
    const file = document.createElement('input'); file.className = 'spfv2-file'; file.type = 'file'; file.accept = 'image/*,.pdf'; file.setAttribute('aria-label',rowTitle);
    file.addEventListener('change',() => { end.textContent = file.files?.length ? 'Attached' : 'Optional'; });
    row.append(block.copy,end,file); return row;
  };
  const foot = text => { const p=document.createElement('p'); p.className='spfv2-foot'; p.textContent=text; return p; };

  body.textContent = '';
  if (submitted) {
    title.textContent = 'Request received';
    back.href = '/support.html';
    body.append(
      notice('Support request','Your request is ready for review. This preview does not send a live support request.'),
      textRow({title:'Support review',copy:'Request details are ready for review',action:'Submitted'}).row,
      textRow({title:'Case reference',copy:'Support reviews the attached context',action:'Preview'}).row,
      textRow({title:'Back to Support',copy:'Shown after the live case is created',action:'Live data'}).row,
      textRow({title:'Back to Support',copy:'Return to the Support center',action:'Open',href:'/support.html'}).row,
      foot('Case IDs, replies and status are shown only when returned by the production support system.')
    );
    return;
  }

  title.textContent = cfg.title;
  back.href = '/support.html';
  const first = inputRow({title:cfg.firstTitle,copy:cfg.firstCopy,placeholder:cfg.firstPlaceholder});
  const second = inputRow({title:cfg.secondTitle,copy:cfg.secondCopy,placeholder:'Describe what happened and how we can help'});
  const submit = textRow({title:'Submit request',copy:type === 'account' ? 'Creates a secure support case' : 'Tell us what you need help with',action:'Complete required fields first',href:'#',disabled:true});

  submit.row.classList.add('pb-primary-button');
  body.append(notice(cfg.notice,cfg.noticeCopy),first.row);
  if (type === 'account') {
    body.append(textRow({title:cfg.staticTitle,copy:cfg.staticCopy,action:cfg.staticAction}).row,second.row,submit.row);
  } else {
    body.append(second.row,evidenceRow({title:cfg.optionalTitle,copy:cfg.optionalCopy}),submit.row);
  }
  body.append(foot('Exact case IDs, messages and account data are supplied by the production support system.'));

  const sync = () => {
    const ready = Boolean(first.input.value.trim() && second.input.value.trim());
    first.input.placeholder = type==='order'?'e.g. #1247':type==='wallet'?'Transaction reference':'Tell us the topic';
    second.input.placeholder = 'Describe what happened and how we can help';
    submit.row.classList.toggle('disabled',!ready);
    submit.row.setAttribute('aria-disabled',String(!ready));
    submit.block.small.textContent = ready ? (type === 'account' ? 'Ready for secure production support' : 'Ready to review your request') : (type === 'account' ? 'Creates a secure support case' : 'Tell us what you need help with');
    submit.end.textContent = ready ? 'Submit ›' : 'Complete required fields first';
    submit.row.classList.toggle('dark',ready);
    submit.row.href = ready ? `/support-flow.html?type=${encodeURIComponent(type)}&state=submitted` : '#';
  };
  first.input.addEventListener('input',sync);
  second.input.addEventListener('input',sync);
  sync();
})();
