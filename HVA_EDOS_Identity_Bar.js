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
    const photoCandidates=[u.avatarUrl,u.avatarURL,u.photoURL,u.photoUrl,u.anhDaiDien,u.linkAnh,u.hinhAnh,u.profilePhoto,u.profilePicture,u.avatar,u.photo];
    const photo=photoCandidates.find(v=>{
      if(typeof v!=='string'||v.length>1400)return false;
      try{const x=new URL(v);return x.protocol==='https:'&&!x.username&&!x.password}catch(_){return false}
    })||'';
    return {name,position,team,photo};
   }catch(_){} 
  }
  return null;
 }
 const css=document.createElement('style');css.textContent=
 '#'+ID+'{box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 16px;max-width:1080px;margin:12px auto;padding:10px 15px;background:#fff;color:#214862;border:1px solid #cee2ef;border-radius:12px;box-shadow:0 3px 15px #143e5b0c;font:13px/1.45 "Segoe UI",Arial,sans-serif}'+
 '#'+ID+' .hva-id-person{display:flex;align-items:center;gap:9px;min-width:0}'+
 '#'+ID+' .hva-id-avatar{position:relative;display:grid;place-items:center;width:46px;height:46px;flex:0 0 46px;overflow:hidden;border:2px solid #d8eaf7;border-radius:50%;background:#e7f4fb;color:#09699a;font-weight:850;font-size:15px}'+
 '#'+ID+' .hva-id-avatar img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}'+
 '#'+ID+' .hva-id-avatar img[hidden]{display:none!important}'+
 '#'+ID+' .hva-id-fields{display:grid;gap:1px;min-width:0}'+
 '#'+ID+' .hva-id-name{font-weight:800;overflow-wrap:anywhere}'+
 '#'+ID+' .hva-id-role{font-size:11px;color:#5c7890}'+
 '#'+ID+' .hva-id-tag{font-size:11px;color:#547287}'+
 '#'+ID+' .hva-id-back{color:#09699a;text-decoration:none;font-weight:700}'+
 '#'+ID+'.hva-id-in-workspace{width:100%;max-width:none;margin:0 0 18px;padding:13px 15px;background:linear-gradient(105deg,#f1f9ff,#fff);border:1px solid #c9e0f2;box-shadow:0 3px 12px #173d600b;position:relative;z-index:0}'+
 '#'+ID+'.hva-id-in-workspace .hva-id-avatar{width:56px;height:56px;flex-basis:56px;font-size:17px}'+
 '#'+ID+'.hva-id-in-workspace .hva-id-name{font-size:15px;color:#154976}'+
 '#'+ID+'.hva-id-in-workspace .hva-id-role{font-size:12px;line-height:1.5}'+
 '@media(max-width:600px){#'+ID+'{margin:9px 12px;padding:10px 12px;font-size:12px}#'+ID+' .hva-id-tag{font-size:10px}#'+ID+'.hva-id-in-workspace{margin:0 0 17px;padding:12px;display:flex;align-items:center;flex-direction:row;gap:12px}#'+ID+'.hva-id-in-workspace .hva-id-person{width:100%}#'+ID+'.hva-id-in-workspace .hva-id-avatar{width:54px;height:54px;flex-basis:54px}#'+ID+'.hva-id-in-workspace .hva-id-name{font-size:15px}#'+ID+'.hva-id-in-workspace .hva-id-role{font-size:11px}#'+ID+'.hva-id-in-workspace .hva-id-tag{display:none}}';
 document.head.append(css);
 const bar=document.createElement('aside');bar.id=ID;bar.setAttribute('aria-label','Danh tính người truy cập theo phiên HVA–EDOS');
 const person=document.createElement('div');person.className='hva-id-person';
 const avatar=document.createElement('span');avatar.className='hva-id-avatar';avatar.setAttribute('aria-hidden','true');
 const avatarInitials=document.createElement('span');avatarInitials.textContent='HV';
 const avatarImage=document.createElement('img');avatarImage.alt='';avatarImage.hidden=true;avatarImage.referrerPolicy='no-referrer';avatarImage.decoding='async';
 avatar.append(avatarInitials,avatarImage);
 let avatarRequest=0;
 function setAvatar(user){
  const parts=String(user?.name||'').trim().split(/\s+/).filter(Boolean);
  avatarInitials.textContent=parts.length>1?(parts[0][0]+parts[parts.length-1][0]).toUpperCase():parts.length?parts[0].slice(0,2).toUpperCase():'HV';
  avatarImage.hidden=true;avatarInitials.hidden=false;
  const request=++avatarRequest;
  avatarImage.onload=()=>{if(request!==avatarRequest)return;avatarImage.hidden=false;avatarInitials.hidden=true};
  avatarImage.onerror=()=>{if(request!==avatarRequest)return;avatarImage.hidden=true;avatarInitials.hidden=false};
  if(user?.photo){avatarImage.src=user.photo;}else{avatarImage.removeAttribute('src');}
 }
 const fields=document.createElement('div');fields.className='hva-id-fields';
 const name=document.createElement('span');name.className='hva-id-name';
 const role=document.createElement('span');role.className='hva-id-role';
 fields.append(name,role);person.append(avatar,fields);
 const aside=document.createElement('div');aside.className='hva-id-tag';
 bar.append(person,aside);
 const workspace=document.querySelector('body > main.shell > .workspace');
 const header=document.querySelector('body > header');
 // Trang danh muc NVS co main.shell overlap header: dat danh tinh TRONG workspace
 // de khong bi che phu va cho du cho ho ten, vai tro, to chuyen mon tren mobile.
 if(workspace){
  workspace.insertBefore(bar,workspace.firstChild);
  bar.classList.add('hva-id-in-workspace');
 }else if(header){header.insertAdjacentElement('afterend',bar)}
 else{document.body.insertBefore(bar,document.body.firstChild)}
 function refresh(){
  const u=read();
  name.textContent=u?u.name:'Chưa đăng nhập HVA–EDOS';
  setAvatar(u);
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