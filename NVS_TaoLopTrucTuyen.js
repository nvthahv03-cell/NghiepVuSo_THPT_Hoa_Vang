/* HVA–EDOS | Online class draft: no fake server receipt or BGH submission. */
(()=>{'use strict';const $=x=>document.getElementById(x),fields=['approval','className','subject','date','periodCount','start','end','lesson','meet','meet2','attendance','evidence','recording','notes'];
function validExp(raw){const n=Number(raw);if(Number.isFinite(n)&&n>0)return(n<1e12?n*1000:n)>Date.now();const t=Date.parse(String(raw||''));return Number.isFinite(t)&&t>Date.now()}
function identity(){if(!['localStorage','sessionStorage'].some(x=>{try{return Boolean(window[x].getItem('hvaSessionToken'))&&validExp(window[x].getItem('hvaSessionExpiresAt'))}catch(_){return false}}))return null;
for(const x of ['localStorage','sessionStorage'])try{const u=JSON.parse(window[x].getItem('user')||'null');if(!u||typeof u!=='object'||Array.isArray(u))continue;const name=String(u.hoTen||u.fullName||u.hoVaTen||u.name||u.tenHienThi||'').trim();if(name)return {name,team:String(u.toBoPhan||u.tenTo||u.toChuyenMon||u.to||'').trim(),id:String(u.username||u.tenDangNhap||u.userName||name)}}catch(_){}return null}
const person=identity();$('teacher').value=person?.name||'Cần đăng nhập EDOS';$('team').value=person?.team||'';
for(const [grade,total] of [[10,9],[11,9],[12,12]])for(let i=1;i<=total;i++){const o=document.createElement('option');o.value=grade+'/'+i;o.textContent='Lớp '+o.value;$('className').append(o)}
const key=person?'hva-edos-online-class-draft-'+encodeURIComponent(person.id):'';
function message(t,kind=''){$('message').textContent=t;$('message').dataset.kind=kind}
function okUrl(v,hosts){try{const u=new URL(v.trim());return u.protocol==='https:'&&hosts.includes(u.hostname)&&!u.username&&!u.password}catch(_){return false}}
function values(){return Object.fromEntries(fields.map(x=>[x,$(x).value.trim()]))}
function check(){if(!person){message('Cần đăng nhập HVA–EDOS để lưu bản nháp.','error');return false}
for(const f of ['className','subject','date','start','end','lesson','meet',...($('periodCount').value==='2'?['meet2']:[])])if(!$(f).value.trim()){$(f).focus();message('Vui lòng điền đủ các trường bắt buộc.','error');return false}
if(!$('end').value){message('Giờ bắt đầu không đủ chỗ cho số tiết trong cùng ngày.','error');return false}
if(!okUrl($('meet').value,['meet.google.com'])||($('periodCount').value==='2'&&!okUrl($('meet2').value,['meet.google.com']))){message('Mỗi tiết cần một liên kết Google Meet HTTPS hợp lệ.','error');return false}
if($('periodCount').value==='2'&&$('meet').value.trim()===$('meet2').value.trim()){message('Hai tiết phải dùng hai liên kết Meet khác nhau.','error');return false}
for(const f of ['attendance','evidence','recording'])if($(f).value&&!okUrl($(f).value,['drive.google.com','docs.google.com'])){message('Minh chứng chỉ nhận liên kết HTTPS Google Drive/Docs.','error');$(f).focus();return false}
return true}
$('join').addEventListener('click',()=>{if(okUrl($('meet').value,['meet.google.com']))window.open($('meet').value.trim(),'_blank','noopener,noreferrer');else message('Vui lòng nhập liên kết Meet tiết 1.','error')});
$('join2').addEventListener('click',()=>{if(okUrl($('meet2').value,['meet.google.com']))window.open($('meet2').value.trim(),'_blank','noopener,noreferrer');else message('Vui lòng nhập liên kết Meet tiết 2.','error')});
const hm=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
function setTimes(){
 const [hh,mm]=$('start').value.split(':').map(Number),n=$('periodCount').value==='2'?2:1;
 $('meet2Label').hidden=n===1;$('join2').hidden=n===1;
 if(!Number.isFinite(hh)||!Number.isFinite(mm)){$('end').value='';$('periodSchedule').textContent='Chọn giờ bắt đầu để EDOS tính lịch '+n+' tiết.';return}
 const t=hh*60+mm,finish=t+(n===2?95:45);
 if(finish>=1440){$('end').value='';$('periodSchedule').textContent='Lịch vượt quá ngày hiện tại.';return}
 $('end').value=hm(finish);
 $('periodSchedule').textContent=n===1?'Tiết 1: '+hm(t)+'–'+hm(t+45)+' (45 phút)':
 'Tiết 1: '+hm(t)+'–'+hm(t+45)+' (45 phút)\\nNghỉ: '+hm(t+45)+'–'+hm(t+50)+' (5 phút)\\nTiết 2: '+hm(t+50)+'–'+hm(t+95)+' (45 phút)';
}
$('start').addEventListener('input',setTimes);$('periodCount').addEventListener('change',setTimes);
$('previewBtn').addEventListener('click',()=>{if(!check())return;const v=values();$('preview').textContent='BẢN NHÁP – CHƯA GỬI BGH\n\n'+Object.entries(v).filter(x=>x[1]).map(x=>x[0]+': '+x[1]).join('\n');$('preview').hidden=false;message('Đã xem trước; chưa được EDOS tiếp nhận.','ok')});
$('save').addEventListener('click',()=>{if(!check())return;try{localStorage.setItem(key,JSON.stringify({version:1,data:values(),at:new Date().toISOString()}));message('Đã lưu bản nháp trên thiết bị; BGH chưa nhận minh chứng.','ok')}catch(_){message('Không thể lưu trên thiết bị này.','error')}});
$('clear').addEventListener('click',()=>{if(!window.confirm('Xóa bản nháp lớp học trực tuyến trên thiết bị?'))return;try{localStorage.removeItem(key)}catch(_){}fields.forEach(x=>$(x).value='');$('preview').hidden=true;message('Đã xóa bản nháp. Chưa có hồ sơ nào được gửi.')});
if(key)try{const raw=localStorage.getItem(key);if(raw){const v=JSON.parse(raw);if(v.version===1&&v.data){fields.forEach(x=>{if(Object.hasOwn(v.data,x))$(x).value=String(v.data[x]||'')});setTimes();message('Đã khôi phục bản nháp trên thiết bị. Chưa gửi BGH.','ok')}}}catch(_){}
setTimes();
})();

