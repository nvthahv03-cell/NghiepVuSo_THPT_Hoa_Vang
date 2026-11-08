/**
 * EDOS homepage structural smoke regression.
 * node tests/verify-edos-home-smoke.cjs
 * Static checks ONLY; not a substitute for authenticated mobile/browser E2E.
 */
function verify(html) {
  const cases=[];
  const check=(label,pass)=>cases.push({label,pass:!!pass});
  const id=(s)=>new RegExp('\\bid="'+s+'"').test(html);
  const attr=(pattern)=>pattern.test(html);
  const src=(pattern)=>pattern.test(html);
  const ids=[...html.matchAll(/\\bid="([^"]+)"/g)].map(x=>x[1]);
  const repeated=[...new Set(ids.filter((s,i)=>ids.indexOf(s)!==i))];
  const styles=[...html.matchAll(/<style\\b([^>]*)>([\\s\\S]*?)<\\/style>/gi)];
  const scripts=[...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script>/gi)];
  const nav=(html.match(/<nav class="nvs-premium-nav"[\\s\\S]*?<\\/nav>/)||[])[0]||'';
  const buttons=[...nav.matchAll(/<button\\b([^>]*)>([\\s\\S]*?)<\\/button>/g)];
  const actions=buttons.map(x=>(x[1].match(/data-nvs-nav="([^"]+)"/)||[])[1]);
  const labels=buttons.map(x=>x[2].replace(/<[^>]+>/g,'').trim());
  const quick=(html.match(/<section class="nvs-quick"[\\s\\S]*?<\\/section>/)||[])[0]||'';
  const gateIds=['nvsAdminGate','nvsWorkGate','nvsLearningGate','nvsDocumentGate'];
  check('DOCTYPE và viewport',/^<!doctype html>/i.test(html.trimStart())&&/<meta[^>]+name="viewport"/i.test(html));
  check('Không trùng id HTML',repeated.length===0);
  check('Bốn cổng chính',gateIds.every(id));
  check('Điều hành đúng trang',/id="nvsAdminGate"[^>]+href="\\.\\/DieuHanh\\.html"/.test(html) || /href="\\.\\/DieuHanh\\.html"[^>]+id="nvsAdminGate"/.test(html));
  check('NVS đúng trang',/href="\\.\\/NghiepVu\\.html[^"]*"[^>]+id="nvsWorkGate"/.test(html)||/id="nvsWorkGate"[^>]+href="\\.\\/NghiepVu\\.html/.test(html));
  check('Kho văn bản đúng trang',/id="nvsDocumentGate"[^>]+href="\\.\\/VanBan_QuyDinh\\.html"/.test(html)||/href="\\.\\/VanBan_QuyDinh\\.html"[^>]+id="nvsDocumentGate"/.test(html));
  check('Học liệu số có trang đích',/id="nvsLearningGate"[^>]+href="\\.\\/KhoHocLieuSo\\.html"/.test(html)||/href="\\.\\/KhoHocLieuSo\\.html"[^>]+id="nvsLearningGate"/.test(html));
  check('Bốn tiện ích trên theo thứ tự',/id="nvsQuickWork"/.test(quick)&&/LichCongTac\\.html/.test(quick)&&/data-nvs-quick="notice"/.test(quick)&&/data-nvs-quick="survey"/.test(quick));
  check('Chi tiết và bình chọn có nơi hiển thị',id('nvsQuickDetail')&&id('nvsPollOverlay'));
  check('Bốn nút dưới đúng thứ tự',actions.join(',')==='sdb,help,connect,chat');
  check('Nhãn bốn nút không sai',labels.join('|')==='Sổ ĐB điện tử|Hướng dẫn sử dụng|Tiện ích số|HVA Chat');
  check('Icon chuẩn cho cả bốn nút',buttons.length===4&&buttons.every(x=>/<i class="bi bi-/.test(x[2])));
  check('Sổ đầu bài có điều hướng',/location\\.href='\\.\\/SoDauBai\\.html'/.test(html));
  check('Hướng dẫn có điều hướng',/location\\.href='\\.\\/HuongDanSuDung\\.html'/.test(html));
  check('Tiện ích có ID, panel và nút đóng',id('hvaDigitalUtilitiesToggle')&&id('hvaDigitalUtilities')&&id('hvaDigitalUtilitiesClose'));
  check('Tiện ích có xử lý click',/btn\\.addEventListener\\('click',event=>\\{event\\.stopImmediatePropagation\\(\\);open\\(\\);\\},true\\)/.test(html));
  check('Chat có ID, panel và nút đóng',id('hvaChatToggle')&&id('hvaChatPanel')&&id('hvaChatClose'));
  check('Trợ lý và nhắc nhở tồn tại',id('edosAssistantOpen')&&id('nvsOpenRemind'));
  check('Đăng nhập và đăng xuất còn trong mã',/hvaSessionToken/.test(html)&&/logoutHVA/.test(html));
  check('Trạng thái trực tuyến và CSS tối giản',src(/hva-pro-online-dot/)&&src(/id="hva-online-status-minimal"/));
  check('Còn đúng một CSS footer chuẩn',styles.filter(x=>/id="hva-footer-four-clean-20261106"/.test(x[1])).length===1);
  const footer=styles.find(x=>/id="hva-footer-four-clean-20261106"/.test(x[1]))?.[2]||'';
  check('Footer đủ bốn cột',footer.includes('repeat(4,minmax(0,1fr))'));
  check('Footer responsive mobile và 320px',footer.includes('@media(max-width:720px)')&&footer.includes('@media(max-width:360px)'));
  check('Footer có focus và giảm chuyển động',footer.includes(':focus-visible')&&footer.includes('prefers-reduced-motion'));
  check('Không trùng ID CSS',new Set(styles.map(x=>(x[1].match(/id="([^"]+)"/)||[])[1]).filter(Boolean)).size===styles.filter(x=>/id="/.test(x[1])).length);
  check('Không còn script hiệu ứng nhún thừa',!scripts.some(x=>/id="edos-v36-footer-bounce-js"/.test(x[1])));
  check('Không có module script bị xóa',scripts.some(x=>/id="nvs-premium-nav-script"/.test(x[1]))&&scripts.some(x=>/id="hva-chat-header-interaction"/.test(x[1]))&&scripts.some(x=>/id="hva-digital-utilities-bridge"/.test(x[1])));
  const fail=cases.filter(x=>!x.pass);
  return {pass:!fail.length,total:cases.length,passed:cases.length-fail.length,failed:fail,checks:cases,styleBlocks:styles.length,scriptBlocks:scripts.length};
}
module.exports={verify};
if(require.main===module){
  const fs=require('node:fs');
  const path=require('node:path');
  const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const result=verify(html);
  console.log(JSON.stringify(result,null,2));
  process.exitCode=result.pass?0:1;
}
