/* HVA–EDOS A.4.1: ba nhóm hồ sơ, nhiều đường dẫn, xác thực mã tiếp nhận.
   Không thay đổi Router/Backend V5 hoặc các nghiệp vụ A.4.2–A.4.4. */
(function(){
 'use strict';
 const query=new URLSearchParams(location.search);
 if(query.get('code')!=='A.4.1')return;
 const by=id=>document.getElementById(id);
 const root=by('hvaA41Workspace'),entry=by('hvaA41Entry'),rowsEl=by('hvaA41Rows');
 if(!root||!entry||!rowsEl)return;
 document.body.classList.add('hva-a41-three');
 root.hidden=false;
 const kinds={
  KHKT:{label:'Khoa học kỹ thuật',title:'Dự án khoa học kỹ thuật'},
  SANG_KIEN:{label:'Sáng kiến',title:'Sáng kiến'},
  NCKH:{label:'Nghiên cứu khoa học',title:'Đề tài nghiên cứu khoa học'}
 };
 const endpoint='https://script.google.com/macros/s/AKfycbzZBemNxnkqhIT2iz0CdtdFJqhlOu8LgZMzmnNjMxSGZRrz-ULuvEZb7MbKoufelWNY/exec';
 let kind=null,items=[],nextId=1,previewSignature='',inFlight=false,capability=false;
 const templates=Object.freeze({}); // Chỉ đưa vào đây URL mẫu được nhà trường phê duyệt.
 function message(value,ok=false,global=false){
  const el=by(global?'hvaA41GlobalMessage':'hvaA41Message');
  el.textContent=value;el.dataset.state=ok?'success':'error';
 }
 function auth(){
  for(const t of ['localStorage','sessionStorage']){
   try{
    const st=window[t],key=String(st.getItem('hvaSessionToken')||'');
    const raw=st.getItem('hvaSessionExpiresAt'),n=Number(raw);
    const expires=Number.isFinite(n)&&n>0?(n<1e12?n*1000:n):Date.parse(String(raw||''));
    if(key&&Number.isFinite(expires)&&expires>Date.now()){
     const user=JSON.parse(st.getItem('user')||'{}');
     return {token:key,user:user&&typeof user==='object'?user:{}};
    }
   }catch(_){}
  }
  throw Error('Thầy/cô cần đăng nhập EDOS lại để nộp hồ sơ.');
 }
 function driveUrl(value){
  try{
   const u=new URL(String(value||'').trim());
   return u.protocol==='https:' && ['drive.google.com','docs.google.com'].includes(u.hostname);
  }catch(_){return false}
 }
 function newId(){
  return 'A41-'+(window.crypto&&window.crypto.randomUUID?window.crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,16));
 }
 async function api(action,payload){
  const session=auth();
  const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
   body:JSON.stringify({action,sessionToken:session.token,...(payload||{})})});
  if(!res.ok)throw Error('Không kết nối được máy chủ EDOS (HTTP '+res.status+').');
  let data;
  try{data=await res.json()}catch(_){throw Error('Máy chủ chưa phản hồi dữ liệu hợp lệ.')}
  if(!data||(data.success!==true&&data.ok!==true))throw Error(data&&data.message||'Máy chủ chưa xác nhận tiếp nhận.');
  return data;
 }
 async function probe(){
  const r=await api('nvsA22Capabilities');
  if(r.supported!==true||r.version!=='A22-1'||!r.bghCount||!r.ccCount)
   throw Error('Chưa xác thực tuyến tiếp nhận BGH và TTCM.');
  capability=true;
 }
 function makeRow(item,index){
  const row=document.createElement('div');row.className='hva-a41-row';row.dataset.id=String(item.id);
  const name=document.createElement('input');name.type='text';name.value=item.name||'';name.maxLength=250;name.required=true;
  name.placeholder='VD: Kế hoạch, tiến độ, đề cương…';
  name.setAttribute('aria-label','Tên sản phẩm hoặc hồ sơ '+(index+1));name.disabled=!!item.receipt||inFlight;
  name.addEventListener('input',()=>{
   item.name=name.value;item.requestId=null;previewSignature='';
   by('hvaA41Preview').hidden=true;by('hvaA41Submit').disabled=true;
   message('Tên hồ sơ đã thay đổi. Vui lòng xem trước lại.');
  });
  const links=document.createElement('div');links.className='hva-a41-two-links';
  for(const [field,label] of [['wordUrl','Word'],['pdfUrl','PDF']]){
   const wrap=document.createElement('label');wrap.className='hva-a41-link-wrap';
   const heading=document.createElement('span');heading.textContent='Link '+label;
   const link=document.createElement('input');link.type='url';link.value=item[field]||'';
   link.maxLength=1500;link.required=true;link.placeholder='Dán link '+label+' trên Drive…';
   link.dataset.a41Field=field;
   link.setAttribute('aria-label','Liên kết '+label+' hồ sơ '+(index+1));
   link.disabled=!!item.receipt||inFlight;
   link.addEventListener('input',()=>{
    item[field]=link.value.trim();item.requestId=null;previewSignature='';
    by('hvaA41Preview').hidden=true;by('hvaA41Submit').disabled=true;
    message('Hồ sơ đã thay đổi. Vui lòng xem trước trước khi gửi.');
   });
   wrap.append(heading,link);links.append(wrap);
  }
  const remove=document.createElement('button');remove.type='button';remove.className='hva-a41-remove';
  remove.textContent='×';remove.title='Xóa dòng hồ sơ';remove.setAttribute('aria-label','Xóa hồ sơ '+(index+1));
  remove.disabled=items.length<=1||!!item.receipt||inFlight;
  remove.addEventListener('click',()=>{
   items=items.filter(x=>x!==item);previewSignature='';render();
   by('hvaA41Preview').hidden=true;by('hvaA41Submit').disabled=true;
  });
  const label=document.createElement('span');label.className='hva-a41-stt';label.textContent=String(index+1)+'.';
  row.append(label,name,links,remove);return row;
 }
 function render(){
  entry.classList.toggle('hva-a41-single',items.length===1);
  rowsEl.replaceChildren(...items.map(makeRow));
  by('hvaA41Add').disabled=inFlight;
  by('hvaA41Back').disabled=inFlight;
  by('hvaA41PreviewBtn').disabled=inFlight;
 }
 function open(type){
  if(inFlight||!kinds[type])return;
  kind=type;items=[{id:nextId++,name:'',wordUrl:'',pdfUrl:'',requestId:null,receipt:null}];
  previewSignature='';entry.hidden=false;
  by('hvaA41Preview').hidden=true;by('hvaA41Submit').disabled=true;
  by('hvaA41EntryTitle').textContent='Nộp hồ sơ · '+kinds[type].label;
  by('hvaA41SelectedType').textContent=kinds[type].label;
  message('Nhập liên kết hồ sơ, thêm dòng nếu cần, sau đó chọn Xem trước.');
  render();entry.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function signature(){return JSON.stringify({kind,files:items.map(x=>({name:String(x.name||'').trim(),wordUrl:String(x.wordUrl||'').trim(),pdfUrl:String(x.pdfUrl||'').trim()}))})}
 function valid(){
  if(!kind||!items.length){message('Chưa chọn loại hồ sơ.');return false}
  for(let i=0;i<items.length;i++){
   if(!String(items[i].name||'').trim()){
    message('Hồ sơ '+(i+1)+': vui lòng nhập tên sản phẩm (kế hoạch, tiến độ, đề cương, dự án…).');
    rowsEl.querySelectorAll('input[type="text"]')[i]?.focus();return false;
   }
   for(const [field,label] of [['wordUrl','Word'],['pdfUrl','PDF']]){
    if(!driveUrl(items[i][field])){
     message('Hồ sơ '+(i+1)+': vui lòng nhập link '+label+' HTTPS hợp lệ trên Google Drive/Docs.');
     rowsEl.querySelectorAll('.hva-a41-row')[i]?.querySelector('[data-a41-field="'+field+'"]')?.focus();
     return false;
    }
   }
  }
  return true;
 }
 function preview(){
  if(inFlight||!valid())return;
  const box=by('hvaA41Preview');
  box.replaceChildren();
  const heading=document.createElement('strong');
  heading.textContent='XEM TRƯỚC · '+items.length+' HỒ SƠ '+kinds[kind].label.toUpperCase();
  box.append(heading);
  items.forEach((x,i)=>{
   const div=document.createElement('div');div.className='hva-a41-preview-item';
   const label=document.createElement('strong');label.textContent=(i+1)+'. '+String(x.name||'').trim()+' ('+kinds[kind].label+')'+(x.receipt?' · Đã tiếp nhận: '+x.receipt:'');
   div.append(label);
   for(const [field,text] of [['wordUrl','Word'],['pdfUrl','PDF']]){
    const row=document.createElement('div');row.className='hva-a41-preview-link';
    const title=document.createElement('strong');title.textContent=text+': ';
    const a=document.createElement('a');a.href=x[field].trim();a.target='_blank';
    a.rel='noopener noreferrer';a.referrerPolicy='no-referrer';a.textContent=x[field].trim();
    row.append(title,a);div.append(row);
   }
   box.append(div);
  });
  box.hidden=false;previewSignature=signature();
  by('hvaA41Submit').disabled=items.every(x=>!!x.receipt);
  message('Đã lập bản xem trước. Kiểm tra từng đường dẫn rồi chọn Gửi hồ sơ.',true);
  box.scrollIntoView({behavior:'smooth',block:'nearest'});
 }
 function confirmSubmission(){
  return new Promise(resolve=>{
   const overlay=by('hvaA41ConfirmOverlay'),description=by('hvaA41ConfirmDesc'),list=by('hvaA41ConfirmList');
   const accept=by('hvaA41AcceptConfirm'),cancel=by('hvaA41CancelConfirm');
   if(!overlay||!description||!list||!accept||!cancel){message('Không mở được hộp xác nhận EDOS, hồ sơ chưa được gửi.');resolve(false);return}
   const pending=items.filter(x=>!x.receipt);
   description.textContent='Thầy/cô xác nhận nộp '+pending.length+' hồ sơ '+kinds[kind].label+' đến BGH và TTCM:';
   list.replaceChildren(...pending.map(x=>{const li=document.createElement('li');li.textContent=String(x.name||'').trim();return li}));
   const prior=document.activeElement;
   overlay.hidden=false;accept.focus();
   function settle(value){
    overlay.hidden=true;
    accept.removeEventListener('click',approve);
    cancel.removeEventListener('click',decline);
    document.removeEventListener('keydown',keydown,true);
    if(prior&&prior.focus)prior.focus();
    resolve(value);
   }
   function approve(){settle(true)}
   function decline(){settle(false)}
   function keydown(event){
    if(event.key==='Escape'){event.preventDefault();settle(false)}
    if(event.key==='Tab'){
     const next=event.shiftKey?cancel:accept;
     if(document.activeElement===(event.shiftKey?accept:cancel)){event.preventDefault();next.focus()}
    }
   }
   accept.addEventListener('click',approve,{once:true});
   cancel.addEventListener('click',decline,{once:true});
   document.addEventListener('keydown',keydown,true);
  });
 }
 async function send(){
  if(inFlight||!valid()||previewSignature!==signature()){message('Vui lòng Xem trước bản mới nhất trước khi gửi.');return}
  if(!await confirmSubmission())return;
  if(inFlight||!valid()||previewSignature!==signature())return;
  inFlight=true;by('hvaA41Submit').disabled=true;render();
  try{
   await probe();
   const session=auth(),user=session.user;
   const owner=String(user.hoTen||user.fullName||user.name||'').trim();
   if(!owner)throw Error('Chưa xác định họ tên người nộp theo tài khoản EDOS.');
   const team=String(user.toBoPhan||user.tenTo||user.to||'').trim();
   const now=new Date(),vn=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
   const d=vn.match(/(\d{4}).?(\d{2}).?(\d{2})/);
   const date=d?d[1]+'-'+d[2]+'-'+d[3]:now.toISOString().slice(0,10);
   const schoolYear=by('schoolYear')?.value||'2026–2027';
   for(let i=0;i<items.length;i++){
    const item=items[i];
    if(item.receipt)continue;
    if(!item.requestId)item.requestId=newId();
    message('Đang gửi hồ sơ '+(i+1)+'/'+items.length+'; các hồ sơ đã có mã sẽ không gửi lại.',true);
    const doc={
     clientRequestId:item.requestId,
     form:{code:'A.4.1',schoolYear,owner,team,date,subject:'',
      title:String(item.name||'').trim(),content:'Liên kết Word: '+item.wordUrl.trim()+'\nLiên kết PDF: '+item.pdfUrl.trim(),result:'',evidence:item.pdfUrl.trim()},
     extras:{loaiSanPham:kind==='KHKT'?'Khoa học kỹ thuật':kind==='SANG_KIEN'?'Sáng kiến':'Nghiên cứu khoa học',
      tenDeTai:String(item.name||'').trim(),capQuanLy:'',
      giaiDoan:'Nộp hồ sơ',ketQuaNghienCuu:'Bản Word: '+item.wordUrl.trim()+'\nBản PDF: '+item.pdfUrl.trim(),sanPhamUrl:item.wordUrl.trim()}
    };
    const r=await api('nvsA22Submit',{document:doc});
    if(!r.recordId||!r.bghCount||!r.ccCount)throw Error('Hồ sơ '+(i+1)+' chưa có đủ mã tiếp nhận và người nhận.');
    item.receipt=String(r.recordId);
   }
   if(items.every(x=>!!x.receipt)){
    message('HVA–EDOS: Thầy/cô đã nộp hồ sơ thành công. '+items.length+
     ' hồ sơ đã được tiếp nhận. Mã: '+items.map(x=>x.receipt).join(' · ')+'. Trạng thái: Chờ xử lý.',true);
    previewSignature=signature();preview();
    message('HVA–EDOS: Thầy/cô đã nộp hồ sơ thành công. '+items.length+
     ' hồ sơ đã được tiếp nhận. Mã: '+items.map(x=>x.receipt).join(' · ')+'. Trạng thái: Chờ xử lý.',true);
   }
  }catch(err){
   const done=items.filter(x=>x.receipt).length;
   message('CHƯA HOÀN TẤT NỘP HỒ SƠ. Đã có mã tiếp nhận: '+done+'/'+items.length+
    '. '+String(err.message||err)+
    ' Nếu mạng bị gián đoạn, giữ nguyên nội dung và gửi lại để sử dụng mã yêu cầu cũ; không tự coi là đã nộp.');
  }finally{
   inFlight=false;render();by('hvaA41Submit').disabled=items.every(x=>x.receipt)||previewSignature!==signature();
  }
 }
 root.addEventListener('click',e=>{
  const btn=e.target.closest('button');if(!btn||inFlight)return;
  if(btn.dataset.a41Open){open(btn.dataset.a41Open);return}
  if(btn.dataset.a41Template){
   const approved=templates[btn.dataset.a41Template];
   if(typeof approved==='string'&&driveUrl(approved)){
    const a=document.createElement('a');a.href=approved;a.target='_blank';a.rel='noopener noreferrer';a.click();
   }else message('Biểu mẫu '+kinds[btn.dataset.a41Template].label+' đang được nhà trường cập nhật; chưa có liên kết mẫu chính thức.',false,true);
  }
 });
 by('hvaA41Add').addEventListener('click',()=>{
  if(!kind||inFlight)return;
  items.push({id:nextId++,name:'',wordUrl:'',pdfUrl:'',requestId:null,receipt:null});
  previewSignature='';by('hvaA41Preview').hidden=true;by('hvaA41Submit').disabled=true;render();
 });
 by('hvaA41Back').addEventListener('click',()=>{
  if(inFlight)return;
  entry.hidden=true;kind=null;items=[];previewSignature='';
  message('Chọn một trong ba loại hồ sơ.',true,true);
 });
 by('hvaA41PreviewBtn').addEventListener('click',preview);
 by('hvaA41Submit').addEventListener('click',send);
 message('Chọn Khoa học kỹ thuật, Sáng kiến hoặc Nghiên cứu khoa học.',true,true);
})();