import React, { useState, useEffect, useMemo } from 'react';
import {
  Product,
  ShopSettings,
  Order,
  ViewMode,
  CartItem,
  CustomerProfile,
  OwnerMonetizationSettings,
  AppSubscriptionState,
  SubscriptionPaymentRecord,
  SubscriberRecord,
  Category
} from './types';
import { INITIAL_PRODUCTS, INITIAL_SHOP_SETTINGS, CATEGORIES_LIST } from './data/initialProducts';
import {
  INITIAL_OWNER_MONETIZATION,
  INITIAL_APP_SUBSCRIPTION,
  INITIAL_PAYMENT_HISTORY,
  INITIAL_SUBSCRIBERS
} from './data/initialSubscription';
import { Header } from './components/Header';
import { POSRegister } from './components/POSRegister';
import { CustomerDisplay } from './components/CustomerDisplay';
import { InventoryManager } from './components/InventoryManager';
import { SalesLedger } from './components/SalesLedger';
import { SettingsView } from './components/SettingsView';
import { ReceiptModal } from './components/ReceiptModal';
import { ShopCodeQRGeneratorModal } from './components/ShopCodeQRGeneratorModal';
import { OwnerMonetizationHub } from './components/OwnerMonetizationHub';
import { SubscriptionControlCenter } from './components/SubscriptionControlCenter';
import { SubscriptionModal } from './components/SubscriptionModal';
import { SubscriptionInvoiceModal } from './components/SubscriptionInvoiceModal';
import { PlayStoreAndGatewayGuideModal } from './components/PlayStoreAndGatewayGuideModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { getTrialRemainingDays, isTrialExpired } from './utils/subscriptionUtils';

const STORAGE_KEYS = {
  PRODUCTS: 'local_shopkeeper_products_v1',
  SETTINGS: 'local_shopkeeper_settings_v1',
  ORDERS: 'local_shopkeeper_orders_v1',
  CUSTOMER: 'local_shopkeeper_customer_v1',
  MONETIZATION: 'local_shopkeeper_monetization_v1',
  SUBSCRIPTION: 'local_shopkeeper_subscription_v1',
  PAYMENTS: 'local_shopkeeper_payments_v1',
  SUBSCRIBERS: 'local_shopkeeper_subscribers_v1',
  CUSTOM_CATEGORIES: 'local_shopkeeper_custom_categories_v1',
};

const INITIAL_CUSTOMER: CustomerProfile = {
  name: 'Priya Sharma',
  phone: '+1 (555) 892-4112',
  address: 'Flat 402, Sunrise Residency, 12 Park Avenue',
  landmark: 'Opposite Central Park',
  city: 'Metro City',
  pincode: '10001',
  connectedShopCode: 'SHOP-7821',
  isLoggedIn: true,
};

