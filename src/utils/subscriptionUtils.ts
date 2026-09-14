import { AppSubscriptionState, SubscriptionPlan } from '../types';

export function getTrialRemainingDays(subscription: AppSubscriptionState): number {
  const now = Date.now();
  if (subscription.status === 'active') {
    // If active paid subscriber, return days until subscriptionEndDate
    if (subscription.subscriptionEndDate) {
      const diff = subscription.subscriptionEndDate - now;
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return 365;
  }

  const diff = subscription.trialEndDate - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function getTrialProgress(subscription: AppSubscriptionState): number {
  if (subscription.status === 'active') return 100;
  const total = subscription.trialEndDate - subscription.trialStartDate;
  if (total <= 0) return 100;
  const elapsed = Date.now() - subscription.trialStartDate;
  const pct = (elapsed / total) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

export function isTrialExpired(subscription: AppSubscriptionState): boolean {
  if (subscription.status === 'active') return false;
  return Date.now() > subscription.trialEndDate;
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SUB-INV-${year}${month}${day}-${rand}`;
}

export function calculateBillingDurationMs(cycle: SubscriptionPlan['billingCycle']): number {
  const dayMs = 24 * 60 * 60 * 1000;
  switch (cycle) {
    case 'monthly':
      return 30 * dayMs;
    case 'quarterly':
      return 90 * dayMs;
    case 'annual':
      return 365 * dayMs;
    case 'lifetime':
      return 100 * 365 * dayMs; // 100 years
    default:
      return 30 * dayMs;
  }
}

export function generateSubscriberId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `SUB-${rand}`;
}

export function generateLicenseKey(prefix = 'LIC'): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const pick = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${year}-${pick(4)}-${pick(4)}`;
}

export function getRemainingDaysFromDate(expiryDate: number): number {
  const diff = expiryDate - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

