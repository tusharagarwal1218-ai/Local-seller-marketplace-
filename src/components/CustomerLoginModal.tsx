import React, { useState } from 'react';
import { User, Phone, MapPin, QrCode, CheckCircle, X, ShieldCheck, ArrowRight, Camera } from 'lucide-react';
import { CustomerProfile, ShopSettings } from '../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';

interface CustomerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CustomerProfile;
  settings: ShopSettings;
  onSaveProfile: (profile: CustomerProfile) => void;
}

export const CustomerLoginModal: React.FC<CustomerLoginModalProps> = ({
  isOpen,
  onClose,
  profile,
  settings,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<CustomerProfile>({
    name: profile.name || '',
    phone: profile.phone || '',
    address: profile.address || '',
    landmark: profile.landmark || '',
    city: profile.city || '',
    pincode: profile.pincode || '',
    connectedShopCode: profile.connectedShopCode || settings.shopCode || 'SHOP-7821',
    isLoggedIn: profile.isLoggedIn || false,
  });

  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [shopConnectSuccess, setShopConnectSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CustomerProfile = {
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      connectedShopCode: formData.connectedShopCode?.trim().toUpperCase() || settings.shopCode,
      isLoggedIn: true,
    };
    onSaveProfile(updated);
    onClose();
  };

  const handleScanShopQR = (scannedData: string) => {
    let parsedCode = scannedData.trim();
    try {
      const parsed = JSON.parse(scannedData);
      if (parsed && parsed.shopCode) {
        parsedCode = parsed.shopCode;
      }
    } catch {
      // Not JSON, use raw text code
    }

    setFormData((prev) => ({
      ...prev,
      connectedShopCode: parsedCode.toUpperCase(),
    }));
    setShopConnectSuccess(true);
    setTimeout(() => setShopConnectSuccess(false), 2500);
  };

  const handleFillDemoProfile = () => {
    setFormData({
      name: 'Priya Sharma',
      phone: '+1 (555) 892-4112',
      address: 'Flat 402, Sunrise Residency, 12 Park Avenue',
      landmark: 'Opposite Central Park Gate 3',
      city: 'Metro City',
      pincode: '10001',
      connectedShopCode: settings.shopCode || 'SHOP-7821',
      isLoggedIn: true,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 p-4 backdrop-blur-xs overflow-y-auto">
        <div className="relative my-6 w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700 text-white shadow-sm">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {profile.isLoggedIn ? 'Your Customer Profile' : 'Customer Login / Order Info'}
                </h3>
                <p className="text-xs text-stone-500">
                  Enter your mobile & delivery address for fast 1-tap ordering
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Store connection section */}
            <div className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-amber-700" />
                  <span>Connected Store</span>
                </span>
                {shopConnectSuccess && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Verified!</span>
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Shop Code (e.g. SHOP-7821)"
                  value={formData.connectedShopCode || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, connectedShopCode: e.target.value.toUpperCase() })
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-mono font-bold text-stone-900 uppercase focus:border-amber-600 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setIsQrScannerOpen(true)}
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-amber-800 px-3 py-2 text-xs font-bold text-white hover:bg-amber-900"
                  title="Scan Shop QR Code"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Scan QR</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-500">
                Connected to: <strong>{settings.shopName}</strong> ({settings.address})
              </p>
            </div>

            {/* Personal Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 555-0192 or 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">Used for order confirmation and WhatsApp updates</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700">
                  Delivery Address (House / Flat, Street, Area) <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                  <textarea
                    required
                    rows={2}
                    placeholder="Flat 402, Block B, Sunshine Heights, Main Market Road"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 pl-9 pr-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-600">Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="Near water tank"
                    value={formData.landmark || ''}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-600">City / Pincode</label>
                  <input
                    type="text"
                    placeholder="Central 10001"
                    value={formData.city ? `${formData.city} ${formData.pincode || ''}` : formData.pincode || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-1.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Quick Demo Autofill Button */}
            <div className="flex items-center justify-between border-t border-stone-100 pt-3">
              <button
                type="button"
                onClick={handleFillDemoProfile}
                className="text-[11px] font-semibold text-amber-800 hover:underline"
              >
                ⚡ Fill Sample Details
              </button>
              {profile.isLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    onSaveProfile({
                      name: '',
                      phone: '',
                      address: '',
                      isLoggedIn: false,
                    });
                    onClose();
                  }}
                  className="text-[11px] font-semibold text-stone-500 hover:text-red-600"
                >
                  Logout / Clear
                </button>
              )}
            </div>

            {/* Save & Login Button */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-800 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-900 active:scale-98 transition-all"
            >
              <span>{profile.isLoggedIn ? 'Update Details' : 'Save Details & Continue'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Camera scanner for Shop QR */}
      <BarcodeScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScan={handleScanShopQR}
        title="Scan Shop Counter QR"
        subtitle="Point camera at the store's counter QR standee"
        mode="qrcode"
        sampleCodes={[
          { label: 'Current Shop', code: settings.shopCode || 'SHOP-7821' },
          { label: 'Market Branch', code: 'SHOP-9410' },
        ]}
      />
    </>
  );
};
