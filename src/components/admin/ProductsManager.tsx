import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ProductFilters from './ProductFilters';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import { useViewMode } from '../../hooks/useViewMode';

interface Product {
  id: string;
  product_id: string;
  filename: string;
  path: string;
  product_name: string;
  description: string;
  main_category: string;
  subcategories: Record<string, string>;
  tags: string[];
  created_at: string;
}

interface Category {
  id: string;
  label: string;
  subcategories: any[];
  display_order: number;
}

interface ProductsManagerProps {
  categories: Category[];
  onCategoriesChange: () => void;
}

export default function ProductsManager({ categories, onCategoriesChange }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [viewMode, setViewMode] = useViewMode('list');
  
  // Selection states
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product => {
        const nameMatch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
        const idMatch = product.product_id.toLowerCase().includes(searchTerm.toLowerCase());
        const descMatch = product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const tagMatch = product.tags && Array.isArray(product.tags) && 
          product.tags.some(tag => tag && tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return nameMatch || idMatch || descMatch || tagMatch;
      });
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.main_category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'product_name':
          return a.product_name.localeCompare(b.product_name);
        case 'product_id':
          return a.product_id.localeCompare(b.product_id);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const deleteProduct = async (id: string, imagePath: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      // Get the product to access the full path
      const product = products.find(p => p.id === id);
      
      // Extract the storage path from the full URL
      let storageFilePath = '';
      if (product?.path) {
        const match = product.path.match(/gallery-images\/(.+)$/);
        if (match) {
          storageFilePath = match[1];
        }
      }
      
      // Delete from database first
      const { error: dbError } = await supabase.from('products').delete().eq('id', id);
      if (dbError) {
        alert(`Failed to delete product: ${dbError.message}`);
        return;
      }
      
      // Delete from storage
      if (storageFilePath) {
        const { error: storageError } = await supabase.storage
          .from('gallery-images')
          .remove([storageFilePath]);
        
        if (storageError) {
          console.error('Storage deletion error:', storageError);
        }
      }
      
      // Update UI
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  const bulkDeleteProducts = async () => {
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    const productNames = selectedProductsList.map(p => `• ${p.product_name} (ID: ${p.product_id})`).join('\n');
    
    const confirmed = confirm(
      `Are you sure you want to delete ${selectedProducts.size} product(s)?\n\n${productNames}\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      // Delete from database first
      const { error: dbError } = await supabase
        .from('products')
        .delete()
        .in('id', Array.from(selectedProducts));
      
      if (dbError) {
        alert(`Failed to delete products: ${dbError.message}`);
        return;
      }
      
      // Delete images from storage
      for (const product of selectedProductsList) {
        let storageFilePath = '';
        if (product.path) {
          const match = product.path.match(/gallery-images\/(.+)$/);
          if (match) {
            storageFilePath = match[1];
          }
        }
        
        if (storageFilePath) {
          const { error: storageError } = await supabase.storage
            .from('gallery-images')
            .remove([storageFilePath]);
          
          if (storageError) {
            console.error('Storage deletion error:', storageError);
          }
        }
      }
      
      // Update UI
      setProducts(products.filter(p => !selectedProducts.has(p.id)));
      setSelectedProducts(new Set());
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Error deleting products. Please try again.');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        categories={categories}
        totalProducts={filteredProducts.length}
        onAddProduct={() => setShowAddForm(true)}
        selectedProducts={selectedProducts}
        onBulkDelete={bulkDeleteProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <ProductList
        products={paginatedProducts}
        viewMode={viewMode}
        categories={categories}
        onEditProduct={setEditingProduct}
        onDeleteProduct={deleteProduct}
        selectedProducts={selectedProducts}
        onProductSelect={(productId, selected) => {
          const newSelected = new Set(selectedProducts);
          if (selected) {
            newSelected.add(productId);
          } else {
            newSelected.delete(productId);
          }
          setSelectedProducts(newSelected);
        }}
        onSelectAll={(selected) => {
          if (selected) {
            setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
          } else {
            setSelectedProducts(new Set());
          }
        }}
      />

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200/50 flex justify-center">
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 text-xs"
                title="First page"
              >
                ««
              </button>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200"
                title="Previous page"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {totalPages > 10 ? (
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 px-2 py-1 text-sm border border-gray-200 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(1, currentPage - 2);
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 py-1 text-sm border rounded transition-all duration-200 ${
                        page === currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })
              )}
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200"
                title="Next page"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 text-xs"
                title="Last page"
              >
                »»
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forms */}
      {showAddForm && (
        <ProductForm
          categories={categories}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            loadProducts();
            onCategoriesChange();
          }}
        />
      )}

      {editingProduct && (
        <ProductForm
          categories={categories}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            loadProducts();
            onCategoriesChange();
          }}
        />
      )}
    </div>
  );
}