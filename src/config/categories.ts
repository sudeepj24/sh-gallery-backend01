export interface MainCategory {
  id: string;
  label: string;
  subcategories: SubcategoryGroup[];
}

export interface SubcategoryGroup {
  id: string;
  label: string;
  options: SubcategoryOption[];
}

export interface SubcategoryOption {
  id: string;
  label: string;
}

// This will be populated dynamically from Supabase
export let MAIN_CATEGORIES: MainCategory[] = [];

// Function to load categories from Supabase
export const loadCategories = async () => {
  const { supabase } = await import('../lib/supabase');
  const { data } = await supabase.from('categories').select('*');
  if (data) {
    MAIN_CATEGORIES = data;
  }
  return MAIN_CATEGORIES;
};

export interface Product {
  id: string;
  filename: string;
  path: string;
  productName: string;
  description: string;
  mainCategory: string;
  subcategories: Record<string, string>;
  tags: string[];
}

export interface FilterState {
  mainCategory: string | null;
  subcategoryFilters: Record<string, string[]>;
  searchTerm?: string;
}
