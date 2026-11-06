/* HVA – Nhật ký công tác / trực lãnh đạo; bản thử nghiệm. Không ghi dữ liệu vào Backend. */
(function(){'use strict';
const mode=document.body.dataset.journalMode;if(!['congtac','tructiep'].includes(mode))return;
const $=id=>document.getElementById(id),isDuty=mode==='tructiep';
let recorder=null,stream=null,chunks=[],audioURL='',audioBlob=null,drafts=[],aiBusy=false;
const status=s=>{$('journal-status').textContent=s;};
const field=id=>String($(id)?.value||'').trim();
const audio=$('record-playback');
function revokeAudio(){if(audioURL){URL.revokeObjectURL(audioURL);audioURL='';}audio.removeAttribute('src');audio.load();}
function showAudio(blob){revokeAudio();audioBlob=blob;audioURL=URL.createObjectURL(blob);audio.src=audioURL;audio.hidden=false;$('download-audio').disabled=false;}
function stopTracks(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}}
async function startRecording(){
 if(recorder&&recorder.state==='recording')return;
 if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){status('Trình duyệt hoặc kết nối không hỗ trợ ghi âm an toàn. Có thể tải tệp âm thanh hoặc nhập bản chuyển lời nói.');return}
 if(!$('audio-notice').checked){status('Cần xác nhận đã thông báo và có cơ sở phù hợp để ghi âm buổi làm việc.');return}
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  chunks=[];audioBlob=null;revokeAudio();audio.hidden=true;$('download-audio').disabled=true;
  recorder=new MediaRecorder(stream);recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
  recorder.onstop=()=>{const mime=recorder.mimeType||'audio/webm';if(chunks.length)showAudio(new Blob(chunks,{type:mime}));stopTracks();$('record-start').disabled=false;$('record-stop').disabled=true;status('Đã dừng ghi. Âm thanh chỉ nằm tại trình duyệt; chưa gửi máy chủ. Hãy nhập bản chuyển lời hoặc dùng dịch vụ chuyển lời được phép khi đã tích hợp.')};
  recorder.onerror=()=>{stopTracks();$('record-start').disabled=false;$('record-stop').disabled=true;status('Ghi âm gặp lỗi; vui lòng kiểm tra quyền micro.')};
  recorder.start(1000);$('record-start').disabled=true;$('record-stop').disabled=false;status('Đang ghi âm trên thiết bị… Hãy bấm Dừng ghi khi kết thúc.');
 }catch(e){stopTracks();status('Không thể bật micro: '+String(e.message||e).slice(0,180))}
}
function stopRecording(){if(recorder?.state==='recording')recorder.stop();}
function attachAudio(){const f=$('audio-file').files?.[0];if(!f)return;if(!/^(audio\/|video\/)/.test(f.type)&&!/\.(mp3|m4a|wav|ogg|webm|aac|mp4)$/i.test(f.name)){status('Chỉ nhận tệp âm thanh/ghi hình hợp lệ.');return}if(f.size>80*1024*1024){status('Tệp quá 80 MB. Vui lòng chọn bản ghi dung lượng nhỏ hơn.');return}showAudio(f);status('Đã chọn tệp ghi âm từ thiết bị; chưa tải lên máy chủ hoặc chuyển lời nói.');}
function downloadAudio(){if(!audioURL)return;const a=document.createElement('a');a.href=audioURL;a.download='HVA_NhatKy_'+new Date().toISOString().slice(0,10)+(audioBlob?.type.includes('mp4')?'.m4a':'.webm');a.click()}
function makeRecord(){
 return {type:isDuty?'NHẬT KÝ TRỰC LÃNH ĐẠO':'NHẬT KÝ CÔNG TÁC',
  date:field('work-date'),start:field('work-start'),end:field('work-end'),
  title:field('work-title'),chair:field('work-chair'),party:field('work-party'),
  location:field('work-location'),category:field('work-category'),
  content:field('edited-text'),actions:field('followup-text'),level:field('privacy-level'),
  transcript:field('transcript-text')};
}
function validate(d){if(!d.date||!d.title||!d.chair||!d.content)throw Error('Cần có ngày, nội dung/sự việc, người chủ trì/trực và bản nhật ký đã biên tập.');if(d.start&&d.end&&d.end<d.start)throw Error('Giờ kết thúc không thể trước giờ bắt đầu.');return d;}
function format(d){return [d.type,'TRƯỜNG THPT HÒA VANG','Ngày: '+(d.date||'—')+' | Thời gian: '+(d.start||'—')+' – '+(d.end||'—'),
'Người '+(isDuty?'trực':'chủ trì')+': '+(d.chair||'—'),'Đối tượng/Thành phần: '+(d.party||'—'),
'Địa điểm: '+(d.location||'—'),'Nội dung: '+(d.title||'—'),'Loại: '+(d.category||'—'),
'Phạm vi hồ sơ: '+(d.level||'—'),'','NỘI DUNG GHI NHẬN:',d.content||'—','','VIỆC CẦN TIẾP TỤC THEO DÕI:',d.actions||'Không có nội dung được xác nhận.','','BẢN DỰ THẢO – CHƯA GỬI / DUYỆT / LƯU TRÊN HVA–EDOS'].join('\n');}
function preview(){const d=makeRecord();$('preview-text').textContent=format(d);status('Đã cập nhật bản xem trước; nội dung chưa được phát hành.')}
function appendManual(){const t=field('transcript-text');if(!t){status('Chưa có văn bản chuyển lời nói.');return}
 const template=isDuty?'TÌNH HÌNH CA TRỰC:\n- Diễn biến:\n- Sự việc cần xử lý:\n- Biện pháp xử lý:\n- Việc bàn giao:':'NỘI DUNG BUỔI LÀM VIỆC:\n- Mục đích:\n- Ý kiến các bên:\n- Kết quả trao đổi:\n- Kết luận được xác nhận:';
 $('edited-text').value=template+'\n\nBẢN CHUYỂN LỜI CẦN BIÊN TẬP:\n'+t;preview();status('Đã chuyển văn bản sang vùng biên tập thủ công. Chưa sử dụng AI.');}
