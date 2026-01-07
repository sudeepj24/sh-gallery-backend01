import React, { useState } from 'react';
import GenericReorder from './reorder/GenericReorder';
import { ReorderConfig } from './reorder/types';

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

interface ProductReorderProps {
  products: Product[];
  categories: Category[];
  onDataUpdate: (updatedProducts: Product[]) => void;
}

export default function ProductReorder({ products, categories, onDataUpdate }: ProductReorderProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const config: ReorderConfig<Product> = {
    title: 'Reorder Products',
    tableName: 'products',
    displayField: 'product_name',
    idField: 'id',
    orderField: 'display_order',
    emptyMessage: 'No products to reorder',
    emptySubMessage: 'Add some products first to use this feature.',
    dragMessage: 'Drag products to reorder them. The order here determines how they appear in your gallery.'
  };

  // Filter products by selected category
  const filteredProducts = selectedCategory 
    ? products.filter(product => product.main_category === selectedCategory)
    : products;

  const renderProductItem = (product: Product, index: number) => (
    <div className="flex items-center gap-4">
      <div className="flex items-center text-gray-400 hover:text-gray-600">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="12" r="1"/>
          <circle cx="9" cy="5" r="1"/>
          <circle cx="9" cy="19" r="1"/>
          <circle cx="15" cy="12" r="1"/>
          <circle cx="15" cy="5" r="1"/>
          <circle cx="15" cy="19" r="1"/>
        </svg>
      </div>
      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">
        #{index + 1}
      </span>
      {product.path && (
        <img 
          src={product.path} 
          alt={product.product_name}
          className="w-12 h-12 object-cover rounded border"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{product.product_name}</h3>
        <p className="text-sm text-gray-600">ID: {product.product_id}</p>
      </div>
    </div>
  );

  const filterComponent = (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">
          Filter by Category:
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">All Categories ({products.length} products)</option>
          {categories.map(category => {
            const categoryProductCount = products.filter(p => p.main_category === category.id).length;
            return (
              <option key={category.id} value={category.id}>
                {category.label} ({categoryProductCount} products)
              </option>
            );
          })}
        </select>
        {selectedCategory && (
          <span className="text-sm text-gray-600">
            Showing {filteredProducts.length} products
          </span>
        )}
      </div>
    </div>
  );

  return (
    <GenericReorder
      items={filteredProducts}
      config={config}
      onDataUpdate={onDataUpdate}
      renderItem={renderProductItem}
      filterComponent={filterComponent}
      context="products"
    />
  );
}