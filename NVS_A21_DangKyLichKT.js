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
  s.onerror=()=>{if(done)return;done=true;clean();reject(Error('Không kết nối được EDOS V5.'))};
  timer=setTimeout(()=>{if(done)return;done=true;clean();reject(Error('Hết thời gian kết nối Backend.'))},16000);
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
 if(!/^(10|11|12)\/(?:[1-9]|[1-9][0-9])$/.test(r.className))problems.push('Lớp chưa đúng định dạng.');
 if(r.date<'2026-12-14'||r.date>'2027-01-05')problems.push('Ngày ngoài thời gian 14/12/2026–05/01/2027.');
 if(['2026-12-24','2026-12-25','2027-01-01'].includes(r.date))problems.push('Ngày không được tổ chức kiểm tra.');
 if(r.date){const d=new Date(r.date+'T00:00:00Z');if(d.getUTCDay()===0)problems.push('Không kiểm tra vào Chủ nhật.');}
 if(+r.start>+r.end)problems.push('Tiết bắt đầu lớn hơn tiết kết thúc.');
 const fixed={'2026-12-21':{'Sáng':'12','Chiều':'11'},'2026-12-22':{'Sáng':'10','Chiều':'12'},'2026-12-23':{'Sáng':'11','Chiều':'10'}};
 if(fixed[r.date]?.[r.session]===r.className.split('/')[0])problems.push('Trùng buổi kiểm tra tập trung của khối.');
 return problems;
}
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
 ready=false;render();status('Đang tải đăng ký từ bảng chung EDOS…');
 try{const d=await get('ktScheduleList');remote=d.items||[];actor=d.actor||{};ready=true;
  render();status('Đã đồng bộ '+remote.filter(x=>x.username===actor.username).length+' lịch của thầy/cô. Lịch lưu trên máy chủ dùng chung toàn trường.');
 }catch(e){status('Chưa kết nối được nơi lưu chung: '+e.message+'. Không thể gửi đăng ký lúc này.',true);}
}
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
 const vals={a21Class:x.className,a21Subject:x.subject,a21Date:x.date,a21Session:x.session,a21Start:x.start,a21End:x.end,a21Assessment:x.assessment};
 for(const [k,v] of Object.entries(vals))$(k).value=String(v);
 status('Đang sửa lịch '+x.className+' – '+x.subject+'. Chọn “Lưu đăng ký lên EDOS” để cập nhật.');
});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(busy)return;
 if(!ready){status('Chưa kết nối được Backend chung; không thể gửi đăng ký.',true);return;}
 const r={id:editingId||'',className:$('a21Class').value.trim(),subject:$('a21Subject').value.trim(),
 date:$('a21Date').value,session:$('a21Session').value,start:+$('a21Start').value,end:+$('a21End').value,
 assessment:$('a21Assessment').value};
 const issues=localCheck(r);if(issues.length){status(issues.join(' • '),true);return;}
 busy=true;form.querySelector('button[type="submit"]').disabled=true;
 try{const data=await post('ktScheduleSave',{record:r});editingId='';form.reset();
  status(data.message||'Đã đăng ký thành công vào bảng chung, chờ TTCM xác nhận.');await refresh();
 }catch(err){status('CHƯA ghi lịch: '+String(err.message||err),true);}
 finally{busy=false;form.querySelector('button[type="submit"]').disabled=false;}
});
$('code')?.addEventListener('change',sync);sync();render();if(byCode())refresh();
})();