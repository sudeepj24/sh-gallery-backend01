import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DesktopHeader from './components/DesktopHeader';
import DesktopSidebar from './components/DesktopSidebar';
import MobileHeader from './components/MobileHeader';
import MobileFilterDrawer from './components/MobileFilterDrawer';
import ProductGrid from './components/ProductGrid';
import Lightbox from './components/Lightbox';
import AdminPanel from './components/AdminPanel';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { useFilters } from './hooks/useFilters';
import { filterProducts } from './utils/filterProducts';
import { Product, MainCategory } from './config/categories';
import { supabase } from './lib/supabase';

function Gallery() {
  const { filters, updateFilters } = useFilters();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from('products').select('*').order('display_order', { ascending: true }),
      supabase.from('categories').select('*').order('display_order', { ascending: true })
    ]);
    
    if (productsRes.data) {
      // Transform Supabase data to match existing Product interface
      const transformedProducts = productsRes.data.map(item => ({
        id: item.product_id || item.id, // Use product_id if available, fallback to database id
        filename: item.filename,
        path: item.path,
        productName: item.product_name,
        description: item.description,
        mainCategory: item.main_category,
        subcategories: item.subcategories,
        tags: item.tags,
        display_order: item.display_order || 999
      }));
      setAllProducts(transformedProducts);
    }
    
    if (categoriesRes.data) {
      setCategories(categoriesRes.data);
    }
    
    setLoading(false);
  };

  const filteredProducts = filterProducts(allProducts, filters);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleLightboxNavigate = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseLightbox = () => {
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg">Loading gallery...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <DesktopHeader
          filters={filters}
          onFilterChange={updateFilters}
          productCount={filteredProducts.length}
          totalCount={allProducts.length}
          categories={categories}
        />
      </div>

      <div className="flex lg:pt-[140px]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <DesktopSidebar
            filters={filters}
            onFilterChange={updateFilters}
            categories={categories}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Header */}
          <MobileHeader
            filters={filters}
            onFilterChange={updateFilters}
            onOpenFilters={() => setIsMobileFilterOpen(true)}
            productCount={filteredProducts.length}
            totalCount={allProducts.length}
            categories={categories}
          />

          {/* Mobile Filter Drawer */}
          <MobileFilterDrawer
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
            filters={filters}
            onFilterChange={updateFilters}
            categories={categories}
          />

          {/* Product Grid */}
          <main className="px-4 sm:px-6 lg:px-8 py-8">
            <ProductGrid
              products={filteredProducts}
              onProductClick={handleProductClick}
            />
          </main>
        </div>
      </div>

      {/* Lightbox */}
      {selectedProduct && (
        <Lightbox
          product={selectedProduct}
          allProducts={filteredProducts}
          onClose={handleCloseLightbox}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/sh-login-uri" element={<LoginForm />} />
          <Route 
            path="/sh-admin-uri" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
