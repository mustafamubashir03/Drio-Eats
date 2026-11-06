const fs=require('fs');
const path=require('path');
function walk(d){let r=[];try{for(const f of fs.readdirSync(d)){const p=path.join(d,f);const s=fs.statSync(p);if(s.isDirectory()) r=r.concat(walk(p)); else if(f.endsWith('.js')) r.push(p);}}catch{}return r;}
const files=walk('node_modules/@thallesp/nestjs-better-auth/dist');
for(const f of files){
  const c=fs.readFileSync(f,'utf8');
  if(c.includes('Public')){
    const idx=c.indexOf('Public');
    // print a snippet
    console.log('FILE', f);
    console.log(c.substring(Math.max(0,idx-80), idx+160).replace(/\n/g,' '));
    console.log('---');
  }
}"