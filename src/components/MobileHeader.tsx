import { Filter, Search } from 'lucide-react';
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
    <div className="lg:hidden sticky top-0 z-30 bg-[#6B635C] border-b border-[#6B635C] shadow-lg">
      <div className="px-2 pt-2 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src="/logo.webp" alt="Secure House" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-white">Secure House Gallery</h1>
              <p className="text-sm text-slate-300">
                <span className="text-[#D4C4B0] font-semibold">{productCount}</span> of <span className="text-[#D4C4B0] font-semibold">{totalCount}</span> products
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenFilters}
              className="flex items-center gap-2 px-4 py-2 bg-[#A0947F] text-white rounded-lg font-medium hover:bg-[#8B7F6F] transition-colors shadow-md"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="mb-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={filters.searchTerm || ''}
              onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A0947F] focus:border-transparent bg-white text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-medium text-[#F5F1ED] whitespace-nowrap">Product Type</h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleMainCategoryClick(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filters.mainCategory === category.id
                    ? 'bg-[#A0947F] text-white shadow-md'
                    : 'bg-white/90 text-[#5A524A] hover:bg-white hover:shadow-sm'
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