/**
 * Điểm tích hợp vào Backend NVS hiện hành:
 * - Router doPost đã xác thực sessionToken -> nhận principal từ server.
 * - Gọi HVA4_dispatch_(payload, principal) cho action:
 *   hva4Get, hva4Save, hva4ImportRoster.
 * KHÔNG chuyển principal / role / username do phía client tự khai báo.
 */
function HVA4_dispatch_(req, principal){
 try{
  const u=HVA4_actor_(principal),a=String(req&&req.action||''),module=String(req&&req.module||'');
  if(a==='hva4Get')return HVA4_get_(module,u);
  if(a==='hva4Save')return HVA4_save_(module,req.record,!!req.draft,u);
  if(a==='hva4ImportRoster')return HVA4_importRoster_(req.students,u);
  return {success:false,message:'Hành động nghiệp vụ chưa được hỗ trợ.'};
 }catch(e){return {success:false,message:String(e&&e.message||'Lỗi nghiệp vụ.')}}
}
function HVA4_guard_(module,u){if(!['homeroom','nq52','device'].includes(module))throw new Error('Nghiệp vụ chưa được kích hoạt.');if(module==='homeroom'&&!u.className&&!HVA4_admin_(u))throw new Error('Chưa có phân công giáo viên chủ nhiệm hợp lệ.')}
function HVA4_meta_(module,u){const meta={schoolYear:u.schoolYear};if(module==='homeroom'){meta.className=u.className;if(u.className){const sh=HVA4_sheet_('roster'),list=sh.getLastRow()<2?[]:sh.getRange(2,1,sh.getLastRow()-1,5).getValues();meta.studentCount=list.filter(x=>String(x[0])===u.className&&String(x[1])===u.schoolYear).length}}if(module==='device'){meta.teachers=[];meta.reviews=[]}return meta}
function HVA4_get_(module,u){
 HVA4_guard_(module,u);const rows=HVA4_rows_(HVA4_sheet_(module));
 const records=rows.filter(r=>HVA4_admin_(u)||r.owner===u.username).map(r=>({id:r.id,owner:r.owner,status:r.status,updatedAt:r.updated,submittedAt:r.submitted,data:r.payload}));
 return {success:true,module,schemaVersion:'HVA4-1',records,meta:HVA4_meta_(module,u)}
}
function HVA4_validate_(module,x,draft){
 if(!x||typeof x!=='object'||Array.isArray(x))throw new Error('Nội dung gửi không hợp lệ.');
 const item={};Object.keys(x).forEach(k=>{if(!/^[a-zA-Z][a-zA-Z0-9]{0,36}$/.test(k))return;item[k]=HVA4_str_(x[k],3000)});
 if(!draft){
  const needed=module==='homeroom'?['schoolYear','section','content']:module==='nq52'?['month','duties','done','a1','a2','a3','quantity','quality','progress','strength','weakness','solution','selfClass']:['date','period','lesson','equipment','className','mode','it'];
  if(needed.some(k=>!item[k]))throw new Error('Chưa nhập đủ các trường bắt buộc.');
 }
 if(module==='nq52'){['a1','a2','a3','quantity','quality','progress'].forEach(k=>{if(item[k]==='')return;const n=Number(item[k]);const max=k[0]==='a'?10:100;if(!Number.isFinite(n)||n<0||n>max)throw new Error('Điểm / tỷ lệ không hợp lệ: '+k)});if(item.month&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(item.month))throw new Error('Tháng không hợp lệ.')}
 if(module==='device'&&item.date&&!/^\d{4}-\d{2}-\d{2}$/.test(item.date))throw new Error('Ngày sử dụng không hợp lệ.');
 return item
}
function HVA4_save_(module,raw,draft,u){
 HVA4_guard_(module,u);const x=HVA4_validate_(module,raw,draft),lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const sh=HVA4_sheet_(module),rows=HVA4_rows_(sh),period=module==='nq52'?x.month:module==='homeroom'?u.schoolYear:x.date;
  const found=module==='nq52'?rows.find(r=>r.owner===u.username&&r.period===period):null;
  if(found&&found.status==='ĐÃ GỬI')throw new Error('Hồ sơ đã gửi, không thể tự ghi đè. Hãy đề nghị người có thẩm quyền xử lý.');
  if(module==='homeroom'){x.schoolYear=u.schoolYear;x.className=u.className;}
  if(module==='device'){x.teacherUsername=u.username;}
  const id=found?found.id:Utilities.getUuid(),now=new Date(),status=draft?'NHÁP':'ĐÃ GỬI';
  HVA4_audit_(u.username,found?'CAP_NHAT':'TAO_MOI',id,module);
  const v=[id,found?found.created:now,now,u.username,module==='homeroom'?u.className:'',period,status,JSON.stringify(x),draft?'':now];
  if(found)sh.getRange(found.row,1,1,9).setValues([v]);else sh.appendRow(v);
  return {success:true,module,schemaVersion:'HVA4-1',id,status,message:draft?'Đã lưu bản nháp.':'Đã tiếp nhận hồ sơ để xử lý.'}
 }finally{lock.releaseLock()}
}
function HVA4_importRoster_(students,u){
 if(!u.className)throw new Error('Chưa được phân công chủ nhiệm lớp.');if(!Array.isArray(students)||!students.length||students.length>80)throw new Error('Danh sách học sinh không hợp lệ.');
 const seen=new Set(),rows=students.map(a=>{const id=HVA4_str_(a.studentId,70),name=HVA4_str_(a.name,160);if(!id||!name||seen.has(id))throw new Error('Mã học sinh trống hoặc trùng.');seen.add(id);return {studentId:id,name,dob:HVA4_str_(a.dob,30),gender:HVA4_str_(a.gender,15),parent:HVA4_str_(a.parent,160),phone:HVA4_str_(a.phone,30)}});
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const sh=HVA4_sheet_('roster'),current=sh.getLastRow()<2?[]:sh.getRange(2,1,sh.getLastRow()-1,5).getValues();
  const index=new Map(current.map((v,i)=>[String(v[0])+'|'+String(v[1])+'|'+String(v[2]),i+2]));const now=new Date();
  HVA4_audit_(u.username,'CAP_NHAT_DANH_SACH',u.className+'|'+u.schoolYear,String(rows.length));
  rows.forEach(x=>{const key=u.className+'|'+u.schoolYear+'|'+x.studentId,v=[u.className,u.schoolYear,x.studentId,JSON.stringify(x),now];const row=index.get(key);if(row)sh.getRange(row,1,1,5).setValues([v]);else sh.appendRow(v)});
  return {success:true,module:'homeroom',schemaVersion:'HVA4-1',message:'Đã nhập hoặc cập nhật '+rows.length+' học sinh; không xóa các hồ sơ khác.'}
 }finally{lock.releaseLock()}
}