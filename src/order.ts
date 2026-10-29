import { Order, OrderItem, Product } from './types';

export function validateOrderItem(item: OrderItem, product: Product): void {
  if (!Number.isInteger(item.quantity) || item.quantity < 1) {
    throw new Error(`Quantity for ${product.name} must be a positive integer.`);
  }

  const minOrder = product.minOrder || 1;
  const orderMultiple = product.orderMultiple || 1;

  if (item.quantity < minOrder) {
    throw new Error(`${product.name}: minimum order is ${minOrder} units.`);
  }

  if (item.quantity % orderMultiple !== 0) {
    throw new Error(`${product.name} must be ordered in packs of ${orderMultiple}.`);
  }

  if (product.availability === 'sold-out') {
    throw new Error(`${product.name} is currently sold out.`);
  }
}

export function buildWhatsAppOrderMessage(order: Order, whatsappNumber: string): string {
  const lines: string[] = [
    'Hello CoolerBox Ice Hub,',
    '',
    `*ENQUIRY REFERENCE: ${order.reference}*`,
    `Customer: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
  ];

  if (order.customer.email) lines.push(`Email: ${order.customer.email}`);
  if (order.customer.business) lines.push(`Business: ${order.customer.business}`);

  lines.push('');
  lines.push(`Requested Date: ${order.details.date} ${order.details.time || ''}`);
  lines.push(`Arrangement: ${order.details.fulfilment.toUpperCase()}`);

  if (order.details.fulfilment === 'delivery' && order.details.address) {
    lines.push(`Delivery Address: ${order.details.address}`);
  }

  lines.push('');
  lines.push('*Items Ordered:*');
  for (const it of order.items) {
    lines.push(`• ${it.quantity} × ${it.name} (${it.size} ${it.sizeUnit})`);
  }

  if (order.details.event) {
    const ev = order.details.event;
    lines.push('');
    lines.push('*Event Details:*');
    if (ev.occasion) lines.push(`Occasion: ${ev.occasion}`);
    if (ev.eventName) lines.push(`Event Name: ${ev.eventName}`);
    if (ev.label) lines.push(`Label Type: ${ev.label}`);
    if (ev.venue) lines.push(`Venue: ${ev.venue}`);
  }

  if (order.details.supplier) {
    const sp = order.details.supplier;
    lines.push('');
    lines.push('*Local Supplier Application:*');
    if (sp.outlet) lines.push(`Outlet: ${sp.outlet}`);
    if (sp.area) lines.push(`Trading Area: ${sp.area}`);
  }

  if (order.details.notes) {
    lines.push('');
    lines.push(`Notes: ${order.details.notes}`);
  }

  lines.push('');
  if (order.totalCents !== null) {
    lines.push(`Estimated Total: N$${(order.totalCents / 100).toFixed(2)}`);
  } else {
    lines.push('Quotation required.');
  }

  lines.push('');
  lines.push('Please confirm prices, availability and arrangements. Thank you!');

  const text = lines.join('\n');
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}
