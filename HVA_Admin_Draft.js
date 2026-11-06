/* HVA EDOS - Quản trị, chất lượng: mẫu thao tác giao diện, không có API ghi dữ liệu */
(()=>{'use strict';
const cfg=window.HVA_ADMIN_PAGE;if(!cfg)return;
const $=id=>document.getElementById(id);
let records=[],current=null;
const say=v=>$('message').textContent=v;
function values(){const result={};for(const f of cfg.fields){const el=$(f.id);result[f.id]=el?.value?.trim()||''}return result}
function validate(v){for(const f of cfg.fields)if(f.required&&!v[f.id])throw Error('Cần nhập: '+f.name);if(v.start&&v.end&&v.start>v.end)throw Error('Ngày bắt đầu phải trước ngày kết thúc');return v}
function view(){
 const v=values(),body=[cfg.title.toUpperCase(),'ĐƠN VỊ: TRƯỜNG THPT HÒA VANG','',...cfg.fields.map(f=>f.name+': '+(v[f.id]||'—')),'','TRẠNG THÁI: '+$('stage').value,'GHI CHÚ: '+($('notes').value.trim()||'—'),''];
 body.push('BẢN XEM TRƯỚC - CHƯA PHÁT HÀNH, CHƯA CÓ HIỆU LỰC TRÊN HỆ THỐNG.');
 $('preview').textContent=body.join('\n');say('Đã tổng hợp bản xem trước. Chưa ghi hoặc phê duyệt trên máy chủ.');
}
function draw(){
 const box=$('records');box.replaceChildren();
 if(!records.length){box.textContent='Chưa có bản nháp trong phiên.';return}
 records.forEach((r,i)=>{const row=document.createElement('div');row.className='rec';
 const summary=document.createElement('div');summary.textContent=(i+1)+'. '+(r.values.title||r.values.code||r.values.period||cfg.title)+' · '+r.createdAt;
 const open=document.createElement('button');open.textContent='MỞ';open.className='small';open.onclick=()=>{for(const f of cfg.fields)$(f.id).value=r.values[f.id]||'';$('stage').value=r.stage;$('notes').value=r.notes;view()};
 const del=document.createElement('button');del.textContent='XÓA';del.className='small';del.onclick=()=>{records.splice(i,1);draw();say('Đã xóa bản nháp trong phiên.')};
 row.append(summary,open,del);box.append(row)})
}
function save(){try{const v=validate(values());if(cfg.sensitive&&!$('consent').checked)throw Error('Cần xác nhận không nhập dữ liệu nhạy cảm vào bản thử nghiệm.');records.unshift({values:v,stage:$('stage').value,notes:$('notes').value.trim(),createdAt:new Date().toLocaleString('vi-VN')});records=records.slice(0,20);draw();view();say('Đã giữ bản nháp trong bộ nhớ trang; sẽ mất khi tải lại, chưa gửi Backend.')}catch(e){say(e.message)}}
function reset(){if(!confirm('Xóa dữ liệu đang nhập?'))return;for(const f of cfg.fields)$(f.id).value='';$('notes').value='';$('stage').selectedIndex=0;$('preview').textContent='Chưa có bản xem trước.';say('Đã làm mới ô nhập.')}
function exportJson(){if(!records.length){say('Chưa có bản nháp để xuất.');return}const data={module:cfg.id,purpose:'DRAFT_NOT_PUBLISHED',exportedAt:new Date().toISOString(),records};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='HVA_'+cfg.id+'_BanNhap.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);say('Đã xuất JSON dự thảo. Không có thay đổi nào trên EDOS.')}
async function copy(){try{await navigator.clipboard.writeText($('preview').textContent);say('Đã sao chép bản xem trước.')}catch(_){say('Không sao chép tự động được. Vui lòng chọn và sao chép thủ công.')}}
function init(){
 $('intro').textContent=cfg.description;$('statusTitle').textContent=cfg.notice;
 const fields=$('fields');
 for(const f of cfg.fields){const label=document.createElement('label');label.className='field'+(f.type==='textarea'?' wide':'');const title=document.createElement('span');title.textContent=f.name+(f.required?' *':'');
 let control;
 if(f.type==='select'){control=document.createElement('select');control.append(new Option('— Chọn —',''),...f.options.map(x=>new Option(x,x)))}
 else if(f.type==='textarea'){control=document.createElement('textarea');control.rows=3;control.maxLength=2000}
 else{control=document.createElement('input');control.type=f.type||'text';control.maxLength=350}
 control.id=f.id;control.autocomplete='off';label.append(title,control);fields.append(label)}
 for(const s of cfg.stages)$('stage').append(new Option(s,s));
 $('consentArea').hidden=!cfg.sensitive;
 $('previewBtn').onclick=view;$('saveBtn').onclick=save;$('resetBtn').onclick=reset;$('exportBtn').onclick=exportJson;$('copyBtn').onclick=copy;
 $('message').textContent='Sẵn sàng lập hồ sơ thử nghiệm. Chưa ghi nhận vào EDOS.';
 draw();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();