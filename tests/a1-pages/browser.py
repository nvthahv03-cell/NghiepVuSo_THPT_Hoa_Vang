"""GitHub Pages subpath browser checks. All remote services are intercepted, never called."""
from pathlib import Path
import http.server,threading,functools,json,tempfile,urllib.parse,os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2];OUT=Path(os.environ.get('NVS_TEST_OUTPUT',str(Path(tempfile.gettempdir())/'nvs-a1-pages-evidence')));OUT.mkdir(parents=True,exist_ok=True)
PREFIX='/NghiepVuSo_THPT_Hoa_Vang/'
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def translate_path(self,path):
  if path.startswith(PREFIX):path='/'+path[len(PREFIX):]
  return super().translate_path(path)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();base='http://127.0.0.1:'+str(server.server_port);app=base+PREFIX;results=[]
schemas=json.loads((ROOT/'NVS_A1.schemas.json').read_text())
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  context=browser.new_context(viewport={'width':1200,'height':1000});calls=[];ai_error=[False];people_error=[False]
  context.add_init_script("localStorage.setItem('user',JSON.stringify({username:'qa_pages',tenDangNhap:'qa_pages',hoTen:'Người dùng kiểm thử',toBoPhan:'Tổ kiểm thử',chucVu:'Giáo viên'}));localStorage.setItem('hvaSessionToken','QA_ONLY_NOT_AUTHENTICATION');localStorage.setItem('hvaSessionExpiresAt',String(Date.now()+3600000));")
  def route_request(route):
   url=route.request.url
   if url.startswith(base):route.continue_();return
   if url.startswith('https://script.google.com/'):
    query=urllib.parse.parse_qs(urllib.parse.urlsplit(url).query)
    if route.request.method=='POST':
     data=json.loads(route.request.post_data);calls.append(data['action']);assert data['action']=='generateReportAIDraft'
     route.fulfill(content_type='application/json',body=json.dumps({'success':not ai_error[0],'draft':'Dự thảo từ dữ liệu kiểm thử, cần xác minh.'}));return
    action=query.get('action',[''])[0];calls.append(action);assert action=='getNVSMeetingPersonnel'
    if people_error[0]:route.abort();return
    callback=query['callback'][0];payload={'success':True,'groups':[{'groupKey':'UNIT:QA','tenTo':'Tổ kiểm thử','kind':'UNIT','members':[{'username':'qa_person','hoTen':'Nhân sự kiểm thử','to':'Tổ kiểm thử'}]}]}
    route.fulfill(content_type='application/javascript',body=callback+'('+json.dumps(payload)+');');return
   route.abort()
  context.route('**/*',route_request);page=context.new_page();page.on('dialog',lambda d:d.accept());errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  # The current catalog is the actual entry point, including anchors inside accordions.
  page.goto(app+'NghiepVu.html');page.locator('details.group').first.locator('summary .chev').first.click()
  page.locator('a[href="./NVS_BaoCao_A1.html?group=A11"]').click();page.wait_for_url('**/NVS_BaoCao_A1.html?group=A11');page.wait_for_function("()=>!document.querySelector('#fields').disabled")
  assert not errors,errors
  results.append({'function':'Catalog A11 entry and accordion anchor','status':'PASS technical'})
  for group,kinds in [('A11',['task','deployment','training','other']),('A13',['team','cluster']),('A14',['gifted','support','exam'])]:
   page.goto(app+'NVS_BaoCao_A1.html?group='+group);page.wait_for_function("()=>!document.querySelector('#fields').disabled")
   for kind in kinds:
    page.select_option('#type',kind);page.fill('#title','Báo cáo kiểm tra '+kind);page.fill('#content','Nội dung kiểm thử có nguồn');page.fill('#result','Kết quả kiểm thử');page.fill('#evidence','https://drive.google.com/file/d/QA_DOCUMENT_ONLY/view')
    for key,label,typ in schemas[kind]['fields']:page.fill('#detail-'+key,'4' if typ=='number' else 'https://docs.google.com/document/d/QA_DOCUMENT_ONLY/edit' if typ=='url' else 'Nội dung riêng '+key)
    before=list(calls);page.locator('#preview').click();assert page.locator('#previewSection').is_visible();assert 'CHƯA LƯU, CHƯA GỬI' in page.locator('#previewText').inner_text();assert page.locator('#saveDraft').is_disabled() and page.locator('#submit').is_disabled();assert calls==before
    page.locator('#edit').click();page.fill('#result','Kết quả đã chỉnh sửa');page.locator('#preview').click();assert 'Kết quả đã chỉnh sửa' in page.locator('#previewText').inner_text()
    results.append({'function':kind,'status':'PASS technical select/input/specific-fields/preview/edit; save and submit blocked'})
   if group=='A13':
    page.locator('#edit').click();page.locator('#loadPeople').click();page.wait_for_function("()=>document.querySelector('#participants').options.length===1");page.select_option('#participants','qa_person');page.locator('#preview').click();assert 'Nhân sự kiểm thử' in page.locator('#previewText').inner_text();results.append({'function':'existing personnel helper','status':'PASS contract with intercepted JSONP; integration unverified'})
    people_error[0]=True;page.locator('#edit').click();page.locator('#loadPeople').click();page.wait_for_function("()=>document.querySelector('#notice').dataset.error==='true'");people_error[0]=False
   if group=='A14':assert page.locator('#legacyDTHT a').get_attribute('href')=='./BC_DayThemHocThem.html'
   page.screenshot(path=str(OUT/(group+'-1200.png')),full_page=True)
  page.goto(app+'NVS_BaoCao_A1.html?group=A11');page.wait_for_function("()=>!document.querySelector('#fields').disabled");page.fill('#aiPrompt','Chỉ dùng dữ liệu kiểm thử');page.locator('#askAI').click();page.wait_for_function("()=>document.querySelector('#aiDraft').value.length>0");page.locator('#applyAI').click();assert 'Dự thảo từ dữ liệu kiểm thử' in page.locator('#content').input_value();ai_error[0]=True;page.locator('#askAI').click();page.wait_for_function("()=>document.querySelector('#notice').dataset.error==='true'");assert page.locator('#aiDraft').input_value()=='';results.append({'function':'shared assistant','status':'PASS contract and failure handling; remote request intercepted'})
  page.fill('#title','Kiểm tra lỗi');page.fill('#content','Nội dung');page.fill('#result','Kết quả');page.fill('#evidence','https://example.invalid/file');page.locator('#preview').click();assert page.locator('#notice').get_attribute('data-error')=='true'
  page.fill('#evidence','');page.fill('#start','2026-10-20');page.fill('#end','2026-10-01');page.locator('#preview').click();assert 'Ngày kết thúc' in page.locator('#notice').inner_text()
  before=list(calls);page.evaluate("localStorage.setItem('hvaSessionExpiresAt','1')");page.locator('#preview').click();assert page.locator('#fields').is_disabled() or page.locator('#title').is_disabled();assert calls==before;results.append({'function':'invalid URL/date and expired session','status':'PASS technical; no remote report request'})
  # Restore existing-session fixture only inside this test browser.
  page.evaluate("localStorage.setItem('hvaSessionExpiresAt',String(Date.now()+3600000))")
  for width in [375,663,900,1200]:
   page.set_viewport_size({'width':width,'height':950});page.goto(app+'NVS_BaoCao_A1.html?group=A13&type=team');page.wait_for_function("()=>!document.querySelector('#fields').disabled");assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1');page.screenshot(path=str(OUT/('A13-'+str(width)+'.png')),full_page=True)
  page.fill('#title','Kiểm tra đổi tài khoản');page.fill('#content','Nội dung');page.fill('#result','Kết quả');before=list(calls);page.evaluate("localStorage.setItem('user',JSON.stringify({username:'qa_other',hoTen:'Tài khoản kiểm thử khác'}))");page.locator('#preview').click();assert 'Tài khoản NVS đã thay đổi' in page.locator('#notice').inner_text();assert calls==before;results.append({'function':'account changes within open form','status':'PASS technical stop and require reload, no request'})
  page.goto(app+'NVS_BaoCao_A1.html?group=A12');assert page.locator('#formSection').is_hidden();assert page.locator('#blocked input,#blocked textarea,#blocked select').count()==0;page.locator('#blocked summary').first.click();assert page.locator('#blocked details').first.get_attribute('open') is not None;assert page.locator('#blocked a').get_attribute('href')=='./BC_ChuNhiem.html';results.append({'function':'A12 and protected legacy links','status':'PASS technical blocked-data catalog; CN/DTHT retained'})
  page.goto(app+'A.1.1.%20NhiemVu_BaoCao.html');page.wait_for_url('**/NVS_BaoCao_A1.html?group=A11')
  page.goto(app+'NghiepVu.html');page.locator('details.group').first.locator('summary .chev').first.click();page.locator('[aria-controls="nvs-a13"]').click();page.locator('#nvs-a13 a').first.click();page.wait_for_url('**/NVS_BaoCao_A1.html?group=A13&type=team')
  page.goto(app+'NghiepVu.html');page.locator('details.group').first.locator('summary .chev').first.click();page.locator('[aria-controls="nvs-a14"]').click();assert page.locator('#nvs-a14 a').count()==4;assert page.locator('#nvs-a14 .nvs-a-subgrid').bounding_box()['width']>page.locator('#nvs-a14').bounding_box()['width']*.85;page.screenshot(path=str(OUT/'catalog-A1.png'),full_page=True);assert page.locator('#nvs-a14 a').last.get_attribute('href')=='./BC_DayThemHocThem.html';page.locator('#nvs-a14 a').first.click();page.wait_for_url('**/NVS_BaoCao_A1.html?group=A14&type=gifted')
  assert not errors,errors
  assert set(calls)<= {'getNVSMeetingPersonnel','generateReportAIDraft'}
  assert page.evaluate("Object.keys(localStorage).sort()")==['hvaSessionExpiresAt','hvaSessionToken','user']
  results.append({'function':'Pages subpath/menu/compatibility/no persistence','status':'PASS technical; only existing read/AI actions under explicit click; zero report-save/submit actions'})
  context.close()
  anon=browser.new_context();anon.route('**/*',lambda r:r.continue_() if r.request.url.startswith(base) else r.abort());page=anon.new_page();page.goto(app+'NVS_BaoCao_A1.html?group=A11');page.wait_for_function("()=>!document.querySelector('#loginLink').hidden");assert page.locator('#title').is_disabled();assert page.locator('#loginLink a').get_attribute('href')=='./index.html';anon.close();browser.close();results.append({'function':'no existing session','status':'PASS technical return to existing login, no new login system'})
finally:server.shutdown()
(OUT/'RESULTS.json').write_text(json.dumps({'scope':'GitHub Pages project-prefix simulation, browser technical only; remote services intercepted; no integration/owner PASS','results':results},ensure_ascii=False,indent=2)+'\n');print('PASS:',len(results),'checks; 9 templates and catalog links under Pages subpath; no new report backend or persistence.')
