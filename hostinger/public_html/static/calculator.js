/* CoolerBox event supply estimator. Sample allowances, not an industry standard. */
function calculateSupplies({guests, reserve, icePerGuest, bagKg, waterPerGuest, bottleMl, icePrice, waterPrice}) {
  const rules = [[guests,1,100000,true],[reserve,0,100,false],[icePerGuest,0,100,false],[bagKg,0.1,100,false],[waterPerGuest,0,100,false],[bottleMl,1,10000,false]];
  if (rules.some(([v,min,max,integer]) => !Number.isFinite(v) || v<min || v>max || (integer && !Number.isInteger(v)))) throw new Error('Enter valid quantities within the limits shown in each field. Guests must be a whole number.');
  for (const price of [icePrice,waterPrice]) if (price!==null && (!Number.isFinite(price)||price<0||price>1000000)) throw new Error('Enter a valid price of zero or more, or leave the price blank.');
  const multiplier=1+reserve/100;
  const iceKg=guests*icePerGuest*multiplier, waterLitres=guests*waterPerGuest*multiplier;
  // Tolerance avoids an extra pack caused only by floating-point arithmetic.
  const bags=Math.max(0,Math.ceil(iceKg/bagKg-1e-9)), bottles=Math.max(0,Math.ceil(waterLitres*1000/bottleMl-1e-9));
  const iceCost=icePrice===null?null:bags*icePrice, waterCost=waterPrice===null?null:bottles*waterPrice;
  return {iceKg,waterLitres,bags,bottles,packedIceKg:bags*bagKg,packedWaterLitres:bottles*bottleMl/1000,iceCost,waterCost,total:iceCost===null||waterCost===null?null:iceCost+waterCost};
}
if (typeof document !== 'undefined' && document.getElementById('calculator-form')) {
  const el=id=>document.getElementById('calc-'+id);
  const quantity=n=>n.toLocaleString('en-GB',{maximumFractionDigits:2});
  const money=n=>'N$'+n.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
  let enquiry=null;
  function updateCalculator() {
    try {
      const form=document.getElementById('calculator-form');
      if (!form.checkValidity()) throw new Error('Check your inputs. Enter a whole number of guests, valid quantities and no negative prices.');
      const numeric=id=>el(id).value.trim()===''?NaN:Number(el(id).value);
      const price=id=>el(id).value.trim()===''?null:Number(el(id).value);
      const guests=numeric('guests'),reserve=numeric('reserve'),bagKg=numeric('bag'),bottleMl=numeric('bottle');
      let r=calculateSupplies({guests,reserve,bagKg,bottleMl,icePerGuest:numeric('ice'),waterPerGuest:numeric('water'),icePrice:price('ice-price'),waterPrice:price('water-price')});
      if(window.catalogueProducts){
        for(const [id,pack,quantity,field] of [['ice',bagKg,r.bags,'ice-price'],['water',bottleMl,r.bottles,'water-price']]){
          const p=window.catalogueProducts.find(p=>p.id===id);const rate=p&&p.size===pack?(quantity>=p.bulkMinimum&&p.bulkPrice!==null?p.bulkPrice:p.retailPrice):null;
          el(field).value=rate===null?'':rate;el(field).readOnly=true;el(field).placeholder='Catalogue quote required';
        }
        r=calculateSupplies({guests,reserve,bagKg,bottleMl,icePerGuest:numeric('ice'),waterPerGuest:numeric('water'),icePrice:price('ice-price'),waterPrice:price('water-price')});
      }
      el('ice-result').textContent=quantity(r.bags)+' ice '+(r.bags===1?'bag':'bags');
      el('ice-detail').textContent=`${quantity(r.iceKg)} kg estimated → ${quantity(r.bags)} × ${quantity(bagKg)} kg = ${quantity(r.packedIceKg)} kg packed`;
      el('water-result').textContent=quantity(r.bottles)+' water '+(r.bottles===1?'bottle':'bottles');
      el('water-detail').textContent=`${quantity(r.waterLitres)} litres estimated → ${quantity(r.bottles)} × ${quantity(bottleMl)} ml = ${quantity(r.packedWaterLitres)} litres packed`;
      el('summary').textContent=`For ${quantity(guests)} guests with ${quantity(reserve)}% extra. Whole packs rounded up.`;
      const costs=[];
      if(r.iceCost!==null) costs.push('Ice subtotal: '+money(r.iceCost));
      if(r.waterCost!==null) costs.push('Water subtotal: '+money(r.waterCost));
      if(r.total!==null) costs.push('Estimated product total: '+money(r.total));
      el('price-result').textContent=costs.length?costs.join(' · ')+(r.total===null?' · Combined total needs both prices.':' · Excludes transport and extra charges.'):'Enter quoted prices to estimate product cost.';
      enquiry={inputs:{guests,reserve,bagKg,bottleMl,icePerGuest:numeric('ice'),waterPerGuest:numeric('water'),icePrice:price('ice-price'),waterPrice:price('water-price')},quantity:`${r.bags} × ${bagKg} kg ice bags; ${r.bottles} × ${bottleMl} ml water bottles`,notes:`Calculator estimate for ${guests} guests, ${reserve}% reserve. Please confirm pack sizes, availability and final pricing.`};
      el('error').textContent='';el('enquire').disabled=false;
    } catch (e) {
      enquiry=null;el('enquire').disabled=true;el('error').textContent=e.message;
      el('ice-result').textContent='—';el('water-result').textContent='—';
      ['ice-detail','water-detail','summary','price-result'].forEach(id=>el(id).textContent='');
    }
  }
  document.getElementById('calculator-form').addEventListener('submit',event=>{event.preventDefault();updateCalculator()});
  document.getElementById('calculator-form').addEventListener('input',updateCalculator);
  document.getElementById('calculator-form').addEventListener('change',updateCalculator);
  el('enquire').addEventListener('click',()=>{
    updateCalculator();if(!enquiry)return;
    window.dispatchEvent(new CustomEvent('coolerbox:estimate',{detail:enquiry.inputs}));
  });
  updateCalculator();
}
if (typeof module !== 'undefined') module.exports={calculateSupplies};
