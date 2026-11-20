/* KT01 | TTCM batch approval, BGH decision; shared with NVS A.2.1.
   No separate personnel store, no separate doGet/doPost. */
(function(){
'use strict';
const API='https://script.google.com/macros/s/AKfycbzZBemNxnkqhIT2iz0CdtdFJqhlOu8LgZMzmnNjMxSGZRrz-ULuvEZb7MbKoufelWNY/exec';
const root=document.createElement('section');root.className='panel';root.id='kt01ScheduleModule';root.style.cssText='padding:20px;margin:16px 0;border:2px solid #9acded;border-radius:16px;background:white';
root.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
<div><h2 style="color:#09578c;margin:0 0 6px">ĐĂNG KÝ VÀ ĐIỀU PHỐI LỊCH KIỂM TRA KHÔNG TẬP TRUNG</h2>
<p style="font-size:13px;color:#54758c;margin:0">Kế hoạch 400/KH-THPTHV · Giáo viên đăng ký tại NVS A.2.1 → TTCM xác nhận toàn tổ → BGH phê duyệt.</p></div>
<button id="ktlRefresh" type="button" style="padding:11px 14px;border:1px solid #a8cde6;border-radius:9px">Làm mới lịch</button></div>
<div id="ktlInfo" style="font-size:13px;margin:13px 0;padding:12px;background:#eef7ff;border-radius:9px" role="status">Đang kiểm tra kết nối Backend…</div>
<div id="ktlTeamArea" hidden>
 <h3 style="color:#13547f">TTCM – Xác nhận lịch của tổ</h3>
 <label style="display:block;margin:9px 0">Xác nhận đã rà soát đủ giáo viên, lớp, môn phải đăng ký
 <input id="ktlComplete" type="checkbox"> <b>Đã đối chiếu phân công chuyên môn và xác nhận lịch tổ đầy đủ</b></label>
 <label style="display:block;margin:9px 0">Căn cứ rà soát / trường hợp không phải đăng ký
 <textarea id="ktlCompleteNote" style="display:block;width:100%;min-height:65px;border:1px solid #c1d8e9;border-radius:9px;padding:9px" placeholder="Đã rà soát các lớp/môn theo phân công; các trường hợp không đăng ký..."></textarea></label>
 <button type="button" id="ktlSubmit" style="padding:10px 14px;border-radius:9px">Xác nhận lịch tổ – Gửi BGH</button>
 </div>
<div id="ktlBatchArea"><h3 style="color:#13547f">Hồ sơ lịch trình BGH</h3><div id="ktlBatches">Chưa tải danh sách.</div></div>
<h3 style="color:#13547f">Lịch kiểm tra của giáo viên</h3>
<div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:12px" id="ktlTable"><thead><tr>
<th>Giáo viên</th><th>Tổ</th><th>Lớp</th><th>Môn</th><th>Ngày</th><th>Buổi / Tiết</th><th>Trạng thái</th></tr></thead><tbody></tbody></table></div>
<div id="ktlDecision" hidden style="margin-top:18px;padding:14px;border:1px solid #b9d7e8;border-radius:10px">
<strong id="ktlSelectedTitle"></strong>
<label style="display:block;margin:9px 0">Ý kiến BGH<textarea id="ktlComment" rows="2" style="width:100%;padding:10px;border:1px solid #bdcfe2;border-radius:9px" placeholder="Lý do khi trả lại TTCM"></textarea></label>
<div style="display:flex;gap:9px;flex-wrap:wrap">
<button type="button" id="ktlApprove" style="padding:10px 14px">Phê duyệt lịch tổ</button>
<button type="button" id="ktlReturn" style="padding:10px 14px">Trả lại TTCM</button>
</div></div>`;
const main=document.querySelector('main');
if(!main)return;
main.insertBefore(root,main.firstChild?.nextSibling||null);
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
let records=[],batches=[],actor=null,selected='',ready=false,busy=false;
const statusText={WAIT_TTCM:'Chờ TTCM',WAIT_BGH:'Chờ BGH',APPROVED:'Đã phê duyệt',RETURNED:'BGH trả lại'};
function status(s,error=false){const e=$('ktlInfo');e.textContent=s;e.style.background=error?'#fff1eb':'#eef7ff';e.style.color=error?'#a93231':'#0b5686';}
function auth(){
 const a=window.HVAPersonnel?.ensureAuth?.();
 if(!a?.getSessionState?.().validLocal)throw Error('Phiên EDOS không hợp lệ; vui lòng đăng nhập lại tại Trang chủ.');
 return a.withAuthBody({}).sessionToken;
}
function jsonp(action){
 const token=auth();
 return new Promise((resolve,reject)=>{
 const cb='ktlCallback'+Date.now()+'_'+Math.floor(Math.random()*999999),url=new URL(API);
 url.searchParams.set('action',action);url.searchParams.set('sessionToken',token);url.searchParams.set('callback',cb);
 const script=document.createElement('script');let timer,done=false;
 const finish=()=>{clearTimeout(timer);script.remove();try{delete window[cb]}catch(_){}};
 window[cb]=d=>{if(done)return;done=true;finish();d?.ok&&d?.success?resolve(d):reject(Error(d?.message||'Backend thiếu tuyến '+action));};
 script.onerror=()=>{if(done)return;done=true;finish();reject(Error('Không kết nối được Backend KT01.'))};
 timer=setTimeout(()=>{if(done)return;done=true;finish();reject(Error('Backend KT01 không phản hồi.'))},16000);
 script.src=url.toString();document.head.appendChild(script);
 });
}
async function post(action,payload){
 const sessionToken=auth();const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
  body:JSON.stringify({action,sessionToken,...payload})});
 if(!r.ok)throw Error('Backend HTTP '+r.status);
 const d=await r.json();if(!d?.success||!d?.ok)throw Error(d?.message||'Backend chưa xác nhận.');
 return d;
}
function render(){
 $('ktlTeamArea').hidden=!actor?.chief;
 const tbody=$('ktlTable').querySelector('tbody');
 const visible=records.slice().sort((a,b)=>String(a.date+a.session+a.className).localeCompare(String(b.date+b.session+b.className)));
 tbody.innerHTML=visible.map(x=>`<tr style="border-top:1px solid #dae8f1"><td style="padding:8px">${esc(x.teacher)}</td><td style="padding:8px">${esc(x.team)}</td><td style="padding:8px">${esc(x.className)}</td>
 <td style="padding:8px">${esc(x.subject)}</td><td style="padding:8px">${esc(x.date)}</td><td style="padding:8px">${esc(x.session)} · ${esc(x.start)}–${esc(x.end)}</td>
 <td style="padding:8px">${esc(statusText[x.status]||x.status)}</td></tr>`).join('');
 if(!visible.length)tbody.innerHTML='<tr><td colspan="7" style="padding:12px">Chưa có lịch đăng ký trong phạm vi được xem.</td></tr>';
 $('ktlBatches').innerHTML=batches.map(x=>`<div style="margin:7px 0;padding:10px;border:1px solid #d2e4ef;border-radius:10px">
 <b>${esc(x.team)}</b> · ${esc(x.count)} lịch · ${esc(statusText[x.status]||x.status)}
 <small style="display:block;color:#54738b">TTCM: ${esc(x.chief)} · ${esc(x.submittedAt)} ${x.comment?'· Ý kiến BGH: '+esc(x.comment):''}</small>
 ${actor?.bgh&&x.status==='WAIT_BGH'?'<button type="button" data-batch="'+esc(x.id)+'" style="margin-top:7px;padding:8px 12px">Xem và duyệt</button>':''}
 </div>`).join('')||'Chưa có tổ trình lịch.';
}
async function load(){
 ready=false;status('Đang đọc lịch đăng ký chung và hồ sơ các tổ...');
 try{
 const [r,b]=await Promise.all([jsonp('ktScheduleList'),jsonp('ktScheduleBatches')]);
 actor=r.actor;records=r.items||[];batches=b.batches||[];ready=true;
 render();status('Đã đồng bộ '+records.length+' lịch và '+batches.length+' hồ sơ tổ từ Backend. Các xung đột được kiểm tra trước khi máy chủ xác nhận.');
 }catch(e){actor=null;records=[];batches=[];render();status('KT01 chưa kết nối quy trình lịch: '+e.message,true);}
}
$('ktlRefresh').addEventListener('click',load);
$('ktlSubmit').addEventListener('click',async()=>{
 if(!ready||busy)return;busy=true;
 try{
 const d=await post('ktScheduleTeamSubmit',{confirmComplete:$('ktlComplete').checked,completenessNote:$('ktlCompleteNote').value.trim()});
 status(d.message);await load();
 }catch(e){status('Chưa gửi BGH: '+e.message,true);}
 finally{busy=false;}
});
$('ktlBatches').addEventListener('click',e=>{
 const id=e.target.closest('[data-batch]')?.dataset.batch;if(!id||!actor?.bgh)return;
 selected=id;const x=batches.find(b=>b.id===id);$('ktlDecision').hidden=false;
 $('ktlSelectedTitle').textContent='BGH xem xét lịch tổ '+(x?.team||'');
 $('ktlComment').value='';
 $('ktlDecision').scrollIntoView({block:'nearest',behavior:'smooth'});
});
async function decide(decision){
 if(!ready||!actor?.bgh||!selected||busy)return;
 busy=true;
 try{
  const d=await post('ktScheduleDecide',{batchId:selected,decision,comment:$('ktlComment').value.trim()});
  $('ktlDecision').hidden=true;selected='';status(d.message);await load();
 }catch(e){status('Chưa ghi quyết định: '+e.message,true);}
 finally{busy=false;}
}
$('ktlApprove').addEventListener('click',()=>decide('APPROVED'));
$('ktlReturn').addEventListener('click',()=>decide('RETURNED'));
load();
})();