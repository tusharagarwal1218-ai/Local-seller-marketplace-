import React from 'react';
import { CheckCircle2, Download, Printer, X, ShieldCheck, Calendar, CreditCard, Building2, Store } from 'lucide-react';
import { SubscriptionPaymentRecord, ShopSettings } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';

interface SubscriptionInvoiceModalProps {
  invoice: SubscriptionPaymentRecord | null;
  settings: ShopSettings;
  onClose: () => void;
}

export const SubscriptionInvoiceModal: React.FC<SubscriptionInvoiceModalProps> = ({
  invoice,
  settings,
  onClose,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden print:m-0 print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Subscription Invoice & Tax Receipt</h3>
              <p className="text-[11px] text-stone-500 font-mono">#{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 text-stone-900 text-xs space-y-5">
          {/* Top Platform Brand & Status */}
          <div className="flex items-start justify-between border-b border-stone-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-amber-800" />
                <span className="text-base font-extrabold tracking-tight text-stone-950">
                  Local Shopkeeper SaaS
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">Platform Application Service & POS License</p>
              <p className="text-[10px] text-stone-400">License Authority: Global Merchant Systems Ltd.</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                PAID & ACTIVE
              </span>
              <p className="text-[10px] text-stone-400 mt-1 font-mono">
                {formatDateTime(invoice.timestamp)}
              </p>
            </div>
          </div>

          {/* Subscriber & Billing Meta */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-stone-50 p-3.5 border border-stone-200/80">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Billed To (Merchant)
              </span>
              <p className="font-bold text-stone-900 text-xs mt-0.5">{invoice.shopName || settings.shopName}</p>
              <p className="text-[11px] text-stone-600">{settings.ownerName || 'Store Owner'}</p>
              <p className="text-[11px] text-stone-500">{invoice.subscriberPhone || settings.phone}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">{settings.address}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Payment Particulars
              </span>
              <p className="text-[11px] text-stone-700 mt-0.5">
                Gateway: <strong className="uppercase">{invoice.paymentGateway}</strong>
              </p>
              <p className="text-[11px] text-stone-700 font-mono truncate">
                Txn Ref: {invoice.transactionRef}
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                Valid Until: {new Date(invoice.validUntil).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="border rounded-2xl border-stone-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-100 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500">
                <tr>
                  <th className="px-3 py-2">Plan Description</th>
                  <th className="px-3 py-2">Cycle</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-[11px]">
                <tr>
                  <td className="px-3 py-3">
                    <p className="font-bold text-stone-900">{invoice.planName}</p>
                    <p className="text-[10px] text-stone-500">
                      Unrestricted license for POS, Multi-Tier Pricing, Standee & Catalog
                    </p>
                  </td>
                  <td className="px-3 py-3 capitalize font-medium text-stone-600">
                    {invoice.billingCycle}
                  </td>
                  <td className="px-3 py-3 text-right font-mono font-bold text-stone-950">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-baseline border-t border-stone-200 pt-3">
            <span className="text-xs font-bold text-stone-600">Total Subscription Fee Paid:</span>
            <span className="text-xl font-black font-mono text-stone-950">
              {formatCurrency(invoice.amount, invoice.currency)}
            </span>
          </div>

          <div className="rounded-xl bg-amber-50 p-2.5 text-[10px] text-amber-900 border border-amber-200/80">
            Thank you for subscribing to Local Shopkeeper. Your subscription helps us maintain 24/7 cloud sync, scanner capabilities, and multi-tier pricing modules.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-stone-800"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
