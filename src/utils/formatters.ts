import { Order, ShopSettings } from '../types';

export function formatCurrency(amount: number, currency: string = '$'): string {
  if (isNaN(amount)) return `${currency}0.00`;
  return `${currency}${amount.toFixed(2)}`;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} • ${formatTime(timestamp)}`;
}

export function generateReceiptNumber(): string {
  const now = new Date();
  const dateStr = `${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RCP-${dateStr}-${randomSuffix}`;
}

export function generateWhatsAppReceiptText(order: Order, settings: ShopSettings): string {
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. *${item.name}* (${item.unit})\n   ${item.quantity} x ${settings.currency}${item.price.toFixed(2)} = *${settings.currency}${item.total.toFixed(2)}*`
    )
    .join('\n');

  const discountLine = order.discount > 0 ? `\n🎁 *Discount:* -${settings.currency}${order.discount.toFixed(2)}` : '';
  const taxLine = order.tax > 0 ? `\n🏛 *Tax (${settings.taxRate}%):* ${settings.currency}${order.tax.toFixed(2)}` : '';

  const paymentLabels: Record<string, string> = {
    cash: '💵 Cash',
    upi_qr: '📱 UPI / QR Scan',
    card: '💳 Card Payment',
    store_credit: '📒 Store Credit (Udhar)',
  };

  const paymentText = paymentLabels[order.paymentMethod] || order.paymentMethod;

  const text = `🧾 *RECEIPT - ${settings.shopName.toUpperCase()}*
${settings.tagline ? `_${settings.tagline}_\n` : ''}📍 ${settings.address}
📞 ${settings.phone}
-----------------------------
*Receipt #:* ${order.receiptNumber}
*Date:* ${formatDateTime(order.timestamp)}
${order.customerName ? `*Customer:* ${order.customerName}\n` : ''}-----------------------------
${itemsText}
-----------------------------
*Subtotal:* ${settings.currency}${order.subtotal.toFixed(2)}${discountLine}${taxLine}
*TOTAL PAID:* *${settings.currency}${order.total.toFixed(2)}*
*Payment Mode:* ${paymentText}
-----------------------------
${settings.receiptFooter}
`;

  return encodeURIComponent(text);
}

export function openWhatsAppReceipt(order: Order, settings: ShopSettings, customPhone?: string) {
  const encodedText = generateWhatsAppReceiptText(order, settings);
  const targetPhone = customPhone || order.customerPhone || '';
  const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
  
  const url = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
    
  window.open(url, '_blank', 'noopener,noreferrer');
}
