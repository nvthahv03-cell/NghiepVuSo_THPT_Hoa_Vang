/**
 * HVA EDOS V5 — KT01 Lich kiem tra khong tap trung, KH 400/KH-THPTHV.
 * Additive module only. Router wiring described separately. NO doGet/doPost.
 * One shared EDOS_DH_DB spreadsheet; tabs DH_KT01_LICH_KTTT,
 * DH_KT01_LICH_DUYET_TO, DH_KT01_LICH_LOG.
 */
var HVA_KTL_HEADERS_=['ID','Username','Ho ten','To CM','Mon','Lop','Ngay','Buoi','Tiet dau','Tiet cuoi','Hinh thuc','Trang thai','Ma dot','Lan cap nhat','JSON'];
var HVA_KTL_BATCH_HEADERS_=['ID','To CM','Trang thai','TTCM','Ngay gui BGH','BGH','Ngay duyet','Ghi chu','Phien ban','JSON'];
function hvaKTLSh_(){return CommonDb.ensureSheet('DH_KT01_LICH_KTTT',HVA_KTL_HEADERS_);}
function hvaKTLBatchSh_(){return CommonDb.ensureSheet('DH_KT01_LICH_DUYET_TO',HVA_KTL_BATCH_HEADERS_);}
function hvaKTLLog_(action,actor,id,detail){
 CommonDb.ensureSheet('DH_KT01_LICH_LOG',['Ngay gio','Hanh dong','Nguoi thuc hien','ID','Chi tiet'])
 .appendRow([new Date().toISOString(),action,actor.username,id,String(detail||'').slice(0,1000)]);
}
function hvaKTLNorm_(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').trim().toLowerCase();}
function hvaKTLRoomKey_(v){
 var s=hvaKTLNorm_(v).replace(/\s+/g,' ').trim();
 // Tránh tách P. 01 / P01 / Phòng 01 thành nhiều phòng.
 var m=s.match(/^(?:p\.?|phong|room)\s*0*(\d{1,2})(?:\s*[-–].*)?$/);
 if(m&&Number(m[1])>=1&&Number(m[1])<=17)
  return 'P'+String(Number(m[1])).padStart(2,'0');
 return s.replace(/[.\s_-]/g,'');
}
function hvaKTLRoomDisplay_(v){
 var key=hvaKTLRoomKey_(v);
 return /^P(?:0[1-9]|1[0-7])$/.test(key)?'P. '+key.slice(1):String(v||'').trim();
}
function hvaKTLActor_(p){
 var a=nvsActor_(p||{});
 if(!a||!a.username)throw Error('Phiên EDOS hết hạn hoặc chưa hợp lệ.');
 // Canonical personnel lookup from the V5 backend supplied by the school.
 // Do not use the old PCDK personnel workbook or trust actor roles supplied by client.
 if(typeof hvaTraCuuNhanSuTheoUser_!=='function')throw Error('Backend chưa có tuyến nhân sự chuẩn V5.');
 var x=hvaTraCuuNhanSuTheoUser_(String(a.username||''));
 if(!x||hvaKTLNorm_(x.username||x.tenDangNhap)!==hvaKTLNorm_(a.username))
  throw Error('Không xác định được nhân sự của phiên trên nguồn chuẩn.');
 var role=hvaKTLNorm_([x.viTriViecLam,x.chucVu,x.vaiTro].join(' '));
 return {username:String(x.username),name:String(x.hoTen||''),team:String(x.toBoPhan||''),
  chief:/(^| )(to truong|to truong chuyen mon|ttcm)( |$)/.test(role),
  bgh:/(^| )(pho hieu truong|hieu truong|hieu pho|bgh|pht|ht)( |$)/.test(role)};
}
function hvaKTLRead_(sheet,n){var last=sheet.getLastRow();if(last<=1)return [];
 return sheet.getRange(2,1,last-1,n).getValues().map(function(v,i){try{return {row:i+2,data:JSON.parse(v[n-1])};}catch(_){return null;}}).filter(Boolean);}
function hvaKTLRow_(d){return [d.id,d.username,d.teacher,d.team,d.subject,d.className,d.date,d.session,
 d.start,d.end,d.assessment,d.status,d.batchId||'',d.updatedAt,JSON.stringify(d)];}
function hvaKTLBatchRow_(d){return [d.id,d.team,d.status,d.chief||'',d.submittedAt||'',
 d.approver||'',d.decidedAt||'',d.comment||'',d.version||1,JSON.stringify(d)];}
function hvaKTLFind_(items,id){return items.find(function(x){return x.data.id===id;})||null;}
function hvaKTLTime_(r){
 var d=String(r.date||''),className=String(r.className||'').trim(),
  sub=String(r.subject||'').trim(),ses=String(r.session||'').trim();
 var a=Number(r.start),b=Number(r.end);
 if(!/^20\d\d-\d\d-\d\d$/.test(d)||d<'2026-12-14'||d>'2027-01-05')throw Error('Ngày ngoài khoảng 14/12/2026–05/01/2027.');
 var dt=new Date(d+'T00:00:00Z');if(isNaN(dt.getTime())||dt.toISOString().slice(0,10)!==d)throw Error('Ngày kiểm tra không hợp lệ.');
 if(['2026-12-24','2026-12-25','2027-01-01'].indexOf(d)>=0||dt.getUTCDay()===0)throw Error('Không tổ chức kiểm tra vào ngày nghỉ hoặc ngày 24–25/12.');
 if(!/^(10|11|12)\/(?:[1-9]|[1-9][0-9])$/.test(className))throw Error('Lớp phải đúng dạng 10/3, 11/5 hoặc 12/9.');
 if(['Sáng','Chiều'].indexOf(ses)<0||!Number.isInteger(a)||!Number.isInteger(b)||a<1||b>5||a>b)throw Error('Buổi/tiết không hợp lệ.');
 if(!sub||sub.length>120||!r.assessment||String(r.assessment).length>120)throw Error('Thiếu môn hoặc hình thức kiểm tra.');
 var roomType=String(r.roomType||'CLASSROOM').trim();
 var room=hvaKTLRoomDisplay_(String(r.room||'').trim().replace(/\s+/g,' '));
 if(['CLASSROOM','COMPUTER','LAB','FUNCTION','OUTDOOR'].indexOf(roomType)<0)
  throw Error('Loại địa điểm kiểm tra không hợp lệ.');
 if(!room||room.length>90)throw Error('Bắt buộc nhập phòng/khu vực kiểm tra (tối đa 90 ký tự), kể cả kiểm tra tại lớp.');

 
 if(['ngu van','toan','tieng anh','lich su'].indexOf(hvaKTLNorm_(sub))>=0)
  throw Error('Kế hoạch 400: môn này kiểm tra tập trung cuối kỳ I; không đăng ký lịch không tập trung trong đợt này.');
 var fixed={'2026-12-21':{'Sáng':'12','Chiều':'11'},'2026-12-22':{'Sáng':'10','Chiều':'12'},'2026-12-23':{'Sáng':'11','Chiều':'10'}};
 if(fixed[d]&&fixed[d][ses]===className.split('/')[0])throw Error('Buổi này khối đã kiểm tra tập trung theo Phụ lục III Kế hoạch 400.');
 return {date:d,className:className,subject:sub,session:ses,start:a,end:b,assessment:String(r.assessment).slice(0,120),roomType:roomType,room:room};
}
function hvaKTLClash_(r,items,except){
 var peers=items.map(function(x){return x.data;}).filter(function(x){
 return x.id!==except&&x.status!=='CANCELLED'&&x.status!=='RETURNED'
 &&x.className===r.className&&x.date===r.date&&x.session===r.session;
 });
 if(peers.some(function(x){return hvaKTLNorm_(x.subject)===hvaKTLNorm_(r.subject);}))
  throw Error('Lớp đã có lịch cùng môn trong buổi này.');
 if((new Set(peers.map(function(x){return hvaKTLNorm_(x.subject);}))).size>=2)
  throw Error('Một lớp không được có quá 02 môn kiểm tra trong một buổi.');
 if(peers.some(function(x){return Number(r.start)<=Number(x.end)&&Number(x.start)<=Number(r.end);}))
  throw Error('Trùng tiết với một môn kiểm tra khác của lớp trong cùng buổi.');
 // Đối chiếu TOÀN TRƯỜNG: một phòng/khu vực không được cấp cho hai lớp trùng tiết.
 var roomKey=hvaKTLRoomKey_(r.room);
 var roomPeers=items.map(function(x){return x.data;}).filter(function(x){
  return x.id!==except&&x.status!=='CANCELLED'&&x.status!=='RETURNED'
    &&x.date===r.date&&x.session===r.session&&x.className!==r.className
    &&hvaKTLRoomKey_(x.room||'')===roomKey
    &&Number(r.start)<=Number(x.end)&&Number(x.start)<=Number(r.end);
 });
 if(roomPeers.length)
  throw Error('Phòng '+r.room+' đã được đăng ký cho lớp '+roomPeers[0].className+
    ' trong cùng buổi và trùng tiết. Hãy chọn phòng hoặc tiết khác.');

}
function hvaKTLList_(action,p){
 var actor=hvaKTLActor_(p),items=hvaKTLRead_(hvaKTLSh_(),15);
 var batches=hvaKTLRead_(hvaKTLBatchSh_(),10);
 if(action==='ktScheduleList'){
  var batchIndex={};batches.forEach(function(x){batchIndex[x.data.id]=x.data;});
  var mine=items.filter(function(x){
   return x.data.username===actor.username ||
    (x.data.status!=='DRAFT'&&(actor.bgh||actor.chief&&hvaKTLNorm_(x.data.team)===hvaKTLNorm_(actor.team)));
  });
  return {ok:true,success:true,items:mine.map(function(x){
   var d=Object.assign({},x.data),b=batchIndex[d.batchId];
   // Server-originated approver details, never trust client-submitted names.
   if(b){d.review={chief:b.chief||'',chiefName:b.chiefName||b.chief||'',
    confirmedAt:b.submittedAt||'',approver:b.approver||'',approverName:b.approverName||b.approver||'',
    approvedAt:b.decidedAt||'',comment:b.comment||'',batchStatus:b.status||''};}
   return d;
  }),actor:{username:actor.username,team:actor.team,name:actor.name,chief:actor.chief,bgh:actor.bgh}};
 }
 if(!actor.bgh&&!actor.chief)throw Error('Chỉ TTCM/BGH xem được hồ sơ trình duyệt.');
 var bs=batches.filter(function(x){return actor.bgh||hvaKTLNorm_(x.data.team)===hvaKTLNorm_(actor.team);}).map(function(x){return x.data;});
 return {ok:true,success:true,batches:bs,actor:{username:actor.username,team:actor.team,chief:actor.chief,bgh:actor.bgh}};
}
function hvaKTLPost_(action,p){
 var lock=LockService.getScriptLock();try{
 var actor=hvaKTLActor_(p),now=new Date().toISOString();
 lock.waitLock(20000);
 try{
  var sh=hvaKTLSh_(),items=hvaKTLRead_(sh,15);
  var bh=hvaKTLBatchSh_(),bs=hvaKTLRead_(bh,10);
  var teamKey=hvaKTLNorm_(actor.team);
  if(action==='ktScheduleSave'){
   if(!teamKey)throw Error('Tài khoản chưa có tổ chuyên môn chuẩn.');
   // Stay on the existing Router action; sendId is an explicit transition,
   // not a save that silently forwards a draft to TTCM.
   var sendId=String(p.sendId||'').trim();
   if(sendId){
    var draftHit=hvaKTLFind_(items,sendId);
    if(!draftHit||draftHit.data.username!==actor.username)throw Error('Không tìm thấy bản nháp thuộc tài khoản.');
    if(draftHit.data.status!=='DRAFT')throw Error('Chỉ gửi được lịch đang ở trạng thái bản nháp.');
    if(bs.some(function(x){return hvaKTLNorm_(x.data.team)===teamKey&&['WAIT_BGH','APPROVED'].indexOf(x.data.status)>=0;}))
     throw Error('Tổ đã có lịch trình BGH hoặc đã được duyệt. Cần quy trình điều chỉnh.');
    var checked=hvaKTLTime_(draftHit.data);hvaKTLClash_(checked,items,sendId);
    draftHit.data=Object.assign({},draftHit.data,checked,{status:'WAIT_TTCM',sentAt:now,updatedAt:now});
    sh.getRange(draftHit.row,1,1,15).setValues([hvaKTLRow_(draftHit.data)]);
    hvaKTLLog_('SEND_TTCM',actor,sendId,'Giáo viên gửi lịch cho TTCM tổ '+actor.team);
    return {ok:true,success:true,item:draftHit.data,message:'Đã gửi lịch cho TTCM '+actor.team+'; chờ TTCM xác nhận.'};
   }
   var raw=p.record||{},id=String(raw.id||'').trim();
   var hit=id?hvaKTLFind_(items,id):null;
   if(id&&!hit)throw Error('Không tìm thấy lịch cần sửa.');
   // Backward compatibility: old WAIT_TTCM rows were sent by the old "Save" button.
   // They remain submitted. Only permit correction if a legacy row has no room.
   var legacyCorrection=!!(hit&&hit.data.status==='WAIT_TTCM'&&!String(hit.data.room||'').trim());
   if(hit&&(hit.data.username!==actor.username||(!legacyCorrection&&hit.data.status!=='DRAFT')))
    throw Error('Lịch đã gửi TTCM hoặc đã duyệt; không được sửa trực tiếp.');
   var v=hvaKTLTime_(raw);hvaKTLClash_(v,items,id);
   var d=Object.assign({},v,{id:id||'KTL-'+Utilities.getUuid(),username:actor.username,
    teacher:actor.name,team:actor.team,status:legacyCorrection?'WAIT_TTCM':'DRAFT',
    batchId:'',sentAt:legacyCorrection?(hit.data.sentAt||hit.data.updatedAt||now):'',updatedAt:now});
   if(bs.some(function(x){return hvaKTLNorm_(x.data.team)===teamKey&&['WAIT_BGH','APPROVED'].indexOf(x.data.status)>=0;}))
    throw Error('Lịch của tổ đã trình BGH hoặc phê duyệt. Cần quy trình yêu cầu điều chỉnh.');
   if(hit)sh.getRange(hit.row,1,1,15).setValues([hvaKTLRow_(d)]);else sh.appendRow(hvaKTLRow_(d));
   hvaKTLLog_(legacyCorrection?'CORRECT_LEGACY':'SAVE_DRAFT',actor,d.id,'');
   return {ok:true,success:true,item:d,message:legacyCorrection?'Đã bổ sung phòng cho lịch cũ đang chờ TTCM.':'Đã lưu bản nháp trên EDOS. Chọn Gửi TTCM khi kiểm tra xong.'};
  }
  if(action==='ktScheduleTeamSubmit'){
   if(!actor.chief||!teamKey)throw Error('Chỉ TTCM được xác nhận lịch tổ.');
   var reason=String(p.completenessNote||'').trim();
   if(!p.confirmComplete||reason.length<10)throw Error('TTCM phải rà danh sách GV, lớp, môn và xác nhận đầy đủ; ghi căn cứ rà soát ít nhất 10 ký tự.');
   var teamRows=items.filter(function(x){return hvaKTLNorm_(x.data.team)===teamKey&&x.data.status==='WAIT_TTCM';});
   if(!teamRows.length)throw Error('Tổ chưa có lịch đăng ký chờ xác nhận.');
   var existing=bs.find(function(x){return hvaKTLNorm_(x.data.team)===teamKey&&['WAIT_BGH','APPROVED'].indexOf(x.data.status)>=0;});
   if(existing)throw Error('Tổ đã có gói lịch đang chờ BGH hoặc đã duyệt.');
   // Recheck all global records before team submission, including provisional registrations.
   teamRows.forEach(function(x){
    // Re-validate persisted data as well, including pre-room-catalog records.
    // A schedule created before mandatory-room rollout must be corrected first.
    try{hvaKTLTime_(x.data);hvaKTLClash_(x.data,items,x.data.id);}
    catch(err){throw Error('Lịch '+x.data.className+' – '+x.data.subject+': '+String(err.message||err));}
   });
   var batch={id:'KTLTO-'+Utilities.getUuid(),team:actor.team,status:'WAIT_BGH',
    chief:actor.username,chiefName:actor.name,submittedAt:now,approver:'',approverName:'',decidedAt:'',comment:'',
    completenessNote:reason,count:teamRows.length,version:1};
   teamRows.forEach(function(x){x.data.status='WAIT_BGH';x.data.batchId=batch.id;x.data.updatedAt=now;sh.getRange(x.row,1,1,15).setValues([hvaKTLRow_(x.data)]);});
   bh.appendRow(hvaKTLBatchRow_(batch));hvaKTLLog_('TEAM_SUBMIT',actor,batch.id,'TTCM: '+actor.name+' | '+reason);
   return {ok:true,success:true,batch:batch,message:'TTCM đã xác nhận và chuyển lịch tổ đến BGH.'};
  }
  if(action==='ktScheduleDecide'){
   if(!actor.bgh)throw Error('Chỉ BGH được quyết định lịch tổ.');
   var bid=String(p.batchId||''),hit=hvaKTLFind_(bs,bid);
   if(!hit||hit.data.status!=='WAIT_BGH')throw Error('Gói lịch không đang chờ BGH.');
   var decision=String(p.decision||''),comment=String(p.comment||'').trim();
   if(['APPROVED','RETURNED'].indexOf(decision)<0)throw Error('Quyết định không hợp lệ.');
   if(decision==='RETURNED'&&comment.length<5)throw Error('BGH cần ghi lý do trả lại.');
   var selected=items.filter(function(x){return x.data.batchId===bid;});
   if(!selected.length)throw Error('Gói lịch không có bản đăng ký.');
   if(decision==='APPROVED')selected.forEach(function(x){
    try{hvaKTLTime_(x.data);hvaKTLClash_(x.data,items,x.data.id);}
    catch(err){throw Error('Lịch '+x.data.className+' – '+x.data.subject+': '+String(err.message||err));}
   });
   hit.data.status=decision;hit.data.approver=actor.username;hit.data.approverName=actor.name;hit.data.decidedAt=now;hit.data.comment=comment;
   bh.getRange(hit.row,1,1,10).setValues([hvaKTLBatchRow_(hit.data)]);
   selected.forEach(function(x){x.data.status=decision==='APPROVED'?'APPROVED':'WAIT_TTCM';x.data.updatedAt=now;
     if(decision!=='APPROVED')x.data.batchId='';
     sh.getRange(x.row,1,1,15).setValues([hvaKTLRow_(x.data)]);
   });
   hvaKTLLog_('BGH_'+decision,actor,bid,'BGH: '+actor.name+' | '+comment);
   return {ok:true,success:true,batch:hit.data,message:decision==='APPROVED'?'BGH đã phê duyệt lịch tổ.':'BGH đã trả lại lịch cho TTCM điều chỉnh.'};
  }
  throw Error('Action KT01 không hợp lệ.');
 }finally{lock.releaseLock();}
 }catch(e){return {ok:false,success:false,message:String(e.message||e)};}
}
function hvaKTLGet_(action,p){
 var d;try{d=hvaKTLList_(action,p);}catch(e){d={ok:false,success:false,message:String(e.message||e)};}
 if(p&&p.callback){
  var cb=String(p.callback);if(!/^[A-Za-z_$][A-Za-z0-9_$]{0,100}$/.test(cb))return hvaJSON_({ok:false,success:false,message:'Callback không hợp lệ.'});
  return ContentService.createTextOutput(cb+'('+JSON.stringify(d).replace(/</g,'\\u003c')+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
 }
 return hvaJSON_(d);
}
function hvaKTLPostDispatch_(action,p){return hvaJSON_(hvaKTLPost_(action,p));}
