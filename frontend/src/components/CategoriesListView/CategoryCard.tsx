import React from 'react';
import type { Category } from '@/types/types';
import { Trash2 } from 'lucide-react';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    parent_id: string | null;
    icon_slug: string;
    color_hex: string;
  };
  onDelete: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onDelete,
}) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(category);
  };

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
          {category.icon_slug ? category.icon_slug : ''}
        </div>
        <div
          className="text-xl text-center px-2 w-max mx-auto"
          style={{ fontSize: '1rem', fontWeight: '500', color: category.color_hex }}
        >
          {category.name}
        </div>
        <button
          onClick={handleDeleteClick}
          className="mt-2 p-1 rounded-lg hover:bg-red-100 transition-colors tooltip-btn"
          aria-label={`Delete ${category.name} category`}
          title="Delete category"
        >
          <Trash2 size={16} className="text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
