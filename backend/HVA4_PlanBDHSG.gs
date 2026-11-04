/** Kế hoạch BD HSG – module rời, router bắt buộc xác thực sessionToken trước khi gọi. */
const HVA4_PLAN_TABLE_='HVA4_KE_HOACH_BDHSG';
const HVA4_PLAN_HEADER_=['ID','Tạo lúc','Cập nhật','Tài khoản GV','Trạng thái','Nội dung JSON','Nhật ký JSON'];
function HVA4_planSheet_(){
  const ss=HVA4_book_();let sh=ss.getSheetByName(HVA4_PLAN_TABLE_);
  if(!sh)throw new Error('Chưa khởi tạo dữ liệu kế hoạch BD HSG. Quản trị viên cần chạy HVA4_planSetupByAdmin_.');
  return sh;
}
function HVA4_planSetupByAdmin_(){
  const ss=HVA4_book_();let sh=ss.getSheetByName(HVA4_PLAN_TABLE_);
  if(!sh){sh=ss.insertSheet(HVA4_PLAN_TABLE_);sh.appendRow(HVA4_PLAN_HEADER_);sh.setFrozenRows(1)}
}
function HVA4_planRows_(){
 const sh=HVA4_planSheet_();const raw=sh.getLastRow()<2?[]:sh.getRange(2,1,sh.getLastRow()-1,7).getValues();
 return raw.map((v,i)=>({row:i+2,id:String(v[0]),created:v[1],updated:v[2],owner:String(v[3]),status:String(v[4]),data:JSON.parse(String(v[5]||'{}')),history:JSON.parse(String(v[6]||'[]'))}));
}
function HVA4_planClean_(v){
 if(!v||typeof v!=='object'||Array.isArray(v))throw Error('Thông tin kế hoạch không hợp lệ.');
 const out={};['schoolYear','subject','team','sourceUrl','teacherSignedUrl','leaderSignedUrl','comment'].forEach(k=>out[k]=HVA4_str_(v[k],k.endsWith('Url')?1200:300));
 for(const k of ['sourceUrl','teacherSignedUrl','leaderSignedUrl']){
  if(out[k]&&!/^https:\/\/[^\s/?#]+(?:[^\s]*)?$/i.test(out[k]))throw Error('Liên kết '+k+' không hợp lệ.');
 }
 return out;
}
function HVA4_planGet_(u){
 if(!u.roles.length&&!HVA4_admin_(u))throw Error('Tài khoản chưa được xác nhận quyền.');
 const all=HVA4_planRows_(),admin=HVA4_admin_(u);
 return {success:true,schemaVersion:'HVA4-PLAN-1',records:all.filter(x=>admin||x.owner===u.username).map(x=>({id:x.id,owner:x.owner,status:x.status,updatedAt:x.updated,data:x.data,history:x.history})),meta:{canReview:admin}};
}
function HVA4_planSave_(req,u){
 const command=String(req.command||'');if(!['draft','submit','teacherSigned','approve','requestFix'].includes(command))throw Error('Thao tác không hợp lệ.');
 const lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const sh=HVA4_planSheet_(),item=HVA4_planRows_().find(x=>x.id===String(req.id||'')),admin=HVA4_admin_(u),now=new Date(),d=HVA4_planClean_(req.record);
  if(!item&&['teacherSigned','approve','requestFix'].includes(command))throw Error('Chưa có hồ sơ hợp lệ.');
  if(['approve','requestFix'].includes(command)){if(!admin)throw Error('Chỉ BGH mới được duyệt kế hoạch.');if(item.status!=='CHỜ BGH')throw Error('Hồ sơ chưa đến bước BGH xử lý.')}
  else if(item&&item.owner!==u.username)throw Error('Không được chỉnh sửa kế hoạch của giáo viên khác.');
  if(item&&item.status==='ĐÃ PHÊ DUYỆT')throw Error('Hồ sơ đã được phê duyệt, không được ghi đè.');
  const cur=item?item.data:{};
  let next={...cur},status=item?item.status:'NHÁP';
  if(command==='draft'||command==='submit'){
   if(item&&!['NHÁP','YÊU CẦU BỔ SUNG'].includes(item.status))throw Error('Hồ sơ đã nộp; không được sửa bản PDF cũ.');
   if(command==='submit'&&(!d.schoolYear||!d.subject||!d.team||!d.sourceUrl))throw Error('Thiếu năm học, môn, đội tuyển hoặc liên kết PDF.');
   next={schoolYear:d.schoolYear,subject:d.subject,team:d.team,sourceUrl:d.sourceUrl,teacherSignedUrl:'',leaderSignedUrl:'',comment:d.comment};
   status=command==='submit'?'CHỜ GV KÝ':'NHÁP';
  }else if(command==='teacherSigned'){
   if(item.status!=='CHỜ GV KÝ')throw Error('Không phải bước giáo viên ký số.');
   if(!d.teacherSignedUrl)throw Error('Chưa có liên kết bản PDF giáo viên đã ký.');
   next.teacherSignedUrl=d.teacherSignedUrl;status='CHỜ BGH';
  }else if(command==='approve'){
   if(!d.leaderSignedUrl)throw Error('Chưa có liên kết PDF đã được BGH ký số.');
   next.leaderSignedUrl=d.leaderSignedUrl;next.comment=d.comment;status='ĐÃ PHÊ DUYỆT';
  }else{
   if(!d.comment)throw Error('BGH cần nêu lý do yêu cầu bổ sung.');
   next.comment=d.comment;status='YÊU CẦU BỔ SUNG';
  }
  const id=item?item.id:Utilities.getUuid(),history=item?item.history.slice():[];
  history.push({at:now.toISOString(),by:u.username,action:command,status,comment:d.comment.slice(0,300)});
  HVA4_audit_(u.username,'BDHSG_'+command,id,status);
  const row=[id,item?item.created:now,now,item?item.owner:u.username,status,JSON.stringify(next),JSON.stringify(history)];
  if(item)sh.getRange(item.row,1,1,7).setValues([row]);else sh.appendRow(row);
  return {success:true,id,schemaVersion:'HVA4-PLAN-1',message:'Đã ghi nhận hồ sơ: '+status+'.'};
 }finally{lock.releaseLock()}
}
