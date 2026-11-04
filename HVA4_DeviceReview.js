(function(w){'use strict';
const h=w.HVA4,$=h.$;let enabled=false;
async function check(){
 enabled=false;$('saveReview').disabled=true;$('reviewNote').textContent='Đang kiểm tra quyền BGH và chức năng lưu nhận xét trên máy chủ…';
 try{
   const r=await h.api('hva4DeviceReviewGet');
   if(r.schemaVersion!=='HVA4-DEVREVIEW-1'||!Array.isArray(r.reviews))throw Error('Máy chủ chưa hỗ trợ nhận xét theo tháng của lãnh đạo.');
   enabled=!!r.meta&&r.meta.canReview===true;
   $('saveReview').disabled=!enabled;
   $('reviewNote').textContent=enabled?'Máy chủ đã xác nhận quyền nhận xét của BGH.':'Đã tải nhận xét; tài khoản này chỉ có quyền xem.';
   const old=document.getElementById('deviceReviewHistory');if(old)old.remove();
   const box=document.createElement('div');box.id='deviceReviewHistory';box.className='tablebox';
   $('reviewNote').after(box);
   h.table('deviceReviewHistory',['Tháng','Người nhận xét','Ý kiến','Thời điểm xác nhận'],r.reviews.map(v=>[v.month,v.reviewer,v.comment,v.reviewedAt]));
 }catch(e){$('reviewNote').textContent='Chưa kết nối phần nhận xét lãnh đạo: '+e.message}
}
async function save(){
 if(!enabled)return;
 const month=$('reviewMonth').value,comment=$('reviewText').value.trim();
 if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||!comment){$('reviewNote').textContent='Cần chọn tháng và nhập ý kiến nhận xét.';return}
 if(!w.confirm('Xác nhận gửi nhận xét tháng '+month+' lên máy chủ?'))return;
 $('saveReview').disabled=true;
 try{
   const r=await h.api('hva4DeviceReviewSave',{month,comment});
   if(r.schemaVersion!=='HVA4-DEVREVIEW-1')throw Error('Máy chủ không xác nhận việc ghi nhận xét.');
   $('reviewText').value='';await check();h.status(r.message||'Máy chủ đã xác nhận nhận xét.','ok')
 }catch(e){$('reviewNote').textContent=e.message;$('saveReview').disabled=!enabled}
}
$('saveReview').onclick=save;$('refreshReview').onclick=check;check();
})(window);