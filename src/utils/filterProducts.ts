import { Product, FilterState } from '../config/categories';

export function filterProducts(products: Product[], filters: FilterState): Product[] {
  return products.filter(product => {
    if (filters.mainCategory && product.mainCategory !== filters.mainCategory) {
      return false;
    }

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const nameMatch = product.productName.toLowerCase().includes(searchLower);
      const descMatch = product.description?.toLowerCase().includes(searchLower);
      const tagMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!nameMatch && !descMatch && !tagMatch) {
        return false;
      }
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
