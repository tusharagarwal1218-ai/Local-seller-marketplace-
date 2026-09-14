import {
  SubscriptionPlan,
  PaymentGatewayConfig,
  AppSubscriptionState,
  OwnerMonetizationSettings,
  SubscriptionPaymentRecord,
  SubscriberRecord
} from '../types';

export const INITIAL_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-starter-monthly',
    name: 'Starter Monthly',
    billingCycle: 'monthly',
    price: 14.99,
    originalPrice: 19.99,
    currency: '$',
    description: 'Essential POS billing and customer showcase for small local neighborhood stores.',
    features: [
      'Full Point-of-Sale Billing Terminal',
      'Barcode Camera & Hardware Scanner',
      'Customer Showcase with QR code',
      'Up to 100 Products Catalog',
      'Daily Sales Reports & Receipt Printing',
      'Email & Community Support'
    ],
    isActive: true,
    isPopular: false,
  },
  {
    id: 'plan-pro-annual',
    name: 'Pro Merchant Annual',
    billingCycle: 'annual',
    price: 99.99,
    originalPrice: 179.88,
    currency: '$',
    description: 'Most popular plan with 2 months free. Perfect for growing kirana & retail shops.',
    features: [
      'Everything in Starter',
      'Multi-Tier Pricing (Retail, Wholesale, Agent)',
      'Unlimited Products & Variant Sizes',
      'Branded QR Standee & Digital Address Maker',
      'Customer Order Box with WhatsApp Forwarding',
      'Stock Alert Notifications & Low Inventory Badges',
      'Priority 24/7 Phone & WhatsApp Support'
    ],
    isActive: true,
    isPopular: true,
  },
  {
    id: 'plan-quarterly',
    name: 'Growth Quarterly',
    billingCycle: 'quarterly',
    price: 39.99,
    originalPrice: 44.97,
    currency: '$',
    description: 'Flexible 3-month cycle for seasonal businesses and emerging storefronts.',
    features: [
      'Everything in Starter',
      'Multi-Tier Pricing',
      'Customer Order Box',
      'Sales Ledger & CSV Export',
      'Standard Tech Support'
    ],
    isActive: true,
    isPopular: false,
  },
  {
    id: 'plan-lifetime-pass',
    name: 'Lifetime Merchant Pass',
    billingCycle: 'lifetime',
    price: 249.99,
    originalPrice: 399.99,
    currency: '$',
    description: 'Pay once, use forever. No recurring fees, all future upgrades included.',
    features: [
      'Unlimited Everything Forever',
      'All Future Pro Features & AI Modules',
      'Zero Transaction or Platform Fees',
      'Multi-Counter Network Support',
      'Dedicated Account Manager'
    ],
    isActive: true,
    isPopular: false,
  }
];

export const INITIAL_PAYMENT_GATEWAY: PaymentGatewayConfig = {
  provider: 'upi_qr',
  isEnabled: true,
  isTestMode: true, // Enabled for instant simulation and safe testing
  // Razorpay
  razorpayKeyId: 'rzp_test_9k8xY1pLmN3q4v',
  razorpayKeySecret: '••••••••••••••••••••',
  // Stripe
  stripePublishableKey: 'pk_test_51MzQW8SJ987654321',
  stripeSecretKey: '••••••••••••••••••••',
  // UPI
  upiId: 'appowner.merchants@okaxis',
  upiMerchantName: 'Local Shopkeeper App HQ',
  // Bank
  bankName: 'Global Merchant Commerce Bank',
  accountNumber: '918234810293',
  ifscOrRouting: 'GMCB0001928',
  accountHolderName: 'App Platform Holdings Inc.',
  instructions: 'After sending payment via UPI or Bank Transfer, the plan activates automatically in test mode or upon entering transaction reference.'
};

export const INITIAL_OWNER_MONETIZATION: OwnerMonetizationSettings = {
  freeTrialDays: 60, // Exactly 2 months free trial
  gateway: INITIAL_PAYMENT_GATEWAY,
  plans: INITIAL_SUBSCRIPTION_PLANS,
  enforcePaywallOnExpiry: true,
  currency: '$',
};

// Start a 60-day (2-month) free trial from 2 days ago so user sees ~58 days left
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();
const TRIAL_START = NOW - (2 * MS_PER_DAY); // started 2 days ago
const TRIAL_DURATION_DAYS = 60; // 2 months
const TRIAL_END = TRIAL_START + (TRIAL_DURATION_DAYS * MS_PER_DAY);

