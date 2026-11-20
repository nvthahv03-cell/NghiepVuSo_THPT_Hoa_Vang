/* HVA–EDOS V5 · KT02 Phase 1: TTCM scope proposal → BGH approval.
   Reuses the already-PASS CuocHop personnel/session. No new login.
   Backend must independently enforce the same approval before assignment saves/publishes. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const backend='https://script.google.com/macros/s/AKfycbzZBemNxnkqhIT2iz0CdtdFJqhlOu8LgZMzmnNjMxSGZRrz-ULuvEZb7MbKoufelWNY/exec';
let items=[],chosen=null,confirmed=null,requestSeq=0;
const stateLabel={DRAFT:'Dự thảo',PENDING:'Chờ BGH duyệt',APPROVED:'Đã duyệt nội dung',RETURNED:'BGH yêu cầu chỉnh sửa',REJECTED:'Không được phê duyệt'};
const root=document.createElement('section');root.className='panel';root.id='kt02ScopeWorkflow';
root.innerHTML=`
 <div class="kts-top"><div><h2>2. ĐỀ XUẤT NỘI DUNG KIỂM TRA – BGH PHÊ DUYỆT</h2>
 <p>TTCM căn cứ kế hoạch kiểm tra đã ban hành → nhập nội dung → gửi BGH duyệt → sau khi duyệt mới phân công công đoạn.</p></div>
 <span id="ktsStatus" class="kts-badge">Chưa có hồ sơ được duyệt</span></div>
 <div class="kts-notice" id="ktsMsg" role="status" aria-live="polite">Đang kết nối hồ sơ phê duyệt với Backend EDOS V5...</div>
 <div class="kts-select"><label>Hồ sơ trong phạm vi được cấp quyền
 <select id="ktsChoose"><option value="">Chọn hồ sơ hoặc tạo mới</option></select></label>
 <button id="ktsReload" type="button" class="outline">Tải lại từ Backend</button>
 <button id="ktsNew" type="button" class="outline">Đề xuất mới</button></div>
 <div class="kts-fields">
 <label>Khối <select id="ktsGrade"><option value="">Chọn khối</option><option>10</option><option>11</option><option>12</option></select></label>
 <label>Môn kiểm tra <input id="ktsSubject" placeholder="Ví dụ: Toán" maxlength="120"></label>
 <label>Kỳ kiểm tra <select id="ktsExam"><option value="">Chọn kỳ kiểm tra</option><option>Giữa kỳ I</option><option>Cuối kỳ I</option><option>Giữa kỳ II</option><option>Cuối kỳ II</option></select></label>
 <label>Năm học <input id="ktsYear" value="2026–2027" maxlength="30"></label>
 <label>Số/ký hiệu kế hoạch đã ban hành <input id="ktsPlan" placeholder="Số/ký hiệu kế hoạch" maxlength="200"></label>
 <label>Liên kết kế hoạch <input id="ktsPlanUrl" placeholder="https://..." type="url"></label>
 <label class="kts-wide">Căn cứ kế hoạch giáo dục môn học <textarea id="ktsTeaching" rows="2" placeholder="Số, ngày hoặc nội dung căn cứ đã được phê duyệt"></textarea></label>
 <label class="kts-wide">Nội dung/phạm vi kiểm tra <textarea id="ktsScope" rows="3" placeholder="Nội dung theo khối, phạm vi bài/chủ đề"></textarea></label>
 <label class="kts-wide">Yêu cầu cần đạt <textarea id="ktsRequirements" rows="3" placeholder="Bám CT GDPT 2018 và kế hoạch giáo dục môn học"></textarea></label>
 <label>Hình thức kiểm tra <input id="ktsFormat" placeholder="Tự luận, trắc nghiệm, kết hợp..."></label>
 <label>Cấu trúc đề/yêu cầu kiểm tra <input id="ktsStructure" placeholder="Số phần, thời lượng, mức độ..."></label>
 <label class="kts-wide">Lưu ý tổ chức <textarea id="ktsNotes" rows="2" placeholder="Không nhập đề hoặc đáp án mật"></textarea></label>
 </div>
 <div class="kts-actions" id="ktsTtcmActions">
 <button id="ktsSave" type="button" class="outline">Lưu dự thảo lên Backend</button>
 <button id="ktsSubmit" type="button">Gửi BGH phê duyệt</button></div>
 <div class="kts-approval" id="ktsBghActions" hidden>
 <label>Ý kiến BGH<textarea id="ktsComment" rows="2" placeholder="Ghi lý do khi yêu cầu chỉnh sửa hoặc không duyệt"></textarea></label>
 <div class="kts-actions">
 <button id="ktsApprove" type="button">Phê duyệt nội dung</button>
 <button id="ktsReturn" type="button" class="outline">Trả lại TTCM chỉnh sửa</button>
 <button id="ktsReject" type="button" class="outline">Không phê duyệt</button></div>
 </div>
 <div class="kts-gate" id="ktsGate">Giai đoạn phân công đang khóa: cần quyết định phê duyệt nội dung từ Backend.</div>`;
const style=document.createElement('style');style.textContent=`
#kt02ScopeWorkflow{border:2px solid #a6d4f5;background:linear-gradient(180deg,#f6fbff,#fff)}
.kts-top,.kts-select,.kts-actions{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.kts-top h2{margin:0;color:#0c5385;font-size:19px}.kts-top p{color:#547088;line-height:1.6;margin:8px 0 15px;font-size:13px}
.kts-badge{border:1px solid #c8a2f5;background:#f5efff;color:#6a35ad;border-radius:20px;padding:8px 12px;font-size:12px;font-weight:800}
.kts-notice,.kts-gate{padding:13px 15px;border-radius:11px;background:#e6f4ff;color:#164c74;margin:10px 0 16px;line-height:1.55}
.kts-gate{background:#fff4dc;color:#855b16;font-weight:700}
.kts-select{justify-content:flex-start;margin-bottom:15px}.kts-select label{flex:1;min-width:240px}
.kts-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.kts-fields label,.kts-select label,.kts-approval label{display:grid;gap:6px;color:#23536f;font-size:13px;font-weight:700}
.kts-fields .kts-wide{grid-column:1/-1}
.kts-fields input,.kts-fields select,.kts-fields textarea,.kts-select select,.kts-approval textarea{width:100%;border:1px solid #b1cce2;border-radius:9px;padding:10px;min-height:42px;font:inherit;background:white}
.kts-fields textarea,.kts-approval textarea{min-height:75px;resize:vertical}
.kts-actions{justify-content:flex-start;margin-top:17px}
.kts-actions button,.kts-select button{min-height:40px}
.kts-approval{border-top:1px solid #d3e3ee;margin-top:17px;padding-top:17px}
#kt02ScopeWorkflow [hidden]{display:none!important}
.kt02-phase-locked{opacity:.55;position:relative}
@media(max-width:650px){.kts-fields{grid-template-columns:1fr}}
`;
document.head.append(style);
const shell=document.querySelector('.shell');
const rosterPanel=shell?.querySelector('section.panel');
if(!shell||!rosterPanel)return;
rosterPanel.insertAdjacentElement('afterend',root);
const locked=[...shell.querySelectorAll('section.panel')].filter(e=>e!==rosterPanel&&e!==root);
const values={grade:'ktsGrade',subject:'ktsSubject',exam:'ktsExam',schoolYear:'ktsYear',
 planNumber:'ktsPlan',planUrl:'ktsPlanUrl',teachingPlan:'ktsTeaching',scope:'ktsScope',
 requirements:'ktsRequirements',format:'ktsFormat',structure:'ktsStructure',notes:'ktsNotes'};
function me(){return typeof session==='function'?session():{valid:false};}
function notify(message,issue=false){$('ktsMsg').textContent=message;$('ktsMsg').style.background=issue?'#fff0ec':'#e6f4ff';$('ktsMsg').style.color=issue?'#af3421':'#164c74';}
function token(){const x=me();if(!x.valid||!x.token)throw Error('Phiên EDOS đã hết hạn; đăng nhập lại tại Trang chủ.');return x.token;}
function same(a,b){return String(a||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase()===String(b||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase();}
function isApprovedCurrent(){return !!(chosen&&chosen.status==='APPROVED'&&same(chosen.team,team)&&same(chosen.grade,$('grade')?.value)&&same(chosen.subject,$('subject')?.value)&&same(chosen.exam,$('exam')?.value));}
function gate(){
 const okay=isApprovedCurrent();
 confirmed=okay?chosen:null;
 if($('assign'))$('assign').disabled=!okay;
 if($('uSave'))$('uSave').disabled=!okay;
 if($('uValidate'))$('uValidate').disabled=!okay;
 // "Read" and draft data can remain visible but no assignment input until approved.
 for(const el of locked){
  if(el.id==='previewPanel')continue;
  el.classList.toggle('kt02-phase-locked',!okay);
  el.inert=!okay;
 }
 $('ktsGate').textContent=okay?'Nội dung đã được BGH phê duyệt trên Backend. TTCM có thể chuyển sang phân công giáo viên.':
 'Chưa có hồ sơ được BGH phê duyệt đúng tổ, môn, khối và kỳ kiểm tra. Chưa được phân công hoặc chuyển phát hành.';
 $('ktsGate').style.background=okay?'#e8faef':'#fff4dc';
 if(okay){
  // Existing backend publication flow must also check the approved ID.
  window.HVA_KT02_APPROVED_SCOPE_ID=chosen.id;
 }else window.HVA_KT02_APPROVED_SCOPE_ID='';
}
async function verifyApprovalOnline(){
 if(!isApprovedCurrent())throw Error('Chưa có nội dung kiểm tra được BGH phê duyệt phù hợp tổ, môn, khối và kỳ.');
 const r=await jsonp('kt02ScopeGet',{id:chosen.id});
 const d=r.item;
 if(d.status!=='APPROVED'||!same(d.team,team)||!same(d.grade,$('grade')?.value)||!same(d.subject,$('subject')?.value)||!same(d.exam,$('exam')?.value))
  throw Error('Quyết định BGH chưa hợp lệ hoặc không khớp phân công hiện tại.');
 // Cập nhật mã hồ sơ đã được server xác nhận để chuyển hồ sơ trình phát hành.
 window.HVA_KT02_APPROVED_SCOPE_ID=d.id;
 return d;
}
window.HVA_KT02_VERIFY_SCOPE=verifyApprovalOnline;
function jsonp(action,params={}){
 const t=token();return new Promise((resolve,reject)=>{
  const cb='kt02ScopeCallback_'+Date.now()+'_'+Math.floor(Math.random()*999999);
  const u=new URL(backend);u.searchParams.set('action',action);
  u.searchParams.set('sessionToken',t);u.searchParams.set('callback',cb);
  for(const [k,v] of Object.entries(params))if(v!==undefined)u.searchParams.set(k,String(v));
  const node=document.createElement('script');let timer,done=false;
  function finish(){clearTimeout(timer);node.remove();try{delete window[cb]}catch(_){}}
  window[cb]=d=>{if(done)return;done=true;finish();if(!d||!d.ok||!d.success)return reject(Error(d?.message||'Backend không xử lý được '+action));resolve(d)};
  node.onerror=()=>{if(done)return;done=true;finish();reject(Error('Không kết nối được Backend '+action))};
  timer=setTimeout(()=>{if(done)return;done=true;finish();reject(Error('Backend KT02 không phản hồi. Kiểm tra Router và triển khai Apps Script.'))},16000);
  node.src=u.toString();document.head.appendChild(node);
 });
}
async function post(action,payload){
 const t=token();
 const res=await fetch(backend,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
  body:JSON.stringify({action,sessionToken:t,...payload})});
 if(!res.ok)throw Error('Backend HTTP '+res.status);
 const data=await res.json();
 if(!data||!data.ok||!data.success)throw Error(data?.message||'Backend không xác nhận '+action);
 return data;
}
function render(){
 const status=chosen?.status||'';
 $('ktsStatus').textContent=stateLabel[status]||'Chưa có hồ sơ được duyệt';
 if($('uScopeStatus'))$('uScopeStatus').value=status==='APPROVED'?'APPROVED':status==='PENDING'?'PENDING':'DRAFT';
 const bgh=!!actorIsBGH,ttcm=!!actorIsTTCM;
 const edit=ttcm&&(!chosen||['DRAFT','RETURNED'].includes(status));
 for(const id of Object.values(values))$(id).disabled=!edit;
 $('ktsSave').disabled=!edit;$('ktsSubmit').disabled=!edit;
 $('ktsTtcmActions').hidden=!ttcm;
 $('ktsBghActions').hidden=!bgh||status!=='PENDING';
 $('ktsNew').disabled=!ttcm;
 gate();
}
function populate(data){
 chosen=data||null;
 for(const [key,id] of Object.entries(values))$(id).value=String(data?.[key]||((key==='schoolYear')?'2026–2027':''));
 if(chosen&&chosen.status==='APPROVED'){
  if([...$('grade').options].some(o=>o.value===chosen.grade))$('grade').value=chosen.grade;
  if([...$('exam').options].some(o=>o.value===chosen.exam))$('exam').value=chosen.exam;
  if(typeof refreshSubjects==='function')refreshSubjects();
  if([...$('subject').options].some(o=>same(o.value,chosen.subject)))$('subject').value=[...$('subject').options].find(o=>same(o.value,chosen.subject)).value;
  if($('uPlan'))$('uPlan').value=chosen.planNumber||'';
  if($('uTeachingPlan'))$('uTeachingPlan').value=chosen.teachingPlan||'';
  if($('uScope'))$('uScope').value=chosen.scope||'';
  if(typeof render==='function'){} // gate controls downstream; no publication side-effect
 }
 render();
}
function draft(){
 const record={};
 for(const [key,id] of Object.entries(values))record[key]=$(id).value.trim();
 record.team=team;
 if(chosen?.id)record.id=chosen.id;
 return record;
}
async function refresh(preferId=''){
 try{
  notify('Đang đọc hồ sơ KT02 từ Backend V5...');
  const r=await jsonp('kt02ScopeList');
  items=r.items||[];
  const select=$('ktsChoose');select.replaceChildren(new Option('Tạo mới / chọn hồ sơ',''));
  items.forEach(x=>select.append(new Option([x.team,x.grade,x.subject,x.exam,stateLabel[x.status]||x.status].join(' · '),x.id)));
  const next=preferId||chosen?.id||'';
  if(next&&items.some(x=>x.id===next)){select.value=next;await open(next);}
  else{populate(null);notify('Đã đồng bộ '+items.length+' hồ sơ. TTCM lập đề xuất; BGH chọn hồ sơ chờ duyệt.');}
 }catch(e){populate(null);notify('Chưa kết nối được quy trình duyệt trên Backend: '+e.message,true);}
}
async function open(id){
 if(!id){populate(null);return;}
 try{
  const r=await jsonp('kt02ScopeGet',{id});
  populate(r.item);
  notify('Hồ sơ '+r.item.id+' · '+(stateLabel[r.item.status]||r.item.status)+
  (r.item.comment?' · Ý kiến BGH: '+r.item.comment:''));
 }catch(e){populate(null);notify(e.message,true);}
}
async function submit(action,decision=''){
 try{
  if(!me().valid)throw Error('Phiên đăng nhập EDOS không hợp lệ.');
  if(!team&&!actorIsBGH)throw Error('Chưa tải được tổ chuyên môn từ nhân sự Cuộc họp.');
  let response;
  if(action==='kt02ScopeSave'){
   const rec=draft();
   if(!rec.planNumber||!rec.scope||!rec.teachingPlan||!rec.requirements||!rec.format||!rec.subject||!rec.grade||!rec.exam)
    throw Error('Cần nhập đầy đủ kế hoạch, khối, môn, kỳ kiểm tra, phạm vi, yêu cầu cần đạt và hình thức.');
   response=await post(action,{record:rec});
  }else if(action==='kt02ScopeSubmit'){
   if(!chosen?.id)throw Error('Cần lưu dự thảo trên Backend trước khi gửi BGH.');
   response=await post(action,{id:chosen.id});
  }else{
   if(!chosen?.id||chosen.status!=='PENDING')throw Error('Chỉ quyết định hồ sơ đang chờ BGH.');
   const comment=$('ktsComment').value.trim();
   if(decision!=='APPROVED'&&!comment)throw Error('Khi trả lại hoặc không duyệt phải ghi rõ lý do.');
   response=await post('kt02ScopeDecide',{id:chosen.id,decision,comment});
  }
  populate(response.item);notify(response.message||('Đã xử lý: '+(stateLabel[response.item.status]||response.item.status)));
  await refresh(response.item.id);
 }catch(e){notify('Chưa ghi hồ sơ: '+String(e.message||e),true);}
}
$('ktsReload').addEventListener('click',()=>refresh());
$('ktsChoose').addEventListener('change',e=>open(e.target.value));
$('ktsNew').addEventListener('click',()=>{populate(null);$('ktsChoose').value='';notify('Đề xuất mới: TTCM nhập nội dung kiểm tra căn cứ kế hoạch đã ban hành.');});
$('ktsSave').addEventListener('click',()=>submit('kt02ScopeSave'));
$('ktsSubmit').addEventListener('click',()=>submit('kt02ScopeSubmit'));
$('ktsApprove').addEventListener('click',()=>submit('kt02ScopeDecide','APPROVED'));
$('ktsReturn').addEventListener('click',()=>submit('kt02ScopeDecide','RETURNED'));
$('ktsReject').addEventListener('click',()=>submit('kt02ScopeDecide','REJECTED'));
for(const id of ['grade','subject','exam'])$(id)?.addEventListener('change',gate);
// Capture click before existing publication button handler: fail closed if approval absent or out of scope.
document.addEventListener('click',e=>{
 if(e.target.closest('#assign')&&!isApprovedCurrent()){
  e.preventDefault();e.stopImmediatePropagation();
  notify('Chưa được chuyển phát hành: nội dung kiểm tra chưa được BGH phê duyệt đúng tổ, môn, khối và kỳ.',true);
 }
},true);
window.addEventListener('hva:kt02-personnel-ready',()=>{populate(null);refresh();});
render();
if(me().valid)refresh();
})();
