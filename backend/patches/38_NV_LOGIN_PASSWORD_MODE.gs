/**
 * EDOS V5 | Tra cứu chế độ nhập mật khẩu theo tài khoản.
 * Router POST: if(action==='getLoginPasswordMode')return hvaLoginPasswordMode_(payload);
 * Không định nghĩa doGet/doPost, không trả dữ liệu nhân sự, mật khẩu, salt hoặc hash.
 * Lưu ý: Trạng thái thay đổi mật khẩu là một bit thông tin nhạy cảm;
 * hạn chế tần suất và KHÔNG tiết lộ tài khoản có tồn tại hay không.
 */
function hvaLoginPasswordMode_(payload) {
  const username=String((payload||{}).username||(payload||{}).tenDangNhap||'').trim().toLowerCase();
  if(!username||username.length>80)
    return hvaJSON_({ok:false,success:false,message:'Tên đăng nhập không hợp lệ.'});
  try {
    // Hạn chế việc lặp truy vấn vô hạn theo tên tài khoản trên public endpoint.
    const cache=CacheService.getScriptCache();
    const key='HVA_LOGIN_MODE_RATE_'+Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,username)
    ).slice(0,48);
    const count=Number(cache.get(key)||0);
    if(count>=30)return hvaJSON_({ok:false,success:false,message:'Thao tác quá nhiều. Vui lòng thử lại sau.'});
    cache.put(key,String(count+1),60);

    // Tài khoản chưa có bản ghi đổi mật khẩu => mặc định 4 chữ số.
    // Với tài khoản không tồn tại, trả cùng chế độ INITIAL để không phân biệt tồn tại.
    const changed=!!nvsPwdFind_(username).record;
    return hvaJSON_({ok:true,success:true,mode:changed?'PERSONAL':'INITIAL'});
  }catch(err){
    console.error('HVA_LOGIN_MODE_LOOKUP',String(err&&err.message||err));
    return hvaJSON_({ok:false,success:false,message:'Chưa xác định được trạng thái mật khẩu.'});
  }
}