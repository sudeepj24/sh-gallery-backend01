import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { MainCategory, FilterState } from '../config/categories';

interface DesktopHeaderProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  productCount: number;
  totalCount: number;
  categories: MainCategory[];
}

export default function DesktopHeader({ filters, onFilterChange, productCount, totalCount, categories }: DesktopHeaderProps) {
  const handleMainCategoryClick = (categoryId: string) => {
    if (filters.mainCategory === categoryId) {
      onFilterChange({ ...filters, mainCategory: null, subcategoryFilters: {} });
    } else {
      onFilterChange({ ...filters, mainCategory: categoryId, subcategoryFilters: {} });
    }
  };

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById('category-scroll');
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-[#847B73] border-b border-[#6B635C] fixed top-0 left-0 right-0 z-40 shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-3">
            <a href="/" className="cursor-pointer">
              <img src="/logo.webp" alt="Secure House" className="h-12 w-auto" />
            </a>
            <h1 className="text-2xl font-bold text-white tracking-tight font-serif ml-64">Secure House Products Gallery</h1>
          </div>
          
          <div className="flex-1 flex items-center justify-end gap-6">
            <div className="relative w-96">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={filters.searchTerm || ''}
                onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A0947F] focus:border-transparent bg-white text-sm shadow-sm"
              />
            </div>
            
            <div className="text-sm text-white font-medium whitespace-nowrap bg-[#6B635C]/50 px-4 py-2 rounded-lg">
              Showing <span className="text-[#FFD700] font-bold">{productCount}</span> of{' '}
              <span className="text-[#FFD700] font-bold">{totalCount}</span> products
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-base font-medium text-[#F5F1ED] whitespace-nowrap flex items-center">
            Product Type
          </label>
          <button
            onClick={() => scrollContainer('left')}
            className="bg-[#6B635C] hover:bg-[#5A524A] text-white p-1.5 rounded-md transition-colors flex-shrink-0"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 overflow-hidden">
            <div id="category-scroll" className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleMainCategoryClick(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    filters.mainCategory === category.id
                      ? 'bg-[#D4AF37] text-white shadow-lg'
                      : 'bg-white/90 text-[#5A524A] hover:bg-white hover:shadow-md'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => scrollContainer('right')}
            className="bg-[#6B635C] hover:bg-[#5A524A] text-white p-1.5 rounded-md transition-colors flex-shrink-0"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}