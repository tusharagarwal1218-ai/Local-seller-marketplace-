export type StandardCategory =
  | 'All'
  | 'Daily Essentials'
  | 'Fresh Produce'
  | 'Bakery & Dairy'
  | 'Beverages & Tea'
  | 'Snacks & Confectionery'
  | 'Spices & Condiments'
  | 'Personal & Home Care';

export type Category = StandardCategory | (string & {});

export type ProductUnit =
  | 'kg'
  | '500g'
  | '250g'
  | '100g'
  | 'pc'
  | 'pack'
  | 'litre'
  | '500ml'
  | 'dozen'
  | 'box'
  | 'bottle'
  | 'g'
  | 'ml';

export type PricingTier = 'retail' | 'wholesale' | 'agent';

export interface ProductVariant {
  id: string;
  name: string; // e.g., "500g", "1 kg", "Pack of 3"
  unit?: ProductUnit;
  mrp?: number;
  price: number; // Retail price
  wholesalePrice?: number;
  agentPrice?: number;
  costPrice?: number;
  stock: number;
  barcode?: string;
}

export interface Product {
  id: string;
  name: string;
  localName?: string;
  category: Category;
  price: number; // Standard Retail Price
  mrp?: number;
  wholesalePrice?: number;
  agentPrice?: number;
  costPrice?: number;
  unit: ProductUnit;
  stock: number;
  minStockThreshold: number;
  imageUrl: string;
  barcode?: string;
  description?: string;
  isAvailable: boolean;
  featured?: boolean;
  badge?: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  lastUpdated?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customPrice?: number;
  variantId?: string;
  variantName?: string;
  tier?: PricingTier;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'upi_qr' | 'card' | 'store_credit';

export interface OrderItem {
  productId: string;
  name: string;
  localName?: string;
  variantName?: string;
  unit: string;
  price: number;
  mrp?: number;
  quantity: number;
  total: number;
  tier?: PricingTier;
}

export type OrderType = 'pos_sale' | 'customer_delivery' | 'customer_pickup';

export interface Order {
  id: string;
  receiptNumber: string;
  timestamp: number;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountPercent: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  changeGiven?: number;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  orderType?: OrderType;
  orderStatus?: 'pending' | 'accepted' | 'completed' | 'cancelled';
  status: 'completed' | 'cancelled';
  notes?: string;
  pricingTier?: PricingTier;
}

export interface CustomerProfile {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  isLoggedIn: boolean;
  connectedShopCode?: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  address: string;
  currency: string;
  currencyCode: string;
  enableTax: boolean;
  taxRate: number;
  upiId?: string;
  receiptFooter: string;
  shopCode: string;
  digitalAddressSlug?: string;
  customCategories?: string[];
}

export type ViewMode = 'pos' | 'display' | 'inventory' | 'sales' | 'settings' | 'monetization' | 'control-center';

export type BillingCycle = 'monthly' | 'quarterly' | 'annual' | 'lifetime';

export interface SubscriptionPlan {
  id: string;
  name: string;
  billingCycle: BillingCycle;
  price: number;
  originalPrice?: number;
  currency: string;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
  description: string;
}

export type GatewayProvider = 'upi_qr' | 'razorpay' | 'stripe' | 'paypal' | 'bank_transfer';

export interface PaymentGatewayConfig {
  provider: GatewayProvider;
  isEnabled: boolean;
  isTestMode: boolean;
  // Razorpay
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  // Stripe
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  // UPI Gateway
  upiId?: string;
  upiMerchantName?: string;
  // Bank Transfer
  bankName?: string;
  accountNumber?: string;
  ifscOrRouting?: string;
  accountHolderName?: string;
  // Instructions
  instructions?: string;
}

export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'grace_period' | 'suspended';

export interface AppSubscriptionState {
  status: SubscriptionStatus;
  trialStartDate: number;
  trialDurationDays: number; // 60 days by default (2 months)
  trialEndDate: number;
  currentPlanId?: string;
  currentPlanName?: string;
  currentBillingCycle?: BillingCycle;
  subscriptionStartDate?: number;
  subscriptionEndDate?: number;
  autoRenew?: boolean;
  lastPaymentId?: string;
  totalPaid?: number;
  enforcePaywall?: boolean;
}

export interface SubscriberRecord {
  id: string; // Unique Subscriber ID e.g. SUB-ID-8821
  shopId: string; // Shop Code e.g. SHOP-7821
  shopName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  status: SubscriptionStatus;
  planId: string;
  planName: string;
  billingCycle: BillingCycle;
  licenseKey: string; // e.g. LIC-2026-X99B-8812
  startDate: number;
  expiryDate: number;
  trialDaysTotal: number;
  totalPaidAmount: number;
  currency: string;
  paymentGateway: GatewayProvider;
  transactionRef: string;
  notes?: string;
  customDiscountPct?: number;
  isLockedOrSuspended?: boolean;
  lastActiveTimestamp?: number;
  createdAt: number;
}

export interface SubscriptionPaymentRecord {
  id: string;
  subscriberId?: string; // Link to SubscriberRecord ID
  invoiceNumber: string;
  timestamp: number;
  shopName: string;
  subscriberEmail?: string;
  subscriberPhone?: string;
  planId: string;
  planName: string;
  billingCycle: BillingCycle;
  amount: number;
  currency: string;
  paymentGateway: GatewayProvider;
  transactionRef: string;
  status: 'success' | 'pending' | 'failed';
  validUntil: number;
  notes?: string;
}

export interface OwnerMonetizationSettings {
  freeTrialDays: number;
  gateway: PaymentGatewayConfig;
  plans: SubscriptionPlan[];
  enforcePaywallOnExpiry: boolean;
  currency: string;
}


