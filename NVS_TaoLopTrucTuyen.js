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

/* Kế thừa Google Meet từ CuocHop.html: hai requestKey riêng, khôi phục riêng từng tiết. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const API='https://script.google.com/macros/s/AKfycbzTRkdqyYYI8LQo9MkiTjEIXkAC7BWK1MroUXPuvKMl9Yu_o9gXFS8QCcyQmq78-ikvvg/exec';
const validMeet=v=>/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:[/?#].*)?$/i.test(String(v||''));
const msg=(v,kind='')=>{$('meetStatus').textContent=v;$('meetStatus').dataset.kind=kind};
let busy=false;
function token(){try{const a=window.HVAPersonnel?.ensureAuth?.(),st=a?.getSessionState?.();if(st?.validLocal)return String(a.withAuthBody({}).sessionToken||'').trim()}catch(_){}return ''}
async function call(action,extra={}){
 const sessionToken=token();if(!sessionToken)throw Error('Phiên EDOS chưa hợp lệ hoặc đã hết hạn.');
 const response=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,sessionToken,...extra})});
 if(!response.ok)throw Error('EDOS chưa phản hồi HTTP '+response.status);
 let r;try{r=await response.json()}catch(_){throw Error('EDOS trả dữ liệu không hợp lệ.')}
 if(!r||r.ok===false&&/Action POST không hợp lệ/i.test(String(r.message||'')))throw Error('EDOS chưa triển khai tính năng Google Meet.');
 return r;
}
function count(){return $('periodCount').value==='2'?2:1}
function minutes(){const [h,m]=$('start').value.split(':').map(Number);return Number.isFinite(h)&&Number.isFinite(m)?h*60+m:NaN}
function hm(n){return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0')}
function event(i){
 const t=minutes()+(i===2?50:0);
 return {title:'Dạy bù trực tuyến – tiết '+i+' · '+$('subject').value.trim()+' · Lớp '+$('className').value,
  date:$('date').value,startTime:hm(t),endTime:hm(t+45),content:$('lesson').value.trim()};
}
function fingerprint(){return [$('className').value,$('subject').value.trim(),$('date').value,$('start').value,$('lesson').value.trim(),count()].join('|')}
function storeKey(){
 let name='';for(const st of ['localStorage','sessionStorage'])try{
  const u=JSON.parse(window[st].getItem('user')||'null');
  if(u&&typeof u==='object'){name=String(u.username||u.tenDangNhap||u.userName||u.hoTen||u.fullName||'').trim();if(name)break}
 }catch(_){}
 return 'HVA_ONLINE_TWO_MEET_V2_'+encodeURIComponent(name||'unknown');
}
function read(){
 try{const d=JSON.parse(sessionStorage.getItem(storeKey())||'null');if(d?.fingerprint===fingerprint()&&d.slots)return d}catch(_){}
 return {fingerprint:fingerprint(),slots:{}};
}
function write(d){try{sessionStorage.setItem(storeKey(),JSON.stringify(d))}catch(_){}}
function uuid(){
 if(window.crypto?.randomUUID)return window.crypto.randomUUID();
 if(window.crypto?.getRandomValues){const a=new Uint8Array(20);window.crypto.getRandomValues(a);return Array.from(a,n=>n.toString(16).padStart(2,'0')).join('')}
 throw Error('Không thể tạo mã yêu cầu an toàn trên thiết bị.');
}
const field=i=>$(i===1?'meet':'meet2');
function sync(){
 const d=read();
 for(let i=1;i<=count();i++){const p=d.slots[i];if(validMeet(p?.meetUrl)&&!field(i).value.trim())field(i).value=p.meetUrl}
 const completed=Array.from({length:count()},(_,i)=>validMeet(field(i+1).value)).every(Boolean);
 const hasPending=Array.from({length:count()},(_,i)=>d.slots[i+1]).some(p=>p?.requestKey&&!p.meetUrl);
 $('checkMeet').hidden=!hasPending;$('createMeet').disabled=busy||completed;
 $('createMeet').textContent=count()===2?'Tạo 2 Google Meet bằng EDOS':'Tạo Google Meet bằng EDOS';
}
function validate(){
 for(const f of ['className','subject','date','start','lesson']){
  if(!$(f).value.trim()){$(f).focus();msg('Nhập đầy đủ lớp, môn, ngày giờ và nội dung bài dạy.','error');return false}
 }
 if(!$('end').value){msg('Lịch dạy chưa hợp lệ.','error');return false}
 if(!token()){msg('Phiên EDOS chưa hợp lệ. Vui lòng đăng nhập lại.','error');return false}
 return true;
}
function apply(i,r,p){
 const d=read();const v={...p,eventId:String(r.eventId||p.eventId||'')};
 if(r.success&&validMeet(r.meetUrl)){
  v.meetUrl=String(r.meetUrl);d.slots[i]=v;write(d);
  field(i).value=v.meetUrl;field(i).dispatchEvent(new Event('input',{bubbles:true}));
  msg('Đã tạo Google Meet tiết '+i+'. Chưa chuyển GVCN/BGH.','ok');sync();return true;
 }
 d.slots[i]=v;write(d);
 if(r.code==='MEET_PENDING'||v.eventId){msg('Google đang cấp link Meet tiết '+i+'. Hãy bấm “Kiểm tra link Meet”, không tạo mới.');sync();return false}
 if(r.code==='GOOGLE_NOT_CONNECTED'){$('connectGoogle').hidden=false;msg('Cần kết nối Google Calendar.','error')}
 else msg(r.message||'Google chưa cấp link Meet tiết '+i+'.','error');
 sync();return false;
}
async function checkSlot(i,p){
 const r=await call('getMeetingGoogleMeetStatus',{requestKey:p.requestKey});return apply(i,r,p);
}
async function create(){
 if(busy||!validate())return;
 if(Array.from({length:count()},(_,i)=>validMeet(field(i+1).value)).every(Boolean)){msg('Đã có đủ liên kết Meet; không tạo trùng.');return}
 if(!window.confirm('EDOS tạo '+count()+' phòng Meet riêng, mỗi tiết 45 phút'+(count()===2?', nghỉ 5 phút giữa hai tiết':'')+'. Đồng ý?'))return;
 busy=true;sync();
 try{
  for(let i=1;i<=count();i++){
   if(validMeet(field(i).value))continue;
   let p=read().slots[i];
   if(p?.requestKey){msg('Đang kiểm tra yêu cầu tạo Meet tiết '+i+' trước đó.');if(!await checkSlot(i,p))break;continue}
   p={requestKey:uuid(),eventId:'',meetUrl:''};
   const d=read();d.slots[i]=p;write(d);
   msg('EDOS đang tạo Google Meet tiết '+i+'…');
   const r=await call('createMeetingGoogleMeet',{event:event(i),requestKey:p.requestKey});
   if(!apply(i,r,p))break;
  }
  if(Array.from({length:count()},(_,i)=>validMeet(field(i+1).value)).every(Boolean))msg('Đã có đủ '+count()+' phòng Meet riêng. Chưa gửi GVCN/BGH.','ok');
 }catch(e){msg('Chưa xác nhận được việc tạo Meet: '+e.message+'. Dùng “Kiểm tra link Meet” để tránh trùng.','error')}
 finally{busy=false;sync()}
}
async function check(){
 if(busy)return;busy=true;sync();
 try{for(let i=1;i<=count();i++){const p=read().slots[i];if(!p?.requestKey||p.meetUrl)continue;if(!await checkSlot(i,p))break}}
 catch(e){msg('Chưa kiểm tra được link Meet: '+e.message,'error')}
 finally{busy=false;sync()}
}
async function googleStatus(){
 if(busy)return;
 try{const r=await call('googleCalendarStatus');
  if(r.success){$('connectGoogle').hidden=!!r.connected;msg(r.connected?'Google Calendar đã kết nối. Có thể tạo Meet theo số tiết.':'Chưa kết nối Google Calendar.',''+(r.connected?'ok':'error'))}
  else msg(r.message||'Chưa kiểm tra được Google Calendar.','error')
 }catch(e){msg(e.message,'error')}
}
async function connect(){
 const popup=window.open('about:blank','hvaOnlineMeetGoogleConnect','width=610,height=760');
 if(popup)try{popup.document.title='Kết nối Google Calendar';popup.document.body.textContent='Đang mở Google…'}catch(_){}
 try{const r=await call('startGoogleCalendarConnect');
  if(!r.success||!/^https:\/\/accounts\.google\.com\//.test(String(r.authUrl||'')))throw Error(r.message||'EDOS chưa trả URL Google hợp lệ.');
  if(popup&&!popup.closed)popup.location.href=r.authUrl;else window.location.assign(r.authUrl);
  msg('Vui lòng cấp quyền và quay lại EDOS.')
 }catch(e){if(popup&&!popup.closed)popup.close();msg(e.message,'error')}
}
$('createMeet').addEventListener('click',create);
$('checkMeet').addEventListener('click',check);
$('connectGoogle').addEventListener('click',connect);
for(const f of ['className','subject','date','periodCount','start','lesson','meet','meet2']){$(f).addEventListener('change',sync);$(f).addEventListener('input',sync)}
window.addEventListener('focus',googleStatus);
window.addEventListener('pageshow',()=>{sync();googleStatus()});
window.addEventListener('message',e=>{if(e.data?.type==='HVA_MEET_OAUTH')googleStatus()});
sync();googleStatus();
})();

/* GVCN / BGH: chỉ chuẩn bị thông báo thủ công; chuyển tự động cần action EDOS riêng.
 * Không gọi tuyến cuộc họp để giả lập thông báo dạy bù.
 */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const status=(s,k='')=>{$('deliveryStatus').textContent=s;$('deliveryStatus').dataset.kind=k};
 function urlMeet(v){return /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:[/?#].*)?$/i.test(String(v||''))}
 function notice(){
  const values={className:$('className').value,subject:$('subject').value.trim(),date:$('date').value,start:$('start').value,end:$('end').value,lesson:$('lesson').value.trim(),meet:$('meet').value.trim(),meet2:$('meet2').value.trim(),count:$('periodCount').value,approval:$('approval').value.trim()};
  if(!values.className||!values.subject||!values.date||!values.start||!values.end||!values.lesson||!urlMeet(values.meet)||(values.count==='2'&&!urlMeet(values.meet2))){
   status('Vui lòng nhập đủ lớp, môn, ngày giờ, nội dung và link Meet hợp lệ trước khi sao chép thông báo.','error');
   return '';
  }
  if(!values.approval){
   status('Cần nhập mã hồ sơ A.5.2 đã được duyệt trước khi chuẩn bị thông báo cho học sinh.','error');return '';
  }
  return 'Kính gửi giáo viên chủ nhiệm lớp '+values.className+
    ',\nThông tin buổi dạy bù trực tuyến đã được phê duyệt theo hồ sơ '+values.approval+
    ':\nMôn: '+values.subject+'\nThời gian: '+values.date+', '+values.start+'–'+values.end+
    '\nNội dung: '+values.lesson+'\nGoogle Meet tiết 1: '+values.meet+(values.count==='2'?'\nNghỉ 5 phút giữa hai tiết.\nGoogle Meet tiết 2: '+values.meet2:'')+
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
