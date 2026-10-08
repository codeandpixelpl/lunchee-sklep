const {chromium,firefox,webkit}=require('playwright');
const fs=require('fs');
const root=require('node:path').resolve(__dirname,'..');
const base=process.env.BASE_URL||'http://127.0.0.1:8765/';
const os=require('node:os');const path=require('node:path');
(async()=>{
 for (const engine of (process.env.ENGINE||'chromium,firefox,webkit').split(',')) {
 const browser=await ({chromium,firefox,webkit}[engine]).launch();
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await context.addInitScript(()=>{localStorage.setItem('lunchee-cookies','{"niezbedne":true}');localStorage.setItem('lunchee-koszyk',JSON.stringify([{id:'lb745',name:'Lunchee LB745 City',img:'assets/img/produkty/lb745.webp',price:249,qty:2}]));});
 const page=await context.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));
 const results=[];
 const files=process.env.PAGES?process.env.PAGES.split(','):fs.readdirSync(root).filter(f=>f.endsWith('.html'));
 for(const file of files){
  await page.goto(new URL(file,base).href);await page.evaluate(()=>document.fonts.ready);
  for(const width of (process.env.WIDTHS||'320,360,390,414,568,640,768,899,900,999,1000,1080,1100,1280,1440').split(',').map(Number)){
   await page.setViewportSize({width,height:844});
   const data=await page.evaluate(()=>{
    const outside=[...document.querySelectorAll('body *')].filter(e=>{
     if(e.closest('svg,.sr-only,.skip,.sticky-buy,.toast,[hidden]'))return false;
     const r=e.getBoundingClientRect();if(!r.width||!r.height)return false;
     if(r.left>=-1&&r.right<=innerWidth+1)return false;
     for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){if(['auto','scroll','hidden','clip'].includes(getComputedStyle(p).overflowX))return false;}
     return true;
    }).map(e=>({el:e.tagName+'.'+e.className,text:e.textContent.trim().slice(0,65),left:Math.round(e.getBoundingClientRect().left),right:Math.round(e.getBoundingClientRect().right)}));
    return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,outside:outside.slice(0,18),smallInputs:[...document.querySelectorAll('.field input,.field select,.field textarea')].filter(e=>parseFloat(getComputedStyle(e).fontSize)<16).length,fonts:[...document.fonts].map(f=>({family:f.family,weight:f.weight,status:f.status}))};
   });results.push({file,...data});
  }
 }
 fs.writeFileSync(path.join(os.tmpdir(),'lunchee-audit-'+engine+'.json'),JSON.stringify({engine,errors,results},null,2));
 const issues=results.filter(x=>x.outside.length||x.scrollWidth>x.width+1||x.smallInputs);
 console.log(JSON.stringify({engine,total:results.length,errors,issues:issues.map(({file,width,scrollWidth,outside,smallInputs})=>({file,width,scrollWidth,outside,smallInputs}))},null,2));
 if(errors.length||issues.length)process.exitCode=1;
 await browser.close();
}
})().catch(e=>{console.error(e);process.exitCode=1});
