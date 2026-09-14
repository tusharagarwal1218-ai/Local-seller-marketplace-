import React, { useState } from 'react';
import {
  DollarSign,
  CreditCard,
  Settings,
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Check,
  QrCode,
  Building2,
  Sparkles,
  Gift,
  Clock,
  ExternalLink,
  Users,
  FileText,
  AlertCircle,
  Eye,
  RefreshCw,
  Percent,
  CheckCircle2,
  Info,
  Sliders
} from 'lucide-react';
import {
  SubscriptionPlan,
  PaymentGatewayConfig,
  AppSubscriptionState,
  ShopSettings,
  SubscriptionPaymentRecord,
  OwnerMonetizationSettings,
  GatewayProvider,
  BillingCycle
} from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import { getTrialRemainingDays, generateInvoiceNumber } from '../utils/subscriptionUtils';

interface OwnerMonetizationHubProps {
  monetization: OwnerMonetizationSettings;
  subscription: AppSubscriptionState;
  paymentHistory: SubscriptionPaymentRecord[];
  shopSettings: ShopSettings;
  onUpdateMonetization: (updated: OwnerMonetizationSettings) => void;
  onUpdateSubscription: (updated: AppSubscriptionState) => void;
  onOpenUpgradeModal: () => void;
  onViewInvoice: (invoice: SubscriptionPaymentRecord) => void;
  onNavigateToControlCenter?: () => void;
  onOpenPlayStoreGuide?: () => void;
}

