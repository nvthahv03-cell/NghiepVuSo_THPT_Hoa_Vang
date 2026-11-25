/* HVA–EDOS: thông báo trạng thái mạng của thiết bị trong Header nghiệp vụ.
 * Không dùng nhãn này làm bằng chứng EDOS server đã xác thực / Google Meet đã kết nối.
 */
(()=>{'use strict';
 const el=document.getElementById('hvaHeaderConnectivity');if(!el)return;
 const label=el.querySelector('.hva-head-connectivity-label');
 function refresh(){
  const online=navigator.onLine!==false;
  el.dataset.network=online?'online':'offline';
  label.textContent=online?'Trực tuyến':'Ngoại tuyến';
  el.title=online?'Thiết bị có kết nối mạng; EDOS chưa được kiểm tra tại đây':'Thiết bị đang mất kết nối mạng';
 }
 window.addEventListener('online',refresh);
 window.addEventListener('offline',refresh);
 refresh();
})();