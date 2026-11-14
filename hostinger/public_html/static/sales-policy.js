function salesWindow(business,date){if(business.weeklyHours&&/^\d{4}-\d{2}-\d{2}$/.test(date)){return business.weeklyHours[String(new Date(date+'T12:00:00+02:00').getUTCDay())]||null;}return business.collectionStart||business.collectionEnd?{start:business.collectionStart,end:business.collectionEnd}:null;}
function printingCharge(items,event){if(event?.label!=='personalised')return 0;const count=items.filter(i=>['water','water330'].includes(i.id)).reduce((n,i)=>n+i.quantity,0);if(count<50)throw Error('Personalised labels require at least 50 bottles.');return count*400;}
function bookingLimits(now=new Date(),policy={}){
 const min=now.getTime()+(policy.bookingMinHours??48)*3600000,max=now.getTime()+(policy.bookingMaxHours??72)*3600000;
 const local=ms=>new Date(ms+7200000).toISOString().slice(0,16);
 return {minDate:local(min).slice(0,10),maxDate:local(max).slice(0,10),earliest:local(min).replace('T',' '),latest:local(max).replace('T',' ')};
}
function validateBooking(policy,date,time,fulfilment,now=new Date()){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(time))throw Error('Choose a valid fulfilment date and time.');
 const at=new Date(date+'T'+time+':00+02:00');if(!Number.isFinite(at.getTime())||new Date(at.getTime()+7200000).toISOString().slice(0,10)!==date)throw Error('Choose a valid fulfilment date.');
 const hours=(at.getTime()-now.getTime())/3600000,min=policy.bookingMinHours??48,max=policy.bookingMaxHours??72;
 if(hours<min||hours>max)throw Error('Orders must be placed strictly '+min+'–'+max+' hours before collection or delivery. Choose a time within the displayed booking window.');
 if(fulfilment==='delivery'){
  const windows=policy.deliveryWindows||[{start:'08:00',end:'10:00'},{start:'16:00',end:'17:00'}];
  if(new Date(date+'T12:00:00+02:00').getUTCDay()!==(policy.deliveryDay??4)||!windows.some(w=>time>=w.start&&time<=w.end))throw Error('Delivery is Thursday only, 08:00–10:00 or 16:00–17:00 (Windhoek time).');
 }else{const w=salesWindow(policy,date);if(w&&(time<w.start||time>w.end))throw Error('Collection on this day is available '+w.start+'–'+w.end+'.');}
 return {scheduledAt:at.toISOString(),hoursNotice:hours};
}
function deliveryEstimate(policy,items,distanceKm,fulfilment){
 const distinctProducts=new Set(items.map(i=>i.id)).size,thresholdMet=distinctProducts>=(policy.freeDeliveryProducts??3),radiusKm=policy.deliveryRadiusKm??25;
 const withinRadius=distanceKm!==null&&Number.isFinite(distanceKm)&&distanceKm>=0&&distanceKm<=radiusKm;
 return {cents:fulfilment==='collection'?0:thresholdMet&&withinRadius?0:null,distinctProducts,thresholdMet,withinRadius,radiusKm,distanceKm,requiresAddressCheck:fulfilment==='delivery'};
}
if(typeof module!=='undefined')module.exports={salesWindow,printingCharge,bookingLimits,validateBooking,deliveryEstimate};
