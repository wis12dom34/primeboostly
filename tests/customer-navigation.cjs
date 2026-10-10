const {chromium}=require('playwright');
const assert=require('node:assert/strict'), http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{let file=path.join(root,new URL(req.url,'http://localhost').pathname);if(!path.extname(file))file+='.html';fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end()}res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':file.endsWith('.svg')?'image/svg+xml':'text/html');res.end(data)})});
const routes=['dashboard','dashboard?mode=new','dashboard?mode=new&step=platform','dashboard?mode=new&step=ready&platform=instagram','dashboard?mode=new&step=review&platform=instagram&profile=https://instagram.com/test&quantity=100','dashboard?mode=new&step=price&platform=instagram&profile=https://instagram.com/test&quantity=100','dashboard?mode=new&step=submitted&platform=instagram&profile=https://instagram.com/test&quantity=100','services','services-search','global-search','normal-smm','normal-smm?platform=instagram&step=services','normal-smm?platform=instagram&step=order&serviceId=QA1&serviceName=Instagram%20Followers&min=100&max=10000&rate=1000','normal-smm?platform=instagram&step=review&serviceName=Instagram%20Followers&profile=https://instagram.com/test&quantity=100','normal-smm?platform=instagram&step=price','normal-smm?platform=instagram&step=submitted','orders','orders?view=search','orders?filter=completed','orders?filter=failed','order-detail','order-detail?type=normal','order-history','add-funds','add-funds?step=amount','add-funds?step=method&amount=1000','add-funds?step=review&amount=1000&method=paystack','paystack-checkout?amount=1000','manual-deposit','payment-success','payment-failed','fund-history','transactions','support','support-flow?type=order','new-ticket','ticket-detail','settings','profile-flow?view=account','profile-flow?view=wallet','profile-flow?view=notifications','profile-flow?view=security','account-edit?field=username','security','security-flow','notifications','notifications?filter=wallet','refund-confirmation','logout','system-states','login','register','forgot-password','reset-password'];
(async()=>{
 await new Promise(resolve=>server.listen(8082,resolve));
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--no-zygote','--single-process','--disable-gpu']}: {})});
 try{
 const context=await browser.newContext();
 await context.addInitScript(()=>sessionStorage.setItem('primeboostly.preview.session.v1',JSON.stringify({username:'QA',email:'qa@example.com'})));
 const page=await context.newPage();let checked=0;
 for(const width of [320,360,375,390,393,414,430,440,768,1280]){
 await page.setViewportSize({width,height:852});
 for(const route of routes){
 await page.goto('http://localhost:8082/'+route);
 const metrics=await page.evaluate(async()=>{
 const visible=[...document.querySelectorAll('.pb-primary-nav')].filter(n=>n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden');
 if(!visible.length)return null;
 const nav=visible[0],content=nav.closest('.pb-screen').querySelector('.pb-page-content')||nav.closest('.pb-screen');
 const before=nav.getBoundingClientRect();window.scrollTo(0,document.documentElement.scrollHeight);
 await new Promise(resolve=>requestAnimationFrame(resolve));
 const after=nav.getBoundingClientRect();
 return {count:visible.length,position:getComputedStyle(nav).position,beforeY:before.y,afterY:after.y,bottom:after.bottom,viewport:innerHeight,navHeight:after.height,padding:parseFloat(getComputedStyle(content).paddingBottom),overflow:document.documentElement.scrollWidth>innerWidth,targets:[...nav.querySelectorAll('a')].map(a=>a.getBoundingClientRect().height)};
 });
 if(!metrics)continue;
 const label=width+'px '+route;
 assert.equal(metrics.count,1,label+' one navigation');assert.equal(metrics.position,'fixed',label+' fixed navigation');
 assert(Math.abs(metrics.beforeY-metrics.afterY)<1,label+' scroll stability');assert(Math.abs(metrics.bottom-metrics.viewport)<1,label+' viewport bottom');
 assert(metrics.padding>=metrics.navHeight+24,label+' content clearance');assert(!metrics.overflow,label+' horizontal overflow');assert(metrics.targets.every(h=>h>=44),label+' touch targets');checked++;
 }
 }
 await page.setViewportSize({width:393,height:852});await page.goto('http://localhost:8082/dashboard');
 if(process.env.NAV_SCREENSHOT)await page.screenshot({path:process.env.NAV_SCREENSHOT,fullPage:false});
 console.log('PASS: '+checked+' navigation views: fixed position, scroll stability, bottom clearance, one visible bar, touch targets and no horizontal overflow');
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);server.close();process.exitCode=1});