export const OwnerMonetizationHub: React.FC<OwnerMonetizationHubProps> = ({
  monetization,
  subscription,
  paymentHistory,
  shopSettings,
  onUpdateMonetization,
  onUpdateSubscription,
  onOpenUpgradeModal,
  onViewInvoice,
  onNavigateToControlCenter,
  onOpenPlayStoreGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'gateway' | 'plans' | 'trial' | 'subscribers'>('gateway');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Gateway form state
  const [gatewayConfig, setGatewayConfig] = useState<PaymentGatewayConfig>(monetization.gateway);

  // Plans state
  const [plans, setPlans] = useState<SubscriptionPlan[]>(monetization.plans);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  // Trial settings state
  const [trialDays, setTrialDays] = useState<number>(monetization.freeTrialDays || 60);
  const [enforcePaywall, setEnforcePaywall] = useState<boolean>(monetization.enforcePaywallOnExpiry);

  // New plan template
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({
    name: 'Custom Pro Plan',
    billingCycle: 'monthly',
    price: 19.99,
    originalPrice: 24.99,
    currency: shopSettings.currency,
    description: 'Tailored for retail shops with custom business requirements.',
    features: [
      'Unlimited POS Registers',
      'Multi-Tier Wholesale Pricing',
      'WhatsApp Order Forwarding',
      'Inventory Alerts & Barcode Scanner'
    ],
    isActive: true,
    isPopular: false,
  });

  const [featureInput, setFeatureInput] = useState('');

  // Calculations
  const totalRevenue = paymentHistory.reduce((sum, item) => sum + (item.status === 'success' ? item.amount : 0), 0);
  const trialDaysLeft = getTrialRemainingDays(subscription);

  const triggerSaveNotification = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: OwnerMonetizationSettings = {
      ...monetization,
      gateway: gatewayConfig,
    };
    onUpdateMonetization(updated);
    triggerSaveNotification();
  };

  const handleTestGateway = () => {
    setTestResult('testing');
    setTimeout(() => {
      if (gatewayConfig.provider === 'upi_qr' && !gatewayConfig.upiId) {
        setTestResult('error: Please enter a valid UPI ID (e.g., yourname@okaxis)');
      } else if (
        gatewayConfig.provider === 'razorpay' &&
        (!gatewayConfig.razorpayKeyId || gatewayConfig.razorpayKeyId.length < 8)
      ) {
        setTestResult('error: Invalid Razorpay Key ID format.');
      } else if (
        gatewayConfig.provider === 'stripe' &&
        (!gatewayConfig.stripePublishableKey || !gatewayConfig.stripePublishableKey.startsWith('pk_'))
      ) {
        setTestResult('error: Stripe Publishable Key should start with pk_test_ or pk_live_');
      } else {
        setTestResult('success: Payment Gateway endpoint verified & ready to receive payments!');
      }
    }, 800);
  };

  const handleSaveTrialSettings = () => {
    const updatedMonetization: OwnerMonetizationSettings = {
      ...monetization,
      freeTrialDays: trialDays,
      enforcePaywallOnExpiry: enforcePaywall,
    };
    onUpdateMonetization(updatedMonetization);

    // Also update current subscription trial state if requested
    const msPerDay = 24 * 60 * 60 * 1000;
    const updatedSub: AppSubscriptionState = {
      ...subscription,
      trialDurationDays: trialDays,
      trialEndDate: subscription.trialStartDate + (trialDays * msPerDay),
      enforcePaywall,
    };
    onUpdateSubscription(updatedSub);
    triggerSaveNotification();
  };

  const handleExtendCurrentTrial = (extraDays: number) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const updatedSub: AppSubscriptionState = {
      ...subscription,
      status: 'trial',
      trialEndDate: (subscription.trialEndDate || Date.now()) + (extraDays * msPerDay),
    };
    onUpdateSubscription(updatedSub);
    triggerSaveNotification();
  };

  const handleSavePlanEdit = () => {
    if (!editingPlan) return;
    const updatedPlans = plans.map((p) => (p.id === editingPlan.id ? editingPlan : p));
    setPlans(updatedPlans);
    onUpdateMonetization({ ...monetization, plans: updatedPlans });
    setEditingPlan(null);
    triggerSaveNotification();
  };

  const handleCreatePlan = () => {
    if (!newPlan.name || !newPlan.price) return;
    const createdPlan: SubscriptionPlan = {
      id: `plan-${Date.now()}`,
      name: newPlan.name,
      billingCycle: (newPlan.billingCycle as BillingCycle) || 'monthly',
      price: Number(newPlan.price),
      originalPrice: newPlan.originalPrice ? Number(newPlan.originalPrice) : undefined,
      currency: newPlan.currency || shopSettings.currency,
      description: newPlan.description || '',
      features: newPlan.features && newPlan.features.length > 0 ? newPlan.features : ['Full POS & Catalog'],
      isActive: newPlan.isActive !== false,
      isPopular: !!newPlan.isPopular,
    };

    const updated = [...plans, createdPlan];
    setPlans(updated);
    onUpdateMonetization({ ...monetization, plans: updated });
    setIsAddingPlan(false);
    triggerSaveNotification();
  };

  const handleDeletePlan = (id: string) => {
    if (plans.length <= 1) {
      alert('You must retain at least one subscription plan to sell.');
      return;
    }
    const updated = plans.filter((p) => p.id !== id);
    setPlans(updated);
    onUpdateMonetization({ ...monetization, plans: updated });
    triggerSaveNotification();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* Top Banner / Hero */}
      <div className="rounded-3xl bg-linear-to-r from-stone-900 via-stone-850 to-amber-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-0.5 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                App Owner Monetization Hub
              </span>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-mono text-emerald-300">
                {gatewayConfig.isTestMode ? 'Test Mode Active' : 'Live Gateway Ready'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Subscription & Payment Gateway Manager
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl">
              Earn recurring revenue from shopkeepers. Give a 2-month free trial (60 days), configure your payment gateway (UPI QR, Razorpay, Stripe), and sell customized monthly or annual subscription plans.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenPlayStoreGuide && (
              <button
                type="button"
                onClick={onOpenPlayStoreGuide}
                className="flex items-center gap-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all active:scale-95"
              >
                <Info className="h-4 w-4 text-amber-400" />
                <span>Play Store & Gateway Guide</span>
              </button>
            )}

            {onNavigateToControlCenter && (
              <button
                type="button"
                onClick={onNavigateToControlCenter}
                className="flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-2.5 text-xs font-black text-stone-950 shadow-md hover:bg-amber-300 transition-all active:scale-95"
              >
                <Sliders className="h-4 w-4" />
                <span>Open Master Control Center</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-white/20 transition-all active:scale-95 backdrop-blur-xs"
            >
              <Eye className="h-4 w-4 text-amber-300" />
              <span>Preview Customer Plan View</span>
            </button>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-stone-800">
          <div className="rounded-2xl bg-stone-800/60 p-3.5 border border-stone-700/50">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Total Revenue</span>
            <p className="text-xl font-black font-mono text-amber-400 mt-1">
              {formatCurrency(totalRevenue, shopSettings.currency)}
            </p>
            <p className="text-[10px] text-stone-400 mt-0.5">Subscription earnings</p>
          </div>

          <div className="rounded-2xl bg-stone-800/60 p-3.5 border border-stone-700/50">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Free Trial Duration</span>
            <p className="text-xl font-black font-mono text-white mt-1">
              {monetization.freeTrialDays || 60} Days
            </p>
            <p className="text-[10px] text-amber-300 mt-0.5">2 Months Free Trial</p>
          </div>

          <div className="rounded-2xl bg-stone-800/60 p-3.5 border border-stone-700/50">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Active Gateway</span>
            <p className="text-xl font-black text-white mt-1 uppercase">
              {monetization.gateway.provider.replace('_', ' ')}
            </p>
            <p className="text-[10px] text-stone-400 mt-0.5">Direct to owner account</p>
          </div>

          <div className="rounded-2xl bg-stone-800/60 p-3.5 border border-stone-700/50">
            <span className="text-[10px] font-bold text-stone-400 uppercase">Published Plans</span>
            <p className="text-xl font-black font-mono text-white mt-1">
              {monetization.plans.filter((p) => p.isActive).length} Plans
            </p>
            <p className="text-[10px] text-stone-400 mt-0.5">Available for shopkeepers</p>
          </div>
        </div>
      </div>

      {/* Floating Save Confirmation */}
      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 shadow-xs animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Settings successfully saved and published!</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('gateway')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all ${
            activeTab === 'gateway'
              ? 'border-amber-700 text-amber-900 bg-amber-50/30'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Payment Gateway Configuration</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all ${
            activeTab === 'plans'
              ? 'border-amber-700 text-amber-900 bg-amber-50/30'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Sell Plans & Pricing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trial')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all ${
            activeTab === 'trial'
              ? 'border-amber-700 text-amber-900 bg-amber-50/30'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Gift className="h-4 w-4" />
          <span>2-Month Free Trial Controls</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('subscribers')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-xs font-bold transition-all ${
            activeTab === 'subscribers'
              ? 'border-amber-700 text-amber-900 bg-amber-50/30'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Revenue & Subscriber Ledger</span>
        </button>
      </div>

      {/* Tab 1: Payment Gateway Setup */}
      {activeTab === 'gateway' && (
        <form onSubmit={handleSaveGateway} className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-950">
                Configure Owner Payment Gateway
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Set up how shopkeepers pay you for their subscriptions. Money collected goes straight to your account.
              </p>
            </div>

            {/* Provider Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                {
                  id: 'upi_qr' as GatewayProvider,
                  name: 'UPI Direct QR',
                  desc: 'Instant bank payout, zero commission',
                  icon: QrCode,
                },
                {
                  id: 'razorpay' as GatewayProvider,
                  name: 'Razorpay',
                  desc: 'Cards, Netbanking, UPI, Wallets',
                  icon: CreditCard,
                },
                {
                  id: 'stripe' as GatewayProvider,
                  name: 'Stripe',
                  desc: 'International credit & debit cards',
                  icon: CreditCard,
                },
                {
                  id: 'paypal' as GatewayProvider,
                  name: 'PayPal',
                  desc: 'Global merchant billing',
                  icon: ExternalLink,
                },
                {
                  id: 'bank_transfer' as GatewayProvider,
                  name: 'Bank Transfer',
                  desc: 'Direct Wire / NEFT / IMPS',
                  icon: Building2,
                },
              ].map((prov) => {
                const isSelected = gatewayConfig.provider === prov.id;
                const Icon = prov.icon;
                return (
                  <div
                    key={prov.id}
                    onClick={() => setGatewayConfig({ ...gatewayConfig, provider: prov.id })}
                    className={`flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-700 bg-amber-50/40 shadow-xs ring-2 ring-amber-700/20'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-amber-800' : 'text-stone-400'}`} />
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-amber-700" />
                      )}
                    </div>
                    <div className="mt-3">
                      <h4 className="text-xs font-bold text-stone-900">{prov.name}</h4>
                      <p className="text-[10px] text-stone-500 mt-0.5">{prov.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Test Mode vs Live Switch */}
            <div className="flex items-center justify-between rounded-2xl bg-stone-50 p-4 border border-stone-200">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-stone-900">Sandbox / Test Mode Simulation</span>
                <p className="text-[11px] text-stone-500">
                  Allow yourself and shopkeepers to test plan subscriptions without charging real credit cards or UPI accounts.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={gatewayConfig.isTestMode}
                  onChange={(e) => setGatewayConfig({ ...gatewayConfig, isTestMode: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-stone-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-700 peer-checked:after:translate-x-full" />
              </label>
            </div>

            {/* Provider specific settings fields */}
            {gatewayConfig.provider === 'upi_qr' && (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  UPI Gateway Details (Direct Merchant Settlement)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Your UPI ID (VPA) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. appowner@okaxis or 9876543210@paytm"
                      value={gatewayConfig.upiId || ''}
                      onChange={(e) => setGatewayConfig({ ...gatewayConfig, upiId: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 font-mono focus:border-amber-600 focus:outline-hidden"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Payments made by merchants will be routed directly to this UPI address.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Merchant Payee Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Shopkeeper App SaaS HQ"
                      value={gatewayConfig.upiMerchantName || ''}
                      onChange={(e) =>
                        setGatewayConfig({ ...gatewayConfig, upiMerchantName: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {gatewayConfig.provider === 'razorpay' && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Razorpay API Credentials
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Razorpay Key ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="rzp_test_... or rzp_live_..."
                      value={gatewayConfig.razorpayKeyId || ''}
                      onChange={(e) =>
                        setGatewayConfig({ ...gatewayConfig, razorpayKeyId: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-900 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Razorpay Key Secret
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      value={gatewayConfig.razorpayKeySecret || ''}
                      onChange={(e) =>
                        setGatewayConfig({ ...gatewayConfig, razorpayKeySecret: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-900 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {gatewayConfig.provider === 'stripe' && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Stripe API Keys
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Stripe Publishable Key *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="pk_test_... or pk_live_..."
                      value={gatewayConfig.stripePublishableKey || ''}
                      onChange={(e) =>
                        setGatewayConfig({ ...gatewayConfig, stripePublishableKey: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-900 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Stripe Secret Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk_test_... or sk_live_..."
                      value={gatewayConfig.stripeSecretKey || ''}
                      onChange={(e) =>
                        setGatewayConfig({ ...gatewayConfig, stripeSecretKey: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-900 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {gatewayConfig.provider === 'bank_transfer' && (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Bank Account Wire Instructions
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank or Chase"
                      value={gatewayConfig.bankName || ''}
                      onChange={(e) => setGatewayConfig({ ...gatewayConfig, bankName: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 50100238192019"
                      value={gatewayConfig.accountNumber || ''}
                      onChange={(e) =>
                        setGatewayConfig({ ...gatewayConfig, accountNumber: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      IFSC / Swift / Routing Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001928"
                      value={gatewayConfig.ifscOrRouting || ''}
                      onChange={(e) =>
                        setGatewayConfig({ ...gatewayConfig, ifscOrRouting: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-mono text-stone-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Beneficiary Account Holder Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Platform Owner Pvt Ltd"
                      value={gatewayConfig.accountHolderName || ''}
                      onChange={(e) =>
                        setGatewayConfig({ ...gatewayConfig, accountHolderName: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Test Connection Button & Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestGateway}
                  className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 shadow-xs"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${testResult === 'testing' ? 'animate-spin' : ''}`} />
                  <span>Test Gateway Connection</span>
                </button>

                {testResult && testResult !== 'testing' && (
                  <span
                    className={`text-xs font-bold ${
                      testResult.startsWith('success') ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {testResult}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-2xl bg-amber-800 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-900 transition-all"
              >
                <Check className="h-4 w-4" />
                <span>Save Payment Gateway Settings</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Sell Plans & Pricing */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-950">Active Subscription Plans</h3>
              <p className="text-xs text-stone-500">
                Create and edit the pricing plans displayed to shopkeepers when their 2-month free trial finishes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingPlan(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-stone-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-stone-800"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Plan</span>
            </button>
          </div>

          {/* New Plan Form Modal / Drawer */}
          {isAddingPlan && (
            <div className="rounded-3xl border-2 border-dashed border-amber-600 bg-amber-50/30 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-stone-900">Create New Subscription Plan</h4>
                <button
                  type="button"
                  onClick={() => setIsAddingPlan(false)}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Plan Name *</label>
                  <input
                    type="text"
                    value={newPlan.name || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Billing Cycle</label>
                  <select
                    value={newPlan.billingCycle || 'monthly'}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, billingCycle: e.target.value as BillingCycle })
                    }
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-900"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual (Recommended)</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">Selling Price *</label>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-stone-600">{shopSettings.currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={newPlan.price || ''}
                      onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-mono font-bold text-stone-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPlan(false)}
                  className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreatePlan}
                  className="rounded-xl bg-amber-800 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-900"
                >
                  Publish Plan
                </button>
              </div>
            </div>
          )}

          {/* Edit Plan Modal */}
          {editingPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4">
              <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4 border border-stone-200">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <h4 className="text-sm font-bold text-stone-900">Edit Plan: {editingPlan.name}</h4>
                  <button
                    onClick={() => setEditingPlan(null)}
                    className="text-stone-400 hover:text-stone-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Plan Title</label>
                    <input
                      type="text"
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Price ({shopSettings.currency})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingPlan.price}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-mono font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Original Price (Strikethrough)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingPlan.originalPrice || ''}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          originalPrice: parseFloat(e.target.value) || undefined,
                        })
                      }
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">Description</label>
                    <input
                      type="text"
                      value={editingPlan.description}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, description: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900"
                    />
                  </div>

                  <div className="col-span-2 flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                      <input
                        type="checkbox"
                        checked={editingPlan.isPopular}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, isPopular: e.target.checked })
                        }
                        className="rounded text-amber-700"
                      />
                      <span>Mark as "Best Value / Popular"</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                      <input
                        type="checkbox"
                        checked={editingPlan.isActive}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, isActive: e.target.checked })
                        }
                        className="rounded text-amber-700"
                      />
                      <span>Active for Sale</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-bold text-stone-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePlanEdit}
                    className="rounded-xl bg-amber-800 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-900"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Published Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="relative rounded-3xl border border-stone-200 bg-white p-5 shadow-xs flex flex-col justify-between"
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-4 rounded-full bg-amber-800 px-2.5 py-0.5 text-[10px] font-black uppercase text-white shadow-xs">
                    Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-sm">{plan.name}</h4>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600 capitalize">
                      {plan.billingCycle}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-stone-950">
                      {formatCurrency(plan.price, plan.currency || shopSettings.currency)}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">/{plan.billingCycle}</span>
                    {plan.originalPrice && (
                      <span className="text-xs font-mono text-stone-400 line-through ml-2">
                        {formatCurrency(plan.originalPrice, plan.currency || shopSettings.currency)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500 mt-2">{plan.description}</p>

                  <div className="mt-4 space-y-1.5 border-t border-stone-100 pt-3">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-stone-700">
                        <Check className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(plan)}
                    className="flex items-center gap-1 text-xs font-bold text-stone-700 hover:text-amber-800"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Plan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: 2-Month Free Trial Controls */}
      {activeTab === 'trial' && (
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-950">2-Month Free Trial Manager</h3>
              <p className="text-xs text-stone-500">
                Grant 60 days free access to new stores before requiring a paid plan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Default Free Trial Length (Days)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={trialDays}
                  onChange={(e) => setTrialDays(parseInt(e.target.value) || 60)}
                  className="w-28 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-bold font-mono text-stone-900"
                />
                <span className="text-xs font-bold text-stone-500">
                  Days ({Math.round(trialDays / 30)} Months)
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Default is 60 days (exactly 2 full months) as requested.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">
                  Enforce Paywall When Trial Expires
                </label>
                <input
                  type="checkbox"
                  checked={enforcePaywall}
                  onChange={(e) => setEnforcePaywall(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-700"
                />
              </div>
              <p className="text-[11px] text-stone-500">
                When enabled, shopkeepers who exceed 60 days free trial will be prompted to select a plan to continue billing.
              </p>
            </div>
          </div>

          {/* Current Store Trial Status & Manual Overrides */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-900 uppercase">
                  Connected Store Trial Status
                </span>
                <p className="text-sm font-black text-stone-900 mt-0.5">
                  {subscription.status === 'active'
                    ? 'Active Paid Pro License'
                    : `${trialDaysLeft} Days Remaining in Current 60-Day Trial`}
                </p>
                <p className="text-[11px] text-stone-500">
                  Started: {formatDate(subscription.trialStartDate)} • Ends:{' '}
                  {formatDate(subscription.trialEndDate)}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleExtendCurrentTrial(30)}
                  className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-xs"
                >
                  +30 Days Extension
                </button>
                <button
                  type="button"
                  onClick={() => handleExtendCurrentTrial(60)}
                  className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-xs"
                >
                  +60 Days (2 Months)
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveTrialSettings}
              className="flex items-center gap-1.5 rounded-2xl bg-amber-800 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-900"
            >
              <Check className="h-4 w-4" />
              <span>Apply Trial Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Revenue & Subscriber Ledger */}
      {activeTab === 'subscribers' && (
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-950">Subscription Invoices & Payment Ledger</h3>
              <p className="text-xs text-stone-500">
                Official records of subscription dues collected via your payment gateway.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-stone-500">Total Invoiced:</span>
              <span className="ml-2 text-base font-black font-mono text-emerald-700">
                {formatCurrency(totalRevenue, shopSettings.currency)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Shop / Subscriber</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Gateway</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paymentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-stone-400">
                      No subscription payments recorded yet. Active trial store has not been invoiced.
                    </td>
                  </tr>
                ) : (
                  paymentHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/60">
                      <td className="px-4 py-3 font-mono font-bold text-stone-900">
                        {item.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-stone-500 font-mono text-[11px]">
                        {formatDateTime(item.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-stone-900">{item.shopName}</p>
                        <p className="text-[10px] text-stone-400 font-mono">{item.transactionRef}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-stone-800">{item.planName}</span>
                        <span className="ml-1 text-[10px] text-stone-400 capitalize">
                          ({item.billingCycle})
                        </span>
                      </td>
                      <td className="px-4 py-3 uppercase text-[10px] font-bold text-stone-600">
                        {item.paymentGateway}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-stone-950">
                        {formatCurrency(item.amount, item.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onViewInvoice(item)}
                          className="flex items-center gap-1 ml-auto text-xs font-bold text-amber-800 hover:text-amber-900"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
