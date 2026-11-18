<!doctype html><html lang="en-NA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>CoolerBox Express | Ice Delivery</title><style>
*{box-sizing:border-box}body{margin:0;background:#eff7fa;color:#14283a;font:16px system-ui,sans-serif}header,main{max-width:880px;margin:auto;padding:20px}header{display:flex;align-items:center;justify-content:space-between;gap:12px}a{color:#125879}header strong{font-size:1.25rem}.hero{background:#10394f;color:white;border-radius:24px;padding:clamp(22px,5vw,42px)}.badge{display:inline-block;background:#e59239;color:#14283a;font-weight:700;border-radius:99px;padding:4px 12px;font-size:.85rem;margin-left:8px}h1{font-size:clamp(2rem,6vw,3.8rem);line-height:1.05;margin:.3em 0}h2{margin-top:0}h3{margin:18px 0 0;font-size:1.05rem}section,form{margin-top:18px;background:white;border:1px solid #d8e7ee;border-radius:20px;padding:clamp(16px,4vw,27px)}.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px}label{display:block;font-weight:650;margin:12px 0}label .price{font-weight:400;color:#47606f}input,select,button{font:inherit}input,select{display:block;width:100%;min-height:44px;padding:8px;margin-top:5px;border:1px solid #587485;border-radius:8px;background:white}.check{display:flex;gap:10px;align-items:center}.check input{width:22px;min-height:22px;margin:0}button{padding:12px 16px;background:#10526c;color:white;border:0;border-radius:9px;cursor:pointer;margin:5px 6px 5px 0}button:disabled{opacity:.55;cursor:default}small{display:block}.summary{padding:14px;background:#edf6fa;border-radius:12px;line-height:1.65;margin-bottom:10px}.hours{margin-top:12px;padding:10px 14px;border-radius:12px;background:#fff4e6}small,p{line-height:1.55}ul{padding-left:20px;line-height:1.6}:focus-visible{outline:3px solid #e59239;outline-offset:2px}
</style></head><body><header><strong>The CoolerBox</strong><a href="/">Main website</a></header><main>
<div class="hero"><span id="where">MAKALANI · ONGWEDIVA · OSHAKATI</span><span id="badge" class="badge" hidden>Coming soon</span><h1>CoolerBox Express</h1><p>Running low on ice? Get 5–20 kg of sealed ice cubes or gourmet ice delivered from your nearest CoolerBox shop.</p><div id="hours" class="hours" style="color:#14283a"></div></div>
<form id="order"><h2>Build your order</h2><p id="status"></p>
<label>Deliver from<select name="shop" id="shop"></select></label>
<h3>Ice cubes</h3><div class="row" id="cubes"></div>
<h3>Gourmet ice <small style="display:inline;font-weight:400">(slow-melting, ideal for drinks)</small></h3><div class="row" id="gourmet"></div>
<label>Area or place name<input name="area" required maxlength="80" placeholder="e.g. suburb, street, lodge, shop or landmark"></label>
<label>Delivery address or map pin<input name="location" required maxlength="250" autocomplete="street-address" placeholder="Enter your address or paste a map link"></label>
<label>Road distance from the shop in km (optional)<input name="distance" type="number" min="0" max="999" step="0.1" placeholder="Enter km if known"></label>
<small id="coverage"></small>
<label class="check"><input name="priority" type="checkbox"> <span>Priority delivery <span class="price" id="prioPrice"></span></span></label>
<label>How will you pay?<select name="payment" id="payment" required></select></label>
<div id="summary" class="summary" aria-live="polite"></div>
<button id="send" type="submit">Copy order enquiry</button><p id="feedback" role="status"></p><textarea id="fallback" rows="9" style="width:100%" readonly hidden aria-label="Order enquiry to copy"></textarea></form>
<section><h2>How it works</h2><ul><li>Choose your shop, ice and delivery place.</li><li>The team confirms stock, total price and delivery time on WhatsApp.</li><li>Pay by EFT, eWallet, BlueWallet, EasyWallet, Pay to Cell, card on delivery or cash on delivery. Payment details are sent with your confirmation.</li><li>You receive an order reference and updates until your ice arrives, sealed and cold.</li></ul><p>For orders over 20 kg, events or regular supply, request collection or scheduled bulk-contract delivery through the <a href="/">main CoolerBox website</a>.</p></section>
</main><script>
// ===== Settings: change these values only =====
const settings={
 launched:false,                 // false = pre-launch interest only; set true when Express starts
 whatsapp:'264852485426',        // international digits only, no plus sign
 cubes:{2:15,3:22,5:35},         // N$ per bag
 gourmet:{2:18,3:null,5:null},   // N$ per bag; set 3 kg and 5 kg gourmet prices
 base:12,perKm:3,priority:10,    // N$ delivery fare: base + per km (rounded up) + weight charge
 shops:[
  {id:'makalani',label:'Makalani, Ongwediva',open:true,maxKm:10},
  {id:'oshakati',label:'Oshakati branch',open:false,maxKm:10}   // set open:true when the branch opens
 ],
 hours:{weekday:[9,20],weekend:[10,20]},lastOrderMins:30,
 payments:['EFT','eWallet','BlueWallet','EasyWallet','Pay to Cell','Card on delivery (POS)','Cash on delivery']
};
// ===== End of settings =====
const sizes=[2,3,5],form=document.getElementById('order'),summary=document.getElementById('summary'),send=document.getElementById('send'),feedback=document.getElementById('feedback'),fallback=document.getElementById('fallback');
const money=n=>'N$'+n.toFixed(2);
const direct=/^264[0-9]{8,10}$/.test(settings.whatsapp);
const el=(tag,props={},text)=>{const e=Object.assign(document.createElement(tag),props);if(text!==undefined)e.textContent=text;return e;};
// Build inputs
const maxBags={2:10,3:6,5:4};
for(const [type,box] of [['cubes','cubes'],['gourmet','gourmet']]){
 const wrap=document.getElementById(box);
 sizes.forEach(s=>{const p=settings[type][s];const lab=el('label',{},`${s} kg bags `);lab.append(el('span',{className:'price'},p==null?'(price on confirmation)':`(${money(p)})`),el('input',{name:`${type}${s}`,type:'number',min:0,max:maxBags[s],step:1,value:0,required:true}));wrap.append(lab);});
}
const shopSel=document.getElementById('shop');
settings.shops.forEach(s=>shopSel.append(el('option',{value:s.id,disabled:!s.open},s.open?s.label:`${s.label} (opening soon)`)));
const paySel=document.getElementById('payment');
paySel.append(el('option',{value:''},'Choose a payment method'));
settings.payments.forEach(p=>paySel.append(el('option',{value:p},p)));
document.getElementById('prioPrice').textContent=`(+${money(settings.priority)}, delivered first)`;
document.getElementById('badge').hidden=settings.launched;
document.getElementById('status').textContent=settings.launched?'The team confirms stock, total price and delivery time before payment.':'CoolerBox Express is launching soon. Send your order idea now and we will contact you as soon as delivery starts in your area.';
// Opening hours in Namibian time
function hoursNote(){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Windhoek',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(p=>[p.type,p.value]));
 const weekend=parts.weekday==='Sat'||parts.weekday==='Sun';
 const [open,close]=weekend?settings.hours.weekend:settings.hours.weekday;
 const now=Number(parts.hour)*60+Number(parts.minute),last=close*60-settings.lastOrderMins;
 const pad=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
 const base=`Express hours: Mon–Fri ${pad(settings.hours.weekday[0]*60)}–${pad(settings.hours.weekday[1]*60)}, Sat, Sun and public holidays ${pad(settings.hours.weekend[0]*60)}–${pad(settings.hours.weekend[1]*60)}. Last order ${settings.lastOrderMins} minutes before closing.`;
 if(!settings.launched)return base;
 return (now>=open*60&&now<last?`Open now – last Express order today at ${pad(last)}. `:`Closed for Express right now – your order will be delivered from ${pad(open*60)} on our next trading day. `)+base;
}
document.getElementById('hours').textContent=hoursNote();
function quote(){
 const q={};let kg=0,subtotal=0,priced=true;
 for(const type of ['cubes','gourmet'])for(const s of sizes){const n=Number(form.elements[type+s].value);q[type+s]=n;kg+=n*s;if(n){const p=settings[type][s];if(p==null)priced=false;else subtotal+=n*p;}}
 const shop=settings.shops.find(s=>s.id===shopSel.value)||settings.shops[0];
 const raw=form.elements.distance.valueAsNumber,km=Number.isFinite(raw)&&raw>=0?Math.max(1,Math.ceil(raw)):null;
 const inArea=km===null||km<=shop.maxKm;
 const prio=form.elements.priority.checked;
 const fare=km!==null&&inArea&&kg>=5&&kg<=20?settings.base+settings.perKm*km+(kg===20?10:kg>=10?5:0)+(prio?settings.priority:0):null;
 return {q,kg,subtotal:priced?subtotal:null,shop,km,inArea,prio,fare};
}
function show(){
 const r=quote();
 document.getElementById('coverage').textContent=`Express covers up to ${r.shop.maxKm} km by road from ${r.shop.label}. The team checks your location and fare before confirming.`;
 const allInts=Object.values(r.q).every(n=>Number.isInteger(n)&&n>=0);
 const valid=allInts&&r.kg>=5&&r.kg<=20&&r.inArea;
 const note=r.kg<5?'Add enough ice to reach 5 kg.':r.kg>20?'For more than 20 kg, choose collection or scheduled bulk-contract delivery.':!r.inArea?'Outside the Express area. Choose collection or scheduled bulk-contract delivery.':'The team confirms your order and route.';
 summary.replaceChildren(...[`${r.kg} kg selected. ${note}`,'Ice subtotal: '+(r.subtotal===null?'To be confirmed':money(r.subtotal)),'Delivery estimate: '+(r.fare===null?'To be confirmed':money(r.fare)+(r.km?` (${r.km} km${r.prio?', priority':''})`:'')),'Total estimate: '+(r.fare===null||r.subtotal===null?'To be confirmed':money(r.fare+r.subtotal))].map(s=>el('div',{},s)));
 send.disabled=!valid;
 send.textContent=direct?(settings.launched?'Continue on WhatsApp':'Register interest on WhatsApp'):'Copy order enquiry';
 return {...r,valid};
}
form.addEventListener('input',show);form.addEventListener('change',show);
form.addEventListener('submit',async e=>{
 e.preventDefault();const r=show();if(!r.valid)return;
 const area=form.elements.area.value.trim(),location=form.elements.location.value.trim(),payment=paySel.value;
 if(!area||!location){feedback.textContent='Enter the area or place name and your delivery address or map pin.';return;}
 if(!payment){feedback.textContent='Choose how you will pay.';return;}
 const items=[];for(const type of ['cubes','gourmet'])for(const s of sizes){const n=r.q[type+s];if(n)items.push(`${type==='cubes'?'Ice cubes':'Gourmet ice'} ${s} kg × ${n}`);}
 const lines=[settings.launched?'CoolerBox Express order enquiry':'CoolerBox Express – pre-launch interest',`Deliver from: ${r.shop.label}`,...items,`Total weight: ${r.kg} kg`,`Area or place: ${area}`,`Address or pin: ${location}`,...(r.km?[`Distance: ${r.km} km`]:[]),...(r.prio?['Priority delivery: yes']:[]),`Payment: ${payment}`,...(r.subtotal===null?[]:[`Ice subtotal: ${money(r.subtotal)}`]),...(r.fare===null?[]:[`Estimated delivery: ${money(r.fare)}`]),settings.launched?'Please confirm availability, total price and delivery time.':'Please let me know when Express delivery starts.'];
 const message=lines.join('\n');
 if(direct){window.location.href='https://wa.me/'+settings.whatsapp+'?text='+encodeURIComponent(message);return;}
 try{await navigator.clipboard.writeText(message);feedback.textContent='Copied. Paste this into your CoolerBox WhatsApp chat.';}catch{fallback.value=message;fallback.hidden=false;fallback.select();feedback.textContent='Copy the text below and paste it into your CoolerBox WhatsApp chat.';}
});
show();
</script></body></html>
