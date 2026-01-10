import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, Plus } from 'lucide-react';
import { compressImage, CompressionProgress } from '../../utils/imageCompression';
import ImageUploadProgress from '../ui/ImageUploadProgress';

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
  subcategories: SubcategoryGroup[];
  display_order: number;
}

interface SubcategoryGroup {
  id: string;
  label: string;
  options: SubcategoryOption[];
}

interface SubcategoryOption {
  id: string;
  label: string;
}

interface ProductFormProps {
  categories: Category[];
  product?: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductForm({ categories, product, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    product_id: product?.product_id || '',
    product_name: product?.product_name || '',
    description: product?.description || '',
    main_category: product?.main_category || '',
    subcategories: product?.subcategories || {},
    tags: product?.tags.join(', ') || ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(product?.path || '');
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [compressionProgress, setCompressionProgress] = useState<CompressionProgress>({ progress: 0, message: '' });
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionError, setCompressionError] = useState<string>('');

  const selectedCategory = categories.find(c => c.id === formData.main_category);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsCompressing(true);
    setCompressionError('');
    setFile(null);
    setImagePreview('');

    try {
      const result = await compressImage(selectedFile, (progress) => {
        setCompressionProgress(progress);
      });

      if (result.success && result.file) {
        setFile(result.file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(result.file);
      } else {
        setCompressionError(result.error || 'Failed to process image');
      }
    } catch (error) {
      setCompressionError('Failed to process image. Please try again.');
    } finally {
      setIsCompressing(false);
    }
  };

  const addNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    const categoryData = {
      id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      label: newCategoryName,
      subcategories: []
    };

    const { error } = await supabase.from('categories').insert(categoryData);
    if (!error) {
      setFormData({ ...formData, main_category: categoryData.id });
      setShowNewCategoryForm(false);
      setNewCategoryName('');
      onSuccess();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      // Check for duplicate Product ID
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id, product_id')
        .eq('product_id', formData.product_id);

      // If editing, exclude current product from duplicate check
      const duplicates = existingProducts?.filter(prod => 
        product ? prod.id !== product.id : true
      );

      if (duplicates && duplicates.length > 0) {
        alert(`Product ID "${formData.product_id}" already exists. Please choose a different ID.`);
        setUploading(false);
        return;
      }

      let imagePath = product?.path || '';
      
      if (file) {
        // If updating and there's an old image, delete it first
        if (product?.path) {
          const match = product.path.match(/gallery-images\/(.+)$/);
          if (match) {
            const oldStorageFilePath = match[1];
            const { error: deleteError } = await supabase.storage
              .from('gallery-images')
              .remove([oldStorageFilePath]);
            
            if (deleteError) {
              console.error('Error deleting old image:', deleteError);
            }
          }
        }
        
        const fileExt = file.type === 'image/webp' ? 'webp' : 'jpg';
        const fileName = `${formData.main_category}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(fileName);

        imagePath = publicUrl;
      }

      const productData = {
        id: product?.id || `product-${Date.now()}`,
        product_id: formData.product_id,
        filename: file?.name || product?.filename || '',
        path: imagePath,
        product_name: formData.product_name,
        description: formData.description,
        main_category: formData.main_category,
        subcategories: formData.subcategories,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        display_order: product?.display_order || 999
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50 animate-slide-up">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {product ? 'Update product information' : 'Create a new product entry'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200/50">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Product Image {!product && <span className="text-red-500">*</span>}
              </label>
              {imagePreview && (
                <div className="mb-4">
                  <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!product}
                disabled={isCompressing || Boolean(compressionError)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 disabled:bg-gray-100 bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              
              <ImageUploadProgress 
                progress={compressionProgress.progress}
                message={compressionProgress.message}
                show={isCompressing}
              />
              
              {compressionError && (
                <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 font-medium">{compressionError}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 001, 002"
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter product name"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                rows={3}
                placeholder="Enter product description"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Main Category <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <select
                    required
                    value={formData.main_category}
                    onChange={(e) => setFormData({...formData, main_category: e.target.value, subcategories: {}})}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryForm(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Plus size={16} />
                  New
                </button>
              </div>
              
              {showNewCategoryForm && (
                <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="New category name"
                    />
                    <button
                      type="button"
                      onClick={addNewCategory}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryForm(false)}
                      className="text-gray-600 hover:text-gray-800 px-2 rounded-xl hover:bg-white/50 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Subcategories/Filters */}
            {selectedCategory?.subcategories.map(subcat => (
              <div key={subcat.id}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {subcat.label}
                </label>
                <div className="relative">
                  <select
                    value={formData.subcategories[subcat.id] || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      subcategories: {
                        ...formData.subcategories,
                        [subcat.id]: e.target.value
                      }
                    })}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 pr-10 bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select {subcat.label.toLowerCase()}</option>
                    {subcat.options.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="security, residential, modern (comma separated)"
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={uploading || isCompressing || (Boolean(compressionError) && !product)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
              >
                <Save size={16} />
                {uploading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200 hover:shadow-md"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}