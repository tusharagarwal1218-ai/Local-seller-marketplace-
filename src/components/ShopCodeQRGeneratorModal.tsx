import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  X,
  Copy,
  Check,
  Printer,
  Download,
  Store,
  Sparkles,
  Phone,
  MapPin,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { ShopSettings } from '../types';

interface ShopCodeQRGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShopSettings;
  onUpdateShopCode: (newCode: string) => void;
}

export const ShopCodeQRGeneratorModal: React.FC<ShopCodeQRGeneratorModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateShopCode,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [customCode, setCustomCode] = useState(settings.shopCode || 'SHOP-7821');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const printAreaRef = useRef<HTMLDivElement | null>(null);

  // Digital web link
  const storeUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?store=${encodeURIComponent(settings.shopCode || 'SHOP-7821')}`
    : `https://myshop.local/store/${settings.shopCode}`;

  // Generate QR Code data URL whenever shopCode or store details change
  useEffect(() => {
    if (!isOpen) return;
    const code = settings.shopCode || 'SHOP-7821';
    const payload = JSON.stringify({
      type: 'LOCAL_STORE_PASS',
      shopCode: code,
      shopName: settings.shopName,
      phone: settings.phone,
      url: storeUrl,
    });

    QRCode.toDataURL(payload, {
      width: 480,
      margin: 2,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url: string) => setQrDataUrl(url))
      .catch((err: unknown) => console.error('Failed to generate QR code:', err));
  }, [isOpen, settings.shopCode, settings.shopName, settings.phone, storeUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(settings.shopCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveCustomCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (clean) {
      onUpdateShopCode(clean);
      setIsEditingCode(false);
    }
  };

  const handleGenerateRandomCode = () => {
    const randomCode = `SHOP-${Math.floor(1000 + Math.random() * 9000)}`;
    setCustomCode(randomCode);
    onUpdateShopCode(randomCode);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${settings.shopName.replace(/\s+/g, '_')}_QR_${settings.shopCode}.png`;
    a.click();
  };

  const handlePrintStandee = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative my-8 w-full max-w-xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700 text-white shadow-sm">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Shop Digital Address & QR Generator
              </h3>
              <p className="text-xs text-stone-500">
                Print for counter display or share link with neighborhood customers
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Shop Code Badge & Customization */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Your Unique Shop Code
                </span>
                {isEditingCode ? (
                  <form onSubmit={handleSaveCustomCode} className="mt-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      className="rounded-lg border border-amber-400 bg-white px-3 py-1 font-mono text-sm font-black text-stone-900 uppercase focus:outline-hidden"
                      placeholder="e.g. SHOP-7821"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-amber-800 px-3 py-1 text-xs font-bold text-white hover:bg-amber-900"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(false)}
                      className="text-xs text-stone-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-xl font-extrabold tracking-wider text-stone-950">
                      {settings.shopCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      title="Copy Shop Code"
                      className="rounded-md bg-white p-1 text-stone-600 shadow-xs hover:text-amber-800"
                    >
                      {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingCode(true)}
                      title="Edit Shop Code"
                      className="rounded-md bg-white p-1 text-stone-600 shadow-xs hover:text-amber-800"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateRandomCode}
                      title="Generate New Code"
                      className="rounded-md bg-white p-1 text-stone-600 shadow-xs hover:text-amber-800"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 self-start rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100/50"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-amber-700" />
                    <span>Copy Store Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Standee Poster Preview (Target for Print & Download) */}
          <div
            ref={printAreaRef}
            className="mx-auto max-w-sm rounded-3xl border-2 border-stone-800 bg-white p-6 shadow-xl text-center space-y-4 printable-standee"
          >
            {/* Standee Header */}
            <div className="border-b border-dashed border-stone-200 pb-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold text-amber-900 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>ORDER & VIEW CATALOG</span>
              </div>
              <h4 className="text-xl font-extrabold text-stone-950 tracking-tight">
                {settings.shopName}
              </h4>
              <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                {settings.tagline || 'Fresh groceries & daily essentials'}
              </p>
            </div>

            {/* Generated QR Code */}
            <div className="flex flex-col items-center justify-center p-2">
              <div className="rounded-2xl border-2 border-stone-900 bg-white p-3 shadow-inner">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`${settings.shopName} QR Code`}
                    className="h-48 w-48 object-contain"
                  />
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center text-stone-400">
                    <QrCode className="h-12 w-12 animate-pulse" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Scan with any Smartphone Camera or QR App
              </p>
            </div>

            {/* Shop Digital ID Box */}
            <div className="rounded-xl bg-stone-950 p-3 text-white">
              <p className="text-[10px] uppercase font-bold text-amber-400">Store Connection Code</p>
              <p className="font-mono text-2xl font-black tracking-widest text-white">
                {settings.shopCode}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">
                Customers enter this code in the app to connect directly
              </p>
            </div>

            {/* Address Footer */}
            <div className="space-y-1 text-xs text-stone-600 pt-1 border-t border-stone-100">
              <div className="flex items-center justify-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                <span className="line-clamp-1">{settings.address}</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Phone className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                <span>{settings.phone}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-200 pt-4">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              <Download className="h-4 w-4 text-stone-500" />
              <span>Download QR Image</span>
            </button>

            <button
              type="button"
              onClick={handlePrintStandee}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-stone-800 shadow-sm"
            >
              <Printer className="h-4 w-4 text-amber-400" />
              <span>Print Counter Standee</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
