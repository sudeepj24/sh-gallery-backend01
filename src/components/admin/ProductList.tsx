import React from 'react';
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

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
      <div className="text-center py-12 bg-white rounded-lg border">
        <div className="text-gray-500 mb-4">No products found</div>
        <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && products.every(p => selectedProducts.has(p.id))}
                      onChange={(e) => onSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Tags</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
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
        <div className="flex items-center justify-between bg-white px-4 py-3 border rounded-lg">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                  className={`px-3 py-2 border rounded-lg ${
                    page === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border">
      <div className="aspect-square overflow-hidden rounded-t-lg">
        <img
          src={product.path}
          alt={product.product_name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {product.product_name}
          </h3>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono ml-2">
            #{product.product_id}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {categories.find(c => c.id === product.main_category)?.label || product.main_category}
          </span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags && product.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {product.tags && product.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{product.tags.length - 3}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm flex items-center justify-center gap-1"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded text-sm flex items-center justify-center"
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
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300"
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <img
            src={product.path}
            alt={product.product_name}
            className="w-12 h-12 object-cover rounded"
          />
          <div>
            <div className="font-medium text-gray-900">{product.product_name}</div>
            <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="font-mono text-sm">#{product.product_id}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {categories.find(c => c.id === product.main_category)?.label || product.main_category}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {product.tags && product.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {product.tags && product.tags.length > 2 && (
            <span className="text-xs text-gray-500">+{product.tags.length - 2}</span>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-1 text-gray-600 hover:text-blue-600"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-600 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}