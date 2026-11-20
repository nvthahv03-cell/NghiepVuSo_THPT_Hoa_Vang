/**
 * HVA–EDOS V5 | KT02 – DE XUAT NOI DUNG KIEM TRA / DUYET BGH.
 * Additive module. NO doGet/doPost redeclaration. Do not edit PASS modules.
 * Actions: kt02ScopeList, kt02ScopeGet (GET); kt02ScopeSave,
 * kt02ScopeSubmit, kt02ScopeDecide (POST).
 * Stored only administrative metadata; NEVER exam questions, answer keys or CCCD.
 * CommonDb.ensureSheet() must target the EDOS DH DB as in modules 31/32.
 */
var HVA_KT02_SCOPE_HEADERS_=[
 'ID','Ma dot KT01','To chuyen mon','Khoi','Mon','Ky kiem tra','Nam hoc',
 'So KH da ban hanh','Lien ket KH','KHGD mon hoc','Pham vi / noi dung',
 'Yeu cau can dat','Hinh thuc','Cau truc / yeu cau de','Luu y',
 'Trang thai','Nguoi tao','Thoi diem tao','Cap nhat','Nguoi duyet',
 'Thoi diem duyet','Y kien BGH','Phien ban','JSON'];
function hvaKT02ScopeSheet_(){
 return CommonDb.ensureSheet('DH_KT02_DE_XUAT_NOI_DUNG',HVA_KT02_SCOPE_HEADERS_);
}
function hvaKT02ScopeAuditSheet_(){
 return CommonDb.ensureSheet('DH_KT02_NHAT_KY_DUYET',
  ['Thoi diem','Ma ho so','Hanh dong','Tai khoan','Trang thai truoc','Trang thai sau','Ghi chu']);
}
function hvaKT02ScopeNorm_(s){
 return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().trim();
}
function hvaKT02ScopeText_(s,max){return String(s==null?'':s).trim().slice(0,max||2000);}
function hvaKT02ScopeActor_(p){
 var session=nvsActor_(p||{});
 if(!session||!session.username)throw new Error('AUTH_REQUIRED: Phiên EDOS hết hạn hoặc chưa hợp lệ.');
 var match=nvsPCDKReadPeople_().filter(function(x){
  return hvaKT02ScopeNorm_(x.username)===hvaKT02ScopeNorm_(session.username);
 });
 if(match.length!==1)throw new Error('Không xác định duy nhất nhân sự của phiên.');
 var who=match[0],role=hvaKT02ScopeNorm_([who.viTriViecLam,who.vaiTro,who.chucVu].join(' '));
 var bgh=/(^| )(pho hieu truong|hieu truong|hieu pho|ban giam hieu|bgh|pht|ht)( |$)/.test(role);
 var chief=/(^| )(to truong|to truong chuyen mon|ttcm)( |$)/.test(role);
 return {username:String(who.username),name:String(who.hoTen||''),
  team:String(who.toBoPhan||''),bgh:bgh,chief:chief};
}
function hvaKT02ScopeLookup_(sheet,id){
 var count=sheet.getLastRow()-1;
 if(count<=0)return null;
 var all=sheet.getRange(2,1,count,24).getValues();
 for(var i=0;i<all.length;i++){
  if(String(all[i][0])!==String(id))continue;
  try{return {row:i+2,data:JSON.parse(all[i][23])};}
  catch(e){throw new Error('Hồ sơ KT02 hỏng dữ liệu JSON.');}
 }
 return null;
}
function hvaKT02ScopeViewAllowed_(actor,d){
 if(actor.bgh)return true;
 return !!actor.chief&&hvaKT02ScopeNorm_(actor.team)===hvaKT02ScopeNorm_(d.team);
}
function hvaKT02ScopeRow_(d){
 return [d.id,d.kt01Id,d.team,d.grade,d.subject,d.exam,d.schoolYear,
 d.planNumber,d.planUrl,d.teachingPlan,d.scope,d.requirements,d.format,
 d.structure,d.notes,d.status,d.creator,d.createdAt,d.updatedAt,
 d.approver||'',d.approvedAt||'',d.comment||'',d.version,JSON.stringify(d)];
}
function hvaKT02ScopeAudit_(id,action,actor,before,after,reason){
 hvaKT02ScopeAuditSheet_().appendRow([new Date().toISOString(),id,action,
 actor.username,before,after,hvaKT02ScopeText_(reason,1200)]);
}
function hvaKT02ScopeValidate_(raw,actor,old){
 if(!actor.chief)throw new Error('Chỉ TTCM được lập và trình duyệt nội dung kiểm tra.');
 var team=String(actor.team||'').trim();
 if(!team)throw new Error('TTCM chưa có tổ chuyên môn chuẩn trên CSDL.');
 if(raw.team&&hvaKT02ScopeNorm_(raw.team)!==hvaKT02ScopeNorm_(team))
  throw new Error('TTCM không được khai báo tổ khác.');
 var now=new Date().toISOString();
 var d={
 id:old?old.id:'KT02ND-'+Utilities.getUuid(),
 kt01Id:hvaKT02ScopeText_(raw.kt01Id,100),
 team:team,grade:hvaKT02ScopeText_(raw.grade,2),subject:hvaKT02ScopeText_(raw.subject,120),
 exam:hvaKT02ScopeText_(raw.exam,100),schoolYear:hvaKT02ScopeText_(raw.schoolYear,30),
 planNumber:hvaKT02ScopeText_(raw.planNumber,200),planUrl:hvaKT02ScopeText_(raw.planUrl,1500),
 teachingPlan:hvaKT02ScopeText_(raw.teachingPlan,1500),
 scope:hvaKT02ScopeText_(raw.scope,5000),requirements:hvaKT02ScopeText_(raw.requirements,4000),
 format:hvaKT02ScopeText_(raw.format,1000),structure:hvaKT02ScopeText_(raw.structure,3000),
 notes:hvaKT02ScopeText_(raw.notes,2000),
 status:'DRAFT',creator:old?old.creator:actor.username,
 createdAt:old?old.createdAt:now,updatedAt:now,approver:'',approvedAt:'',comment:'',
 version:old?(Number(old.version||1)+1):1
 };
 if(!['10','11','12'].includes(d.grade)||!d.subject||!d.exam||!d.planNumber||
  !d.teachingPlan||!d.scope||!d.requirements||!d.format)
  throw new Error('Thiếu khối, môn, kỳ kiểm tra, KH đã ban hành, KHGD, phạm vi, yêu cầu cần đạt hoặc hình thức.');
 if(d.planUrl&&!/^https:\/\/[^\s]+$/i.test(d.planUrl))
  throw new Error('Liên kết kế hoạch phải là HTTPS.');
 if(/(đáp án mật|mật khẩu đề|đề thi bí mật)/i.test(d.notes+' '+d.scope+' '+d.structure))
  throw new Error('Không lưu đề mật hoặc đáp án mật ở KT02.');
 if(JSON.stringify(d).length>45000)throw new Error('Hồ sơ KT02 quá dài.');
 return d;
}
function hvaKT02ScopeRouteGet_(action,p){
 try{
  var actor=hvaKT02ScopeActor_(p);
  if(!actor.chief&&!actor.bgh)throw new Error('Chỉ TTCM và BGH được xem hồ sơ.');
  var sh=hvaKT02ScopeSheet_();
  if(action==='kt02ScopeGet'){
   var hit=hvaKT02ScopeLookup_(sh,hvaKT02ScopeText_(p.id,120));
   if(!hit)throw new Error('Không tìm thấy hồ sơ đề xuất.');
   if(!hvaKT02ScopeViewAllowed_(actor,hit.data))throw new Error('Không có quyền xem đề xuất của tổ khác.');
   return {ok:true,success:true,item:hit.data,role:actor.bgh?'BGH':'TTCM'};
  }
  var rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,24).getValues():[];
  var items=[];
  rows.forEach(function(r){
   try{var d=JSON.parse(r[23]);if(!hvaKT02ScopeViewAllowed_(actor,d))return;
    items.push({id:d.id,team:d.team,grade:d.grade,subject:d.subject,exam:d.exam,
     planNumber:d.planNumber,status:d.status,creator:d.creator,
     updatedAt:d.updatedAt,comment:d.comment||'',version:d.version});
   }catch(e){}
  });
  items.sort(function(a,b){return String(b.updatedAt).localeCompare(String(a.updatedAt));});
  return {ok:true,success:true,role:actor.bgh?'BGH':'TTCM',
   items:items,count:items.length};
 }catch(e){return {ok:false,success:false,message:String(e.message||e)};}
}
function hvaKT02ScopeRoutePost_(action,p){
 var lock=LockService.getScriptLock();
 try{
  var actor=hvaKT02ScopeActor_(p),sh=hvaKT02ScopeSheet_();
  lock.waitLock(20000);
  try{
   var raw=p.record&&typeof p.record==='object'?p.record:{};
   var id=hvaKT02ScopeText_(p.id||raw.id,120);
   var hit=id?hvaKT02ScopeLookup_(sh,id):null;
   if(id&&!hit)throw new Error('Không tìm thấy đề xuất cần xử lý.');
   var before=hit?hit.data.status:'';
   if(action==='kt02ScopeSave'){
    if(!actor.chief)throw new Error('Chỉ TTCM được lưu đề xuất.');
    if(hit&&(!hvaKT02ScopeViewAllowed_(actor,hit.data)||hit.data.creator!==actor.username))
     throw new Error('TTCM không được sửa đề xuất của người khác.');
    if(hit&&!['DRAFT','RETURNED'].includes(hit.data.status))
     throw new Error('Hồ sơ đang chờ duyệt hoặc đã được duyệt; không được sửa.');
    var d=hvaKT02ScopeValidate_(raw,actor,hit&&hit.data);
    if(hit)sh.getRange(hit.row,1,1,24).setValues([hvaKT02ScopeRow_(d)]);
    else sh.appendRow(hvaKT02ScopeRow_(d));
    hvaKT02ScopeAudit_(d.id,'SAVE',actor,before,d.status,'');
    return {ok:true,success:true,item:d,message:'Đã lưu dự thảo nội dung kiểm tra trên Backend.'};
   }
   if(!hit)throw new Error('Thiếu mã hồ sơ.');
   var d=hit.data;
   if(action==='kt02ScopeSubmit'){
    if(!actor.chief||!hvaKT02ScopeViewAllowed_(actor,d)||actor.username!==d.creator)
     throw new Error('Chỉ TTCM lập hồ sơ được trình BGH.');
    if(!['DRAFT','RETURNED'].includes(d.status))throw new Error('Hồ sơ không ở trạng thái có thể trình.');
    d.status='PENDING';d.comment='';d.approver='';d.approvedAt='';
   }else if(action==='kt02ScopeDecide'){
    if(!actor.bgh)throw new Error('Chỉ BGH được phê duyệt hoặc trả lại.');
    if(d.status!=='PENDING')throw new Error('Hồ sơ không đang chờ BGH.');
    var decision=hvaKT02ScopeText_(p.decision,20).toUpperCase();
    if(!['APPROVED','RETURNED','REJECTED'].includes(decision))
     throw new Error('Quyết định BGH không hợp lệ.');
    var comment=hvaKT02ScopeText_(p.comment,2000);
    if(decision!=='APPROVED'&&!comment)throw new Error('Khi trả lại hoặc không duyệt phải ghi rõ lý do.');
    d.status=decision;d.comment=comment;d.approver=actor.username;
    d.approvedAt=new Date().toISOString();
   }else throw new Error('Action KT02 không hợp lệ.');
   d.updatedAt=new Date().toISOString();
   sh.getRange(hit.row,1,1,24).setValues([hvaKT02ScopeRow_(d)]);
   hvaKT02ScopeAudit_(d.id,action,actor,before,d.status,d.comment||'');
   return {ok:true,success:true,item:d};
  }finally{lock.releaseLock();}
 }catch(e){return {ok:false,success:false,message:String(e.message||e)};}
}
function hvaKT02ScopeJsonp_(action,p){
 var cb=String((p||{}).callback||'');
 if(!/^[A-Za-z_$][A-Za-z0-9_$]{0,100}$/.test(cb))
  return hvaJSON_({ok:false,success:false,message:'Callback không hợp lệ.'});
 var d=hvaKT02ScopeRouteGet_(action,p);
 var json=JSON.stringify(d).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 return ContentService.createTextOutput(cb+'('+json+');')
  .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
function hvaKT02ScopeDispatchGet_(action,p){
 return p&&p.callback?hvaKT02ScopeJsonp_(action,p):
  hvaJSON_(hvaKT02ScopeRouteGet_(action,p));
}
function hvaKT02ScopeDispatchPost_(action,p){
 return hvaJSON_(hvaKT02ScopeRoutePost_(action,p));
}
/* Use as a SERVER-side guard in 32_DH_KT02 before saving any assignment:
   if (!hvaKT02ScopeApprovedFor_(p.record||p, actor)) throw Error(...);
   This guard must be installed in 32 module to enforce approval;
   UI-only disabling is NOT a security boundary. */
function hvaKT02ScopeApprovedFor_(record,actor){
 if(!record||!record.scopeApprovalId)return false;
 var hit=hvaKT02ScopeLookup_(hvaKT02ScopeSheet_(),record.scopeApprovalId);
 if(!hit||hit.data.status!=='APPROVED')return false;
 var d=hit.data;
 return hvaKT02ScopeNorm_(d.team)===hvaKT02ScopeNorm_(record.team)&&
  hvaKT02ScopeNorm_(d.grade)===hvaKT02ScopeNorm_(record.grade)&&
  hvaKT02ScopeNorm_(d.subject)===hvaKT02ScopeNorm_(record.subject)&&
  hvaKT02ScopeNorm_(d.exam)===hvaKT02ScopeNorm_(record.exam);
}
