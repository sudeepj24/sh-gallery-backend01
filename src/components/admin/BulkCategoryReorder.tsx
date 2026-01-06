import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  display_order: number;
  subcategories: any[];
}

interface BulkCategoryReorderProps {
  categories: Category[];
  onSuccess: () => void;
}

export default function BulkCategoryReorder({ categories, onSuccess }: BulkCategoryReorderProps) {
  const [positions, setPositions] = useState<Record<string, number | string>>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Initialize positions from current category order
    const initialPositions: Record<string, number> = {};
    categories.forEach((category, index) => {
      initialPositions[category.id] = index + 1;
    });
    setPositions(initialPositions);
  }, [categories]);

  const updatePosition = (categoryId: string, value: string) => {
    if (value === '') {
      // Allow empty string for clearing the field
      setPositions(prev => ({
        ...prev,
        [categoryId]: ''
      }));
    } else {
      const newPosition = parseInt(value);
      if (!isNaN(newPosition)) {
        setPositions(prev => ({
          ...prev,
          [categoryId]: newPosition
        }));
      }
    }
    setErrors([]);
  };

  const resetPositions = () => {
    const resetPositions: Record<string, number> = {};
    categories.forEach((category, index) => {
      resetPositions[category.id] = index + 1;
    });
    setPositions(resetPositions);
    setErrors([]);
  };

  const validatePositions = (): string[] => {
    const errors: string[] = [];
    const positionValues = Object.values(positions).filter(pos => pos !== '').map(pos => Number(pos));
    const totalCategories = categories.length;

    // Check for invalid numbers
    positionValues.forEach((pos) => {
      if (pos < 1 || pos > totalCategories) {
        errors.push(`Position must be between 1 and ${totalCategories}`);
      }
    });

    // Check for duplicates
    const duplicates = positionValues.filter((pos, index) => 
      positionValues.indexOf(pos) !== index
    );
    if (duplicates.length > 0) {
      errors.push(`Duplicate positions found: ${[...new Set(duplicates)].join(', ')}`);
    }

    // Check for missing positions (only if all positions are filled)
    const filledPositions = Object.values(positions).filter(pos => pos !== '');
    if (filledPositions.length === totalCategories) {
      const expectedPositions = Array.from({ length: totalCategories }, (_, i) => i + 1);
      const missingPositions = expectedPositions.filter(pos => !positionValues.includes(pos));
      if (missingPositions.length > 0) {
        errors.push(`Missing positions: ${missingPositions.join(', ')}`);
      }
    }

    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validatePositions();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors([]);

    try {
      // Update each category's display_order (only for non-empty positions)
      for (const [categoryId, position] of Object.entries(positions)) {
        if (position !== '') {
          const { error } = await supabase
            .from('categories')
            .update({ display_order: Number(position) })
            .eq('id', categoryId);
          
          if (error) throw error;
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error updating category positions:', error);
      setErrors(['Failed to update category positions. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Bulk Reorder:</strong> Set specific positions for each category. 
          Position 1 appears first, position {categories.length} appears last.
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 mb-1">Please fix the following errors:</p>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Position Controls */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Set Category Positions</h3>
            <div className="flex gap-2">
              <button
                onClick={resetPositions}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RotateCcw size={14} />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Order'}
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Category Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Filters</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Position</th>
              </tr>
            </thead>
            <tbody>
              {categories
                .map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <h3 className="font-semibold text-gray-900">{category.label}</h3>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600">
                        {category.subcategories.length} filter{category.subcategories.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <input
                          type="number"
                          min="1"
                          max={categories.length}
                          value={positions[category.id] || ''}
                          onChange={(e) => updatePosition(category.id, e.target.value)}
                          className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}