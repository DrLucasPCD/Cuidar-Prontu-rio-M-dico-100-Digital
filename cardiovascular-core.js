/* PREVENT simplified 10-year equations: Khan et al., Circulation 2024,
 * doi:10.1161/CIRCULATIONAHA.123.067626, Supplemental Table S12A/D.
 * No coefficients fitted locally. No CEP/IBP-to-SDI conversion.
 */
(function(root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./data/prevent-coefficients.js"));
  else root.CardiovascularCore = factory(root.PREVENT_COEFFICIENTS);
})(typeof globalThis !== "undefined" ? globalThis : this, function(data) {
  "use strict";
  const outcomes = ["total_cvd", "ascvd", "heart_failure", "stroke"];
  const ranges = {age:[30,79], sbp:[90,200], totalCholesterol:[130,320], hdl:[20,100], bmi:[18.5,39.999999999], egfr:[15,140]};
  const labels = {age:"idade (30–79 anos)", sbp:"PAS (90–200 mmHg)", totalCholesterol:"colesterol total (130–320 mg/dL)", hdl:"HDL (20–100 mg/dL)", bmi:"IMC (18,5 a <40 kg/m²)", egfr:"eTFG (15–140 mL/min/1,73 m²)"};
  function validate(input) {
    const errors = [];
    if (!["feminino", "masculino"].includes(input.sex)) errors.push("sexo contemplado nas equações publicadas (feminino ou masculino)");
    if (input.priorCvd === true) errors.push("doença cardiovascular prévia: usar avaliação de prevenção secundária, não esta equação");
    for (const [key,[min,max]] of Object.entries(ranges)) {
      if (typeof input[key] !== "number" || !Number.isFinite(input[key]) || input[key] < min || input[key] > max) errors.push(labels[key]);
    }
    for (const [key,label] of Object.entries({diabetes:"diabetes", smoking:"tabagismo atual", bpTreatment:"uso de anti-hipertensivo", statin:"uso de estatina", priorCvd:"DCV prévia"})) {
      if (typeof input[key] !== "boolean") errors.push(`informar sim ou não para ${label}`);
    }
    if (Number.isFinite(input.totalCholesterol) && Number.isFinite(input.hdl) && input.hdl >= input.totalCholesterol) errors.push("HDL deve ser menor que colesterol total");
    return errors;
  }
  function predictors(p) {
    const a=(p.age-55)/10, n=(p.totalCholesterol-p.hdl)/38.67-3.5, h=(p.hdl/38.67-1.3)/0.3;
    const sl=(Math.min(p.sbp,110)-110)/20, sh=(Math.max(p.sbp,110)-130)/20;
    const bl=(Math.min(p.bmi,30)-25)/5, bh=(Math.max(p.bmi,30)-30)/5;
    const gl=(Math.min(p.egfr,60)-60)/-15, gh=(Math.max(p.egfr,60)-90)/-15;
    const d=Number(p.diabetes), s=Number(p.smoking), t=Number(p.bpTreatment), z=Number(p.statin);
    return [a,n,h,sl,sh,d,s,bl,bh,gl,gh,t,z,t*sh,z*n,a*n,a*h,a*sh,a*d,a*s,a*bh,a*gl];
  }
  function calculate(input, options={}) {
    const errors = validate(input);
    const model=options.model || "base";
    if (!["base","sdi"].includes(model)) errors.push("modelo desconhecido");
    if (model === "sdi" && options.sdiDecile != null && (!Number.isInteger(options.sdiDecile) || options.sdiDecile < 1 || options.sdiDecile > 10)) errors.push("decil SDI deve ser inteiro entre 1 e 10");
    if (errors.length) return {ok:false, errors, model, horizonYears:10};
    const x=predictors(input);
    if (model === "sdi") {
      const d=options.sdiDecile;
      x.push(Number(d>=4 && d<=6), Number(d>=7 && d<=10), Number(d==null));
    }
    x.push(1);
    const sex=input.sex === "feminino" ? "female" : "male";
    const coefficients=data.models[`${model}_10yr`].coefficients;
    const risks={};
    for (const outcome of outcomes) {
      const b=coefficients[`${sex}_${outcome}`];
      if (!b || b.length !== x.length) throw new Error("Tabela PREVENT incompatível");
      const eta=b.reduce((sum,c,i)=>sum+c*x[i],0);
      risks[outcome]=100/(1+Math.exp(-eta));
    }
    return {ok:true, model, risks, horizonYears:10, version:data.version, sdiDecile:model === "sdi" ? options.sdiDecile ?? null : null};
  }
  // Sensitivity analysis in the SAME SDI equation: isolate its published term.
  // These are scenarios, not an inferred Brazilian patient's SDI or causal effect.
  function socialScenarios(input) {
    const scenarios=[1,4,7].map(sdiDecile=>calculate(input,{model:"sdi",sdiDecile}));
    if (scenarios.some(x=>!x.ok)) return [];
    return scenarios.map((result,i)=>({...result,label:["SDI 1–3","SDI 4–6","SDI 7–10"][i],
      deltaPp:Object.fromEntries(outcomes.map(key=>[key,result.risks[key]-scenarios[0].risks[key]])),
      interpretation:"Cenário da equação original dos EUA; não é ajuste validado pelo CEP de Recife."}));
  }
  return {calculate, validate, socialScenarios};
});
