/**
 * HVA–EDOS SỔ GHI ĐẦU BÀI – NHẬN DẠNG HAI TRANG BẰNG GEMINI VISION
 * PILOT ONLY: ghép vào BẢN SAO Apps Script EDOS sau kiểm toán router.
 * KHÔNG có doGet/doPost, không tự mở endpoint hoặc CORS.
 * Không được sử dụng nếu chưa có chấp thuận xử lý ảnh chứa dữ liệu học sinh.
 * Script properties: GEMINI_API_KEY, HVA_SDB_VISION_MODEL (đã thử nghiệm thực tế),
 *                    HVA_SDB_TEST_USERS (allowlist usernames của EDOS).
 * Router cần xác thực hành động và yêu cầu server do nvsActor_(p) xác định.
 */
function hvaSdbRecognizePilot_(p){
 var error=function(code,msg){return {success:false,code:code,message:msg,rows:[],draft:true};};
 try{
  if(!p||p.action!=='hva_sdb_recognize')return error('INVALID_ACTION','Yêu cầu không hợp lệ.');
  if(typeof nvsActor_!=='function'||typeof hvaTraCuuNhanSuTheoUser_!=='function')
    return error('NOT_CONFIGURED','Chưa kết nối xác thực nhân sự.');
  var actor=nvsActor_(p),user=actor&&String(actor.username||'').trim().toLowerCase();
  if(!user||!hvaTraCuuNhanSuTheoUser_(actor.username))return error('UNAUTHORIZED','Phiên EDOS không hợp lệ hoặc đã hết hạn.');
  var props=PropertiesService.getScriptProperties();
  var allowed=String(props.getProperty('HVA_SDB_TEST_USERS')||'').split(',').map(function(x){return x.trim().toLowerCase()}).filter(Boolean);
  if(allowed.indexOf(user)<0)return error('FORBIDDEN','Chưa được cấp quyền thử nhận dạng sổ.');
  if(p.permissionConfirmed!==true)return error('CONSENT_REQUIRED','Chưa xác nhận điều kiện xử lý ảnh theo quy định nhà trường.');
  var reqId=String(p.requestId||'');
  if(!/^sdb-[A-Za-z0-9-]{12,96}$/.test(reqId))return error('INVALID_INPUT','Mã yêu cầu không hợp lệ.');
  var photos=p.images;
  if(!Array.isArray(photos)||photos.length<1||photos.length>2)return error('INVALID_IMAGES','Cần một hoặc hai ảnh trang sổ.');
  var accepted=['image/jpeg','image/png','image/webp'];
  var totalBytes=0,parts=[];
  for(var i=0;i<photos.length;i++){
    var im=photos[i],mime=String(im&&im.mimeType||''),data=String(im&&im.data||'');
    if(accepted.indexOf(mime)<0||!data||data.length>7*1024*1024||!/^[A-Za-z0-9+/]+={0,2}$/.test(data))
      return error('INVALID_IMAGES','Chỉ nhận ảnh JPG/PNG/WebP tối đa khoảng 5 MB/ảnh.');
    totalBytes+=data.length*3/4;
    parts.push({text:i===0?'ẢNH TRANG TRÁI: ngày, tiết, môn/HĐGD, PPCT, tên bài/nội dung công việc':'ẢNH TRANG PHẢI: HS vắng, nhận xét, điểm HT/KL/VS, tổng, xếp loại, ký tên'});
    parts.push({inline_data:{mime_type:mime,data:data}});
  }
  if(totalBytes>10*1024*1024)return error('TOO_LARGE','Ảnh quá dung lượng thử nghiệm.');
  var key=String(props.getProperty('GEMINI_API_KEY')||'').trim();
  var model=String(props.getProperty('HVA_SDB_VISION_MODEL')||'').trim();
  if(!key||!/^[A-Za-z0-9._-]{3,100}$/.test(model))return error('NOT_CONFIGURED','Dịch vụ nhận dạng chưa cấu hình.');
  var hash=function(x){return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,x)).slice(0,38)};
  var cache=CacheService.getScriptCache(),lock=LockService.getScriptLock(),replay='SDB_R_'+hash(user+'|'+reqId),quota='SDB_Q_'+hash(user);
  if(!lock.tryLock(5000))return error('BUSY','Máy chủ đang bận.');
  try{
   if(cache.get(replay))return error('REPLAY','Mã yêu cầu đã dùng.');
   var n=Number(cache.get(quota)||0);if(n>=5)return error('RATE_LIMIT','Đã hết số lượt nhận dạng trong thời gian thử nghiệm.');
   cache.put(replay,'1',600);cache.put(quota,String(n+1),21600);
  }finally{lock.releaseLock()}
  var directions=[
   'Chuyển chữ viết tay từ trang đôi Sổ ghi đầu bài Trường THPT Hòa Vang sang dữ liệu bảng ở mức NHÁP.',
   'Ảnh trang trái và phải cùng một lần chụp, cần ghép dòng theo thứ/ngày/tiết, KHÔNG ghép theo vị trí đoán mò.',
   'Mẫu đúng: ngày, buổi, tiết, MÔN HỌC/HOẠT ĐỘNG GD, TIẾT PPCT, TÊN BÀI NỘI DUNG CÔNG VIỆC,',
   'TÊN HS VẮNG MẶT, NHẬN XÉT GV, điểm HT, KL, VS, tổng ghi trên sổ, xếp loại, chữ ký.',
   'Không có điểm CC riêng; chữ ghi lệch cột phải đối chiếu, KHÔNG suy đoán.',
   'Giữ nguyên các điểm và nội dung thực sự ghi; không tự sửa tổng, xếp loại, tên HS, chữ ký.',
   'Với chữ số/từ không chắc, để chuỗi rỗng hoặc null; thêm khóa uncertainFields cho các trường chưa rõ.',
   'Chữ ký chỉ nhận biết "Có dấu ký/Không rõ/Không thấy" nếu quan sát được; KHÔNG nhận dạng danh tính người ký.',
   'Không tự điền ngày, PPCT, môn, tên bài từ suy luận theo thời khóa biểu.',
   'Chỉ xuất JSON hợp lệ dạng {"rows":[{"date":"YYYY-MM-DD hoặc rỗng","session":"Sáng/Chiều","period":"1",',
   '"double":"1","subject":"","ppct":"","lesson":"","absent":"","comment":"","ht":10,"kl":10,"vs":5,',
   '"total":25,"rank":"","signature":"","uncertainFields":["date"],"sourceRefs":[0,1]}]}.',
   'Không thêm các trường khác. Tối đa 40 dòng, không viết lời giải thích hoặc Markdown.'
  ].join('\n');
  var body={systemInstruction:{parts:[{text:directions}]},contents:[{role:'user',parts:parts}],generationConfig:{temperature:0,maxOutputTokens:7000,responseMimeType:'application/json'}};
  var resp=UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model)+':generateContent',{
   method:'post',contentType:'application/json',headers:{'x-goog-api-key':key},payload:JSON.stringify(body),muteHttpExceptions:true
  });
  var http=resp.getResponseCode();
  if(http===429)return error('PROVIDER_QUOTA','Dịch vụ nhận dạng đang giới hạn lượt gọi.');
  if(http===503)return error('PROVIDER_UNAVAILABLE','Dịch vụ nhận dạng tạm thời bận.');
  if(http<200||http>=300)return error('PROVIDER_FAILED','Không nhận được kết quả nhận dạng.');
  var raw=JSON.parse(resp.getContentText());
  var answer=(raw.candidates||[]).flatMap(function(c){return c.content&&c.content.parts||[]}).map(function(p){return typeof p.text==='string'?p.text:''}).join('').trim();
  if(answer.length>100000||!answer)return error('EMPTY','Không nhận được bảng dữ liệu.');
  var parsed=JSON.parse(answer);
  if(!parsed||!Array.isArray(parsed.rows)||parsed.rows.length>40)return error('INVALID_RESPONSE','Kết quả nhận dạng chưa đúng cấu trúc.');
  return {success:true,rows:parsed.rows,draft:true,reviewRequired:true,requestId:reqId};
 }catch(e){
  // Never return prompts, original images, tokens, API key or stack trace.
  return error('SERVER_ERROR','Không thể xử lý ảnh trong lượt thử này.');
 }
}
