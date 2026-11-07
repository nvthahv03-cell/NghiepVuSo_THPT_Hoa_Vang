/**
 * Kiểm tra tĩnh trang chủ EDOS – chạy: node tests/verify-edos-home-footer.cjs
 * Không truy cập mạng, không cần tài khoản, không thay mã nguồn.
 */
function verify(html) {
  const issues = [];
  const checks = [];
  function check(name, ok) {
    checks.push({ name, pass: Boolean(ok) });
    if (!ok) issues.push(name);
  }
  const navs = [...html.matchAll(/<nav\b[^>]*class="[^"]*\bnvs-premium-nav\b[^"]*"[^>]*>[\s\S]*?<\/nav>/g)];
  check('Có đúng một thanh điều hướng dưới', navs.length === 1);
  const nav = navs[0]?.[0] || '';
  const buttons = [...nav.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
  const actions = buttons.map(m => (m[1].match(/data-nvs-nav="([^"]+)"/) || [])[1]);
  const labels = buttons.map(m => m[2].replace(/<[^>]*>/g, '').trim());
  check('Đúng bốn hành động Sổ/Hướng dẫn/Tiện ích/Chat',
    actions.join('|') === 'sdb|help|connect|chat');
  check('Đúng tên bốn nút',
    labels.join('|') === 'Sổ ĐB điện tử|Hướng dẫn sử dụng|Tiện ích số|HVA Chat');
  check('Giữ nguyên ID nút tiện ích', nav.includes('id="hvaDigitalUtilitiesToggle"'));
  check('Giữ nguyên ID nút trò chuyện', nav.includes('id="hvaChatToggle"'));
  check('Có một lớp CSS chuẩn hóa cuối', (html.match(/id="hva-footer-four-clean-20261106"/g)||[]).length===1);
  for (const id of ['edos-v37-footer-round-3d','hva-footer-icon-glyph-color-fix-20261105','hva-footer-four-icons-unified']) {
    check('Không còn CSS cũ '+id, !html.includes('id="'+id+'"'));
  }
  check('Không còn JS nhún chỉ để trang trí', !html.includes('id="edos-v36-footer-bounce-js"'));
  check('Bốn liên kết nghiệp vụ quan trọng còn trong trang',
    ['SoDauBai.html','HuongDanSuDung.html','hvaDigitalUtilitiesToggle','hvaChatToggle'].every(x => html.includes(x)));
  check('Không mất trạng thái trực tuyến', html.includes('id="hva-online-status-minimal"'));
  const styleTags = [...html.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi)];
  const scriptTags = [...html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi)];
  const styleIds = [...html.matchAll(/<style\b[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
  const duplicates = [...new Set(styleIds.filter((id, i) => styleIds.indexOf(id) !== i))];
  return { pass: issues.length === 0, checks, styleBlocks: styleTags.length,
    scriptBlocks: scriptTags.length, duplicatedStyleIds: duplicates, issues };
}
module.exports = { verify };
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');
  const html = fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
  const result = verify(html);
  console.log(JSON.stringify(result,null,2));
  process.exitCode = result.pass ? 0 : 1;
}
