/**
 * HVA–EDOS · A1.2 · Sửa đọc lớp GVCN từ nguồn nhân sự.
 * Cách tích hợp: thay ĐÚNG hàm cnProfile_ hiện có trong Apps Script V5 bằng
 * cnProfile_ dưới đây cùng hai hàm phụ; không khai báo cnProfile_ thứ hai.
 * KHÔNG tự động chạy từ GitHub Pages: .gs là nguồn bàn giao có kiểm soát.
 */
function cnNormHeader_(v){
  return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[đĐ]/g,'d').toLowerCase().replace(/[^a-z0-9]/g,'');
}
function cnNormClass_(display,raw){
  function parse(v){
    if(v instanceof Date && !isNaN(v.getTime())) return '';
    var s=String(v===undefined||v===null?'':v).trim();
    if(!s||/^(kh[oô]ng|none|false|0|n\/a|—|-)$/i.test(s))return '';
    s=s.replace(/\s+/g,'').replace(/[／⁄]/g,'/').replace(/^l[oớ]p[:：]?/i,'');
    var m=s.match(/^(10|11|12)\/0?([1-9]|[1-9][0-9])$/);
    return m?(m[1]+'/'+Number(m[2])):'';
  }
  return parse(display)||parse(raw);
}
function cnLocatePersonnelColumns_(sh){
  var n=sh.getLastColumn(),h=sh.getRange(6,1,1,n).getDisplayValues()[0].map(cnNormHeader_);
  function find(pred,fallback){var i=h.findIndex(pred);return i>=0?i:fallback;}
  return {
    username:find(x=>x==='tendangnhap'||x==='username'||x==='taikhoan',14),
    cccd:find(x=>x==='cccd'||x==='socccd',3),
    name:find(x=>x==='hoten'||x==='hovaten',2),
    team:find(x=>x==='tobophan'||x==='bophan',12),
    subject:find(x=>x==='monday'||x==='monhoc',13),
    gvcnHeaders:h.map((x,i)=>(x==='gvcn'||x==='lopchunhiem'||x==='phanconggvcn')?i:-1).filter(i=>i>=0),
    fixedW:22,width:n
  };
}
function cnProfile_(username){
  var sh=hvaGetSheetNhanSu_();
  if(!sh)throw Error('Không tìm thấy bảng dữ liệu nhân sự HVA.');
  var lastRow=sh.getLastRow(),lastCol=sh.getLastColumn();
  if(lastRow<7)throw Error('Danh sách nhân sự chưa có dữ liệu.');
  var cols=cnLocatePersonnelColumns_(sh);
  if(cols.username>=lastCol)throw Error('Thiếu cột tài khoản trong bảng nhân sự.');
  var display=sh.getRange(7,1,lastRow-6,lastCol).getDisplayValues();
  var raw=sh.getRange(7,1,lastRow-6,lastCol).getValues();
  var target=String(username||'').trim().toLowerCase();
  if(!target)return null;
  var matches=[];
  for(var i=0;i<display.length;i++){
    var u=String(display[i][cols.username]||raw[i][cols.username]||'').trim().toLowerCase();
    if(u===target)matches.push(i);
  }
  if(matches.length===0){
    // Chỉ dự phòng khi chính cột tài khoản không tìm ra; không nhận bừa
    // một ô có giá trị trùng tên tài khoản ở các cột khác.
    var fallback=[];
    for(var ri=0;ri<display.length;ri++){
      var ids=display[ri].map(function(x){return String(x||'').trim().toLowerCase();});
      if(ids.indexOf(target)>=0)fallback.push(ri);
    }
    if(fallback.length===1)matches=fallback;
    if(fallback.length>1)throw Error('Tài khoản xuất hiện ở nhiều dòng nhân sự.');
  }
  if(matches.length!==1){
    if(matches.length>1)throw Error('Tài khoản trùng trong CSDL nhân sự.');
    return null;
  }
  var i=matches[0],d=display[i],r=raw[i],candidate=[];
  if(cols.fixedW<lastCol)candidate.push(cols.fixedW);
  cols.gvcnHeaders.forEach(j=>{if(j!==cols.fixedW)candidate.push(j);});
  var choices=candidate.map(j=>({index:j,lop:cnNormClass_(d[j],r[j]),display:String(d[j]||'')}));
  var valid=choices.filter(x=>x.lop),primary=valid.find(x=>x.index===cols.fixedW);
  var unique=Array.from(new Set(valid.map(x=>x.lop)));
  var chosen=primary||(unique.length===1?valid[0]:null);
  if(primary&&unique.some(x=>x!==primary.lop))throw Error('Phân công GVCN cột W và cột khác không nhất quán.');
  if(!primary&&unique.length>1)throw Error('Nhiều cột GVCN không nhất quán.');
  var cccd=String(d[cols.cccd]||r[cols.cccd]||'').replace(/\D/g,'');
  if(cccd.length>0&&cccd.length<12)cccd=cccd.padStart(12,'0');
  return {
    username:target,
    hoTen:String(d[cols.name]||r[cols.name]||username).trim(),
    toBoPhan:String(d[cols.team]||r[cols.team]||'').trim(),
    monDay:String(d[cols.subject]||r[cols.subject]||'').trim(),
    lopChuNhiem:chosen?chosen.lop:'',
    cccd:cccd,
    _giaoVienSource:chosen?chosen.index+1:0,
    _giaoVienDisplay:chosen?chosen.display:'',
    _nhanSuRow:i+7
  };
}
/** Chạy thủ công: chỉ đọc nguồn nhân sự, không ghi Sheet hoặc ghi log CCCD. */
function HVA_A12_TEST_COT_GVCN(){
  var sh=hvaGetSheetNhanSu_(),c=cnLocatePersonnelColumns_(sh);
  var n=Math.max(0,sh.getLastRow()-6),d=n?sh.getRange(7,1,n,c.width).getDisplayValues():[];
  var r=n?sh.getRange(7,1,n,c.width).getValues():[];
  var wValid=c.fixedW<c.width?d.filter((row,i)=>cnNormClass_(row[22],r[i][22])).length:0;
  var out={sheetName:sh.getName(),headersAtRow:6,records:n,
    usernameColumn:c.username+1,gvcnColumnW:c.width>=23?23:'MISSING',
    gvcnHeaderCandidates:c.gvcnHeaders.map(j=>j+1),validClassesInW:wValid};
  console.log(JSON.stringify(out));return out;
}