export const INITIAL_APP_SUBSCRIPTION: AppSubscriptionState = {
  status: 'trial',
  trialStartDate: TRIAL_START,
  trialDurationDays: TRIAL_DURATION_DAYS,
  trialEndDate: TRIAL_END,
  totalPaid: 0,
  enforcePaywall: false,
};

export const INITIAL_SUBSCRIBERS: SubscriberRecord[] = [
  {
    id: 'SUB-8821',
    shopId: 'SHOP-7821',
    shopName: 'Green Corner Grocery',
    ownerName: 'Ramesh Patel',
    ownerEmail: 'ramesh@greencorner.com',
    ownerPhone: '+1 (555) 382-9104',
    status: 'trial',
    planId: 'plan-pro-annual',
    planName: 'Pro Merchant Annual',
    billingCycle: 'annual',
    licenseKey: 'LIC-2026-X99B-8821',
    startDate: TRIAL_START,
    expiryDate: TRIAL_END,
    trialDaysTotal: 60,
    totalPaidAmount: 0,
    currency: '$',
    paymentGateway: 'upi_qr',
    transactionRef: 'TRIAL-60DAY-PROMO',
    notes: 'Registered with 2-Month Free Trial. Interested in barcode scanner setup.',
    createdAt: TRIAL_START,
  },
  {
    id: 'SUB-5514',
    shopId: 'SHOP-4491',
    shopName: 'Metro Daily Supermarket',
    ownerName: 'David Miller',
    ownerEmail: 'david@metrodaily.com',
    ownerPhone: '+1 (555) 721-3940',
    status: 'active',
    planId: 'plan-pro-annual',
    planName: 'Pro Merchant Annual',
    billingCycle: 'annual',
    licenseKey: 'LIC-2026-M55A-5514',
    startDate: NOW - (30 * MS_PER_DAY),
    expiryDate: NOW + (335 * MS_PER_DAY),
    trialDaysTotal: 60,
    totalPaidAmount: 99.99,
    currency: '$',
    paymentGateway: 'stripe',
    transactionRef: 'ch_3N8zXvSJ987654321',
    notes: 'Converted from 2-month trial to Pro Annual. Paid via Stripe.',
    createdAt: NOW - (90 * MS_PER_DAY),
  },
  {
    id: 'SUB-3392',
    shopId: 'SHOP-9021',
    shopName: 'Sunrise Organic Mart',
    ownerName: 'Sunita Roy',
    ownerEmail: 'sunita@sunrisemart.com',
    ownerPhone: '+1 (555) 604-1188',
    status: 'active',
    planId: 'plan-starter-monthly',
    planName: 'Starter Monthly',
    billingCycle: 'monthly',
    licenseKey: 'LIC-2026-S33C-3392',
    startDate: NOW - (15 * MS_PER_DAY),
    expiryDate: NOW + (15 * MS_PER_DAY),
    trialDaysTotal: 60,
    totalPaidAmount: 14.99,
    currency: '$',
    paymentGateway: 'upi_qr',
    transactionRef: 'UPI-REF-992144',
    notes: 'Monthly billing Kirana shop owner. Uses WhatsApp drawer feature heavily.',
    createdAt: NOW - (75 * MS_PER_DAY),
  },
  {
    id: 'SUB-7719',
    shopId: 'SHOP-6120',
    shopName: 'Apex Electronics & Spares',
    ownerName: 'Marcus Vance',
    ownerEmail: 'marcus@apexelectro.com',
    ownerPhone: '+1 (555) 492-7711',
    status: 'expired',
    planId: 'plan-starter-monthly',
    planName: 'Starter Monthly',
    billingCycle: 'monthly',
    licenseKey: 'LIC-2026-A77E-7719',
    startDate: NOW - (65 * MS_PER_DAY),
    expiryDate: NOW - (5 * MS_PER_DAY),
    trialDaysTotal: 60,
    totalPaidAmount: 0,
    currency: '$',
    paymentGateway: 'bank_transfer',
    transactionRef: 'WIRE-EXPIRED',
    notes: 'Trial expired 5 days ago. Sent renewal reminder via email.',
    createdAt: NOW - (65 * MS_PER_DAY),
  },
  {
    id: 'SUB-9941',
    shopId: 'SHOP-3312',
    shopName: 'Urban Pantry Wholesale',
    ownerName: 'Fatima Al-Hassan',
    ownerEmail: 'fatima@urbanpantry.com',
    ownerPhone: '+1 (555) 813-9941',
    status: 'active',
    planId: 'plan-lifetime-pass',
    planName: 'Lifetime Merchant Pass',
    billingCycle: 'lifetime',
    licenseKey: 'LIC-2026-LIFE-9941',
    startDate: NOW - (10 * MS_PER_DAY),
    expiryDate: NOW + (100 * 365 * MS_PER_DAY),
    trialDaysTotal: 60,
    totalPaidAmount: 249.99,
    currency: '$',
    paymentGateway: 'razorpay',
    transactionRef: 'pay_N9941lifetime_ok',
    notes: 'VIP customer with Lifetime pass. Multi-counter setup.',
    createdAt: NOW - (40 * MS_PER_DAY),
  }
];

