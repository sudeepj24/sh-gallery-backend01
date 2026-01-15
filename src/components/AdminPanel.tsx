import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Package, Settings, ExternalLink, GripVertical, ArrowUpDown, Upload } from 'lucide-react';
import ProductsManager from './admin/ProductsManager';
import BulkUpload from './admin/BulkUpload';
import CategoryManager from './CategoryManager';
import CategoryReorder from './CategoryReorder';
import ProductReorder from './ProductReorder';
import LoadingSpinner from './ui/LoadingSpinner';

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
  display_order: number;
  created_at: string;
}

interface Category {
  id: string;
  label: string;
  subcategories: any[];
  display_order: number;
}

export default function AdminPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'bulk-upload' | 'categories' | 'reorder-categories' | 'reorder-products'>('products');
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [categoriesRes, productsRes] = await Promise.all([
      supabase.from('categories').select('*').order('display_order', { ascending: true }),
      supabase.from('products').select('*').order('display_order', { ascending: true })
    ]);
    
    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (productsRes.data) setProducts(productsRes.data);
    setLoading(false);
  };

  const handleTabChange = (tab: 'products' | 'bulk-upload' | 'categories' | 'reorder-categories' | 'reorder-products') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading admin panel..." variant="gallery" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-xl border-b border-blue-200/30 z-30">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-4">
            <img src="/logo.webp" alt="Secure House" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-800 bg-clip-text text-transparent">Admin Panel</h1>
            </div>
          </div>
          
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-wide font-serif">SecureHouse Gallery</h2>
          </div>
          
          <a 
            href="/" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ExternalLink size={16} />
            View Gallery
          </a>
        </div>
      </div>

      <div className="flex pt-20 min-h-screen">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-20 bottom-0 w-72 bg-slate-100 shadow-xl border-r border-blue-200/30 flex flex-col z-20">
          {/* Navigation */}
          <nav className="flex-1 p-6">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-blue-600/70 uppercase tracking-wider mb-3">Gallery Management</h3>
            </div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabChange('products')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    activeTab === 'products'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:shadow-md hover:text-blue-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === 'products'
                      ? 'bg-white/20'
                      : 'bg-blue-100/50 group-hover:bg-blue-200/70'
                  }`}>
                    <Package size={18} />
                  </div>
                  <div>
                    <div className="font-medium">Products</div>
                    <div className={`text-xs ${
                      activeTab === 'products' ? 'text-white/70' : 'text-gray-500 group-hover:text-blue-600'
                    }`}>Manage inventory</div>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('bulk-upload')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    activeTab === 'bulk-upload'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:shadow-md hover:text-blue-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === 'bulk-upload'
                      ? 'bg-white/20'
                      : 'bg-blue-100/50 group-hover:bg-blue-200/70'
                  }`}>
                    <Upload size={18} />
                  </div>
                  <div>
                    <div className="font-medium">Bulk Upload</div>
                    <div className={`text-xs ${
                      activeTab === 'bulk-upload' ? 'text-white/70' : 'text-gray-500 group-hover:text-blue-600'
                    }`}>Mass import</div>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('categories')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    activeTab === 'categories'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:shadow-md hover:text-blue-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === 'categories'
                      ? 'bg-white/20'
                      : 'bg-blue-100/50 group-hover:bg-blue-200/70'
                  }`}>
                    <Settings size={18} />
                  </div>
                  <div>
                    <div className="font-medium">Categories</div>
                    <div className={`text-xs ${
                      activeTab === 'categories' ? 'text-white/70' : 'text-gray-500 group-hover:text-blue-600'
                    }`}>Manage filters</div>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('reorder-categories')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    activeTab === 'reorder-categories'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:shadow-md hover:text-blue-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === 'reorder-categories'
                      ? 'bg-white/20'
                      : 'bg-blue-100/50 group-hover:bg-blue-200/70'
                  }`}>
                    <GripVertical size={18} />
                  </div>
                  <div>
                    <div className="font-medium">Reorder Categories</div>
                    <div className={`text-xs ${
                      activeTab === 'reorder-categories' ? 'text-white/70' : 'text-gray-500 group-hover:text-blue-600'
                    }`}>Sort categories</div>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('reorder-products')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    activeTab === 'reorder-products'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:shadow-md hover:text-blue-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === 'reorder-products'
                      ? 'bg-white/20'
                      : 'bg-blue-100/50 group-hover:bg-blue-200/70'
                  }`}>
                    <ArrowUpDown size={18} />
                  </div>
                  <div>
                    <div className="font-medium">Reorder Products</div>
                    <div className={`text-xs ${
                      activeTab === 'reorder-products' ? 'text-white/70' : 'text-gray-500 group-hover:text-blue-600'
                    }`}>Sort products</div>
                  </div>
                </button>
              </li>
            </ul>
          </nav>

          {/* Logout Button (s) */}
          <div className="p-6 border-t border-blue-200/30">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-4 px-4 py-3 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-200 group hover:shadow-lg"
            >
              <div className="p-2 rounded-lg bg-red-50 group-hover:bg-white/20 transition-colors">
                <LogOut size={18} />
              </div>
              <div>
                <div className="font-medium">Logout</div>
                <div className="text-xs text-red-400 group-hover:text-white/70">Sign out</div>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-72 flex flex-col">
          <div className="flex-1">
            <div className="pt-4 px-10 pb-6">
              {activeTab === 'products' && (
                <ProductsManager
                  categories={categories}
                  onCategoriesChange={loadData}
                />
              )}

              {activeTab === 'bulk-upload' && (
                <BulkUpload
                  categories={categories}
                  onSuccess={loadData}
                />
              )}

              {activeTab === 'categories' && (
                <CategoryManager
                  categories={categories}
                  onSuccess={loadData}
                />
              )}

              {activeTab === 'reorder-categories' && (
                <CategoryReorder
                  categories={categories}
                  onDataUpdate={setCategories}
                />
              )}

              {activeTab === 'reorder-products' && (
                <ProductReorder
                  products={products}
                  categories={categories}
                  onDataUpdate={setProducts}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-t border-blue-200/30 py-6 mt-auto">
            <div className="px-10">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <span>© 2025 Secure House. All rights reserved.</span>
                <span className="mx-3 text-blue-300">•</span>
                <span>Developed by </span>
                <a 
                  href="https://thelotusroots.co.uk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium ml-1 transition-colors hover:underline"
                >
                  Lotus Roots Tech
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
