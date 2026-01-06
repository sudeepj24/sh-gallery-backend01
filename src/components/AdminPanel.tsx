import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Package, Settings, ExternalLink } from 'lucide-react';
import ProductsManager from './admin/ProductsManager';
import CategoryManager from './CategoryManager';

interface Category {
  id: string;
  label: string;
  subcategories: any[];
  display_order: number;
}

export default function AdminPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [loading, setLoading] = useState(true);
  const { signOut } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (data) setCategories(data);
    setLoading(false);
  };

  const handleTabChange = (tab: 'products' | 'categories') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-lg">Loading admin panel...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-30">
        <div className="flex items-center justify-between px-6 py-2">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <h2 className="text-lg font-semibold text-gray-700">SecureHouse Gallery</h2>
          <a 
            href="/" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg transition-colors"
          >
            <ExternalLink size={16} />
            View Gallery
          </a>
        </div>
      </div>

      <div className="flex pt-16 h-screen">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-sm border-r flex flex-col z-20">
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleTabChange('products')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'products'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Package size={20} />
                  Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleTabChange('categories')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === 'categories'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={20} />
                  Categories & Filters
                </button>
              </li>
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-2 border-t">
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 flex flex-col">
          <div className="flex-1">
            <div className="pt-6 px-8 pb-20">
              {activeTab === 'products' && (
                <ProductsManager
                  categories={categories}
                  onCategoriesChange={loadCategories}
                />
              )}

              {activeTab === 'categories' && (
                <CategoryManager
                  categories={categories}
                  onSuccess={loadCategories}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-white border-t py-4 mt-auto">
            <div className="px-8">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <span>© 2025 Secure House. All rights reserved.</span>
                <span className="mx-2">•</span>
                <span>Developed by </span>
                <a 
                  href="https://thelotusroots.co.uk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium ml-1 transition-colors"
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
