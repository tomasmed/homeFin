// Base modal props shared across all modals
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

// Modal-specific types
export interface CreateCategoryModalProps extends BaseModalProps {
  categoryId?: string | null;
  onSubmit: (formData: CreateCategoryFormData) => Promise<void>;
  onCancel?: () => void;
}

export interface DeleteConfirmationModalProps extends BaseModalProps {
  category: {
    id: string;
    name: string;
    account_id: string;
  } | null;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}
