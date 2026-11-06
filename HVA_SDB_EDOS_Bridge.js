/* HVA – cầu nối NHẬN DẠNG SỔ GHI ĐẦU BÀI; chủ động gọi từ phiên EDOS.
 * Không lưu token, không tự gửi ảnh; Backend BẮT BUỘC duyệt quyền.
 * Action trên GAS thử nghiệm: hva_sdb_recognize (chưa triển khai production).
 */
(function(root){'use strict';
 const URL='https://script.google.com/macros/s/AKfycbzTRkdqyYYI8LQo9MkiTjEIXkAC7BWK1MroUXPuvKMl9Yu_o9gXFS8QCcyQmq78-ikvvg/exec';
 const valid=['image/jpeg','image/png','image/webp'];
 const err=msg=>{throw Error(msg)};
 function asBase64(file){
  return new Promise((resolve,reject)=>{
   const reader=new FileReader();
   reader.onload=()=>{const data=String(reader.result||'');const i=data.indexOf(',');if(i<0)return reject(Error('Tệp ảnh không đọc được.'));resolve(data.slice(i+1))};
   reader.onerror=()=>reject(Error('Không đọc được ảnh trên thiết bị.'));
   reader.readAsDataURL(file);
  });
 }
 async function recognize(files,context){
  if(!Array.isArray(files)||files.length<1||files.length>2)err('Cần chọn một hoặc hai ảnh trang sổ.');
  if(!root.HVAPersonnel||!root.HVAPersonnel.ensureAuth)err('Thiếu cơ chế phiên EDOS. Vui lòng mở từ EDOS đã đăng nhập.');
  const auth=root.HVAPersonnel.ensureAuth();
  if(!auth.getSessionState().validLocal)err('Phiên đăng nhập EDOS không còn hiệu lực. Vui lòng đăng nhập lại.');
  const images=[];
  for(const file of files){
   if(!file||!valid.includes(file.type))err('Dịch vụ nhận dạng hiện chỉ hỗ trợ ảnh JPG/PNG/WebP; PDF cần được chuyển thành ảnh trước.');
   if(file.size<=0||file.size>5*1024*1024)err('Mỗi ảnh nhận dạng phải dưới 5 MB.');
   images.push({mimeType:file.type,data:await asBase64(file)});
  }
  const payload={action:'hva_sdb_recognize',
    requestId:'sdb-'+(root.crypto?.randomUUID?.()||String(Date.now())+'-'+Math.random().toString(36).slice(2,14)),
    permissionConfirmed:true,images,
    schoolYear:String(context?.schoolYear||'').slice(0,30),
    className:String(context?.className||'').slice(0,30),
    week:String(context?.week||'').slice(0,3)};
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),55000);
  try{
   const response=await auth.postJson(URL,payload,{signal:controller.signal,redirect:'follow'});
   if(!response.ok)err('Backend EDOS trả HTTP '+response.status+'.');
   const raw=await response.text();if(raw.length>240000)err('Phản hồi nhận dạng vượt giới hạn.');
   let data;try{data=JSON.parse(raw)}catch(_){err('Backend chưa trả dữ liệu nhận dạng hợp lệ. Có thể action chưa được triển khai.')}
   if(data.success!==true)err(String(data.message||'Chưa có quyền hoặc chưa triển khai dịch vụ nhận dạng.').slice(0,180));
   if(data.draft!==true||data.reviewRequired!==true||data.requestId!==payload.requestId)err('Phản hồi thiếu trạng thái dự thảo hoặc không khớp mã yêu cầu.');
   return data;
  }catch(e){
   if(e?.name==='AbortError')err('Quá thời gian xử lý nhận dạng; vui lòng thử lại sau.');
   throw e;
  }finally{clearTimeout(timeout)}
 }
 root.HVA_SDB_AUTHORIZED_RECOGNIZE=recognize;
})(window);