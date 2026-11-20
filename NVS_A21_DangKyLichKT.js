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
const labels={WAIT_TTCM:'Chờ TTCM xác nhận',WAIT_BGH:'Đã gửi BGH',APPROVED:'Đã được BGH duyệt'};
const byCode=()=>$('code')?.value==='A.2.1';
const classMax=Object.freeze({'10':9,'11':9,'12':12});
const gradeSelect=$('a21Grade'),classSelect=$('a21Class'),dateInput=$('a21Date'),nativeDate=$('a21NativeDate');
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
 if(x){
  name.textContent=String(x.name||x.username);
  details.textContent='Tổ: '+String(x.team||'Chưa xác định')+' · Tài khoản: '+x.username;
  flag.textContent='Backend xác thực';flag.classList.add('verified');
 }else{
  name.textContent='Chưa xác minh tài khoản';
  details.textContent='Đăng nhập lại EDOS hoặc kiểm tra kết nối Backend để truy xuất thông tin giáo viên.';
  flag.textContent='Chưa xác minh';flag.classList.remove('verified');
 }
}
gradeSelect?.addEventListener('change',()=>{buildClassSelect(gradeSelect.value);updatePreview();});
nativeDate?.addEventListener('change',()=>{dateInput.value=isoToVi(nativeDate.value);updatePreview();});
dateInput?.addEventListener('input',()=>{
 const v=dateInput.value.trim();
 const iso=viToIso(v);
 nativeDate.value=iso||'';
 updatePreview();
});
dateInput?.addEventListener('blur',()=>{
 const iso=viToIso(dateInput.value);
 if(iso){dateInput.value=isoToVi(iso);nativeDate.value=iso;}
 updatePreview();
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
  // A.2.1 defaults to schedule registration. Other A.2 menus retain old behavior.
  markAction('schedule');
  panel.hidden=false;
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
  assessment:$('a21Assessment').value
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
  row.innerHTML='<tr><td colspan="6">Chọn môn, lớp, ngày và tiết để xem trước.</td></tr>';
  flag.textContent='Chưa đủ thông tin';warning.textContent='Bảng này thể hiện nội dung đang nhập; chưa gửi đến TTCM.';return;
 }
 const rawDay=dateInput.value.trim();
 const dateInvalid=!!rawDay&&!viToIso(rawDay);
 const r={...p,start:Number(p.start),end:Number(p.end)};
 const issues=localCheck(r);
 if(dateInvalid)issues.unshift('Ngày không đúng định dạng Việt Nam dd/mm/yyyy hoặc không tồn tại.');
 const incomplete=!p.className||!p.subject||!p.date||!p.session||!p.start||!p.end||!p.assessment;
 row.innerHTML='<tr>'+[
  p.className,p.subject,displayDate(p.date),p.session,
  p.start?(p.start+(p.end&&p.end!==p.start?'–'+p.end:'')):'—',
  p.assessment
 ].map(x=>'<td>'+esc(x||'—')+'</td>').join('')+'</tr>';
 flag.textContent=issues.length?'Có lỗi cần sửa':incomplete?'Chưa đủ thông tin':'Sẵn sàng kiểm tra trên Backend';
 flag.style.color=issues.length?'#ab3032':incomplete?'#70511d':'#096947';
 warning.textContent=issues.length?issues.join(' • '):
  incomplete?'Điền đầy đủ các trường có dấu * trước khi lưu.':
  'Xem trước hợp lệ theo các điều kiện tại giao diện. Chưa lưu; Backend sẽ kiểm tra toàn bộ lịch của trường trước khi xác nhận.';
 warning.style.color=issues.length?'#a72a33':'#6b5b31';
}
['input','change'].forEach(evt=>form.addEventListener(evt,updatePreview));
function render(){
 if(!ready){table.textContent='Chưa kết nối bảng lịch chung toàn trường.';return;}
 const rows=remote.filter(x=>x.username===actor?.username);
 if(!rows.length){table.textContent='Thầy/cô chưa đăng ký lịch kiểm tra nào trên Backend.';return;}
 table.innerHTML='<strong>Đăng ký của tôi (dữ liệu Backend)</strong>'+rows.map(x=>`
 <div class="a21-schedule-entry"><span><b>${esc(x.className)} – ${esc(x.subject)}</b> · ${esc(x.date)} · ${esc(x.session)} · Tiết ${esc(x.start)}–${esc(x.end)}
 <small style="display:block;color:#52738d">${esc(labels[x.status]||x.status)}</small></span>
 ${x.status==='WAIT_TTCM'?'<button type="button" class="secondary" data-edit="'+esc(x.id)+'">Sửa</button>':''}</div>`).join('');
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
  remote=d.items||[];actor=d.actor||{};ready=true;updateActorCard(actor);
  render();
  status('Kết nối Backend thành công. Đã tải '+remote.filter(x=>x.username===actor.username).length+' lịch đăng ký của thầy/cô.');
 }catch(e){
  if(turn!==requestId)return;
  ready=false;render();updateActorCard(null);
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
table.addEventListener('click',e=>{
 const id=e.target.closest('[data-edit]')?.dataset.edit;if(!id)return;
 const x=remote.find(r=>r.id===id&&r.username===actor?.username&&r.status==='WAIT_TTCM');if(!x)return;
 editingId=x.id;
 gradeSelect.value=String(x.className||'').split('/')[0];
 buildClassSelect(gradeSelect.value,x.className);
 const vals={a21Subject:x.subject,a21Date:isoToVi(x.date),a21Session:x.session,a21Start:x.start,a21End:x.end,a21Assessment:x.assessment};
 for(const [k,v] of Object.entries(vals))$(k).value=String(v);
 nativeDate.value=x.date;updatePreview();
 status('Đang sửa lịch '+x.className+' – '+x.subject+'. Chọn “Lưu đăng ký lên EDOS” để cập nhật.');
});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;
 if(!ready){status('Chưa kết nối được Backend chung; không thể gửi đăng ký.',true);return;}
 const r={id:editingId||'',className:$('a21Class').value.trim(),subject:$('a21Subject').value.trim(),
 date:viToIso($('a21Date').value),session:$('a21Session').value,start:+$('a21Start').value,end:+$('a21End').value,
 assessment:$('a21Assessment').value};
 const issues=localCheck(r);if(!r.date)issues.unshift('Ngày kiểm tra phải nhập đúng định dạng dd/mm/yyyy.');if(issues.length){status(issues.join(' • '),true);return;}
 busy=true;form.querySelector('button[type="submit"]').disabled=true;
 try{const data=await post('ktScheduleSave',{record:r});editingId='';form.reset();buildClassSelect('');nativeDate.value='';
  status(data.message||'Đã đăng ký thành công vào bảng chung, chờ TTCM xác nhận.');updatePreview();await refresh();
 }catch(err){status('CHƯA ghi lịch: '+String(err.message||err),true);}
 finally{busy=false;form.querySelector('button[type="submit"]').disabled=false;}
});
$('code')?.addEventListener('change',sync);sync();render();updateActorCard(null);updatePreview();if(byCode())refresh();
})();