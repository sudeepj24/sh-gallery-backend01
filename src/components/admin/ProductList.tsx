import React from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight, Package } from 'lucide-react';

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
}

interface ProductListProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  categories: Category[];
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string, path: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedProducts: Set<string>;
  onProductSelect: (productId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

export default function ProductList({
  products,
  viewMode,
  categories,
  onEditProduct,
  onDeleteProduct,
  currentPage,
  totalPages,
  onPageChange,
  selectedProducts,
  onProductSelect,
  onSelectAll
}: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-xl">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="text-gray-400" size={24} />
        </div>
        <div className="text-gray-600 mb-2 font-medium">No products found</div>
        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Products */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductGridCard
              key={product.id}
              product={product}
              categories={categories}
              onEdit={() => onEditProduct(product)}
              onDelete={() => onDeleteProduct(product.id, product.path)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && products.every(p => selectedProducts.has(p.id))}
                      onChange={(e) => onSelectAll(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Product</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Category</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Tags</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <ProductListRow
                    key={product.id}
                    product={product}
                    categories={categories}
                    onEdit={() => onEditProduct(product)}
                    onDelete={() => onDeleteProduct(product.id, product.path)}
                    selected={selectedProducts.has(product.id)}
                    onSelect={(selected) => onProductSelect(product.id, selected)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white/95 backdrop-blur-md px-6 py-4 border border-gray-200/50 rounded-2xl shadow-xl">
          <div className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + Math.max(1, currentPage - 2);
              if (page > totalPages) return null;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-4 py-2.5 border rounded-xl font-medium transition-all duration-200 ${
                    page === currentPage
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg'
                      : 'border-gray-200 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2.5 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductGridCard({ product, categories, onEdit, onDelete }: {
  product: Product;
  categories: Category[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200/50 overflow-hidden group hover:-translate-y-1">
      <div className="aspect-square overflow-hidden">
        <img
          src={product.path}
          alt={product.product_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
            {product.product_name}
          </h3>
          <span className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1.5 rounded-full font-mono ml-3 border">
            #{product.product_id}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1.5 rounded-full font-medium border border-blue-200">
            {categories.find(c => c.id === product.main_category)?.label || product.main_category}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {product.tags && product.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border">
              {tag}
            </span>
          ))}
          {product.tags && product.tags.length > 3 && (
            <span className="text-xs text-gray-500 font-medium">+{product.tags.length - 3} more</span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 border hover:shadow-md"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center transition-all duration-200 border border-red-200 hover:shadow-md"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductListRow({ product, categories, onEdit, onDelete, selected, onSelect }: {
  product: Product;
  categories: Category[];
  onEdit: () => void;
  onDelete: () => void;
  selected: boolean;
  onSelect: (selected: boolean) => void;
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200">
      <td className="py-4 px-6">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200">
            <img
              src={product.path}
              alt={product.product_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{product.product_name}</div>
            <div className="text-sm text-gray-500 line-clamp-1 mt-1">{product.description}</div>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <span className="font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-full border">#{product.product_id}</span>
      </td>
      <td className="py-4 px-6">
        <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1.5 rounded-full font-medium border border-blue-200">
          {categories.find(c => c.id === product.main_category)?.label || product.main_category}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex flex-wrap gap-1">
          {product.tags && product.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full border">
              {tag}
            </span>
          ))}
          {product.tags && product.tags.length > 2 && (
            <span className="text-xs text-gray-500 font-medium">+{product.tags.length - 2}</span>
          )}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 py-2 px-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-200 border hover:shadow-md"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center transition-all duration-200 border border-red-200 hover:shadow-md"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}