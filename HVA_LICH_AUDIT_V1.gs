/**
 * HVA EDOS - Lich cong tac: luu phien ban, luu vet, dong bang cuoi ky.
 * Module doc lap; CHUA tu dong gui thong bao/tao trigger khi chua trien khai.
 * Can duoc gan vao doPost sau xac thuc. Khong chua khoa bi mat.
 */
const HVA_LICH_AUDIT_V1 = (() => {
  const SHEET = 'HVA_LICH_AUDIT';
  const HEADERS = ['time','calendarId','scope','revision','action','actor','reason','beforeJson','afterJson','snapshotDate'];
  function sheet_() {
    const id=PropertiesService.getScriptProperties().getProperty('HVA_LICH_AUDIT_SPREADSHEET_ID');
    if (!id) throw Error('Chưa cấu hình HVA_LICH_AUDIT_SPREADSHEET_ID');
    const book=SpreadsheetApp.openById(id);
    let sheet=book.getSheetByName(SHEET);
    if(!sheet){sheet=book.insertSheet(SHEET);sheet.appendRow(HEADERS);sheet.setFrozenRows(1)}
    return sheet;
  }
  const clean=(v,n)=>String(v===null||v===undefined?'':v).trim().slice(0,n||500);
  function record(actor, request) {
    if (!actor || !actor.username) return {success:false,message:'Chưa xác thực người thao tác'};
    const position=String(actor.chucVu||actor.viTriViecLam||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if (!/(hieu truong|pho hieu truong|to truong van phong|ttvp)/.test(position))
      return {success:false,code:'FORBIDDEN',message:'Không có quyền công bố lịch nhà trường'};
    const id=clean(request.calendarId,120);
    if (!id) return {success:false,message:'Thiếu mã lịch'};
    if(!['SCHOOL_WEEK','SCHOOL_MONTH','DEPARTMENT'].includes(request.scope))
      return {success:false,message:'Loại lịch không hợp lệ'};
    if(!['PUBLISH','UPDATE','CORRECT','ARCHIVE'].includes(request.action))
      return {success:false,message:'Hành động không hợp lệ'};
    const reason=clean(request.reason,1000);
    if(['UPDATE','CORRECT'].includes(request.action)&&!reason)
      return {success:false,message:'Bắt buộc ghi lý do điều chỉnh'};
    const prev=request.before||{},next=request.after||{};
    const lock=LockService.getScriptLock();lock.waitLock(10000);
    try{
      const sh=sheet_();
      const rows=sh.getLastRow()>1?sh.getRange(2,2,sh.getLastRow()-1,4).getDisplayValues():[];
      const related=rows.filter(r=>r[0]===id);
      const revision=related.reduce((m,r)=>Math.max(m,Number(r[2])||0),0)+1;
      sh.appendRow([new Date(),id,request.scope,revision,request.action,clean(actor.username,120),reason,
        JSON.stringify(prev).slice(0,45000),JSON.stringify(next).slice(0,45000),clean(request.snapshotDate,20)]);
      return {success:true,calendarId:id,revision,action:request.action};
    } finally {lock.releaseLock()}
  }
  function history(actor,id){
    if(!actor||!actor.username)return {success:false,message:'Chưa đăng nhập'};
    const sh=sheet_();if(sh.getLastRow()<2)return {success:true,history:[]};
    const rows=sh.getRange(2,1,sh.getLastRow()-1,10).getValues();
    const data=rows.filter(r=>r[1]===String(id)).map(r=>({time:r[0],calendarId:r[1],scope:r[2],revision:r[3],action:r[4],actor:r[5],reason:r[6],snapshotDate:r[9]}));
    return {success:true,history:data};
  }
  return {record,history};
})();
function hvaLichAuditRouter_(action,p){
  const actor=nvsActor_(p);if(!actor)return nvsResp_({success:false,message:'Phiên đăng nhập đã hết hạn'});
  const result=action==='hvaLichAuditHistory'
    ?HVA_LICH_AUDIT_V1.history(actor,p.calendarId)
    :HVA_LICH_AUDIT_V1.record(actor,p);
  return nvsResp_(result);
}
