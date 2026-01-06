import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeftRight, AlertCircle } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  display_order: number;
  subcategories: any[];
}

interface SwapPositionsProps {
  categories: Category[];
  onSuccess: () => void;
}

export default function SwapPositions({ categories, onSuccess }: SwapPositionsProps) {
  const [swapFrom, setSwapFrom] = useState('');
  const [swapTo, setSwapTo] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState('');

  const handleSwap = async () => {
    if (!swapFrom || !swapTo || swapFrom === swapTo) {
      setError('Please select two different categories to swap');
      return;
    }

    setSwapping(true);
    setError('');

    try {
      const fromCategory = categories.find(c => c.id === swapFrom);
      const toCategory = categories.find(c => c.id === swapTo);

      if (!fromCategory || !toCategory) {
        setError('Selected categories not found');
        return;
      }

      // Swap display_order values
      const { error: error1 } = await supabase
        .from('categories')
        .update({ display_order: toCategory.display_order })
        .eq('id', fromCategory.id);

      const { error: error2 } = await supabase
        .from('categories')
        .update({ display_order: fromCategory.display_order })
        .eq('id', toCategory.id);

      if (error1 || error2) {
        throw new Error('Failed to swap positions');
      }

      setSwapFrom('');
      setSwapTo('');
      onSuccess();
    } catch (error) {
      console.error('Error swapping positions:', error);
      setError('Failed to swap positions. Please try again.');
    } finally {
      setSwapping(false);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          🔄 <strong>Swap Positions:</strong> Select two categories to swap their positions instantly.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Swap Tool */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
          <ArrowLeftRight size={16} />
          Swap Category Positions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Category</label>
            <select
              value={swapFrom}
              onChange={(e) => {
                setSwapFrom(e.target.value);
                setError('');
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category...</option>
              {sortedCategories.map((category, index) => (
                <option key={category.id} value={category.id}>
                  #{index + 1} - {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Category</label>
            <select
              value={swapTo}
              onChange={(e) => {
                setSwapTo(e.target.value);
                setError('');
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category...</option>
              {sortedCategories.map((category, index) => (
                <option key={category.id} value={category.id}>
                  #{index + 1} - {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleSwap}
            disabled={swapping || !swapFrom || !swapTo}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg flex items-center gap-2"
          >
            <ArrowLeftRight size={16} />
            {swapping ? 'Swapping...' : 'Swap Positions'}
          </button>
        </div>
      </div>

      {/* Current Order Preview */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Current Order</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {sortedCategories.map((category, index) => (
            <div
              key={category.id}
              className={`p-2 rounded text-sm ${
                category.id === swapFrom || category.id === swapTo
                  ? 'bg-blue-100 border border-blue-300'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <span className="font-mono text-xs text-gray-500">#{index + 1}</span>
              <span className="ml-2">{category.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}