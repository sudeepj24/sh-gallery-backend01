import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Settings, GripVertical, Edit, Trash2, Filter, X, Save, List, ArrowLeftRight } from 'lucide-react';
import BulkCategoryReorder from './admin/BulkCategoryReorder';
import SwapPositions from './admin/SwapPositions';

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

interface CategoryManagerProps {
  categories: Category[];
  onSuccess: () => void;
}

export default function CategoryManager({ categories, onSuccess }: CategoryManagerProps) {
  const [activeSection, setActiveSection] = useState<'manage' | 'reorder'>('manage');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [hasReorderChanges, setHasReorderChanges] = useState(false);
  const [reorderMode, setReorderMode] = useState<'drag' | 'bulk' | 'swap'>('drag');

  const handleSectionChange = (section: 'manage' | 'reorder') => {
    // If switching from reorder to manage and changes were made, reload data
    if (activeSection === 'reorder' && section === 'manage' && hasReorderChanges) {
      onSuccess();
      setHasReorderChanges(false);
    }
    setActiveSection(section);
  };

  useEffect(() => {
    const handleCategoriesUpdate = () => {
      onSuccess();
    };

    window.addEventListener('categoriesUpdated', handleCategoriesUpdate);
    return () => window.removeEventListener('categoriesUpdated', handleCategoriesUpdate);
  }, [onSuccess]);

  const deleteCategory = async (id: string) => {
    const categoryToDelete = categories.find(c => c.id === id);
    const categoryName = categoryToDelete?.label || 'this category';
    
    // Check if category has any products
    const { data: productsInCategory } = await supabase
      .from('products')
      .select('product_name, product_id, id')
      .eq('main_category', id);
    
    if (productsInCategory && productsInCategory.length > 0) {
      const productList = productsInCategory
        .map(p => `• ${p.product_name} (ID: ${p.product_id || p.id})`)
        .join('\n');
      
      alert(
        `Cannot delete category "${categoryName}"\n\n` +
        `⚠️ This category has ${productsInCategory.length} product(s):\n\n` +
        `${productList}\n\n` +
        `Please move or delete these products first.`
      );
      return;
    }
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${categoryName}"?\n\n` +
      `⚠️ This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      onSuccess();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Categories & Filters</h2>
        <button
          onClick={() => setShowCategoryForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => handleSectionChange('manage')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'manage'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings size={16} className="inline mr-2" />
          Manage Categories
        </button>
        <button
          onClick={() => handleSectionChange('reorder')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'reorder'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <GripVertical size={16} className="inline mr-2" />
          Reorder Categories
        </button>
      </div>

      {/* Reorder Mode Toggle */}
      {activeSection === 'reorder' && (
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setReorderMode('drag')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                reorderMode === 'drag'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GripVertical size={16} className="inline mr-2" />
              Drag & Drop
            </button>
            <button
              onClick={() => setReorderMode('bulk')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                reorderMode === 'bulk'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} className="inline mr-2" />
              Bulk Reorder
            </button>
            <button
              onClick={() => setReorderMode('swap')}
              className={`py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                reorderMode === 'swap'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowLeftRight size={16} className="inline mr-2" />
              Swap Positions
            </button>
          </div>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-gray-500 mb-4">No categories yet</div>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
          >
            Add Your First Category
          </button>
        </div>
      ) : (
        <div>
          {activeSection === 'manage' && (
            <CategoryManageSection 
              categories={categories}
              onEditCategory={setEditingCategory}
              onDeleteCategory={deleteCategory}
            />
          )}
          {activeSection === 'reorder' && (
            <div>
              {reorderMode === 'drag' ? (
                <CategoryReorderSection 
                  categories={categories} 
                  onReorderChange={() => setHasReorderChanges(true)}
                />
              ) : reorderMode === 'bulk' ? (
                <BulkCategoryReorder
                  categories={categories}
                  onSuccess={() => {
                    setHasReorderChanges(true);
                    onSuccess();
                  }}
                />
              ) : (
                <SwapPositions
                  categories={categories}
                  onSuccess={() => {
                    setHasReorderChanges(true);
                    onSuccess();
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Forms */}
      {showCategoryForm && (
        <CategoryForm 
          onClose={() => setShowCategoryForm(false)}
          onSuccess={onSuccess}
        />
      )}

      {editingCategory && (
        <CategoryForm 
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}

function CategoryManageSection({ categories, onEditCategory, onDeleteCategory }: {
  categories: Category[];
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">#</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Category Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Filters</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Filter Options</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category.id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-4">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">
                    #{index + 1}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <h3 className="font-semibold text-gray-900">{category.label}</h3>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-600">
                    {category.subcategories.length} filter{category.subcategories.length !== 1 ? 's' : ''}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-1 max-w-md">
                    {category.subcategories.length === 0 ? (
                      <span className="text-sm text-gray-500 italic">No filters defined</span>
                    ) : (
                      category.subcategories.slice(0, 2).map(subcat => (
                        <div key={subcat.id} className="text-sm">
                          <span className="font-medium text-gray-700">{subcat.label}:</span>
                          <span className="ml-1 text-gray-600">
                            {subcat.options.slice(0, 3).map(opt => opt.label).join(', ')}
                            {subcat.options.length > 3 && ` +${subcat.options.length - 3} more`}
                          </span>
                        </div>
                      ))
                    )}
                    {category.subcategories.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{category.subcategories.length - 2} more filters
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => onEditCategory(category)}
                      className="text-gray-600 hover:text-gray-800 p-1"
                      title="Edit category"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoryReorderSection({ categories, onReorderChange }: { 
  categories: Category[];
  onReorderChange: () => void;
}) {
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [localCategories, setLocalCategories] = useState(categories);

  // Update local state when props change
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const handleDragStart = (e: React.DragEvent, category: Category) => {
    setDraggedCategory(category);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    
    if (!draggedCategory) return;
    
    const dragIndex = localCategories.findIndex(c => c.id === draggedCategory.id);
    if (dragIndex === dropIndex) return;

    // Update UI immediately
    const newCategories = [...localCategories];
    const [removed] = newCategories.splice(dragIndex, 1);
    newCategories.splice(dropIndex, 0, removed);
    setLocalCategories(newCategories);

    // Update database in background
    const updates = newCategories.map((category, index) => ({
      id: category.id,
      display_order: index + 1
    }));

    try {
      for (const update of updates) {
        await supabase
          .from('categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      
      // Mark that changes were made
      onReorderChange();
    } catch (error) {
      console.error('Error updating category order:', error);
      alert('Failed to update category order');
      // Revert UI on error
      setLocalCategories(categories);
    }
    
    setDraggedCategory(null);
  };

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Drag & Drop:</strong> Drag categories to reorder them. The order here determines how they appear in your gallery.
        </p>
      </div>
      
      <div className="space-y-2">
        {localCategories.map((category, index) => (
          <div
            key={category.id}
            draggable
            onDragStart={(e) => handleDragStart(e, category)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`bg-white rounded-lg shadow p-4 transition-all duration-200 cursor-move border-2 ${
              dragOverIndex === index ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center text-gray-400 hover:text-gray-600">
                <GripVertical size={20} />
              </div>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">
                #{index + 1}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{category.label}</h3>
              </div>
              <div className="text-sm text-gray-500">
                {category.subcategories.length} filters
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryForm({ category, onClose, onSuccess }: {
  category?: Category;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    label: category?.label || '',
    subcategories: category?.subcategories || []
  });
  const [saving, setSaving] = useState(false);

  const addFilter = () => {
    setFormData({
      ...formData,
      subcategories: [
        ...formData.subcategories,
        { id: '', label: '', options: [] }
      ]
    });
  };

  const updateFilter = (index: number, field: string, value: any) => {
    const updated = [...formData.subcategories];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, subcategories: updated });
  };

  const removeFilter = (index: number) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories.filter((_, i) => i !== index)
    });
  };

  const addFilterOption = (filterIndex: number) => {
    const updated = [...formData.subcategories];
    updated[filterIndex].options.push({ id: '', label: '' });
    setFormData({ ...formData, subcategories: updated });
  };

  const updateFilterOption = (filterIndex: number, optionIndex: number, field: string, value: string) => {
    const updated = [...formData.subcategories];
    updated[filterIndex].options[optionIndex] = {
      ...updated[filterIndex].options[optionIndex],
      [field]: value
    };
    setFormData({ ...formData, subcategories: updated });
  };

  const removeFilterOption = (filterIndex: number, optionIndex: number) => {
    const updated = [...formData.subcategories];
    updated[filterIndex].options = updated[filterIndex].options.filter((_, i) => i !== optionIndex);
    setFormData({ ...formData, subcategories: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Check for duplicate category names (case-insensitive)
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id, label')
        .ilike('label', formData.label);

      // If editing, exclude current category from duplicate check
      const duplicates = existingCategories?.filter(cat => 
        category ? cat.id !== category.id : true
      );

      if (duplicates && duplicates.length > 0) {
        alert(`Category "${formData.label}" already exists. Please choose a different name.`);
        setSaving(false);
        return;
      }

      const categoryData = {
        id: category?.id || `${formData.label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        label: formData.label,
        subcategories: formData.subcategories.map(sub => ({
          ...sub,
          id: sub.id || sub.label.toLowerCase().replace(/\s+/g, '-'),
          options: sub.options.map(opt => ({
            ...opt,
            id: opt.id || opt.label.toLowerCase().replace(/\s+/g, '-')
          }))
        })),
        display_order: category?.display_order || 999
      };

      if (category) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(`Error saving category: ${error.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {category ? 'Edit Category' : 'Add New Category'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.label}
                onChange={(e) => setFormData({...formData, label: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g., Doors, Windows"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Filters</h3>
                <button
                  type="button"
                  onClick={addFilter}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Filter
                </button>
              </div>

              <div className="space-y-4">
                {formData.subcategories.map((filter, filterIndex) => (
                  <div key={filterIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <input
                        type="text"
                        value={filter.label}
                        onChange={(e) => updateFilter(filterIndex, 'label', e.target.value)}
                        className="flex-1 font-medium border-0 bg-transparent text-lg focus:outline-none focus:ring-0 min-w-0"
                        placeholder="Filter Name (e.g., Color, Size)"
                      />
                      <button
                        type="button"
                        onClick={() => removeFilter(filterIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mb-3">
                      <button
                        type="button"
                        onClick={() => addFilterOption(filterIndex)}
                        className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Add Option
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {filter.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={option.label}
                            onChange={(e) => updateFilterOption(filterIndex, optionIndex, 'label', e.target.value)}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                            placeholder="Option name"
                          />
                          <button
                            type="button"
                            onClick={() => removeFilterOption(filterIndex, optionIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : (category ? 'Update Category' : 'Add Category')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
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