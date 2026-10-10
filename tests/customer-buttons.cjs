const {chromium}=require('playwright');
const assert=require('node:assert/strict'), http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{let file=path.join(root,new URL(req.url,'http://localhost').pathname);if(!path.extname(file))file+='.html';fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end()}res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':file.endsWith('.svg')?'image/svg+xml':'text/html');res.end(data)})});
const routes=['dashboard','dashboard?mode=new','dashboard?mode=new&step=platform','dashboard?mode=new&step=ready&platform=instagram','dashboard?mode=new&step=review&platform=instagram&profile=https://instagram.com/test&quantity=100','dashboard?mode=new&step=price&platform=instagram&profile=https://instagram.com/test&quantity=100','dashboard?mode=new&step=submitted&platform=instagram&profile=https://instagram.com/test&quantity=100','services','services-search','global-search','normal-smm','normal-smm?platform=instagram&step=services','normal-smm?platform=instagram&step=order&serviceId=QA1&serviceName=Instagram%20Followers&min=100&max=10000&rate=1000','normal-smm?platform=instagram&step=review&serviceName=Instagram%20Followers&profile=https://instagram.com/test&quantity=100','normal-smm?platform=instagram&step=price','normal-smm?platform=instagram&step=submitted','orders','orders?view=search','orders?filter=completed','orders?filter=failed','order-detail','order-detail?type=normal','order-history','add-funds','add-funds?step=amount','add-funds?step=method&amount=1000','add-funds?step=review&amount=1000&method=paystack','paystack-checkout?amount=1000','manual-deposit','payment-success','payment-failed','fund-history','transactions','support','support-flow?type=order','new-ticket','ticket-detail','settings','profile-flow?view=account','profile-flow?view=wallet','profile-flow?view=notifications','profile-flow?view=security','account-edit?field=username','security','security-flow','notifications','notifications?filter=wallet','refund-confirmation','logout','system-states','login','register','forgot-password','reset-password','api-docs','mobile-menu'];
(async()=>{
 await new Promise(resolve=>server.listen(8083,resolve));
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--no-zygote','--single-process','--disable-gpu']}: {})});
 try{
 const context=await browser.newContext();
 await context.addInitScript(()=>sessionStorage.setItem('primeboostly.preview.session.v1',JSON.stringify({username:'QA',email:'qa@example.com'})));
 const page=await context.newPage();let checked=0;const errors=[];page.on('pageerror',error=>errors.push(error.message));
 for(const width of (process.env.UI_TEST_WIDTHS?process.env.UI_TEST_WIDTHS.split(',').map(Number):[320,360,375,390,393,414,430,440,768,1280])){
 await page.setViewportSize({width,height:852});
 for(const route of routes){
 await page.goto('http://localhost:8083/'+route);
 const controls=await page.locator('.pb-screen a,.pb-screen button,.auth-form-panel a,.auth-form-panel button').evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length).map(n=>({name:n.getAttribute('aria-label')||n.textContent.trim(),width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height,href:n.getAttribute('href'),cls:n.className})));
 const label=width+'px '+route;
 for(const control of controls){assert(control.name,label+' accessible name '+control.cls);assert(control.height>=43.5&&control.width>=43.5,label+' touch target '+control.name);assert(!control.href?.includes('/admin-'),label+' customer destination '+control.name)}
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),label+' no horizontal overflow');
 if(width===393&&process.env.BUTTON_SCREENSHOTS){fs.mkdirSync(process.env.BUTTON_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.BUTTON_SCREENSHOTS,String(routes.indexOf(route)).padStart(2,'0')+'.png'),fullPage:true})}
 checked+=controls.length;
 }
 console.log('Checked customer buttons at '+width+'px');
 }
 await page.setViewportSize({width:393,height:852});
 await page.goto('http://localhost:8083/ticket-detail');await page.locator('.cd-mobile [name=reply]').fill('Please review my order.');await page.getByRole('button',{name:'Send Reply',exact:true}).click();assert((await page.locator('.cd-mobile [data-ticket-thread]').innerText()).includes('Please review my order.'));
 await page.goto('http://localhost:8083/fund-history');await page.getByRole('button',{name:'Pending',exact:true}).click();assert.equal(await page.locator('.fund-history-card:visible').count(),1);
 await page.getByRole('searchbox').fill('no matching payment');await page.getByRole('button',{name:'Clear filters',exact:true}).click();assert.equal(await page.getByRole('button',{name:'All',exact:true}).getAttribute('aria-pressed'),'true');assert.equal(await page.getByRole('button',{name:'Pending',exact:true}).getAttribute('aria-pressed'),'false');assert.equal(await page.locator('.fund-history-card:visible').count(),3);
 await page.goto('http://localhost:8083/profile-flow?view=notifications');const toggle=page.getByRole('button',{name:'Order updates: on',exact:true});assert.equal(await toggle.locator('xpath=..').evaluate(n=>n.tagName),'DIV');await toggle.click();assert.equal(await page.getByRole('button',{name:'Order updates: off',exact:true}).getAttribute('aria-pressed'),'false');
 await page.goto('http://localhost:8083/security-flow');await page.getByRole('button',{name:'Show new password',exact:true}).click();assert(await page.getByRole('button',{name:'Hide new password',exact:true}).isVisible());await page.getByRole('textbox',{name:'New password',exact:true}).fill('PreviewNew123!');await page.locator('input[aria-label="Current password"]').fill('PreviewOld123!');await page.locator('input[aria-label="Confirm password"]').fill('PreviewNew123!');await page.getByRole('link',{name:/Update password/}).click();await page.waitForURL('**/security-flow.html?view=verify&kind=password');
 await page.goto('http://localhost:8083/normal-smm?platform=instagram&step=review');await page.locator('.nsm-screen.active .pb-primary-nav').getByRole('link',{name:'Order',exact:true}).click();await page.waitForURL('**/dashboard.html?mode=new');
 await page.goto('http://localhost:8083/manual-deposit');assert(await page.getByRole('button',{name:'Submit payment proof',exact:true}).isDisabled());await page.getByRole('link',{name:'Get payment help',exact:true}).click();await page.waitForURL('**/support-flow.html?type=wallet');
 await page.goto('http://localhost:8083/refund-confirmation');await page.getByRole('link',{name:'Request refund',exact:true}).click();await page.waitForURL('**/support-flow.html?type=order');
 assert.deepEqual(errors,[],'No page JavaScript errors');
 console.log('PASS: '+checked+' customer control checks, payment filter/reset, notification toggles, password visibility, order navigation, payment help and refund support destinations');
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
