/**
 * HVA–EDOS A.4.1 — ĐỐI CHIẾU/HỒI TỐ MÃ KHKT TỪ SHEET A22.
 * Tệp độc lập, không sửa cột RecordId của NVS_HO_SO_A22.
 *
 * CHỈ DÙNG SAU KHI ĐÃ SAO LƯU SPREADSHEET.
 *
 * B1: Run hvaA41KhktAuditLegacy_() và đọc Execution log.
 * B2: Đối chiếu các hồ sơ cùng tên nộp nhiều lần; chọn recordId giữ lại.
 * B3: Chỉnh danh sách trong hvaA41KhktMigrateApproved_() sau khi xác nhận.
 *     Mặc định KHÔNG thực hiện thay đổi nào.
 * Sheet đích NVS_A.4.1_KHKT dùng chung bộ cấp mã trực tuyến.
 */
function hvaA41KhktLegacyDb_(){
  var id=String(PropertiesService.getScriptProperties().getProperty('EDOS_NV_DB_ID')||'').trim();
  if(!id) throw Error('Thiếu EDOS_NV_DB_ID.');
  return SpreadsheetApp.openById(id);
}
function hvaA41KhktLegacyRows_(){
  var sh=hvaA41KhktLegacyDb_().getSheetByName('NVS_HO_SO_A22');
  if(!sh) throw Error('Không tìm thấy Sheet NVS_HO_SO_A22.');
  var all=sh.getDataRange().getValues();
  if(all.length<2) return [];
  var h=all[0].map(function(v){return String(v||'').trim()});
  var required=['RecordId','RequestId','Code','Title','Owner','OwnerName','Team','CreatedAt','Status','PayloadJson'];
  required.forEach(function(k){if(h.indexOf(k)<0)throw Error('Thiếu cột '+k+' trong Sheet nguồn.')});
  return all.slice(1).map(function(row,index){
    var v={sourceRow:index+2};
    required.forEach(function(k){v[k]=row[h.indexOf(k)]});
    return v;
  }).filter(function(v){return String(v.Code||'').trim()==='A.4.1' && !!String(v.RecordId||'').trim()});
}
function hvaA41KhktLegacyPayload_(raw){
  var data;
  try{data=JSON.parse(String(raw||''));}
  catch(e){return {error:'PayloadJson không hợp lệ'};}
  // Dữ liệu A22 có thể lưu đối tượng document, form/extras,
  // hoặc đối tượng đã chuẩn hóa. Không lấy link theo vị trí cột.
  var doc=data.document||data.doc||data;
  var form=doc.form||data.form||{};
  var extras=doc.extras||data.extras||{};
  var kind=String(extras.loaiSanPham||'').trim();
  var word=String(extras.sanPhamUrl||'').trim();
  var pdf=String(form.evidence||'').trim();
  var content=String(form.content||'');
  var resultText=String(form.result||'');
  var research=String(extras.ketQuaNghienCuu||'');
  // Hỗ trợ bản ghi A22 lưu liên kết dưới dạng văn bản kèm nhãn.
  function fromText(text,label){
    var re=new RegExp('(?:Liên kết|Link|Bản)\\s*'+label+'\\s*:\\s*(https?:\\/\\/[^\\s<>"\\x27]+)','i');
    var m=re.exec(text);
    return m?m[1].trim():'';
  }
  if(!word)word=fromText(content+'\\n'+research,'Word');
  if(!pdf)pdf=fromText(content+'\\n'+research,'PDF');
  return {
    kind:kind,
    schoolYear:String(form.schoolYear||'').trim(),
    word:word,pdf:pdf
  };
}
/** Hàm chỉ đọc, tuyệt đối KHÔNG tạo Sheet hay cấp mã. */
function hvaA41KhktAuditLegacy_(){
  var rows=hvaA41KhktLegacyRows_();
  var result=rows.map(function(r){
    var data=hvaA41KhktLegacyPayload_(r.PayloadJson);
    return {
      row:r.sourceRow,recordId:String(r.RecordId),requestId:String(r.RequestId),
      title:String(r.Title),owner:String(r.Owner),createdAt:String(r.CreatedAt),
      category:data.kind||'(chưa xác định)',payloadOk:!data.error,
      hasWord:/^https:\/\//i.test(data.word||''),
      hasPdf:/^https:\/\//i.test(data.pdf||'')
    };
  });
  Logger.log(JSON.stringify(result,null,2));
  return result;
}
/**
 * LẬP BẢNG KIỂM TRA KHKT (không cấp mã, không sửa Sheet A22).
 * Người quản trị chạy hàm này để xem riêng link Word / PDF,
 * đánh dấu các bản ghi cùng tên, nhận diện bản đã nộp nhiều lần.
 * Chỉ tổng hợp A.4.1 có loại KHKT hoặc chưa xác định loại.
 * Bảng kiểm tra khác Sheet mã chính thức NVS_A.4.1_KHKT.
 */
