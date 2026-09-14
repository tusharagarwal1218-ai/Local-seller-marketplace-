import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Store,
  Sparkles,
  X,
  User,
  Phone,
  MapPin,
  QrCode,
  CheckCircle,
  Eye,
  Camera,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Product, ShopSettings, CartItem, Category, CustomerProfile, Order, ProductVariant } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CATEGORIES_LIST } from '../data/initialProducts';
import { CustomerLoginModal } from './CustomerLoginModal';
import { CustomerOrderBox } from './CustomerOrderBox';
import { BarcodeScannerModal } from './BarcodeScannerModal';

interface CustomerDisplayProps {
  products: Product[];
  settings: ShopSettings;
  categories?: string[];
  customerProfile: CustomerProfile;
  onUpdateProfile: (profile: CustomerProfile) => void;
  onPlaceCustomerOrder: (order: Order) => void;
  onSendToRegister?: (items: CartItem[]) => void;
}

export const CustomerDisplay: React.FC<CustomerDisplayProps> = ({
  products,
  settings,
  categories,
  customerProfile,
  onUpdateProfile,
  onPlaceCustomerOrder,
  onSendToRegister,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');

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
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);

  // Customer order box & login modals
  const [isOrderBoxOpen, setIsOrderBoxOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isShopQrScannerOpen, setIsShopQrScannerOpen] = useState(false);

  // Variant selector modal for products with sizes
  const [variantModalProduct, setVariantModalProduct] = useState<Product | null>(null);

  // Customer self-selection bag
  const [customerBag, setCustomerBag] = useState<CartItem[]>([]);

  // Filter products for showcase
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isAvailable) return false;
      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.localName && p.localName.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.variants && p.variants.some((v) => v.name.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const addToCustomerBag = (product: Product, variant?: ProductVariant) => {
    const availableStock = variant ? variant.stock : product.stock;
    if (availableStock <= 0) return;

    setCustomerBag((prev) => {
      const targetVariantId = variant ? variant.id : undefined;
      const existing = prev.find(
        (item) => item.product.id === product.id && item.variantId === targetVariantId
      );

      if (existing) {
        if (existing.quantity >= availableStock) return prev;
        return prev.map((item) =>
          item.product.id === product.id && item.variantId === targetVariantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          product,
          variantId: variant ? variant.id : undefined,
          variantName: variant ? variant.name : undefined,
          customPrice: variant ? variant.price : product.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateBagQuantity = (productId: string, delta: number, variantId?: string) => {
    setCustomerBag((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.variantId === variantId) {
            const next = item.quantity + delta;
            if (next <= 0) return null;
            const maxStock = item.variantId && item.product.variants
              ? item.product.variants.find((v) => v.id === item.variantId)?.stock || item.product.stock
              : item.product.stock;

            if (next > maxStock) return item;
            return { ...item, quantity: next };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCustomerBag = () => {
    setCustomerBag([]);
  };

  const bagItemCount = customerBag.reduce((sum, item) => sum + item.quantity, 0);
  const bagTotal = customerBag.reduce((sum, item) => {
    const price = item.customPrice ?? item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const handleScanShopCode = (scannedData: string) => {
    let parsedCode = scannedData.trim();
    try {
      const parsed = JSON.parse(scannedData);
      if (parsed && parsed.shopCode) {
        parsedCode = parsed.shopCode;
      }
    } catch {
      // Raw string
    }

    onUpdateProfile({
      ...customerProfile,
      connectedShopCode: parsedCode.toUpperCase(),
    });
    alert(`Connected to store code: ${parsedCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-stone-100 pb-16">
      {/* Top Customer Info & Store Connectivity Bar */}
      <div className="border-b border-stone-200 bg-stone-900 text-white px-4 py-2.5">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          {/* Customer Login / Profile Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-stone-800 px-3 py-1 text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
            >
              <User className="h-3.5 w-3.5 text-amber-400" />
              {customerProfile.isLoggedIn && customerProfile.name ? (
                <span className="font-semibold">
                  {customerProfile.name} ({customerProfile.phone})
                </span>
              ) : (
                <span className="font-semibold text-amber-300">
                  Guest • Login / Enter Delivery Address
                </span>
              )}
            </button>

            {customerProfile.address && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-stone-400 truncate max-w-xs">
                <MapPin className="h-3 w-3 text-amber-400 shrink-0" />
                <span className="truncate">{customerProfile.address}</span>
              </span>
            )}
          </div>

          {/* Store Connection & QR Scanner */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-amber-950/80 border border-amber-800/40 px-2.5 py-0.5 text-[11px] text-amber-200">
              <Store className="h-3 w-3 text-amber-400" />
              <span>Store Code:</span>
              <strong className="font-mono text-white">
                {customerProfile.connectedShopCode || settings.shopCode || 'SHOP-7821'}
              </strong>
            </div>

            <button
              type="button"
              onClick={() => setIsShopQrScannerOpen(true)}
              className="flex items-center gap-1 rounded-full bg-stone-800 px-2.5 py-1 text-[11px] font-bold text-amber-400 hover:bg-stone-700 hover:text-amber-300"
              title="Scan Shop QR Code with Camera"
            >
              <Camera className="h-3 w-3" />
              <span>Scan Shop QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Store Showcase Hero Banner */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <Store className="h-4 w-4" />
                <span>Local Store Showcase & Digital Ordering</span>
              </div>
              <h2 className="mt-1 text-2xl font-black text-stone-950 sm:text-3xl tracking-tight">
                {settings.shopName}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 max-w-2xl">
                {settings.tagline ||
                  'Fresh groceries, dairy, produce & daily essentials available for counter pickup or fast local delivery.'}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                <span>📍 {settings.address}</span>
                <span>•</span>
                <span>📞 {settings.phone}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Open for Orders
                </span>
              </div>
            </div>

            {/* Customer Order Box Button */}
            <div className="flex items-center gap-2">
              <button
                id="btn-customer-order-box"
                onClick={() => setIsOrderBoxOpen(true)}
                className="relative flex items-center gap-2.5 rounded-2xl bg-amber-800 px-5 py-3 text-xs font-bold text-white shadow-xl hover:bg-amber-900 active:scale-95 transition-all ring-2 ring-amber-700/20"
              >
                <ShoppingBag className="h-4 w-4 text-amber-200" />
                <span>Open Order Box</span>
                {bagItemCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-black text-amber-900">
                    {bagItemCount}
                  </span>
                )}
                {bagItemCount > 0 && (
                  <span className="font-mono font-black text-amber-100 ml-1">
                    {formatCurrency(bagTotal, settings.currency)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Showcase Body */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-6">
          {/* Categories */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-800 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search products, local names (e.g. Tamatar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white py-2 pl-9 pr-8 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden shadow-xs"
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
        </div>

        {/* Product Cards Showcase Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-stone-300 mb-3" />
            <h3 className="text-base font-bold text-stone-800">No matching products found</h3>
            <p className="mt-1 text-xs text-stone-500">
              Try selecting a different category or clearing your search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const hasMultipleVariants =
                product.hasVariants && product.variants && product.variants.length > 0;
              const inBag = customerBag.find((i) => i.product.id === product.id);
              const isLowStock = product.stock <= product.minStockThreshold;
              const hasSavings = product.mrp && product.mrp > product.price;
              const savingsAmt = hasSavings ? product.mrp! - product.price : 0;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between rounded-3xl border border-stone-200 bg-white p-3.5 shadow-xs transition-all hover:border-amber-600/50 hover:shadow-xl"
                >
                  <div>
                    {/* Visual Card Image */}
                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-stone-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                        {product.badge && (
                          <span className="rounded-md bg-stone-900/85 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs shadow-xs">
                            {product.badge}
                          </span>
                        )}
                        {hasSavings && (
                          <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            Save {formatCurrency(savingsAmt, settings.currency)}
                          </span>
                        )}
                      </div>

                      {/* Stock Indicator */}
                      <div className="absolute bottom-2 right-2">
                        {product.stock <= 0 ? (
                          <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            Sold Out
                          </span>
                        ) : isLowStock ? (
                          <span className="rounded-md bg-amber-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                            Only {product.stock} left
                          </span>
                        ) : hasMultipleVariants ? (
                          <span className="rounded-md bg-blue-700 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                            {product.variants!.length} Sizes Available
                          </span>
                        ) : (
                          <span className="rounded-md bg-emerald-800/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
                            In Stock
                          </span>
                        )}
                      </div>

                      {/* Quick preview click overlay */}
                      <button
                        onClick={() => setActiveProductModal(product)}
                        className="absolute inset-0 flex items-center justify-center bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="View details"
                      >
                        <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-stone-900 shadow-md">
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Details</span>
                        </span>
                      </button>
                    </div>

                    {/* Product Typography & Info */}
                    <div className="mt-3">
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="text-sm font-bold text-stone-900 line-clamp-1 group-hover:text-amber-800">
                            {product.name}
                          </h4>
                          {product.localName && (
                            <p className="text-xs text-stone-500 font-medium italic">
                              {product.localName}
                            </p>
                          )}
                        </div>
                        <span className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600">
                          {product.category}
                        </span>
                      </div>

                      {product.description && (
                        <p className="mt-1 text-xs text-stone-600 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pricing & Order Action */}
                  <div className="mt-4 pt-3 border-t border-stone-100">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-base font-black font-mono text-stone-950">
                          {formatCurrency(product.price, settings.currency)}
                        </span>
                        <span className="text-xs text-stone-500 ml-1">
                          /{product.unit}
                        </span>
                      </div>

                      {product.mrp && product.mrp > product.price && (
                        <span className="text-xs font-mono text-stone-400 line-through">
                          MRP: {formatCurrency(product.mrp, settings.currency)}
                        </span>
                      )}
                    </div>

                    {/* Add to Order Box / Quantity controls */}
                    {hasMultipleVariants ? (
                      <button
                        type="button"
                        onClick={() => setVariantModalProduct(product)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-800 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-amber-900 active:scale-95 transition-all"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        <span>Select Size & Add</span>
                      </button>
                    ) : inBag ? (
                      <div className="flex items-center justify-between rounded-xl border border-amber-600 bg-amber-50/50 p-1">
                        <button
                          type="button"
                          onClick={() => updateBagQuantity(product.id, -1)}
                          className="rounded-lg bg-white p-1.5 text-stone-700 shadow-xs hover:bg-stone-100"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-mono text-xs font-black text-amber-900">
                          {inBag.quantity} {product.unit}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateBagQuantity(product.id, 1)}
                          className="rounded-lg bg-white p-1.5 text-stone-700 shadow-xs hover:bg-stone-100"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={product.stock <= 0}
                        onClick={() => addToCustomerBag(product)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-stone-800 disabled:opacity-40 active:scale-95 transition-all"
                      >
                        <Plus className="h-3.5 w-3.5 text-amber-400" />
                        <span>Add to Order Box</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Order Box Bar for Mobile / Compact views */}
      {bagItemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md">
          <div className="flex items-center justify-between rounded-3xl bg-stone-950 p-3 text-white shadow-2xl border border-stone-800">
            <div className="flex items-center gap-3 pl-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-700 text-white">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {bagItemCount} Item{bagItemCount === 1 ? '' : 's'} Selected
                </p>
                <p className="font-mono text-xs text-amber-400 font-bold">
                  {formatCurrency(bagTotal, settings.currency)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOrderBoxOpen(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-500"
            >
              <span>View Order Box</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {activeProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden border border-stone-200">
            <div className="relative aspect-16/9 bg-stone-100">
              <img
                src={activeProductModal.imageUrl}
                alt={activeProductModal.name}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setActiveProductModal(null)}
                className="absolute top-3 right-3 rounded-full bg-stone-900/60 p-1.5 text-white hover:bg-stone-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                    {activeProductModal.category}
                  </span>
                  <span className="font-mono text-xs text-stone-500">
                    Stock: {activeProductModal.stock} {activeProductModal.unit}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-extrabold text-stone-900">
                  {activeProductModal.name}
                </h3>
                {activeProductModal.localName && (
                  <p className="text-sm font-semibold text-stone-500 italic">
                    {activeProductModal.localName}
                  </p>
                )}
              </div>

              {activeProductModal.description && (
                <p className="text-xs text-stone-600 leading-relaxed">
                  {activeProductModal.description}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-stone-100 pt-4">
                <div>
                  <span className="font-mono text-2xl font-black text-stone-950">
                    {formatCurrency(activeProductModal.price, settings.currency)}
                  </span>
                  <span className="text-xs text-stone-500 ml-1">
                    /{activeProductModal.unit}
                  </span>
                  {activeProductModal.mrp && activeProductModal.mrp > activeProductModal.price && (
                    <p className="text-xs text-stone-400 line-through">
                      MRP: {formatCurrency(activeProductModal.mrp, settings.currency)}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToCustomerBag(activeProductModal);
                    setActiveProductModal(null);
                  }}
                  className="rounded-2xl bg-amber-800 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-900"
                >
                  Add to Order Box
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variant Selector Modal */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="font-bold text-stone-900">{variantModalProduct.name}</h4>
                <p className="text-xs text-stone-500">Choose size or pack variant:</p>
              </div>
              <button
                onClick={() => setVariantModalProduct(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {variantModalProduct.variants?.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    addToCustomerBag(variantModalProduct, v);
                    setVariantModalProduct(null);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-stone-200 p-3 hover:border-amber-600 hover:bg-amber-50/40 transition-all text-left"
                >
                  <div>
                    <p className="text-xs font-bold text-stone-900">{v.name}</p>
                    <p className="text-[11px] text-stone-500">Available: {v.stock} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black font-mono text-amber-900">
                      {formatCurrency(v.price, settings.currency)}
                    </p>
                    {v.mrp && v.mrp > v.price && (
                      <p className="text-[10px] text-stone-400 line-through">
                        {formatCurrency(v.mrp, settings.currency)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customer Login / Profile Modal */}
      <CustomerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        profile={customerProfile}
        settings={settings}
        onSaveProfile={onUpdateProfile}
      />

      {/* Customer Order Box Drawer */}
      <CustomerOrderBox
        isOpen={isOrderBoxOpen}
        onClose={() => setIsOrderBoxOpen(false)}
        cart={customerBag}
        onUpdateQuantity={updateBagQuantity}
        onClearCart={clearCustomerBag}
        customerProfile={customerProfile}
        onUpdateProfile={onUpdateProfile}
        settings={settings}
        onPlaceCustomerOrder={onPlaceCustomerOrder}
      />

      {/* QR Scanner for Shop Code */}
      <BarcodeScannerModal
        isOpen={isShopQrScannerOpen}
        onClose={() => setIsShopQrScannerOpen(false)}
        onScan={handleScanShopCode}
        title="Scan Shop Counter Standee"
        subtitle="Point camera at the store counter QR code or enter code"
        mode="qrcode"
        sampleCodes={[
          { label: 'Current Shop', code: settings.shopCode || 'SHOP-7821' },
          { label: 'Market Branch', code: 'SHOP-9410' },
        ]}
      />
    </div>
  );
};
