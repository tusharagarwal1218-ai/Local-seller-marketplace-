import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Sliders,
  Play,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Smartphone,
  QrCode,
  Key,
  Globe,
  Store,
  ChevronRight
} from 'lucide-react';

interface PlayStoreAndGatewayGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToGateway: () => void;
  onNavigateToControlCenter: () => void;
}

export const PlayStoreAndGatewayGuideModal: React.FC<PlayStoreAndGatewayGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToGateway,
  onNavigateToControlCenter,
}) => {
  const [activeTab, setActiveTab] = useState<'gateway' | 'control' | 'playstore'>('gateway');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const bubblewrapCommand = `npm i -g @bubblewrap/cli\nbubblewrap init --manifest=https://YOUR-APP-DOMAIN/manifest.webmanifest\nbubblewrap build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Local Seller Marketplace Setup Hub
                </h2>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Play Store Ready
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Configure payment gateways, master subscriber control, and publish to Android Play Store
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 py-2 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('gateway')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'gateway'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>1. How to Add Payment Gateway</span>
          </button>

          <button
            onClick={() => setActiveTab('control')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'control'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>2. How to Add Master Control</span>
          </button>

          <button
            onClick={() => setActiveTab('playstore')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'playstore'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            <Play className="h-4 w-4" />
            <span>3. Publish to Play Store</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-stone-800">
          {/* TAB 1: HOW TO ADD PAYMENT GATEWAY */}
          {activeTab === 'gateway' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-4">
                <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-700" />
                  Quick Answer: Where do I add my payment gateway?
                </h3>
                <p className="mt-1.5 text-xs text-amber-900 leading-relaxed">
                  You can configure and switch payment gateways directly inside the{' '}
                  <strong>Plans & Gateways</strong> tab (Monetization Hub). We support instant{' '}
                  <strong>UPI / QR Code</strong>, <strong>Razorpay</strong>, <strong>Stripe</strong>, and{' '}
                  <strong>PayPal</strong>.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToGateway();
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-amber-900 transition-all shadow-xs"
                  >
                    <span>Open Payment Gateways Settings Now</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Supported Gateways Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gateway 1: UPI / QR */}
                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                        <QrCode className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">Direct UPI / QR Gateway</h4>
                        <span className="text-[10px] text-emerald-600 font-semibold">0% Commission • Instant</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                    <p><strong>Steps to connect:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-500">
                      <li>Open <strong>Plans & Gateways &rarr; Gateway Tab</strong>.</li>
                      <li>Select <strong>Direct UPI / QR Code</strong>.</li>
                      <li>Enter your Business UPI ID (e.g., <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-900">yourstore@okhdfcbank</code>).</li>
                      <li>When sellers upgrade, the app automatically generates a dynamic payment QR code with the exact amount.</li>
                    </ol>
                  </div>
                </div>

                {/* Gateway 2: Razorpay */}
                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">Razorpay Gateway</h4>
                        <span className="text-[10px] text-blue-600 font-semibold">Cards • NetBanking • UPI</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                    <p><strong>Steps to connect:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-500">
                      <li>Log into <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-blue-700 underline font-semibold">Razorpay Dashboard</a>.</li>
                      <li>Navigate to <strong>Settings &rarr; API Keys</strong>.</li>
                      <li>Copy your <strong>Key ID</strong> (e.g. <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">rzp_live_...</code>) and paste it into the Gateway settings.</li>
                      <li>Enable Auto-activation for automated plan unlocks.</li>
                    </ol>
                  </div>
                </div>

                {/* Gateway 3: Stripe */}
                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                        <Key className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">Stripe Gateway</h4>
                        <span className="text-[10px] text-indigo-600 font-semibold">Global Credit Cards & Apple Pay</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                    <p><strong>Steps to connect:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-stone-500">
                      <li>Go to your Stripe Dashboard &rarr; <strong>Developers &rarr; API Keys</strong>.</li>
                      <li>Copy Publishable Key (<code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">pk_live_...</code>) and Secret Key.</li>
                      <li>Paste them in the Stripe section of your Monetization Hub.</li>
                    </ol>
                  </div>
                </div>

                {/* Gateway 4: Custom Bank Wire / Offline */}
                <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-stone-900">Manual / Bank Transfer</h4>
                        <span className="text-[10px] text-emerald-700 font-semibold">Direct NEFT / Cash / Invoices</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                    <p><strong>How it works:</strong></p>
                    <p className="text-[11px] text-stone-500">
                      Sellers can transfer funds directly to your bank account. You can then go to the <strong>Control Center</strong>, select the seller, and click <strong>Record Payment</strong> to instantly activate their license!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOW TO ADD MASTER CONTROL */}
          {activeTab === 'control' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-stone-900 text-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                      <Sliders className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Your Master Control Center is Built-In!</h3>
                      <p className="text-xs text-stone-400">
                        Full administrative authority over all seller accounts, terminal locks, licenses, and trial periods.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToControlCenter();
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-black text-stone-950 hover:bg-amber-300 transition-all shadow-xs"
                  >
                    <span>Open Control Center</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Master Control Powers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-stone-200 p-4 bg-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold text-xs mb-2">
                    1
                  </div>
                  <h4 className="font-bold text-xs text-stone-900">Custom Subscriber IDs</h4>
                  <p className="mt-1 text-[11px] text-stone-500">
                    Assign your own custom client IDs like <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">SUB-VIP-01</code> or <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">SELLER-MUMBAI-104</code>.
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 p-4 bg-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold text-xs mb-2">
                    2
                  </div>
                  <h4 className="font-bold text-xs text-stone-900">Remote Terminal Lock</h4>
                  <p className="mt-1 text-[11px] text-stone-500">
                    With one click on <strong>Lock / Suspend Store</strong>, instantly freeze access to the POS and showcase for non-paying sellers.
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 p-4 bg-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 font-bold text-xs mb-2">
                    3
                  </div>
                  <h4 className="font-bold text-xs text-stone-900">Trial & License Extension</h4>
                  <p className="mt-1 text-[11px] text-stone-500">
                    Grant bonus trial days (+15, +30, +60 days) or generate cryptographically formatted license keys (<code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">LIC-2026-X99B-8812</code>).
                  </p>
                </div>
              </div>

              {/* Security & Access Protection */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-xs text-stone-700">
                <h4 className="font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Owner Security Recommendation
                </h4>
                <p className="mt-1 leading-relaxed text-stone-600">
                  Because this application is designed for shop environments, the <strong>Control Center</strong> and <strong>Plans & Gateways</strong> navigation buttons are separated from ordinary cashier actions. You can also configure a custom Owner Passcode in the Control Center to ensure staff cannot change your payment gateway or subscription fees.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PUBLISH TO PLAY STORE */}
          {activeTab === 'playstore' && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Your App is 100% Google Play Store & TWA Ready!</span>
                </div>
                <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                  We have configured the <strong>Web App Manifest</strong>, installed the service worker with offline caching, generated <strong>192x192</strong>, <strong>512x512</strong>, and <strong>maskable icons</strong>, and created the <strong>Digital Asset Links</strong> file required by Google Play.
                </p>
              </div>

              {/* Step by Step Play Store Publishing */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500">
                  Step-by-Step Google Play Store Publishing Guide
                </h4>

                {/* Step 1 */}
                <div className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-white font-extrabold text-xs">
                    1
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-stone-900">
                      Method A: 1-Click Package with PWABuilder (Easiest)
                    </h5>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      1. Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-amber-800 underline font-semibold">PWABuilder.com</a>.<br />
                      2. Paste your live app URL and click <strong>Start</strong>.<br />
                      3. Click <strong>Package for Stores &rarr; Google Play</strong>.<br />
                      4. PWABuilder will automatically generate your signed <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">app-release-signed.aab</code> (Android App Bundle) ready for the Play Console!
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-white font-extrabold text-xs">
                    2
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-stone-900">
                        Method B: Using Google Bubblewrap CLI (Advanced Developers)
                      </h5>
                      <button
                        onClick={() => handleCopy(bubblewrapCommand, 'cmd')}
                        className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900"
                      >
                        {copiedKey === 'cmd' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedKey === 'cmd' ? 'Copied' : 'Copy Commands'}</span>
                      </button>
                    </div>
                    <pre className="rounded-xl bg-stone-900 p-3 text-[11px] text-amber-400 font-mono overflow-x-auto">
                      {bubblewrapCommand}
                    </pre>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-white font-extrabold text-xs">
                    3
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-stone-900">
                      Upload to Google Play Console
                    </h5>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-stone-600">
                      <li>Log into <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-amber-800 underline font-semibold">Google Play Console</a> (one-time $25 registration).</li>
                      <li>Click <strong>Create App</strong> &rarr; Title: <strong>Local Seller Marketplace</strong>.</li>
                      <li>Go to <strong>Production &rarr; Releases</strong> &rarr; Upload your <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">.aab</code> file.</li>
                      <li>Complete the Store Listing questionnaires (Privacy Policy, Content Rating, Target Audience).</li>
                      <li>Submit for review! Google typically approves in 24–48 hours.</li>
                    </ol>
                  </div>
                </div>

                {/* Digital Asset Links */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <Globe className="h-4 w-4 text-stone-600" />
                      Digital Asset Links (`/.well-known/assetlinks.json`)
                    </h5>
                    <span className="text-[10px] text-stone-500 font-mono">Auto-Served</span>
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Google requires your domain to verify ownership of the Android app so it opens in full screen without a browser address bar. We have already generated this template in <code className="text-stone-800 font-bold">public/.well-known/assetlinks.json</code>. Once Play Console gives you your app's SHA-256 fingerprint, just replace it!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-6 py-4">
          <div className="text-xs text-stone-500">
            Current App Name: <strong className="text-stone-800">Local Seller Marketplace</strong>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-all shadow-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
