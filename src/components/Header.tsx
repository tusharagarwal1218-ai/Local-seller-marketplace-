import React from 'react';
import {
  ShoppingBag,
  Store,
  Layers,
  ReceiptText,
  Settings,
  AlertTriangle,
  Monitor,
  QrCode,
  Sparkles,
  CreditCard,
  Gift,
  Sliders,
  Play
} from 'lucide-react';
import { ShopSettings, ViewMode, Product, AppSubscriptionState } from '../types';
import { getTrialRemainingDays } from '../utils/subscriptionUtils';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  settings: ShopSettings;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  products: Product[];
  todaySalesCount: number;
  onOpenShopQrModal: () => void;
  subscription: AppSubscriptionState;
  onOpenUpgradeModal: () => void;
  onOpenPlayStoreGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentView,
  onViewChange,
  products,
  todaySalesCount,
  onOpenShopQrModal,
  subscription,
  onOpenUpgradeModal,
  onOpenPlayStoreGuide,
}) => {
  const lowStockCount = products.filter(
    (p) => p.isAvailable && p.stock <= p.minStockThreshold
  ).length;

  const trialDaysLeft = getTrialRemainingDays(subscription);
  const isPaid = subscription.status === 'active';

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white shadow-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        {/* Shop Brand Identification */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-800 text-white shadow-sm ring-2 ring-amber-700/20">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
                {settings.shopName || 'Local Seller Marketplace'}
              </h1>
              <span className="hidden rounded-md bg-amber-100 text-amber-900 px-2 py-0.5 text-xs font-semibold sm:inline-block">
                Local Seller Marketplace
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="line-clamp-1">{settings.address}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline font-mono font-bold text-amber-900">
                Code: {settings.shopCode || 'SHOP-7821'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: 2-Month Free Trial + PWA Install Button */}
        <div className="flex items-center gap-2">
          <PWAInstallButton />

          <button
            type="button"
            id="btn-trial-upgrade-header"
            onClick={onOpenUpgradeModal}
            className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs font-bold transition-all shadow-xs border ${
              isPaid
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100 ring-2 ring-amber-500/10'
            }`}
          >
            {isPaid ? (
              <>
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Pro License Active</span>
                <span className="rounded-full bg-emerald-200/80 px-1.5 py-0.2 text-[10px] font-extrabold text-emerald-800">
                  Manage
                </span>
              </>
            ) : (
              <>
                <Gift className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                <span className="hidden sm:inline">2-Month Free Trial:</span>
                <span className="font-extrabold text-amber-900 font-mono">
                  {trialDaysLeft}d left
                </span>
                <span className="rounded-full bg-amber-800 px-2 py-0.5 text-[10px] font-black uppercase text-white hover:bg-amber-900">
                  Upgrade
                </span>
              </>
            )}
          </button>
        </div>

        {/* Navigation & Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Shop QR & Code Button */}
          <button
            type="button"
            onClick={onOpenShopQrModal}
            className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/70 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors shadow-xs"
            title="Shop QR & Digital Address Generator"
          >
            <QrCode className="h-4 w-4 text-amber-700" />
            <span className="hidden sm:inline">Shop QR Standee</span>
            <span className="sm:hidden">QR</span>
          </button>

          <nav className="flex items-center gap-1 rounded-xl bg-stone-100 p-1">
            <button
              id="nav-pos"
              onClick={() => onViewChange('pos')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                currentView === 'pos'
                  ? 'bg-white text-stone-950 shadow-xs ring-1 ring-stone-900/5'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <ShoppingBag className="h-4 w-4 text-amber-700" />
              <span>POS Register</span>
            </button>

            <button
              id="nav-display"
              onClick={() => onViewChange('display')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                currentView === 'display'
                  ? 'bg-white text-stone-950 shadow-xs ring-1 ring-stone-900/5'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Monitor className="h-4 w-4 text-emerald-600" />
              <span className="flex items-center gap-1">
                Customer Showcase
                <span className="hidden rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700 sm:inline">
                  Live
                </span>
              </span>
            </button>

            <button
              id="nav-inventory"
              onClick={() => onViewChange('inventory')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                currentView === 'inventory'
                  ? 'bg-white text-stone-950 shadow-xs ring-1 ring-stone-900/5'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Layers className="h-4 w-4 text-blue-600" />
              <span className="flex items-center gap-1">
                Inventory
                {lowStockCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                    {lowStockCount}
                  </span>
                )}
              </span>
            </button>

            <button
              id="nav-sales"
              onClick={() => onViewChange('sales')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                currentView === 'sales'
                  ? 'bg-white text-stone-950 shadow-xs ring-1 ring-stone-900/5'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <ReceiptText className="h-4 w-4 text-purple-600" />
              <span className="flex items-center gap-1">
                Sales
                {todaySalesCount > 0 && (
                  <span className="hidden rounded-full bg-stone-200 px-1.5 py-0.2 text-[10px] font-bold text-stone-700 sm:inline">
                    {todaySalesCount}
                  </span>
                )}
              </span>
            </button>

            {/* App Owner Monetization & Plans */}
            <button
              id="nav-monetization"
              onClick={() => onViewChange('monetization')}
              title="Monetization & Gateway Settings"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                currentView === 'monetization'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-amber-900 hover:text-amber-950 hover:bg-amber-100/70'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden lg:inline">Plans & Gateways</span>
            </button>

            {/* Owner Subscription Control Center */}
            <button
              id="nav-control-center"
              onClick={() => onViewChange('control-center')}
              title="Master Subscription & ID Control Center"
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
                currentView === 'control-center'
                  ? 'bg-stone-900 text-amber-400 shadow-xs ring-1 ring-amber-500/30'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Sliders className="h-4 w-4 text-amber-500" />
              <span className="hidden sm:inline font-bold">Control Center</span>
            </button>

            {onOpenPlayStoreGuide && (
              <button
                id="nav-playstore-guide"
                onClick={onOpenPlayStoreGuide}
                title="Play Store & Gateway Setup Hub"
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 hover:text-amber-950 transition-all shadow-2xs"
              >
                <Play className="h-3.5 w-3.5 text-amber-700 fill-amber-700" />
                <span className="hidden xl:inline">Play Store & Gateway</span>
              </button>
            )}

            <button
              id="nav-settings"
              onClick={() => onViewChange('settings')}
              title="Store Settings"
              className={`flex items-center justify-center rounded-lg p-2 text-xs font-medium transition-all ${
                currentView === 'settings'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Settings className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>

      {/* Low stock warning banner if any */}
      {lowStockCount > 0 && currentView !== 'inventory' && (
        <div className="border-t border-amber-200/80 bg-amber-50/90 px-4 py-1.5 text-xs text-amber-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span>
                <strong>{lowStockCount} item{lowStockCount > 1 ? 's' : ''}</strong> running low on stock.
              </span>
            </div>
            <button
              onClick={() => onViewChange('inventory')}
              className="font-semibold underline hover:text-amber-950"
            >
              Check Stock &rarr;
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
