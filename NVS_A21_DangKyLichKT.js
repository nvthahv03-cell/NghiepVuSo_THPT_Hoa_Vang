/* NVS A.2.1 – Đăng ký lịch kiểm tra không tập trung.
   Safe phase 1: interactive form, local draft + deterministic constraints.
   NO misleading server success, NO duplicate A2.5 menu. */
(function(){
'use strict';
const by=id=>document.getElementById(id);
const btn=by('a21ScheduleOpen'),panel=by('a21SchedulePanel'),form=by('a21ScheduleForm');
if(!btn||!panel||!form)return;
const messages=by('a21ScheduleMessage'),review=by('a21ScheduleDrafts');
const key='HVA_NVS_A21_SCHEDULE_DRAFT_2026_2027';
const normal=s=>String(s||'').trim().toLocaleLowerCase('vi');
function selected(){return by('code')?.value==='A.2.1';}
function sync(){const show=selected();btn.hidden=!show;if(!show)panel.hidden=true;}
function draftRows(){
 try{const items=JSON.parse(sessionStorage.getItem(key)||'[]');return Array.isArray(items)?items:[];}
 catch(_){return [];}
}
function text(s){return String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
function isOverlap(a,b){return a.start<=b.end&&b.start<=a.end;}
function report(message,error=false){
 messages.textContent=message;messages.style.color=error?'#a92c31':'#155b86';
}
function render(){
 const rows=draftRows();
 if(!rows.length){review.textContent='Chưa có lịch nháp trong phiên trình duyệt.';return;}
 review.innerHTML='<div style="font-weight:800;margin-bottom:8px">Lịch đã lưu nháp (chưa gửi TTCM)</div>'+rows.map((r,i)=>
 '<div class="a21-schedule-entry"><span>'+text(r.className)+' · '+text(r.subject)+' · '+text(r.date)+' · '+text(r.session)+' · tiết '+text(r.start)+(r.end!==r.start?'–'+text(r.end):'')+'</span><button type="button" class="secondary" data-delete="'+i+'">Xóa</button></div>').join('');
}
function validate(r,rows){
 const errors=[];
 if(!r.className||!r.subject||!r.date||!r.session||!r.start||!r.end||!r.assessment)errors.push('Nhập đủ lớp, môn, ngày, buổi, tiết và hình thức đánh giá.');
 if(r.date<'2026-12-14'||r.date>'2027-01-05')errors.push('Ngày kiểm tra phải thuộc khoảng 14/12/2026–05/01/2027.');
 if(['2026-12-24','2026-12-25','2027-01-01'].includes(r.date))errors.push('Ngày đã chọn thuộc ngày không bố trí kiểm tra theo kế hoạch hoặc ngày nghỉ lễ.');
 if(Number(r.start)>Number(r.end))errors.push('Tiết bắt đầu không được sau tiết kết thúc.');
 if(/^(10|11|12)\//.test(r.className)){
  const grade=r.className.split('/')[0];
  if((grade==='12'&&r.date==='2026-12-21'&&r.session==='Sáng')||
     (grade==='11'&&r.date==='2026-12-21'&&r.session==='Chiều')||
     (grade==='10'&&r.date==='2026-12-22'&&r.session==='Sáng')||
     (grade==='12'&&r.date==='2026-12-22'&&r.session==='Chiều')||
     (grade==='11'&&r.date==='2026-12-23'&&r.session==='Sáng')||
     (grade==='10'&&r.date==='2026-12-23'&&r.session==='Chiều'))
     errors.push('Khối này đã có lịch kiểm tra tập trung trong buổi đăng ký.');
 }
 const same=rows.filter(x=>x.className===r.className&&x.date===r.date&&x.session===r.session);
 if(same.some(x=>normal(x.subject)===normal(r.subject)))errors.push('Môn này đã có lịch nháp cho lớp trong cùng buổi.');
 if(new Set([...same.map(x=>normal(x.subject)),normal(r.subject)]).size>2)
  errors.push('Một lớp không được kiểm tra quá 02 môn trong cùng buổi.');
 if(same.some(x=>isOverlap({start:+x.start,end:+x.end},{start:+r.start,end:+r.end})))
  errors.push('Đã có một môn kiểm tra trùng tiết của lớp trong cùng buổi.');
 return errors;
}
btn.addEventListener('click',()=>{
 if(!selected())return;
 panel.hidden=!panel.hidden;
 if(!panel.hidden){render();panel.scrollIntoView({behavior:'smooth',block:'start'});}
});
by('a21ScheduleClose')?.addEventListener('click',()=>{panel.hidden=true;});
form.addEventListener('submit',e=>{
 e.preventDefault();
 const r={
  className:by('a21Class').value.trim(),subject:by('a21Subject').value.trim(),
  date:by('a21Date').value,session:by('a21Session').value,
  start:by('a21Start').value,end:by('a21End').value,
  assessment:by('a21Assessment').value,teacher:by('owner')?.value||'',
  team:by('team')?.value||''
 };
 const rows=draftRows(),errors=validate(r,rows);
 if(errors.length){report(errors.join(' • '),true);return;}
 try{
  rows.push(r);sessionStorage.setItem(key,JSON.stringify(rows));
  report('Đã lưu lịch nháp và kiểm tra xung đột trong các lịch nháp của phiên này. CHƯA gửi TTCM hoặc EDOS–KT01.');
  render();form.reset();
 }catch(err){report('Không lưu được bản nháp: '+err.message,true);}
});
review.addEventListener('click',e=>{
 const index=e.target.closest('[data-delete]')?.dataset.delete;
 if(index===undefined)return;
 const rows=draftRows();rows.splice(Number(index),1);
 sessionStorage.setItem(key,JSON.stringify(rows));render();
 report('Đã xóa lịch nháp khỏi phiên này.');
});
by('code')?.addEventListener('change',sync);
sync();render();
})();
