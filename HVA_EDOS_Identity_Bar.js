/* HVA–EDOS | Dải danh tính dùng chung cho các giao diện nghiệp vụ.
 * Chỉ hiển thị hồ sơ đã lưu kèm phiên còn hạn trên thiết bị. Quyền và xác thực
 * bắt buộc do Backend kiểm tra; giao diện này không cấp quyền thao tác.
 */
(()=>{'use strict';
 const ID='hva-edos-identity-bar';
 if(document.getElementById(ID))return;
 const get=(storage,key)=>{try{return window[storage].getItem(key)||''}catch(_){return''}};
 const validExpiry=raw=>{const n=Number(raw);if(Number.isFinite(n)&&n>0)return (n<1e12?n*1000:n)>Date.now();const t=Date.parse(raw);return Number.isFinite(t)&&t>Date.now()};
 function read(){
  for(const st of ['localStorage','sessionStorage']){
   if(!get(st,'hvaSessionToken')||!validExpiry(get(st,'hvaSessionExpiresAt')))continue;
   try{const u=JSON.parse(get(st,'user')||'null');if(!u||typeof u!=='object'||Array.isArray(u))continue;
    const name=String(u.hoTen||u.fullName||u.hoVaTen||u.name||'').trim().slice(0,120);
    if(!name)continue;
    const position=String(u.viTriViecLam||u.chucVu||u.chucDanh||u.vaiTro||u.role||'').trim().slice(0,120);
    const team=String(u.toBoPhan||u.tenTo||'').trim().slice(0,100);
    return {name,position,team};
   }catch(_){} 
  }
  return null;
 }
 const css=document.createElement('style');css.textContent=
 '#'+ID+'{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 16px;max-width:1080px;margin:12px auto;padding:10px 15px;background:#fff;color:#214862;border:1px solid #cee2ef;border-radius:12px;box-shadow:0 3px 15px #143e5b0c;font:13px/1.45 "Segoe UI",Arial,sans-serif}'+
 '#'+ID+' .hva-id-person{display:flex;align-items:center;gap:9px;min-width:0}'+
 '#'+ID+' .hva-id-avatar{display:grid;place-items:center;width:34px;height:34px;flex:0 0 34px;border-radius:50%;background:#e7f4fb;color:#09699a;font-weight:800}'+
 '#'+ID+' .hva-id-fields{display:grid;gap:1px;min-width:0}'+
 '#'+ID+' .hva-id-name{font-weight:800;overflow-wrap:anywhere}'+
 '#'+ID+' .hva-id-role{font-size:11px;color:#5c7890}'+
 '#'+ID+' .hva-id-tag{font-size:11px;color:#547287}'+
 '#'+ID+' .hva-id-back{color:#09699a;text-decoration:none;font-weight:700}'+
 '@media(max-width:600px){#'+ID+'{margin:9px 12px;padding:9px 11px;font-size:12px}#'+ID+' .hva-id-tag{font-size:10px}}';
 document.head.append(css);
 const bar=document.createElement('aside');bar.id=ID;bar.setAttribute('aria-label','Danh tính người truy cập theo phiên HVA–EDOS');
 const person=document.createElement('div');person.className='hva-id-person';
 const avatar=document.createElement('span');avatar.className='hva-id-avatar';avatar.setAttribute('aria-hidden','true');avatar.textContent='HV';
 const fields=document.createElement('div');fields.className='hva-id-fields';
 const name=document.createElement('span');name.className='hva-id-name';
 const role=document.createElement('span');role.className='hva-id-role';
 fields.append(name,role);person.append(avatar,fields);
 const aside=document.createElement('div');aside.className='hva-id-tag';
 bar.append(person,aside);
 const header=document.querySelector('body > header');
 if(header)header.insertAdjacentElement('afterend',bar);else document.body.insertBefore(bar,document.body.firstChild);
 function refresh(){
  const u=read();
  name.textContent=u?u.name:'Chưa đăng nhập HVA–EDOS';
  role.textContent=u?[u.position,u.team].filter(Boolean).join(' · ')||'Hồ sơ người dùng':'Chưa có phiên đăng nhập hợp lệ trên thiết bị';
  aside.replaceChildren();
  if(u){aside.textContent='Danh tính theo phiên EDOS · Quyền do máy chủ xác minh';}
  else{const a=document.createElement('a');a.href='./index.html';a.className='hva-id-back';a.textContent='Về EDOS để đăng nhập';aside.append(a);}
 }
 refresh();
 window.addEventListener('storage',refresh);
 window.addEventListener('pageshow',refresh);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
})();