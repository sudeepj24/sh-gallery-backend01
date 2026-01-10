import React from 'react';
import { Category } from './types';

interface CategorySelectionProps {
  categories: Category[];
  selectedCategory: Category | null;
  onCategorySelect: (category: Category) => void;
  onNext: () => void;
}

export default function CategorySelection({
  categories,
  selectedCategory,
  onCategorySelect,
  onNext
}: CategorySelectionProps) {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = categories.find(c => c.id === e.target.value);
    if (category) {
      onCategorySelect(category);
      // Auto-proceed to next step
      setTimeout(() => onNext(), 100);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Product Category</h3>
      
      <div className="w-64">
        <select
          value={selectedCategory?.id || ''}
          onChange={handleCategoryChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No categories available</p>
          <p className="text-sm text-gray-400 mt-1">
            Please create categories first
          </p>
        </div>
      )}
    </div>
  );
}