function cleanSource(t){return t.replace(/\s+/g,' ').trim();}
async function aiEdit(){
 if(aiBusy)return;const source=field('transcript-text');
 if(source.length<25){status('Cần nhập bản chuyển lời nói dài tối thiểu 25 ký tự.');return}
 if(!$('ai-consent').checked){status('Chỉ sử dụng trợ lý khi đã rà soát dữ liệu, xác nhận được phép gửi nội dung đến dịch vụ AI kết nối.');return}
 if(!window.HVA_Assistant_Shared?.ask){status('Chưa kết nối được Trợ lý dùng chung EDOS. Vẫn có thể biên tập thủ công.');return}
 if(source.length>2800){status('Bản chuyển lời dài; hiện chỉ hỗ trợ tối đa 2.800 ký tự mỗi lần xử lý. Hãy chọn đoạn phù hợp, không cắt bỏ thông tin nghiệp vụ quan trọng.');return}
 aiBusy=true;$('ai-edit').disabled=true;status('Đang yêu cầu Trợ lý biên tập bản chuyển lời…');
 const instruction=isDuty?'Nhật ký trực: tình hình ca trực; diễn biến; sự việc; cách xử lý; việc cần bàn giao.':'Nhật ký công tác: mục đích; ý kiến liên quan; nội dung trao đổi; kết quả và kết luận (nếu có).';
 try{
  const question=[
   'Hãy biên tập DỰ THẢO '+(isDuty?'nhật ký trực lãnh đạo':'nhật ký công tác')+' của THPT Hòa Vang bằng tiếng Việt hành chính, ngắn gọn, trung lập.',
   instruction,
   'Lược lời xã giao, khen ngoại hình, đùa vui và từ đệm KHÔNG LIÊN QUAN; không xóa nội dung có ý nghĩa trong phản ánh, khiếu nại, bất đồng hoặc sự việc cần xử lý.',
   'Phân biệt thông tin bên tham dự nêu, việc chưa xác minh, kết luận chính thức. Không tự tạo thành phần, số liệu, tên người, thời hạn, cam kết hoặc kết luận. Nếu thiếu, ghi Chưa xác định.',
   'Chỉ trả bản ghi rõ hai mục: I. NỘI DUNG NHẬT KÝ; II. VIỆC CẦN THEO DÕI (người phụ trách/hạn chỉ khi có trong nguồn). Không tuyên bố đã phê duyệt.',
   'BẢN CHUYỂN LỜI:\n'+cleanSource(source)
  ].join('\n').slice(0,3990);
  const result=await window.HVA_Assistant_Shared.ask({question,context:'Công việc'});
  $('edited-text').value=String(result||'');preview();status('Đã nhận bản biên tập AI. Cần đối chiếu với bản ghi và tự duyệt trước khi sử dụng. Chưa lưu Backend.');
 }catch(e){status('Không nhận được bản biên tập AI: '+String(e.message||e).slice(0,230))}
 finally{aiBusy=false;$('ai-edit').disabled=false}
}
function saveDraft(){try{const d=validate(makeRecord());if(!$('review-check').checked)throw Error('Cần xác nhận đã đối chiếu và rà soát nội dung dự thảo.');const id='NK-'+Date.now();drafts.unshift({id,record:d,createdAt:new Date().toISOString()});drafts=drafts.slice(0,15);renderDrafts();preview();status('Đã giữ bản nháp trong phiên trình duyệt. Chưa phê duyệt hoặc lưu trên máy chủ.')}catch(e){status(e.message)}}
function renderDrafts(){const box=$('draft-list');box.replaceChildren();if(!drafts.length){box.textContent='Chưa có bản nháp trong phiên.';return}drafts.forEach((d,i)=>{const item=document.createElement('div');item.className='draft-item';
const label=document.createElement('span');label.textContent=(i+1)+'. '+d.record.date+' · '+d.record.title;
const open=document.createElement('button');open.type='button';open.textContent='Mở';open.onclick=()=>{load(d.record);status('Đã mở bản nháp để rà soát.')};
const del=document.createElement('button');del.type='button';del.textContent='Xóa';del.onclick=()=>{drafts.splice(i,1);renderDrafts();status('Đã xóa bản nháp khỏi phiên.')};
item.append(label,open,del);box.append(item)})}
function load(d){const mapping={'work-date':'date','work-start':'start','work-end':'end','work-title':'title','work-chair':'chair','work-party':'party','work-location':'location','work-category':'category','edited-text':'content','followup-text':'actions','privacy-level':'level','transcript-text':'transcript'};for(const [input,key]of Object.entries(mapping))$(input).value=d[key]||'';$('review-check').checked=false;preview()}
function exportDraft(){try{const d=validate(makeRecord());if(!$('review-check').checked)throw Error('Cần xác nhận đã rà soát trước khi xuất.');const payload={status:'DRAFT_NOT_PUBLISHED',version:1,exportedAt:new Date().toISOString(),journal:d};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='HVA_'+mode+'_'+d.date+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Đã xuất JSON dự thảo. Không kèm tệp âm thanh; chưa gửi máy chủ.')}catch(e){status(e.message)}}
async function copy(){try{await navigator.clipboard.writeText(format(validate(makeRecord())));status('Đã sao chép bản nhật ký dự thảo.')}catch(e){status('Chưa thể sao chép: '+String(e.message||e).slice(0,120))}}
function clear(){if(!confirm('Xóa nội dung đang nhập và bản ghi âm tạm trong trang?'))return;stopRecording();for(const el of document.querySelectorAll('main input:not([type=checkbox]),main textarea,main select')){if(el.type==='file')el.value='';else if(el.tagName==='SELECT')el.selectedIndex=0;else el.value=''}document.querySelectorAll('main input[type=checkbox]').forEach(e=>e.checked=false);revokeAudio();audioBlob=null;audio.hidden=true;$('download-audio').disabled=true;$('work-date').value=new Date().toLocaleDateString('en-CA');$('preview-text').textContent='Chưa có nội dung.';status('Đã xóa nội dung đang nhập.')}
function init(){const today=new Date();$('work-date').value=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
 $('record-start').onclick=startRecording;$('record-stop').onclick=stopRecording;$('audio-file').onchange=attachAudio;$('download-audio').onclick=downloadAudio;
 $('manual-edit').onclick=appendManual;$('ai-edit').onclick=aiEdit;$('preview-btn').onclick=preview;$('draft-save').onclick=saveDraft;$('draft-export').onclick=exportDraft;$('draft-copy').onclick=copy;$('draft-clear').onclick=clear;
 $('record-stop').disabled=true;$('download-audio').disabled=true;audio.hidden=true;
 status('Giao diện sẵn sàng: ghi âm trên thiết bị và biên tập từ văn bản; chưa có tuyến chuyển âm thanh thành chữ hoặc lưu máy chủ.');
}
window.addEventListener('pagehide',()=>{if(recorder?.state==='recording')stopRecording();stopTracks();revokeAudio()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();