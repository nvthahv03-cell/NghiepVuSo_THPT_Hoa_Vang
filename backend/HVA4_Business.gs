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
  if(a==='hva4PlanGet')return HVA4_planGet_(u);
  if(a==='hva4PlanSave')return HVA4_planSave_(req,u);
  if(a==='hva4Get')return HVA4_get_(module,u);
  if(a==='hva4Save')return HVA4_save_(module,req.record,!!req.draft,u);
  if(a==='hva4ImportRoster')return HVA4_importRoster_(req.students,u);
  if(a==='hva4Review')return HVA4_review_(module,req.id,req.decision,req.comment,u);
  return {success:false,message:'Hành động nghiệp vụ chưa được hỗ trợ.'};
 }catch(e){return {success:false,message:String(e&&e.message||'Lỗi nghiệp vụ.')}}
}
function HVA4_guard_(module,u){if(!['homeroom','nq52','device'].includes(module))throw new Error('Nghiệp vụ chưa được kích hoạt.');if(!HVA4_admin_(u)&&!u.roles.length)throw new Error('Tài khoản chưa được gán nhóm nghiệp vụ.');if(module==='homeroom'&&!u.className&&!HVA4_admin_(u))throw new Error('Chưa có phân công giáo viên chủ nhiệm hợp lệ.')}
function HVA4_meta_(module,u){const meta={schoolYear:u.schoolYear};if(module==='homeroom'){meta.className=u.className;meta.canReview=HVA4_admin_(u);if(meta.canReview){const shx=HVA4_sheet_('roster'),allx=shx.getLastRow()<2?[]:shx.getRange(2,1,shx.getLastRow()-1,2).getValues();meta.classes=[...new Set(allx.filter(a=>String(a[1])===u.schoolYear).map(a=>String(a[0])))].sort();}if(u.className){const sh=HVA4_sheet_('roster'),list=sh.getLastRow()<2?[]:sh.getRange(2,1,sh.getLastRow()-1,5).getValues();meta.students=list.filter(x=>String(x[0])===u.className&&String(x[1])===u.schoolYear).map(x=>{try{return JSON.parse(String(x[3]||'{}'))}catch(e){return {studentId:String(x[2]),name:'(Bản ghi cần kiểm tra)'}}});meta.studentCount=meta.students.length}}if(module==='device'){meta.teachers=[];meta.reviews=[]}meta.canReview=HVA4_admin_(u);return meta}
function HVA4_get_(module,u){
 HVA4_guard_(module,u);const rows=HVA4_rows_(HVA4_sheet_(module));
 const records=rows.filter(r=>HVA4_admin_(u)||r.owner===u.username).map(r=>({id:r.id,owner:r.owner,status:r.status,updatedAt:r.updated,submittedAt:r.submitted,reviewer:r.payload.__reviewer||'',reviewComment:r.payload.__reviewComment||'',reviewedAt:r.payload.__reviewedAt||'',data:r.payload}));
 return {success:true,module,schemaVersion:'HVA4-1',records,meta:HVA4_meta_(module,u)}
}
function HVA4_validate_(module,x,draft){
 if(!x||typeof x!=='object'||Array.isArray(x))throw new Error('Nội dung gửi không hợp lệ.');
 const item={};Object.keys(x).forEach(k=>{if(!/^[a-zA-Z][a-zA-Z0-9]{0,36}$/.test(k)||k==='rows')return;item[k]=HVA4_str_(x[k],3000)});
 if(module==='homeroom'&&x.rows!==undefined){
   if(!Array.isArray(x.rows)||x.rows.length>180)throw Error('Số dòng ghi trong mục sổ không hợp lệ.');
   item.rows=x.rows.map(row=>{
    if(!row||typeof row!=='object'||Array.isArray(row))throw Error('Một dòng nội dung không hợp lệ.');
    const safe={};Object.keys(row).forEach(key=>{
      if(!/^c(?:[0-9]|1[0-9])$/.test(key))throw Error('Tên trường ghi sổ không hợp lệ.');
      if(typeof row[key]!=='string'&&typeof row[key]!=='number')throw Error('Nội dung ô không hợp lệ.');
      const value=String(row[key]).trim();if(value.length>1200)throw Error('Nội dung một ô vượt giới hạn.');
      safe[key]=value;
    });return safe;
   });
   if(JSON.stringify(item.rows).length>65000)throw Error('Nội dung mục sổ quá dài.');
 }
 if(!draft){
  const needed=module==='homeroom'?['schoolYear','section','content']:module==='nq52'?['month','duties','done','a1','a2','a3','quantity','quality','progress','strength','weakness','solution','selfClass']:['date','period','lesson','equipment','className','phbmTH','phbmLT','onClass','it'];
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
  const targetClass=module==='homeroom'&&HVA4_admin_(u)&&x.sectionKey==='21'&&x.targetClass?x.targetClass:u.className;
  if(module==='homeroom'&&x.sectionKey==='21'&&!/^\d{1,2}\/\d{1,2}$/.test(targetClass||''))throw new Error('BGH chưa chọn đúng lớp cần nhận xét.');
  const found=module==='nq52'?rows.find(r=>r.owner===u.username&&r.period===period):module==='homeroom'&&x.sectionKey?rows.find(r=>r.className===targetClass&&r.period===u.schoolYear&&r.payload.sectionKey===x.sectionKey):null;
  if(module==='device'&&!/^\d{1,2}\/\d{1,2}$/.test(x.className||''))throw new Error('Lớp học không hợp lệ.');
  if(found&&!['NHÁP','YÊU CẦU BỔ SUNG'].includes(found.status))throw new Error('Hồ sơ đã gửi hoặc đã được xác nhận; không được tự ghi đè. Liên hệ người có thẩm quyền khi cần điều chỉnh.');
  if(module==='homeroom'){
    if(!u.className&&!HVA4_admin_(u))throw new Error('Chưa có lớp chủ nhiệm được xác minh.');
    if(x.schoolYear&&x.schoolYear!==u.schoolYear)throw new Error('Năm học không khớp phân công.');
    if(x.sectionKey){
      const num=Number(x.sectionKey);
      if(!Number.isInteger(num)||num<1||num>21)throw new Error('Mục sổ chủ nhiệm không hợp lệ.');
      if(num===21&&!HVA4_admin_(u))throw new Error('Chỉ Ban Giám hiệu được ghi nhận xét kiểm tra.');
      if(num!==21&&!u.className)throw new Error('Chưa có lớp chủ nhiệm được xác minh.');
      if(!Array.isArray(x.rows)||!x.rows.length||!x.rows.some(row=>Object.values(row).some(v=>!!v)))throw new Error('Chưa nhập dữ liệu của mục sổ.');
      x.content=JSON.stringify(x.rows);
      if(num===21){const roster=HVA4_sheet_('roster'),valid=roster.getLastRow()<2?[]:roster.getRange(2,1,roster.getLastRow()-1,2).getValues();if(!valid.some(z=>String(z[0])===targetClass&&String(z[1])===u.schoolYear))throw new Error('Lớp chưa có danh sách học sinh được xác thực.');}
    }else if(x.section==='Kiểm tra, nhận xét của Hiệu trưởng')throw new Error('Giáo viên không được tự ghi nhận xét của Hiệu trưởng.');
    x.schoolYear=u.schoolYear;x.className=targetClass;
  }
  if(module==='device'){x.teacherUsername=u.username;}
  const id=found?found.id:Utilities.getUuid(),now=new Date(),status=draft?'NHÁP':'ĐÃ GỬI';
  HVA4_audit_(u.username,found?'CAP_NHAT':'TAO_MOI',id,module);
  const v=[id,found?found.created:now,now,u.username,module==='homeroom'?targetClass:'',period,status,JSON.stringify(x),draft?'':now];
  if(found)sh.getRange(found.row,1,1,9).setValues([v]);else sh.appendRow(v);
  return {success:true,module,schemaVersion:'HVA4-1',id,status,message:draft?'Đã lưu bản nháp.':'Đã tiếp nhận hồ sơ để xử lý.'}
 }finally{lock.releaseLock()}
}
function HVA4_review_(module,id,decision,comment,u){
 if(!HVA4_admin_(u))throw new Error('Tài khoản không có thẩm quyền kiểm tra, xác nhận.');
 HVA4_guard_(module,u);if(!['ĐỒNG Ý','YÊU CẦU BỔ SUNG'].includes(String(decision||'')))throw new Error('Trạng thái xử lý không hợp lệ.');
 const note=HVA4_str_(comment,1500);if(decision==='YÊU CẦU BỔ SUNG'&&!note)throw new Error('Cần ghi lý do yêu cầu bổ sung.');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{const sh=HVA4_sheet_(module),item=HVA4_rows_(sh).find(r=>r.id===String(id||''));if(!item)throw new Error('Không tìm thấy hồ sơ.');if(item.status!=='ĐÃ GỬI')throw new Error('Chỉ xử lý hồ sơ đã gửi.');const now=new Date();
 const payload=Object.assign({},item.payload,{__reviewer:u.username,__reviewComment:note,__reviewedAt:now.toISOString()});
 HVA4_audit_(u.username,decision,item.id,module);
 const values=[item.id,item.created,now,item.owner,item.className,item.period,decision,JSON.stringify(payload),item.submitted];
 sh.getRange(item.row,1,1,HVA4_HEADER_.length).setValues([values]);
 return {success:true,module,schemaVersion:'HVA4-1',id:item.id,message:'Đã ghi nhận kết quả xử lý và lưu nhật ký.'};
 }finally{lock.releaseLock()}
}
function HVA4_importRoster_(students,u){
 if(!u.className)throw new Error('Chưa được phân công chủ nhiệm lớp.');if(!/^\d{1,2}\/\d{1,2}$/.test(u.className))throw new Error('Mã lớp chủ nhiệm không hợp lệ.');if(!Array.isArray(students)||!students.length||students.length>80)throw new Error('Danh sách học sinh không hợp lệ.');
 const seen=new Set(),rows=students.map(a=>{const id=HVA4_str_(a.studentId,70),name=HVA4_str_(a.name,160);if(!id||!name||seen.has(id))throw new Error('Mã học sinh trống hoặc trùng.');if(!/^[A-Za-z0-9][A-Za-z0-9_.\/-]{0,69}$/.test(id))throw new Error('Mã học sinh không hợp lệ.');seen.add(id);return {studentId:id,name,dob:HVA4_str_(a.dob,30),gender:HVA4_str_(a.gender,15),parent:HVA4_str_(a.parent,160),phone:HVA4_str_(a.phone,30)}});
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const sh=HVA4_sheet_('roster'),current=sh.getLastRow()<2?[]:sh.getRange(2,1,sh.getLastRow()-1,5).getValues();
  const index=new Map(current.map((v,i)=>[String(v[0])+'|'+String(v[1])+'|'+String(v[2]),i+2]));const now=new Date();
  HVA4_audit_(u.username,'CAP_NHAT_DANH_SACH',u.className+'|'+u.schoolYear,String(rows.length));
  rows.forEach(x=>{const key=u.className+'|'+u.schoolYear+'|'+x.studentId,v=[u.className,u.schoolYear,x.studentId,JSON.stringify(x),now];const row=index.get(key);if(row)sh.getRange(row,1,1,5).setValues([v]);else sh.appendRow(v)});
  return {success:true,module:'homeroom',schemaVersion:'HVA4-1',message:'Đã nhập hoặc cập nhật '+rows.length+' học sinh; không xóa các hồ sơ khác.'}
 }finally{lock.releaseLock()}
}