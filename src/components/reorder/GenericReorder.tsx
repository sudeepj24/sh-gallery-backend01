import React, { useState, useEffect } from 'react';
import { GripVertical, List, ArrowLeftRight } from 'lucide-react';
import { ReorderableItem, ReorderConfig, ReorderMode } from './types';
import DragDropSection from './DragDropSection';
import BulkReorderSection from './BulkReorderSection';
import SwapSection from './SwapSection';
import { useReorderMode } from '../../hooks/useReorderMode';
import LoadingOverlay from '../ui/LoadingOverlay';
import { supabase } from '../../lib/supabase';

interface GenericReorderProps<T extends ReorderableItem> {
  items: T[];
  config: ReorderConfig<T>;
  onDataUpdate: (updatedItems: T[]) => void;
  renderItem?: (item: T, index: number) => React.ReactNode;
  filterComponent?: React.ReactNode;
  context: string;
}

export default function GenericReorder<T extends ReorderableItem>({
  items,
  config,
  onDataUpdate,
  renderItem,
  filterComponent,
  context
}: GenericReorderProps<T>) {
  const [reorderMode, setReorderMode] = useReorderMode(context, 'drag');
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = async () => {
    setIsLoading(true);
    try {
      // Fetch updated data without full page refresh
      const { data } = await supabase
        .from(config.tableName)
        .select('*')
        .order(config.orderField as string);
      
      if (data) {
        onDataUpdate(data as T[]);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{config.title}</h2>
      </div>

      {filterComponent && (
        <div className="mb-6">
          {filterComponent}
        </div>
      )}

      {/* Reorder Mode Toggle */}
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
            Custom Order
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

      {items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-gray-500 mb-4">{config.emptyMessage}</div>
          <p className="text-sm text-gray-400">{config.emptySubMessage}</p>
        </div>
      ) : (
        <div className="relative">
          <LoadingOverlay isVisible={isLoading} text="Updating order..." />
          {reorderMode === 'drag' && (
            <DragDropSection
              items={items}
              config={config}
              onReorderChange={() => {}}
              onSuccess={handleSuccess}
              renderItem={renderItem}
            />
          )}
          
          {reorderMode === 'bulk' && (
            <BulkReorderSection
              items={items}
              config={config}
              onSuccess={handleSuccess}
            />
          )}
          
          {reorderMode === 'swap' && (
            <SwapSection
              items={items}
              config={config}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      )}
    </div>
  );
}