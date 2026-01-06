import { Filter } from 'lucide-react';
import { MainCategory, FilterState } from '../config/categories';

interface MobileHeaderProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onOpenFilters: () => void;
  productCount: number;
  totalCount: number;
  categories: MainCategory[];
}

export default function MobileHeader({ 
  filters, 
  onFilterChange, 
  onOpenFilters, 
  productCount, 
  totalCount,
  categories
}: MobileHeaderProps) {
  const handleMainCategoryClick = (categoryId: string) => {
    if (filters.mainCategory === categoryId) {
      onFilterChange({ mainCategory: null, subcategoryFilters: {} });
    } else {
      onFilterChange({ mainCategory: categoryId, subcategoryFilters: {} });
    }
    // Scroll to top when changing categories
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lg:hidden sticky top-0 z-30 bg-gradient-to-r from-slate-900 to-blue-900 border-b border-slate-700 shadow-lg">
      <div className="px-2 pt-2 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Secure House Gallery</h1>
            <p className="text-sm text-slate-300">
              <span className="text-blue-300 font-semibold">{productCount}</span> of <span className="text-blue-300 font-semibold">{totalCount}</span> products
            </p>
          </div>
          <button
            onClick={onOpenFilters}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div>
          <h3 className="text-sm font-medium text-slate-200 mb-2">Product Type</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleMainCategoryClick(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filters.mainCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white/90 text-slate-700 hover:bg-white hover:shadow-sm'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}