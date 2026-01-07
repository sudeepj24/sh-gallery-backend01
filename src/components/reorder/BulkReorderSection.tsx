import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, RotateCcw } from 'lucide-react';
import { ReorderableItem, ReorderConfig } from './types';
import LoadingSpinner from '../ui/LoadingSpinner';

interface BulkReorderSectionProps<T extends ReorderableItem> {
  items: T[];
  config: ReorderConfig<T>;
  onSuccess: () => void;
}

export default function BulkReorderSection<T extends ReorderableItem>({
  items,
  config,
  onSuccess
}: BulkReorderSectionProps<T>) {
  const [positions, setPositions] = useState<Record<string, string>>(
    items.reduce((acc, item, index) => ({
      ...acc,
      [String(item[config.idField])]: String(index + 1)
    }), {})
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePositionChange = (itemId: string, newValue: string) => {
    // Allow empty string or valid numbers
    if (newValue === '' || /^[0-9]+$/.test(newValue)) {
      setPositions(prev => ({
        ...prev,
        [itemId]: newValue
      }));
      setHasChanges(true);
    }
  };

  const resetPositions = () => {
    setPositions(
      items.reduce((acc, item, index) => ({
        ...acc,
        [String(item[config.idField])]: String(index + 1)
      }), {})
    );
    setHasChanges(false);
  };

  const saveOrder = async () => {
    setSaving(true);
    
    try {
      // Validate positions
      const positionEntries = Object.entries(positions);
      const positionValues = positionEntries.map(([_, pos]) => {
        const num = parseInt(pos) || 0;
        return num;
      });
      
      // Check for invalid positions (0, negative, or greater than item count)
      const invalidPositions = positionValues.filter(p => p <= 0 || p > items.length);
      if (invalidPositions.length > 0) {
        alert(`Position numbers must be between 1 and ${items.length}.`);
        setSaving(false);
        return;
      }
      
      // Check for duplicates
      const validPositions = positionValues.filter(p => p > 0);
      const uniquePositions = new Set(validPositions);
      
      if (uniquePositions.size !== validPositions.length) {
        alert('Each item must have a unique position number.');
        setSaving(false);
        return;
      }
      
      // Check if all positions are filled
      if (validPositions.length !== items.length) {
        alert('Please enter a position number for all items.');
        setSaving(false);
        return;
      }

      // Update database
      for (const [itemId, position] of Object.entries(positions)) {
        const numericPosition = parseInt(position) || 1;
        await supabase
          .from(config.tableName)
          .update({ [config.orderField]: numericPosition })
          .eq(config.idField as string, itemId);
      }

      setHasChanges(false);
      onSuccess();
    } catch (error) {
      console.error(`Error updating ${config.tableName} order:`, error);
      alert(`Failed to update ${config.title.toLowerCase()} order`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-amber-800">
          💡 <strong>Custom Order:</strong> Enter the desired position number for each item. Each position must be unique.
        </p>
      </div>

      {/* Fixed Action Buttons */}
      <div className="sticky top-0 z-10 bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="flex gap-3 justify-center">
          <button
            onClick={saveOrder}
            disabled={saving || !hasChanges}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Saving...' : 'Save Order'}
          </button>
          <button
            onClick={resetPositions}
            disabled={saving || !hasChanges}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
        {hasChanges && (
          <p className="text-sm text-amber-600 mt-2 text-center">
            You have unsaved changes. Don't forget to save!
          </p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Position</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={String(item[config.idField])} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">
                      {String(item[config.displayField])}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const currentPos = parseInt(positions[String(item[config.idField])]) || 1;
                          if (currentPos > 1) {
                            handlePositionChange(String(item[config.idField]), String(currentPos - 1));
                          }
                        }}
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={positions[String(item[config.idField])] || ''}
                        onChange={(e) => handlePositionChange(
                          String(item[config.idField]), 
                          e.target.value
                        )}
                        onFocus={(e) => e.target.select()}
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="#"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentPos = parseInt(positions[String(item[config.idField])]) || 0;
                          if (currentPos < items.length) {
                            handlePositionChange(String(item[config.idField]), String(currentPos + 1));
                          }
                        }}
                        className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
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