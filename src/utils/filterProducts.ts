import { Product, FilterState } from '../config/categories';

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter(product => {
    if (filters.mainCategory && product.mainCategory !== filters.mainCategory) {
      return false;
    }

    for (const [filterKey, filterValues] of Object.entries(filters.subcategoryFilters)) {
      if (filterValues.length === 0) continue;

      const productValue = product.subcategories[filterKey];
      if (!productValue || !filterValues.includes(productValue)) {
        return false;
      }
    }

    return true;
  });
}
