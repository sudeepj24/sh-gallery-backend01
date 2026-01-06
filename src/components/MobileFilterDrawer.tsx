import { X, Filter } from 'lucide-react';
import { MainCategory, FilterState } from '../config/categories';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: MainCategory[];
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  categories
}: MobileFilterDrawerProps) {
  const selectedCategory = categories.find(cat => cat.id === filters.mainCategory);

  const handleSubcategoryToggle = (groupId: string, optionId: string) => {
    const currentFilters = filters.subcategoryFilters[groupId] || [];
    const newFilters = currentFilters.includes(optionId)
      ? currentFilters.filter(id => id !== optionId)
      : [...currentFilters, optionId];

    onFilterChange({
      ...filters,
      subcategoryFilters: {
        ...filters.subcategoryFilters,
        [groupId]: newFilters
      }
    });
  };

  const clearAllFilters = () => {
    onFilterChange({ mainCategory: null, subcategoryFilters: {} });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl z-50 max-h-[85vh] overflow-hidden flex flex-col lg:hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedCategory && selectedCategory.subcategories.length > 0 ? (
            <div className="space-y-6">
              {selectedCategory.subcategories.map(group => (
                <div key={group.id}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    {group.label}
                  </h3>
                  <div className="space-y-2">
                    {group.options.map(option => {
                      const isSelected = (filters.subcategoryFilters[group.id] || []).includes(option.id);
                      return (
                        <label
                          key={option.id}
                          className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSubcategoryToggle(group.id, option.id)}
                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
                          />
                          <span className="ml-3 text-sm text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500 text-center">
                {filters.mainCategory 
                  ? 'No additional filters available for this category'
                  : 'Select a product type to see additional filters'
                }
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={clearAllFilters}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