/* Kế thừa đúng tuyến Google Meet đang dùng trong CuocHop.html.
 * Chỉ tạo sự kiện Google Calendar/Meet; không ghi nhận việc dạy bù đã duyệt.
 * Không dùng shared HVA_MEET_PENDING_EVENT_V2 của Cuộc họp để tránh nhầm hồ sơ.
 */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const API='https://script.google.com/macros/s/AKfycbzTRkdqyYYI8LQo9MkiTjEIXkAC7BWK1MroUXPuvKMl9Yu_o9gXFS8QCcyQmq78-ikvvg/exec';
 const namespace='HVA_ONLINE_CLASS_MEET_V1';
 let busy=false,connected=false;
 const status=(text,kind='')=>{const el=$('meetStatus');el.textContent=text;el.dataset.kind=kind};
 function token(){
  try{const auth=window.HVAPersonnel?.ensureAuth?.();const s=auth?.getSessionState?.();if(s?.validLocal)return String(auth.withAuthBody({}).sessionToken||'').trim()}catch(_){}
  return '';
 }
 async function call(action,extra={}){
  const sessionToken=token();if(!sessionToken)throw Error('Phiên đăng nhập EDOS không hợp lệ. Vui lòng đăng nhập lại.');
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,sessionToken,...extra})});
  if(!r.ok)throw Error('EDOS chưa phản hồi (HTTP '+r.status+').');
  let data;try{data=await r.json()}catch(_){throw Error('EDOS trả dữ liệu không hợp lệ.')}
  if(!data||(!data.success&&data.code!=='MEET_PENDING'))throw Error(data?.message||'EDOS chưa xác nhận tạo phòng Meet.');
  return data;
 }
 function fingerprint(){
  return [$('className').value,$('subject').value.trim(),$('date').value,$('start').value,$('end').value,$('lesson').value.trim()].join('|');
 }
 function storeKey(){
  // Key includes account identity via person profile (not token).
  let identity='';
  for(const area of ['localStorage','sessionStorage'])try{const u=JSON.parse(window[area].getItem('user')||'null');if(u&&typeof u==='object'){identity=String(u.username||u.tenDangNhap||u.userName||u.hoTen||u.fullName||'').trim();if(identity)break}}catch(_){}
  return namespace+'_'+encodeURIComponent(identity||'unknown');
 }
 function pending(){
  try{const p=JSON.parse(sessionStorage.getItem(storeKey())||'null');return p?.fingerprint===fingerprint()?p:null}catch(_){return null}
 }
 function writePending(p){try{sessionStorage.setItem(storeKey(),JSON.stringify(p))}catch(_){}}
 function makeKey(){
  if(window.crypto?.randomUUID)return window.crypto.randomUUID();
  if(window.crypto?.getRandomValues){const a=new Uint8Array(20);window.crypto.getRandomValues(a);return Array.from(a,x=>x.toString(16).padStart(2,'0')).join('')}
  throw Error('Thiết bị chưa hỗ trợ tạo mã yêu cầu an toàn.');
 }
 function validForm(){
  const fields=['className','subject','date','start','end','lesson'];
  for(const id of fields)if(!$(id).value.trim()){$(id).focus();status('Vui lòng nhập lớp, môn, ngày giờ và nội dung trước khi tạo phòng.','error');return false}
  if($('end').value<=$('start').value){$('end').focus();status('Giờ kết thúc phải sau giờ bắt đầu.','error');return false}
  return true;
 }
 function validMeet(url){return /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:[/?#].*)?$/i.test(String(url||''))}
 function displayResult(result,p){
  const state={...p,eventId:String(result.eventId||p.eventId||'')};
  if(result.success&&validMeet(result.meetUrl)){
   state.meetUrl=result.meetUrl;writePending(state);
   $('meet').value=result.meetUrl;
   $('checkMeet').hidden=true;$('createMeet').disabled=true;
   status('Đã tạo phòng Google Meet thật từ hệ thống EDOS. Tiếp tục lập minh chứng sau khi dạy; chưa gửi BGH.','ok');
   $('meet').dispatchEvent(new Event('input',{bubbles:true}));
   return true;
  }
  writePending(state);
  if(result.code==='MEET_PENDING'||state.eventId){
   $('checkMeet').hidden=false;$('createMeet').disabled=true;
   status('Google Calendar đã tiếp nhận yêu cầu. Bấm “Kiểm tra link Meet”, không tạo phòng mới.','');
  }else if(result.code==='GOOGLE_NOT_CONNECTED'){
   $('connectGoogle').hidden=false;status(result.message||'Vui lòng kết nối Google Calendar.','error');
  }else{
   status(result.message||'Google chưa cấp liên kết Meet.','error');
  }
  return false;
 }
 async function statusGoogle(){
  if(busy)return;
  try{const r=await call('googleCalendarStatus');connected=!!r.connected;
   $('connectGoogle').hidden=connected;
   if(connected)status('Google Calendar đã kết nối. Có thể tạo phòng Meet thật bằng EDOS.','ok');
   else status('Chưa kết nối Google Calendar. Chọn “Kết nối Google Calendar” để cấp quyền.','error');
  }catch(e){status(e.message,'error')}
 }
 async function check(){
  if(busy)return;
  const p=pending();if(!p?.requestKey){status('Không có yêu cầu tạo Meet đang chờ.','error');return}
  busy=true;$('checkMeet').disabled=true;
  try{const r=await call('getMeetingGoogleMeetStatus',{requestKey:p.requestKey});displayResult(r,p)}
  catch(e){status(e.message,'error')}
  finally{busy=false;$('checkMeet').disabled=false}
 }
 async function create(){
  if(busy)return;
  if(!validForm())return;
  if($('meet').value.trim()){status('Đã có link Google Meet; không tạo thêm phòng trùng.','error');return}
  let p=pending();if(p?.requestKey){await check();return}
  const event={
   title:'Dạy bù trực tuyến · '+$('subject').value.trim()+' · Lớp '+$('className').value,
   date:$('date').value,startTime:$('start').value,endTime:$('end').value,
   content:$('lesson').value.trim()
  };
  if(!window.confirm('Tạo Google Meet cho '+event.title+' ngày '+event.date+'? Việc này không thay thế phê duyệt A.5.2.'))return;
  p={fingerprint:fingerprint(),requestKey:makeKey(),eventId:'',meetUrl:''};writePending(p);
  busy=true;$('createMeet').disabled=true;status('Đang yêu cầu Google Calendar tạo phòng Meet…');
  try{const result=await call('createMeetingGoogleMeet',{event,requestKey:p.requestKey});displayResult(result,p)}
  catch(e){status('Chưa xác nhận được việc tạo phòng: '+e.message+'. Dùng “Kiểm tra link Meet” trước khi thử lại.','error');$('checkMeet').hidden=false}
  finally{busy=false;if(!$('meet').value&&!pending()?.eventId)$('createMeet').disabled=false}
 }
 async function connect(){
  if(busy)return;
  const popup=window.open('about:blank','hvaOnlineClassGoogleConnect','width=610,height=760');
  if(popup)try{popup.document.title='Kết nối Google Calendar – EDOS';popup.document.body.textContent='Đang mở Google…'}catch(_){}
  try{const r=await call('startGoogleCalendarConnect');
   if(!/^https:\/\/accounts\.google\.com\//.test(String(r.authUrl||'')))throw Error('EDOS chưa trả liên kết cấp quyền Google hợp lệ.');
   if(popup&&!popup.closed)popup.location.href=r.authUrl;else window.location.assign(r.authUrl);
   status('Vui lòng hoàn tất cấp quyền Google trong cửa sổ mới rồi quay lại EDOS.');
  }catch(e){if(popup&&!popup.closed)popup.close();status(e.message,'error')}
 }
 $('createMeet').addEventListener('click',create);
 $('checkMeet').addEventListener('click',check);
 $('connectGoogle').addEventListener('click',connect);
 for(const id of ['className','subject','date','start','end','lesson'])$(id).addEventListener('change',()=>{
  const p=pending();if(p?.meetUrl){$('meet').value=p.meetUrl;$('createMeet').disabled=true}
  else{$('createMeet').disabled=!!$('meet').value.trim();$('checkMeet').hidden=!p?.requestKey}
 });
 window.addEventListener('message',e=>{if(e.data?.type==='HVA_MEET_OAUTH')statusGoogle()});
 window.addEventListener('focus',statusGoogle);
 window.addEventListener('pageshow',statusGoogle);
 const restored=pending();
 if(restored?.meetUrl&&validMeet(restored.meetUrl)){$('meet').value=restored.meetUrl;$('createMeet').disabled=true;status('Đã khôi phục phòng Meet đã tạo trước đó.','ok')}
 else if(restored?.requestKey){$('checkMeet').hidden=false;status('Có yêu cầu tạo Meet đang chờ. Bấm “Kiểm tra link Meet” để xác nhận.')}
 else statusGoogle();
})();

/* GVCN / BGH: chỉ chuẩn bị thông báo thủ công; chuyển tự động cần action EDOS riêng.
 * Không gọi tuyến cuộc họp để giả lập thông báo dạy bù.
 */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const status=(s,k='')=>{$('deliveryStatus').textContent=s;$('deliveryStatus').dataset.kind=k};
 function urlMeet(v){return /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:[/?#].*)?$/i.test(String(v||''))}
 function notice(){
  const values={className:$('className').value,subject:$('subject').value.trim(),date:$('date').value,start:$('start').value,end:$('end').value,lesson:$('lesson').value.trim(),meet:$('meet').value.trim(),approval:$('approval').value.trim()};
  if(!values.className||!values.subject||!values.date||!values.start||!values.end||!values.lesson||!urlMeet(values.meet)){
   status('Vui lòng nhập đủ lớp, môn, ngày giờ, nội dung và link Meet hợp lệ trước khi sao chép thông báo.','error');
   return '';
  }
  if(!values.approval){
   status('Cần nhập mã hồ sơ A.5.2 đã được duyệt trước khi chuẩn bị thông báo cho học sinh.','error');return '';
  }
  return 'Kính gửi giáo viên chủ nhiệm lớp '+values.className+
    ',\nThông tin buổi dạy bù trực tuyến đã được phê duyệt theo hồ sơ '+values.approval+
    ':\nMôn: '+values.subject+'\nThời gian: '+values.date+', '+values.start+'–'+values.end+
    '\nNội dung: '+values.lesson+'\nLiên kết Google Meet: '+values.meet+
    '\nKính nhờ GVCN thông báo đến học sinh của lớp để tham gia đúng giờ.';
 }
 $('copyGVCN').addEventListener('click',()=>{
  const text=notice();if(!text)return;
  if(navigator.clipboard?.writeText){
   navigator.clipboard.writeText(text).then(()=>status('Đã sao chép thông báo. Giáo viên cần tự chuyển đến GVCN; EDOS chưa ghi nhận đã gửi.','ok'))
   .catch(()=>fallback(text));
  }else fallback(text);
 });
 function fallback(text){
  const area=document.createElement('textarea');area.value=text;area.setAttribute('aria-label','Nội dung thông báo cho GVCN');
  area.style.width='100%';area.style.minHeight='170px';
  $('deliveryStatus').replaceChildren(document.createTextNode('Hãy sao chép thông báo bên dưới và gửi thủ công đến GVCN. EDOS chưa ghi nhận đã gửi.'),area);area.select();
 }
})();
