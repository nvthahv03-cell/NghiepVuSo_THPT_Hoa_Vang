/* HVA – Sổ ghi đầu bài thử nghiệm. Dữ liệu nằm trong phiên trình duyệt; chưa có Backend, OCR và duyệt thật. */
(()=>{'use strict';
const $=id=>document.getElementById(id),q=sel=>[...document.querySelectorAll(sel)];
const FIELDS=[
 ['date','Ngày'],['session','Buổi'],['period','Tiết'],['double','Loại tiết'],['subject','Môn học / Hoạt động GD'],['ppct','Tiết PPCT'],['teacher','Giáo viên'],
 ['lesson','Tên bài, nội dung công việc'],['absent','Tên HS vắng mặt'],['comment','Nhận xét của giáo viên'],['ht','Học tập'],['kl','Kỷ luật'],['vs','Vệ sinh'],['total','Tổng điểm'],['max','Điểm tối đa'],['rank','Xếp loại'],['signature','Xác nhận GV'],['state','Trạng thái']
];
const ROOT={rows:[],uploads:[],revision:0,history:[],active:null};let currentId='',images=[],busy=false,recognitionDrafts=[],recognitionSource='';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt=id=>String($(id)?.value||'').trim(),notify=s=>{$('notice').textContent=String(s)};
function isDouble(){return $('f-double').value==='2'}
function formatDate(date){if(!date)return'—';const [y,m,d]=date.split('-');return [d,m,y].join('/')}
function totals(){const mul=isDouble()?2:1;return{ht:10*mul,kl:10*mul,vs:5*mul,max:25*mul}}
function valueOrNull(x){return String(x).trim()===''?null:Number(x)}
function rowForm(){
 const cap=totals(),ht=valueOrNull(txt('f-ht')),kl=valueOrNull(txt('f-kl')),vs=valueOrNull(txt('f-vs'));
 const sum=[ht,kl,vs].every(Number.isFinite)?ht+kl+vs:null,manual=valueOrNull(txt('f-total'));
 const x={id:currentId||'SDB-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),date:txt('f-date'),session:txt('f-session'),period:txt('f-period'),double:txt('f-double'),
 subject:txt('f-subject'),ppct:txt('f-ppct'),teacher:txt('f-teacher'),lesson:txt('f-lesson'),absent:txt('f-absent'),comment:txt('f-comment'),ht,kl,vs,total:manual,max:cap.max,rank:txt('f-rank'),signature:txt('f-signature'),state:'Chờ xác nhận',
 source:txt('f-source'),observed:txt('f-observed'),warning:'',verifiedAt:'',createdAt:new Date().toISOString()};
 const warnings=[];
 if(!x.date||!x.period||!x.subject||!x.lesson)warnings.push('Thiếu ngày, tiết, môn hoặc bài dạy.');
 if(!/^\d{1,2}$/.test(x.period)||Number(x.period)<1||Number(x.period)>15)warnings.push('Số tiết không hợp lệ.');
 for(const [key,max]of [['ht',cap.ht],['kl',cap.kl],['vs',cap.vs]]){
  if(x[key]===null)warnings.push('Thiếu điểm '+key.toUpperCase()+'.');
  else if(!Number.isFinite(x[key])||x[key]<0||x[key]>max)warnings.push('Điểm '+key.toUpperCase()+' vượt giới hạn 0–'+max+'.');
 }
 if(manual===null)warnings.push('Chưa nhập tổng điểm ghi trong sổ.');
 else if(!Number.isFinite(manual)||manual<0||manual>cap.max)warnings.push('Tổng điểm ghi trong sổ nằm ngoài 0–'+cap.max+'.');
 if(sum!==null&&manual!==null&&sum!==manual)warnings.push('Tổng ghi trong sổ '+manual+' khác tổng thành phần '+sum+'.');
 if(x.observed==='Chưa rõ')warnings.push('Có thông tin nhận dạng chưa rõ; phải đối chiếu ảnh gốc.');
 x.warning=warnings.join(' ');return x;
}
function markHistory(action,id,details){ROOT.history.unshift({at:new Date().toISOString(),action,id,details:String(details||'').slice(0,250)});ROOT.history=ROOT.history.slice(0,200);ROOT.revision++}
function syncMax(){const cap=totals();$('limits').textContent='Thang điểm: HT '+cap.ht+' · KL '+cap.kl+' · VS '+cap.vs+' · Tối đa '+cap.max;scoreCheck()}
function scoreCheck(){
 const x=rowForm();
 $('score-hint').textContent=x.warning||'Tổng các điểm thành phần phù hợp với điểm ghi trong sổ.';
 $('score-hint').className='message '+(x.warning?'warn':'good');
}
function initDate(){const d=new Date(),date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');$('f-date').value=date}
function clearForm(){currentId='';q('[data-field]').forEach(el=>{if(el.tagName==='SELECT')el.selectedIndex=0;else el.value=''});initDate();$('f-double').value='1';$('f-observed').value='Đã đối chiếu';$('f-source').value='Nhập thủ công';syncMax();$('edit-mode').textContent='Đang thêm dòng mới';}
function save(){
 const r=rowForm();if(!r.date||!r.period||!r.subject||!r.lesson){notify('Cần có ngày, số tiết, môn học, nội dung bài dạy.');return}
 const dup=ROOT.rows.find(v=>v.id!==r.id&&v.date===r.date&&v.session===r.session&&v.period===r.period);
 if(dup&&!confirm('Ngày/buổi/tiết này đã có một dòng. Vẫn thêm dòng trùng để đối chiếu?'))return;
 const pos=ROOT.rows.findIndex(v=>v.id===r.id);if(pos>=0){
   const prev=ROOT.rows[pos];if(prev.state==='Đã đối chiếu (thử nghiệm)'&&!confirm('Dòng đã được đối chiếu thử. Sửa sẽ đưa về trạng thái Chờ xác nhận. Tiếp tục?'))return;
   r.createdAt=prev.createdAt;ROOT.rows[pos]=r;markHistory('Sửa dòng',r.id,'Hủy xác nhận thử và tạo phiên bản mới');
 }else{ROOT.rows.push(r);markHistory('Thêm dòng',r.id,r.date+' tiết '+r.period)}
 render();clearForm();notify(r.warning?'Đã giữ bản nháp có cảnh báo: '+r.warning:'Đã giữ bản nháp trong phiên. Chưa gửi EDOS.');
}
function edit(id){const r=ROOT.rows.find(x=>x.id===id);if(!r)return;currentId=id;const fields={date:'f-date',session:'f-session',period:'f-period',double:'f-double',subject:'f-subject',ppct:'f-ppct',teacher:'f-teacher',lesson:'f-lesson',absent:'f-absent',comment:'f-comment',ht:'f-ht',kl:'f-kl',vs:'f-vs',total:'f-total',rank:'f-rank',signature:'f-signature',source:'f-source',observed:'f-observed'};
 for(const [key,input]of Object.entries(fields))$(input).value=r[key]??'';
 $('edit-mode').textContent='Đang sửa dòng: '+formatDate(r.date)+' · tiết '+r.period;syncMax();window.scrollTo({top:200,behavior:'smooth'});
}
function verify(id){
 const r=ROOT.rows.find(x=>x.id===id);if(!r)return;
 if(r.warning){notify('Chưa thể xác nhận: '+r.warning);return}
 if(!$('pilot-confirm').checked){notify('Phải đánh dấu đã đối chiếu ảnh/sổ nguồn trước khi xác nhận thử.');return}
 if(!confirm('Xác nhận đã đối chiếu dòng với nguồn sổ thực tế? Đây chỉ là xác nhận thử trên trình duyệt, không phải phê duyệt EDOS.'))return;
 r.state='Đã đối chiếu (thử nghiệm)';r.verifiedAt=new Date().toISOString();markHistory('Đối chiếu thử',r.id,r.date+' tiết '+r.period);render();notify('Đã đánh dấu đối chiếu thử. Chưa có phê duyệt chính thức từ Backend.');
}
function del(id){if(!confirm('Xóa dòng khỏi bản thử trong phiên?'))return;ROOT.rows=ROOT.rows.filter(x=>x.id!==id);markHistory('Xóa dòng',id,'Bản nháp');render()}
function allRows(){return ROOT.rows.filter(r=>{const date=txt('filter-date'),teacher=txt('filter-teacher').toLowerCase(),subject=txt('filter-subject').toLowerCase(),state=txt('filter-state');return (!date||r.date===date)&&(!teacher||r.teacher.toLowerCase().includes(teacher))&&(!subject||r.subject.toLowerCase().includes(subject))&&(!state||r.state===state)}).sort((a,b)=>a.date.localeCompare(b.date)||a.session.localeCompare(b.session)||Number(a.period)-Number(b.period))}
function eligible(){return allRows().filter(r=>r.state==='Đã đối chiếu (thử nghiệm)'&&!r.warning)}
function value(r,key){if(key==='double')return r.double==='2'?'Tiết đôi':'Tiết đơn';if(key==='date')return formatDate(r.date);if(['ht','kl','vs','total','max'].includes(key))return r[key]===null?'':r[key];return r[key]??''}
function render(){
 const list=$('body-rows');list.replaceChildren();const rows=allRows();
 rows.forEach((r,i)=>{const tr=document.createElement('tr');const add=(v)=>{const td=document.createElement('td');td.textContent=String(v??'');tr.append(td)};
 add(i+1);for(const k of ['date','session','period','double','subject','ppct','teacher','lesson','absent','ht','kl','vs','total','max','rank','state'])add(value(r,k));
 const td=document.createElement('td');td.className='row-tools';
 for(const [name,fn]of [['Sửa',()=>edit(r.id)],['Đối chiếu',()=>verify(r.id)],['Xóa',()=>del(r.id)]]){const b=document.createElement('button');b.type='button';b.textContent=name;b.onclick=fn;td.append(b)}tr.append(td);if(r.warning){tr.classList.add('issue');tr.title=r.warning;}list.append(tr)});
 $('row-count').textContent=rows.length+' dòng · '+eligible().length+' dòng đã đối chiếu thử';
 const available=eligible(),earned=available.reduce((s,r)=>s+(r.total||0),0),possible=available.reduce((s,r)=>s+r.max,0);
 $('stats-points').textContent=earned+'/'+possible;$('stats-lessons').textContent=available.length;$('stats-absent').textContent=available.filter(x=>x.absent.trim()).length+' dòng có ghi vắng';
 $('stats-warning').textContent=ROOT.rows.filter(x=>x.warning).length+' dòng cần kiểm tra';
 const hist=$('history');hist.replaceChildren();ROOT.history.slice(0,20).forEach(h=>{const p=document.createElement('p');p.textContent=new Date(h.at).toLocaleString('vi-VN')+' · '+h.action+' · '+h.id;hist.append(p)});
 renderColumns();
}
function renderColumns(){const box=$('column-choices'),chosen=new Set(q('#column-choices input:checked').map(n=>n.value));if(box.childElementCount)return;FIELDS.forEach(([key,label])=>{const el=document.createElement('label');el.className='check';const inp=document.createElement('input');inp.type='checkbox';inp.value=key;inp.checked=['date','period','subject','teacher','ht','kl','vs','total','max','rank','state'].includes(key);el.append(inp,document.createTextNode(label));box.append(el)})}
function selected(){const keys=q('#column-choices input:checked').map(n=>n.value);if(!keys.length)throw Error('Cần chọn ít nhất một cột cần xuất.');return keys}
function rowsForExport(){const checked=$('approved-only').checked;return checked?eligible():allRows()}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000)}
// XLSX (ECMA-376) with inline strings and uncompressed ZIP entries; no CDN or external dependency.
function xml(v){return esc(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'')}
function colName(i){let x='';for(i++;i;i=Math.floor((i-1)/26))x=String.fromCharCode(65+(i-1)%26)+x;return x}
function worksheet(keys,rows){
 let xmlrows='<row r="1">'+keys.map((k,i)=>'<c r="'+colName(i)+'1" t="inlineStr"><is><t>'+xml(FIELDS.find(x=>x[0]===k)?.[1]||k)+'</t></is></c>').join('')+'</row>';
 rows.forEach((r,j)=>{let z=j+2;xmlrows+='<row r="'+z+'">'+keys.map((k,i)=>{const val=value(r,k),ref=colName(i)+z;if(['ht','kl','vs','total','max'].includes(k)&&val!==''&&Number.isFinite(Number(val)))return '<c r="'+ref+'"><v>'+Number(val)+'</v></c>';return '<c r="'+ref+'" t="inlineStr"><is><t>'+xml(val)+'</t></is></c>'}).join('')+'</row>'});
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="17"/><sheetData>'+xmlrows+'</sheetData><pageMargins left=".7" right=".7" top=".75" bottom=".75" header=".3" footer=".3"/></worksheet>';
}
function crc32(arr){let c=0xffffffff;for(let i=0;i<arr.length;i++){c^=arr[i];for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function zipFiles(entries){
 const enc=new TextEncoder(),chunks=[],central=[];let offset=0;const u16=x=>[x&255,(x>>>8)&255],u32=x=>[x&255,(x>>>8)&255,(x>>>16)&255,(x>>>24)&255];
 const append=a=>{chunks.push(a);offset+=a.length};
 for(const [name,contents]of entries){const n=enc.encode(name),b=enc.encode(contents),crc=crc32(b),start=offset;
 append(Uint8Array.from([...u32(0x04034b50),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(b.length),...u32(b.length),...u16(n.length),...u16(0)]));append(n);append(b);
 central.push(Uint8Array.from([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(b.length),...u32(b.length),...u16(n.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(start),...n]));}
 const cstart=offset;central.forEach(append);const csize=offset-cstart;append(Uint8Array.from([...u32(0x06054b50),...u16(0),...u16(0),...u16(entries.length),...u16(entries.length),...u32(csize),...u32(cstart),...u16(0)]));
 return new Blob(chunks,{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
function xlsx(keys,rows){
 const files=[
 ['[Content_Types].xml','<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
 ['_rels/.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
 ['xl/workbook.xml','<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="So dau bai" sheetId="1" r:id="rId1"/></sheets></workbook>'],
 ['xl/_rels/workbook.xml.rels','<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'],
 ['xl/worksheets/sheet1.xml',worksheet(keys,rows)]
 ];return zipFiles(files)
}
function exportExcel(){
 try{const keys=selected(),rows=rowsForExport();if(!rows.length)throw Error('Không có dòng phù hợp để xuất.');downloadBlob(xlsx(keys,rows),'SoDauBai_'+txt('scope-class')+'_'+txt('scope-week')+'_DU_THAO.xlsx');notify('Đã xuất XLSX thật với '+rows.length+' dòng. File từ bản thử, không phải thống kê EDOS chính thức.')}catch(e){notify(e.message)}
}
function printable(){
 const rows=rowsForExport();if(!rows.length)throw Error('Chưa có dòng phù hợp để in.');
 const only=$('approved-only').checked,paper=$('print-paper').value;
 const headingsLeft=['Ngày / tháng','Tiết','Môn học / HĐGD','Tiết PPCT','TÊN BÀI, NỘI DUNG CÔNG VIỆC'];
 const headingsRight=['TÊN HỌC SINH VẮNG MẶT','NHẬN XÉT CỦA GIÁO VIÊN','HT','KL','VS','Tổng ghi sổ','Xếp loại tiết học','Giáo viên ký tên'];
 const line=(vals)=>'<tr>'+vals.map(v=>'<td>'+esc(v??'').replace(/\n/g,'<br>')+'</td>').join('')+'</tr>';
 const left=rows.map(r=>line([formatDate(r.date)+' · '+r.session,r.period,r.subject,r.ppct,r.lesson])).join('');
 const right=rows.map(r=>line([r.absent,r.comment,r.ht??'',r.kl??'',r.vs??'',r.total??'',r.rank,r.signature])).join('');
 const table=(classes,heads,body)=>'<table class="'+classes+'"><thead><tr>'+heads.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+body+'</tbody></table>';
 const html='<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Sổ ghi đầu bài – bản đối chiếu</title><style>'+
 '@page{size:'+paper+' landscape;margin:11mm}*{box-sizing:border-box}body{font-family:"Times New Roman",serif;font-size:11pt;color:#000;margin:0}h1{text-align:center;margin:5px 0 3px;font-size:17pt}h2{text-align:center;font-size:11pt;margin:3px 0 8px}.sheet{width:100%}.spread{display:grid;grid-template-columns:1fr 1fr;gap:5mm;align-items:stretch}.page{border:1.2pt solid #000;padding:5mm 3mm;min-width:0;min-height:130mm}.pageheader{min-height:13mm;font-weight:bold;text-align:center;font-size:11pt}.page small{font-size:9pt}table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:'+(paper==='A3'?'10':'7.5')+'pt}th,td{border:1px solid #000;padding:4px 3px;vertical-align:top;overflow-wrap:anywhere}th{text-align:center;height:29px}td{min-height:18px}tr{break-inside:avoid;page-break-inside:avoid}thead{display:table-header-group}.left th:nth-child(1){width:18%}.left th:nth-child(2){width:8%}.left th:nth-child(3){width:21%}.left th:nth-child(4){width:11%}.left th:nth-child(5){width:42%}.right th:nth-child(1){width:20%}.right th:nth-child(2){width:24%}.right th:nth-child(3),.right th:nth-child(4),.right th:nth-child(5){width:7%}.right th:nth-child(6){width:10%}.right th:nth-child(7){width:10%}.right th:nth-child(8){width:15%}.draft{margin:7px 0;border:1px solid #555;padding:4px;text-align:center;font-weight:bold;font-size:9pt}.comment{padding:12px 0;border-bottom:1px dotted #888}.sign{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:17px;text-align:center}.sign b{display:block}.caption{text-align:center;margin:10px;color:#333;font-size:9pt}button{margin:8px;background:#eee;border:1px solid #777;padding:8px}@media print{button{display:none}.page{break-inside:avoid}.spread{break-inside:avoid}}'+
 '</style></head><body><div class="sheet"><p style="text-align:center;margin:4px">TRƯỜNG THPT HÒA VANG</p><h1>SỔ GHI ĐẦU BÀI</h1><h2>Lớp '+esc(txt('scope-class'))+' · Tuần '+esc(txt('scope-week'))+' · Năm học '+esc(txt('scope-year'))+'</h2><div class="draft">'+(only?'BẢN ĐỐI CHIẾU THỬ – CHƯA DUYỆT EDOS':'BẢN DỰ THẢO – CÓ DÒNG CHƯA ĐỐI CHIẾU')+'</div>'+
 '<div class="spread"><section class="page"><div class="pageheader">TRANG TRÁI · TÊN BÀI VÀ NỘI DUNG CÔNG VIỆC</div>'+table('left',headingsLeft,left)+'</section><section class="page"><div class="pageheader">TRANG PHẢI · NHẬN XÉT VÀ ĐIỂM TIẾT HỌC</div>'+table('right',headingsRight,right)+'</section></div>'+
 '<p class="caption">Các hàng ở hai trang cùng thứ tự, đối chiếu theo ngày và tiết. Chưa có xác nhận điện tử của nhà trường.</p><div class="comment"><b>Nhận xét của GVCN:</b> '+esc(txt('homeroom-note'))+'</div><div class="comment"><b>Nhận xét của Hiệu trưởng:</b> '+esc(txt('principal-note'))+'</div><div class="sign"><div><b>GIÁO VIÊN CHỦ NHIỆM</b><i>(Chưa ký xác nhận)</i></div><div><b>HIỆU TRƯỞNG</b><i>(Chưa ký xác nhận)</i></div></div></div></body></html>';
 return html;
}
function print(){try{const doc=printable(),win=window.open('','_blank');if(!win)throw Error('Trình duyệt chặn cửa sổ xem trước.');win.document.open();win.document.write(doc);win.document.close();win.focus();notify('Đã mở bản xem trước '+$('print-paper').value+'. Chọn In hoặc Lưu thành PDF trên trình duyệt. Chưa có file PDF server-side.')}catch(e){notify(e.message)}}
function addFiles(event){const files=[...(event?.target?.files||[])];if(!files.length)return;if(files.length>2){notify('Mỗi lượt chỉ nhận tối đa 2 ảnh/trang, hãy chọn lại.');return}for(const f of files){if(f.size>20*1024*1024){notify('Mỗi tệp không quá 20 MB.');return}if(!/^image\/(jpeg|png|webp)$/.test(f.type)&&!(f.type==='application/pdf'||/\.pdf$/i.test(f.name))){notify('Chỉ hỗ trợ ảnh JPG/PNG/WebP hoặc PDF.');return}}
 const capture=event?.target?.id==='source-camera';const merged=capture?[...images.map(x=>x.file),...files].slice(-2):files;images.forEach(x=>URL.revokeObjectURL(x.url));images=merged.map(f=>({file:f,url:URL.createObjectURL(f)}));recognitionDrafts=[];renderRecognition();
 const wrap=$('source-preview');wrap.replaceChildren();for(let i=0;i<images.length;i++){const im=images[i],box=document.createElement('div');box.className='source-card';const label=document.createElement('strong');label.textContent=(i===0?'Trang bên trái: ':'Trang bên phải: ')+im.file.name;box.append(label);if(im.file.type.startsWith('image/')){const img=document.createElement('img');img.src=im.url;img.alt=label.textContent;box.append(img)}else{const a=document.createElement('a');a.href=im.url;a.target='_blank';a.rel='noopener';a.textContent='Xem PDF đã chọn';box.append(a)}wrap.append(box)}
 notify('Đã nhận '+images.length+' tệp nguồn để đối chiếu thủ công. Chưa có nhận dạng chữ viết tự động hoặc ghép dòng. Ảnh chưa được tải lên Backend.');
}

/* Nhận dạng ảnh luôn là DỰ THẢO. Hàm cầu nối chỉ được cấp từ phiên EDOS đã xác thực.
   Không gửi ảnh qua một URL cố định hoặc giải mã khóa trên trang công khai. */
const OCR_FIELDS=['date','session','period','subject','ppct','lesson','absent','comment','ht','kl','vs','total','rank','signature'];
const OCR_TEXT=['date','session','period','subject','ppct','lesson','absent','comment','rank','signature'];
function recognizedValue(row,key){
 const v=row&&Object.prototype.hasOwnProperty.call(row,key)?row[key]:null;
 if(v==null)return '';
 if(['ht','kl','vs','total'].includes(key))return typeof v==='number'||/^\d+(\.\d+)?$/.test(String(v).trim())?String(v):'';
 return typeof v==='string'||typeof v==='number'?String(v):'';
}
function parseRecognized(result){
 if(!result||typeof result!=='object'||!Array.isArray(result.rows))throw Error('Phản hồi nhận dạng chưa đúng cấu trúc dữ liệu.');
 if(result.rows.length>40)throw Error('Chỉ xử lý tối đa 40 dòng mỗi lần.');if(!result.rows.length)throw Error('Chưa nhận dạng được dòng tiết học.');
 return result.rows.map((entry,i)=>{
  if(!entry||typeof entry!=='object'||Array.isArray(entry))throw Error('Dòng nhận dạng không hợp lệ.');
  const row={};for(const key of OCR_FIELDS)row[key]=recognizedValue(entry,key).slice(0,['lesson','comment','absent'].includes(key)?1200:180);
  row.double=entry.double===2||String(entry.double)==='2'?'2':'1';
  row.uncertain=Array.isArray(entry.uncertainFields)?entry.uncertainFields.filter(x=>OCR_FIELDS.includes(x)):[];
  row.uncertain=[...new Set(row.uncertain)];
  row.reviewed=false;row.index=i+1;row.sourceRefs=Array.isArray(entry.sourceRefs)?entry.sourceRefs.filter(x=>Number.isInteger(x)&&x>=0&&x<2):[];
  return row;
 });
}
function statusRecognition(){const e=$('ocr-status');if(e)e.textContent=recognitionDrafts.length?recognitionDrafts.length+' dòng nhận dạng chờ đối chiếu. Chưa dòng nào tự động được lưu.':'Chưa có bản nhận dạng. Ảnh nguồn chỉ nằm tại thiết bị cho đến khi được phép gửi qua cầu nối EDOS.';}
function renderRecognition(){
 const root=$('ocr-review');if(!root)return;root.replaceChildren();statusRecognition();
 recognitionDrafts.forEach((d,index)=>{
  const card=document.createElement('article');card.className='ocr-line';
  const title=document.createElement('div');title.className='ocr-heading';
  const heading=document.createElement('strong');heading.textContent='Dòng '+(index+1)+' · '+(d.date||'Ngày chưa rõ')+' · tiết '+(d.period||'chưa rõ');
  const risk=document.createElement('span');risk.className='pill';risk.textContent=d.uncertain.length?'Cần kiểm tra: '+d.uncertain.join(', '):'Cần xác nhận thủ công';
  title.append(heading,risk);
  const fields=document.createElement('div');fields.className='ocr-fields';
  const labels={date:'Ngày',session:'Buổi',period:'Tiết',subject:'Môn / Hoạt động GD',ppct:'Tiết PPCT',lesson:'Tên bài, nội dung công việc',absent:'Tên HS vắng mặt',comment:'Nhận xét GV',ht:'HT',kl:'KL',vs:'VS',total:'Tổng ghi sổ',rank:'Xếp loại',signature:'GV ký tên'};
  for(const key of OCR_FIELDS){
   const label=document.createElement('label');label.className='field '+(['lesson','comment','absent'].includes(key)?'wide':'');
   label.textContent=labels[key];
   const input=document.createElement('input');input.value=d[key]||'';input.setAttribute('aria-label',labels[key]+' dòng '+(index+1));
   if(d.uncertain.includes(key))input.classList.add('uncertain');input.addEventListener('input',()=>{d[key]=input.value;d.reviewed=false;});
   label.append(input);fields.append(label);
  }
  const actions=document.createElement('div');actions.className='buttons';
  const into=document.createElement('button');into.className='btn primary';into.textContent='ĐƯA DÒNG VÀO SỔ NHÁP';into.addEventListener('click',()=>stageRecognized(index));
  const remove=document.createElement('button');remove.className='btn';remove.textContent='BỎ DÒNG';remove.addEventListener('click',()=>{recognitionDrafts.splice(index,1);renderRecognition()});
  actions.append(into,remove);card.append(title,fields,actions);root.append(card);
 });
}
function stageRecognized(index){
 const d=recognitionDrafts[index];if(!d)return;
 if(!images.length){notify('Đã mất ảnh gốc; vui lòng chọn lại ảnh trước khi đối chiếu.');return}
 if(!confirm('Đã đối chiếu TỪNG CỘT của dòng với ảnh sổ gốc, kể cả điểm, chữ ký và tên HS vắng? Dữ liệu chỉ vào sổ NHÁP, chưa được duyệt.'))return;
 const keys={date:'f-date',session:'f-session',period:'f-period',subject:'f-subject',ppct:'f-ppct',lesson:'f-lesson',absent:'f-absent',comment:'f-comment',ht:'f-ht',kl:'f-kl',vs:'f-vs',total:'f-total',rank:'f-rank',signature:'f-signature'};
 clearForm();for(const [k,id]of Object.entries(keys))$(id).value=d[k]??'';
 $('f-double').value=d.double||'1';$('f-source').value='Đối chiếu từ ảnh scan';
 $('f-observed').value=d.uncertain.length?'Chưa rõ':'Đã đối chiếu';
 syncMax();const x=rowForm();
 if(x.warning){notify('Đã chuyển vào BIỂU MẪU NHẬP để sửa các điểm chưa khớp: '+x.warning+' Hãy giữ số ghi trong ảnh, không tự điều chỉnh.');window.scrollTo({top:200,behavior:'smooth'});return}
 // Since user has inspected each image cell and confirmed, save as a non-approved draft only.
 const clash=ROOT.rows.find(y=>y.date===x.date&&y.session===x.session&&y.period===x.period);
 if(clash){notify('Trùng ngày/buổi/tiết đã có trong sổ. Đã điền vào biểu mẫu để thầy đối chiếu; không tự ghi đè.');window.scrollTo({top:200,behavior:'smooth'});return}
 x.source='Đối chiếu từ ảnh scan';x.observed='Đã đối chiếu';x.state='Chờ xác nhận';x.warning='';
 ROOT.rows.push(x);markHistory('Chuyển OCR vào nháp',x.id,'Ảnh trong phiên · đối chiếu bằng người phụ trách · chưa phê duyệt');
 recognitionDrafts.splice(index,1);renderRecognition();render();
 notify('Đã đưa 1 dòng vào sổ NHÁP. Chưa tính thi đua hay phê duyệt chính thức.');
}
async function recognize(){
 if(busy)return;
 if(!images.length){notify('Chưa có ảnh hoặc tệp PDF của sổ giấy.');return}
 if(!$('ocr-permission').checked){notify('Cần xác nhận quyền xử lý và gửi ảnh chứa thông tin học sinh tới dịch vụ nhận dạng được nhà trường phê duyệt.');return}
 const bridge=window.HVA_SDB_AUTHORIZED_RECOGNIZE;
 if(typeof bridge!=='function'){notify('Chưa có kết nối nhận dạng ảnh từ Backend EDOS được xác thực. Có thể dùng phần nhập thủ công; không tạo dữ liệu giả.');return}
 busy=true;$('capture-ocr').disabled=true;notify('Đang nhận dạng bản chụp qua kết nối đã xác thực…');
 try{
  const context={schoolYear:txt('scope-year'),className:txt('scope-class'),week:txt('scope-week'),form:'HVA_SDB_PAPER_V1',draftOnly:true};
  const result=await bridge(images.map(x=>x.file),context);
  const rows=parseRecognized(result);
  recognitionDrafts=rows;recognitionSource=new Date().toISOString();renderRecognition();
  notify('Đã nhận '+rows.length+' dòng NHÁP từ Trợ lý. Bắt buộc đối chiếu từng dòng với ảnh trước khi đưa vào sổ.');
 }catch(e){notify('Không nhận dạng được ảnh: '+String(e&&e.message||e).slice(0,180))}
 finally{busy=false;$('capture-ocr').disabled=false}
}

function demoImport(){if(ROOT.rows.length&&!confirm('Dữ liệu đang có sẽ bị thay thế bằng dữ liệu thử nghiệm. Tiếp tục?'))return;ROOT.rows=[
 {id:'MO-01',date:'2026-11-02',session:'Sáng',period:'1',double:'1',subject:'Toán',ppct:'01',teacher:'GV mẫu A',lesson:'Hàm số – luyện tập',absent:'',comment:'Tham gia học tập',ht:10,kl:10,vs:5,total:25,max:25,rank:'Tốt',signature:'Đã ghi (mẫu)',state:'Chờ xác nhận',source:'Dữ liệu minh họa',observed:'Đã đối chiếu',warning:'',verifiedAt:'',createdAt:new Date().toISOString()},
 {id:'MO-02',date:'2026-11-02',session:'Sáng',period:'2',double:'2',subject:'Ngữ văn',ppct:'02',teacher:'GV mẫu B',lesson:'Đọc hiểu văn bản',absent:'1 (minh họa)',comment:'Có ghi nhận',ht:20,kl:20,vs:10,total:50,max:50,rank:'Tốt',signature:'Đã ghi (mẫu)',state:'Chờ xác nhận',source:'Dữ liệu minh họa',observed:'Đã đối chiếu',warning:'',verifiedAt:'',createdAt:new Date().toISOString()}
 ];markHistory('Nạp dữ liệu thử','MO-01 / MO-02','02 dòng minh họa, không phải dữ liệu thật');render();notify('Đã nạp 2 dòng hoàn toàn minh họa, không phải dữ liệu Sổ ghi đầu bài của trường.')}
function exportBackup(){const payload={status:'LOCAL_TEST_NOT_OFFICIAL',scope:{year:txt('scope-year'),class:txt('scope-class'),week:txt('scope-week')},rows:ROOT.rows,history:ROOT.history,generatedAt:new Date().toISOString()};downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'}),'SoDauBai_BanNhap_DuLieuThu.json');notify('Đã xuất bản nháp JSON. Chú ý bảo vệ dữ liệu khi lưu.')}
function init(){
 const date=new Date();$('scope-year').value=date.getMonth()>=7?date.getFullYear()+'–'+(date.getFullYear()+1):(date.getFullYear()-1)+'–'+date.getFullYear();$('scope-class').value='12/9';$('scope-week').value='1';
 clearForm();for(const id of ['f-ht','f-kl','f-vs','f-total','f-date','f-period','f-double'])$(id).addEventListener('input',syncMax);
 $('save-row').onclick=save;$('clear-row').onclick=clearForm;$('load-demo').onclick=demoImport;
 $('source-images').onchange=addFiles;$('source-camera').onchange=addFiles;$('excel-export').onclick=exportExcel;$('print-book').onclick=print;$('preview-book').onclick=print;$('backup-export').onclick=exportBackup;
 for(const id of ['filter-date','filter-teacher','filter-subject','filter-state'])$(id).addEventListener('input',render);
 $('capture-ocr').onclick=recognize;renderRecognition();
 render();window.addEventListener('pagehide',()=>images.forEach(im=>URL.revokeObjectURL(im.url)));
 notify('Sẵn sàng thử nghiệm 1 lớp/1 tuần. Dữ liệu chỉ tồn tại trong phiên và chưa có phê duyệt chính thức.');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();