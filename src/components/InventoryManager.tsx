import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  Check,
  X,
  Upload,
  Layers,
  ArrowUpDown,
  Filter,
  TrendingUp,
  Image as ImageIcon,
  Camera,
  ScanLine,
  Sparkles,
  Tag,
  Boxes
} from 'lucide-react';
import { Product, ShopSettings, Category, ProductUnit, ProductVariant } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CATEGORIES_LIST, PRESET_PRODUCT_IMAGES } from '../data/initialProducts';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { CategoryManagerModal } from './CategoryManagerModal';

interface InventoryManagerProps {
  products: Product[];
  settings: ShopSettings;
  categories?: string[];
  customCategories?: string[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAdjustStock: (id: string, delta: number) => void;
  onAddCustomCategory?: (category: string) => boolean;
  onRenameCustomCategory?: (oldCategory: string, newCategory: string) => boolean;
  onDeleteCustomCategory?: (category: string, fallback?: string) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  products,
  settings,
  categories,
  customCategories = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAdjustStock,
  onAddCustomCategory,
  onRenameCustomCategory,
  onDeleteCustomCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'stock' | 'price'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Category modal & quick add category states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isQuickAddingCategory, setIsQuickAddingCategory] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [quickCategoryError, setQuickCategoryError] = useState<string | null>(null);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [showPresetGallery, setShowPresetGallery] = useState(false);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formLocalName, setFormLocalName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('Daily Essentials');

