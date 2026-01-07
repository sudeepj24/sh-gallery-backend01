import React from 'react';
import GenericReorder from './reorder/GenericReorder';
import { ReorderConfig } from './reorder/types';

interface Category {
  id: string;
  label: string;
  subcategories: any[];
  display_order: number;
}

interface CategoryReorderProps {
  categories: Category[];
  onDataUpdate: (updatedCategories: Category[]) => void;
}

export default function CategoryReorder({ categories, onDataUpdate }: CategoryReorderProps) {
  const config: ReorderConfig<Category> = {
    title: 'Reorder Categories',
    tableName: 'categories',
    displayField: 'label',
    idField: 'id',
    orderField: 'display_order',
    emptyMessage: 'No categories to reorder',
    emptySubMessage: 'Add some categories first to use this feature.',
    dragMessage: 'Drag categories to reorder them. The order here determines how they appear in your gallery.'
  };

  const renderCategoryItem = (category: Category, index: number) => (
    <div className="flex items-center gap-4">
      <div className="flex items-center text-gray-400 hover:text-gray-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="12" r="1"/>
          <circle cx="9" cy="5" r="1"/>
          <circle cx="9" cy="19" r="1"/>
          <circle cx="15" cy="12" r="1"/>
          <circle cx="15" cy="5" r="1"/>
          <circle cx="15" cy="19" r="1"/>
        </svg>
      </div>
      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">
        #{index + 1}
      </span>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{category.label}</h3>
      </div>
      <div className="text-sm text-gray-500">
        {category.subcategories.length} filters
      </div>
    </div>
  );

  return (
    <GenericReorder
      items={categories}
      config={config}
      onDataUpdate={onDataUpdate}
      renderItem={renderCategoryItem}
      context="categories"
    />
  );
}