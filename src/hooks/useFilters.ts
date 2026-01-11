import { useState, useEffect } from 'react';
import { FilterState } from '../config/categories';

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>({
    mainCategory: null,
    subcategoryFilters: {},
    searchTerm: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mainCategory = params.get('category');
    const searchTerm = params.get('search') || '';
    const subcategoryFilters: Record<string, string[]> = {};

    params.forEach((value, key) => {
      if (key !== 'category' && key !== 'search' && key.startsWith('filter_')) {
        const filterKey = key.replace('filter_', '');
        subcategoryFilters[filterKey] = value.split(',').filter(Boolean);
      }
    });

    setFilters({
      mainCategory,
      subcategoryFilters,
      searchTerm
    });
  }, []);

  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);

    const params = new URLSearchParams();

    if (newFilters.mainCategory) {
      params.set('category', newFilters.mainCategory);
    }

    if (newFilters.searchTerm) {
      params.set('search', newFilters.searchTerm);
    }

    Object.entries(newFilters.subcategoryFilters).forEach(([key, values]) => {
      if (values.length > 0) {
        params.set(`filter_${key}`, values.join(','));
      }
    });

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    window.history.pushState({}, '', newUrl);
  };

  return { filters, updateFilters };
}
