import { X } from 'lucide-react';
import { MainCategory, FilterState } from '../config/categories';

interface DesktopSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: MainCategory[];
}

export default function DesktopSidebar({ filters, onFilterChange, categories }: DesktopSidebarProps) {
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

  const clearSubcategoryFilters = () => {
    onFilterChange({ ...filters, subcategoryFilters: {} });
  };

  const hasSubcategoryFilters = Object.values(filters.subcategoryFilters).some(arr => arr.length > 0);

  return (
    <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-slate-200 h-[calc(100vh-140px)] sticky top-[140px] overflow-y-auto shadow-lg">
      <div className="p-6">
        {selectedCategory && selectedCategory.subcategories.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Filters</h3>
              {hasSubcategoryFilters && (
                <button
                  onClick={clearSubcategoryFilters}
                  className="text-xs text-gray-600 hover:text-gray-900 underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {selectedCategory.subcategories.map(group => (
              <div key={group.id}>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  {group.label}
                </h4>
                <div className="space-y-2">
                  {group.options.map(option => {
                    const isSelected = (filters.subcategoryFilters[group.id] || []).includes(option.id);
                    return (
                      <label
                        key={option.id}
                        className="flex items-center cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSubcategoryToggle(group.id, option.id)}
                          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 focus:ring-2"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {hasSubcategoryFilters && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Active Filters</h4>
                <div className="space-y-2">
                  {Object.entries(filters.subcategoryFilters).map(([groupId, selectedOptions]) =>
                    selectedOptions.map(optionId => {
                      const group = selectedCategory?.subcategories.find(g => g.id === groupId);
                      const option = group?.options.find(o => o.id === optionId);
                      return (
                        <div
                          key={`${groupId}-${optionId}`}
                          className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg"
                        >
                          <span className="text-sm text-gray-700">{option?.label}</span>
                          <button
                            onClick={() => handleSubcategoryToggle(groupId, optionId)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 text-center text-sm">
              {filters.mainCategory 
                ? 'No additional filters available for this category'
                : 'Select a product type to see filters'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}