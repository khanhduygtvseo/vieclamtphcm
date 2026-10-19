export function calculate({kind, worked, insured, paid, salary}) {
  const values=[worked,insured,paid,salary];
  if (values.some(v => !Number.isFinite(v)) || [worked,insured,paid].some(v => !Number.isInteger(v))) return {error:'Vui lòng nhập số tháng tròn và mức lương hợp lệ.'};
  if (worked<0 || insured<0 || paid<0 || salary<=0) return {error:'Các giá trị thời gian không được âm và tiền lương phải lớn hơn 0.'};
  if (insured+paid>worked) return {error:'Tổng thời gian BHTN và thời gian đã nhận trợ cấp không được vượt quá thời gian làm việc thực tế.'};
  if (kind!=='severance' && kind!=='jobloss') return {error:'Vui lòng chọn loại trợ cấp.'};
  if (worked<12) return {ineligible:true,worked};
  const eligible=worked-insured-paid;
  const fullYears=Math.floor(eligible/12);
  const leftover=eligible%12;
  const years=fullYears+(leftover===0?0:leftover<=6?.5:1);
  const rate=kind==='severance'?.5:1;
  const salaryMonths=kind==='jobloss'?Math.max(years,2):years*.5;
  return {worked,eligible,years,rate,amount:salary*salaryMonths,minimumApplied:kind==='jobloss'&&years<2};
}
