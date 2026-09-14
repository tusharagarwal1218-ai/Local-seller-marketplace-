import React, { useState } from 'react';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Phone,
  User,
  Clock,
  CheckCircle2,
  Send,
  Truck,
  Store,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { CartItem, CustomerProfile, Order, Product, ShopSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CustomerOrderBoxProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number, variantId?: string) => void;
  onClearCart: () => void;
  customerProfile: CustomerProfile;
  onUpdateProfile: (profile: CustomerProfile) => void;
  settings: ShopSettings;
  onPlaceCustomerOrder: (order: Order) => void;
}

export const CustomerOrderBox: React.FC<CustomerOrderBoxProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onClearCart,
  customerProfile,
  onUpdateProfile,
  settings,
  onPlaceCustomerOrder,
}) => {
  const [orderType, setOrderType] = useState<'customer_delivery' | 'customer_pickup'>('customer_delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentPreference, setPaymentPreference] = useState<'cash' | 'upi_qr'>('cash');
  
  // Inline profile editing if not filled
  const [name, setName] = useState(customerProfile.name || '');
  const [phone, setPhone] = useState(customerProfile.phone || '');
  const [address, setAddress] = useState(customerProfile.address || '');

  // Completed order state for instant confirmation view
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Totals calculation
  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = item.customPrice ?? item.product.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const mrpTotal = cart.reduce((sum, item) => {
    const mrp = item.product.mrp ?? item.product.price;
    return sum + mrp * item.quantity;
  }, 0);

  const totalSavings = Math.max(0, mrpTotal - subtotal);
  const tax = settings.enableTax ? (subtotal * settings.taxRate) / 100 : 0;
  const deliveryFee = 0; // Free neighborhood delivery
  const grandTotal = subtotal + tax + deliveryFee;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!name.trim() || !phone.trim() || (orderType === 'customer_delivery' && !address.trim())) {
      alert('Please fill in your name, mobile number, and address to place the order.');
      return;
    }

    // Save profile updates
    onUpdateProfile({
      ...customerProfile,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      isLoggedIn: true,
    });

    const tokenNum = Math.floor(100 + Math.random() * 900);
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    const newOrder: Order = {
      id: orderId,
      receiptNumber: `TKN-${tokenNum}`,
      timestamp: Date.now(),
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        localName: item.product.localName,
        variantName: item.variantName,
        unit: item.variantName || item.product.unit,
        price: item.customPrice ?? item.product.price,
        mrp: item.product.mrp,
        quantity: item.quantity,
        total: (item.customPrice ?? item.product.price) * item.quantity,
      })),
      subtotal,
      discount: totalSavings,
      discountPercent: 0,
      tax,
      total: grandTotal,
      paymentMethod: paymentPreference,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerAddress: orderType === 'customer_delivery' ? address.trim() : 'Store Counter Pickup',
      orderType,
      orderStatus: 'pending',
      status: 'completed',
      notes: orderNotes.trim() || undefined,
    };

    onPlaceCustomerOrder(newOrder);
    setConfirmedOrder(newOrder);
    onClearCart();
  };

  const handleSendWhatsAppOrder = (order: Order) => {
    const itemsList = order.items
      .map((it) => `• ${it.name}${it.variantName ? ` (${it.variantName})` : ''} x ${it.quantity} = ${formatCurrency(it.total, settings.currency)}`)
      .join('\n');

    const cleanPhone = settings.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `🛒 *NEW CUSTOMER ORDER - ${order.receiptNumber}*\n\n` +
      `*Store:* ${settings.shopName}\n` +
      `*Customer:* ${order.customerName} (${order.customerPhone})\n` +
      `*Type:* ${order.orderType === 'customer_delivery' ? '🛵 Home Delivery' : '🏪 Store Pickup'}\n` +
      (order.customerAddress ? `*Address:* ${order.customerAddress}\n` : '') +
      (order.notes ? `*Note:* ${order.notes}\n` : '') +
      `\n*ITEMS:*\n${itemsList}\n\n` +
      `*Total Amount:* ${formatCurrency(order.total, settings.currency)}\n` +
      `*Payment:* ${order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'UPI / Online'}\n\n` +
      `Please confirm my order. Thank you!`
    );

    window.open(`https://wa.me/${cleanPhone || '919876543210'}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-stone-900/70 backdrop-blur-xs">
      <div className="h-full w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in">
        {/* Order Box Top Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-700 text-white shadow-xs">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                {confirmedOrder ? 'Order Confirmed!' : 'Customer Order Box'}
              </h3>
              <p className="text-xs text-stone-500">
                {confirmedOrder
                  ? 'Your order was sent to the shopkeeper'
                  : `${cart.length} item${cart.length === 1 ? '' : 's'} in your order`}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setConfirmedOrder(null);
              onClose();
            }}
            className="rounded-xl p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Confirmed Order State */}
        {confirmedOrder ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div>
              <span className="rounded-full bg-amber-100 px-3 py-1 font-mono text-xs font-bold text-amber-900">
                Token: {confirmedOrder.receiptNumber}
              </span>
              <h4 className="mt-2 text-xl font-extrabold text-stone-900">
                Order Received at {settings.shopName}!
              </h4>
              <p className="mt-1 text-xs text-stone-600">
                {confirmedOrder.orderType === 'customer_delivery'
                  ? 'Estimated delivery: 25 - 40 mins'
                  : 'Ready for pickup in 15 mins at counter'}
              </p>
            </div>

            {/* Order summary card */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-left space-y-3">
              <div className="flex justify-between text-xs font-semibold text-stone-600 border-b border-stone-200 pb-2">
                <span>Order ID: {confirmedOrder.id}</span>
                <span className="font-bold text-stone-900">
                  {formatCurrency(confirmedOrder.total, settings.currency)}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-stone-500 font-medium">Customer Details:</p>
                <p className="font-semibold text-stone-900">{confirmedOrder.customerName} ({confirmedOrder.customerPhone})</p>
                {confirmedOrder.customerAddress && (
                  <p className="text-stone-600 line-clamp-2">📍 {confirmedOrder.customerAddress}</p>
                )}
              </div>

              <div className="border-t border-stone-200 pt-2 space-y-1">
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-stone-700">
                    <span>
                      {item.quantity}x {item.name} {item.variantName ? `(${item.variantName})` : ''}
                    </span>
                    <span className="font-medium">{formatCurrency(item.total, settings.currency)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSendWhatsAppOrder(confirmedOrder)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
              >
                <Send className="h-4 w-4" />
                <span>Send Order Copy on WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  onClose();
                }}
                className="w-full rounded-2xl border border-stone-300 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                Done & Continue Browsing
              </button>
            </div>
          </div>
        ) : (
          /* Active Order Creation Form */
          <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Delivery vs Pickup Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Choose Fulfillment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('customer_delivery')}
                    className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all ${
                      orderType === 'customer_delivery'
                        ? 'border-amber-700 bg-amber-50 text-amber-900 shadow-xs ring-1 ring-amber-700/20'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Truck className="h-4 w-4 text-amber-700" />
                    <span>Home Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('customer_pickup')}
                    className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition-all ${
                      orderType === 'customer_pickup'
                        ? 'border-amber-700 bg-amber-50 text-amber-900 shadow-xs ring-1 ring-amber-700/20'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Store className="h-4 w-4 text-amber-700" />
                    <span>Store Pickup</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Order Items ({cart.length})
                  </label>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={onClearCart}
                      className="text-[11px] font-semibold text-stone-400 hover:text-red-600"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center text-stone-400">
                    <ShoppingBag className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                    <p className="text-xs font-semibold">Your order box is empty</p>
                    <p className="text-[11px] text-stone-400 mt-1">Tap + on any product in the showcase to add</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-stone-50/50 p-2 max-h-52 overflow-y-auto">
                    {cart.map((item) => {
                      const unitPrice = item.customPrice ?? item.product.price;
                      return (
                        <div key={`${item.product.id}-${item.variantId || 'base'}`} className="flex items-center justify-between py-2 px-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-10 w-10 rounded-lg object-cover shrink-0 border border-stone-200"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-900 truncate">
                                {item.product.name}
                              </p>
                              <p className="text-[11px] text-stone-500">
                                {item.variantName || item.product.unit} • {formatCurrency(unitPrice, settings.currency)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center rounded-xl border border-stone-200 bg-white">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.product.id, -1, item.variantId)}
                                className="p-1 text-stone-500 hover:text-stone-900"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 text-xs font-bold text-stone-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.product.id, 1, item.variantId)}
                                className="p-1 text-stone-500 hover:text-stone-900"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="w-14 text-right text-xs font-bold font-mono text-stone-900">
                              {formatCurrency(unitPrice * item.quantity, settings.currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Customer Contact & Address Details */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-amber-700" />
                  <span>Your Delivery & Contact Details</span>
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-0.5 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="Mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-0.5 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {orderType === 'customer_delivery' && (
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Delivery Address</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Flat, building, street, landmark"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-0.5 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-semibold text-stone-600">Special Notes for Shopkeeper (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Call before delivery, ring bell twice"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="mt-0.5 w-full rounded-xl border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentPreference('cash')}
                    className={`rounded-xl border p-2 text-xs font-bold ${
                      paymentPreference === 'cash'
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    💵 Cash on Delivery / Counter
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentPreference('upi_qr')}
                    className={`rounded-xl border p-2 text-xs font-bold ${
                      paymentPreference === 'upi_qr'
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    📱 UPI / QR Scan
                  </button>
                </div>
              </div>
            </div>

            {/* Bill Summary & Sticky Checkout Footer */}
            <div className="border-t border-stone-200 bg-stone-50 p-4 space-y-3">
              <div className="space-y-1 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">{formatCurrency(subtotal, settings.currency)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount vs MRP:</span>
                    <span>- {formatCurrency(totalSavings, settings.currency)}</span>
                  </div>
                )}
                {settings.enableTax && (
                  <div className="flex justify-between">
                    <span>Tax ({settings.taxRate}%):</span>
                    <span className="font-mono">{formatCurrency(tax, settings.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span className="font-semibold text-emerald-700">Free Neighborhood Delivery</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-1 text-sm font-black text-stone-950">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base text-amber-800">
                    {formatCurrency(grandTotal, settings.currency)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-800 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-amber-900 disabled:opacity-40 transition-all"
              >
                <span>Confirm & Place Order</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
