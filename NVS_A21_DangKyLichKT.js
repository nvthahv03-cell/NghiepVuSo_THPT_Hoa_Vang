/* NVS A.2.1 | GV direct registration, ONE EDOS V5 data store. Backend is authoritative.
   Never claim submission before server ACK; no stale browser-only registrations. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const btn=$('a21ScheduleOpen'),panel=$('a21SchedulePanel'),form=$('a21ScheduleForm');
if(!btn||!panel||!form)return;
const info=$('a21ScheduleMessage'),table=$('a21ScheduleDrafts');
const API='https://script.google.com/macros/s/AKfycbzZBemNxnkqhIT2iz0CdtdFJqhlOu8LgZMzmnNjMxSGZRrz-ULuvEZb7MbKoufelWNY/exec';
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
let remote=[],actor=null,ready=false,busy=false,editingId='';
const labels={DRAFT:'Bản nháp – chưa gửi TTCM',WAIT_TTCM:'Đã gửi TTCM – chờ xác nhận',WAIT_BGH:'Đã gửi BGH',APPROVED:'Đã được BGH duyệt'};
const byCode=()=>$('code')?.value==='A.2.1';
const roomTypes={CLASSROOM:'Phòng học của lớp',COMPUTER:'Phòng máy',LAB:'Phòng thí nghiệm / thực hành',FUNCTION:'Phòng chức năng',OUTDOOR:'Sân tập / ngoài trời'};
function chosenRoom(){
 const selected=$('a21Room').value;
 return selected==='OTHER'?$('a21RoomOther').value.trim():selected;
}
function setRoomMode(){
 const room=$('a21Room'),other=$('a21RoomOther');
 room.required=true;
 const isOther=room.value==='OTHER';
 other.hidden=!isOther;other.required=isOther;
 if(!isOther)other.value='';
 updatePreview();
}
$('a21Room')?.addEventListener('change',setRoomMode);
$('a21RoomOther')?.addEventListener('input',updatePreview);

const classMax=Object.freeze({'10':9,'11':9,'12':12});
const gradeSelect=$('a21Grade'),classSelect=$('a21Class'),dateInput=$('a21Date');
function buildClassSelect(grade,selected=''){
 classSelect.replaceChildren(new Option(grade?'Chọn lớp':'Chọn khối trước',''));
 const max=classMax[grade]||0;
 for(let i=1;i<=max;i++)classSelect.add(new Option(grade+'/'+i,grade+'/'+i));
 classSelect.disabled=!max;
 if(selected&&[...classSelect.options].some(o=>o.value===selected))classSelect.value=selected;
}
function isoToVi(s){
 const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
 return m?m[3]+'/'+m[2]+'/'+m[1]:'';
}
function viToIso(s){
 const m=String(s||'').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
 if(!m)return '';
 const d=Number(m[1]),month=Number(m[2]),year=Number(m[3]);
 const date=new Date(Date.UTC(year,month-1,d));
 if(date.getUTCFullYear()!==year||date.getUTCMonth()+1!==month||date.getUTCDate()!==d)return '';
 return String(year).padStart(4,'0')+'-'+String(month).padStart(2,'0')+'-'+String(d).padStart(2,'0');
}
function updateActorCard(d){
 const name=$('a21ActorName'),details=$('a21ActorDetails'),flag=$('a21ActorFlag');
 if(!name||!details||!flag)return;
 const x=d&&d.username?d:null;
 window.dispatchEvent(new CustomEvent('hva:a21-verified-actor',{detail:x?{username:String(x.username),name:String(x.name||x.hoTen||''),team:String(x.team||x.toBoPhan||''),role:String(x.role||x.chucVu||'')}:null}));
 if(x){
  name.textContent=String(x.name||x.username);
  details.textContent=[x.team,x.role||x.chucVu].filter(Boolean).join(' | ');if(details.textContent)details.textContent=' | '+details.textContent;
  flag.textContent='Đã xác thực';flag.classList.add('verified');flag.hidden=true;
 }else{
  name.textContent='Chưa xác minh tài khoản';
  details.textContent='';
  flag.textContent='Chưa xác minh';flag.classList.remove('verified');flag.hidden=true;
 }
}
gradeSelect?.addEventListener('change',()=>{buildClassSelect(gradeSelect.value);updatePreview();});
// In-page calendar guarantees an open picker on click, including browsers that
// restrict showPicker() on invisible/overlaid native date inputs.
const calPopup=$('a21CalendarPopup'),calToggle=$('a21CalendarToggle'),
 calDays=$('a21CalDays'),calLabel=$('a21CalMonth'),
 calPrev=$('a21CalPrev'),calNext=$('a21CalNext');
let calendarMonth=11,calendarYear=2026;
function calendarIso(y,m,d){return String(y)+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');}
function calendarDraw(){
 if(!calDays)return;
 calLabel.textContent='Tháng '+String(calendarMonth+1).padStart(2,'0')+'/'+calendarYear;
 calDays.replaceChildren();
 for(const d of ['T2','T3','T4','T5','T6','T7','CN']){
  const cell=document.createElement('span');cell.textContent=d;calDays.appendChild(cell);
 }
 const offset=(new Date(Date.UTC(calendarYear,calendarMonth,1)).getUTCDay()+6)%7;
 for(let i=0;i<offset;i++){const spacer=document.createElement('span');calDays.appendChild(spacer);}
 const days=new Date(Date.UTC(calendarYear,calendarMonth+1,0)).getUTCDate();
 for(let d=1;d<=days;d++){
  const iso=calendarIso(calendarYear,calendarMonth,d);
  const button=document.createElement('button');
  button.type='button';button.textContent=String(d);button.dataset.date=iso;
  button.disabled=iso<'2026-12-14'||iso>'2027-01-05';
  button.setAttribute('aria-label',isoToVi(iso));
  button.setAttribute('aria-pressed',String(viToIso(dateInput.value)===iso));
  calDays.appendChild(button);
 }
 calPrev.disabled=calendarYear===2026&&calendarMonth===11;
 calNext.disabled=calendarYear===2027&&calendarMonth===0;
}
function calendarOpen(){
 const iso=viToIso(dateInput.value);
 if(iso){calendarYear=+iso.slice(0,4);calendarMonth=+iso.slice(5,7)-1;}
 else{calendarYear=2026;calendarMonth=11;}
 calPopup.hidden=false;calToggle.setAttribute('aria-expanded','true');
 calendarDraw();
}
function calendarClose(){
 calPopup.hidden=true;calToggle.setAttribute('aria-expanded','false');
}
calToggle?.addEventListener('click',e=>{
 e.stopPropagation();if(calPopup.hidden)calendarOpen();else calendarClose();
});
dateInput?.addEventListener('click',()=>{if(calPopup.hidden)calendarOpen();});
dateInput?.addEventListener('input',()=>{updatePreview();if(!calPopup.hidden)calendarDraw();});
dateInput?.addEventListener('blur',()=>{
 const iso=viToIso(dateInput.value);if(iso)dateInput.value=isoToVi(iso);
 updatePreview();
});
calPrev?.addEventListener('click',()=>{calendarYear=2026;calendarMonth=11;calendarDraw();});
calNext?.addEventListener('click',()=>{calendarYear=2027;calendarMonth=0;calendarDraw();});
calDays?.addEventListener('click',e=>{
 const button=e.target.closest('button[data-date]');
 if(!button||button.disabled)return;
 dateInput.value=isoToVi(button.dataset.date);
 calendarClose();updatePreview();dateInput.focus();
});
document.addEventListener('click',e=>{
 if(!calPopup.hidden&&!e.target.closest('.a21-date-wrap'))calendarClose();
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&!calPopup.hidden){calendarClose();calToggle.focus();}
});
buildClassSelect('');

const relogin=$('a21LoginAgain');
let requestId=0;
function status(s,err=false){info.textContent=s;info.style.color=err?'#a22732':'#086e57';}
function auth(){
 const a=window.HVAPersonnel?.ensureAuth?.();
 if(!a||!a.getSessionState().validLocal)throw Error('Phiên EDOS hết hạn, đăng nhập lại tại trang chủ.');
 return a.withAuthBody({}).sessionToken;
}
const submitAction=$('a22OpenSubmission'),submissionPanel=$('a22SubmissionEditor');
function markAction(which){
 if(!byCode())return;
 btn.classList.toggle('a21-action-active',which==='schedule');
 submitAction?.classList.toggle('a21-action-active',which==='submission');
 btn.setAttribute('aria-pressed',String(which==='schedule'));
 submitAction?.setAttribute('aria-pressed',String(which==='submission'));
}
function sync(){
 const active=byCode();btn.hidden=!active;
 if(!active){
  panel.hidden=true;
  btn.classList.remove('a21-action-active');
  submitAction?.classList.remove('a21-action-active');
 }else{
  // A.2.1: mở danh mục trước, kế thừa A.1.1.
  markAction('');
  panel.hidden=true;
  submissionPanel?.classList.add('hidden');
 }
}
function get(action,params={}){
 const token=auth();
 return new Promise((resolve,reject)=>{
  const cb='hvaKTL_'+Date.now()+'_'+Math.floor(Math.random()*999999);
  const url=new URL(API);url.searchParams.set('action',action);url.searchParams.set('sessionToken',token);
  url.searchParams.set('callback',cb);
  for(const [k,v] of Object.entries(params))url.searchParams.set(k,String(v));
  const s=document.createElement('script');let timer,done=false;
  function clean(){clearTimeout(timer);s.remove();try{delete window[cb]}catch(_){}}
  window[cb]=data=>{if(done)return;done=true;clean();if(!data?.ok||!data?.success)reject(Error(data?.message||'Backend chưa có tuyến '+action));else resolve(data)};
  s.onerror=()=>{if(done)return;done=true;clean();reject(Error('Không tải được phản hồi từ Backend V5. Kiểm tra triển khai Web App và quyền truy cập.'))};
  // Nếu Router trả JSON thông thường thay vì JSONP, script tải xong nhưng
  // không gọi callback. Báo chính xác thay vì treo thông báo "Đang tải".
  s.onload=()=>{if(done)return;setTimeout(()=>{
   if(done)return;done=true;clean();
   reject(Error('Router chưa trả JSONP cho ktScheduleList. Kiểm tra đã cài module 35, nối action GET và Deploy phiên bản Web App mới.'));
  },300)};
  timer=setTimeout(()=>{if(done)return;done=true;clean();reject(Error('Backend quá thời gian phản hồi. Kiểm tra triển khai Web App, phiên đăng nhập và module 35.'))},20000);
  s.src=url.toString();document.head.appendChild(s);
 });
}
async function post(action,data){
 const sessionToken=auth();
 const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,sessionToken,...data})});
 if(!r.ok)throw Error('Máy chủ HTTP '+r.status);
 const d=await r.json();if(!d?.ok||!d?.success)throw Error(d?.message||'Backend chưa xác nhận lưu lịch.');return d;
}
function localCheck(r){
 const problems=[];
 const centralized=['ngữ văn','toán','tiếng anh','lịch sử'];
 if(centralized.includes(String(r.subject||'').trim().toLocaleLowerCase('vi')))
  problems.push('Môn này kiểm tra tập trung cuối kỳ I theo Kế hoạch 400; không đăng ký lịch không tập trung trong đợt này.');
 if(r.className&&!/^(10|11|12)\/(?:[1-9]|[1-9][0-9])$/.test(r.className))problems.push('Lớp chưa đúng định dạng.');
 if(r.date&&(r.date<'2026-12-14'||r.date>'2027-01-05'))problems.push('Ngày ngoài thời gian 14/12/2026–05/01/2027.');
 if(['2026-12-24','2026-12-25','2027-01-01'].includes(r.date))problems.push('Ngày không được tổ chức kiểm tra.');
 if(r.date){const d=new Date(r.date+'T00:00:00Z');if(d.getUTCDay()===0)problems.push('Không kiểm tra vào Chủ nhật.');}
 if(r.start&&r.end&&+r.start>+r.end)problems.push('Tiết bắt đầu lớn hơn tiết kết thúc.');
 const fixed={'2026-12-21':{'Sáng':'12','Chiều':'11'},'2026-12-22':{'Sáng':'10','Chiều':'12'},'2026-12-23':{'Sáng':'11','Chiều':'10'}};
 if(fixed[r.date]?.[r.session]===r.className.split('/')[0])problems.push('Trùng buổi kiểm tra tập trung của khối.');
 return problems;
}
function currentDraft(){
 return {
  className:$('a21Class').value.trim(),subject:$('a21Subject').value,
  date:viToIso($('a21Date').value),session:$('a21Session').value,
  start:$('a21Start').value,end:$('a21End').value,
  assessment:$('a21Assessment').value,roomType:$('a21RoomType').value,room:chosenRoom()
 };
}
function displayDate(s){
 const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
 return m?m[3]+'/'+m[2]+'/'+m[1]:'—';
}
function updatePreview(){
 const p=currentDraft(),row=$('a21PreviewBody'),flag=$('a21PreviewState'),warning=$('a21PreviewWarning');
 if(!row||!flag||!warning)return;
 const empty=!p.className&&!p.subject&&!p.date&&!p.session&&!p.start&&!p.end&&!p.assessment;
 if(empty){
  row.innerHTML='<tr><td colspan="7">Chọn môn, lớp, ngày và tiết để xem trước.</td></tr>';
  flag.textContent='Chưa đủ thông tin';warning.textContent='';return;
 }
 const rawDay=dateInput.value.trim();
 const dateInvalid=!!rawDay&&!viToIso(rawDay);
 const r={...p,start:Number(p.start),end:Number(p.end)};
 const issues=localCheck(r);
 if(!p.room)issues.push('Chọn phòng P. 01–P. 17 hoặc ghi rõ phòng/khu vực khác.');
 if(dateInvalid)issues.unshift('Ngày không đúng định dạng Việt Nam dd/mm/yyyy hoặc không tồn tại.');
 const incomplete=!p.className||!p.subject||!p.date||!p.session||!p.start||!p.end||!p.assessment||!p.room;
 row.innerHTML='<tr>'+[
  p.className,p.subject,displayDate(p.date),p.session,
  p.start?(p.start+(p.end&&p.end!==p.start?'–'+p.end:'')):'—',
  p.assessment,(roomTypes[p.roomType]||'Phòng học')+(p.room?' – '+p.room:'')
 ].map(x=>'<td>'+esc(x||'—')+'</td>').join('')+'</tr>';
 flag.textContent=issues.length?'Có lỗi cần sửa':incomplete?'Chưa đủ thông tin':'Sẵn sàng kiểm tra trên Backend';
 flag.style.color=issues.length?'#ab3032':incomplete?'#70511d':'#096947';
 warning.textContent=issues.length?issues.join(' • '):
  incomplete?'Điền đầy đủ các trường có dấu * trước khi lưu.':'';
 warning.style.color=issues.length?'#a72a33':'#6b5b31';
}
['input','change'].forEach(evt=>form.addEventListener(evt,updatePreview));
function approvalText(x){
 const rv=x.review||{};
 const chief=rv.chiefName||rv.chief||'';
 const approver=rv.approverName||rv.approver||'';
 const fmt=t=>{if(!t)return '';const d=new Date(t);return Number.isFinite(d.getTime())?d.toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit',year:'numeric'}):'';};
 if(x.status==='APPROVED'){
  return '✓ Đã được TTCM '+esc(chief||'của tổ')+' xác nhận'+(rv.confirmedAt?' ('+esc(fmt(rv.confirmedAt))+')':'')
  +' và BGH '+esc(approver||'của trường')+' phê duyệt'+(rv.approvedAt?' ('+esc(fmt(rv.approvedAt))+')':'')+'.';
 }
 if(x.status==='WAIT_BGH')return '✓ Đã được TTCM '+esc(chief||'của tổ')+' xác nhận'+(rv.confirmedAt?' ('+esc(fmt(rv.confirmedAt))+')':'')+'; đang chờ BGH phê duyệt.';
 if(x.status==='DRAFT')return 'Bản nháp đã lưu trên EDOS; chưa gửi TTCM.';
 if(x.status==='WAIT_TTCM')return 'Đã gửi TTCM; đang chờ TTCM rà soát và xác nhận.';
 return esc(labels[x.status]||x.status||'');
}
function render(){
 if(!ready){table.textContent='Chưa kết nối bảng lịch chung toàn trường.';return;}
 const rows=remote.filter(x=>x.username===actor?.username);
 if(!rows.length){table.textContent='Thầy/cô chưa đăng ký lịch kiểm tra nào trên Backend.';return;}
 table.innerHTML='<strong>Đăng ký của tôi (dữ liệu Backend)</strong>'+rows.map(x=>`
 <div class="a21-schedule-entry"><span><b>${esc(x.className)} – ${esc(x.subject)}</b> · ${esc(displayDate(x.date))} · ${esc(x.session)} · Tiết ${esc(x.start)}–${esc(x.end)} · ${esc(x.room||'Chưa có phòng')}
 <small style="display:block;color:#52738d;line-height:1.6">${approvalText(x)}</small></span>
 ${x.status==='DRAFT'?'<div class="a21-entry-actions"><button type="button" class="secondary" data-edit="'+esc(x.id)+'">Sửa nháp</button><button type="button" class="a21-send-ttcm" data-send="'+esc(x.id)+'">Gửi TTCM <span aria-hidden="true">➜</span></button></div>':x.status==='WAIT_TTCM'?'<div class="a21-entry-actions">'+(!String(x.room||'').trim()?'<button type="button" class="secondary" data-edit="'+esc(x.id)+'">Bổ sung phòng</button>':'')+'<span class="a21-submitted-tag" title="Đã chuyển vào danh sách chờ xác nhận của TTCM">✓ Đã gửi TTCM</span></div>':''}</div>`).join('');
}
async function refresh(){
 const turn=++requestId;
 ready=false;render();status('Đang kiểm tra phiên và kết nối bảng lịch chung EDOS…');
 if(relogin)relogin.hidden=true;
 try{
  // Kiểm tra phiên trước khi mở kết nối, không để người dùng chờ timeout vô ích.
  auth();
  const d=await get('ktScheduleList');
  if(turn!==requestId)return;
  remote=d.items||[];actor=d.actor||{};if(!actor.username||!(actor.name||actor.hoTen)||!(actor.team||actor.toBoPhan))throw Error('Backend chưa trả đủ thông tin tài khoản giáo viên.');ready=true;updateActorCard(actor);
  render();
  status('');$('a21ConnectionActions').hidden=true;
 }catch(e){
  if(turn!==requestId)return;
  ready=false;render();updateActorCard(null);$('a21ConnectionActions').hidden=false;
  const msg=String(e.message||e);
  const expired=/phiên|đăng nhập|hết hạn|AUTH_REQUIRED|SESSION_INVALID/i.test(msg);
  if(relogin)relogin.hidden=!expired;
  status((expired?'Cần đăng nhập lại EDOS: ':'Chưa kết nối được dữ liệu lịch chung: ')+msg+
  (expired?'':' Không ghi nhận đăng ký cho đến khi Backend xác nhận.'),true);
 }
}
$('a21RetryConnection')?.addEventListener('click',refresh);
btn.addEventListener('click',()=>{
 if(!byCode())return;
 markAction('schedule');panel.hidden=false;
 submissionPanel?.classList.add('hidden');
 $('previewPanel')?.classList.add('hidden');
 refresh();panel.scrollIntoView({behavior:'smooth',block:'start'});
});
submitAction?.addEventListener('click',()=>{
 if(!byCode())return;
 markAction('submission');panel.hidden=true;
 // The original NVS_A22_Controller listener still opens the existing submission form.
});

$('a21ScheduleClose')?.addEventListener('click',()=>{panel.hidden=true;btn.classList.remove('a21-action-active');btn.setAttribute('aria-pressed','false');});
table.addEventListener('click',async e=>{
 const sendId=e.target.closest('[data-send]')?.dataset.send;
 if(sendId){
  if(busy||!ready)return;
  const draft=remote.find(x=>x.id===sendId&&x.username===actor?.username&&x.status==='DRAFT');
  if(!draft)return;
  // Ensure a deliberate user action; don't silently forward when saving.
  if(!await window.hvaA21Dialog('Xác nhận gửi lịch kiểm tra','Gửi lịch '+draft.className+' – '+draft.subject+' cho TTCM '+(actor?.team||'')+'? Sau khi gửi, không thể sửa trực tiếp.','Xác nhận gửi'))return;if(busy||!ready||!remote.some(x=>x.id===sendId&&x.username===actor?.username&&x.status==='DRAFT'))return;
  busy=true;const btn=e.target.closest('button');if(btn)btn.disabled=true;
  try{
   const sent=await post('ktScheduleSave',{sendId});
   await refresh();
   status(sent.message||'Đã gửi đăng ký cho TTCM.');if(ready&&remote.some(x=>x.id===sendId&&x.username===actor?.username&&['WAIT_TTCM','WAIT_BGH','APPROVED'].includes(x.status)))await window.hvaA21Dialog('Gửi lịch thành công','Đăng ký '+draft.className+' – '+draft.subject+' đã chuyển đến TTCM.','Đóng',true);
  }catch(err){status('CHƯA gửi TTCM: '+String(err.message||err),true);}
  finally{busy=false;if(btn?.isConnected)btn.disabled=false;}
  return;
 }
 const id=e.target.closest('[data-edit]')?.dataset.edit;if(!id||busy)return;
 const x=remote.find(r=>r.id===id&&r.username===actor?.username&&(
  r.status==='DRAFT'||r.status==='WAIT_TTCM'&&!String(r.room||'').trim()));if(!x)return;
 form.dataset.editingLegacy=x.status==='WAIT_TTCM'?'true':'false';
 const save=$('a21SaveDraft');
 if(save)save.textContent=x.status==='WAIT_TTCM'?'Cập nhật phòng cho lịch đã gửi':'Lưu nháp trên EDOS';
 editingId=x.id;
 gradeSelect.value=String(x.className||'').split('/')[0];
 buildClassSelect(gradeSelect.value,x.className);
 const vals={a21Subject:x.subject,a21Date:isoToVi(x.date),a21Session:x.session,a21Start:x.start,a21End:x.end,a21Assessment:x.assessment,a21RoomType:x.roomType||'CLASSROOM',a21Room: /^P\.\s*(?:0[1-9]|1[0-7])$/.test(x.room||'')?x.room:'OTHER'};
 $('a21RoomOther').value=vals.a21Room==='OTHER'?(x.room||''):'';
 for(const [k,v] of Object.entries(vals))$(k).value=String(v);
 calendarClose();setRoomMode();if($('a21Room').value==='OTHER')$('a21RoomOther').value=x.room||'';updatePreview();
 status(x.status==='WAIT_TTCM'?'Đang bổ sung phòng cho lịch ĐÃ GỬI TTCM: '+x.className+' – '+x.subject+'. Không đăng ký lại lịch này.':'Đang sửa nháp '+x.className+' – '+x.subject+'.');form.scrollIntoView({block:'start',behavior:'smooth'});
});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;
 if(!ready){status('Chưa kết nối được Backend chung; không thể gửi đăng ký.',true);return;}
 // A matching legacy WAIT_TTCM record without room must be updated, not duplicated.
 if(!editingId){
  const cls=$('a21Class').value.trim(),sub=$('a21Subject').value.trim();
  const legacy=remote.filter(x=>x.username===actor?.username&&x.status==='WAIT_TTCM'&&!String(x.room||'').trim()
    &&x.className===cls&&x.subject===sub&&x.date===viToIso($('a21Date').value)&&x.session===$('a21Session').value);
  if(legacy.length===1){editingId=legacy[0].id;form.dataset.editingLegacy='true';}
 }
 const r={id:editingId||'',className:$('a21Class').value.trim(),subject:$('a21Subject').value.trim(),
 date:viToIso($('a21Date').value),session:$('a21Session').value,start:+$('a21Start').value,end:+$('a21End').value,
 assessment:$('a21Assessment').value,roomType:$('a21RoomType').value,room:chosenRoom()};
 const issues=localCheck(r);if(!r.room)issues.unshift('Cần nhập số/tên phòng hoặc khu vực kiểm tra.');if(!r.date)issues.unshift('Ngày kiểm tra phải nhập đúng định dạng dd/mm/yyyy.');if(issues.length){status(issues.join(' • '),true);return;}
 busy=true;form.querySelector('button[type="submit"]').disabled=true;
 try{
  const data=await post('ktScheduleSave',{record:r});
  // Older deployed module 35 may acknowledge the save without persisting room.
  // Preserve the form and verify both the POST result and subsequent GET.
  const ack=data.item||{};
  if(!ack.id||String(ack.id)!==String(r.id||ack.id)||String(ack.room||'').trim()!==r.room){
   throw Error('Backend đang dùng module 35 cũ hoặc không ghi phòng. Phòng '+r.room+
    ' chưa được xác nhận. Giữ nguyên biểu mẫu; cần cập nhật module 35 trên Apps Script V5 và triển khai New version.');
  }
  await refresh();
  const saved=remote.find(x=>x.id===ack.id&&x.username===actor?.username);
  if(!ready||!saved||String(saved.room||'').trim()!==r.room){
   throw Error('Backend phản hồi nhưng đọc lại không thấy phòng '+r.room+
    ' của đúng lịch. Không tự xoá thông tin; kiểm tra module 35 và phiên bản triển khai.');
  }
  editingId='';delete form.dataset.editingLegacy;
  if($('a21SaveDraft'))$('a21SaveDraft').textContent='Lưu nháp trên EDOS';
  form.reset();buildClassSelect('');calendarClose();setRoomMode();updatePreview();
  status(saved.status==='DRAFT'?'✓ Đã lưu bản nháp với phòng '+saved.room+'. Chọn Gửi TTCM trong danh sách bên dưới.':
   '✓ Đã cập nhật phòng '+saved.room+' cho lịch ĐÃ GỬI TTCM; không cần gửi lại.');
 }catch(err){status('CHƯA xác nhận cập nhật phòng: '+String(err.message||err),true);}
 finally{busy=false;form.querySelector('button[type="submit"]').disabled=false;}
});
$('code')?.addEventListener('change',()=>{sync();if(byCode())refresh();else updateActorCard(null);});sync();render();updateActorCard(null);setRoomMode();updatePreview();if(byCode())refresh();
})();