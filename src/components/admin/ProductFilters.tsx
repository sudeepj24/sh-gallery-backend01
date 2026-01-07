import React from 'react';
import { Search, Plus, Grid, List, SortAsc, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  label: string;
}

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  categories: Category[];
  totalProducts: number;
  onAddProduct: () => void;
  selectedProducts: Set<string>;
  onBulkDelete: () => void;
}

export default function ProductFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  categories,
  totalProducts,
  onAddProduct,
  selectedProducts,
  onBulkDelete
}: ProductFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      {/* Top Row: Search and Add Button */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products by name, ID, description, or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={selectedProducts.size > 0 ? onBulkDelete : onAddProduct}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${
            selectedProducts.size > 0
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {selectedProducts.size > 0 ? (
            <>
              <Trash2 size={20} />
              Delete {selectedProducts.size} Selected
            </>
          ) : (
            <>
              <Plus size={20} />
              Add Product
            </>
          )}
        </button>
      </div>

      {/* Bottom Row: Filters and Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc size={16} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at">Newest First</option>
              <option value="product_name">Name A-Z</option>
              <option value="product_id">Product ID</option>
            </select>
          </div>

          {/* Results Count */}
          <span className="text-sm text-gray-600">
            {totalProducts} product{totalProducts !== 1 ? 's' : ''}
          </span>
        </div>

        {/* View Toggle */}
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Grid size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}