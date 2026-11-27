/* HVA–EDOS V5 A.5.2 | Nhập và lưu bản nháp cục bộ.
 * Chưa có tuyến Backend duyệt: KHÔNG gửi, KHÔNG sinh mã hồ sơ, KHÔNG ghi Sheet.
 */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const validExpiry=raw=>{const n=Number(raw);if(Number.isFinite(n)&&n>0)return(n<1e12?n*1000:n)>Date.now();const d=Date.parse(String(raw||''));return Number.isFinite(d)&&d>Date.now()};
 function readIdentity(){
  const valid=['localStorage','sessionStorage'].some(type=>{
   try{const st=window[type];return Boolean(st.getItem('hvaSessionToken'))&&validExpiry(st.getItem('hvaSessionExpiresAt'))}catch(_){return false}
  });if(!valid)return null;
  for(const type of ['localStorage','sessionStorage']){
   try{const u=JSON.parse(window[type].getItem('user')||'null');if(!u||typeof u!=='object'||Array.isArray(u))continue;
    const name=String(u.hoTen||u.fullName||u.hoVaTen||u.name||u.tenHienThi||'').trim();
    if(name)return {name,team:String(u.toBoPhan||u.tenTo||u.toChuyenMon||u.to||'').trim(),role:String(u.viTriViecLam||u.chucVu||u.chucDanh||u.vaiTro||'').trim(),
     account:String(u.tenDangNhap||u.username||u.userName||'').trim()};
   }catch(_){}
  }return null;
 }
 const fields=['type','reasonCategory','dutyRef','sourceType','className','subject','originalDate','originalPeriod','reason','proposedDate','mode','proposedPeriod','room','content','relatedTeacher'];
 let actor=null,dirty=false,rows=[];
 const draftsKey=()=>actor?.account||actor?.name?'hva-edos-a52-draft-'+encodeURIComponent(actor.account||actor.name):'';
 function note(text,state=''){const el=$('note');el.dataset.state=state;el.textContent=text}
 function refresh(){
  const old=draftsKey(),next=readIdentity();actor=next;
  $('teacher').value=next?.name||'Chưa xác định phiên đăng nhập EDOS';
  $('team').value=next?.team||'';$('role').value=next?.role||'';
  if(old!==draftsKey()&&!dirty)restore();
 }
 function selectOptions(el,labels){
  for(const [value,label] of labels){const o=document.createElement('option');o.value=value;o.textContent=label;el.append(o)}
 }
 const classes=[];
 for(const [grade,total] of [[10,9],[11,9],[12,12]])for(let k=1;k<=total;k++)classes.push([grade+'/'+k,'Lớp '+grade+'/'+k]);
 selectOptions($('className'),classes);
 const periods=Array.from({length:10},(_,i)=>[String(i+1),'Tiết '+(i+1)+(i<5?' (sáng)':' (chiều)')]);
 selectOptions($('originalPeriod'),periods);selectOptions($('proposedPeriod'),periods);
 function updateType(){
  const missing=$('type').value==='DAYBU', substitute=$('type').value==='DAYTHAY';
  $('sourceLabel').hidden=!substitute;$('sourceType').disabled=!substitute;$('originalTitle').textContent=substitute?'Tiết cần dạy thay':'Thông tin tiết học gốc';$('originalDateLabel').textContent=missing?'Ngày chưa thực hiện *':'Ngày dạy *';$('relatedLabelText').textContent=substitute?'Giáo viên được đề nghị dạy thay *':'Giáo viên có tiết bị ảnh hưởng *';
  $('reportChoice').hidden=!missing; const entry=!missing||$('reportStatus').value==='MISSING'; $('originalCard').hidden=!entry; $('detailFields').hidden=!entry; $('addMissing').hidden=!missing||!entry;
  document.querySelectorAll('[data-schedule]').forEach(el=>{el.hidden=missing||substitute;el.querySelectorAll('input,select').forEach(x=>{x.disabled=missing||substitute})});
  $('a52DetailTitle').textContent=missing?'Nội dung tiết thiếu':substitute?'Thông tin dạy thay':'Lịch thực hiện đề xuất';
  $('a52DraftInfo').textContent=missing?'Giáo viên chỉ báo cáo tiết thiếu. TTCM tổng hợp, trình BGH lập lịch dạy bù. Hiện chỉ lưu bản nháp trên thiết bị.':'Lịch đề xuất chưa được xác minh với PCCM/TKB và chưa gửi EDOS.';
  const related=['XINTIET','DOITIET'].includes($('type').value);
  $('relatedTeacher').disabled=!related;
  $('reasonCategoryLabel').hidden=!substitute;$('reasonCategory').disabled=!substitute;
  const duty=substitute&&['CONGTAC','TAPHUAN','NHIEMVU'].includes($('reasonCategory').value);$('dutyRefLabel').hidden=!duty;$('dutyRef').disabled=!duty;
  $('generalFlow').hidden=substitute;$('generalPolicy').hidden=substitute;$('substituteFlow').hidden=!substitute;
  $('submitDraft').textContent=substitute?'Gửi TTCM (chưa mở)':'Gửi đề nghị (chưa mở)';
  if(substitute)$('a52DraftInfo').textContent='GV chỉ khai báo; TTCM duyệt và phân công người dạy thay, báo cáo BGH và đồng gửi hai GV. Hiện chỉ lưu bản nháp.';
  $('relatedTeacherLabel').hidden=!related;
  $('relatedTeacher').required=related;
 }
 function renderRows(){const box=$('missingList');box.replaceChildren();rows.forEach((r,i)=>{const el=document.createElement('div');el.className='missing-row';el.textContent=r.className+' · '+r.subject+' · '+r.originalDate+' · Tiết '+r.originalPeriod+' · '+r.content;const btn=document.createElement('button');btn.textContent='Xóa';btn.type='button';btn.onclick=()=>{rows.splice(i,1);renderRows();onChange()};el.append(btn);box.append(el)})}
 function snapshot(){
  const obj={};
  fields.forEach(id=>obj[id]=$(id).disabled?'':$(id).value.trim());
  if(obj.type==='DAYBU'){obj.reportStatus=$('reportStatus').value;obj.rows=rows.slice()}return obj;
 }
 function validate(entryOnly=false){
  const missing=$('type').value==='DAYBU';
  const required=['className','subject','originalDate','originalPeriod','reason','content'];
  if(!missing&&$('type').value!=='DAYTHAY')required.push('proposedDate','proposedPeriod','room');
  if($('type').value==='DAYTHAY')required.push('sourceType','reasonCategory');
  if($('relatedTeacher').required)required.push('relatedTeacher');
  if(!actor?.name){note('Chưa xác định người đăng ký. Vui lòng đăng nhập EDOS trước khi lập hồ sơ.','error');return false}
  if(missing&&!entryOnly){if(!$('reportStatus').value){note('Chọn kết quả rà soát.','error');return false}if($('reportStatus').value==='NONE')return true;if(rows.length&&!required.some(id=>$(id).value.trim()))return true;}
  for(const id of required){if(!$(id).value.trim()){$(id).focus();note('Cần nhập đủ thông tin bắt buộc trước khi xem hoặc lưu bản nháp.','error');return false}}
  if(!missing&&$('type').value!=='DAYTHAY'&&$('originalDate').value===$('proposedDate').value&&$('originalPeriod').value===$('proposedPeriod').value){
   note('Lịch đề xuất trùng hoàn toàn với tiết học gốc. Vui lòng kiểm tra lại.','error');return false;
  }
  // Các quy tắc ngày nghỉ, TKB, phòng, PCCM và quyền duyệt chỉ được xác minh ở Backend.
  return true;
 }
 function preview(){
  if(!validate())return;
  const labels={DAYBU:'Báo cáo tiết thiếu',DAYTHAY:'Dạy thay',XINTIET:'Mượn tiết',DOITIET:'Đổi tiết'};
  const a=snapshot(),pairs=[
   ['Người đăng ký',actor.name],['Tổ chuyên môn',actor.team||'—'],
   ['Nghiệp vụ',labels[a.type]],['Lớp / môn',a.className+' / '+a.subject],
   ['Tiết gốc',a.originalDate+' · Tiết '+a.originalPeriod],
   ['Lý do',a.reason],['Nội dung',a.content]];
  if(a.type==='DAYTHAY'){pairs.push(['Nguồn tiết',a.sourceType==='DAYBU'?'Lịch dạy bù đã phê duyệt':'TKB chính khóa'],['Nhóm lý do',$('reasonCategory').selectedOptions[0].textContent]);if(a.dutyRef)pairs.push(['Căn cứ phân công',a.dutyRef]);}
  if(a.type!=='DAYBU'&&a.type!=='DAYTHAY')pairs.push(['Ngày đề xuất',a.proposedDate+' · Tiết '+a.proposedPeriod],['Hình thức',a.mode==='TRUC_TIEP'?'Trực tiếp':'Trực tuyến (chưa kiểm duyệt)'],['Địa điểm',a.room]);
  if($('relatedTeacher').required)pairs.push(['Giáo viên liên quan',a.relatedTeacher]);
  if(a.type==='DAYBU'){pairs.splice(3);pairs.push(['Kết quả',a.reportStatus==='NONE'?'Không thiếu tiết':'Có tiết chưa thực hiện']);if(a.reportStatus==='MISSING'){const all=[...rows];if(a.className)all.push(a);all.forEach((r,i)=>pairs.push(['Tiết '+(i+1),r.className+' · '+r.subject+' · '+r.originalDate+' · Tiết '+r.originalPeriod+' · '+r.content+' · '+r.reason]))}}
  const box=$('draftPreview');box.replaceChildren();
  const title=document.createElement('strong');title.textContent='XEM TRƯỚC BẢN NHÁP A.5.2';
  const desc=document.createElement('p');desc.className='hint';desc.textContent='Chưa gửi tới TTCM/PHT. Lịch, PCCM và phòng chưa được hệ thống xác minh.';
  const dl=document.createElement('dl');
  for(const [k,v] of pairs){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;dl.append(dt,dd)}
  box.append(title,desc,dl);box.hidden=false;
  note('Đã kiểm tra các trường bắt buộc. Bản nháp chưa được nộp lên EDOS.','success');
  box.scrollIntoView({block:'nearest',behavior:'smooth'});
 }
 function restore(){
  const key=draftsKey();if(!key)return;
  try{
   const raw=localStorage.getItem(key);if(!raw)return;
   const data=JSON.parse(raw);if(!data||data.version!==1||!data.form)return;
   fields.forEach(id=>{if(Object.prototype.hasOwnProperty.call(data.form,id))$(id).value=String(data.form[id]||'')});
   rows=Array.isArray(data.form.rows)?data.form.rows:[];$('reportStatus').value=data.form.reportStatus||(data.form.className?'MISSING':'');renderRows();updateType();note('Đã khôi phục bản nháp lưu trên thiết bị lúc '+new Date(data.savedAt).toLocaleString('vi-VN')+'. Chưa gửi EDOS.','success');
  }catch(e){note('Không khôi phục được bản nháp trên thiết bị.','error')}
 }
 function onChange(){dirty=true;$('draftPreview').hidden=true;note('Đã thay đổi nội dung. Hãy kiểm tra và lưu bản nháp; chưa gửi lên EDOS.')}
 fields.forEach(id=>{const el=$(id);el.addEventListener('input',onChange);el.addEventListener('change',()=>{if(id==='type'||id==='reasonCategory')updateType();onChange()})});
 $('preview').addEventListener('click',preview);
 $('save').addEventListener('click',()=>{
  if(!validate())return;
  const key=draftsKey();if(!key){note('Không thể lưu nếu chưa có danh tính EDOS.','error');return}
  try{localStorage.setItem(key,JSON.stringify({version:1,form:snapshot(),savedAt:new Date().toISOString()}));
   dirty=false;note('Đã lưu bản nháp A.5.2 trên thiết bị này. Chưa gửi TTCM/PHT, chưa có mã tiếp nhận.','success');
  }catch(e){note('Thiết bị không cho lưu bản nháp. Vui lòng kiểm tra dung lượng hoặc cài đặt trình duyệt.','error')}
 });
 $('reset').addEventListener('click',()=>{
  if(!window.confirm('Xóa toàn bộ nội dung bản nháp A.5.2 trên thiết bị này?'))return;
  const key=draftsKey();if(key)try{localStorage.removeItem(key)}catch(_){}
  fields.forEach(id=>{$(id).value=id==='type'?'DAYBU':id==='mode'?'TRUC_TIEP':id==='sourceType'?'CHINHKHOA':''});
  rows=[];$('reportStatus').value='';renderRows();updateType();dirty=false;$('draftPreview').hidden=true;note('Đã xóa bản nháp trên thiết bị. Không có hồ sơ nào được gửi EDOS.');
 });
 document.querySelectorAll('[data-task]').forEach(btn=>btn.addEventListener('click',()=>{if(dirty&&$('type').value!==btn.dataset.task&&!confirm('Chuyển nghiệp vụ? Nội dung chưa lưu sẽ không được giữ.'))return;if($('type').value!==btn.dataset.task){fields.filter(id=>id!=='type').forEach(id=>$(id).value=id==='mode'?'TRUC_TIEP':'');rows=[];$('reportStatus').value='';renderRows();dirty=false}$('type').value=btn.dataset.task;$('workspace').hidden=false;document.querySelectorAll('[data-task]').forEach(x=>x.setAttribute('aria-pressed',String(x===btn)));updateType();$('draftPreview').hidden=true}));
 $('reportStatus').addEventListener('change',()=>{if($('reportStatus').value==='NONE'&&rows.length&&!confirm('Xóa danh sách tiết thiếu đã nhập?')){$('reportStatus').value='MISSING';return}if($('reportStatus').value==='NONE'){rows=[];['className','subject','originalDate','originalPeriod','reason','content'].forEach(id=>$(id).value='');renderRows()}updateType();onChange()});
 $('addMissing').onclick=()=>{if(!validate(true))return;const r=snapshot();delete r.rows;if(rows.some(x=>x.className===r.className&&x.originalDate===r.originalDate&&x.originalPeriod===r.originalPeriod)){note('Tiết này đã có trong danh sách.','error');return}rows.push(r);['className','subject','originalDate','originalPeriod','reason','content'].forEach(id=>$(id).value='');renderRows();onChange()};$('track').onclick=()=>{$('trackInfo').hidden=!$('trackInfo').hidden};
 updateType();refresh();restore();
 window.addEventListener('pageshow',refresh);window.addEventListener('focus',refresh);window.addEventListener('storage',()=>{if(!dirty)refresh()});
})();