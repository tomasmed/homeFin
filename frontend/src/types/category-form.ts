// Type definitions for Category form data and validation

export interface CategoryFormData {
  name: string;
  icon_slug: string;
  color_hex?: string;
}

export interface CategoryFormState {
  name: string;
  icon_slug: string;
  color_hex: string; // always has a default
  isSubmitting: boolean;
  error?: string | null;
}

// Validation constants
export const MAX_CATEGORY_NAME_LENGTH = 50;

export const DEFAULT_COLOR_HEX = '#6b7280';

export const DEFAULT_ICON_SLUG = 'other';

// Validation function - returns array of error messages
export function validateCategoryForm(formData: CategoryFormData): string[] {
  const errors: string[] = [];

  // Validate name
  if (!formData.name || formData.name.trim() === '') {
    errors.push('Category name is required');
  } else if (formData.name.length > MAX_CATEGORY_NAME_LENGTH) {
    errors.push(`Category name must be less than ${MAX_CATEGORY_NAME_LENGTH} characters`);
  }

  // Validate icon selection
  if (!formData.icon_slug) {
    errors.push('Please select a category icon');
  }

  // Validate color if provided
  if (formData.color_hex) {
    // Check if it's valid hex format
    if (!/^#([0-9A-Fa-f]{6})$/.test(formData.color_hex)) {
      errors.push('Invalid color format (use #RRGGBB)');
    }
  }

  return errors;
}

// Validate single error response and return error message or undefined
export function formatValidationErrors(errors: string[]): string | undefined {
  if (errors.length === 0) return undefined;
  return errors.join(', ');
}

// Helper to validate before submission
export function canSubmit(formData: CategoryFormData): boolean {
  const errors = validateCategoryForm(formData);
  return errors.length === 0;
}
