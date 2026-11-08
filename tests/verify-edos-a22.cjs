/**
 * Kiểm thử 22 biểu mẫu A: cấu trúc + nghiệp vụ Backend mô phỏng KHÔNG ghi Google Sheets thật.
 * node tests/verify-edos-a22.cjs
 */
function verify(files){
 const defSrc=files['NVS_A22_Definitions.js'],ctl=files['NVS_A22_Controller.js'],page=files['NVS_BieuMau_NghiepVu.html'],nvs=files['NghiepVu.html'],dh=files['DieuHanh.html'],inbox=files['NVS_A22_HopTiepNhan.html'],gs=files['backend/HVA_NVS_A22_MODULE.gs'];
 const c=[],check=(name,ok)=>c.push({name,pass:!!ok});
 const m={exports:{}};new Function('module','exports',defSrc)(m,m.exports);const defs=m.exports;
 const codes=Object.keys(defs);
 const links=[...nvs.matchAll(/href="\.\/NVS_BieuMau_NghiepVu\.html\?code=([^"]+)"/g)].map(x=>x[1]);
 check('22 cấu hình duy nhất',codes.length===22&&codes.length===new Set(codes).size);
 check('22 đường dẫn từ NVS',links.length===22&&links.length===new Set(links).size&&links.every(x=>Object.prototype.hasOwnProperty.call(defs,x)));
 check('111 yêu cầu bắt buộc',Object.values(defs).reduce((n,x)=>n+x.fields.filter(f=>f.required).length,0)===111);
 check('Mỗi biểu mẫu có trường riêng',Object.values(defs).every(x=>x.fields.length>=4&&x.fields.some(f=>f.required)));
 check('Không trùng trường trong biểu mẫu',Object.values(defs).every(x=>x.fields.length===new Set(x.fields.map(f=>f.key)).size));
 check('Mọi loại trường được hỗ trợ',Object.values(defs).every(x=>x.fields.every(f=>['text','number','date','url','textarea','select'].includes(f.type))));
 check('Các danh mục select có lựa chọn',Object.values(defs).every(x=>x.fields.filter(f=>f.type==='select').every(f=>f.options.length>0)));
 check('Trang dùng chung có khối trường riêng',page.includes('id="specialFields"')&&page.includes('id="specialHint"'));
 check('Không đổi đường dẫn nghiệp vụ PASS',nvs.includes('href="./BC_ChuNhiem.html"')&&nvs.includes('href="./BC_DayThemHocThem.html"'));
 check('Giữ tải xuất JSON và nhập bản nháp cũ',ctl.includes('HVA-A22-DRAFT-2')&&ctl.includes('HVA-DRAFT-1')&&page.includes('id="import"'));
 check('Có kiểm tra ngày và liên kết',ctl.includes("extras.tuNgay>extras.denNgay")&&ctl.includes('function safeUrl'));
 check('In PDF từ trình duyệt',page.includes('id="print"')&&ctl.includes('window.print()'));
 check('Nút nộp không tự bật khi thiếu Backend',page.includes('id="send" disabled')&&ctl.includes("r.supported!==true"));
 check('Nộp cần mã hồ sơ và người nhận',ctl.includes('!r.recordId||!r.bghCount||!r.ccCount'));
 check('Chống gửi trùng sau khi đã nhận mã',ctl.includes('submittedId=r.recordId')&&ctl.includes('btn.disabled=!canSubmit||!!submittedId'));
 check('Lưu trong phiên, không tự đưa dữ liệu lên mạng',ctl.includes('sessionStorage.setItem(storageKey()')&&ctl.includes("if(!namePart())"));
 check('Xem trước dùng textContent, không render HTML từ user',ctl.includes("by('preview').textContent=linesFor"));
 check('Hộp tiếp nhận có kiểm tra phiên, không dữ liệu giả',inbox.includes("nvsA22List")&&inbox.includes("nvsA22Get")&&inbox.includes("sessionToken:token()"));
 check('Hộp tiếp nhận có lối vào Điều hành',dh.includes('href="./NVS_A22_HopTiepNhan.html"')&&dh.includes('7 nhóm · 24 chức năng'));
 check('Backend A22 không đè doPost',!/\bfunction\s+doPost\s*\(/.test(gs)&&!/\bfunction\s+doGet\s*\(/.test(gs));
 check('Backend có xác thực session và kiểm tra nhân sự',gs.includes('const actor=nvsActor_(p||{})')&&gs.includes("nvsGetPeople_()"));
 check('Backend có kiểm tra mã nghiệp vụ và trường bắt buộc',gs.includes("rule.required.includes(k)")&&gs.includes('NVS_A22_RULES_'));
 check('Backend có kiểm tra vai trò nhận và quyền xem',gs.includes("const cc=people.filter")&&gs.includes("throw Error('Tài khoản không có quyền đọc hồ sơ.')"));
 check('Backend chống gửi trùng',gs.includes('r[1]===doc.requestId'));
 check('Backend không dùng API key cố định',!/AIza[0-9A-Za-z_-]{25,}/.test(gs));
 for(const [p,s]of [['NVS_A22_Controller.js',ctl],['backend/HVA_NVS_A22_MODULE.gs',gs]]){
   let ok=true;try{new Function(s)}catch(_){ok=false}check('Cú pháp '+p,ok);
 }
 let inboxJS=true;try{const scripts=[...inbox.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];for(const z of scripts)if(!/\bsrc=/.test(z[1]))new Function(z[2]);}catch(_){inboxJS=false}
 check('Cú pháp hộp tiếp nhận',inboxJS);
 return{pass:c.every(x=>x.pass),passed:c.filter(x=>x.pass).length,total:c.length,failed:c.filter(x=>!x.pass),checks:c};
}
module.exports={verify};
if(require.main===module){
 const fs=require('node:fs'),p=require('node:path'),names=['NVS_A22_Definitions.js','NVS_A22_Controller.js','NVS_BieuMau_NghiepVu.html','NghiepVu.html','DieuHanh.html','NVS_A22_HopTiepNhan.html','backend/HVA_NVS_A22_MODULE.gs'];
 const files=Object.fromEntries(names.map(n=>[n,fs.readFileSync(p.join(__dirname,'..',n),'utf8')]));
 const result=verify(files);console.log(JSON.stringify(result,null,2));process.exitCode=result.pass?0:1;
}
