/* HVA–EDOS release checker V1 · nonintrusive; never clears user/session/cache */
(()=>{'use strict';
const tag=document.currentScript;
const localVersion=tag?.getAttribute('data-build')||'0';
const name='HVA_EDOS_UPDATER_V1';
let lastChecked=0, busy=false;
const tokens=v=>String(v||'').split(/[^\d]+/).filter(Boolean).map(Number);
function newer(a,b){const aa=tokens(a),bb=tokens(b);for(let i=0;i<Math.max(aa.length,bb.length);i++){const d=(aa[i]||0)-(bb[i]||0);if(d)return d>0;}return false;}
function show(remote){
 if(document.getElementById(name)||!newer(remote.version,localVersion))return;
 const box=document.createElement('aside');box.id=name;box.setAttribute('role','status');
 box.style.cssText='position:fixed;z-index:2147483000;top:12px;left:50%;transform:translateX(-50%);width:min(540px,calc(100% - 26px));display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 16px;background:#fff;border:1px solid #b6d8ed;border-left:5px solid #0875a9;border-radius:12px;box-shadow:0 9px 34px rgba(2,38,78,.22);color:#153f63;font:14px/1.45 "Segoe UI",Arial,sans-serif';
 const info=document.createElement('div');info.style.cssText='flex:1;min-width:150px';
 const strong=document.createElement('strong');strong.textContent='EDOS có bản cập nhật '+remote.version;
 const small=document.createElement('div');small.textContent='Thầy cô có thể cập nhật khi đã hoàn tất nội dung đang nhập.';small.style.cssText='font-size:12px;color:#4c718a;margin-top:3px';
 info.append(strong,small);
 const button=document.createElement('button');button.type='button';button.textContent='Cập nhật EDOS';button.style.cssText='border:0;background:#086b9f;color:#fff;font:700 13px "Segoe UI",Arial,sans-serif;padding:10px 14px;border-radius:9px;cursor:pointer';
 button.addEventListener('click',()=>{
   const url=new URL(location.href);
   url.searchParams.set('edos_build',String(remote.version));
   // Navigation preserves existing sessionStorage/localStorage, never deletes data.
   location.assign(url.toString());
 });
 const close=document.createElement('button');close.type='button';close.textContent='Để sau';close.setAttribute('aria-label','Để sau');
 close.style.cssText='border:0;background:#edf4fa;color:#235570;font:600 12px "Segoe UI",Arial,sans-serif;padding:10px;border-radius:9px;cursor:pointer';
 close.addEventListener('click',()=>box.remove());
 box.append(info,button,close);document.body.appendChild(box);
}
async function check(force=false){
 if(busy||(!force&&Date.now()-lastChecked<5*60*1000))return;
 busy=true;lastChecked=Date.now();
 try{
   const url=new URL('./HVA_EDOS_VERSION.json',tag?.src||location.href);
   url.searchParams.set('_',String(Date.now()));
   const res=await fetch(url.toString(),{cache:'no-store',credentials:'same-origin'});
   if(!res.ok)throw Error('HTTP '+res.status);
   const data=await res.json();
   if(data&&typeof data.version==='string'&&/^\d{4}\.\d{1,2}\.\d{1,2}\.\d+$/.test(data.version))show(data);
 }catch(_){/* Silent: application must function without connectivity or version endpoint. */}
 finally{busy=false;}
}
function start(){
 check(true);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)check(false);});
 window.addEventListener('pageshow',event=>{if(event.persisted)check(false);});
 window.addEventListener('online',()=>check(true));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
