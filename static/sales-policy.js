function salesWindow(business, date) {
  if (business.weeklyHours && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return business.weeklyHours[String(new Date(date + 'T12:00:00+02:00').getUTCDay())] || null;
  }
  return business.collectionStart || business.collectionEnd
    ? { start: business.collectionStart, end: business.collectionEnd }
    : null;
}

function printingCharge(items, event) {
  if (event?.label !== 'personalised') return 0;
  const count = items
    .filter(i => ['water', 'water330'].includes(i.id))
    .reduce((n, i) => n + i.quantity, 0);
  if (count < 50) throw Error('Personalised labels require at least 50 bottles.');
  return count * 400;
}

function bookingLimits(now = new Date(), policy = {}) {
  const minHours = policy.bookingMinHours ?? 48;
  const maxDays = policy.bookingMaxDays ?? 365;
  const min = now.getTime() + minHours * 3600000;
  const max = now.getTime() + maxDays * 86400000;
  const local = ms => new Date(ms + 7200000).toISOString().slice(0, 16);
  return {
    minDate: local(min).slice(0, 10),
    maxDate: local(max).slice(0, 10),
    earliest: local(min).replace('T', ' '),
    latest: local(max).replace('T', ' '),
  };
}

function validateBooking(policy, date, time, fulfilment, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
    throw Error('Choose a valid collection or delivery date and time.');
  }
  const at = new Date(date + 'T' + time + ':00+02:00');
  if (!Number.isFinite(at.getTime()) || new Date(at.getTime() + 7200000).toISOString().slice(0, 10) !== date) {
    throw Error('Choose a valid collection or delivery date.');
  }
  const hours = (at.getTime() - now.getTime()) / 3600000;
  const min = policy.bookingMinHours ?? 48;
  const maxHours = (policy.bookingMaxDays ?? 365) * 24;
  if (hours < min) {
    throw Error('Please choose a date and time at least ' + min + ' hours from now (48–72 hours notice required before your collection or event).');
  }
  if (hours > maxHours) {
    throw Error('Choose a date within the next 12 months.');
  }
  if (fulfilment === 'delivery') {
    const windows = policy.deliveryWindows || [{ start: '08:00', end: '10:00' }, { start: '16:00', end: '17:00' }];
    if (new Date(date + 'T12:00:00+02:00').getUTCDay() !== (policy.deliveryDay ?? 4) || !windows.some(w => time >= w.start && time <= w.end)) {
      throw Error('Thursday delivery (08:00–10:00 or 16:00–17:00) is for bulk contract clients only. For any other day or time, select Collection and pick up at your agreed time once confirmed.');
    }
  } else {
    const w = salesWindow(policy, date);
    if (w && (time < w.start || time > w.end)) {
      throw Error('Collection on this day is available ' + w.start + '–' + w.end + '.');
    }
  }
  return { scheduledAt: at.toISOString(), hoursNotice: hours };
}

function deliveryEstimate(policy, items, distanceKm, fulfilment) {
  const distinctProducts = new Set(items.map(i => i.id)).size;
  const thresholdMet = distinctProducts >= (policy.freeDeliveryProducts ?? 3);
  const radiusKm = policy.deliveryRadiusKm ?? 25;
  const withinRadius = distanceKm !== null && Number.isFinite(distanceKm) && distanceKm >= 0 && distanceKm <= radiusKm;
  return {
    cents: fulfilment === 'collection' ? 0 : thresholdMet && withinRadius ? 0 : null,
    distinctProducts,
    thresholdMet,
    withinRadius,
    radiusKm,
    distanceKm,
    requiresAddressCheck: fulfilment === 'delivery',
  };
}

if (typeof module !== 'undefined') {
  module.exports = { salesWindow, printingCharge, bookingLimits, validateBooking, deliveryEstimate };
}
