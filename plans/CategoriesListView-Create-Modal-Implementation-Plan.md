# Implementation Plan: CategoriesListView - "Create New" Modal Button

## 🎯 Feature Description
Add a "Create New" button to the `CategoriesListView` component that opens a modal form for creating new expense categories. The modal includes form validation, icon selection, and integrates with the existing backend API endpoint.

---

## 📋 Requirements

### Functional Requirements
1. **Create New Button**: Add prominently visible button in the categories list header
2. **Modal Form**: Display form with following fields:
   - Category Name (required, text input, max 50 chars)
   - Icon Selection (required, dropdown/select from predefined list)
   - Color Picker (optional, hex color input with preview)
3. **Form Validation**:
   - Name: Required, non-empty, max 50 characters
   - Icon: Required, must be from predefined list
   - Color: Optional, must be valid hex format (#RRGGBB)
4. **Submit Flow**:
   - On "Create" click: submit form → API call → display success/error
   - On success: invalidate query → refresh list → close modal
   - On error: display error message (network issues, duplicate name, etc.)
5. **Cancel Flow**:
   - "Cancel" button or clicking modal backdrop or ESC key → close modal without saving
6. **Loading State**: Show loading spinner during API call
7. **Reset Form**: Clear form fields after successful submission

### Non-Functional Requirements
- Follow existing component styling patterns (CSS v4, no Tailwind)
- Maintain accessibility (aria-labels, keyboard navigation)
- No breaking changes to existing functionality
- TypeScript types for all components
- ESLint passing (use `npm run lint:check` after changes)

---

## 🗂️ File Structure & Changes

### Files to CREATE

| Path | Purpose | Size/Complexity | Tailwind Status |
|------|---------|-----------------|-----------------|
| `/frontend/src/components/CategoriesListView/CreateModal/` | (directory) | - | - |
| `/frontend/src/components/CategoriesListView/CreateModal/CreateModal.tsx` | Main modal container with title, header | Medium | ✅ Tailwind classes only |
| `/frontend/src/components/CategoriesListView/CreateModal/IconSelector.tsx` | Icon dropdown/selector component | Small or skip | ✅ Tailwind classes only |
| `/frontend/src/lib/icon-options.ts` | Predefined icon list with emoji/label | Small | - |
| `/frontend/src/types/category-form.ts` | Form data types and interfaces | Small | - |

### Files to MODIFY

| Path | Changes | Priority | Tailwind Status |
|------|---------|----------|-----------------|
| `/frontend/src/types/types.ts` | Add `CategoryFormData`, `CategoryFormState` types | High | - |
| `/frontend/src/hooks/useCategories.ts` | Add `createMutation` and `handleSubmit` | High | - |
| `/frontend/src/components/CategoriesListView/CategoriesListView.tsx` | Add button, state, modal rendering, form handler integration | High | ✅ Tailwind classes only for "Create New" button |
| `/frontend/src/lib/icon-options.ts` | Import and link `icon-options.ts` | - | - |

## 🛠️ Implementation Steps

### Phase 1: Setup & Branching (10-15 mins)

#### 1. Create Feature Branch
```bash
# From develop branch
git checkout develop

# Create new feature branch following naming standard
git checkout -b feature/categories-create-modal

# Commit optional - just ensure branch is clean
git status
```

#### 2. Verify Clean Working Directory
- Run typecheck before starting: `npm run typecheck`
- Ensure no conflicting changes
- Document current state in comments

#### 3. Update Branch Name if Needed
If any changes already made on branch, ensure name follows `feature/categories-create-modal`

---

### Phase 2: Types & Data Models (20-30 mins)

#### Step 2.1: Define Icon Options (`/frontend/src/lib/icon-options.ts`)
- List of predefined category icons with:
  - `slug`: unique identifier (e.g., `'food'`, `'transport'`)
  - `emoji`: visual representation (e.g., `'🍔'`, `'🚗'`)
  - `label`: display name (e.g., `'Food & Dining'`)
  - `color_hex`: default color for the category
- Total: 20+ common categories
- Export as array for component use

**Content Example:**
```typescript
export interface IconOption {
  slug: string
  emoji: string
  label: string
  color_hex: string
}

export const ICON_OPTIONS: IconOption[] = [
  { slug: 'food', emoji: '🍔', label: 'Food & Dining', color_hex: '#ef4444' },
  { slug: 'transport', emoji: '🚗', label: 'Transport', color_hex: '#3b82f6' },
  { slug: 'home', emoji: '🏠', label: 'Housing', color_hex: '#f59e0b' },
  { slug: 'utilities', emoji: '⚡', label: 'Utilities', color_hex: '#10b981' },
  // ... more icons
];

export function getIconOptions(): { value: string; label: string }[] {
  return ICON_OPTIONS.map((icon) => ({
    value: icon.slug,
    label: `${icon.emoji} ${icon.label}`,
  }));
}
```

#### Step 2.2: Update Types (`/frontend/src/types/types.ts`)
- Add `CategoryFormData` interface for form state
- Add `CategoryFormState` with error fields
- Add validation constants
- Add validation function

**Additions:**
```typescript
// Category form types (add to existing types)
export interface CategoryFormData {
  name: string
  icon_slug: string
  color_hex?: string
}

export interface CategoryFormState {
  name: string
  icon_slug: string
  color_hex: string
  isSubmitting: boolean
  error?: string
}

export const MAX_CATEGORY_NAME_LENGTH = 50;

export const validateCategoryForm = (formData: CategoryFormData): string[] => {
  const errors: string[] = [];
  if (!formData.name || formData.name.trim() === '') {
    errors.push('Category name is required');
  } else if (formData.name.length > MAX_CATEGORY_NAME_LENGTH) {
    errors.push(`Category name must be less than ${MAX_CATEGORY_NAME_LENGTH} characters`);
  }

  if (!formData.icon_slug) {
    errors.push('Please select a category icon');
  }

  // Validate color if provided
  if (formData.color_hex && !/^#([0-9A-F]{6})$/i.test(formData.color_hex)) {
    errors.push('Invalid color format (use #RRGGBB)');
  }

  return errors;
};
```

#### Step 2.3: Create Form Types File (`/frontend/src/types/category-form.ts`)
- Optional: Separate form-specific types from main types.ts
- Include `CategoryFormData`, `CategoryFormState`, validation function
- Keep clean separation of concerns

**Content:**
```typescript
// Form data types specifically for category creation forms

export interface CategoryFormData {
  name: string
  icon_slug: string
  color_hex?: string
}

export interface CategoryFormState {
  name: string
  icon_slug: string
  color_hex: string // default
  isSubmitting: boolean
  error?: string
}

export const DEFAULT_COLOR_HEX = '#6b7280';

export const MAX_CATEGORY_NAME_LENGTH = 50;

export function validateCategoryForm(formData: CategoryFormData): string[] {
  // ... validation logic
}
```

#### Step 2.4: Update Icon Options (`/frontend/src/lib/icon-options.ts`)
- Define 20+ common category icons
- Include emoji, slug, label, default color
- Export helper function `getIconOptions()`

---

### Phase 3: Backend Integration (15-20 mins)

#### Step 3.1: Verify API Endpoint
**Endpoint**: `POST http://localhost:8000/v1/api/categories`

**Request Body:**
```json
{
  "name": "New Category Name",
  "icon_slug": "food",
  "color_hex": "#ef4444"
}
```

**Response:**
```json
{
  "category": {
    "id": "uuid-string",
    "name": "New Category Name",
    "parent_id": null,
    "icon_slug": "food",
    "color_hex": "#ef4444",
    "created_at": "2026-04-28T10:30:00.000Z"
  }
}
```

#### Step 3.2: Update API Client Hook (`/frontend/src/hooks/useCategories.ts`)
- Import React Query: useMutation, useQueryClient
- Update existing hook to include CREATE mutation
- Add error handling

**Additions:**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { createCategory as createCategoryPayload, Category } from '@/lib/api';

export function useCategories() {
  const queryClient = useQueryClient();

  // Existing fetch functionality stays the same

  // CREATE mutation
  const createMutation = useMutation({
    mutationFn: async (formData: CategoryCreatePayload) => {
      const response = await apiClient.post('/v1/api/categories', formData);
      return response.data as { category: Category };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      console.error('Category creation failed:', error);
    },
  });

  // Helper function
  const handleSubmit = async (formData: CategoryFormData) => {
    try {
      const result = await createMutation.mutateAsync(formData);
      return result.category; // Return created category
    } catch (error) {
      throw error;
    }
  };

  return {
    categories: categoriesRef.current || [],
    isLoading,
    error,
    createMutation: createMutation.mutate,
    isCreating: createMutation.isPending,
    onCreateSuccess: createMutation.reset,
    onCreateError: createMutation.error,
    handleSubmit, // Helper for form submission
  };
}
```

---

### Phase 4: Icon Selector Component (30-40 mins)

#### Step 4.1: Create Component Structure (`/frontend/src/components/CategoriesListView/CreateModal/IconSelector.tsx`)
- Import `getIconOptions()` from `icon-options.ts`
- Create controlled selector component
- Handle selection change
- Export single component

**Note:** This component can be minimal or removed if IconSelector styling is done inline in CreateModal.

**Two Options:**

**Option A - Minimal (Recommended):**
- Remove IconSelector component entirely
- Render icon selector directly in CreateModal
- Use Tailwind inline classes for all styling
- This reduces component complexity and file count

**Option B - Standalone (if reusability needed):**
```tsx
import React from 'react';
import { getIconOptions } from '@/lib/icon-options';

interface IconSelectorProps {
  selectedIcon?: string;
  onChange: (value: string) => void;
  error?: string;
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  selectedIcon,
  onChange,
  error,
}) => (
  <div className="mb-6">
    <label htmlFor="category-icon" className="block text-sm font-medium text-slate-700 mb-2">
      Select Icon
    </label>
    <select
      id="category-icon"
      value={selectedIcon}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-slate-900 ${
        error ? 'focus:ring-red-500 focus:border-red-500' : ''
      }`}
    >
      <option value="" disabled>Select an icon...</option>
      {getIconOptions().map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <span className="mt-1 text-xs text-red-600">{error}</span>}
  </div>
);
```

#### Step 4.2: Add Component Styling (`/frontend/src/components/CategoriesListView/CreateModal/IconSelector.css`)
- Dropdown styling (width 100%, padding, border)
- Hover effects
- Error state styling (red border, background)

---

### Phase 5: Modal Component (40-50 mins)

#### Step 5.1: Create Main Modal Container (`/frontend/src/components/CategoriesListView/CreateModal/CreateModal.tsx`)
- Modal overlay (backdrop)
- Modal content container (centered)
- Export single component with props

**Template:**
```tsx
import React from 'react';
import './CreateModal.css';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CategoryFormData) => Promise<{ category: Category }>;
  formData: CategoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  onSubmitError?: string;
  onSubmitSuccess?: boolean;
}

export const CreateModal: React.FC<CreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  onSubmitError,
  onSubmitSuccess,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      return; // Name validation error
    }
    try {
      await onSubmit(formData);
      setFormData({ name: '', icon_slug: '', color_hex: '#6b7280' });
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              maxLength={50}
            />
            <span className="text-xs text-gray-500">
              {formData.name?.length || 0}/50 characters
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
            >
              <option value="" disabled>Select an icon...</option>
              {options.map((option) => (
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
              />
              <input
                type="text"
                value={formData.color_hex}
                onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono uppercase"
                placeholder="#RRGGBB"
              />
            </div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={isCreating || !formData.name?.trim()}
            >
              {isCreating ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      className="opacity-75"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="4 4"
                      strokeDashoffset="4"
                    />
                  </svg>
                  <span>Creating...</span>
                </span>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

#### Step 5.2: Add Modal Styling (Tailwind v4 utilities)
- Remove `CreateModal.css` file entirely
- Use inline Tailwind classes for all styling
- Enable JIT compiler for dynamic classes (opacity, transform)

**Note:** If dynamic styling needed (e.g., conditional opacity), add to `vite.config.ts` or use arbitrary values:
```css
/* Add to /frontend/src/index.css or use inline: */
body {
  font-family: 'Inter', sans-serif;
}

@layer utilities {
  .animation-fade-in {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}
```

Alternatively, use Tailwind's `animate-pulse` or custom animation via:
- `animate-[fadeIn_0.2s_ease-out]` (with custom animation config in Tailwind)
- Or use arbitrary values: `animate-[fadeIn_0.2s_ease-out]`

#### Step 5.3: Update Icon Selector for Modal (revised)
- Pass `formData.icon_slug` from parent
- Handle `onChange` to update `setFormData` in parent
- Style using modal's CSS v4

---

### Phase 6: Integrate into CategoriesListView (20-30 mins)

#### Step 6.1: Update CategoriesListView (`/frontend/src/components/CategoriesListView/CategoriesListView.tsx`)
- Add state for modal visibility
- Add state for form data
- Add state for validation errors
- Import `CreateModal` component
- Import `IconSelector` component
- Add "Create New" button
- Wire up form submission

**Template:**
```tsx
import { useCategories } from '@/hooks/useCategories';
import type { Category } from '@/types/types';
import { CreateModal } from './CreateModal';
import { IconSelector } from './CreateModal/IconSelector';

const CategoriesListView: React.FC<CategoriesListViewProps> = ({
  categories: propCategories,
}) => {
  const { data, isLoading, error, createMutation, isCreating, handleSubmit } =
    useCategories();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<CategoryFormData>({
    name: '',
    icon_slug: '',
    color_hex: '#6b7280',
  });

  // ... existing code ...

  const handleCreateClick = () => {
    setIsModalOpen(true);
    setFormData({ name: '', icon_slug: '', color_hex: '#6b7280' });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', icon_slug: '', color_hex: '#6b7280' });
  };

  const handleFormSubmit = async (form: CategoryFormData) => {
    try {
      await handleSubmit(form);
      setFormData({ name: '', icon_slug: '', color_hex: '#6b7280' });
      handleCloseModal();
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  if (isLoading) {
    return (
      // ... existing loading state ...
    );
  }

  if (error) {
    return (
      // ... existing error state ...
    );
  }

  const finalCategories = propCategories || data?.categories || [];
  const allCategories = finalCategories || [];

  if (!allCategories.length) {
    return (
      // ... existing empty state ...
    );
  }

  return (
    // ... existing header ...
    <div className="card-title">Your Categories</div>
    <div className="flex justify-between items-center">
      <div className="card-subtitle">Manage your spending categories</div>
      <button
        onClick={handleCreateClick}
        className="btn btn-primary btn-sm"
        style={{
          marginRight: '10px',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          border: 'none',
          padding: '6px 16px',
        }}
      >
        [+] Create New
      </button>
    </div>

    // ... grid rendering ...
    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 max-w-4xl mx-auto">
      {allCategories.map((category: Category) => (
        <CategoryCard
          key={category.id}
          category={category}
        />
      ))}
    </div>

    {/* Render modal */}
    <CreateModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onSubmit={handleFormSubmit}
      formData={formData}
      setFormData={setFormData}
    />
  );
};
```

#### Step 6.2: Handle Validation (optional for this ticket)
- Add validation checks before submission
- Show inline validation errors
- This can be done later or as separate feature

---

### Phase 7: Testing & Quality Assurance (15-20 mins)

#### Step 7.1: Type Check
```bash
npm run typecheck
# Fix any type errors
```

#### Step 7.2: Lint Check
```bash
npm run lint:check
# Fix linting issues
```

#### Step 7.3: Manual Testing Checklist

**Happy Path:**
1. ✅ Click "Create New" button → modal opens cleanly
2. ✅ Fill form: "Test Category", select "Food & Dining", optional color
3. ✅ Click "Create" → API called → category appears in list → modal closes
4. ✅ List refreshes (no manual reload needed)
5. ✅ Form clears after submission

**Edge Cases:**
1. ✅ Submit empty name → validation error shown
2. ✅ Select no icon → validation error shown
3. ✅ Invalid color hex → format shown
4. ✅ Network error → error message displayed
5. ✅ Duplicate category name → backend 409 handled
6. ✅ ESC key press → modal closes
7. ✅ Click backdrop → modal closes

**Negative Tests:**
8. ✅ Try to create while loading → disabled button
9. ✅ Type 51 characters → char counter shows "51/50"
10. ✅ Refresh page → new category persists in list

#### Step 7.4: Accessibility Testing
- Verify keyboard navigation (TAB, ENTER, ESC)
- Check aria-labels on all interactive elements
- Test screen reader compatibility
- Ensure focus management (modal closes on escape)

#### Step 7.5: Console Inspection
- Check for React errors in console
- Verify API calls use correct endpoint
- Confirm query invalidation works
- No hydration errors for static content

---

### Phase 8: Git Workflow (10 mins)

#### Step 8.1: Commit Changes
```bash
# Review changes
git status
git diff

# Add all changes
git add .

# Commit with clear message
git commit -m "feat: add Create New button to CategoriesListView with modal form

- Implement CreateModal component with form fields
- Add IconSelector component for predefined category icons
- Integrate with backend POST /v1/api/categories endpoint
- Add form validation (name required, icon required)
- Implement loading state during creation
- Add cancel/closure with ESC key and backdrop click
- Add char counter for category name field"
```

#### Step 8.2: Check Branch is Clean
```bash
git log -1
# Ensure this shows your recent commit

# Verify branch tracking
git status
# Should show clean working directory
```

#### Step 8.3: Pull Request Checklist
**Before creating PR, verify:**
- ✅ Code runs locally without errors
- ✅ `npm run typecheck` passes
- ✅ `npm run lint:check` passes
- ✅ All manual tests passed (from Step 7.3)
- ✅ Branch is up-to-date with develop:
  ```bash
  # Check for drift
  git diff origin/develop...feature/categories-create-modal
  
  # Update if needed
  git pull origin develop
  git push origin feature/categories-create-modal
  ```
- ✅ PR title follows format: "feat: [feature name]"
- ✅ PR description includes:
  - Summary of changes
  - Testing checklist
  - Any breaking changes (N/A for this PR)
  - Screenshots (if UI changes - optional)

#### Step 8.4: Create Pull Request
```bash
# Via GitHub CLI or web UI
gh pr create --title "Add Create New button to CategoriesListView" \
  --body "Implementation plan: https://<project>/Planning/CategoriesListView-Create-Feature-Proposal.md

## Summary
Added "Create New" button to categories list that opens a modal form for creating new categories. Features include:
- Form validation (name required, icon required)
- Icon selection from predefined list
- Optional color picker with preview
- Auto-refresh after submission
- Proper error handling

## Testing
All manual tests passed. See Phase 7 for details.

## Files Changed
- New: CreateModal component
- New: IconSelector component
- Modified: useCategories hook
- Modified: CategoriesListView
"
```

**Or via GitHub Web UI:**
1. Go to your repository
2. Click "Pull requests" → "New pull request"
3. Select branch: `feature/categories-create-modal`
4. Base: `develop`
5. Write description and title
6. Click "Create pull request"
7. Request review from team members

---

## ✅ Acceptance Criteria

### Must Have
- [ ] "Create New" button visible in CategoriesListView header
- [ ] Modal opens on button click
- [ ] Form includes name (text), icon (select), color (optional) fields
- [ ] Validation prevents empty name
- [ ] Icon selection from predefined list
- [ ] Submit creates category via POST /v1/api/categories
- [ ] List refreshes after successful creation
- [ ] Modal closes after submission and can be reopened
- [ ] Cancel button closes modal without saving
- [ ] ESC key closes modal
- [ ] Backdrop click closes modal
- [ ] No breaking changes to existing categories list

### Should Have
- [ ] Loading spinner during API call
- [ ] Error message displayed on API failure
- [ ] Character counter for name field
- [ ] Color picker with live preview
- [ ] Form validation feedback (red border on error)

### Nice to Have
- [ ] Success notification after creation
- [ ] Animation/transitions for modal open/close
- [ ] Keyboard shortcuts (Ctrl+N to create new)

---

## 🐛 Known Issues/Edge Cases

### Not Addressed (Future Tickets)
1. **Duplicate name handling**: Backend returns 409 Conflict, need to display user-friendly error

---

## 📤 Deliverables

After implementation:
1. ✅ Functional "Create New" button in CategoriesListView
2. ✅ CreateModal component with form validation
3. ✅ IconSelector component for predefined icons
4. ✅ Updated useCategories hook with create mutation
5. ✅ Clean git branch: `feature/categories-create-modal`
6. ✅ Pull Request ready for review
7. ✅ All tests passing (typecheck, lint, manual)

---

*Plan created: 2026-04-28*
*Version: 1.0*
