import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { GripVertical } from 'lucide-react';
import { ReorderableItem, ReorderConfig } from './types';

interface DragDropSectionProps<T extends ReorderableItem> {
  items: T[];
  config: ReorderConfig<T>;
  onReorderChange: () => void;
  onSuccess: () => void;
  renderItem?: (item: T, index: number) => React.ReactNode;
}

export default function DragDropSection<T extends ReorderableItem>({
  items,
  config,
  onReorderChange,
  onSuccess,
  renderItem
}: DragDropSectionProps<T>) {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleDragStart = (e: React.DragEvent, item: T) => {
    setDraggedItem(item);
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
    
    if (!draggedItem) return;
    
    const dragIndex = localItems.findIndex(item => item[config.idField] === draggedItem[config.idField]);
    if (dragIndex === dropIndex) return;

    // Update UI immediately
    const newItems = [...localItems];
    const [removed] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, removed);
    setLocalItems(newItems);

    // Update database in background
    const updates = newItems.map((item, index) => ({
      [config.idField]: item[config.idField],
      [config.orderField]: index + 1
    }));

    try {
      for (const update of updates) {
        await supabase
          .from(config.tableName)
          .update({ [config.orderField]: update[config.orderField] })
          .eq(config.idField as string, update[config.idField]);
      }
      
      onReorderChange();
      onSuccess();
    } catch (error) {
      console.error(`Error updating ${config.tableName} order:`, error);
      alert(`Failed to update ${config.title.toLowerCase()} order`);
      setLocalItems(items);
    }
    
    setDraggedItem(null);
  };

  const defaultRenderItem = (item: T, index: number) => (
    <div className="flex items-center gap-4">
      <div className="flex items-center text-gray-400 hover:text-gray-600">
        <GripVertical size={20} />
      </div>
      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono">
        #{index + 1}
      </span>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">
          {String(item[config.displayField])}
        </h3>
      </div>
    </div>
  );

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Drag & Drop:</strong> {config.dragMessage}
        </p>
      </div>
      
      <div className="space-y-2">
        {localItems.map((item, index) => (
          <div
            key={String(item[config.idField])}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`bg-white rounded-lg shadow p-4 transition-all duration-200 cursor-move border-2 ${
              dragOverIndex === index ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {renderItem ? renderItem(item, index) : defaultRenderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}