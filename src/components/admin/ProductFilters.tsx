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
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
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
  onBulkDelete,
  currentPage,
  totalPages,
  onPageChange
}: ProductFiltersProps) {
  return (
    <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200/50 space-y-6">
      {/* Top Row: Search and Add Button */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search products by name, ID, description, or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50/50 transition-all duration-200 placeholder-gray-500"
          />
        </div>
        <button
          onClick={selectedProducts.size > 0 ? onBulkDelete : onAddProduct}
          className={`px-6 py-3 rounded-xl flex items-center gap-3 whitespace-nowrap font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
            selectedProducts.size > 0
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
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
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="appearance-none bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 font-medium"
            >
              <option value="created_at">Newest First</option>
              <option value="product_name">Name A-Z</option>
              <option value="product_id">Product ID</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Results Count */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
            <span className="text-sm font-medium text-blue-700">
              {totalProducts} product{totalProducts !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 text-xs"
                  title="First page"
                >
                  ««
                </button>
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200"
                  title="Previous page"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Page input for large page counts */}
                {totalPages > 10 ? (
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        onPageChange(page);
                      }
                    }}
                    className="w-16 px-2 py-1 text-sm border border-gray-200 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  /* Page numbers for smaller page counts */
                  Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, currentPage - 2);
                    if (page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-2 py-1 text-sm border rounded transition-all duration-200 ${
                          page === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })
                )}
                
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200"
                  title="Next page"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 text-xs"
                  title="Last page"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 border border-gray-200 rounded-xl overflow-hidden p-1">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              viewMode === 'grid' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Grid size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}