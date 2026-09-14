import React, { useState } from 'react';
import { Store, Save, RefreshCw, AlertCircle, Check, QrCode, Printer, CreditCard, Sparkles, Gift, Sliders, Tag, Layers, Plus, Trash2 } from 'lucide-react';
import { ShopSettings, AppSubscriptionState, OwnerMonetizationSettings, Product } from '../types';
import { ShopCodeQRGeneratorModal } from './ShopCodeQRGeneratorModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import { getTrialRemainingDays } from '../utils/subscriptionUtils';
import { CATEGORIES_LIST } from '../data/initialProducts';

interface SettingsViewProps {
  settings: ShopSettings;
  products?: Product[];
  categories?: string[];
  customCategories?: string[];
  onSaveSettings: (newSettings: ShopSettings) => void;
  onResetCatalog: () => void;
  onAddCustomCategory?: (category: string) => boolean;
  onRenameCustomCategory?: (oldCategory: string, newCategory: string) => boolean;
  onDeleteCustomCategory?: (category: string, fallback?: string) => void;
  subscription?: AppSubscriptionState;
  monetization?: OwnerMonetizationSettings;
  onNavigateToMonetization?: () => void;
  onNavigateToControlCenter?: () => void;
  onOpenUpgradeModal?: () => void;
  onOpenPlayStoreGuide?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  products = [],
  categories = [],
  customCategories = [],
  onSaveSettings,
  onResetCatalog,
  onAddCustomCategory,
  onRenameCustomCategory,
  onDeleteCustomCategory,
  subscription,
  monetization,
  onNavigateToMonetization,
  onNavigateToControlCenter,
  onOpenUpgradeModal,
  onOpenPlayStoreGuide,
}) => {
  const [formData, setFormData] = useState<ShopSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const trialDaysRemaining = subscription ? getTrialRemainingDays(subscription) : 60;
  const isPaid = subscription?.status === 'active';

  const handleQuickAddCat = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    const trimmed = newCatInput.trim();
    if (!trimmed) {
      setCategoryError('Please enter a category name.');
      return;
    }
    if (trimmed.toLowerCase() === 'all') {
      setCategoryError('"All" is reserved.');
      return;
    }
    if (onAddCustomCategory) {
      const added = onAddCustomCategory(trimmed);
      if (added) {
        setNewCatInput('');
        setCategoryError(null);
      } else {
        setCategoryError(`Category "${trimmed}" already exists.`);
      }
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Reset product inventory and store settings to initial demo defaults? Any custom added items will be replaced.'
      )
    ) {
      onResetCatalog();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-800 text-white">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Store Profile & Billing Configuration
              </h2>
              <p className="text-xs text-stone-500">
                Customize your store name, QR code, currency, tax rules, and receipt details
              </p>
            </div>
          </div>

          {isSaved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1">
              <Check className="h-4 w-4" />
              <span>Saved Successfully</span>
            </span>
          )}
        </div>

        {/* Digital Address & QR Standee Spotlight */}
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-800 text-white shadow-xs">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                Shop Digital Address & Counter QR Standee
              </h4>
              <p className="text-xs text-stone-600">
                Current Shop Code: <strong className="font-mono text-amber-900">{formData.shopCode || 'SHOP-7821'}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-stone-800 transition-all"
          >
            <Printer className="h-3.5 w-3.5 text-amber-400" />
            <span>Generate & Print Standee</span>
          </button>
        </div>

        {/* Subscription & App Monetization Hub Card */}
        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-stone-900">
                  App Subscription & Monetization
                </h4>
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                    isPaid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {isPaid ? '⭐ Pro License Active' : `🎁 2-Month Free Trial (${trialDaysRemaining}d left)`}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Gateway:{' '}
                <strong className="uppercase">
                  {monetization?.gateway.provider.replace('_', ' ') || 'UPI QR'}
                </strong>{' '}
                • {monetization?.gateway.isTestMode ? 'Sandbox/Test Mode' : 'Live Gateway Active'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenUpgradeModal && (
              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="rounded-xl border border-amber-300 bg-amber-100/70 px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200 shadow-xs"
              >
                {isPaid ? 'View Plan Details' : 'Upgrade Plan'}
              </button>
            )}

            {onOpenPlayStoreGuide && (
              <button
                type="button"
                onClick={onOpenPlayStoreGuide}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-xs"
              >
                <span>Play Store & Gateway Setup</span>
              </button>
            )}

            {onNavigateToMonetization && (
              <button
                type="button"
                onClick={onNavigateToMonetization}
                className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-100 shadow-xs"
              >
                <CreditCard className="h-3.5 w-3.5 text-amber-700" />
                <span>Monetization</span>
              </button>
            )}

            {onNavigateToControlCenter && (
              <button
                type="button"
                onClick={onNavigateToControlCenter}
                className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-stone-800 shadow-xs"
              >
                <Sliders className="h-3.5 w-3.5 text-amber-400" />
                <span>Control Center</span>
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Shop Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Basic Store Details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700">Shop Name</label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700">
                  Shop Digital Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SHOP-7821"
                  value={formData.shopCode || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, shopCode: e.target.value.toUpperCase() })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 font-mono font-bold px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-stone-700">
                  Owner / Shopkeeper Name
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-stone-700">Tagline / Slogan</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700">Physical Store Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Currency & Tax Settings
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-stone-700">Currency Symbol</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                >
                  <option value="$">$ (USD / AUD / CAD)</option>
                  <option value="₹">₹ (INR - Rupee)</option>
                  <option value="€">€ (EUR - Euro)</option>
                  <option value="£">£ (GBP - Pound)</option>
                  <option value="¥">¥ (JPY / CNY)</option>
                  <option value="₱">₱ (PHP - Peso)</option>
                  <option value="R$">R$ (BRL - Real)</option>
                  <option value="KSh">KSh (KES - Shilling)</option>
                  <option value="AED ">AED (Dirham)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700">Enable Tax on Bills</label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enableTax"
                    checked={formData.enableTax}
                    onChange={(e) => setFormData({ ...formData, enableTax: e.target.checked })}
                    className="h-4 w-4 rounded text-amber-700 focus:ring-amber-600"
                  />
                  <label htmlFor="enableTax" className="text-xs text-stone-700">
                    Apply Sales Tax / VAT
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  disabled={!formData.enableTax}
                  value={formData.taxRate}
                  onChange={(e) =>
                    setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 disabled:bg-stone-100 focus:border-amber-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700">
                UPI ID / Merchant Payment ID (for QR Code scan)
              </label>
              <input
                type="text"
                placeholder="e.g. yourstore@bank or paytmqr@bank"
                value={formData.upiId || ''}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700">Receipt Footer Message</label>
              <input
                type="text"
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
              />
            </div>

            {/* Custom Categories & Catalog Taxonomies */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">
                      Product Categories & Catalog Taxonomy
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Manage default categories and configure custom product groupings
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-2xs"
                >
                  <Tag className="h-3.5 w-3.5 text-amber-700" />
                  <span>Manage All Categories ({categories.length || 8})</span>
                </button>
              </div>

              {/* Quick Add Custom Category Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newCatInput}
                  onChange={(e) => {
                    setNewCatInput(e.target.value);
                    if (categoryError) setCategoryError(null);
                  }}
                  placeholder="Create custom category (e.g. Organic Produce, Electronics, Books)"
                  className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-700 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleQuickAddCat}
                  className="flex items-center gap-1 rounded-xl bg-amber-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-900 whitespace-nowrap shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {categoryError && (
                <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{categoryError}</span>
                </p>
              )}

              {/* Badges preview */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {customCategories.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50/80 px-2 py-0.5 text-[11px] font-semibold text-amber-900"
                  >
                    <span>{c}</span>
                    <span className="rounded-sm bg-amber-200/80 px-1 py-0.2 text-[9px] font-bold">Custom</span>
                    {onDeleteCustomCategory && (
                      <button
                        type="button"
                        onClick={() => onDeleteCustomCategory(c)}
                        className="text-stone-400 hover:text-rose-600 ml-0.5"
                        title="Delete category"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
                {customCategories.length === 0 && (
                  <span className="text-[11px] text-stone-400 italic">
                    No custom categories created yet. Standard categories are active.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200 pt-5">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              <RefreshCw className="h-3.5 w-3.5 text-stone-400" />
              <span>Restore Demo Catalog</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-amber-800 px-6 py-2.5 text-xs font-bold text-white hover:bg-amber-900 shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Shop QR Standee Modal */}
      <ShopCodeQRGeneratorModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        settings={formData}
        onUpdateSettings={(updated) => {
          setFormData(updated);
          onSaveSettings(updated);
        }}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories.length > 0 ? categories : CATEGORIES_LIST.filter((c) => c !== 'All')}
        customCategories={customCategories}
        products={products}
        onAddCustomCategory={(name) => {
          if (onAddCustomCategory) return onAddCustomCategory(name);
          return true;
        }}
        onRenameCustomCategory={(oldName, newName) => {
          if (onRenameCustomCategory) return onRenameCustomCategory(oldName, newName);
          return true;
        }}
        onDeleteCustomCategory={(name, fallback) => {
          if (onDeleteCustomCategory) onDeleteCustomCategory(name, fallback);
        }}
      />
    </div>
  );
};
