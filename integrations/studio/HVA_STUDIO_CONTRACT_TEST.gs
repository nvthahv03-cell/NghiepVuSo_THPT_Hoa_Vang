/**
 * Bộ kiểm tra thuần dữ liệu cho adapter Studio, chạy thủ công trong Apps Script TEST.
 * Không gọi Gemini, không đọc khóa, không ghi dữ liệu.
 */
function hvaStudioContractSelfTest_(){
  var base={
    action:'hva_studio_ai_generate',
    taskType:'lesson_plan',program:'GDPT_2018',subject:'Toán',grade:'12',
    topic:'Khảo sát hàm số',input:'Thiết kế kế hoạch bài dạy.',
    outputFormat:'markdown',requestId:'studio-123456789012'
  };
  var results=[];
  function check(name,change,expected){
    var p=JSON.parse(JSON.stringify(base));
    change(p);
    var accepted=true;
    try{HVA_STUDIO_TEST_V1.validate(p);}catch(e){accepted=false;}
    results.push({name:name,pass:accepted===expected});
  }
  check('Yêu cầu hợp lệ',function(p){},true);
  check('Sai action',function(p){p.action='askVirtualAssistant';},false);
  check('Không hỗ trợ lớp 9',function(p){p.grade='9';},false);
  check('Không nhận model từ client',function(p){p.model='gemini-evil';},true);
  check('Thiếu tên chủ đề',function(p){p.topic='';},false);
  check('Sai định dạng',function(p){p.outputFormat='html';},false);
  check('Sai requestId',function(p){p.requestId='bad';},false);
  check('Input vượt 12000 ký tự',function(p){p.input=new Array(12002).join('x');},false);
  return {passed:results.filter(function(x){return x.pass;}).length,total:results.length,results:results};
}
