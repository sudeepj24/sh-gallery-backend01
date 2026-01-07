import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeftRight } from 'lucide-react';
import { ReorderableItem, ReorderConfig } from './types';
import LoadingSpinner from '../ui/LoadingSpinner';

interface SwapSectionProps<T extends ReorderableItem> {
  items: T[];
  config: ReorderConfig<T>;
  onSuccess: () => void;
}

export default function SwapSection<T extends ReorderableItem>({
  items,
  config,
  onSuccess
}: SwapSectionProps<T>) {
  const [firstItemId, setFirstItemId] = useState('');
  const [secondItemId, setSecondItemId] = useState('');
  const [swapping, setSwapping] = useState(false);

  const handleSwap = async () => {
    if (!firstItemId || !secondItemId || firstItemId === secondItemId) {
      alert('Please select two different items to swap.');
      return;
    }

    const firstItem = items.find(item => String(item[config.idField]) === firstItemId);
    const secondItem = items.find(item => String(item[config.idField]) === secondItemId);

    if (!firstItem || !secondItem) {
      alert('Selected items not found');
      return;
    }

    const firstPosition = firstItem[config.orderField] as number;
    const secondPosition = secondItem[config.orderField] as number;

    setSwapping(true);

    try {
      // Swap positions in database
      await supabase
        .from(config.tableName)
        .update({ [config.orderField]: secondPosition })
        .eq(config.idField as string, firstItemId);

      await supabase
        .from(config.tableName)
        .update({ [config.orderField]: firstPosition })
        .eq(config.idField as string, secondItemId);

      // Reset selections
      setFirstItemId('');
      setSecondItemId('');
      
      onSuccess();
    } catch (error) {
      console.error(`Error swapping ${config.tableName} positions:`, error);
      alert(`Failed to swap ${config.title.toLowerCase()} positions`);
    } finally {
      setSwapping(false);
    }
  };

  const getItemPosition = (itemId: string) => {
    const item = items.find(item => String(item[config.idField]) === itemId);
    return item ? item[config.orderField] as number : 0;
  };

  return (
    <div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-green-800">
          💡 <strong>Swap Positions:</strong> Choose two items to exchange their positions. Item A will move to Item B's position and vice versa.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item A (Move from position)
            </label>
            <select
              value={firstItemId}
              onChange={(e) => setFirstItemId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Choose item to move...</option>
              {items.map((item) => (
                <option 
                  key={String(item[config.idField])} 
                  value={String(item[config.idField])}
                  disabled={String(item[config.idField]) === secondItemId}
                >
                  #{item[config.orderField]} - {String(item[config.displayField])}
                </option>
              ))}
            </select>
            {firstItemId && (
              <p className="text-sm text-gray-600 mt-1">
                Currently at position #{getItemPosition(firstItemId)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item B (Swap with position)
            </label>
            <select
              value={secondItemId}
              onChange={(e) => setSecondItemId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Choose item to swap with...</option>
              {items.map((item) => (
                <option 
                  key={String(item[config.idField])} 
                  value={String(item[config.idField])}
                  disabled={String(item[config.idField]) === firstItemId}
                >
                  #{item[config.orderField]} - {String(item[config.displayField])}
                </option>
              ))}
            </select>
            {secondItemId && (
              <p className="text-sm text-gray-600 mt-1">
                Currently at position #{getItemPosition(secondItemId)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleSwap}
            disabled={swapping || !firstItemId || !secondItemId || firstItemId === secondItemId}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
          >
            {swapping ? (
              <LoadingSpinner size="sm" />
            ) : (
              <ArrowLeftRight size={16} />
            )}
            {swapping ? 'Swapping...' : 'Swap Positions'}
          </button>
        </div>
      </div>
    </div>
  );
}