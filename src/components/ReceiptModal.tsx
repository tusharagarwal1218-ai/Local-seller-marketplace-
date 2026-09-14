import React, { useState } from 'react';
import { Printer, Share2, Check, X, PhoneCall } from 'lucide-react';
import { Order, ShopSettings } from '../types';
import { formatCurrency, formatDateTime, openWhatsAppReceipt, generateWhatsAppReceiptText } from '../utils/formatters';

interface ReceiptModalProps {
  order: Order | null;
  settings: ShopSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, settings, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [customPhone, setCustomPhone] = useState(order?.customerPhone || '');
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const rawText = decodeURIComponent(generateWhatsAppReceiptText(order, settings));
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    openWhatsAppReceipt(order, settings, customPhone);
  };

  const paymentMethodNames: Record<string, string> = {
    cash: 'Cash',
    upi_qr: 'UPI / QR Scan',
    card: 'Card',
    store_credit: 'Store Credit (Udhar)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-stone-900/10">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-bold text-stone-900">Sale Receipt</h3>
            <span className="rounded bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-600">
              {order.receiptNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body (also targeted by #printable-receipt for print) */}
        <div className="overflow-y-auto p-5">
          <div
            id="printable-receipt"
            className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 font-mono text-xs text-stone-800 shadow-inner"
          >
            {/* Store Header */}
            <div className="text-center">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-stone-900">
                {settings.shopName}
              </h2>
              {settings.tagline && (
                <p className="mt-0.5 text-[11px] text-stone-500 italic">{settings.tagline}</p>
              )}
              <p className="mt-1 text-[11px] text-stone-600">{settings.address}</p>
              <p className="text-[11px] text-stone-600">Ph: {settings.phone}</p>
              {settings.upiId && <p className="text-[10px] text-stone-500">UPI: {settings.upiId}</p>}
            </div>

            <div className="my-3 border-b border-dashed border-stone-400"></div>

            {/* Receipt Info */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-stone-500">Receipt No:</span>
                <span className="font-semibold">{order.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Date & Time:</span>
                <span>{formatDateTime(order.timestamp)}</span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Customer:</span>
                  <span className="font-semibold">{order.customerName}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Phone:</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
            </div>

            <div className="my-3 border-b border-dashed border-stone-400"></div>

            {/* Items Table */}
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-stone-900 border-b border-stone-300 pb-1">
                <span className="w-1/2">ITEM</span>
                <span className="w-1/4 text-center">QTY</span>
                <span className="w-1/4 text-right">AMT</span>
              </div>
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start text-[11px]">
                  <div className="w-1/2 pr-1">
                    <p className="font-medium text-stone-900 line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-stone-500">
                      @{formatCurrency(item.price, settings.currency)}/{item.unit}
                    </p>
                  </div>
                  <div className="w-1/4 text-center text-stone-700">
                    {item.quantity} {item.unit}
                  </div>
                  <div className="w-1/4 text-right font-semibold text-stone-900">
                    {formatCurrency(item.total, settings.currency)}
                  </div>
                </div>
              ))}
            </div>

            <div className="my-3 border-b border-dashed border-stone-400"></div>

            {/* Totals Calculation */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({order.items.length} items):</span>
                <span>{formatCurrency(order.subtotal, settings.currency)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({order.discountPercent}%):</span>
                  <span>-{formatCurrency(order.discount, settings.currency)}</span>
                </div>
              )}

              {order.tax > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Tax ({settings.taxRate}%):</span>
                  <span>+{formatCurrency(order.tax, settings.currency)}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-stone-400 pt-1.5 text-sm font-bold text-stone-950">
                <span>GRAND TOTAL:</span>
                <span>{formatCurrency(order.total, settings.currency)}</span>
              </div>

              <div className="flex justify-between pt-1 text-[11px] text-stone-600">
                <span>Payment Mode:</span>
                <span className="font-semibold text-stone-900">
                  {paymentMethodNames[order.paymentMethod] || order.paymentMethod}
                </span>
              </div>

              {order.paymentMethod === 'cash' && order.cashReceived && (
                <>
                  <div className="flex justify-between text-stone-600">
                    <span>Cash Received:</span>
                    <span>{formatCurrency(order.cashReceived, settings.currency)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-stone-900">
                    <span>Change Returned:</span>
                    <span>{formatCurrency(order.changeGiven || 0, settings.currency)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="my-4 border-b border-dashed border-stone-400"></div>

            {/* Receipt Footer Message */}
            <div className="text-center text-[10px] text-stone-500 space-y-1">
              <p>{settings.receiptFooter}</p>
              <p className="font-sans text-[9px] text-stone-400">Local Shopkeeper POS System</p>
            </div>
          </div>

          {/* Quick WhatsApp Phone Number Input */}
          <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">Share with Customer:</span>
              <button
                type="button"
                onClick={() => setShowPhoneInput(!showPhoneInput)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                {showPhoneInput ? 'Hide' : 'Enter WhatsApp Number'}
              </button>
            </div>

            {showPhoneInput && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="tel"
                  placeholder="Customer Phone (e.g. +1 555 123 4567)"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 bg-stone-50 px-5 py-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95"
            >
              <PhoneCall className="h-4 w-4" />
              <span>WhatsApp Bill</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-stone-800 active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