function hvaA41KhktCreateReviewSheet_(){
  var ss=hvaA41KhktLegacyDb_();
  var rows=hvaA41KhktLegacyRows_();
  var HEAD=['STT nguồn','Mã A22','Mã yêu cầu','Giáo viên','Tổ CM',
    'Tên sản phẩm','Loại hồ sơ','Word','PDF','Ngày nộp',
    'Trạng thái A22','Kiểm tra','Ghi chú xác minh'];
  var names={};
  var filtered=rows.map(function(r){
    var p=hvaA41KhktLegacyPayload_(r.PayloadJson);
    return {r:r,p:p};
  }).filter(function(x){
    return x.p.kind==='Khoa học kỹ thuật'||!x.p.kind;
  });
  filtered.forEach(function(x){
    var key=String(x.r.Owner||'').trim().toLowerCase()+'|'+
      String(x.r.Title||'').trim().toLowerCase();
    names[key]=(names[key]||0)+1;
  });
  var safe=function(v){
    var t=String(v==null?'':v).trim();
    return /^[=+@\\-]/.test(t)?"'"+t:t;
  };
  var out=filtered.map(function(x){
    var r=x.r,p=x.p;
    var key=String(r.Owner||'').trim().toLowerCase()+'|'+
      String(r.Title||'').trim().toLowerCase();
    var issue=[];
    if(!p.kind)issue.push('Chưa rõ loại');
    if(!/^https:\/\//i.test(p.word||''))issue.push('Thiếu Word');
    if(!/^https:\/\//i.test(p.pdf||''))issue.push('Thiếu PDF');
    if(names[key]>1)issue.push('Tên trùng: đối chiếu 2 lượt');
    return [
      r.sourceRow,safe(r.RecordId),safe(r.RequestId),safe(r.OwnerName||r.Owner),
      safe(r.Team),safe(r.Title),safe(p.kind||'Chưa rõ'),
      safe(p.word),safe(p.pdf),safe(r.CreatedAt),safe(r.Status),
      issue.length?'CẦN KIỂM TRA':'Đủ liên kết',
      issue.join('; ')
    ];
  });
  var name='NVS_A.4.1_KHKT_DOI_CHIEU';
  var sh=ss.getSheetByName(name);
  if(sh&&sh.getLastRow()>1){
    throw Error('Bảng đối chiếu đã có dữ liệu: không tự ghi đè. Hãy sao lưu và xóa bảng đối chiếu cũ nếu cần tạo mới.');
  }
  if(!sh)sh=ss.insertSheet(name);
  sh.getRange(1,1,1,HEAD.length).setValues([HEAD]);
  if(out.length)sh.getRange(2,1,out.length,HEAD.length).setValues(out);
  sh.setFrozenRows(1);
  sh.getRange(1,1,1,HEAD.length).setFontWeight('bold').setBackground('#e8f3fc');
  sh.getRange(1,1,Math.max(2,out.length+1),HEAD.length).setWrap(false);
  sh.autoResizeColumns(1,HEAD.length);
  Logger.log('Đã lập bảng đối chiếu '+name+': '+out.length+' hồ sơ A.4.1 có thể là KHKT. Chưa cấp mã mới.');
  return {sheet:name,rows:out.length,officialCodesIssued:0};
}
/**
 * CHỈ GHI các recordId được người quản trị xác nhận, không tự coi hai lượt
 * nộp cùng tên là cùng một hồ sơ. Xử lý theo thứ tự CreatedAt tăng dần.
 * Trả lỗi nếu PayloadJson không nhận diện chính xác loại KHKT.
 */
function hvaA41KhktBackfillSelected_(ids){
  if(!Array.isArray(ids)||!ids.length) throw Error('Cần danh sách recordId đã duyệt.');
  if(typeof HVA_A41_KHKT_HEADERS==='undefined'||typeof HVA_A41_KHKT_SHEET==='undefined'){
    throw Error('Chưa cài module HVA_A41_KHKT_MA_HO_SO.gs.');
  }
  var wanted=ids.map(function(v){return String(v||'').trim()});
  if(new Set(wanted).size!==wanted.length)throw Error('Danh sách recordId bị trùng.');
  var rows=hvaA41KhktLegacyRows_();
  var selected=wanted.map(function(id){
    var r=rows.filter(function(x){return String(x.RecordId).trim()===id});
    if(r.length!==1)throw Error('Mã không tìm thấy hoặc trùng ở Sheet nguồn: '+id);
    var v=r[0], data=hvaA41KhktLegacyPayload_(v.PayloadJson);
    if(data.error||data.kind!=='Khoa học kỹ thuật'){
      throw Error('Hồ sơ '+id+' không xác minh được loại Khoa học kỹ thuật.');
    }
    if(!/^https:\/\//.test(data.word)||!/^https:\/\//.test(data.pdf)){
      throw Error('Hồ sơ '+id+' thiếu link Word/PDF trong PayloadJson.');
    }
    v.details=data;
    return v;
  });
  selected.sort(function(a,b){return new Date(a.CreatedAt)-new Date(b.CreatedAt)});
  var lock=LockService.getScriptLock();
  if(!lock.tryLock(30000))throw Error('Không lấy được khóa cấp mã; thử lại.');
  try{
    var ss=hvaA41KhktLegacyDb_(),sh=ss.getSheetByName(HVA_A41_KHKT_SHEET);
    if(!sh){
      sh=ss.insertSheet(HVA_A41_KHKT_SHEET);
      sh.getRange(1,1,1,HVA_A41_KHKT_HEADERS.length).setValues([HVA_A41_KHKT_HEADERS]);
      sh.setFrozenRows(1);
    }
    var header=sh.getRange(1,1,1,HVA_A41_KHKT_HEADERS.length).getValues()[0];
    if(JSON.stringify(header)!==JSON.stringify(HVA_A41_KHKT_HEADERS)){
      throw Error('Sheet đích không đúng cấu trúc chuẩn.');
    }
    var data=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,3).getValues():[];
    var existing={},max=0;
    data.forEach(function(r){
      var id=String(r[1]||''),code=String(r[0]||'');
      var m=/^A4\.1-KHKT-(\d+)$/.exec(code);
      if(m)max=Math.max(max,Number(m[1]));
      if(id)existing[id]=code;
    });
    var result=[],safe=function(v){var t=String(v==null?'':v).trim();return /^[=+@\-]/.test(t)?"'"+t:t};
    selected.forEach(function(r){
      var id=String(r.RecordId).trim(),code=existing[id];
      if(!code){
        if(++max>9999)throw Error('Dải mã 4 chữ số đã hết.');
        code='A4.1-KHKT-'+String(max).padStart(4,'0');
        sh.appendRow([
          code,id,String(r.RequestId||''),safe(r.OwnerName||r.Owner),
          safe(r.Owner),safe(r.Team),safe(r.details.schoolYear),safe(r.Title),
          safe(r.details.word),safe(r.details.pdf),
          safe(r.CreatedAt),'Đã tiếp nhận'
        ]);
        existing[id]=code;
      }
      result.push({sourceRow:r.sourceRow,recordId:id,businessCode:code});
    });
    SpreadsheetApp.flush();
    Logger.log(JSON.stringify(result,null,2));
    return result;
  }finally{lock.releaseLock()}
}
/** Mặc định KHÔNG hồi tố; phải nhập mã nguồn thực tế đã xác minh. */
function hvaA41KhktMigrateApproved_(){
  var approvedRecordIds=[
    // 'A22-... (RecordId ĐẦY ĐỦ, không dùng mã cắt từ ảnh)',
  ];
  if(!approvedRecordIds.length){
    throw Error('CHƯA PHÊ DUYỆT: Điền recordId đã kiểm tra sau khi xem Audit.');
  }
  return hvaA41KhktBackfillSelected_(approvedRecordIds);
}
