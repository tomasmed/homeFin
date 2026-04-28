import { useCategories } from '@/hooks/useCategories'
import type { Category } from '@/types/types';

interface CategoriesListViewProps {
  categories?: Category[];
}

const CategoriesListView: React.FC<CategoriesListViewProps> = ({ categories: propCategories }) => {
  const { data, isLoading, error } = useCategories();
  
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="card-header">
          <div className="card-title">Your Categories</div>
          <div className="card-subtitle">Manage your spending categories</div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">Loading categories...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-xl shadow-sm overflow-hidden">
        <div className="card-header">
          <div className="card-title">Your Categories</div>
          <div className="card-subtitle">Manage your spending categories</div>
        </div>
        <div className="px-4 text-red-600">
          Error loading categories. Please check the backend service.
        </div>
      </div>
    );
  }
  
  const finalCategories = propCategories || data?.categories || [];
  const allCategories = finalCategories || [];
  
  if (!allCategories.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6">
        <div className="card-header">
          <div className="card-title">Your Categories</div>
          <div className="card-subtitle">Manage your spending categories</div>
        </div>
        <div className="text-center py-8 text-slate-500">
          No categories yet
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-400 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Categories
          </h2>
          <p className="text-sm text-slate-500">Manage your spending categories</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 max-w-4xl mx-auto">
          {allCategories.map((category: Category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    parent_id: string | null;
    icon_slug: string;
    color_hex: string;
  };
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
}) => {
  return (
    <div
      className="card-content bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      role="listitem"
      aria-label={`Category: ${category.name}`}
      tabIndex={0}
    >
      <div
        className="p-4 flex flex-col items-center justify-center h-16"
        style={{ background: `linear-gradient(135deg, ${category.color_hex}22 0%, ${category.color_hex}05 100%)` }}
      >
        <div className="text-center">
          <div className="font-semibold text-slate-900">{category.name}</div>
          <div className="text-xs text-slate-500 mt-1">{category.parent_id ? 'Subcategory' : 'Main Category'}</div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesListView;