export default function App() {
  // Products state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading products from local storage:', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Settings state
  const [settings, setSettings] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading settings from local storage:', e);
    }
    return INITIAL_SHOP_SETTINGS;
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading orders from local storage:', e);
    }
    return [];
  });

  // Customer Profile state
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading customer profile from local storage:', e);
    }
    return INITIAL_CUSTOMER;
  });

  // Owner Monetization state
  const [monetization, setMonetization] = useState<OwnerMonetizationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MONETIZATION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading monetization settings:', e);
    }
    return INITIAL_OWNER_MONETIZATION;
  });

  // Store Subscription & 2-Month Free Trial state
  const [subscription, setSubscription] = useState<AppSubscriptionState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading subscription state:', e);
    }
    return INITIAL_APP_SUBSCRIPTION;
  });

  // Payment History
  const [paymentHistory, setPaymentHistory] = useState<SubscriptionPaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading subscription payments:', e);
    }
    return INITIAL_PAYMENT_HISTORY;
  });

  // Subscribers / Clients Control Center state
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIBERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading subscribers from local storage:', e);
    }
    return INITIAL_SUBSCRIBERS;
  });

  // Current View
  const [currentView, setCurrentView] = useState<ViewMode>('pos');

  // Receipt modal state
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);

  // Shop QR & Code Standee Modal state
  const [isShopQrModalOpen, setIsShopQrModalOpen] = useState(false);

  // Subscription / Upgrade modal state
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Subscription invoice receipt modal
  const [activeSubscriptionInvoice, setActiveSubscriptionInvoice] = useState<SubscriptionPaymentRecord | null>(null);

  // Play Store & Payment Gateway Master Guide modal
  const [isPlayStoreGuideOpen, setIsPlayStoreGuideOpen] = useState(false);

  // Incoming cart from Customer Showcase
  const [incomingCustomerCart, setIncomingCustomerCart] = useState<CartItem[]>([]);

  // Custom Categories state with local persistence
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load custom categories:', e);
    }
    return [];
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(customCategories));
    } catch (e) {
      console.error('Failed to save custom categories:', e);
    }
  }, [customCategories]);

  // Combined active categories for POS, Showcase, Inventory & Settings
  const activeCategories = useMemo(() => {
    const set = new Set<string>();
    CATEGORIES_LIST.filter((c) => c !== 'All').forEach((c) => set.add(c));
    customCategories.forEach((c) => {
      if (c && c.trim() && c.toLowerCase() !== 'all') set.add(c.trim());
    });
    products.forEach((p) => {
      if (p.category && p.category.trim() && p.category.toLowerCase() !== 'all') {
        set.add(p.category.trim());
      }
    });
    return Array.from(set);
  }, [customCategories, products]);

  // Custom Category CRUD Handlers
  const handleAddCustomCategory = (categoryName: string): boolean => {
    const trimmed = categoryName.trim();
    if (!trimmed || trimmed.toLowerCase() === 'all') return false;
    const exists = activeCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) return false;

    setCustomCategories((prev) => [...prev, trimmed]);
    return true;
  };

  const handleRenameCustomCategory = (oldName: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed.toLowerCase() === 'all') return false;
    const exists = activeCategories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName
    );
    if (exists) return false;

    setCustomCategories((prev) => prev.map((c) => (c === oldName ? trimmed : c)));
    setProducts((prev) =>
      prev.map((p) => (p.category === oldName ? { ...p, category: trimmed as Category } : p))
    );
    return true;
  };

  const handleDeleteCustomCategory = (categoryName: string, fallbackCategory = 'Daily Essentials') => {
    setCustomCategories((prev) => prev.filter((c) => c !== categoryName));
    setProducts((prev) =>
      prev.map((p) =>
        p.category === categoryName ? { ...p, category: fallbackCategory as Category } : p
      )
    );
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders:', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(customerProfile));
    } catch (e) {
      console.error('Failed to save customer profile:', e);
    }
  }, [customerProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MONETIZATION, JSON.stringify(monetization));
    } catch (e) {
      console.error('Failed to save monetization:', e);
    }
  }, [monetization]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(subscription));
    } catch (e) {
      console.error('Failed to save subscription:', e);
    }
  }, [subscription]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(paymentHistory));
    } catch (e) {
      console.error('Failed to save payment history:', e);
    }
  }, [paymentHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIBERS, JSON.stringify(subscribers));
    } catch (e) {
      console.error('Failed to save subscribers:', e);
    }
  }, [subscribers]);

  // Today's sales count
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const todaySalesCount = orders.filter((o) => o.timestamp >= startOfToday).length;

  // Handle plan subscription success
  const handleSubscribeSuccess = (record: SubscriptionPaymentRecord) => {
    setPaymentHistory((prev) => [record, ...prev]);

    // Also update or link to subscriber record in Control Center
    setSubscribers((prev) => {
      const matchIndex = prev.findIndex((s) => s.id === record.subscriberId || s.shopId === settings.shopCode);
      if (matchIndex >= 0) {
        const existing = prev[matchIndex];
        const updatedRecord: SubscriberRecord = {
          ...existing,
          status: 'active',
          planId: record.planId,
          planName: record.planName,
          billingCycle: record.billingCycle,
          expiryDate: record.validUntil,
          totalPaidAmount: (existing.totalPaidAmount || 0) + record.amount,
          paymentGateway: record.paymentGateway,
          transactionRef: record.transactionRef,
          isLockedOrSuspended: false,
        };
        const next = [...prev];
        next[matchIndex] = updatedRecord;
        return next;
      }
      return prev;
    });

    const updatedSub: AppSubscriptionState = {
      ...subscription,
      status: 'active',
      currentPlanId: record.planId,
      currentPlanName: record.planName,
      currentBillingCycle: record.billingCycle,
      subscriptionStartDate: record.timestamp,
      subscriptionEndDate: record.validUntil,
      totalPaid: (subscription.totalPaid || 0) + record.amount,
      lastPaymentId: record.id,
    };
    setSubscription(updatedSub);
    setActiveSubscriptionInvoice(record);
  };

  // Complete a sale from POS
  const handleCompleteSale = (order: Order) => {
    // 1. Deduct stock from products (and variants if applicable)
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = order.items.find((item) => item.productId === prod.id);
        if (soldItem) {
          const nextStock = Math.max(0, prod.stock - soldItem.quantity);
          const updatedVariants = prod.variants?.map((v) => {
            if (v.name === soldItem.variantName) {
              return { ...v, stock: Math.max(0, v.stock - soldItem.quantity) };
            }
            return v;
          });

          return {
            ...prod,
            stock: nextStock,
            variants: updatedVariants,
            lastUpdated: Date.now(),
          };
        }
        return prod;
      })
    );

    // 2. Add to orders ledger (newest first)
    setOrders((prev) => [order, ...prev]);

    // 3. Show receipt immediately
    setActiveReceiptOrder(order);
  };

  // Place customer order from Customer Order Box
  const handlePlaceCustomerOrder = (order: Order) => {
    // Deduct stock
    setProducts((prev) =>
      prev.map((prod) => {
        const soldItem = order.items.find((item) => item.productId === prod.id);
        if (soldItem) {
          const nextStock = Math.max(0, prod.stock - soldItem.quantity);
          const updatedVariants = prod.variants?.map((v) => {
            if (v.name === soldItem.variantName) {
              return { ...v, stock: Math.max(0, v.stock - soldItem.quantity) };
            }
            return v;
          });

          return {
            ...prod,
            stock: nextStock,
            variants: updatedVariants,
            lastUpdated: Date.now(),
          };
        }
        return prod;
      })
    );

    // Add to ledger
    setOrders((prev) => [order, ...prev]);

    // Show thermal receipt
    setActiveReceiptOrder(order);
  };

  // Stock adjustments from Inventory Manager
  const handleAdjustStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const nextStock = Math.max(0, p.stock + delta);
          return { ...p, stock: nextStock, lastUpdated: Date.now() };
        }
        return p;
      })
    );
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleResetCatalog = () => {
    setProducts(INITIAL_PRODUCTS);
    setSettings(INITIAL_SHOP_SETTINGS);
    setCustomerProfile(INITIAL_CUSTOMER);
    setMonetization(INITIAL_OWNER_MONETIZATION);
    setSubscription(INITIAL_APP_SUBSCRIPTION);
    setSubscribers(INITIAL_SUBSCRIBERS);
    setCustomCategories([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER);
    localStorage.removeItem(STORAGE_KEYS.MONETIZATION);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIBERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
  };

  // Switch to POS with items from customer display
  const handleSendFromShowcaseToRegister = (items: CartItem[]) => {
    setIncomingCustomerCart(items);
    setCurrentView('pos');
  };

  const trialExpired = isTrialExpired(subscription);
  const paywallBlocking = trialExpired && monetization.enforcePaywallOnExpiry && subscription.status !== 'active';

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans text-stone-900 selection:bg-amber-500/20 selection:text-amber-900">
      {/* App Header & Navigation */}
      <Header
        settings={settings}
        currentView={currentView}
        onViewChange={setCurrentView}
        products={products}
        todaySalesCount={todaySalesCount}
        onOpenShopQrModal={() => setIsShopQrModalOpen(true)}
        subscription={subscription}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        onOpenPlayStoreGuide={() => setIsPlayStoreGuideOpen(true)}
      />

      {/* Trial Expired Alert Banner */}
      {paywallBlocking && (
        <div className="bg-red-700 text-white px-4 py-2.5 text-xs text-center shadow-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <span className="font-semibold">
              ⚠️ Your 2-Month Free Trial has expired. Subscribe to an owner plan to continue billing & inventory operations.
            </span>
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="rounded-xl bg-white px-3.5 py-1 text-xs font-bold text-red-900 hover:bg-red-50 shadow-xs"
            >
              Choose a Plan & Continue &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1">
        {currentView === 'pos' && (
          <POSRegister
            products={products}
            settings={settings}
            categories={activeCategories}
            onCompleteSale={handleCompleteSale}
            incomingCustomerCart={incomingCustomerCart}
            onClearIncomingCart={() => setIncomingCustomerCart([])}
          />
        )}

        {currentView === 'display' && (
          <CustomerDisplay
            products={products}
            settings={settings}
            categories={activeCategories}
            customerProfile={customerProfile}
            onUpdateProfile={setCustomerProfile}
            onPlaceCustomerOrder={handlePlaceCustomerOrder}
            onSendToRegister={handleSendFromShowcaseToRegister}
          />
        )}

        {currentView === 'inventory' && (
          <InventoryManager
            products={products}
            settings={settings}
            categories={activeCategories}
            customCategories={customCategories}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
            onAddCustomCategory={handleAddCustomCategory}
            onRenameCustomCategory={handleRenameCustomCategory}
            onDeleteCustomCategory={handleDeleteCustomCategory}
          />
        )}

        {currentView === 'sales' && (
          <SalesLedger
            orders={orders}
            settings={settings}
            onViewReceipt={setActiveReceiptOrder}
          />
        )}

        {currentView === 'monetization' && (
          <OwnerMonetizationHub
            monetization={monetization}
            subscription={subscription}
            paymentHistory={paymentHistory}
            shopSettings={settings}
            onUpdateMonetization={setMonetization}
            onUpdateSubscription={setSubscription}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            onViewInvoice={setActiveSubscriptionInvoice}
            onNavigateToControlCenter={() => setCurrentView('control-center')}
            onOpenPlayStoreGuide={() => setIsPlayStoreGuideOpen(true)}
          />
        )}

        {currentView === 'control-center' && (
          <SubscriptionControlCenter
            subscribers={subscribers}
            payments={paymentHistory}
            plans={monetization.plans}
            shopSettings={settings}
            onUpdateSubscribers={setSubscribers}
            onAddPayment={(record) => {
              setPaymentHistory((prev) => [record, ...prev]);
            }}
            onViewInvoice={setActiveSubscriptionInvoice}
            onOpenPlayStoreGuide={() => setIsPlayStoreGuideOpen(true)}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            settings={settings}
            products={products}
            categories={activeCategories}
            customCategories={customCategories}
            onSaveSettings={setSettings}
            onResetCatalog={handleResetCatalog}
            onAddCustomCategory={handleAddCustomCategory}
            onRenameCustomCategory={handleRenameCustomCategory}
            onDeleteCustomCategory={handleDeleteCustomCategory}
            subscription={subscription}
            monetization={monetization}
            onNavigateToMonetization={() => setCurrentView('monetization')}
            onNavigateToControlCenter={() => setCurrentView('control-center')}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            onOpenPlayStoreGuide={() => setIsPlayStoreGuideOpen(true)}
          />
        )}
      </main>

      {/* Global Thermal Receipt Modal */}
      {activeReceiptOrder && (
        <ReceiptModal
          order={activeReceiptOrder}
          settings={settings}
          onClose={() => setActiveReceiptOrder(null)}
        />
      )}

      {/* Global Shop QR Code & Digital Address Modal */}
      <ShopCodeQRGeneratorModal
        isOpen={isShopQrModalOpen}
        onClose={() => setIsShopQrModalOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Subscription & Upgrade Modal */}
      <SubscriptionModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        subscription={subscription}
        plans={monetization.plans.filter((p) => p.isActive)}
        gateway={monetization.gateway}
        settings={settings}
        onSubscribe={handleSubscribeSuccess}
      />

      {/* Subscription Invoice & Tax Receipt Modal */}
      <SubscriptionInvoiceModal
        invoice={activeSubscriptionInvoice}
        settings={settings}
        onClose={() => setActiveSubscriptionInvoice(null)}
      />

      {/* Master Play Store & Gateway Guide Modal */}
      <PlayStoreAndGatewayGuideModal
        isOpen={isPlayStoreGuideOpen}
        onClose={() => setIsPlayStoreGuideOpen(false)}
        onNavigateToGateway={() => setCurrentView('monetization')}
        onNavigateToControlCenter={() => setCurrentView('control-center')}
      />

      {/* PWA Offline Network Indicator */}
      <OfflineIndicator />
    </div>
  );
}

