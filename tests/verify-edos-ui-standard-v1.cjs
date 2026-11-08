/** HVA–EDOS UI standard V1 regression, 09/11/2026. Run: node tests/verify-edos-ui-standard-v1.cjs */
function verify(f){
const c=[],check=(name,x)=>c.push({name,pass:!!x});
const pages=['DieuHanh.html','NghiepVu.html','QuanTri.html','NVS_TraCuu_CaNhan.html','NVS_QuanTri_TraCuu.html','KhoHocLieuSo.html','HuongDanSuDung.html'];
const css=f['HVA_EDOS_UI_Standard_V1.css']||'',d=f['DieuHanh.html']||'',n=f['NghiepVu.html']||'',q=f['QuanTri.html']||'',h=f['HuongDanSuDung.html']||'';
for(const page of pages){
 const s=f[page]||'';
 check('UI standard on '+page,s.includes('href="./HVA_EDOS_UI_Standard_V1.css"')&&s.includes('<body class="hva-ui-v1">'));
 check('Has viewport and proper main region '+page,/name="viewport"/.test(s)&&/<main\b/.test(s));
 check('No duplicate IDs in '+page,(()=>{const ids=[...s.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);return ids.length===new Set(ids).size})());
 let ok=true;for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc=/.test(m[1]))continue;try{new Function(m[2])}catch(e){ok=false}}
 check('Inline JavaScript syntactically valid '+page,ok);
}
check('CSS only applies to opt-in body class',css.includes('body.hva-ui-v1')&&!css.includes('html,body{'));
check('CSS includes keyboard focus style',css.includes(':focus-visible')&&css.includes('outline:3px'));
check('CSS ensures 44px tap targets',css.includes('min-height:44px'));
check('CSS includes mobile header wrapping',css.includes('hero-top,.hero-bar')&&css.includes('flex-wrap:wrap'));
check('CSS respects reduced motion',css.includes('prefers-reduced-motion:reduce'));
check('CSS does not rewrite root menus',!css.includes('#nvsAdminGate')&&!css.includes('#nvsWorkGate'));
check('Điều hành home button deterministic and no history.back()',d.includes('aria-label="Về trang chủ EDOS"')&&!d.includes('history.back()'));
check('Điều hành old navigation preserved',d.includes('href="./index.html"')&&d.includes('id="hvaQuanTriShortcut"'));
check('Điều hành seven groups and 24 tiles unchanged',(d.match(/<section class="group">/g)||[]).length===7&&(d.match(/<a class="tile(?: tile-review)?"/g)||[]).length===24);
check('Nghiệp vụ retains 3 tabs A/B/C',(n.match(/role="tab"/g)||[]).length===3);
check('Nghiệp vụ has help and homepage navigation',n.includes('href="./HuongDanSuDung.html"')&&n.includes('aria-label="Về trang chính"'));
check('Quản trị retains 6 groups and 19 items',q.includes('id="qtGroupTotal">6')&&q.includes('id="qtTotal">19'));
check('Quản trị still checks viewer role',q.includes('HVA_QUANTRI_ACCESS')&&q.includes('qt-auth-denied'));
check('Search still restricts role and requires backend',f['NVS_QuanTri_TraCuu.html'].includes('lookup-auth-denied')&&f['NVS_QuanTri_TraCuu.html'].includes('id="search"')&&f['NVS_QuanTri_TraCuu.html'].includes('disabled>Tra cứu hồ sơ'));
check('Học liệu số still marked as preview',f['KhoHocLieuSo.html'].includes('CHỜ TÍCH HỢP')&&f['KhoHocLieuSo.html'].includes('Xem bản thử'));
check('Help page has stable back to homepage',h.includes('href="./index.html"')&&h.includes('id="guideSearch"'));
check('Personal lookup still requires token',f['NVS_TraCuu_CaNhan.html'].includes("getItem('hvaSessionToken')"));
check('No PASS–LOCK module styled by new opt-in',!f['BC_ChuNhiem.html'].includes('HVA_EDOS_UI_Standard_V1.css')&&!f['BC_DayThemHocThem.html'].includes('HVA_EDOS_UI_Standard_V1.css'));
const a=f['A.1.1. NhiemVu_BaoCao.html']||'',training=f['TapHuan.html']||'';
check('A1.1 no longer references missing assistant script',!a.includes('src="./NVS_A1.assistant.js"'));
check('A1.1 disabled 3 AI buttons awaiting backend',([...a.matchAll(/<button\b[^>]*data-nvs-nav="ai"[^>]*>/g)]).length===3&&[...a.matchAll(/<button\b[^>]*data-nvs-nav="ai"[^>]*>/g)].every(m=>m[0].includes(' disabled')));
check('Training module links back to actual NghiepVu.html',training.includes('href="./NghiepVu.html"')&&!training.includes('NVS_NghiepVu.html'));
check('Header help links point to existing guide',pages.filter(x=>x!=='HuongDanSuDung.html').every(x=>(f[x]||'').includes('href="./HuongDanSuDung.html"')));
const {passed,total,failed}={passed:c.filter(x=>x.pass).length,total:c.length,failed:c.filter(x=>!x.pass)};
return{pass:passed===total,passed,total,failed,checks:c};
}
module.exports={verify};
if(require.main===module){const fs=require('node:fs'),path=require('node:path');const names=['DieuHanh.html','NghiepVu.html','QuanTri.html','NVS_TraCuu_CaNhan.html','NVS_QuanTri_TraCuu.html','KhoHocLieuSo.html','HuongDanSuDung.html','HVA_EDOS_UI_Standard_V1.css','BC_ChuNhiem.html','BC_DayThemHocThem.html','A.1.1. NhiemVu_BaoCao.html','TapHuan.html'];const f=Object.fromEntries(names.map(n=>[n,fs.readFileSync(path.join(__dirname,'..',n),'utf8')]));const r=verify(f);console.log(JSON.stringify(r,null,2));process.exitCode=r.pass?0:1;}
