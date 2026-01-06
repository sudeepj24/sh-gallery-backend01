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
      onFilterChange({ mainCategory: null, subcategoryFilters: {} });
    } else {
      onFilterChange({ mainCategory: categoryId, subcategoryFilters: {} });
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-blue-900 border-b border-slate-700 fixed top-0 left-0 right-0 z-40 shadow-lg">
      <div className="px-6 py-4">
        <div className="relative flex items-center justify-end mb-4">
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-white">Secure House Products Gallery</h1>
          <div className="text-sm text-slate-300">
            Showing <span className="font-semibold text-blue-300">{productCount}</span> of{' '}
            <span className="font-semibold text-blue-300">{totalCount}</span> products
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Product Type
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleMainCategoryClick(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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