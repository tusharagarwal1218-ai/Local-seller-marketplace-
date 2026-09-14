import React, { useState, useMemo } from 'react';
import {
  ReceiptText,
  Search,
  DollarSign,
  QrCode,
  CreditCard,
  BookOpen,
  Calendar,
  Share2,
  Download,
  Eye,
  Trash2,
  TrendingUp,
  X
} from 'lucide-react';
import { Order, ShopSettings, PaymentMethod } from '../types';
import { formatCurrency, formatDateTime, openWhatsAppReceipt } from '../utils/formatters';

interface SalesLedgerProps {
  orders: Order[];
  settings: ShopSettings;
  onViewReceipt: (order: Order) => void;
  onClearSales?: () => void;
}

export const SalesLedger: React.FC<SalesLedgerProps> = ({
  orders,
  settings,
  onViewReceipt,
  onClearSales,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterTimeframe, setFilterTimeframe] = useState<'all' | 'today' | 'week'>('all');

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000;

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Timeframe
      if (filterTimeframe === 'today' && ord.timestamp < startOfToday) return false;
      if (filterTimeframe === 'week' && ord.timestamp < startOfWeek) return false;

      // Payment method
      if (filterMethod !== 'all' && ord.paymentMethod !== filterMethod) return false;

      // Search
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        ord.receiptNumber.toLowerCase().includes(q) ||
        (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
        (ord.customerPhone && ord.customerPhone.includes(q)) ||
        ord.items.some((i) => i.name.toLowerCase().includes(q))
      );
    });
  }, [orders, filterTimeframe, filterMethod, searchQuery, startOfToday, startOfWeek]);

  // Aggregate stats
  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, ord) => sum + ord.total, 0),
    [filteredOrders]
  );

  const totalItemsSold = useMemo(
    () =>
      filteredOrders.reduce(
        (sum, ord) => sum + ord.items.reduce((s, i) => s + i.quantity, 0),
        0
      ),
    [filteredOrders]
  );

  const paymentBreakdown = useMemo(() => {
    const map = {
      cash: 0,
      upi_qr: 0,
      card: 0,
      store_credit: 0,
    };
    filteredOrders.forEach((o) => {
      if (map[o.paymentMethod] !== undefined) {
        map[o.paymentMethod] += o.total;
      }
    });
    return map;
  }, [filteredOrders]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No sales to export.');
      return;
    }

    const headers = [
      'Receipt Number',
      'Date Time',
      'Customer',
      'Phone',
      'Payment Method',
      'Items Summary',
      'Subtotal',
      'Discount',
      'Tax',
      'Total',
    ];

    const rows = filteredOrders.map((o) => [
      o.receiptNumber,
      `"${new Date(o.timestamp).toLocaleString()}"`,
      `"${o.customerName || 'Walk-in'}"`,
      `"${o.customerPhone || ''}"`,
      o.paymentMethod,
      `"${o.items.map((i) => `${i.quantity}x ${i.name}`).join('; ')}"`,
      o.subtotal.toFixed(2),
      o.discount.toFixed(2),
      o.tax.toFixed(2),
      o.total.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Filtered Sales Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-stone-900 font-mono">
            {formatCurrency(totalRevenue, settings.currency)}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Across {filteredOrders.length} transaction{filteredOrders.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Cash Collected</span>
            <DollarSign className="h-4 w-4 text-amber-700" />
          </div>
          <p className="mt-1 text-2xl font-black text-stone-900 font-mono">
            {formatCurrency(paymentBreakdown.cash, settings.currency)}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">Physical currency in drawer</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Digital (UPI & Card)</span>
            <QrCode className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-stone-900 font-mono">
            {formatCurrency(paymentBreakdown.upi_qr + paymentBreakdown.card, settings.currency)}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">Bank transfer & card settlements</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Store Credit (Udhar)</span>
            <BookOpen className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-stone-900 font-mono">
            {formatCurrency(paymentBreakdown.store_credit, settings.currency)}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">Pending customer balance</p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs mb-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by receipt #, customer name, phone, or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-stone-50 py-2 pl-10 pr-3 text-xs text-stone-900 focus:border-amber-600 focus:bg-white focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Timeframe & Payment Method Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterTimeframe}
              onChange={(e) => setFilterTimeframe(e.target.value as any)}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 focus:border-amber-600 focus:outline-hidden"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="week">Past 7 Days</option>
            </select>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 focus:border-amber-600 focus:outline-hidden"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">💵 Cash Only</option>
              <option value="upi_qr">📱 UPI / QR Only</option>
              <option value="card">💳 Card Only</option>
              <option value="store_credit">📒 Store Credit (Udhar)</option>
            </select>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="border-b border-stone-200 bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="py-3.5 pl-4 pr-3">Receipt / Date</th>
                <th className="px-3 py-3.5">Customer</th>
                <th className="px-3 py-3.5">Items Sold</th>
                <th className="px-3 py-3.5">Payment</th>
                <th className="px-3 py-3.5 text-right">Amount</th>
                <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <ReceiptText className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                    <p className="font-semibold text-stone-600">No transactions recorded yet</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Sales made in the POS Register will appear here automatically.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const paymentBadges: Record<string, { label: string; bg: string; text: string }> = {
                    cash: { label: 'Cash', bg: 'bg-amber-100', text: 'text-amber-900' },
                    upi_qr: { label: 'UPI / QR', bg: 'bg-emerald-100', text: 'text-emerald-900' },
                    card: { label: 'Card', bg: 'bg-blue-100', text: 'text-blue-900' },
                    store_credit: { label: 'Store Credit', bg: 'bg-purple-100', text: 'text-purple-900' },
                  };
                  const badge = paymentBadges[order.paymentMethod] || {
                    label: order.paymentMethod,
                    bg: 'bg-stone-100',
                    text: 'text-stone-800',
                  };

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Receipt & Timestamp */}
                      <td className="py-3 pl-4 pr-3">
                        <span className="font-mono font-bold text-stone-900">
                          {order.receiptNumber}
                        </span>
                        <p className="text-[11px] text-stone-500">
                          {formatDateTime(order.timestamp)}
                        </p>
                      </td>

                      {/* Customer Info */}
                      <td className="px-3 py-3">
                        <p className="font-semibold text-stone-900">
                          {order.customerName || 'Walk-in Customer'}
                        </p>
                        {order.customerPhone && (
                          <p className="text-[11px] text-stone-500 font-mono">
                            {order.customerPhone}
                          </p>
                        )}
                      </td>

                      {/* Items */}
                      <td className="px-3 py-3">
                        <span className="font-medium text-stone-900">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </span>
                        <p className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                      </td>

                      {/* Payment Method */}
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-3 py-3 text-right">
                        <span className="font-mono text-sm font-black text-stone-900">
                          {formatCurrency(order.total, settings.currency)}
                        </span>
                        {order.discount > 0 && (
                          <p className="text-[10px] text-emerald-700">
                            Disc: -{formatCurrency(order.discount, settings.currency)}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewReceipt(order)}
                            title="View / Print Receipt"
                            className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Bill</span>
                          </button>
                          <button
                            onClick={() => openWhatsAppReceipt(order, settings)}
                            title="Share on WhatsApp"
                            className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
