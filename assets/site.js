import {calculate} from './calculator.mjs';

const cvForm=document.querySelector('#cv-form');
if(cvForm){
  const placeholders={name:'Họ và tên',role:'Vị trí mong muốn',email:'Email',phone:'Số điện thoại',location:'Nơi ở',summary:'Đôi dòng giới thiệu về bạn và định hướng công việc.',experience:'Những công việc và kết quả liên quan.',education:'Quá trình học tập hoặc đào tạo.',skills:'Các kỹ năng bạn muốn nhấn mạnh.'};
  const update=()=>{
    for(const [name,fallback] of Object.entries(placeholders)){
      const field=cvForm.elements.namedItem(name);
      const preview=document.querySelector(`[data-cv-preview="${name}"]`);
      if(field&&preview)preview.textContent=field.value.trim()||fallback;
    }
  };
  cvForm.addEventListener('input',update);
  cvForm.addEventListener('submit',event=>event.preventDefault());
  document.querySelector('#cv-print')?.addEventListener('click',()=>window.print());
  update();
}

const tabs=[...document.querySelectorAll('[data-topic][role="tab"]')];
if(tabs.length){
  const cards=[...document.querySelectorAll('[data-article-topic]')];
  tabs.forEach(tab=>tab.addEventListener('click',()=>{
    tabs.forEach(t=>t.setAttribute('aria-selected',String(t===tab)));
    cards.forEach(card=>{card.hidden=tab.dataset.topic!=='all'&&card.dataset.articleTopic!==tab.dataset.topic;});
  }));
}

const form=document.querySelector('#severance-form');
if(form){
  const fields=['worked','insured','paid','salary'].map(id=>form.querySelector(`#${id}`));
  const amount=document.querySelector('#calc-amount');
  const note=document.querySelector('#result-note');
  const error=document.querySelector('#calc-error');
  const outputs={worked:document.querySelector('#result-worked'),eligible:document.querySelector('#result-eligible'),years:document.querySelector('#result-years'),rate:document.querySelector('#result-rate')};
  const fmt=new Intl.NumberFormat('vi-VN',{maximumFractionDigits:0});
  const reset=()=>{amount.textContent='—';Object.values(outputs).forEach(el=>el.textContent='—');};
  function update(){
    error.textContent='';
    if(fields.some(field=>field.value==='')){reset();note.textContent='Nhập số liệu để xem kết quả.';return;}
    const [worked,insured,paid,salary]=fields.map(field=>Number(field.value));
    const kind=form.querySelector('input[name="kind"]:checked')?.value;
    const result=calculate({kind,worked,insured,paid,salary});
    if(result.error){reset();error.textContent=result.error;note.textContent='Điều chỉnh dữ liệu nhập để tính lại.';return;}
    if(result.ineligible){reset();amount.textContent='Chưa đủ điều kiện';outputs.worked.textContent=`${worked} tháng`;note.textContent='Cả hai loại trợ cấp trong công cụ đều yêu cầu đã làm việc thường xuyên từ đủ 12 tháng và đáp ứng căn cứ chấm dứt tương ứng.';return;}
    amount.textContent=`${fmt.format(result.amount)} ₫`;
    outputs.worked.textContent=`${result.worked} tháng`;
    outputs.eligible.textContent=`${result.eligible} tháng`;
    outputs.years.textContent=`${new Intl.NumberFormat('vi-VN',{maximumFractionDigits:1}).format(result.years)} năm`;
    outputs.rate.textContent=kind==='severance'?'0,5 tháng lương / năm':'1 tháng lương / năm';
    note.textContent=result.minimumApplied?'Đã áp dụng mức tối thiểu 2 tháng lương cho trợ cấp mất việc, nếu căn cứ mất việc và các điều kiện khác được đáp ứng.':'Đây là ước tính theo dữ liệu nhập. Hãy đối chiếu hồ sơ lao động, BHTN và căn cứ chấm dứt hợp đồng.';
  }
  form.addEventListener('input',update);
  form.addEventListener('change',update);
  form.addEventListener('submit',e=>e.preventDefault());
  update();
}