export const INITIAL_PAYMENT_HISTORY: SubscriptionPaymentRecord[] = [
  {
    id: 'sub-tx-1001',
    subscriberId: 'SUB-8821',
    invoiceNumber: 'INV-2026-0812',
    timestamp: NOW - (45 * MS_PER_DAY),
    shopName: 'Green Corner Grocery',
    subscriberEmail: 'ramesh@greencorner.com',
    subscriberPhone: '+1 (555) 382-9104',
    planId: 'plan-starter-monthly',
    planName: 'Starter Monthly (Trial Activation)',
    billingCycle: 'monthly',
    amount: 0.00,
    currency: '$',
    paymentGateway: 'upi_qr',
    transactionRef: 'TRIAL-60DAY-PROMO',
    status: 'success',
    validUntil: TRIAL_END,
    notes: 'Initial 60-day trial onboarding.'
  },
  {
    id: 'sub-tx-1002',
    subscriberId: 'SUB-5514',
    invoiceNumber: 'INV-2026-0824',
    timestamp: NOW - (30 * MS_PER_DAY),
    shopName: 'Metro Daily Supermarket',
    subscriberEmail: 'david@metrodaily.com',
    subscriberPhone: '+1 (555) 721-3940',
    planId: 'plan-pro-annual',
    planName: 'Pro Merchant Annual',
    billingCycle: 'annual',
    amount: 99.99,
    currency: '$',
    paymentGateway: 'stripe',
    transactionRef: 'ch_3N8zXvSJ987654321',
    status: 'success',
    validUntil: NOW + (335 * MS_PER_DAY),
    notes: 'Upgraded after 2-month trial ended.'
  },
  {
    id: 'sub-tx-1003',
    subscriberId: 'SUB-3392',
    invoiceNumber: 'INV-2026-0830',
    timestamp: NOW - (15 * MS_PER_DAY),
    shopName: 'Sunrise Organic Mart',
    subscriberEmail: 'sunita@sunrisemart.com',
    subscriberPhone: '+1 (555) 604-1188',
    planId: 'plan-starter-monthly',
    planName: 'Starter Monthly',
    billingCycle: 'monthly',
    amount: 14.99,
    currency: '$',
    paymentGateway: 'upi_qr',
    transactionRef: 'UPI-REF-992144',
    status: 'success',
    validUntil: NOW + (15 * MS_PER_DAY),
    notes: 'Renewed monthly subscription via UPI QR.'
  },
  {
    id: 'sub-tx-1004',
    subscriberId: 'SUB-9941',
    invoiceNumber: 'INV-2026-0902',
    timestamp: NOW - (10 * MS_PER_DAY),
    shopName: 'Urban Pantry Wholesale',
    subscriberEmail: 'fatima@urbanpantry.com',
    subscriberPhone: '+1 (555) 813-9941',
    planId: 'plan-lifetime-pass',
    planName: 'Lifetime Merchant Pass',
    billingCycle: 'lifetime',
    amount: 249.99,
    currency: '$',
    paymentGateway: 'razorpay',
    transactionRef: 'pay_N9941lifetime_ok',
    status: 'success',
    validUntil: NOW + (100 * 365 * MS_PER_DAY),
    notes: 'Lifetime Pass conversion via Razorpay.'
  }
];