  // Compute active categories (standard + custom + existing on products)
  const activeCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories;
    const set = new Set<string>();
    CATEGORIES_LIST.filter((c) => c !== 'All').forEach((c) => set.add(c));
    if (customCategories) customCategories.forEach((c) => set.add(c));
    products.forEach((p) => {
      if (p.category && p.category !== 'All') set.add(p.category);
    });
    return Array.from(set);
  }, [categories, customCategories, products]);

  const handleQuickAddCategorySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = quickCategoryName.trim();
    if (!trimmed) {
      setQuickCategoryError('Please enter a category name.');
      return;
    }
    if (trimmed.toLowerCase() === 'all') {
      setQuickCategoryError('"All" is reserved and cannot be used as a category.');
      return;
    }
    if (onAddCustomCategory) {
      const added = onAddCustomCategory(trimmed);
      if (added) {
        setFormCategory(trimmed as Category);
        setIsQuickAddingCategory(false);
        setQuickCategoryName('');
        setQuickCategoryError(null);
      } else {
        setQuickCategoryError(`Category "${trimmed}" already exists.`);
      }
    } else {
      setFormCategory(trimmed as Category);
      setIsQuickAddingCategory(false);
      setQuickCategoryName('');
      setQuickCategoryError(null);
    }
  };
  const [formPrice, setFormPrice] = useState(''); // Retail Selling Price
  const [formMrp, setFormMrp] = useState('');
  const [formWholesalePrice, setFormWholesalePrice] = useState('');
  const [formAgentPrice, setFormAgentPrice] = useState('');
  const [formCostPrice, setFormCostPrice] = useState('');
  const [formUnit, setFormUnit] = useState<ProductUnit>('pc');
  const [formStock, setFormStock] = useState('20');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formBadge, setFormBadge] = useState('');

  // Variants management
  const [hasVariants, setHasVariants] = useState(false);
  const [variantsList, setVariantsList] = useState<ProductVariant[]>([]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormLocalName('');
    setFormCategory('Daily Essentials');
    setFormPrice('');
    setFormMrp('');
    setFormWholesalePrice('');
    setFormAgentPrice('');
    setFormCostPrice('');
    setFormUnit('pc');
    setFormStock('20');
    setFormMinStock('5');
    setFormImageUrl(PRESET_PRODUCT_IMAGES[0].url);
    setFormBarcode(`890${Math.floor(1000000 + Math.random() * 9000000)}`);
    setFormDescription('');
    setFormBadge('');
    setHasVariants(false);
    setVariantsList([]);
    setShowPresetGallery(false);
    setIsFormOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormLocalName(p.localName || '');
    setFormCategory(p.category);
    setFormPrice(p.price.toString());
    setFormMrp(p.mrp ? p.mrp.toString() : '');
    setFormWholesalePrice(p.wholesalePrice ? p.wholesalePrice.toString() : '');
    setFormAgentPrice(p.agentPrice ? p.agentPrice.toString() : '');
    setFormCostPrice(p.costPrice ? p.costPrice.toString() : '');
    setFormUnit(p.unit);
    setFormStock(p.stock.toString());
    setFormMinStock(p.minStockThreshold.toString());
    setFormImageUrl(p.imageUrl);
    setFormBarcode(p.barcode || '');
    setFormDescription(p.description || '');
    setFormBadge(p.badge || '');
    setHasVariants(!!p.hasVariants);
    setVariantsList(p.variants || []);
    setShowPresetGallery(false);
    setIsFormOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}-${variantsList.length + 1}`,
      name: '500g Pack',
      unit: '500g',
      price: parseFloat(formPrice) || 0,
      mrp: parseFloat(formMrp) || undefined,
      wholesalePrice: parseFloat(formWholesalePrice) || undefined,
      agentPrice: parseFloat(formAgentPrice) || undefined,
      stock: 10,
      barcode: `${formBarcode}-${variantsList.length + 1}`,
    };
    setVariantsList([...variantsList, newVariant]);
  };

  const handleUpdateVariant = (idx: number, field: keyof ProductVariant, value: any) => {
    setVariantsList((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleRemoveVariant = (idx: number) => {
    setVariantsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formPrice);
    if (!formName.trim() || isNaN(priceNum) || priceNum < 0) {
      alert('Please provide a valid product name and retail selling price.');
      return;
    }

    const mrpNum = parseFloat(formMrp);
    const wholesaleNum = parseFloat(formWholesalePrice);
    const agentNum = parseFloat(formAgentPrice);
    const costNum = parseFloat(formCostPrice);
    const stockNum = parseInt(formStock, 10) || 0;
    const minStockNum = parseInt(formMinStock, 10) || 0;

    // Total stock from variants if variant mode
    const finalStock = hasVariants && variantsList.length > 0
      ? variantsList.reduce((sum, v) => sum + (v.stock || 0), 0)
      : stockNum;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        name: formName.trim(),
        localName: formLocalName.trim() || undefined,
        category: formCategory,
        price: priceNum,
        mrp: !isNaN(mrpNum) && mrpNum > 0 ? mrpNum : undefined,
        wholesalePrice: !isNaN(wholesaleNum) && wholesaleNum > 0 ? wholesaleNum : undefined,
        agentPrice: !isNaN(agentNum) && agentNum > 0 ? agentNum : undefined,
        costPrice: !isNaN(costNum) && costNum > 0 ? costNum : undefined,
        unit: formUnit,
        stock: finalStock,
        minStockThreshold: minStockNum,
        imageUrl: formImageUrl || editingProduct.imageUrl,
        barcode: formBarcode.trim() || undefined,
        description: formDescription.trim() || undefined,
        badge: formBadge.trim() || undefined,
        hasVariants,
        variants: hasVariants ? variantsList : undefined,
        lastUpdated: Date.now(),
      };
      onUpdateProduct(updated);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: formName.trim(),
        localName: formLocalName.trim() || undefined,
        category: formCategory,
        price: priceNum,
        mrp: !isNaN(mrpNum) && mrpNum > 0 ? mrpNum : undefined,
        wholesalePrice: !isNaN(wholesaleNum) && wholesaleNum > 0 ? wholesaleNum : undefined,
        agentPrice: !isNaN(agentNum) && agentNum > 0 ? agentNum : undefined,
        costPrice: !isNaN(costNum) && costNum > 0 ? costNum : undefined,
        unit: formUnit,
        stock: finalStock,
        minStockThreshold: minStockNum,
        imageUrl: formImageUrl || PRESET_PRODUCT_IMAGES[0].url,
        barcode: formBarcode.trim() || undefined,
        description: formDescription.trim() || undefined,
        isAvailable: true,
        badge: formBadge.trim() || undefined,
        hasVariants,
        variants: hasVariants ? variantsList : undefined,
        lastUpdated: Date.now(),
      };
      onAddProduct(newProd);
    }

    setIsFormOpen(false);
  };

  // Filter & sort
  const processedProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'All' || p.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          (p.localName && p.localName.toLowerCase().includes(q)) ||
          (p.barcode && p.barcode.includes(q)) ||
          (p.variants && p.variants.some((v) => v.name.toLowerCase().includes(q) || (v.barcode && v.barcode.includes(q))));
        const matchesLowStock =
          !filterLowStockOnly || (p.isAvailable && p.stock <= p.minStockThreshold);

        return matchesCategory && matchesSearch && matchesLowStock;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (typeof valA === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [products, selectedCategory, searchQuery, filterLowStockOnly, sortField, sortAsc]);

  // Inventory stats
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);
  const lowStockItemsCount = products.filter((p) => p.stock <= p.minStockThreshold).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Catalog Items
            </span>
            <Package className="h-5 w-5 text-amber-700" />
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900">{products.length}</p>
          <p className="mt-0.5 text-xs text-stone-500">
            {totalStockCount} total units on shelf
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Inventory Retail Value
            </span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-stone-900 font-mono">
            {formatCurrency(totalInventoryValue, settings.currency)}
          </p>
          <p className="mt-0.5 text-xs text-stone-500">
            Valued at active selling rates
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">
            {lowStockItemsCount}
          </p>
          <p className="mt-0.5 text-xs text-stone-500">
            Products at or below threshold
          </p>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, local name, barcode, variant..."
              className="w-full rounded-xl border border-stone-300 pl-9 pr-8 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                filterLowStockOnly
                  ? 'border-amber-600 bg-amber-50 text-amber-900'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Low Stock ({lowStockItemsCount})</span>
            </button>

            <button
              id="btn-add-product"
              onClick={openAddModal}
              className="flex items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-900 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Category Pills Filter & Manage Categories button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {['All', ...activeCategories].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as Category)}
                className={`shrink-0 rounded-lg px-3 py-1 font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 font-bold text-amber-900 hover:bg-amber-100 transition-all shadow-2xs"
            title="Manage and create categories"
          >
            <Layers className="h-3.5 w-3.5 text-amber-700" />
            <span>Manage Categories</span>
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 pl-4 pr-3">Product Name & Code</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Retail Price</th>
                <th className="px-3 py-3">Wholesale / Agent</th>
                <th className="px-3 py-3">MRP / Cost</th>
                <th className="px-3 py-3">Stock & Alert</th>
                <th className="px-3 py-3 text-center">Quick Adjust</th>
                <th className="py-3 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {processedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <Package className="mx-auto h-8 w-8 text-stone-300 mb-2" />
                    <p className="text-sm font-semibold">No products found</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Try adjusting your search query or add a new product above
                    </p>
                  </td>
                </tr>
              ) : (
                processedProducts.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = !isOutOfStock && product.stock <= product.minStockThreshold;

                  return (
                    <tr key={product.id} className="hover:bg-stone-50/60 transition-colors">
                      {/* Product details */}
                      <td className="py-3 pl-4 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="h-11 w-11 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-stone-900">{product.name}</p>
                              {product.hasVariants && product.variants && (
                                <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-800">
                                  {product.variants.length} Variants
                                </span>
                              )}
                            </div>
                            {product.localName && (
                              <p className="text-[11px] text-stone-500 italic">
                                {product.localName}
                              </p>
                            )}
                            {product.barcode && (
                              <p className="font-mono text-[10px] text-stone-400">
                                #{product.barcode}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3">
                        <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                          {product.category}
                        </span>
                      </td>

                      {/* Retail Price */}
                      <td className="px-3 py-3">
                        <span className="font-bold font-mono text-stone-950">
                          {formatCurrency(product.price, settings.currency)}
                        </span>
                        <p className="text-[10px] text-stone-500">per {product.unit}</p>
                      </td>

                      {/* Wholesale / Agent */}
                      <td className="px-3 py-3">
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <p className="text-blue-900 font-semibold">
                            WS: {formatCurrency(product.wholesalePrice ?? Number((product.price * 0.85).toFixed(2)), settings.currency)}
                          </p>
                          <p className="text-purple-900 font-semibold">
                            Ag: {formatCurrency(product.agentPrice ?? Number((product.price * 0.75).toFixed(2)), settings.currency)}
                          </p>
                        </div>
                      </td>

                      {/* MRP / Cost */}
                      <td className="px-3 py-3">
                        <div>
                          {product.mrp && (
                            <p className="text-[11px] font-mono text-stone-500 line-through">
                              MRP: {formatCurrency(product.mrp, settings.currency)}
                            </p>
                          )}
                          {product.costPrice && (
                            <p className="text-[10px] text-stone-500">
                              Cost: {formatCurrency(product.costPrice, settings.currency)}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-xs font-bold ${
                              isOutOfStock
                                ? 'text-rose-600'
                                : isLowStock
                                ? 'text-amber-600'
                                : 'text-stone-900'
                            }`}
                          >
                            {product.stock} {product.unit}
                          </span>
                          {isOutOfStock ? (
                            <span className="rounded bg-rose-100 px-1.5 py-0.2 text-[10px] font-bold text-rose-700">
                              Out
                            </span>
                          ) : isLowStock ? (
                            <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                              Low
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Quick Adjust Buttons */}
                      <td className="px-3 py-3 text-center">
                        <div className="inline-flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => onAdjustStock(product.id, -1)}
                            title="Decrease 1"
                            className="rounded px-2 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200 hover:text-stone-900 active:scale-95"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdjustStock(product.id, 1)}
                            title="Add 1"
                            className="rounded px-2 py-1 text-xs font-bold text-stone-600 hover:bg-stone-200 hover:text-stone-900 active:scale-95"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => onAdjustStock(product.id, 5)}
                            title="Restock +5"
                            className="rounded bg-amber-100 px-2 py-1 text-xs font-bold text-amber-900 hover:bg-amber-200 active:scale-95"
                          >
                            +5
                          </button>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(product)}
                            title="Edit Product"
                            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${product.name}" from store catalog?`)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            title="Delete Product"
                            className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Add / Edit Product Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative my-8 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden ring-1 ring-stone-900/10">
            {/* Modal Top */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-800 text-white">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {editingProduct ? 'Edit Product Catalog' : 'Add New Product & Showcase'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Set retail, wholesale, agent rates, variants, and product images
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Scrollable Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Product Name & Vernacular Name */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Basic Product Info
                </h4>

                <div>
                  <label className="text-xs font-bold text-stone-700">
                    Product Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Golden Basmati Rice, Vine Ripe Tomatoes"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700">
                      Vernacular / Local Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Basmati Chawal, Tamatar"
                      value={formLocalName}
                      onChange={(e) => setFormLocalName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700">Category</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsQuickAddingCategory(!isQuickAddingCategory);
                          setQuickCategoryName('');
                          setQuickCategoryError(null);
                        }}
                        className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>{isQuickAddingCategory ? 'Pick Existing' : '+ Custom Category'}</span>
                      </button>
                    </div>

                    {isQuickAddingCategory ? (
                      <div className="mt-1 space-y-1.5">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="e.g. Stationery, Frozen, Pet Care"
                            value={quickCategoryName}
                            onChange={(e) => {
                              setQuickCategoryName(e.target.value);
                              if (quickCategoryError) setQuickCategoryError(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleQuickAddCategorySubmit();
                              }
                            }}
                            className="flex-1 rounded-xl border border-amber-500 bg-amber-50/40 px-2.5 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-700 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickAddCategorySubmit()}
                            className="rounded-xl bg-amber-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-900 shadow-2xs whitespace-nowrap"
                          >
                            Add & Use
                          </button>
                        </div>
                        {quickCategoryError && (
                          <p className="text-[11px] font-medium text-rose-600">
                            {quickCategoryError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <select
                        value={formCategory}
                        onChange={(e) => {
                          if (e.target.value === '__add_custom_prompt__') {
                            setIsQuickAddingCategory(true);
                            setQuickCategoryName('');
                            setQuickCategoryError(null);
                            return;
                          }
                          setFormCategory(e.target.value as Category);
                        }}
                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                      >
                        {activeCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat} {customCategories?.includes(cat) ? '★ (Custom)' : ''}
                          </option>
                        ))}
                        <option value="__add_custom_prompt__" className="font-bold text-amber-800">
                          + Add New Custom Category...
                        </option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Multi-Tier Pricing Matrix: Retail, Wholesale, Agent, MRP, Cost */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-amber-700" />
                    <span>Pricing Matrix & Tiers ({settings.currency})</span>
                  </h4>
                  {formCostPrice && formPrice && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 rounded-md px-2 py-0.5">
                      Margin: {Math.round(((parseFloat(formPrice) - parseFloat(formCostPrice)) / parseFloat(formPrice)) * 100)}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-800">
                      Retail Price (Standard) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 font-mono font-bold focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800">
                      Wholesale Price (Bulk)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Bulk discount"
                      value={formWholesalePrice}
                      onChange={(e) => setFormWholesalePrice(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-blue-900 font-mono font-bold focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-800">
                      Agent / Distributor Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Agent rate"
                      value={formAgentPrice}
                      onChange={(e) => setFormAgentPrice(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-purple-900 font-mono font-bold focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700">
                      MRP / Marked Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="On box / pack"
                      value={formMrp}
                      onChange={(e) => setFormMrp(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 font-mono focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700">
                      Cost / Purchase Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Your cost"
                      value={formCostPrice}
                      onChange={(e) => setFormCostPrice(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 font-mono focus:border-amber-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700">Primary Unit</label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value as ProductUnit)}
                      className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                    >
                      <option value="pc">Piece (pc)</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="500g">500 grams (500g)</option>
                      <option value="250g">250 grams (250g)</option>
                      <option value="100g">100 grams (100g)</option>
                      <option value="pack">Packet (pack)</option>
                      <option value="litre">Litre (L)</option>
                      <option value="500ml">500ml</option>
                      <option value="dozen">Dozen</option>
                      <option value="box">Box</option>
                      <option value="bottle">Bottle</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Variants Toggle & Editor */}
              <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="hasVariantsToggle"
                      checked={hasVariants}
                      onChange={(e) => {
                        setHasVariants(e.target.checked);
                        if (e.target.checked && variantsList.length === 0) {
                          handleAddVariant();
                        }
                      }}
                      className="h-4 w-4 rounded text-amber-700 focus:ring-amber-600"
                    />
                    <label htmlFor="hasVariantsToggle" className="text-xs font-bold text-stone-900 cursor-pointer">
                      Has Multiple Variants / Sizes (e.g. 500g, 1kg, 5kg)
                    </label>
                  </div>
                  {hasVariants && (
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Variant</span>
                    </button>
                  )}
                </div>

                {hasVariants && (
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    {variantsList.map((variant, idx) => (
                      <div key={variant.id || idx} className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Variant Name (e.g. 1 kg Bag)"
                            value={variant.name}
                            onChange={(e) => handleUpdateVariant(idx, 'name', e.target.value)}
                            className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-bold text-stone-900 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="text-stone-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-stone-500">Retail</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Price"
                              value={variant.price}
                              onChange={(e) => handleUpdateVariant(idx, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-500">Wholesale</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Wholesale"
                              value={variant.wholesalePrice || ''}
                              onChange={(e) => handleUpdateVariant(idx, 'wholesalePrice', parseFloat(e.target.value) || undefined)}
                              className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1 font-mono text-xs text-blue-900"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-500">Agent</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Agent"
                              value={variant.agentPrice || ''}
                              onChange={(e) => handleUpdateVariant(idx, 'agentPrice', parseFloat(e.target.value) || undefined)}
                              className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1 font-mono text-xs text-purple-900"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-500">MRP</label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="MRP"
                              value={variant.mrp || ''}
                              onChange={(e) => handleUpdateVariant(idx, 'mrp', parseFloat(e.target.value) || undefined)}
                              className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-stone-500">Stock</label>
                            <input
                              type="number"
                              placeholder="Qty"
                              value={variant.stock}
                              onChange={(e) => handleUpdateVariant(idx, 'stock', parseInt(e.target.value, 10) || 0)}
                              className="w-full rounded-lg border border-stone-300 bg-white px-2 py-1 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stock, Min Level & Barcode with Live Camera Scanner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {!hasVariants && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-stone-700">Stock Count</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 font-mono focus:border-amber-600 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-stone-700">Low Stock Alert</label>
                      <input
                        type="number"
                        min="0"
                        value={formMinStock}
                        onChange={(e) => setFormMinStock(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 font-mono focus:border-amber-600 focus:outline-hidden"
                      />
                    </div>
                  </>
                )}

                <div className={hasVariants ? 'sm:col-span-3' : ''}>
                  <label className="text-xs font-bold text-stone-700">Barcode / SKU</label>
                  <div className="mt-1 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Scan or type barcode"
                      value={formBarcode}
                      onChange={(e) => setFormBarcode(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 font-mono focus:border-amber-600 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setIsBarcodeScannerOpen(true)}
                      className="flex shrink-0 items-center gap-1 rounded-xl bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-800"
                      title="Scan Barcode with Camera"
                    >
                      <Camera className="h-3.5 w-3.5 text-amber-400" />
                      <span>Scan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormBarcode(`890${Math.floor(1000000 + Math.random() * 9000000)}`)}
                      className="rounded-xl border border-stone-300 px-2.5 py-2 text-xs text-stone-600 hover:bg-stone-100"
                      title="Auto Generate Barcode"
                    >
                      ⚡
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Image Selection: File upload, URL, and Preset Gallery */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-amber-700" />
                    <span>Product Showcase Image</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPresetGallery(!showPresetGallery)}
                    className="text-[11px] font-bold text-amber-800 hover:underline"
                  >
                    {showPresetGallery ? 'Hide Gallery' : '🖼️ Pick from Grocery Presets'}
                  </button>
                </div>

                {/* Preset Gallery Picker */}
                {showPresetGallery && (
                  <div className="rounded-xl border border-stone-200 bg-white p-3 max-h-48 overflow-y-auto">
                    <p className="text-[11px] font-semibold text-stone-500 mb-2">
                      Click any photo to use for this product:
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {PRESET_PRODUCT_IMAGES.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setFormImageUrl(preset.url);
                            setShowPresetGallery(false);
                          }}
                          className={`group relative rounded-xl overflow-hidden border text-left transition-all ${
                            formImageUrl === preset.url
                              ? 'border-amber-600 ring-2 ring-amber-600'
                              : 'border-stone-200 hover:border-amber-500'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="h-16 w-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <p className="p-1 text-[10px] font-bold text-stone-800 truncate">
                            {preset.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 rounded-xl object-cover border-2 border-stone-300 shrink-0 bg-white shadow-xs"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <input
                      type="url"
                      placeholder="Image URL (https://...)"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                    />
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-xs hover:bg-stone-50">
                      <Upload className="h-3.5 w-3.5 text-amber-700" />
                      <span>Upload local image file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Description & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700">
                    Promotional Showcase Badge (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fresh Today, Best Seller, 10% OFF"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700">
                    Product Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief details shown to customers in showcase..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-800 px-6 py-2 text-xs font-bold text-white hover:bg-amber-900 shadow-sm"
                >
                  {editingProduct ? 'Save Product Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal for product barcode capture */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onScan={(code) => setFormBarcode(code)}
        title="Scan Product Barcode"
        subtitle="Point camera at product label barcode or packaging"
        mode="barcode"
        sampleCodes={[
          { label: 'Bananas', code: '8901230001' },
          { label: 'Tomatoes', code: '8901230002' },
          { label: 'Basmati Rice', code: '8901230005' },
        ]}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={activeCategories}
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
