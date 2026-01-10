import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Category, CompressedFile, BulkMetadata } from './types';

interface DefaultValuesProps {
  category: Category;
  files: CompressedFile[];
  idStrategy: 'sequential' | 'custom';
  startingNumber: number;
  bulkMetadata: BulkMetadata;
  onIdStrategyChange: (strategy: 'sequential' | 'custom') => void;
  onStartingNumberChange: (num: number) => void;
  onMetadataChange: (metadata: BulkMetadata) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function DefaultValues({
  category,
  files,
  idStrategy,
  startingNumber,
  bulkMetadata,
  onIdStrategyChange,
  onStartingNumberChange,
  onMetadataChange,
  onNext,
  onBack
}: DefaultValuesProps) {
  const [highestId, setHighestId] = useState<number>(0);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    findHighestId();
  }, [category]);

  useEffect(() => {
    if (idStrategy === 'custom') {
      checkConflicts();
    }
  }, [startingNumber, files.length, idStrategy]);

  const findHighestId = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('products')
        .select('product_id');

      if (data) {
        const numbers = data
          .map(p => {
            const match = p.product_id.match(/(\d+)$/);
            return match ? parseInt(match[1]) : 0;
          })
          .filter(n => n > 0);
        
        const highest = numbers.length > 0 ? Math.max(...numbers) : 0;
        setHighestId(highest);
        onStartingNumberChange(highest + 1);
      }
    } catch (error) {
      console.error('Error finding highest ID:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConflicts = async () => {
    if (idStrategy !== 'custom' || files.length === 0) {
      setConflicts([]);
      return;
    }

    const proposedIds = Array.from({ length: files.length }, (_, i) => 
      String(startingNumber + i).padStart(3, '0')
    );

    try {
      const { data } = await supabase
        .from('products')
        .select('product_id')
        .in('product_id', proposedIds);

      if (data) {
        setConflicts(data.map(p => p.product_id));
      }
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  const updateMetadata = (field: keyof BulkMetadata, value: any) => {
    onMetadataChange({ ...bulkMetadata, [field]: value });
  };

  const updateSubcategory = (subcatId: string, value: string) => {
    onMetadataChange({
      ...bulkMetadata,
      subcategories: {
        ...bulkMetadata.subcategories,
        [subcatId]: value
      }
    });
  };

  const generatePreview = () => {
    const start = idStrategy === 'sequential' ? highestId + 1 : startingNumber;
    return Array.from({ length: Math.min(files.length, 3) }, (_, i) => 
      String(start + i).padStart(3, '0')
    );
  };

  const hasConflicts = conflicts.length > 0;
  const canProceed = !loading && !hasConflicts && files.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Product ID Strategy */}
      <div>
        <h4 className="font-medium mb-3">Product ID</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className={`border-2 rounded-lg p-4 cursor-pointer ${
            idStrategy === 'sequential' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`} onClick={() => onIdStrategyChange('sequential')}>
            <div className="flex items-center gap-2 mb-2">
              <input type="radio" checked={idStrategy === 'sequential'} readOnly />
              <span className="font-medium">Sequential</span>
            </div>
            <p className="text-sm text-gray-600">Continue from highest ID: {String(highestId + 1).padStart(3, '0')}</p>
          </div>

          <div className={`border-2 rounded-lg p-4 cursor-pointer ${
            idStrategy === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`} onClick={() => onIdStrategyChange('custom')}>
            <div className="flex items-center gap-2 mb-2">
              <input type="radio" checked={idStrategy === 'custom'} readOnly />
              <span className="font-medium">Custom Range</span>
            </div>
            {idStrategy === 'custom' && (
              <input
                type="number"
                min="1"
                value={startingNumber}
                onChange={(e) => onStartingNumberChange(parseInt(e.target.value) || 1)}
                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </div>
        </div>

        <div className="text-sm text-gray-600 mt-2">
          Preview IDs: {generatePreview().join(', ')}{files.length > 3 && '...'}
        </div>

        {hasConflicts && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" size={16} />
              <span className="text-sm text-red-700">
                Conflicts: {conflicts.join(', ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={bulkMetadata.description}
            onChange={(e) => updateMetadata('description', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={2}
            placeholder="Default description for all products"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            type="text"
            value={bulkMetadata.tags}
            onChange={(e) => updateMetadata('tags', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="tag1, tag2, tag3"
          />
        </div>

        {category.subcategories.map(subcat => (
          <div key={subcat.id}>
            <label className="block text-sm font-medium mb-1">{subcat.label}</label>
            <select
              value={bulkMetadata.subcategories[subcat.id] || ''}
              onChange={(e) => updateSubcategory(subcat.id, e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select {subcat.label.toLowerCase()}</option>
              {subcat.options.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </div>
        ))}
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
          onClick={onNext}
          disabled={!canProceed}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          Continue
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}