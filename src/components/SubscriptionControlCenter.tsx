import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CreditCard,
  Edit,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  DollarSign,
  Download,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  Store,
  Phone,
  Mail,
  MoreVertical,
  X,
  Sparkles,
  Sliders,
  CheckCircle2,
  ArrowUpDown,
  Info
} from 'lucide-react';
import {
  SubscriberRecord,
  SubscriptionPaymentRecord,
  SubscriptionPlan,
  SubscriptionStatus,
  BillingCycle,
  GatewayProvider,
  ShopSettings
} from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import {
  generateSubscriberId,
  generateLicenseKey,
  getRemainingDaysFromDate,
  calculateBillingDurationMs,
  generateInvoiceNumber
} from '../utils/subscriptionUtils';

interface SubscriptionControlCenterProps {
  subscribers: SubscriberRecord[];
  payments: SubscriptionPaymentRecord[];
  plans: SubscriptionPlan[];
  shopSettings: ShopSettings;
  onUpdateSubscribers: (updated: SubscriberRecord[]) => void;
  onAddPayment: (record: SubscriptionPaymentRecord) => void;
  onViewInvoice?: (invoice: SubscriptionPaymentRecord) => void;
  onOpenPlayStoreGuide?: () => void;
}

export const SubscriptionControlCenter: React.FC<SubscriptionControlCenterProps> = ({
  subscribers,
  payments,
  plans,
  shopSettings,
  onUpdateSubscribers,
  onAddPayment,
  onViewInvoice,
  onOpenPlayStoreGuide,
}) => {
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubscriptionStatus>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'id' | 'paid'>('expiry');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState<SubscriberRecord | null>(null);
  const [selectedSubscriber, setSelectedSubscriber] = useState<SubscriberRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Extend / Grant Days modal
  const [extendModalSubscriber, setExtendModalSubscriber] = useState<SubscriberRecord | null>(null);
  const [extensionDaysInput, setExtensionDaysInput] = useState<number>(30);

  // Record manual payment modal
  const [paymentModalSubscriber, setPaymentModalSubscriber] = useState<SubscriberRecord | null>(null);
  const [manualPaymentPlanId, setManualPaymentPlanId] = useState<string>(plans[0]?.id || '');
  const [manualPaymentAmount, setManualPaymentAmount] = useState<number>(plans[0]?.price || 0);
  const [manualPaymentGateway, setManualPaymentGateway] = useState<GatewayProvider>('upi_qr');
  const [manualPaymentRef, setManualPaymentRef] = useState<string>('');

  // Form state for creating a new subscriber
  const [newSubForm, setNewSubForm] = useState<{
    id: string;
    shopId: string;
    shopName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    planId: string;
    status: SubscriptionStatus;
    trialDays: number;
    licenseKey: string;
    notes: string;
    paymentGateway: GatewayProvider;
    initialPayment: number;
    transactionRef: string;
  }>({
    id: generateSubscriberId(),
    shopId: `SHOP-${Math.floor(1000 + Math.random() * 9000)}`,
    shopName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    planId: plans[0]?.id || 'plan-pro-annual',
    status: 'trial',
    trialDays: 60,
    licenseKey: generateLicenseKey(),
    notes: '',
    paymentGateway: 'upi_qr',
    initialPayment: 0,
    transactionRef: 'INIT-SUB-SETUP',
  });

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Metrics
  const totalSubscribers = subscribers.length;
  const activePaid = subscribers.filter((s) => s.status === 'active' && !s.isLockedOrSuspended).length;
  const trialUsers = subscribers.filter((s) => s.status === 'trial').length;
  const expiredUsers = subscribers.filter((s) => s.status === 'expired' || (s.status === 'trial' && s.expiryDate < Date.now())).length;
  const suspendedUsers = subscribers.filter((s) => s.isLockedOrSuspended).length;
  const totalRevenueAll = subscribers.reduce((sum, s) => sum + (s.totalPaidAmount || 0), 0);

  // Filter & Search Logic
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.shopId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.licenseKey.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : sub.status === statusFilter;

    const matchesPlan = planFilter === 'all' ? true : sub.planId === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Sort
  const sortedSubscribers = [...filteredSubscribers].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'expiry') {
      comparison = a.expiryDate - b.expiryDate;
    } else if (sortBy === 'name') {
      comparison = a.shopName.localeCompare(b.shopName);
    } else if (sortBy === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortBy === 'paid') {
      comparison = (a.totalPaidAmount || 0) - (b.totalPaidAmount || 0);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // --- ACTIONS ---

  // 1. Lock / Unlock Access
  const handleToggleLock = (sub: SubscriberRecord) => {
    const updated = subscribers.map((s) =>
      s.id === sub.id ? { ...s, isLockedOrSuspended: !s.isLockedOrSuspended } : s
    );
    onUpdateSubscribers(updated);
    showNotification(
      `Subscriber ${sub.id} access ${sub.isLockedOrSuspended ? 'UNLOCKED / RESTORED' : 'LOCKED / SUSPENDED'}`
    );
  };

  // 2. Change Status
  const handleChangeStatus = (subId: string, newStatus: SubscriptionStatus) => {
    const updated = subscribers.map((s) => {
      if (s.id === subId) {
        return {
          ...s,
          status: newStatus,
          isLockedOrSuspended: newStatus === 'suspended' ? true : s.isLockedOrSuspended
        };
      }
      return s;
    });
    onUpdateSubscribers(updated);
    showNotification(`Status updated to "${newStatus.toUpperCase()}" for ${subId}`);
  };

  // 3. Regenerate License Key
  const handleRegenerateKey = (sub: SubscriberRecord) => {
    const newKey = generateLicenseKey();
    const updated = subscribers.map((s) =>
      s.id === sub.id ? { ...s, licenseKey: newKey } : s
    );
    onUpdateSubscribers(updated);
    showNotification(`New License Key generated for ${sub.id}: ${newKey}`);
  };

  // 4. Update ID
  const handleUpdateSubscriberId = (currentId: string, newId: string) => {
    const trimmed = newId.trim();
    if (!trimmed) return;
    if (subscribers.some((s) => s.id.toLowerCase() === trimmed.toLowerCase() && s.id !== currentId)) {
      alert(`Subscriber ID "${trimmed}" already exists! Please use a unique ID.`);
      return;
    }

    const updated = subscribers.map((s) =>
      s.id === currentId ? { ...s, id: trimmed } : s
    );
    onUpdateSubscribers(updated);
    if (selectedSubscriber?.id === currentId) {
      setSelectedSubscriber({ ...selectedSubscriber, id: trimmed });
    }
    showNotification(`Subscriber ID changed from ${currentId} to ${trimmed}`);
  };

  // 5. Delete Subscriber
  const handleDeleteSubscriber = (subId: string) => {
    if (window.confirm(`Are you sure you want to permanently delete subscriber ${subId}? This cannot be undone.`)) {
      const updated = subscribers.filter((s) => s.id !== subId);
      onUpdateSubscribers(updated);
      if (selectedSubscriber?.id === subId) setSelectedSubscriber(null);
      showNotification(`Subscriber ${subId} removed from control center`);
    }
  };

  // 6. Extend / Add Days
  const handleApplyExtension = () => {
    if (!extendModalSubscriber) return;
    const days = Number(extensionDaysInput);
    if (isNaN(days) || days === 0) return;

    const addedMs = days * 24 * 60 * 60 * 1000;
    const baseDate = Math.max(Date.now(), extendModalSubscriber.expiryDate);
    const newExpiry = baseDate + addedMs;

    const updated = subscribers.map((s) => {
      if (s.id === extendModalSubscriber.id) {
        return {
          ...s,
          expiryDate: newExpiry,
          status: s.status === 'expired' ? 'active' : s.status,
          isLockedOrSuspended: false,
        };
      }
      return s;
    });

    onUpdateSubscribers(updated);
    setExtendModalSubscriber(null);
    showNotification(`Added ${days} days to ${extendModalSubscriber.id}. Valid until ${formatDate(newExpiry)}`);
  };

  // 7. Record Manual Payment
  const handleRecordPayment = () => {
    if (!paymentModalSubscriber) return;
    const selectedPlan = plans.find((p) => p.id === manualPaymentPlanId) || plans[0];
    const amount = Number(manualPaymentAmount);
    const durationMs = calculateBillingDurationMs(selectedPlan?.billingCycle || 'annual');
    const baseDate = Math.max(Date.now(), paymentModalSubscriber.expiryDate);
    const newExpiry = baseDate + durationMs;

    const invoiceNum = generateInvoiceNumber();
    const paymentRecord: SubscriptionPaymentRecord = {
      id: `sub-tx-${Date.now().toString().slice(-6)}`,
      subscriberId: paymentModalSubscriber.id,
      invoiceNumber: invoiceNum,
      timestamp: Date.now(),
      shopName: paymentModalSubscriber.shopName,
      subscriberEmail: paymentModalSubscriber.ownerEmail,
      subscriberPhone: paymentModalSubscriber.ownerPhone,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      billingCycle: selectedPlan.billingCycle,
      amount,
      currency: selectedPlan.currency || shopSettings.currency,
      paymentGateway: manualPaymentGateway,
      transactionRef: manualPaymentRef || `MANUAL-${Date.now().toString().slice(-4)}`,
      status: 'success',
      validUntil: newExpiry,
      notes: 'Recorded manually by App Owner in Control Center'
    };

    onAddPayment(paymentRecord);

    // Update subscriber record
    const updated = subscribers.map((s) => {
      if (s.id === paymentModalSubscriber.id) {
        return {
          ...s,
          status: 'active' as SubscriptionStatus,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          billingCycle: selectedPlan.billingCycle,
          expiryDate: newExpiry,
          totalPaidAmount: (s.totalPaidAmount || 0) + amount,
          paymentGateway: manualPaymentGateway,
          transactionRef: paymentRecord.transactionRef,
          isLockedOrSuspended: false,
        };
      }
      return s;
    });

    onUpdateSubscribers(updated);
    setPaymentModalSubscriber(null);
    setManualPaymentRef('');
    showNotification(
      `Recorded payment of ${formatCurrency(amount, selectedPlan.currency)} for ${paymentModalSubscriber.id}! Invoice: ${invoiceNum}`
    );
  };

  // 8. Create new subscriber
  const handleCreateSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newSubForm.id.trim() || generateSubscriberId();
    if (subscribers.some((s) => s.id.toLowerCase() === cleanId.toLowerCase())) {
      alert(`Subscriber ID "${cleanId}" already exists. Please choose a unique ID.`);
      return;
    }

    const selectedPlan = plans.find((p) => p.id === newSubForm.planId) || plans[0];
    const now = Date.now();
    const trialMs = (newSubForm.trialDays || 60) * 24 * 60 * 60 * 1000;
    const expiry = newSubForm.status === 'trial' ? now + trialMs : now + calculateBillingDurationMs(selectedPlan.billingCycle);

    const newRec: SubscriberRecord = {
      id: cleanId,
      shopId: newSubForm.shopId.trim() || `SHOP-${Math.floor(1000 + Math.random() * 9000)}`,
      shopName: newSubForm.shopName.trim() || 'New Storefront',
      ownerName: newSubForm.ownerName.trim() || 'Shop Owner',
      ownerEmail: newSubForm.ownerEmail.trim(),
      ownerPhone: newSubForm.ownerPhone.trim(),
      status: newSubForm.status,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      billingCycle: selectedPlan.billingCycle,
      licenseKey: newSubForm.licenseKey.trim() || generateLicenseKey(),
      startDate: now,
      expiryDate: expiry,
      trialDaysTotal: newSubForm.trialDays,
      totalPaidAmount: Number(newSubForm.initialPayment) || 0,
      currency: selectedPlan.currency || shopSettings.currency,
      paymentGateway: newSubForm.paymentGateway,
      transactionRef: newSubForm.transactionRef || 'NEW-REGISTRATION',
      notes: newSubForm.notes,
      createdAt: now,
    };

    onUpdateSubscribers([newRec, ...subscribers]);

    // If initial payment > 0, generate invoice
    if (newSubForm.initialPayment > 0) {
      const inv: SubscriptionPaymentRecord = {
        id: `sub-tx-${Date.now().toString().slice(-6)}`,
        subscriberId: newRec.id,
        invoiceNumber: generateInvoiceNumber(),
        timestamp: now,
        shopName: newRec.shopName,
        subscriberEmail: newRec.ownerEmail,
        subscriberPhone: newRec.ownerPhone,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        billingCycle: selectedPlan.billingCycle,
        amount: Number(newSubForm.initialPayment),
        currency: selectedPlan.currency || shopSettings.currency,
        paymentGateway: newSubForm.paymentGateway,
        transactionRef: newRec.transactionRef,
        status: 'success',
        validUntil: expiry,
        notes: 'Initial registration payment'
      };
      onAddPayment(inv);
    }

    setIsAddModalOpen(false);
    showNotification(`New Subscriber ${newRec.id} (${newRec.shopName}) created successfully!`);

    // Reset form
    setNewSubForm({
      id: generateSubscriberId(),
      shopId: `SHOP-${Math.floor(1000 + Math.random() * 9000)}`,
      shopName: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      planId: plans[0]?.id || 'plan-pro-annual',
      status: 'trial',
      trialDays: 60,
      licenseKey: generateLicenseKey(),
      notes: '',
      paymentGateway: 'upi_qr',
      initialPayment: 0,
      transactionRef: 'INIT-SUB-SETUP',
    });
  };

  // 9. Save edited subscriber
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubscriber) return;

    const updated = subscribers.map((s) =>
      s.id === editingSubscriber.id ? editingSubscriber : s
    );
    onUpdateSubscribers(updated);
    setEditingSubscriber(null);
    showNotification(`Subscriber ${editingSubscriber.id} details saved!`);
  };

  // 10. Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Subscriber ID',
      'Shop Code',
      'Shop Name',
      'Owner Name',
      'Email',
      'Phone',
      'Status',
      'Plan',
      'Billing Cycle',
      'License Key',
      'Start Date',
      'Expiry Date',
      'Days Left',
      'Total Paid',
      'Gateway',
      'Notes'
    ];

    const rows = subscribers.map((s) => [
      `"${s.id}"`,
      `"${s.shopId}"`,
      `"${s.shopName.replace(/"/g, '""')}"`,
      `"${s.ownerName.replace(/"/g, '""')}"`,
      `"${s.ownerEmail || ''}"`,
      `"${s.ownerPhone || ''}"`,
      `"${s.status}"`,
      `"${s.planName}"`,
      `"${s.billingCycle}"`,
      `"${s.licenseKey}"`,
      `"${formatDate(s.startDate)}"`,
      `"${formatDate(s.expiryDate)}"`,
      `"${getRemainingDaysFromDate(s.expiryDate)}"`,
      `"${s.totalPaidAmount || 0}"`,
      `"${s.paymentGateway}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Subscribers_Control_Center_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Exported subscribers registry to CSV!');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-stone-900 px-4 py-3 text-xs font-bold text-white shadow-2xl ring-1 ring-white/10 animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="rounded-3xl border border-amber-200/80 bg-linear-to-r from-stone-900 via-amber-950 to-stone-900 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-xs mb-3">
              <Sliders className="h-3.5 w-3.5" />
              <span>Owner Subscription Control Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Master Subscriber & License Registry
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-amber-100/80 max-w-2xl">
              Manage client subscription IDs, control license keys, issue extensions, grant 2-month trials, record offline payments, and lock/unlock store access instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onOpenPlayStoreGuide && (
              <button
                type="button"
                onClick={onOpenPlayStoreGuide}
                className="flex items-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-500/20 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 backdrop-blur-xs transition-all shadow-xs"
              >
                <Info className="h-4 w-4 text-amber-400" />
                <span>Play Store & Gateway Guide</span>
              </button>
            )}

            <button
              id="btn-export-subscribers"
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 backdrop-blur-xs transition-all shadow-xs"
            >
              <Download className="h-4 w-4 text-amber-300" />
              <span>Export CSV</span>
            </button>

            <button
              id="btn-add-subscriber"
              type="button"
              onClick={() => {
                setNewSubForm({
                  ...newSubForm,
                  id: generateSubscriberId(),
                  shopId: `SHOP-${Math.floor(1000 + Math.random() * 9000)}`,
                  licenseKey: generateLicenseKey(),
                });
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-2.5 text-xs font-black text-stone-950 hover:bg-amber-300 transition-all shadow-md shadow-amber-950/20"
            >
              <Plus className="h-4 w-4" />
              <span>Register New Subscriber</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-white/10 text-stone-100">
          <div className="rounded-2xl bg-white/5 p-3 backdrop-blur-xs border border-white/5">
            <span className="text-[10px] uppercase font-bold text-amber-300/80">Total Registered</span>
            <p className="text-xl font-black font-mono mt-0.5">{totalSubscribers}</p>
          </div>

          <div className="rounded-2xl bg-emerald-500/10 p-3 backdrop-blur-xs border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-emerald-300">Active Paid Plans</span>
            <p className="text-xl font-black font-mono text-emerald-300 mt-0.5">{activePaid}</p>
          </div>

          <div className="rounded-2xl bg-amber-500/10 p-3 backdrop-blur-xs border border-amber-500/20">
            <span className="text-[10px] uppercase font-bold text-amber-300">In 2-Mo Trial</span>
            <p className="text-xl font-black font-mono text-amber-300 mt-0.5">{trialUsers}</p>
          </div>

          <div className="rounded-2xl bg-red-500/10 p-3 backdrop-blur-xs border border-red-500/20">
            <span className="text-[10px] uppercase font-bold text-red-300">Expired Subscriptions</span>
            <p className="text-xl font-black font-mono text-red-300 mt-0.5">{expiredUsers}</p>
          </div>

          <div className="rounded-2xl bg-stone-500/10 p-3 backdrop-blur-xs border border-stone-500/20">
            <span className="text-[10px] uppercase font-bold text-stone-300">Locked / Suspended</span>
            <p className="text-xl font-black font-mono text-stone-300 mt-0.5">{suspendedUsers}</p>
          </div>

          <div className="rounded-2xl bg-amber-400/10 p-3 backdrop-blur-xs border border-amber-400/20">
            <span className="text-[10px] uppercase font-bold text-amber-300">Total Invoiced</span>
            <p className="text-lg font-black font-mono text-amber-300 mt-0.5">
              {formatCurrency(totalRevenueAll, shopSettings.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by Subscriber ID (e.g. SUB-8821), Shop Name, Email, License Key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 pl-10 pr-4 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-amber-600 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-stone-500" />
            <span className="text-[11px] font-bold text-stone-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-semibold text-stone-800 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all">All ({subscribers.length})</option>
              <option value="trial">2-Mo Trial</option>
              <option value="active">Active Pro</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs">
            <span className="text-[11px] font-bold text-stone-500">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-transparent font-semibold text-stone-800 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all">All Plans</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-stone-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-stone-800 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="expiry">Sort: Expiry Date</option>
              <option value="name">Sort: Shop Name</option>
              <option value="id">Sort: Subscriber ID</option>
              <option value="paid">Sort: Revenue Paid</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 font-bold text-stone-600 hover:text-stone-900"
              title="Toggle sort order"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Subscriber Table */}
      <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="px-4 py-3.5">Subscriber ID & Shop</th>
                <th className="px-4 py-3.5">Owner & Contact</th>
                <th className="px-4 py-3.5">Plan & License</th>
                <th className="px-4 py-3.5">Status & Access</th>
                <th className="px-4 py-3.5">Validity & Timeline</th>
                <th className="px-4 py-3.5">Revenue Paid</th>
                <th className="px-4 py-3.5 text-right">Master Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sortedSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                    <div className="mx-auto max-w-xs space-y-2">
                      <Users className="mx-auto h-8 w-8 text-stone-300" />
                      <p className="text-sm font-semibold text-stone-700">No subscribers found</p>
                      <p className="text-xs text-stone-400">
                        {searchTerm ? `No results match "${searchTerm}".` : 'No subscriber records in the database.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedSubscribers.map((sub) => {
                  const daysLeft = getRemainingDaysFromDate(sub.expiryDate);
                  const isExpired = daysLeft <= 0;
                  const isLocked = sub.isLockedOrSuspended;

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-amber-50/30 transition-colors ${
                        isLocked ? 'bg-red-50/30' : isExpired ? 'bg-stone-50/60' : ''
                      }`}
                    >
                      {/* Subscriber ID & Shop */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-mono font-bold text-xs ${
                              isLocked
                                ? 'bg-red-100 text-red-800 ring-1 ring-red-300'
                                : sub.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300'
                                : 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                            }`}
                          >
                            {sub.id.replace('SUB-', '')}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-stone-900 hover:text-amber-700 cursor-pointer"
                                onClick={() => setSelectedSubscriber(sub)}
                              >
                                {sub.id}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(sub.id, `id-${sub.id}`)}
                                title="Copy Subscriber ID"
                                className="text-stone-400 hover:text-stone-600"
                              >
                                {copiedKey === `id-${sub.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                            <p className="font-bold text-stone-800 mt-0.5">{sub.shopName}</p>
                            <span className="inline-block rounded-md bg-stone-100 px-1.5 py-0.2 text-[10px] font-mono text-stone-600">
                              {sub.shopId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Owner & Contact */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-stone-900">{sub.ownerName}</p>
                        {sub.ownerEmail && (
                          <p className="text-[11px] text-stone-500 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-stone-400 shrink-0" />
                            <span className="truncate max-w-[140px]">{sub.ownerEmail}</span>
                          </p>
                        )}
                        {sub.ownerPhone && (
                          <p className="text-[11px] text-stone-500 flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3 text-stone-400 shrink-0" />
                            <span>{sub.ownerPhone}</span>
                          </p>
                        )}
                      </td>

                      {/* Plan & License */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-stone-900">{sub.planName}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="capitalize text-[10px] font-semibold text-stone-500">
                            {sub.billingCycle}
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="text-[10px] font-mono font-semibold text-stone-600">
                            {sub.licenseKey.slice(0, 12)}...
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(sub.licenseKey, `lic-${sub.id}`)}
                            title="Copy License Key"
                            className="text-stone-400 hover:text-stone-600"
                          >
                            {copiedKey === `lic-${sub.id}` ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-stone-400 uppercase">
                          Via {sub.paymentGateway.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status & Access */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-1">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 ring-1 ring-red-300">
                              <Lock className="h-3 w-3" />
                              LOCKED / SUSPENDED
                            </span>
                          ) : sub.status === 'active' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-300">
                              <ShieldCheck className="h-3 w-3" />
                              ACTIVE PRO
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800 ring-1 ring-red-300">
                              <ShieldAlert className="h-3 w-3" />
                              EXPIRED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 ring-1 ring-amber-300">
                              <Sparkles className="h-3 w-3" />
                              2-MO TRIAL
                            </span>
                          )}

                          {/* Quick Status Dropdown */}
                          <div>
                            <select
                              value={sub.status}
                              onChange={(e) => handleChangeStatus(sub.id, e.target.value as SubscriptionStatus)}
                              className="text-[10px] rounded-md border border-stone-200 bg-white px-1.5 py-0.5 font-semibold text-stone-700 focus:outline-hidden cursor-pointer"
                            >
                              <option value="trial">Set Trial</option>
                              <option value="active">Set Active Pro</option>
                              <option value="expired">Set Expired</option>
                              <option value="suspended">Set Suspended</option>
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Validity & Timeline */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-stone-900">
                          {daysLeft > 0 ? (
                            <span className="text-stone-800">
                              {daysLeft} days left
                            </span>
                          ) : (
                            <span className="text-red-600 font-bold">
                              Expired {Math.abs(daysLeft)}d ago
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-stone-500">
                          Expires: {formatDate(sub.expiryDate)}
                        </p>
                        <p className="text-[9px] text-stone-400">
                          Since: {formatDate(sub.startDate)}
                        </p>
                      </td>

                      {/* Revenue Paid */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-black text-stone-900">
                          {formatCurrency(sub.totalPaidAmount || 0, sub.currency)}
                        </span>
                        <p className="text-[10px] text-stone-400 font-mono truncate max-w-[100px]">
                          {sub.transactionRef}
                        </p>
                      </td>

                      {/* Master Controls */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Add Days / Extend */}
                          <button
                            type="button"
                            onClick={() => {
                              setExtendModalSubscriber(sub);
                              setExtensionDaysInput(30);
                            }}
                            title="Add days or extend validity"
                            className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-100 shadow-2xs"
                          >
                            +Days
                          </button>

                          {/* Record Payment */}
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentModalSubscriber(sub);
                              setManualPaymentPlanId(sub.planId);
                              const p = plans.find((pl) => pl.id === sub.planId) || plans[0];
                              setManualPaymentAmount(p?.price || 0);
                            }}
                            title="Record manual subscription fee"
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100 shadow-2xs"
                          >
                            Pay
                          </button>

                          {/* Lock / Unlock Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleLock(sub)}
                            title={isLocked ? 'Unlock store access' : 'Lock/Suspend store access'}
                            className={`rounded-lg p-1.5 transition-colors ${
                              isLocked
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                            }`}
                          >
                            {isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => setEditingSubscriber({ ...sub })}
                            title="Edit Subscriber Record"
                            className="rounded-lg border border-stone-200 bg-white p-1.5 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriber(sub.id)}
                            title="Delete Subscriber"
                            className="rounded-lg border border-red-200 bg-white p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL 1: ADD NEW SUBSCRIBER --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Register New Subscriber</h3>
                  <p className="text-xs text-stone-500">Add a client storefront and issue custom subscription credentials.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscriber} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Subscriber ID */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Subscriber ID (Control Key) *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={newSubForm.id}
                      onChange={(e) => setNewSubForm({ ...newSubForm, id: e.target.value })}
                      placeholder="e.g. SUB-9021"
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-mono font-bold text-stone-900 focus:bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setNewSubForm({ ...newSubForm, id: generateSubscriberId() })}
                      title="Generate ID"
                      className="rounded-xl border border-stone-300 bg-white p-2 text-stone-600 hover:bg-stone-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Shop ID / Code */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Shop Code / ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubForm.shopId}
                    onChange={(e) => setNewSubForm({ ...newSubForm, shopId: e.target.value })}
                    placeholder="e.g. SHOP-7821"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Shop Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Shop / Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubForm.shopName}
                    onChange={(e) => setNewSubForm({ ...newSubForm, shopName: e.target.value })}
                    placeholder="e.g. Central City Grocers"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Store Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubForm.ownerName}
                    onChange={(e) => setNewSubForm({ ...newSubForm, ownerName: e.target.value })}
                    placeholder="e.g. Robert Jackson"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Owner Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={newSubForm.ownerPhone}
                    onChange={(e) => setNewSubForm({ ...newSubForm, ownerPhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Owner Email */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newSubForm.ownerEmail}
                    onChange={(e) => setNewSubForm({ ...newSubForm, ownerEmail: e.target.value })}
                    placeholder="owner@store.com"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Assigned Plan */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Assigned Plan
                  </label>
                  <select
                    value={newSubForm.planId}
                    onChange={(e) => setNewSubForm({ ...newSubForm, planId: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatCurrency(p.price, p.currency)} / {p.billingCycle})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newSubForm.status}
                    onChange={(e) => setNewSubForm({ ...newSubForm, status: e.target.value as SubscriptionStatus })}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  >
                    <option value="trial">2-Month Free Trial</option>
                    <option value="active">Active Paid License</option>
                    <option value="expired">Expired</option>
                    <option value="suspended">Suspended / Locked</option>
                  </select>
                </div>

                {/* Trial Duration (if trial) */}
                {newSubForm.status === 'trial' && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Trial Days Granted
                    </label>
                    <input
                      type="number"
                      value={newSubForm.trialDays}
                      onChange={(e) => setNewSubForm({ ...newSubForm, trialDays: Number(e.target.value) })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-stone-900 focus:outline-hidden"
                    />
                  </div>
                )}

                {/* Initial Payment Amount (if active) */}
                {newSubForm.status === 'active' && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Initial Paid Amount ({shopSettings.currency})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newSubForm.initialPayment}
                      onChange={(e) => setNewSubForm({ ...newSubForm, initialPayment: Number(e.target.value) })}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-stone-900 focus:outline-hidden"
                    />
                  </div>
                )}

                {/* Payment Gateway */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Payment Gateway / Method
                  </label>
                  <select
                    value={newSubForm.paymentGateway}
                    onChange={(e) => setNewSubForm({ ...newSubForm, paymentGateway: e.target.value as GatewayProvider })}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  >
                    <option value="upi_qr">UPI Direct QR</option>
                    <option value="stripe">Stripe Card</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="bank_transfer">Direct Bank Wire</option>
                  </select>
                </div>

                {/* Transaction Ref */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Transaction / Reference ID
                  </label>
                  <input
                    type="text"
                    value={newSubForm.transactionRef}
                    onChange={(e) => setNewSubForm({ ...newSubForm, transactionRef: e.target.value })}
                    placeholder="e.g. UPI-99823 or ch_3N8zXv"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* License Key */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Digital License Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSubForm.licenseKey}
                      onChange={(e) => setNewSubForm({ ...newSubForm, licenseKey: e.target.value })}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-stone-900 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setNewSubForm({ ...newSubForm, licenseKey: generateLicenseKey() })}
                      title="Generate new license key"
                      className="rounded-xl border border-stone-300 bg-white p-2 text-stone-600 hover:bg-stone-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Internal Notes / Customer History
                  </label>
                  <textarea
                    rows={2}
                    value={newSubForm.notes}
                    onChange={(e) => setNewSubForm({ ...newSubForm, notes: e.target.value })}
                    placeholder="e.g. Special arrangement for grocery retailer; promised barcode reader assistance."
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-800 px-5 py-2 text-xs font-bold text-white hover:bg-amber-900 shadow-xs"
                >
                  Create Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: EDIT SUBSCRIBER & CONTROL ID --- */}
      {editingSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Edit Subscriber: {editingSubscriber.id}
                  </h3>
                  <p className="text-xs text-stone-500">Control subscriber ID, plan, license key, and profile.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSubscriber(null)}
                className="rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Subscriber ID Control */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Subscriber ID (Primary Control Key) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSubscriber.id}
                    onChange={(e) => setEditingSubscriber({ ...editingSubscriber, id: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-mono font-bold text-stone-900 focus:bg-white focus:outline-hidden"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    You can rename or reassign this ID to match your client numbering.
                  </p>
                </div>

                {/* Shop ID */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Shop Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingSubscriber.shopId}
                    onChange={(e) => setEditingSubscriber({ ...editingSubscriber, shopId: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Shop Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Store / Business Name
                  </label>
                  <input
                    type="text"
                    value={editingSubscriber.shopName}
                    onChange={(e) => setEditingSubscriber({ ...editingSubscriber, shopName: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={editingSubscriber.ownerName}
                    onChange={(e) => setEditingSubscriber({ ...editingSubscriber, ownerName: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editingSubscriber.ownerPhone}
                    onChange={(e) => setEditingSubscriber({ ...editingSubscriber, ownerPhone: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingSubscriber.ownerEmail}
                    onChange={(e) => setEditingSubscriber({ ...editingSubscriber, ownerEmail: e.target.value })}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Plan */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Plan
                  </label>
                  <select
                    value={editingSubscriber.planId}
                    onChange={(e) => {
                      const p = plans.find((pl) => pl.id === e.target.value);
                      if (p) {
                        setEditingSubscriber({
                          ...editingSubscriber,
                          planId: p.id,
                          planName: p.name,
                          billingCycle: p.billingCycle,
                        });
                      }
                    }}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.billingCycle})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editingSubscriber.status}
                    onChange={(e) =>
                      setEditingSubscriber({
                        ...editingSubscriber,
                        status: e.target.value as SubscriptionStatus,
                      })
                    }
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  >
                    <option value="trial">2-Month Trial</option>
                    <option value="active">Active Pro</option>
                    <option value="expired">Expired</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                {/* License Key */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    License Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingSubscriber.licenseKey}
                      onChange={(e) =>
                        setEditingSubscriber({ ...editingSubscriber, licenseKey: e.target.value })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-stone-900 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSubscriber({
                          ...editingSubscriber,
                          licenseKey: generateLicenseKey(),
                        })
                      }
                      title="Generate new key"
                      className="rounded-xl border border-stone-300 bg-white p-2 text-stone-600 hover:bg-stone-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Total Paid Amount */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Total Paid Amount ({editingSubscriber.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingSubscriber.totalPaidAmount}
                    onChange={(e) =>
                      setEditingSubscriber({
                        ...editingSubscriber,
                        totalPaidAmount: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-stone-900 focus:outline-hidden"
                  />
                </div>

                {/* Locked / Suspended Toggle */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Access Lock / Suspension
                  </label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingSubscriber.isLockedOrSuspended}
                      onChange={(e) =>
                        setEditingSubscriber({
                          ...editingSubscriber,
                          isLockedOrSuspended: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded-md border-stone-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-xs font-semibold text-stone-800">
                      Lock Store Access (Disable POS Billing)
                    </span>
                  </label>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editingSubscriber.notes || ''}
                    onChange={(e) =>
                      setEditingSubscriber({ ...editingSubscriber, notes: e.target.value })
                    }
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingSubscriber(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-800 px-5 py-2 text-xs font-bold text-white hover:bg-amber-900 shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: EXTEND / ADD DAYS --- */}
      {extendModalSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Extend Subscription Days
                  </h3>
                  <p className="text-xs text-stone-500">
                    Add complimentary trial days or extend license period.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExtendModalSubscriber(null)}
                className="rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs space-y-1">
              <p className="font-bold text-amber-950">
                Subscriber: {extendModalSubscriber.shopName} ({extendModalSubscriber.id})
              </p>
              <p className="text-stone-600">
                Current Expiry: <strong>{formatDate(extendModalSubscriber.expiryDate)}</strong> (
                {getRemainingDaysFromDate(extendModalSubscriber.expiryDate)} days remaining)
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-[11px] font-bold text-stone-700">
                Select or Type Number of Days to Add:
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setExtensionDaysInput(d)}
                    className={`rounded-xl border py-2 text-xs font-bold transition-colors ${
                      extensionDaysInput === d
                        ? 'border-amber-600 bg-amber-100 text-amber-950 ring-1 ring-amber-500'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    +{d} Days
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[11px] text-stone-500 mb-1">
                  Custom number of days:
                </label>
                <input
                  type="number"
                  min="1"
                  value={extensionDaysInput}
                  onChange={(e) => setExtensionDaysInput(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-xs text-stone-900 focus:outline-hidden"
                />
              </div>

              <p className="text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl">
                New expiry will become:{' '}
                <strong className="text-stone-900">
                  {formatDate(
                    Math.max(Date.now(), extendModalSubscriber.expiryDate) +
                      extensionDaysInput * 24 * 60 * 60 * 1000
                  )}
                </strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setExtendModalSubscriber(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyExtension}
                className="rounded-xl bg-amber-800 px-5 py-2 text-xs font-bold text-white hover:bg-amber-900 shadow-xs"
              >
                Confirm Extension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: RECORD MANUAL PAYMENT --- */}
      {paymentModalSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-900">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Record Manual Payment
                  </h3>
                  <p className="text-xs text-stone-500">
                    Log cash, UPI, or direct wire settlement and generate official receipt.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalSubscriber(null)}
                className="rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs space-y-1">
              <p className="font-bold text-emerald-950">
                Subscriber: {paymentModalSubscriber.shopName} ({paymentModalSubscriber.id})
              </p>
              <p className="text-stone-600">
                Contact: {paymentModalSubscriber.ownerName} • {paymentModalSubscriber.ownerPhone || paymentModalSubscriber.ownerEmail}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Plan Purchased
                </label>
                <select
                  value={manualPaymentPlanId}
                  onChange={(e) => {
                    setManualPaymentPlanId(e.target.value);
                    const p = plans.find((pl) => pl.id === e.target.value);
                    if (p) setManualPaymentAmount(p.price);
                  }}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.price, p.currency)} / {p.billingCycle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Amount Received ({shopSettings.currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={manualPaymentAmount}
                  onChange={(e) => setManualPaymentAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono font-bold text-stone-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Payment Method / Gateway
                </label>
                <select
                  value={manualPaymentGateway}
                  onChange={(e) => setManualPaymentGateway(e.target.value as GatewayProvider)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-stone-900 focus:outline-hidden"
                >
                  <option value="upi_qr">UPI Direct QR / GPay / PhonePe</option>
                  <option value="bank_transfer">Direct Bank Wire / NEFT / IMPS</option>
                  <option value="stripe">Stripe Card</option>
                  <option value="razorpay">Razorpay</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  UTR / Reference / Transaction ID
                </label>
                <input
                  type="text"
                  value={manualPaymentRef}
                  onChange={(e) => setManualPaymentRef(e.target.value)}
                  placeholder="e.g. UPI-99823489 or WireRef#1049"
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 font-mono text-stone-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setPaymentModalSubscriber(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs"
              >
                Record Payment & Extend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: SUBSCRIBER DETAIL DRAWER / POPUP --- */}
      {selectedSubscriber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 font-mono font-black">
                  {selectedSubscriber.id.replace('SUB-', '')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Subscriber Dossier: {selectedSubscriber.id}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {selectedSubscriber.shopName} • Registered {formatDate(selectedSubscriber.createdAt || selectedSubscriber.startDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubscriber(null)}
                className="rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick action bar */}
            <div className="flex flex-wrap items-center gap-2 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
              <button
                onClick={() => {
                  setExtendModalSubscriber(selectedSubscriber);
                  setExtensionDaysInput(30);
                }}
                className="flex items-center gap-1 rounded-xl bg-white border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-100 shadow-2xs"
              >
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                <span>+30 Days</span>
              </button>

              <button
                onClick={() => {
                  setPaymentModalSubscriber(selectedSubscriber);
                  setManualPaymentPlanId(selectedSubscriber.planId);
                  const p = plans.find((pl) => pl.id === selectedSubscriber.planId) || plans[0];
                  setManualPaymentAmount(p?.price || 0);
                }}
                className="flex items-center gap-1 rounded-xl bg-white border border-stone-200 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 shadow-2xs"
              >
                <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                <span>Record Fee</span>
              </button>

              <button
                onClick={() => handleToggleLock(selectedSubscriber)}
                className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold shadow-2xs ${
                  selectedSubscriber.isLockedOrSuspended
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {selectedSubscriber.isLockedOrSuspended ? (
                  <>
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Unlock Access</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 text-red-600" />
                    <span>Lock Access</span>
                  </>
                )}
              </button>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3">
                <span className="text-[10px] font-bold uppercase text-stone-400">Subscriber ID</span>
                <p className="font-mono font-bold text-stone-900 mt-0.5">{selectedSubscriber.id}</p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3">
                <span className="text-[10px] font-bold uppercase text-stone-400">Shop ID Code</span>
                <p className="font-mono font-bold text-stone-900 mt-0.5">{selectedSubscriber.shopId}</p>
              </div>

              <div className="col-span-2 rounded-xl border border-stone-200 bg-stone-50/60 p-3">
                <span className="text-[10px] font-bold uppercase text-stone-400">License Key</span>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="font-mono font-bold text-stone-900">{selectedSubscriber.licenseKey}</p>
                  <button
                    onClick={() => handleCopy(selectedSubscriber.licenseKey, 'selected-lic')}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950"
                  >
                    {copiedKey === 'selected-lic' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedKey === 'selected-lic' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3">
                <span className="text-[10px] font-bold uppercase text-stone-400">Owner Name</span>
                <p className="font-bold text-stone-900 mt-0.5">{selectedSubscriber.ownerName}</p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3">
                <span className="text-[10px] font-bold uppercase text-stone-400">Phone / WhatsApp</span>
                <p className="font-mono font-bold text-stone-900 mt-0.5">{selectedSubscriber.ownerPhone || 'N/A'}</p>
              </div>

              <div className="col-span-2 rounded-xl border border-stone-200 bg-stone-50/60 p-3">
                <span className="text-[10px] font-bold uppercase text-stone-400">Email</span>
                <p className="font-bold text-stone-900 mt-0.5">{selectedSubscriber.ownerEmail || 'N/A'}</p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3">
                <span className="text-[10px] font-bold uppercase text-stone-400">Status</span>
                <p className="font-bold capitalize text-stone-900 mt-0.5">
                  {selectedSubscriber.status} ({getRemainingDaysFromDate(selectedSubscriber.expiryDate)}d left)
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3">
                <span className="text-[10px] font-bold uppercase text-stone-400">Total Lifetime Paid</span>
                <p className="font-mono font-bold text-emerald-700 mt-0.5">
                  {formatCurrency(selectedSubscriber.totalPaidAmount || 0, selectedSubscriber.currency)}
                </p>
              </div>
            </div>

            {/* Invoices for this subscriber */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-900">Payment & Invoice History</h4>
              {payments.filter((p) => p.subscriberId === selectedSubscriber.id).length === 0 ? (
                <p className="text-xs text-stone-400 italic">No payment receipts logged for this subscriber yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {payments
                    .filter((p) => p.subscriberId === selectedSubscriber.id)
                    .map((pmt) => (
                      <div
                        key={pmt.id}
                        className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs"
                      >
                        <div>
                          <p className="font-mono font-bold text-stone-900">{pmt.invoiceNumber}</p>
                          <p className="text-[10px] text-stone-400">
                            {formatDateTime(pmt.timestamp)} • {pmt.paymentGateway}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-stone-900">
                            {formatCurrency(pmt.amount, pmt.currency)}
                          </p>
                          {onViewInvoice && (
                            <button
                              onClick={() => onViewInvoice(pmt)}
                              className="text-[10px] font-bold text-amber-800 hover:underline"
                            >
                              View Invoice
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedSubscriber(null)}
                className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
