function iceSelectionKey(id,iceType){return iceType==='gourmet'?id+'--gourmet':id;}
function iceOrderVariants(products){return products.flatMap(p=>['ice','ice3','ice5'].includes(p.id)?['regular','gourmet'].map(iceType=>({...p,baseId:p.id,baseName:p.name,id:iceSelectionKey(p.id,iceType),iceType,name:p.name+' — '+iceType})):p);}
/* Mixed gathering planner. Uses catalogue packs and editable illustrative allowances. */
function gatheringGroup(p){
  if(['ice','ice3','ice5'].includes(p.baseId||p.id)&&p.sizeUnit==='kg')return 'ice';
  if(['water','water330'].includes(p.id)&&p.sizeUnit==='ml'||p.id==='refill'&&p.sizeUnit==='litres')return 'water';
  return null;
}
function calculateGathering(products,selections,basis,labels=false){
  const {guests,reserve,ice,water}=basis;
  if(!Number.isInteger(guests)||guests<1||guests>100000||![reserve,ice,water].every(v=>Number.isFinite(v)&&v>=0&&v<=100))throw Error('Enter valid guests, allowances and reserve within the shown limits.');
  if(!selections.length||new Set(selections.map(s=>iceSelectionKey(s.id,s.iceType))).size!==selections.length)throw Error('Select at least one product. Each size and type can appear once.');
  const groups={ice:0,water:0};
  for(const s of selections){const p=products.find(p=>p.id===s.id);if(!p||p.availability==='sold-out')throw Error('A selected product is unavailable.');if(!Number.isFinite(p.size)||p.size<=0)throw Error('The product pack size needs confirmation.');if(s.mode==='auto'){const g=gatheringGroup(p);if(!g)throw Error('Use a manual quantity for this product.');groups[g]++}else if(s.mode!=='manual')throw Error('Choose an estimate or manual quantity.');}
  const allowance={ice:guests*ice*(1+reserve/100),water:guests*water*(1+reserve/100)};
  const lines=selections.map(s=>{
    const p=products.find(p=>p.id===s.id),g=gatheringGroup(p),pack=['water','water330'].includes(p.id)?p.size/1000:p.size;
    let quantity=s.mode==='auto'?Math.ceil(allowance[g]/groups[g]/pack-1e-9):s.quantity;
    if(s.mode==='manual'&&p.id==='refill')quantity=Math.ceil(s.quantity/p.size-1e-9);
    if(s.mode==='auto'&&quantity>0)quantity=Math.max(p.minOrder||1,Math.ceil(quantity/(p.orderMultiple||1))*(p.orderMultiple||1));if(quantity<(p.minOrder||1)||quantity%(p.orderMultiple||1)!==0)throw Error(p.name+': minimum '+(p.minOrder||1)+' bottles, in packs of '+(p.orderMultiple||1)+'.');
    if(!Number.isInteger(quantity)||quantity<1||quantity>(p.maxPerOrder||1000000)||s.mode==='manual'&&(!Number.isFinite(s.quantity)||s.quantity<=0))throw Error('Enter a positive quantity within the product limit. For a zero allowance, deselect that product.');
    const gourmet=s.iceType==='gourmet';if(s.iceType&&!['ice','ice3','ice5'].includes(p.id))throw Error('Ice type applies only to ice-cube bags.');const retail=gourmet?p.gourmetRetailPrice??null:p.retailPrice,bulk=gourmet?p.gourmetBulkPrice??null:p.bulkPrice;const rate=quantity>=p.bulkMinimum&&bulk!==null?bulk:retail;
    return {...p,id:s.id,lineKey:iceSelectionKey(s.id,s.iceType),iceType:s.iceType,name:(p.baseName||p.name)+(s.iceType?' — '+s.iceType:''),quantity,mode:s.mode,bulkApplied:quantity>=p.bulkMinimum&&bulk!==null,rate,cents:rate===null?null:quantity*Math.round(rate*100)};
  });
  for(const p of products){const total=lines.filter(l=>l.id===p.id).reduce((v,l)=>v+l.quantity,0);if(p.maxPerOrder&&total>p.maxPerOrder)throw Error(p.name+' exceeds the combined limit across both ice types.');}
  if(labels&&!lines.some(p=>['water','water330'].includes(p.id)))throw Error('Select bottled water for personalised labels.');
  const printingCents=labels?lines.filter(p=>['water','water330'].includes(p.id)).reduce((n,p)=>n+p.quantity*400,0):0;const subtotal=lines.reduce((v,p)=>v+(p.cents||0),0)+printingCents,unknown=lines.some(p=>p.cents===null);
  return {lines,subtotal,printingCents,total:unknown?null:subtotal,allowance};
}
if(typeof document!=='undefined'&&document.getElementById('gathering-form'))(async()=>{
  const $=id=>document.getElementById('gather-'+id),form=document.getElementById('gathering-form');
  const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n},fmt=n=>n.toLocaleString('en-GB',{maximumFractionDigits:2}),money=c=>'N$'+(c/100).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
  let products=[],result=null;
  const basis=()=>Object.fromEntries(['guests','reserve','ice','water'].map(k=>[k,$(k).value.trim()===''?NaN:Number($(k).value)]));
  function update(){try{
    const selected=products.filter(p=>$('choose-'+p.id).checked),waterSelected=selected.some(p=>['water','water330'].includes(p.id));$('labels').disabled=!waterSelected;if(!waterSelected)$('labels').checked=false;
    const selections=selected.map(p=>({id:p.baseId||p.id,mode:$('mode-'+p.id).value,quantity:Number($('qty-'+p.id).value),...(p.iceType?{iceType:p.iceType}:{})}));
    for(const p of products){const on=$('choose-'+p.id).checked,auto=$('mode-'+p.id).value==='auto';$('mode-'+p.id).disabled=!on;$('qty-'+p.id).disabled=!on||auto;}
    result=calculateGathering(products,selections,basis(),$('labels').checked);$('lines').replaceChildren();
    for(const p of result.lines){if(p.mode==='auto')$('qty-'+p.lineKey).value=p.quantity;const text=`${fmt(p.quantity)} × ${p.name} (${fmt(p.size)} ${p.sizeUnit} / ${p.unit})${p.id==='refill'?' — '+fmt(p.quantity*p.size)+' litres packed':''} · ${p.cents===null?'Quotation required':money(p.cents)+(p.bulkApplied?' (bulk)':'')}${p.samplePrice?' · sample price':''}`;$('lines').append(node('p',text));}
    if(result.printingCents)$('lines').append(node('p','Personalised printing: '+money(result.printingCents)+' (N$4 per bottle). 48–72 hours after final artwork approval and order confirmation.'));$('total').textContent=result.total===null?'Final total requires a quotation. Priced product subtotal: '+money(result.subtotal)+( $('labels').checked?' Printing included at N$4 per bottle; artwork approval required.':''):'Estimated product total: '+money(result.total)+' · delivery excluded.';
    $('basis').textContent=`${basis().guests} guests · ${basis().reserve}% reserve. ${fmt(result.allowance.ice)} kg drink-ice allowance; ${fmt(result.allowance.water)} litres drinking-water allowance. Only selected automatic products use these allowances. Manual quantities are additional.`;
    $('error').textContent='';$('continue').disabled=false;
  }catch(e){result=null;$('continue').disabled=true;$('error').textContent=e.message;$('lines').replaceChildren();if(result.printingCents)$('lines').append(node('p','Personalised printing: '+money(result.printingCents)+' (N$4 per bottle). 48–72 hours after final artwork approval and order confirmation.'));$('total').textContent='';$('basis').textContent='';}}
  try{
    const r=await fetch('/api/catalogue');if(!r.ok)throw Error('Catalogue unavailable. Please refresh to load the planner.');products=iceOrderVariants(await r.json());$('products').replaceChildren();
    let cubeGroup=null;for(const p of products){
      if(p.iceType==='regular'){cubeGroup=node('fieldset');cubeGroup.className='gather-cube-group';cubeGroup.append(node('legend',p.baseName+' — select one or both types'));$('products').append(cubeGroup)}
      const row=node('section');row.className='gather-product';const label=node('label'),check=node('input');check.type='checkbox';check.id='gather-choose-'+p.id;check.checked=['ice','water'].includes(p.id)&&p.availability!=='sold-out';check.disabled=p.availability==='sold-out';label.htmlFor=check.id;label.append(check,document.createTextNode(p.name));
      const pack=node('p',`${p.size} ${p.sizeUnit} / ${p.unit} · ${p.availability.replaceAll('-',' ')}`);pack.className='small';
      const methodLabel=node('label','Quantity method'),method=node('select');method.id='gather-mode-'+p.id;methodLabel.htmlFor=method.id;const g=gatheringGroup(p);
      if(g){const opt=node('option',g==='ice'?'Share the drink-ice estimate':'Share the drinking-water estimate');opt.value='auto';method.append(opt)}const manual=node('option','Enter quantity myself');manual.value='manual';method.append(manual);
      const qtyLabel=node('label',p.id==='refill'?'Requested litres (manual) / containers (estimated)':'Number of '+p.unit+'s'),qty=node('input');qty.id='gather-qty-'+p.id;qtyLabel.htmlFor=qty.id;qty.type='number';qty.min=p.id==='refill'?'0.1':String(p.minOrder||1);qty.step=p.id==='refill'?'0.1':String(p.orderMultiple||1);qty.max='1000000';qty.value=String(p.minOrder||1);
      row.append(label,pack);if(p.orderMultiple>1)row.append(node('p','Packs of '+p.orderMultiple+' · minimum '+p.minOrder+' bottles ('+p.minOrder/p.orderMultiple+' packs).'));row.append(methodLabel,method,qtyLabel,qty);if(!g)row.append(node('p',p.id==='blocks'?'Cooling ice: enter blocks separately from drink ice.':'Enter units. Pack capacity and final pricing require confirmation.'));if(p.iceType)cubeGroup.append(row);else $('products').append(row);
    }
    form.addEventListener('submit',e=>{e.preventDefault();update()});form.addEventListener('input',update);form.addEventListener('change',update);
    $('continue').onclick=()=>{update();if(!result)return;try{const b=basis(),notes=`Gathering estimate: ${b.guests} guests; ${b.ice} kg drink ice and ${b.water} litres water per guest; ${b.reserve}% reserve. Automatic products share their category allowance equally; whole packs rounded up. Manual products are additional. `+result.lines.map(p=>p.name+': '+p.quantity+' '+p.unit+' ('+p.mode+')').join('; ')+($('labels').checked?'. Personalised bottled-water labels requested; quotation and artwork on WhatsApp.':'');sessionStorage.setItem('coolerboxDraft',JSON.stringify({items:result.lines.map(p=>({id:p.id,quantity:p.quantity,iceType:p.iceType})),category:'Events & celebrations',notes}));location.href='/order?draft=1'+($('labels').checked?'&occasion=1&labels=personalised':'')}catch{$('error').textContent='Could not transfer the draft. Allow browser storage or enter these quantities in Order Now.'}};
    update();
  }catch(e){$('products').textContent=e.message;$('error').textContent='The planner needs catalogue data before it can calculate. No prices have been assumed.';}
})();
if(typeof module!=='undefined')module.exports={calculateGathering,gatheringGroup,iceOrderVariants,iceSelectionKey};
