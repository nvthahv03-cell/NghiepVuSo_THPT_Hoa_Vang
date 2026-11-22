/**
 * EDOS V5 | Module 36 - Phát hành thông báo Lịch tuần.
 * Tích hợp riêng với Router V5; không khai báo doGet/doPost, không sửa 00_CORE hoặc 30_DH_HE_THONG.
 */
function hvaLtNotificationPost_(p) {
  p=p||{};
  const actor=nvsActor_(p);
  if(!actor||!actor.username)return nvsResp_({success:false,message:'Phiên EDOS V5 không hợp lệ hoặc đã hết hạn.'});
  if(!/hiệu trưởng|phó hiệu trưởng|hiệu phó/i.test(String(actor.chucVu||'')))
    return nvsResp_({success:false,message:'Chỉ Ban Giám hiệu được phát hành Lịch tuần.'});
  const doc=p.document||{},d=doc.data||{};
  if(String(p.moduleSource||doc.moduleSource||'')!=='LichTuanEDOS')
    return nvsResp_({success:false,message:'Sai module nguồn.'});
  const lichId=String(d.lichId||'').trim(),driveFileId=String(d.driveFileId||'').trim(),title=nvsSafe_(doc.title||'Lịch công tác tuần',250);
  if(!lichId||!driveFileId)return nvsResp_({success:false,message:'Thiếu mã Lịch tuần hoặc mã PDF.'});
  if(!(p.destinations||[]).some(x=>String(x&&x.id||x)==='ThongBao'))
    return nvsResp_({success:false,message:'Chưa chọn điểm đến Thông báo.'});
  if((p.recipients||[]).some(x=>x&&x.deliveryRole==='CC'))
    return nvsResp_({success:false,message:'Chưa hỗ trợ phát hành CC cho Lịch tuần.'});
  const unique=[...new Map(RecipientService.normalizeList(p.recipients||[]).filter(x=>x.username)
    .map(x=>[String(x.username).toLowerCase(),x])).values()];
  if(!unique.length||unique.length>300)return nvsResp_({success:false,message:'Số người nhận không hợp lệ.'});
  const roster=new Set(nvsGetPeople_().map(x=>String(x.username||'').toLowerCase()));
  if(unique.some(x=>!roster.has(String(x.username).toLowerCase())))
    return nvsResp_({success:false,message:'Người nhận không có trong CSDL nhân sự.'});
  let pdfUrl='';
  try {
    const file=DriveApp.getFileById(driveFileId);
    if(file.getMimeType()!=='application/pdf')throw new Error('Tệp không phải PDF.');
    const folderId=String(PropertiesService.getScriptProperties().getProperty('EDOS_LICH_TUAN_FOLDER_ID')||'').trim();
    if(folderId){
      let found=false;const parents=file.getParents();
      while(parents.hasNext())if(parents.next().getId()===folderId)found=true;
      if(!found)throw new Error('PDF không thuộc thư mục Lịch tuần.');
    }
    pdfUrl=file.getUrl();
  }catch(e){return nvsResp_({success:false,message:'Không xác thực được PDF trên Drive: '+String(e.message||e)});}
  // Kiểm tra trước không ghi dữ liệu: TTPH xác thực endpoint trước khi công bố lịch.
  if(p.dryRun===true)return nvsResp_({success:true,ready:true,message:'Backend V5 sẵn sàng phát hành thông báo Lịch tuần.'});
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(20000))return nvsResp_({success:false,message:'Đang có phiên phát hành khác.'});
  try{
    const ps=CommonDb.getPublishSheet();
    const logs=ps.getLastRow()>1?ps.getRange(2,1,ps.getLastRow()-1,15).getValues():[];
    let previous=null;
    for(const row of logs){
      if(String(row[2])!=='LichTuanEDOS'||String(row[4])!==lichId)continue;
      let oldData={};
      try{oldData=JSON.parse(String(row[14]||'{}')).document?.data||{};}catch(_){}
      if(String(oldData.driveFileId||'')===driveFileId){previous=row;break;}
    }
    let selected=unique;
    if(previous){
      try{selected=JSON.parse(String(previous[14]||'{}')).recipients||[];}catch(_){selected=[];}
      const oldUsers=new Set(selected.map(x=>String(x.username||'').toLowerCase()));
      if(oldUsers.size!==unique.length||unique.some(x=>!oldUsers.has(String(x.username).toLowerCase())))
        return nvsResp_({success:false,message:'Lịch này đã phát hành cho danh sách khác. Cần tạo phiên bản điều chỉnh.'});
    }
    const publishId=previous?String(previous[0]):'PH-LT-'+Utilities.getUuid();
    const content=nvsSafe_(d.noiDung||('Lịch tuần đã công bố. Xem PDF: '+pdfUrl),20000);
    const payload={publishId,moduleSource:'LichTuanEDOS',documentType:'LỊCH CÔNG TÁC TUẦN',
      document:{docId:lichId,title,type:'LỊCH CÔNG TÁC TUẦN',data:{...d,lichId,driveFileId,pdfUrl,noiDung:content}},
      sender:{username:actor.username,fullName:actor.hoTen,workPosition:actor.chucVu},
      destinations:[{id:'ThongBao'}],recipients:unique,workflow:Array.isArray(p.workflow)?p.workflow:[]};
    if(!previous)PublicationLogService.write(payload,unique.length);
    const ns=CommonDb.getNotificationSheet();
    const present=ns.getLastRow()>1?ns.getRange(2,2,ns.getLastRow()-1,4).getDisplayValues():[];
    const sent=new Set(present.filter(x=>String(x[0])===publishId).map(x=>String(x[2]).toLowerCase()));
    const missing=unique.filter(x=>!sent.has(String(x.username).toLowerCase()));
    if(missing.length){
      if(!sent.size)NotificationService.createForRecipients(payload,missing);
      else{
        const now=new Date();
        const rows=missing.map(x=>['TB-LT-'+Utilities.getUuid(),publishId,lichId,x.username,x.hoTen,title,
          content,'LỊCH CÔNG TÁC TUẦN',now,false,'','ThongBao',PUBLISH_CONFIG.STATUS.NEW,actor.username,actor.hoTen]);
        ns.getRange(ns.getLastRow()+1,1,rows.length,15).setValues(rows);
      }
    }
    SpreadsheetApp.flush();
    const verified=ns.getLastRow()>1?ns.getRange(2,2,ns.getLastRow()-1,4).getDisplayValues():[];
    const delivered=new Set(verified.filter(x=>String(x[0])===publishId).map(x=>String(x[2]).toLowerCase()));
    if(unique.some(x=>!delivered.has(String(x.username).toLowerCase())))
      return nvsResp_({success:false,partial:true,publishId,message:'Phát hành chưa đủ thông báo, cần đối soát.'});
    return nvsResp_({success:true,duplicated:!!previous&&!missing.length,publishId,
      recipientCount:unique.length,pdfUrl,message:'Đã phát hành và ghi nhận đủ thông báo.'});
  }catch(e){
    console.error('LT_NOTICE',String(e&&e.stack||e));
    return nvsResp_({success:false,message:'Lỗi Backend phát hành Lịch tuần: '+String(e.message||e)});
  }finally{lock.releaseLock();}
}