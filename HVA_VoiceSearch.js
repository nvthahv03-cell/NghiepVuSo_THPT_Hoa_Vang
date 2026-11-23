/* HVA–EDOS V5 | Micro tìm kiếm tiếng Việt dùng chung. Chỉ ghi âm khi người dùng bấm. */
(function(root){
'use strict';
if(root.HVA_VoiceSearch?.installed)return;
const SpeechRecognition=root.SpeechRecognition||root.webkitSpeechRecognition;
const css=document.createElement('style');
css.id='hva-voice-search-style-v1';
css.textContent=`
.hva-voice-field{position:relative!important;display:flex!important;align-items:center!important;min-width:0}
.hva-voice-field>input{min-width:0;flex:1!important;padding-right:42px!important}
.hva-voice-mic{position:absolute!important;right:5px!important;top:50%!important;transform:translateY(-50%)!important;display:flex!important;align-items:center!important;justify-content:center!important;width:31px!important;height:31px!important;min-width:31px!important;border:1px solid #c8ddeb!important;border-radius:9px!important;background:#f3f9fe!important;color:#155c8c!important;cursor:pointer!important;z-index:3!important;box-shadow:none!important;padding:5px!important}
.hva-voice-mic svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.hva-voice-mic:focus-visible{outline:2px solid #178cce;outline-offset:2px}
.hva-voice-mic[data-listening="true"]{background:#cfeefe!important;color:#b42332!important;border-color:#e796a0!important;animation:hva-mic-pulse 1s ease-in-out infinite alternate}
@keyframes hva-mic-pulse{to{box-shadow:0 0 0 5px #e83b3b20}}
.hva-voice-tooltip{position:absolute;right:0;top:calc(100% + 5px);max-width:min(340px,85vw);font:12px/1.4 system-ui,sans-serif;padding:6px 9px;border-radius:7px;background:#183e5c;color:white;z-index:99;pointer-events:none;white-space:normal}
`;
(document.head||document.documentElement).appendChild(css);
const icon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8"/></svg>';
let active=null,listener=null;
function notice(btn,message){const field=btn?.parentElement;if(!field)return;field.querySelector('.hva-voice-tooltip')?.remove();if(!message)return;const span=document.createElement('span');span.className='hva-voice-tooltip';span.setAttribute('role','status');span.textContent=message;field.appendChild(span);btn._voiceNotice=span}
function stop(){if(!active)return;const a=active;active=null;a.button.dataset.listening='false';a.button.setAttribute('aria-label','Tìm bằng giọng nói');try{a.recognition.stop()}catch(_){}}
function begin(input,button){
 if(active?.button===button){stop();notice(button,'Đã dừng nghe.');return}
 if(active)stop();
 if(!SpeechRecognition){notice(button,'Trình duyệt không hỗ trợ nhận dạng giọng nói. Hãy nhập bằng bàn phím hoặc dùng Chrome/Edge có hỗ trợ.');return}
 if(!root.isSecureContext){notice(button,'Micro cần trang HTTPS an toàn.');return}
 const recognition=new SpeechRecognition();
 recognition.lang='vi-VN';recognition.interimResults=false;recognition.continuous=false;recognition.maxAlternatives=1;
 active={recognition,button};
 button.dataset.listening='true';button.setAttribute('aria-label','Dừng nghe');
 notice(button,'Đang nghe tiếng Việt…');
 recognition.onresult=e=>{if(active?.recognition!==recognition)return;const text=String(e.results?.[0]?.[0]?.transcript||'').trim();if(!text)return;input.value=text;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));notice(button,'Đã nhận: '+text);input.focus()};
 recognition.onerror=e=>{if(active?.recognition!==recognition)return;const labels={notAllowed:'Chưa được cấp quyền micro.', 'not-allowed':'Micro bị từ chối quyền truy cập.', 'audio-capture':'Không tìm thấy thiết bị micro.', 'no-speech':'Chưa nghe rõ lời nói, vui lòng thử lại.',network:'Dịch vụ nhận dạng giọng nói chưa kết nối.'};notice(button,labels[e.error]||'Không nhận dạng được giọng nói; vui lòng thử lại.')};
 recognition.onend=()=>{if(active?.recognition===recognition){active=null;button.dataset.listening='false';button.setAttribute('aria-label','Tìm bằng giọng nói')}};
 try{recognition.start()}catch(e){active=null;button.dataset.listening='false';notice(button,'Không khởi động được micro: '+String(e.message||e))}
}
function eligible(input){
 if(!input||input.dataset.hvaVoiceSearch==='off'||input.dataset.hvaVoiceSearch==='ready'||input.disabled||input.readOnly)return false;
 if(input.type==='search')return true;
 return input.dataset.hvaVoiceSearch==='on';
}
function attach(input){
 if(!eligible(input))return;
 const parent=input.parentElement;if(!parent||parent.closest('.hva-voice-field')&&parent.querySelector('.hva-voice-mic'))return;
 const wrapper=document.createElement('span');wrapper.className='hva-voice-field';wrapper.style.width='100%';
 parent.insertBefore(wrapper,input);
 wrapper.appendChild(input);
 const button=document.createElement('button');button.type='button';button.className='hva-voice-mic';button.innerHTML=icon;button.setAttribute('aria-label','Tìm bằng giọng nói');button.title='Tìm bằng giọng nói (tiếng Việt)';
 button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();begin(input,button)});
 wrapper.appendChild(button);
 input.dataset.hvaVoiceSearch='ready';
}
function scan(context=document){context.querySelectorAll?.('input[type="search"],input[data-hva-voice-search="on"]').forEach(attach)}
function install(){
 scan();
 const observer=new MutationObserver(records=>{for(const record of records){for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.matches?.('input[type="search"],input[data-hva-voice-search="on"]'))attach(node);else if(node.querySelectorAll)scan(node)}}});
 observer.observe(document.body||document.documentElement,{childList:true,subtree:true});
 root.HVA_VoiceSearch={installed:true,scan,stop};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})(window);
