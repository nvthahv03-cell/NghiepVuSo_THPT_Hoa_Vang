/* HVA – Hồ sơ kiểm tra nội bộ: chỉ số hóa bản giấy. Chưa có lưu trữ Backend. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
let docs=[],selectedId='',seq=0;
const types=['Kế hoạch','Quyết định','Biên bản','Báo cáo','Kết luận','Tài liệu theo dõi khắc phục','Minh chứng khác'];
const mandatory=['Kế hoạch','Biên bản','Báo cáo','Kết luận'];
const limit=30*1024*1024;
const state=s=>{$('status').textContent=s};
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function form(){return {title:$('case-title').value.trim(),period:$('case-period').value.trim(),code:$('case-code').value.trim(),owner:$('case-owner').value.trim(),privacy:$('case-privacy').value,description:$('case-description').value.trim()}}
function docForm(){return{type:$('doc-type').value,number:$('doc-number').value.trim(),date:$('doc-date').value,title:$('doc-title').value.trim(),signer:$('doc-signer').value.trim(),pages:$('doc-pages').value.trim(),quality:$('doc-quality').value,notes:$('doc-notes').value.trim()}}
function checkForm(d){if(!d.title||!d.period)throw Error('Cần nhập tên cuộc kiểm tra và năm học/đợt kiểm tra.');return d}
function add(){
 try{
  const base=checkForm(form()),meta=docForm(),file=$('doc-file').files?.[0];if(!file)throw Error('Cần chọn tệp PDF scan hoặc ảnh scan.');
  const isPDF=file.type==='application/pdf'||/\.pdf$/i.test(file.name);
  const isImage=['image/jpeg','image/png','image/webp'].includes(file.type)&&/\.(jpg|jpeg|png|webp)$/i.test(file.name);
  if(!isPDF&&!isImage)throw Error('Chỉ chọn PDF hoặc ảnh scan JPG/PNG/WebP.');
  if(file.size<=0||file.size>limit)throw Error('Tệp phải có dung lượng từ 1 byte đến 30 MB.');
  if(!meta.title||!meta.type)throw Error('Cần nhập loại tài liệu và trích yếu văn bản.');
  if(meta.pages&&(!/^[1-9]\d{0,3}$/.test(meta.pages)))throw Error('Số trang không hợp lệ.');
  const id='scan_'+(++seq);
  docs.push({id,meta,file,case:base,added:new Date().toISOString()});
  $('doc-file').value='';$('doc-number').value='';$('doc-title').value='';$('doc-date').value='';$('doc-signer').value='';$('doc-pages').value='';$('doc-notes').value='';
  render();state('Đã thêm tệp số hóa vào hồ sơ tạm trong trình duyệt. Tệp chưa được gửi lên máy chủ.');
 }catch(e){state(e.message)}
}
function render(){
 const list=$('doc-list');list.replaceChildren();
 for(const entry of docs){const article=document.createElement('article');article.className='docrow';
 const left=document.createElement('div');const h=document.createElement('strong');h.textContent=entry.meta.type+' · '+entry.meta.title;
 const sub=document.createElement('small');sub.textContent=[entry.meta.number,entry.meta.date,entry.file.name,formatSize(entry.file.size),entry.meta.quality].filter(Boolean).join('  |  ');
 left.append(h,sub);const btns=document.createElement('div');btns.className='docactions';
 const open=document.createElement('button');open.textContent='XEM BẢN SCAN';open.onclick=()=>view(entry);
 const down=document.createElement('button');down.textContent='TẢI BẢN GỐC';down.onclick=()=>download(entry);
 const remove=document.createElement('button');remove.textContent='BỎ KHỎI HỒ SƠ';remove.onclick=()=>{if(!confirm('Bỏ tài liệu này khỏi danh mục tạm?'))return;docs=docs.filter(x=>x.id!==entry.id);render();state('Đã bỏ tài liệu khỏi danh mục tạm; không xóa file gốc trên thiết bị.')};
 btns.append(open,down,remove);article.append(left,btns);list.append(article)}
 const counts=new Map(types.map(t=>[t,docs.filter(d=>d.meta.type===t).length]));
 const checks=$('checks');checks.replaceChildren();for(const t of mandatory){const b=document.createElement('span');const count=counts.get(t)||0;b.className='check '+(count?'has':'missing');b.textContent=(count?'✓ ':'○ ')+t+' ('+count+')';checks.append(b)}
 $('total-docs').textContent=docs.length+' tài liệu';$('doc-empty').hidden=docs.length>0;
}
function formatSize(v){return(v/1024/1024).toFixed(2)+' MB'}
function view(d){const url=URL.createObjectURL(d.file),w=window.open('','_blank');if(!w){URL.revokeObjectURL(url);state('Trình duyệt chặn cửa sổ xem trước. Hãy dùng Tải bản gốc.');return}
 const safe=esc(d.meta.title),mime=d.file.type;
 w.document.open();w.document.write('<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>'+safe+'</title><style>body{margin:0;background:#18293b;color:#fff;font-family:Arial}header{padding:12px}iframe,img{display:block;width:100%;height:calc(100vh - 60px);object-fit:contain;border:0}</style></head><body><header>BẢN SCAN NGUYÊN TRẠNG – '+safe+'</header>'+(mime.startsWith('image/')?'<img alt="Bản scan" src="'+url+'">':'<iframe title="Bản PDF" src="'+url+'"></iframe>')+'</body></html>');w.document.close();w.addEventListener('pagehide',()=>URL.revokeObjectURL(url));setTimeout(()=>URL.revokeObjectURL(url),120000);state('Đang mở bản scan trong cửa sổ xem trước.')}
function download(d){const url=URL.createObjectURL(d.file),a=document.createElement('a');a.href=url;a.download=d.file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function manifest(){
 const c=checkForm(form());if(!docs.length)throw Error('Chưa có bản scan nào trong hồ sơ.');
 return{status:'DIGITIZATION_DRAFT_NOT_ARCHIVED',case:c,createdAt:new Date().toISOString(),documents:docs.map((d,i)=>({order:i+1,...d.meta,fileName:d.file.name,bytes:d.file.size,mime:d.file.type,source:'Bản số hóa chọn từ thiết bị; chưa kiểm chứng tính pháp lý, chưa lưu máy chủ'})),missing:mandatory.filter(t=>!docs.some(d=>d.meta.type===t))};
}
function printable(){
 const data=manifest(),html=['<!doctype html><html lang="vi"><meta charset="utf-8"><title>Mục lục hồ sơ kiểm tra</title><style>@page{size:A4;margin:22mm 18mm 22mm 32mm}body{font-family:"Times New Roman",serif;font-size:13pt;color:#000}h1{text-align:center;font-size:16pt}h2{text-align:center;font-size:14pt;margin:4px 0 20px}p{margin:7px 0}table{border-collapse:collapse;width:100%;font-size:11pt}th,td{border:1px solid black;padding:6px;vertical-align:top;overflow-wrap:anywhere}thead{display:table-header-group}tr{break-inside:avoid}.watermark{color:#666;font-size:11pt;text-align:center;margin:12px 0}</style><body>',
 '<p style="text-align:center">TRƯỜNG THPT HÒA VANG</p><h1>MỤC LỤC HỒ SƠ KIỂM TRA NỘI BỘ</h1><h2>'+esc(data.case.title)+'</h2><p><b>Năm học/đợt:</b> '+esc(data.case.period)+'</p><p><b>Mã hồ sơ:</b> '+esc(data.case.code||'Chưa xác định')+'</p><p><b>Người/bộ phận phụ trách:</b> '+esc(data.case.owner||'Chưa xác định')+'</p><p><b>Phạm vi tiếp cận:</b> '+esc(data.case.privacy)+'</p>',
 '<div class="watermark">BẢN MỤC LỤC DỰ THẢO – CHƯA LƯU, CHƯA XÁC NHẬN HỒ SƠ</div><table><thead><tr><th>STT</th><th>Loại tài liệu</th><th>Số, ký hiệu</th><th>Ngày</th><th>Trích yếu</th><th>Trang</th><th>Đối chiếu</th></tr></thead><tbody>',
 ...data.documents.map(d=>'<tr><td>'+d.order+'</td><td>'+esc(d.type)+'</td><td>'+esc(d.number)+'</td><td>'+esc(d.date)+'</td><td>'+esc(d.title)+'</td><td>'+esc(d.pages)+'</td><td>'+esc(d.quality)+'</td></tr>'),
 '</tbody></table><p><b>Tình trạng tài liệu lõi:</b> '+esc(data.missing.length?'Chưa đủ: '+data.missing.join(', '):'Có đủ 4 loại cơ bản trong danh mục tạm; chưa xác minh nội dung')+'</p><p><i>Ghi chú: '+esc(data.case.description||'Không có')+'</i></p></body></html>'];
 return html.join('');
}
function print(){try{const html=printable(),w=window.open('','_blank');if(!w)throw Error('Hãy cho phép mở cửa sổ để in mục lục A4.');w.document.open();w.document.write(html);w.document.close();w.focus();state('Đã mở mục lục A4. Dùng lệnh In / Lưu thành PDF của trình duyệt. Đây là mục lục dự thảo, không phải văn bản đã ký.')}catch(e){state(e.message)}}
function exportMeta(){try{const m=manifest(),blob=new Blob([JSON.stringify(m,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='HVA_KTNB_MucLuc_DuThao.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);state('Đã xuất danh mục JSON dự thảo; không bao gồm các tệp PDF/ảnh scan.')}catch(e){state(e.message)}}
function init(){$('doc-type').replaceChildren(...types.map(t=>new Option(t,t)));$('case-privacy').value='Nội bộ người được phân quyền';$('add-doc').onclick=add;$('print-manifest').onclick=print;$('export-manifest').onclick=exportMeta;render();state('Sẵn sàng lập hồ sơ số hóa tạm. Chưa kết nối kho lưu trữ và phân quyền Backend.')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();