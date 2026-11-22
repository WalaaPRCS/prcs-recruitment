const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function validateRequirement(r){
 if(!r||typeof r!=='object'||typeof r.mandatory!=='boolean'||!r.mandatory)return 'يجب تحديد شرط إلزامي واحد على الأقل';
 const c=r.config;
 if(!c||typeof c!=='object'||Array.isArray(c))return 'إعداد الشرط غير مكتمل';
 switch(r.kind){
 case 'degree':return Number.isInteger(c.minimumLevel)&&c.minimumLevel>=1&&c.minimumLevel<=10?null:'درجة المؤهل غير صالحة';
 case 'specialization':return Array.isArray(c.acceptedIds)&&c.acceptedIds.length>0&&c.acceptedIds.every(x=>typeof x==='string'&&uuid.test(x))?null:'يجب تحديد تخصص مقبول واحد على الأقل';
 case 'experience':return typeof c.minimumYears==='number'&&Number.isFinite(c.minimumYears)&&c.minimumYears>=0&&c.minimumYears<=60&&(!c.field||typeof c.field==='string')?null:'سنوات الخبرة غير صالحة';
 case 'license':return typeof c.licenseType==='string'&&c.licenseType.trim().length>0?null:'نوع الترخيص مطلوب';
 default:return 'نوع شرط غير مدعوم';
 }
}
export function validateRequirements(requirements){
 if(!Array.isArray(requirements)||requirements.length===0)return ['يجب إضافة شرط إلزامي واحد على الأقل'];
 const errors=requirements.map(validateRequirement).filter(Boolean);
 if(!requirements.some(r=>r.mandatory===true))errors.push('يجب وجود شرط إلزامي');
 return errors;
}
