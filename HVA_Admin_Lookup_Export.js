/* HVA–EDOS: Xuất Excel XLSX thuần trình duyệt, không gửi dữ liệu ra bên thứ ba. */
(function(root){'use strict';
const enc=new TextEncoder();
const norm=v=>String(v==null?'':v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,' ');
const esc=v=>norm(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
function col(i){let s='';for(i++;i>0;i=Math.floor((i-1)/26))s=String.fromCharCode(65+(i-1)%26)+s;return s}
const crcTable=Array.from({length:256},(_,i)=>{for(let j=0;j<8;j++)i=(i&1)?((i>>>1)^0xedb88320):(i>>>1);return i>>>0});
function crc(buf){let a=0xffffffff;for(const b of buf)a=(a>>>8)^crcTable[(a^b)&255];return(a^0xffffffff)>>>0}
function pack(parts){
 const chunks=[],directory=[];let length=0;
 function add(x){chunks.push(x);length+=x.length}
 function u16(arr,n,v){arr[n]=v&255;arr[n+1]=(v>>>8)&255}
 function u32(arr,n,v){u16(arr,n,v);u16(arr,n+2,v>>>16)}
 for(const [filename,content]of parts){
  const file=enc.encode(content),name=enc.encode(filename),c=crc(file),start=length;
  const head=new Uint8Array(30+name.length);u32(head,0,0x04034b50);u16(head,4,20);u16(head,6,0x800);u32(head,14,c);u32(head,18,file.length);u32(head,22,file.length);u16(head,26,name.length);head.set(name,30);add(head);add(file);
  const central=new Uint8Array(46+name.length);u32(central,0,0x02014b50);u16(central,4,20);u16(central,6,20);u16(central,8,0x800);u32(central,16,c);u32(central,20,file.length);u32(central,24,file.length);u16(central,28,name.length);u32(central,42,start);central.set(name,46);directory.push(central);
 }
 const start=length;for(const dir of directory)add(dir);
 const end=new Uint8Array(22);u32(end,0,0x06054b50);u16(end,8,directory.length);u16(end,10,directory.length);u32(end,12,length-start);u32(end,16,start);add(end);
 const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}return bytes;
}
function buildXlsx(rows){
 const sheet='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'
  +rows.map((row,i)=>'<row r="'+(i+1)+'">'+row.map((x,j)=>'<c r="'+col(j)+(i+1)+'" t="inlineStr"><is><t xml:space="preserve">'+esc(x)+'</t></is></c>').join('')+'</row>').join('')
  +'</sheetData></worksheet>';
 return pack([
 ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
 ['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
 ['xl/workbook.xml','<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Tra cuu EDOS" sheetId="1" r:id="rId1"/></sheets></workbook>'],
 ['xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'],
 ['xl/worksheets/sheet1.xml',sheet]
 ]);
}
const columns=['Nguồn','Mã hồ sơ','Tài khoản','Họ tên','Tổ/Bộ phận','Năm học','Nội dung','Trạng thái','Thời gian cập nhật','Tóm tắt'];
function dataset(records,meta,sources){
 const out=[
 ['TRƯỜNG THPT HÒA VANG – TRA CỨU TỔNG HỢP EDOS'],
 ['Ghi chú','Bản trích xuất, không thay thế hồ sơ gốc hoặc kết luận kiểm tra'],
 ['Thời điểm xuất',meta.exportedAt],['Người tra cứu',meta.viewer],['Chế độ',meta.mode],['Giáo viên',meta.teacher],
 ['Nội dung',meta.topic],['Năm học',meta.schoolYear],['Tổ/Bộ phận',meta.team],['Từ khóa',meta.keyword],
 ['Mục đích',meta.reason],['Số bản ghi khớp',meta.totalFound],['Số bản ghi xuất',records.length],
 ['Cảnh báo',meta.truncated?'Kết quả bị giới hạn; cần thu hẹp tìm kiếm.':'Không tìm thấy dữ liệu không đồng nghĩa chưa thực hiện.'],
 [],['TÌNH TRẠNG NGUỒN DỮ LIỆU']];
 for(const s of sources||[])out.push([s.label||s.topic||'',s.status||'',s.reason||'']);
 out.push([],columns);
 for(const r of records)out.push([r.sourceName,r.recordId,r.username,r.name,r.team,r.schoolYear,r.title,r.status,r.updatedAt,r.detail].map(norm));
 return out;
}
function csv(rows){const quote=v=>{let s=norm(v);if(/^\s*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};return'\uFEFF'+rows.map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n'}
function save(data,ext,type){const url=URL.createObjectURL(new Blob([data],{type})),a=document.createElement('a');a.href=url;a.download='HVA_EDOS_TRA_CUU_'+new Date().toISOString().slice(0,10)+'.'+ext;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
root.HVA_ADMIN_LOOKUP_EXPORT=Object.freeze({
 dataset,buildXlsx,csv,columns,
 xlsx(records,meta,sources){save(buildXlsx(dataset(records,meta,sources)),'xlsx','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')},
 csvFile(records,meta,sources){save(csv(dataset(records,meta,sources)),'csv','text/csv;charset=utf-8')}
});
})(window);
