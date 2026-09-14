import React, { useState } from 'react';
import {
  X,
  Plus,
  Tag,
  Trash2,
  Edit2,
  Check,
  Package,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES_LIST } from '../data/initialProducts';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[]; // standard + custom without 'All'
  customCategories: string[];
  products: Product[];
  onAddCustomCategory: (categoryName: string) => boolean;
  onRenameCustomCategory: (oldName: string, newName: string) => boolean;
  onDeleteCustomCategory: (categoryName: string, fallbackCategory?: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  customCategories,
  products,
  onAddCustomCategory,
  onRenameCustomCategory,
  onDeleteCustomCategory,
}) => {
  const [newCatName, setNewCatName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [catToDelete, setCatToDelete] = useState<string | null>(null);
  const [fallbackReassign, setFallbackReassign] = useState('Daily Essentials');

  if (!isOpen) return null;

  // Calculate product count per category
  const getProductCount = (categoryName: string) => {
    return products.filter((p) => p.category === categoryName).length;
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a category name.');
      return;
    }
    if (trimmed.toLowerCase() === 'all') {
      setErrorMsg('"All" is reserved for filtering all products.');
      return;
    }
    const exists = categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setErrorMsg(`Category "${trimmed}" already exists.`);
      return;
    }

    const success = onAddCustomCategory(trimmed);
    if (success) {
      setNewCatName('');
      setErrorMsg(null);
    }
  };

  const handleStartEdit = (cat: string) => {
    setEditingCat(cat);
    setEditingValue(cat);
    setErrorMsg(null);
  };

  const handleSaveEdit = (oldName: string) => {
    const trimmed = editingValue.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCat(null);
      return;
    }
    if (trimmed.toLowerCase() === 'all') {
      setErrorMsg('"All" is reserved for filtering all products.');
      return;
    }
    const exists = categories.some(
      (c) => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName
    );
    if (exists) {
      setErrorMsg(`Category "${trimmed}" already exists.`);
      return;
    }

    const success = onRenameCustomCategory(oldName, trimmed);
    if (success) {
      setEditingCat(null);
      setErrorMsg(null);
    }
  };

  const confirmDelete = (cat: string) => {
    onDeleteCustomCategory(cat, fallbackReassign);
    setCatToDelete(null);
  };

  const defaultList = CATEGORIES_LIST.filter((c) => c !== 'All');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-linear-to-r from-amber-50 to-stone-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-700 text-white shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <span>Manage Product Categories</span>
                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  {categories.length} Total
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                Create and organize custom categories for your shop and POS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Add New Category Box */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5 mb-2">
              <Plus className="h-4 w-4 text-amber-700" />
              <span>Add New Custom Category</span>
            </h4>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => {
                  setNewCatName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. Stationery, Frozen Goods, Pet Food, Clothing..."
                className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-700 focus:outline-hidden"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-900 active:scale-95 transition-all whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Category</span>
              </button>
            </form>

            {errorMsg && (
              <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          {/* Delete Confirmation Box */}
          {catToDelete && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span>Delete "{catToDelete}" Category?</span>
              </div>
              <p className="text-xs text-rose-700">
                {getProductCount(catToDelete) > 0 ? (
                  <>
                    There are <strong>{getProductCount(catToDelete)} product(s)</strong> currently under this category. Where would you like to reassign them?
                  </>
                ) : (
                  'Are you sure you want to remove this custom category?'
                )}
              </p>

              {getProductCount(catToDelete) > 0 && (
                <div>
                  <label className="text-[11px] font-semibold text-rose-900 block mb-1">
                    Reassign products to:
                  </label>
                  <select
                    value={fallbackReassign}
                    onChange={(e) => setFallbackReassign(e.target.value)}
                    className="w-full rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs text-stone-800"
                  >
                    {categories
                      .filter((c) => c !== catToDelete)
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCatToDelete(null)}
                  className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete(catToDelete)}
                  className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}

          {/* Custom Categories Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                <span>Your Custom Categories ({customCategories.length})</span>
              </h4>
              {customCategories.length === 0 && (
                <span className="text-[11px] text-stone-400">No custom categories added yet</span>
              )}
            </div>

            {customCategories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 p-4 text-center text-xs text-stone-500 bg-stone-50/50">
                Type a custom category above (e.g., "Electronics", "Handmade Crafts", "Herbal Medicines") to customize your catalog.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white overflow-hidden">
                {customCategories.map((cat) => {
                  const pCount = getProductCount(cat);
                  const isEditing = editingCat === cat;

                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between px-4 py-3 hover:bg-amber-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800 text-xs font-bold">
                          <Tag className="h-3.5 w-3.5" />
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              autoFocus
                              className="w-full rounded-lg border border-amber-600 px-2 py-1 text-xs text-stone-900 focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(cat)}
                              className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-700"
                              title="Save"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCat(null)}
                              className="rounded-lg border border-stone-300 p-1.5 text-stone-600 hover:bg-stone-100"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-stone-900 truncate">
                              {cat}
                            </span>
                            <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 shrink-0">
                              Custom
                            </span>
                          </div>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 text-[11px] font-medium text-stone-500 bg-stone-100 rounded-md px-2 py-1">
                            <Package className="h-3 w-3 text-stone-400" />
                            <span>{pCount} products</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                            title="Rename Category"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCatToDelete(cat);
                              setFallbackReassign(defaultList[0] || 'Daily Essentials');
                            }}
                            className="rounded-lg p-1 text-rose-400 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Default Built-in Categories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-stone-500" />
                <span>Default Built-in Categories ({defaultList.length})</span>
              </h4>
              <span className="text-[10px] text-stone-400">Standard Presets</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {defaultList.map((cat) => {
                const count = getProductCount(cat);
                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50/70 px-3 py-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-2 w-2 rounded-full bg-stone-400 shrink-0" />
                      <span className="font-semibold text-stone-800 truncate">{cat}</span>
                    </div>
                    <span className="text-[10px] font-medium text-stone-500 bg-white border border-stone-200 px-1.5 py-0.5 rounded-md shrink-0">
                      {count} items
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 bg-stone-50 px-6 py-3 flex items-center justify-between">
          <p className="text-[11px] text-stone-500">
            Categories automatically appear in POS register, inventory filter, and customer showcase.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
