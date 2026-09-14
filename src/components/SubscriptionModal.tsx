import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  X,
  ArrowRight,
  Zap,
  Tag,
  Gift,
  HelpCircle,
  Copy,
  Check,
  Smartphone,
  Lock
} from 'lucide-react';
import {
  SubscriptionPlan,
  PaymentGatewayConfig,
  AppSubscriptionState,
  ShopSettings,
  SubscriptionPaymentRecord
} from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  getTrialRemainingDays,
  getTrialProgress,
  calculateBillingDurationMs,
  generateInvoiceNumber
} from '../utils/subscriptionUtils';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: AppSubscriptionState;
  plans: SubscriptionPlan[];
  gateway: PaymentGatewayConfig;
  settings: ShopSettings;
  onSubscribe: (record: SubscriptionPaymentRecord) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscription,
  plans,
  gateway,
  settings,
  onSubscribe,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    plans.find((p) => p.isPopular)?.id || plans[0]?.id || ''
  );
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card input states for Stripe simulation
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const daysRemaining = getTrialRemainingDays(subscription);
  const trialProgress = getTrialProgress(subscription);
  const isTrialActive = subscription.status === 'trial' && daysRemaining > 0;
  const isPaidActive = subscription.status === 'active';

  // Generate QR Code if UPI gateway is active
  useEffect(() => {
    if (gateway.provider === 'upi_qr' && gateway.upiId && selectedPlan) {
      const upiPayUri = `upi://pay?pa=${encodeURIComponent(
        gateway.upiId
      )}&pn=${encodeURIComponent(
        gateway.upiMerchantName || 'Local Shopkeeper App'
      )}&am=${selectedPlan.price.toFixed(2)}&cu=${
        settings.currency === '₹' ? 'INR' : 'USD'
      }&tn=${encodeURIComponent(`Sub: ${selectedPlan.name}`)}`;

      QRCode.toDataURL(upiPayUri, {
        width: 200,
        margin: 1,
        color: {
          dark: '#1c1917',
          light: '#ffffff',
        },
      })
        .then((url) => setUpiQrDataUrl(url))
        .catch((err) => console.error('Failed to generate UPI QR:', err));
    }
  }, [gateway, selectedPlan, settings.currency]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    if (gateway.upiId) {
      navigator.clipboard.writeText(gateway.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleCompletePayment = (customRef?: string) => {
    setIsProcessing(true);

    setTimeout(() => {
      const durationMs = calculateBillingDurationMs(selectedPlan.billingCycle);
      const now = Date.now();
      const validUntil = now + durationMs;

      const record: SubscriptionPaymentRecord = {
        id: `sub-pay-${Date.now()}`,
        invoiceNumber: generateInvoiceNumber(),
        timestamp: now,
        shopName: settings.shopName,
        subscriberEmail: 'merchant@store.com',
        subscriberPhone: settings.phone,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        billingCycle: selectedPlan.billingCycle,
        amount: selectedPlan.price,
        currency: selectedPlan.currency || settings.currency,
        paymentGateway: gateway.provider,
        transactionRef:
          customRef ||
          transactionRef ||
          (gateway.isTestMode
            ? `SIM_TEST_${Math.floor(100000 + Math.random() * 900000)}`
            : `TXN_${Date.now()}`),
        status: 'success',
        validUntil,
      };

      onSubscribe(record);
      setIsProcessing(false);
      setIsCheckoutStep(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-3 sm:p-4 backdrop-blur-xs">
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/90 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-800 text-white shadow-xs">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  {isCheckoutStep ? 'Complete Subscription Payment' : 'Choose Your Store Plan'}
                </h3>
                {gateway.isTestMode && (
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                    🟢 Test Mode Active
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                {isCheckoutStep
                  ? `Paying via ${gateway.provider.toUpperCase().replace('_', ' ')} • Instant activation`
                  : 'Start with 2 months free trial, upgrade anytime to unlock unlimited business growth'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isCheckoutStep) {
                setIsCheckoutStep(false);
              } else {
                onClose();
              }
            }}
            className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Free Trial Countdown Ribbon */}
        <div className="border-b border-amber-200/80 bg-amber-50/80 px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-700 text-white">
                <Gift className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-950">
                    {isPaidActive
                      ? '⭐ Pro Plan Active License'
                      : '🎁 2-Month Free Trial Active (60 Days Total)'}
                  </span>
                  <span className="rounded-full bg-amber-200 px-2 py-0.2 text-[10px] font-extrabold text-amber-900">
                    {isPaidActive ? 'Paid Subscriber' : `${daysRemaining} Days Remaining`}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {isPaidActive
                    ? `Your current active license is good until ${new Date(
                        subscription.subscriptionEndDate || Date.now()
                      ).toLocaleDateString()}`
                    : `Enjoy all premium features including Multi-Tier Pricing & Standee QR free for your first 60 days.`}
                </p>
              </div>
            </div>

            {/* Trial progress bar */}
            {!isPaidActive && (
              <div className="flex items-center gap-2 sm:w-48">
                <div className="h-2 w-full rounded-full bg-amber-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-700 transition-all duration-500"
                    style={{ width: `${trialProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-900">
                  {trialProgress}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isCheckoutStep ? (
            /* Plan Selection View */
            <div className="space-y-6">
              <div className="text-center max-w-lg mx-auto">
                <h4 className="text-lg font-black text-stone-950 tracking-tight">
                  Transparent Pricing for Local Shopkeepers
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Keep 100% of your customer earnings. Zero transaction cuts or hidden hardware costs.
                </p>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const isSelected = plan.id === selectedPlanId;
                  const hasDiscount = plan.originalPrice && plan.originalPrice > plan.price;
                  const discountPct = hasDiscount
                    ? Math.round(((plan.originalPrice! - plan.price) / plan.originalPrice!) * 100)
                    : 0;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative flex flex-col justify-between rounded-3xl border p-5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-700 ring-2 ring-amber-700/20 bg-amber-50/20 shadow-lg'
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-md'
                      }`}
                    >
                      {plan.isPopular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-800 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm">
                          Best Value (2 Months Free)
                        </span>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-stone-900 text-sm">{plan.name}</h5>
                          {discountPct > 0 && (
                            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                              Save {discountPct}%
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                          {plan.description}
                        </p>

                        {/* Price display */}
                        <div className="mt-4 flex items-baseline gap-1.5">
                          <span className="text-2xl font-black font-mono text-stone-950">
                            {formatCurrency(plan.price, plan.currency || settings.currency)}
                          </span>
                          <span className="text-xs text-stone-500 font-medium">
                            /{plan.billingCycle}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs font-mono text-stone-400 line-through ml-1">
                              {formatCurrency(plan.originalPrice!, plan.currency || settings.currency)}
                            </span>
                          )}
                        </div>

                        {/* Features checklist */}
                        <div className="mt-5 space-y-2.5 border-t border-stone-100 pt-4">
                          {plan.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlanId(plan.id);
                            setIsCheckoutStep(true);
                          }}
                          className={`flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 text-xs font-bold transition-all shadow-xs ${
                            isSelected
                              ? 'bg-amber-800 text-white hover:bg-amber-900 shadow-md'
                              : 'border border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <span>Select {plan.name}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl bg-stone-50 p-4 text-xs text-stone-600 border border-stone-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>2-Month Zero Risk Free Trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span>Secure Owner Payment Gateway</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <span>Instant Pro Feature Activation</span>
                </div>
              </div>
            </div>
          ) : (
            /* Checkout & Gateway Payment Step */
            <div className="max-w-xl mx-auto space-y-6">
              {/* Order Summary Box */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Selected Plan
                    </span>
                    <h4 className="text-base font-black text-stone-950">{selectedPlan.name}</h4>
                    <p className="text-xs text-stone-500 capitalize">
                      Billing Cycle: {selectedPlan.billingCycle} (Renews after{' '}
                      {selectedPlan.billingCycle === 'lifetime'
                        ? 'Unlimited'
                        : selectedPlan.billingCycle === 'annual'
                        ? '365 days'
                        : selectedPlan.billingCycle === 'quarterly'
                        ? '90 days'
                        : '30 days'}
                      )
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-amber-800">
                      {formatCurrency(selectedPlan.price, selectedPlan.currency || settings.currency)}
                    </span>
                    <p className="text-[10px] text-stone-400">All Taxes & Licensing Included</p>
                  </div>
                </div>
              </div>

              {/* Gateway Provider Interface */}
              <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-amber-800" />
                    <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                      Owner Payment Gateway: {gateway.provider.toUpperCase().replace('_', ' ')}
                    </h5>
                  </div>
                  {gateway.isTestMode && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                      Simulation Mode
                    </span>
                  )}
                </div>

                {/* 1. UPI QR Gateway View */}
                {gateway.provider === 'upi_qr' && (
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-2">
                    {upiQrDataUrl && (
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 p-3 shadow-xs">
                        <img
                          src={upiQrDataUrl}
                          alt="Subscription UPI QR Code"
                          className="h-36 w-36 rounded-xl bg-white p-1"
                        />
                        <span className="mt-1 text-[10px] font-bold text-stone-500">
                          Scan with GPay / PhonePe / Paytm
                        </span>
                      </div>
                    )}

                    <div className="flex-1 space-y-3 text-xs">
                      <div>
                        <label className="text-[11px] font-bold text-stone-500 uppercase">
                          App Owner UPI ID
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={gateway.upiId || 'appowner@upi'}
                            className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-1.5 font-mono text-xs text-stone-900"
                          />
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="flex items-center gap-1 rounded-xl bg-stone-900 px-3 py-1.5 font-bold text-white hover:bg-stone-800 text-[11px]"
                          >
                            {copiedUpi ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-600">
                          UPI UTR / Reference No. (Optional in Test Mode)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 423981029312"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Razorpay Gateway View */}
                {gateway.provider === 'razorpay' && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-blue-900 text-sm">Razorpay Checkout</span>
                        <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-800">
                          Merchant ID: {gateway.razorpayKeyId?.slice(0, 12)}...
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-800">
                      Supports Credit Cards, Debit Cards, Netbanking, UPI, and Digital Wallets with automated verification.
                    </p>
                    <div className="rounded-xl bg-white p-3 border border-blue-200/80 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Merchant Name:</span>
                        <span className="font-bold text-stone-900">{settings.shopName} App Owner</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Key ID:</span>
                        <span className="font-mono text-stone-700">{gateway.razorpayKeyId}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Stripe Gateway View */}
                {gateway.provider === 'stripe' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-700">Card Information</span>
                      <span className="text-[10px] font-mono text-stone-400">
                        {gateway.stripePublishableKey?.slice(0, 16)}...
                      </span>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Card number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:border-amber-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:border-amber-600 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="CVC"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-mono text-stone-900 focus:border-amber-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Bank Transfer View */}
                {gateway.provider === 'bank_transfer' && (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Bank Name</span>
                        <p className="font-bold text-stone-900">{gateway.bankName || 'Commerce Bank'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Beneficiary</span>
                        <p className="font-bold text-stone-900">{gateway.accountHolderName || 'App Owner'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase">Account No</span>
                        <p className="font-mono font-bold text-stone-900">{gateway.accountNumber || '991823901'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase">IFSC / Routing</span>
                        <p className="font-mono font-bold text-stone-900">{gateway.ifscOrRouting || 'COMM00012'}</p>
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Enter Bank IMPS / NEFT Reference Number"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutStep(false)}
                  className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Change Plan
                </button>

                <button
                  type="button"
                  id="btn-confirm-subscription-pay"
                  disabled={isProcessing}
                  onClick={() => handleCompletePayment()}
                  className="flex items-center gap-2 rounded-2xl bg-amber-800 px-6 py-3 text-xs font-bold text-white shadow-xl hover:bg-amber-900 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Gateway Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-amber-300" />
                      <span>
                        {gateway.isTestMode ? 'Simulate Gateway Payment & Activate' : 'Pay & Activate Plan'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
