import React, { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import type { Category, CategoryFormData } from '@/types/types';
import { CreateModal } from './CreateModal/CreateModal';

interface CategoriesListViewProps {
  categories?: Category[];
}
interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    parent_id: string | null;
    icon_slug: string;
    color_hex: string;
  };
}

const CategoriesListView: React.FC<CategoriesListViewProps> = ({ categories: propCategories }) => {
  const { data, isLoading, error, handleSubmit } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper functions for modal
  const handleCreateClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = async (form: CategoryFormData): Promise<{ category: Category }> => {
    try {
      const result:Category = await handleSubmit(form);
      console.log('Created category:', result);
      // Query invalidation handled in hook, so list refreshes automatically
      handleCloseModal();
      return {category: result};
    } catch (err) {
      console.error('Failed to create category:', err);
      throw err;
    }
  };

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
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Your Categories
          </h2>
          <p className="text-sm text-slate-500">Manage your spending categories</p>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="card-title">Manage Categories</div>
          <button
            onClick={handleCreateClick}
            className="btn btn-primary rounded-xl px-3 bg-linear-to-r from-blue-400 to-blue-600 text-white py-2 hover:shadow-lg"
          >
            [+] Create New
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {allCategories.map((category: Category) => (
            <CategoryCard
              key={category.id}
              category={category}
            />
          ))}
        </div>
      </div>

      {/* Render modal */}
      <CreateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};


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
        <div
          className="text-3xl mb-1"
          style={{ fontSize: '2rem', color: category.color_hex, filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))' }}
        >
        </div>
        <div
          className="text-xl text-center px-2 w-max mx-auto"
          style={{ fontSize: '1rem', fontWeight: '500', color: category.color_hex }}
        >
          {category.name}
        </div>
      </div>
    </div>
  );
};

export default CategoriesListView;
