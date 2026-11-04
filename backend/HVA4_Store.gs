/**
 * HVA–EDOS / Bộ nghiệp vụ bổ sung. KHÔNG phải Web App độc lập.
 * Chỉ được gọi từ router NVS sau khi máy chủ đã xác thực sessionToken.
 * Không tạo doGet/doPost, không thay đổi các nghiệp vụ đã PASS.
 * Script property bắt buộc: HVA4_DATA_SPREADSHEET_ID
 */
const HVA4_TABLES_ = Object.freeze({homeroom:'HVA4_SO_CHU_NHIEM',nq52:'HVA4_NQ52',device:'HVA4_SO_THIET_BI',roster:'HVA4_HOC_SINH',audit:'HVA4_NHAT_KY'});
const HVA4_HEADER_=['ID','Tạo lúc','Cập nhật','Chủ sở hữu','Lớp','Kỳ','Trạng thái','Nội dung JSON','Ngày gửi'];
function HVA4_book_(){const id=PropertiesService.getScriptProperties().getProperty('HVA4_DATA_SPREADSHEET_ID');if(!id)throw new Error('Chưa cấu hình kho dữ liệu nghiệp vụ.');return SpreadsheetApp.openById(id)}
function HVA4_sheet_(key){const name=HVA4_TABLES_[key];if(!name)throw new Error('Tên nghiệp vụ không hợp lệ.');const ss=HVA4_book_();const sh=ss.getSheetByName(name);if(!sh)throw new Error('Chưa khởi tạo bảng dữ liệu '+name);return sh}
function HVA4_setupByAdmin_(){const ss=HVA4_book_();Object.keys(HVA4_TABLES_).forEach(k=>{const name=HVA4_TABLES_[k];let sh=ss.getSheetByName(name);if(!sh){sh=ss.insertSheet(name);const header=k==='roster'?['Lớp','Năm học','Mã HS','Dữ liệu JSON','Cập nhật lúc']:k==='audit'?['Thời điểm','Tài khoản','Hành động','Mã bản ghi','Phạm vi']:HVA4_HEADER_;sh.appendRow(header);sh.setFrozenRows(1)}})}
function HVA4_actor_(principal){if(!principal||typeof principal!=='object'||!principal.username)throw new Error('Phiên đăng nhập chưa được máy chủ xác thực.');const user=String(principal.username).trim();if(!/^[\w.@-]{2,100}$/.test(user))throw new Error('Danh tính không hợp lệ.');return {username:user,roles:Array.isArray(principal.roles)?principal.roles.map(x=>String(x).toUpperCase()):[],className:String(principal.homeroomClass||'').trim(),schoolYear:String(principal.schoolYear||'2026–2027').trim(),subjects:Array.isArray(principal.hsgSubjects)?principal.hsgSubjects:[]}}
function HVA4_admin_(u){return u.roles.some(x=>['ADMIN','BGH','HIEU_TRUONG','PHT'].includes(x))}
function HVA4_str_(v,max){return String(v==null?'':v).trim().slice(0,max||2000)}
function HVA4_rows_(sh){return sh.getLastRow()<2?[]:sh.getRange(2,1,sh.getLastRow()-1,HVA4_HEADER_.length).getValues().map((v,i)=>({row:i+2,id:String(v[0]),created:v[1],updated:v[2],owner:String(v[3]),className:String(v[4]),period:String(v[5]),status:String(v[6]),payload:JSON.parse(String(v[7]||'{}')),submitted:v[8]}))}
function HVA4_audit_(actor,action,id,scope){try{HVA4_sheet_('audit').appendRow([new Date(),actor,action,id,scope])}catch(e){console.error('HVA4 audit unavailable:',e);throw new Error('Không ghi được nhật ký xử lý.')}}