import React, { useEffect, useState } from 'react';
import { ChevronLeft, Upload, Edit3 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Category, CompressedFile, BulkMetadata, BulkProduct } from './types';

interface ProductPreviewProps {
  category: Category;
  files: CompressedFile[];
  idStrategy: 'sequential' | 'custom';
  startingNumber: number;
  bulkMetadata: BulkMetadata;
  products: BulkProduct[];
  onProductsGenerated: (products: BulkProduct[]) => void;
  onProductUpdate: (products: BulkProduct[]) => void;
  onUpload: () => void;
  onBack: () => void;
}

export default function ProductPreview({
  category,
  files,
  idStrategy,
  startingNumber,
  bulkMetadata,
  products,
  onProductsGenerated,
  onProductUpdate,
  onUpload,
  onBack
}: ProductPreviewProps) {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    // Only regenerate if products don't match files (not a retry scenario)
    if (products.length === 0 || products.length !== files.length) {
      generateProducts();
    }
  }, [files, idStrategy, startingNumber, bulkMetadata, category]);

  const generateProducts = async () => {
    if (files.length === 0) return;
    
    // Skip regeneration if we already have products (retry scenario)
    if (products.length > 0 && products.length === files.length) {
      return;
    }

    setValidating(true);
    
    let startId = startingNumber;
    if (idStrategy === 'sequential') {
      const { data } = await supabase
        .from('products')
        .select('product_id')
        .eq('main_category', category.id);

      if (data) {
        const numbers = data
          .map(p => {
            const match = p.product_id.match(/(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(n => n > 0);
        
        startId = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
      }
    }

    const generatedProducts: BulkProduct[] = files.map((file, index) => {
      const productId = String(startId + index).padStart(3, '0');
      const productName = `${category.label} ${productId}`;
      
      return {
        id: `bulk-${Date.now()}-${index}`,
        productId,
        productName,
        description: bulkMetadata.description,
        tags: bulkMetadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        subcategories: { ...bulkMetadata.subcategories },
        categoryId: category.id,
        file
      };
    });

    await validateProducts(generatedProducts);
    onProductsGenerated(generatedProducts);
    setValidating(false);
  };

  const validateProducts = async (productsToValidate: BulkProduct[]) => {
    // Validation removed - database will handle duplicates during upload
    onProductUpdate(productsToValidate);
  };

  const updateProduct = (productId: string, field: string, value: any) => {
    const updatedProducts = products.map(p => 
      p.id === productId ? { 
        ...p, 
        [field]: field === 'tags' ? value.split(',').map((tag: string) => tag.trim()).filter(Boolean) : value
      } : p
    );
    onProductUpdate(updatedProducts);
    validateProducts(updatedProducts);
  };

  const updateSubcategory = (productId: string, subcatId: string, value: string) => {
    const updatedProducts = products.map(p => 
      p.id === productId ? {
        ...p,
        subcategories: { ...p.subcategories, [subcatId]: value }
      } : p
    );
    onProductUpdate(updatedProducts);
  };

  const canUpload = products.length > 0 && !validating;

  if (validating) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Generating products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Preview Products ({products.length})</h3>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Image</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Product ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Product Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tags</th>
                {category.subcategories.map(subcat => (
                  <th key={subcat.id} className="text-left py-3 px-4 font-medium text-gray-700">{subcat.label}</th>
                ))}
                <th className="text-center py-3 px-4 font-medium text-gray-700">Edit</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <img
                      src={product.file.preview}
                      alt={product.productName}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="py-3 px-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={product.productId}
                        onChange={(e) => updateProduct(product.id, 'productId', e.target.value)}
                        className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="font-mono text-sm">
                        {product.productId}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={product.productName}
                        onChange={(e) => updateProduct(product.id, 'productName', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="text-sm">{product.productName}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingProduct === product.id ? (
                      <textarea
                        value={product.description}
                        onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        rows={2}
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{product.description || '-'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingProduct === product.id ? (
                      <input
                        type="text"
                        value={product.tags.join(', ')}
                        onChange={(e) => updateProduct(product.id, 'tags', e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        placeholder="tag1, tag2"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                        {product.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{product.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </td>
                  {category.subcategories.map(subcat => (
                    <td key={subcat.id} className="py-3 px-4">
                      {editingProduct === product.id ? (
                        <select
                          value={product.subcategories[subcat.id] || ''}
                          onChange={(e) => updateSubcategory(product.id, subcat.id, e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="">Select</option>
                          {subcat.options.map(option => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {(() => {
                            const option = subcat.options.find(o => o.id === product.subcategories[subcat.id]);
                            return option ? option.label : '-';
                          })()}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setEditingProduct(editingProduct === product.id ? null : product.id)}
                      className={`p-1 ${editingProduct === product.id ? 'text-green-600 hover:text-green-800' : 'text-gray-600 hover:text-gray-800'}`}
                      title={editingProduct === product.id ? 'Done editing' : 'Edit product'}
                    >
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          onClick={onUpload}
          disabled={!canUpload}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Upload size={16} />
          Upload {products.length} Products
        </button>
      </div>
    </div>
  );
}