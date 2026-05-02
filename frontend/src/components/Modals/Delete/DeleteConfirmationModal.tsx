import React from 'react';
import type { Category } from '@/types/types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  category,
  onClose,
  onCancel,
  onConfirm,
  isDeleting,
}) => {
  // Animation state handling
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const timeout = setTimeout(() => setShowModal(true), 10);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setShowModal(false), 300); // Wait for animation
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Handle ESC key and backdrop click
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Don't render if closed
  if (!showModal) {
    return null;
  }

  const handleClose = () => {
    setShowModal(false);
    // Call onClose after a delay to allow animation to complete
    setTimeout(() => onClose(), 300);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">Delete Category</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete "{category?.name}"?
        </p>
        <p className="text-xs text-gray-500 mb-6">
          This will unlink associated transactions but not delete them.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
