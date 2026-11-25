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
 const fields=['type','className','subject','originalDate','originalPeriod','reason','proposedDate','mode','proposedPeriod','room','content','relatedTeacher'];
 let actor=null,dirty=false;
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
  const related=['XINTIET','DOITIET','DAYTHAY'].includes($('type').value);
  $('relatedTeacherLabel').hidden=!related;
  $('relatedTeacher').required=related;
 }
 function snapshot(){
  const obj={};
  fields.forEach(id=>obj[id]=$(id).value.trim());
  return obj;
 }
 function validate(){
  const required=['className','subject','originalDate','originalPeriod','reason','proposedDate','proposedPeriod','room','content'];
  if($('relatedTeacher').required)required.push('relatedTeacher');
  if(!actor?.name){note('Chưa xác định người đăng ký. Vui lòng đăng nhập EDOS trước khi lập hồ sơ.','error');return false}
  for(const id of required){if(!$(id).value.trim()){$(id).focus();note('Cần nhập đủ thông tin bắt buộc trước khi xem hoặc lưu bản nháp.','error');return false}}
  if($('originalDate').value===$('proposedDate').value&&$('originalPeriod').value===$('proposedPeriod').value){
   note('Lịch đề xuất trùng hoàn toàn với tiết học gốc. Vui lòng kiểm tra lại.','error');return false;
  }
  // Các quy tắc ngày nghỉ, TKB, phòng, PCCM và quyền duyệt chỉ được xác minh ở Backend.
  return true;
 }
 function preview(){
  if(!validate())return;
  const labels={DAYBU:'Dạy bù',DAYTHAY:'Dạy thay',XINTIET:'Xin tiết',DOITIET:'Đổi tiết'};
  const a=snapshot(),pairs=[
   ['Người đăng ký',actor.name],['Tổ chuyên môn',actor.team||'—'],
   ['Nghiệp vụ',labels[a.type]],['Lớp / môn',a.className+' / '+a.subject],
   ['Tiết gốc',a.originalDate+' · Tiết '+a.originalPeriod],
   ['Lý do',a.reason],['Ngày đề xuất',a.proposedDate+' · Tiết '+a.proposedPeriod],
   ['Hình thức',a.mode==='TRUC_TIEP'?'Trực tiếp':'Trực tuyến (chưa kiểm duyệt)'],
   ['Địa điểm',a.room],['Nội dung',a.content]];
  if($('relatedTeacher').required)pairs.push(['Giáo viên liên quan',a.relatedTeacher]);
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
   updateType();note('Đã khôi phục bản nháp lưu trên thiết bị lúc '+new Date(data.savedAt).toLocaleString('vi-VN')+'. Chưa gửi EDOS.','success');
  }catch(e){note('Không khôi phục được bản nháp trên thiết bị.','error')}
 }
 function onChange(){dirty=true;$('draftPreview').hidden=true;note('Đã thay đổi nội dung. Hãy kiểm tra và lưu bản nháp; chưa gửi lên EDOS.')}
 fields.forEach(id=>{const el=$(id);el.addEventListener('input',onChange);el.addEventListener('change',()=>{if(id==='type')updateType();onChange()})});
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
  fields.forEach(id=>{$(id).value=id==='type'?'DAYBU':id==='mode'?'TRUC_TIEP':id==='proposedDate'?'2026-12-01':''});
  updateType();dirty=false;$('draftPreview').hidden=true;note('Đã xóa bản nháp trên thiết bị. Không có hồ sơ nào được gửi EDOS.');
 });
 updateType();refresh();restore();
 window.addEventListener('pageshow',refresh);window.addEventListener('focus',refresh);window.addEventListener('storage',()=>{if(!dirty)refresh()});
})();