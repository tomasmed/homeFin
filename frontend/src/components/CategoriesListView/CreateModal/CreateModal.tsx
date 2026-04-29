import React, { useState } from 'react';
import type { CategoryFormData, Category } from '@/types/types';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CategoryFormData) => Promise<{ category: Category }>;
}

// Get icon options for selector
const OPTIONS: { value: string; label: string }[] = [
  { value: 'food', label: '🍔 Food & Dining' },
  { value: 'groceries', label: '🛒 Groceries' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'home', label: '🏠 Housing' },
  { value: 'utilities', label: '⚡ Utilities' },
  { value: 'health', label: '🏥 Health' },
  { value: 'medical', label: '💊 Medical' },
  { value: 'education', label: '📚 Education' },
  { value: 'entertainment', label: '🎬 Entertainment' },
  { value: 'shopping', label: '🛒 Shopping' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'personal', label: '💇 Personal Care' },
  { value: 'insurance', label: '🛡️ Insurance' },
  { value: 'gifts', label: '🎁 Gifts' },
  { value: 'clothing', label: '👕 Clothing' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'auto', label: '🚘 Auto/Maintenance' },
  { value: 'taxes', label: '💰 Taxes' },
  { value: 'savings', label: '🏦 Savings' },
  { value: 'debt', label: '📉 Debt/Rollover' },
  { value: 'other', label: '📦 Other' },
  { value: 'miscellaneous', label: '🔧 Miscellaneous' },
  { value: 'subscriptions', label: '📡 Subscriptions' },
  { value: 'dining', label: '🍽️ Dining Out' },
];

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // Form state - managed internally by the modal
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon_slug: '',
    color_hex: '#6b7280',
  });

  // Animation state handling
  const [showModal, setShowModal] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => setShowModal(true), 10);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setShowModal(false), 300); // Wait for animation
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      return; // Name validation error
    }
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error(error);
    }
  };

  // Don't render if closed
  if (!showModal) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-white rounded-lg shadow-lg w-[90%] max-w-[500px] transform ${
          showModal ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        } transition-all duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold text-slate-900">Create New Category</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded p-1 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="form-group mb-6">
            <label htmlFor="category-name" className="block text-sm font-medium text-slate-700 mb-2">
              Category Name
            </label>
            <input
              id="category-name"
              type="text"
              placeholder="e.g., Groceries"
              value={formData.name}
              onChange={(e) => {
                const newName = e.target.value;
                setFormData({ ...formData, name: newName });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 text-xs text-gray-500 mt-1 block"
              maxLength={50}
              required
              autoFocus
              aria-describedby="character-counter"
            />
            <span id="character-counter" className="sr-only">
              {Math.min((formData.name?.length || 0), 50)}/50 characters
            </span>
          </div>

          <div className="form-group mb-6">
            <label htmlFor="category-icon" className="block text-sm font-medium text-slate-700 mb-2">
              Select Icon
            </label>
            <select
              id="category-icon"
              value={formData.icon_slug}
              onChange={(e) => setFormData({ ...formData, icon_slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900"
              required
              aria-required="true"
            >
              <option value="" disabled>Select an icon...</option>
              {OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group mb-6">
            <label htmlFor="category-color" className="block text-sm font-medium text-slate-700 mb-2">
              Color (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="category-color"
                type="color"
                value={formData.color_hex || '#6b7280'}
                onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                className="h-10 w-14 p-0.5 border border-gray-300 rounded-md cursor-pointer bg-white"
                aria-label="Color picker"
              />
              <input
                type="text"
                value={formData.color_hex}
                onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono uppercase"
                placeholder="#RRGGBB"
              />
            </div>
            <span className="text-xs text-gray-500 mt-1 block">
              Default: #6B7280
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-slate-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
              disabled={!formData.name?.trim()}
              aria-label="Create new category"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
