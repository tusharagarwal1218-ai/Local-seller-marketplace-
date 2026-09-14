import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  QrCode,
  CreditCard,
  BookOpen,
  CheckCircle2,
  ShoppingBag,
  PackagePlus,
  X,
  Sparkles,
  Percent,
  Camera,
  Layers,
  Tag,
  Check,
  Building2,
  Users
} from 'lucide-react';
import {
  Product,
  CartItem,
  PaymentMethod,
  ShopSettings,
  Order,
  Category,
  PricingTier,
  ProductVariant
} from '../types';
import { formatCurrency, generateReceiptNumber } from '../utils/formatters';
import { CATEGORIES_LIST } from '../data/initialProducts';
import { BarcodeScannerModal } from './BarcodeScannerModal';

interface POSRegisterProps {
  products: Product[];
  settings: ShopSettings;
  categories?: string[];
  onCompleteSale: (order: Order) => void;
  incomingCustomerCart?: CartItem[];
  onClearIncomingCart?: () => void;
}

export const POSRegister: React.FC<POSRegisterProps> = ({
  products,
  settings,
  categories,
  onCompleteSale,
  incomingCustomerCart,
  onClearIncomingCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  // Compute all available categories including custom ones
  const availableCategories = useMemo(() => {
    if (categories && categories.length > 0) return ['All', ...categories];
    const set = new Set<string>();
    CATEGORIES_LIST.filter((c) => c !== 'All').forEach((c) => set.add(c));
    products.forEach((p) => {
      if (p.category && p.category !== 'All') set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [categories, products]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Pricing Tier: Retail (Default), Wholesale (Bulk), Agent (Distribution)
  const [activeTier, setActiveTier] = useState<PricingTier>('retail');

  // Barcode Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  // Variant selector modal if product has multiple variants
  const [variantSelectionProduct, setVariantSelectionProduct] = useState<Product | null>(null);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<string>('');

  // Quick Add Custom item modal
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickItemName, setQuickItemName] = useState('');
  const [quickItemPrice, setQuickItemPrice] = useState('');
  const [quickItemUnit, setQuickItemUnit] = useState('pc');

  // Handle incoming customer cart transferred from Customer Showcase
  React.useEffect(() => {
    if (incomingCustomerCart && incomingCustomerCart.length > 0) {
      setCart((prev) => {
        const next = [...prev];
        incomingCustomerCart.forEach((item) => {
          const idx = next.findIndex(
            (x) => x.product.id === item.product.id && x.variantId === item.variantId
          );
          if (idx >= 0) {
            next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
          } else {
            next.push(item);
          }
        });
        return next;
      });
      if (onClearIncomingCart) {
        onClearIncomingCart();
      }
    }
  }, [incomingCustomerCart, onClearIncomingCart]);

  // Helper to compute tier price for product or variant
  const calculatePriceForTier = (
    product: Product,
    tier: PricingTier,
    variant?: ProductVariant
  ): number => {
    if (variant) {
      if (tier === 'wholesale') {
        return variant.wholesalePrice ?? Number((variant.price * 0.85).toFixed(2));
      }
      if (tier === 'agent') {
        return variant.agentPrice ?? Number((variant.price * 0.75).toFixed(2));
      }
      return variant.price;
    }

    if (tier === 'wholesale') {
      return product.wholesalePrice ?? Number((product.price * 0.85).toFixed(2));
    }
    if (tier === 'agent') {
      return product.agentPrice ?? Number((product.price * 0.75).toFixed(2));
    }
    return product.price;
  };

  // Sound feedback on barcode scan
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch {
      // Audio context might be restricted
    }
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        (product.localName && product.localName.toLowerCase().includes(q)) ||
        (product.barcode && product.barcode.includes(q)) ||
        (product.category && product.category.toLowerCase().includes(q)) ||
        (product.variants &&
          product.variants.some(
            (v) =>
              v.name.toLowerCase().includes(q) || (v.barcode && v.barcode.includes(q))
          ));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Add to cart with active tier & variant
  const addToCart = (product: Product, variant?: ProductVariant) => {
    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock <= 0) {
      alert(`"${product.name}${variant ? ` (${variant.name})` : ''}" is out of stock.`);
      return;
    }

    const tierPrice = calculatePriceForTier(product, activeTier, variant);

    setCart((prev) => {
      const targetVariantId = variant ? variant.id : undefined;
      const existing = prev.find(
        (item) => item.product.id === product.id && item.variantId === targetVariantId
      );

      if (existing) {
        if (existing.quantity >= availableStock) {
          alert(`Only ${availableStock} units available in stock.`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id && item.variantId === targetVariantId
            ? { ...item, quantity: Number((item.quantity + 1).toFixed(2)) }
            : item
        );
      }

      return [
        ...prev,
        {
          product,
          variantId: variant ? variant.id : undefined,
          variantName: variant ? variant.name : undefined,
          customPrice: tierPrice,
          pricingTier: activeTier,
          quantity: 1,
        },
      ];
    });

    playScanBeep();
  };

  // Barcode scanned in POS
  const handleBarcodeScanned = (scannedCode: string) => {
    const clean = scannedCode.trim();
    // Search products or variants
    let matchedProduct: Product | undefined;
    let matchedVariant: ProductVariant | undefined;

    for (const prod of products) {
      if (prod.barcode === clean) {
        matchedProduct = prod;
        break;
      }
      if (prod.variants) {
        const v = prod.variants.find((x) => x.barcode === clean);
        if (v) {
          matchedProduct = prod;
          matchedVariant = v;
          break;
        }
      }
    }

    if (matchedProduct) {
      addToCart(matchedProduct, matchedVariant);
      setScanFeedback(`Added "${matchedProduct.name}" to cart!`);
      setTimeout(() => setScanFeedback(null), 2500);
    } else {
      alert(`No product found in catalog matching barcode: ${clean}`);
    }
  };

  // Adjust quantity
  const updateQuantity = (productId: string, delta: number, variantId?: string) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.variantId === variantId) {
            const nextQty = Number((item.quantity + delta).toFixed(2));
            if (nextQty <= 0) return null;
            const maxStock = item.variantId && item.product.variants
              ? item.product.variants.find((v) => v.id === item.variantId)?.stock || item.product.stock
              : item.product.stock;

            if (nextQty > maxStock) {
              alert(`Cannot exceed available stock of ${maxStock}`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.variantId === variantId))
    );
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Clear all items from current cart?')) {
      setCart([]);
      setDiscountPercent(0);
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  // Switch tier and recalculate cart prices
  const handleTierSwitch = (newTier: PricingTier) => {
    setActiveTier(newTier);
    setCart((prev) =>
      prev.map((item) => {
        const variant = item.variantId && item.product.variants
          ? item.product.variants.find((v) => v.id === item.variantId)
          : undefined;
        const newPrice = calculatePriceForTier(item.product, newTier, variant);
        return {
          ...item,
          customPrice: newPrice,
          pricingTier: newTier,
        };
      })
    );
  };

  // Quick add non-catalog item
  const handleQuickAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(quickItemPrice);
    if (!quickItemName.trim() || isNaN(priceNum) || priceNum < 0) {
      alert('Please enter a valid item name and price.');
      return;
    }

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      name: quickItemName.trim(),
      category: 'Daily Essentials',
      price: priceNum,
      unit: quickItemUnit as any,
      stock: 999,
      minStockThreshold: 0,
      imageUrl:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      badge: 'Custom Sale',
    };

    addToCart(customProduct);
    setQuickItemName('');
    setQuickItemPrice('');
    setIsQuickAddOpen(false);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.customPrice ?? item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = settings.enableTax ? (taxableAmount * settings.taxRate) / 100 : 0;
  const grandTotal = taxableAmount + taxAmount;

  const cashGivenNum = parseFloat(cashGiven) || 0;
  const changeDue = Math.max(0, cashGivenNum - grandTotal);

  const handleFinalizeSale = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'cash' && cashGivenNum < grandTotal && cashGivenNum > 0) {
      if (
        !window.confirm(
          `Cash given (${formatCurrency(cashGivenNum, settings.currency)}) is less than total. Proceed?`
        )
      ) {
        return;
      }
    }

    if (paymentMethod === 'store_credit' && !customerName.trim()) {
      alert('Please enter customer name or phone for Store Credit (Udhar) tracking.');
      return;
    }

    const order: Order = {
      id: `ord-${Date.now()}`,
      receiptNumber: generateReceiptNumber(),
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
      discount: discountAmount,
      discountPercent,
      tax: taxAmount,
      total: grandTotal,
      pricingTier: activeTier,
      paymentMethod,
      cashReceived: paymentMethod === 'cash' && cashGivenNum > 0 ? cashGivenNum : grandTotal,
      changeGiven: paymentMethod === 'cash' && cashGivenNum > grandTotal ? changeDue : 0,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      status: 'completed',
    };

    onCompleteSale(order);

    // Reset local state
    setCart([]);
    setDiscountPercent(0);
    setCustomerName('');
    setCustomerPhone('');
    setCashGiven('');
    setIsCheckoutOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-4">
      {/* Scan Feedback Banner */}
      {scanFeedback && (
        <div className="mb-3 flex items-center justify-between rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{scanFeedback}</span>
          </div>
          <button onClick={() => setScanFeedback(null)} className="text-white hover:opacity-80">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column: Product Selection & Catalog (7 cols on lg, 8 on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-3">
          {/* Top Controls: Tier Switcher, Search, Barcode Scanner */}
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xs space-y-3">
            {/* Pricing Tier Selector (Retail, Wholesale, Agent) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-amber-700" />
                  <span>Selling Tier:</span>
                </span>
                <div className="inline-flex rounded-xl bg-stone-100 p-1">
                  <button
                    type="button"
                    onClick={() => handleTierSwitch('retail')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      activeTier === 'retail'
                        ? 'bg-amber-800 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <span>Retail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTierSwitch('wholesale')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      activeTier === 'wholesale'
                        ? 'bg-blue-700 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Wholesale (Bulk)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTierSwitch('agent')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      activeTier === 'agent'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Agent</span>
                  </button>
                </div>
              </div>

              {/* Barcode scanner action button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-stone-800 active:scale-95 transition-all"
                  title="Scan Product Barcode with Camera"
                >
                  <Camera className="h-3.5 w-3.5 text-amber-400" />
                  <span>Scan Barcode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="flex items-center gap-1 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:border-amber-600"
                >
                  <PackagePlus className="h-3.5 w-3.5 text-amber-700" />
                  <span>Custom Item</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products by name, vernacular (e.g. Tamatar), barcode, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-stone-50/60 py-2 pl-9 pr-8 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:bg-white focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category horizontal pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-800 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center">
                <ShoppingBag className="h-10 w-10 text-stone-300 mb-2" />
                <p className="font-semibold text-stone-700">No products match "{searchQuery}"</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Try scanning barcode with camera or click "Custom Item" to bill directly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filteredProducts.map((product) => {
                  const hasMultipleVariants =
                    product.hasVariants && product.variants && product.variants.length > 0;
                  const inCartItem = cart.find((i) => i.product.id === product.id);
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = !isOutOfStock && product.stock <= product.minStockThreshold;
                  const currentTierPrice = calculatePriceForTier(product, activeTier);

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        if (isOutOfStock) return;
                        if (hasMultipleVariants) {
                          setVariantSelectionProduct(product);
                        } else {
                          addToCart(product);
                        }
                      }}
                      className={`group relative flex flex-col justify-between rounded-2xl border bg-white p-2.5 transition-all text-left select-none ${
                        isOutOfStock
                          ? 'border-stone-200 opacity-60 cursor-not-allowed bg-stone-50'
                          : 'cursor-pointer hover:border-amber-600/60 hover:shadow-md active:scale-98'
                      } ${
                        inCartItem
                          ? 'border-amber-600 ring-2 ring-amber-600/20 bg-amber-50/20'
                          : 'border-stone-200'
                      }`}
                    >
                      {/* Top thumbnail & Badges */}
                      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-stone-100">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Cart quantity badge */}
                        {inCartItem && (
                          <span className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-800 text-xs font-bold text-white shadow-md">
                            {inCartItem.quantity}
                          </span>
                        )}

                        {/* Stock or promo badge */}
                        {isOutOfStock ? (
                          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {product.stock} {product.unit} left
                          </span>
                        ) : hasMultipleVariants ? (
                          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-blue-700 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            {product.variants!.length} Sizes
                          </span>
                        ) : product.badge ? (
                          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-stone-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                            {product.badge}
                          </span>
                        ) : null}
                      </div>

                      {/* Info */}
                      <div className="mt-2 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-stone-900 line-clamp-1 group-hover:text-amber-800">
                            {product.name}
                          </p>
                          {product.localName && (
                            <p className="text-[10px] text-stone-500 line-clamp-1 italic">
                              {product.localName}
                            </p>
                          )}
                        </div>

                        <div className="mt-1.5 flex items-baseline justify-between pt-1 border-t border-stone-100">
                          <div>
                            <span className="text-sm font-black font-mono text-stone-950">
                              {formatCurrency(currentTierPrice, settings.currency)}
                            </span>
                            <span className="text-[10px] text-stone-500 font-medium ml-1">
                              /{product.unit}
                            </span>
                          </div>

                          {product.mrp && product.mrp > currentTierPrice && (
                            <span className="text-[10px] text-stone-400 line-through">
                              {formatCurrency(product.mrp, settings.currency)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Billing Cart (5 cols on lg, 4 on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <div className="sticky top-20 flex flex-col rounded-3xl border border-stone-200 bg-white shadow-xl overflow-hidden max-h-[calc(100vh-6rem)]">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-700" />
                <h2 className="font-bold text-stone-900">Active Register</h2>
                <span className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-bold text-stone-700">
                  {cart.length}
                </span>
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-900">
                  {activeTier}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  title="Clear entire cart"
                  className="rounded-lg p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 p-3 max-h-[38vh]">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-stone-400">
                  <ShoppingBag className="h-10 w-10 stroke-[1.5] text-stone-300 mb-2" />
                  <p className="text-sm font-medium text-stone-600">Cart is empty</p>
                  <p className="text-xs text-stone-400 mt-1 max-w-[200px]">
                    Tap products or scan barcode to add to bill
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const unitPrice = item.customPrice ?? item.product.price;
                  const itemTotal = unitPrice * item.quantity;

                  return (
                    <div
                      key={`${item.product.id}-${item.variantId || 'base'}`}
                      className="flex items-center justify-between py-2 gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">
                          {item.product.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                          {item.variantName && (
                            <span className="rounded bg-blue-50 px-1 font-semibold text-blue-800">
                              {item.variantName}
                            </span>
                          )}
                          <span>
                            {formatCurrency(unitPrice, settings.currency)} × {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, -1, item.variantId)}
                            className="rounded p-1 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-bold font-mono text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, 1, item.variantId)}
                            className="rounded p-1 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="w-14 text-right font-mono text-xs font-bold text-stone-950">
                          {formatCurrency(itemTotal, settings.currency)}
                        </span>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.variantId)}
                          className="text-stone-400 hover:text-rose-600 p-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Discount and Summary Area */}
            <div className="border-t border-stone-200 bg-stone-50/90 p-4 space-y-3">
              {/* Discount Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  <span>Discount:</span>
                </span>
                <div className="flex gap-1">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      className={`rounded-md px-2 py-0.5 text-xs font-bold transition-all ${
                        discountPercent === pct
                          ? 'bg-stone-900 text-white'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Bill breakdown */}
              <div className="space-y-1 text-xs text-stone-600 border-t border-stone-200/80 pt-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrency(subtotal, settings.currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({discountPercent}%):</span>
                    <span className="font-mono">
                      - {formatCurrency(discountAmount, settings.currency)}
                    </span>
                  </div>
                )}
                {settings.enableTax && (
                  <div className="flex justify-between">
                    <span>Tax ({settings.taxRate}%):</span>
                    <span className="font-mono">
                      {formatCurrency(taxAmount, settings.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-stone-300 pt-1 text-base font-black text-stone-950">
                  <span>Total Payable:</span>
                  <span className="font-mono text-amber-800">
                    {formatCurrency(grandTotal, settings.currency)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                type="button"
                id="btn-checkout"
                disabled={cart.length === 0}
                onClick={() => setIsCheckoutOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-800 py-3 text-xs font-bold text-white shadow-lg hover:bg-amber-900 disabled:opacity-40 active:scale-98 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Collect Payment & Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
        title="Scan Product to Add"
        subtitle="Point camera at product barcode to add directly to register"
        mode="barcode"
        sampleCodes={[
          { label: 'Bananas (8901230001)', code: '8901230001' },
          { label: 'Tomatoes (8901230002)', code: '8901230002' },
          { label: 'Basmati Rice (8901230005)', code: '8901230005' },
          { label: 'Dairy Milk (8901230006)', code: '8901230006' },
        ]}
      />

      {/* Variant Selection Modal (When product with multiple sizes is clicked) */}
      {variantSelectionProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="font-bold text-stone-900">{variantSelectionProduct.name}</h4>
                <p className="text-xs text-stone-500">Select size or pack variant:</p>
              </div>
              <button
                onClick={() => setVariantSelectionProduct(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {variantSelectionProduct.variants?.map((v) => {
                const price = calculatePriceForTier(variantSelectionProduct, activeTier, v);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      addToCart(variantSelectionProduct, v);
                      setVariantSelectionProduct(null);
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-stone-200 p-3 hover:border-amber-600 hover:bg-amber-50/50 transition-all text-left"
                  >
                    <div>
                      <p className="text-xs font-bold text-stone-900">{v.name}</p>
                      <p className="text-[11px] text-stone-500">Stock: {v.stock} units</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black font-mono text-amber-800">
                        {formatCurrency(price, settings.currency)}
                      </p>
                      {v.mrp && v.mrp > price && (
                        <p className="text-[10px] text-stone-400 line-through">
                          {formatCurrency(v.mrp, settings.currency)}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Custom Item Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-bold text-stone-900">Quick Custom Item Sale</h4>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCustomItem} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Loose Sugar, Special Masala"
                  value={quickItemName}
                  onChange={(e) => setQuickItemName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700">
                    Price ({settings.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={quickItemPrice}
                    onChange={(e) => setQuickItemPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 font-mono text-xs focus:border-amber-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700">Unit</label>
                  <select
                    value={quickItemUnit}
                    onChange={(e) => setQuickItemUnit(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-amber-600 focus:outline-hidden"
                  >
                    <option value="pc">Piece (pc)</option>
                    <option value="kg">Kg</option>
                    <option value="500g">500g</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-amber-800 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-900"
              >
                Add to Cart
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-md flex-col rounded-3xl bg-white shadow-2xl overflow-hidden ring-1 ring-stone-900/10">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-stone-900">Complete Sale</h3>
                <p className="text-xs text-stone-500">Select payment method & print receipt</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Grand Total banner */}
              <div className="rounded-2xl bg-stone-950 p-4 text-center text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Total Amount Due ({activeTier.toUpperCase()} RATE)
                </span>
                <p className="font-mono text-3xl font-black text-white mt-0.5">
                  {formatCurrency(grandTotal, settings.currency)}
                </p>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'cash', label: 'Cash Payment', icon: DollarSign },
                  { id: 'upi_qr', label: 'UPI / QR Scan', icon: QrCode },
                  { id: 'card', label: 'Debit / Card', icon: CreditCard },
                  { id: 'store_credit', label: 'Store Credit (Udhar)', icon: BookOpen },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                        paymentMethod === pm.id
                          ? 'border-amber-700 bg-amber-50 text-amber-900 ring-1 ring-amber-700'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-amber-700" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Cash specific calculator */}
              {paymentMethod === 'cash' && (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700">Cash Received</label>
                    <input
                      type="number"
                      step="1"
                      placeholder={grandTotal.toString()}
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-sm font-bold text-stone-900 focus:outline-hidden"
                    />
                  </div>
                  {cashGivenNum > 0 && (
                    <div className="flex justify-between text-xs font-bold border-t border-stone-200 pt-2">
                      <span className="text-stone-600">Change Due:</span>
                      <span
                        className={`font-mono ${changeDue >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}
                      >
                        {formatCurrency(changeDue, settings.currency)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Customer Details for Credit or Delivery */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3 space-y-2">
                <span className="text-[11px] font-bold text-stone-600 uppercase">
                  Customer Tagging (Optional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:outline-hidden"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Finalize */}
            <div className="border-t border-stone-200 bg-stone-50 px-6 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinalizeSale}
                className="flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-900 active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Print Bill & Finish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
