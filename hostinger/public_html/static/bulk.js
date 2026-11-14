/* Bulk estimator: whole units per delivery, quoted unit prices, no live prices. */
function calculateBulk(items) {
  if(!items.length)throw Error('Select at least one product.');
  let subtotal=0,missing=0;
  const lines=items.map(item=>{
    if(!Number.isFinite(item.quantity)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>1000000000||!Number.isFinite(item.size)||item.size<=0||item.size>10000)throw Error('Enter a valid whole quantity and pack size for every selected product.');
    if(item.price!==null&&(!Number.isFinite(item.price)||item.price<0||item.price>1000000))throw Error('Enter a valid quoted price or leave it blank.');
    // Refill water is priced by litre; other products by whole bag/block/bottle.
    const cost=item.price===null?null:item.quantity*(item.id==='refill'?item.size:1)*item.price;
    if(cost===null)missing++;else subtotal+=cost;
    return {...item,cost};
  });
  return {lines,subtotal,total:missing?null:subtotal,missing};
}
if(typeof module!=='undefined')module.exports={calculateBulk};
if(typeof document!=='undefined')(()=>{
const el=id=>document.getElementById('bulk-'+id),dialog=el('dialog'),form=el('form');
const productInfo={cups500:{name:'500 ml Ice Cups',unit:'cups',sizeUnit:'ml'},water330:{name:'330 ml Bottled Water',unit:'bottles',sizeUnit:'ml'},ice3:{"name": "3 kg Ice Cubes", "unit": "bags", "sizeUnit": "kg"},ice5:{"name": "5 kg Ice Cubes", "unit": "bags", "sizeUnit": "kg"},cups:{name:'Ice cups',unit:'cups',sizeUnit:'unit'},ice:{name:'2 kg Ice Cubes',unit:'bags',sizeUnit:'kg'},blocks:{name:'Ice blocks',unit:'blocks',sizeUnit:'kg'},water:{name:'Bottled water',unit:'bottles',sizeUnit:'ml'},refill:{name:'Water refills',unit:'containers',sizeUnit:'litres'}};
for(const id of ['ice','ice3','ice5']){productInfo[id+'--gourmet']={...productInfo[id],baseId:id,iceType:'gourmet'};productInfo[id].baseId=id;productInfo[id].iceType='regular';}
const iceIds=['ice','ice3','ice5','ice--gourmet','ice3--gourmet','ice5--gourmet','blocks','cups','cups500'];
const num=id=>el(id).value.trim()===''?NaN:Number(el(id).value);
const price=id=>el(id).value.trim()===''?null:Number(el(id).value);
const fmt=n=>n.toLocaleString('en-GB',{maximumFractionDigits:2}),money=n=>'N$'+n.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
let estimate=null;
function update(){
  const supplier=el('category').value==='Local supplier application';if(supplier)el('mode').value='direct';const byGuests=el('mode').value==='guests';el('guest-fields').hidden=!byGuests;
  ['guests','reserve','ice-rate','water-rate'].forEach(id=>el(id).disabled=!byGuests);
  for(const id of Object.keys(productInfo)){
    const selected=el(id+'-selected').checked;const catalogue=window.catalogueProducts?.find(p=>p.id===(productInfo[id].baseId||id));el(id+'-quantity').min=supplier&&iceIds.includes(id)?'50':String(catalogue?.minOrder||1);el(id+'-quantity').step=String(catalogue?.orderMultiple||1);el(id+'-fields').hidden=!selected;
    ['quantity','size','price'].forEach(field=>el(id+'-'+field).disabled=!selected);
    el(id+'-quantity').readOnly=byGuests&&['ice','water','water330'].includes(id);
    el(id+'-hint').textContent=byGuests&&['ice','water','water330'].includes(id)?'Quantity calculated from guest numbers, rounded up to whole packs.':id==='refill'?'Refill cost = containers × litres per container × quoted price per litre.':'Enter the quantity you need per delivery.';
  }
  try{
    if(byGuests){
      const waterIds=['water','water330'].filter(id=>el(id+'-selected').checked),iceSelected=el('ice-selected').checked;
      const result=calculateSupplies({guests:num('guests'),reserve:num('reserve'),icePerGuest:iceSelected?num('ice-rate'):0,bagKg:iceSelected?num('ice-size'):2,waterPerGuest:0,bottleMl:500,icePrice:null,waterPrice:null});
      if(iceSelected)el('ice-quantity').value=result.bags;
      for(const id of waterIds){const r=calculateSupplies({guests:num('guests'),reserve:num('reserve'),icePerGuest:0,bagKg:2,waterPerGuest:num('water-rate')/waterIds.length,bottleMl:num(id+'-size'),icePrice:null,waterPrice:null});el(id+'-quantity').value=Math.max(50,Math.ceil(r.bottles/10)*10);}
    }
    if(window.catalogueProducts){
      for(const entry of iceOrderVariants(window.catalogueProducts)){
        const p={...entry};if(!productInfo[p.id])continue;productInfo[p.id].name=p.name;const check=el(p.id+'-selected');if(p.availability==='sold-out'){check.checked=false;check.disabled=true}el(p.id+'-size').value=p.size;
        const q=num(p.id+'-quantity'),size=num(p.id+'-size');
        const gourmet=p.iceType==='gourmet',retail=gourmet?p.gourmetRetailPrice??null:p.retailPrice,bulk=gourmet?p.gourmetBulkPrice??null:p.bulkPrice;const rate=p.size===size?(q>=p.bulkMinimum&&bulk!==null?bulk:retail):null;
        el(p.id+'-price').value=rate===null?'':p.id==='refill'?rate/size:rate;
        el(p.id+'-price').readOnly=true;
        if(p.id==='refill')el(p.id+'-price').step='any';
      }
    }
    for(const id of ['water','water330']){if(el(id+'-selected').checked&&(num(id+'-quantity')<50||num(id+'-quantity')%10!==0))throw Error('Water minimum: 50 bottles of each size, ordered in packs of 10.');}
    const items=Object.keys(productInfo).filter(id=>el(id+'-selected').checked).map(id=>({...productInfo[id],id:productInfo[id].baseId||id,quantity:num(id+'-quantity'),size:num(id+'-size'),price:price(id+'-price')}));
    if(supplier&&items.some(i=>['ice','ice3','ice5','blocks','cups','cups500'].includes(i.id)&&i.quantity<50))throw Error('Supplier minimum: 50 units of each selected ice product per delivery.');if(!form.checkValidity())throw Error('Check the selected quantities, pack sizes, prices and preferred date.');
    if(supplier){const ice=items.filter(i=>['ice','ice3','ice5','blocks','cups','cups500'].includes(i.id));if(!ice.length)throw Error('Select at least one ice product for the supplier application.');if(ice.some(i=>i.quantity<50))throw Error('Supplier minimum: 50 units of each selected ice product per delivery.');}estimate=calculateBulk(items);
    el('lines').textContent=estimate.lines.map(i=>`${i.name}: ${fmt(i.quantity)} ${i.unit} × ${fmt(i.size)} ${i.sizeUnit}${i.cost===null?' — quote required':' — '+money(i.cost)}`).join('\n');
    el('total-price').textContent=estimate.total!==null?'Estimated product total per delivery: '+money(estimate.total):'Final total requires prices for '+estimate.missing+' selected '+(estimate.missing===1?'product.':'products.')+(estimate.subtotal?' Priced subtotal: '+money(estimate.subtotal)+'.':'');
    el('error').textContent='';form.querySelector('[type=submit]').disabled=false;
  }catch(e){estimate=null;el('error').textContent=e.message;el('lines').textContent='Update the selected products to see your estimate.';el('total-price').textContent='';form.querySelector('[type=submit]').disabled=true;}
}
function show(sector){if(sector){el('category').value=sector;el('mode').value=sector==='Events & celebrations'?'guests':'direct';}form.hidden=false;el('draft').hidden=true;update();if(!dialog.open)dialog.showModal();}
document.querySelectorAll('[data-bulk]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.sector)));
el('close').onclick=()=>dialog.close();
form.addEventListener('input',update);form.addEventListener('change',update);
form.addEventListener('submit',event=>{event.preventDefault();update();if(!estimate)return;
const lines=['Hello CoolerBox Ice Hub,','','I would like to request a bulk supply quote.','Category: '+el('category').value,'Frequency: '+el('frequency').value+' (quantities below are per delivery).'];
if(el('date').value)lines.push('Preferred date: '+el('date').value);
if(el('mode').value==='guests')lines.push(`Planning basis: ${num('guests')} guests, ${num('reserve')}% reserve; drink ice ${num('ice-rate')} kg/guest; water ${num('water-rate')} litres/guest. These are planning estimates.`);
lines.push('',...estimate.lines.map(i=>`${i.name}: ${i.quantity} ${i.unit} × ${i.size} ${i.sizeUnit}${i.price===null?' — please quote':`; entered price ${money(i.price)} per ${i.id==='refill'?'litre':i.unit==='bags'?'bag':i.unit==='blocks'?'block':'bottle'}; estimated cost ${money(i.cost)}`}`),'',el('total-price').textContent);
if(el('notes').value.trim())lines.push('Additional requirements: '+el('notes').value.trim());
lines.push('','Please confirm pack sizes, final prices, availability and collection arrangements. Transport and extra charges are excluded from this estimate. Thank you.');
try{
 sessionStorage.setItem('coolerboxDraft',JSON.stringify({items:estimate.lines.map(i=>({id:i.id,quantity:i.quantity,iceType:i.iceType})),category:el('category').value,frequency:el('frequency').value,date:el('date').value,notes:el('notes').value.trim()}));
 location.href='/order?draft=1';
}catch{el('error').textContent='Your browser could not transfer this draft. Open Complete enquiry form above and enter the quantities there.';}
});
el('edit').onclick=()=>{form.hidden=false;el('draft').hidden=true;update()};
el('copy').onclick=async()=>{try{await navigator.clipboard.writeText(el('draft-message').value);el('copy-status').textContent='Message copied. Nothing has been sent.'}catch{el('draft-message').focus();el('draft-message').select();el('copy-status').textContent='Select and copy the message above.'}};
window.addEventListener('coolerbox:estimate',event=>{
 const d=event.detail;el('category').value='Events & celebrations';el('mode').value='guests';
 for(const [key,id] of [['guests','guests'],['reserve','reserve'],['icePerGuest','ice-rate'],['waterPerGuest','water-rate'],['bagKg','ice-size'],['bottleMl','water-size']])el(id).value=d[key];
 el('ice-selected').checked=d.icePerGuest>0;el('water-selected').checked=d.waterPerGuest>0;el('blocks-selected').checked=false;el('refill-selected').checked=false;el('cups-selected').checked=false;for(const id of ['ice3','ice5','ice--gourmet','ice3--gourmet','ice5--gourmet'])el(id+'-selected').checked=false;
 el('ice-price').value=d.icePrice??'';el('water-price').value=d.waterPrice??'';show();
});
const generalProduct=document.getElementById('product');generalProduct.addEventListener('change',()=>{if(generalProduct.value==='Bulk supply enquiry'){document.getElementById('enquiry').close();show()}});
window.addEventListener('coolerbox:catalogue',update);
update();
})();
