window.CB={
 productGroup(id){return ['water','water330','refill'].includes(id)?'Purified drinking water':(['slushies','icelollies'].includes(id)?'Cold refreshments':'Ice products')},
 earliestDate(lead,cutoff){const now=new Date(),date=this.today(),time=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Windhoek',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now),d=new Date(date+'T12:00:00+02:00');d.setUTCDate(d.getUTCDate()+lead+(cutoff&&time>=cutoff?1:0));return d.toISOString().slice(0,10)},
 node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=text;if(cls)n.className=cls;return n},
 async api(url,options){const r=await fetch(url,options);const d=await r.json();if(!r.ok)throw Error(d.error||'Request failed. Please try again.');return d},
 money(n){return 'N$'+n.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})},
 today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Windhoek',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())},
 async upload(file){if(!file)return null;if(file.size>5000000)throw Error('Use a JPG, PNG or WebP image smaller than 5 MB.');const f=new FormData();f.append('file',file);return (await this.api('/api/images',{method:'POST',body:f})).url},
 active(p){return p.type==='promotion'&&p.status==='published'&&(!p.expires||p.expires>=this.today())},
 price(p,q,iceType){const retail=iceType==='gourmet'?p.gourmetRetailPrice??null:p.retailPrice,bulk=iceType==='gourmet'?p.gourmetBulkPrice??null:p.bulkPrice;return q>=p.bulkMinimum&&bulk!==null?bulk:retail}
};
