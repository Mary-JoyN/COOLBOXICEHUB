/* Supplier application shares the saved enquiry journey; it never grants approval. */
window.Supplier=(()=>{
const category='Local supplier application',iceIds=['ice','ice3','ice5','ice--gourmet','ice3--gourmet','ice5--gourmet','blocks','cups','cups500'],$=id=>document.getElementById(id);
let products=[],refresh=()=>{},enabled=false;
function sync(value,initial=false){
 const changed=enabled!==value;enabled=value;$('supplier-enabled').checked=value;document.body.classList.toggle('supplier-order',value);
 $('supplier-fields').hidden=!value;for(const el of $('supplier-fields').querySelectorAll('input,select'))el.disabled=!value;
 $('supplier-area').required=value;$('supplier-acknowledged').required=value;$('order-business').required=value;
 document.querySelector('label[for="order-business"]').textContent=value?'Business / trading name (required)':'Business / organisation (optional)';
 if(value){$('order-category').value=category;$('order-offer').value='';$('order-offer-note').textContent='Supplier applications use individual product quantities. Quotes and terms are agreed with the team.';if(initial||changed){if(!iceIds.some(id=>$('choose-'+id)?.checked)){const p=products.find(p=>iceIds.includes(p.id)&&p.availability!=='sold-out');if(p)$('choose-'+p.id).checked=true;}for(const id of iceIds){const q=$('qty-'+id);if(q&&$('choose-'+id).checked)q.value=Math.max(50,Number(q.value)||0);}if($('order-frequency').value==='Once-off order')$('order-frequency').value='To be discussed';}}
 else{if($('order-category').value===category)$('order-category').value='Home / individual bulk order';$('order-offer-note').textContent='';}
 $('order-offer').disabled=value;for(const id of iceIds){const q=$('qty-'+id);if(q)q.min=value?'50':'1';}
 $('supplier-status').textContent=value?'Supplier mode is active. Each selected ice product needs at least 50 units per delivery. Add your trading details in step 3.':'';
 window.dispatchEvent(new Event('coolerbox:supplierchange'));refresh();
}
function init(list,onChange){products=list;refresh=onChange;$('supplier-enabled').onchange=()=>sync($('supplier-enabled').checked);$('order-category').addEventListener('change',()=>sync($('order-category').value===category));sync(new URLSearchParams(location.search).has('supplier')||$('order-category').value===category,true);}
function validate(items){if(!enabled)return;const ice=items.filter(i=>iceIds.includes(i.id));if(!ice.length)throw Error('Select at least one ice product for your supplier application.');if(ice.some(i=>i.quantity<50))throw Error('Supplier minimum: 50 units of each selected ice product per delivery.');}
function draft(){return enabled?{area:$('supplier-area').value.trim(),outlet:$('supplier-outlet').value,acknowledged:$('supplier-acknowledged').checked}:undefined;}
return {init,validate,draft,isEnabled:()=>enabled};
})();
