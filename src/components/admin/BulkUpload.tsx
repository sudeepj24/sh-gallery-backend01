import React, { useState } from 'react';
import CategorySelection from './bulk-upload/CategorySelection';
import ImageSelection from './bulk-upload/ImageSelection';
import DefaultValues from './bulk-upload/DefaultValues';
import ProductPreview from './bulk-upload/ProductPreview';
import UploadProgress from './bulk-upload/UploadProgress';
import ResultsModal from './bulk-upload/ResultsModal';
import { BulkUploadState, UploadResult } from './bulk-upload/types';
import { RotateCcw } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  subcategories: any[];
  display_order: number;
}

interface BulkUploadProps {
  categories: Category[];
  onSuccess: () => void;
}

export default function BulkUpload({ categories, onSuccess }: BulkUploadProps) {
  const [state, setState] = useState<BulkUploadState>({
    step: 'category',
    selectedCategory: null,
    selectedFiles: [],
    compressedFiles: [],
    idStrategy: 'sequential',
    startingNumber: 1,
    bulkMetadata: {
      description: '',
      tags: '',
      subcategories: {}
    },
    products: [],
    isUploading: false,
    uploadProgress: { current: 0, total: 0, currentItem: '' },
    results: null
  });

  const updateState = (updates: Partial<BulkUploadState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    const steps = ['category', 'images', 'defaults', 'preview'] as const;
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex < steps.length - 1) {
      updateState({ step: steps[currentIndex + 1] });
    }
  };

  const handleBack = () => {
    const steps = ['category', 'images', 'defaults', 'preview'] as const;
    const currentIndex = steps.indexOf(state.step);
    if (currentIndex > 0) {
      updateState({ step: steps[currentIndex - 1] });
    }
  };

  const handleUpload = async () => {
    updateState({ isUploading: true, step: 'uploading' });
  };

  const handleComplete = (results: UploadResult) => {
    updateState({ 
      isUploading: false, 
      step: 'results', 
      results,
      uploadProgress: { current: 0, total: 0, currentItem: '' }
    });
    if (results.successful.length > 0) {
      onSuccess();
    }
  };

  const resetFlow = () => {
    setState({
      step: 'category',
      selectedCategory: null,
      selectedFiles: [],
      compressedFiles: [],
      idStrategy: 'sequential',
      startingNumber: 1,
      bulkMetadata: {
        description: '',
        tags: '',
        subcategories: {}
      },
      products: [],
      isUploading: false,
      uploadProgress: { current: 0, total: 0, currentItem: '' },
      results: null
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Bulk Upload</h2>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between pb-6 border-b">
        <div className="flex items-center space-x-4">
          {[
            { key: 'category', label: 'Category' },
            { key: 'images', label: 'Images' },
            { key: 'defaults', label: 'Default Values' },
            { key: 'preview', label: 'Preview' }
          ].map((step, index) => {
            const currentIndex = ['category', 'images', 'defaults', 'preview'].indexOf(state.step);
            const isActive = state.step === step.key;
            const isCompleted = index < currentIndex;
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isActive ? 'bg-blue-600 text-white' :
                  isCompleted ? 'bg-green-600 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  isActive ? 'text-blue-600 font-medium' :
                  isCompleted ? 'text-green-600' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < 3 && <div className="w-8 h-px bg-gray-300 ml-4" />}
              </div>
            );
          })}
        </div>
        
        <button
          onClick={resetFlow}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-sm transition-colors"
        >
          <RotateCcw size={16} />
          Start Over
        </button>
      </div>

      {/* Step Content */}
      {state.step === 'category' && (
        <CategorySelection
          categories={categories}
          selectedCategory={state.selectedCategory}
          onCategorySelect={(category) => updateState({ selectedCategory: category })}
          onNext={handleNext}
        />
      )}

      {state.step === 'images' && (
        <ImageSelection
          selectedFiles={state.selectedFiles}
          compressedFiles={state.compressedFiles}
          onFilesSelect={(files) => updateState({ selectedFiles: files })}
          onFilesCompressed={(files) => updateState({ compressedFiles: files })}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {state.step === 'defaults' && (
        <DefaultValues
          category={state.selectedCategory!}
          files={state.compressedFiles}
          idStrategy={state.idStrategy}
          startingNumber={state.startingNumber}
          bulkMetadata={state.bulkMetadata}
          onIdStrategyChange={(strategy) => updateState({ idStrategy: strategy })}
          onStartingNumberChange={(num) => updateState({ startingNumber: num })}
          onMetadataChange={(metadata) => updateState({ bulkMetadata: metadata })}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {state.step === 'preview' && (
        <ProductPreview
          category={state.selectedCategory!}
          files={state.compressedFiles}
          idStrategy={state.idStrategy}
          startingNumber={state.startingNumber}
          bulkMetadata={state.bulkMetadata}
          products={state.products}
          onProductsGenerated={(products) => updateState({ products })}
          onProductUpdate={(products) => updateState({ products })}
          onUpload={handleUpload}
          onBack={handleBack}
        />
      )}

      {state.step === 'uploading' && (
        <UploadProgress
          products={state.products}
          progress={state.uploadProgress}
          onComplete={handleComplete}
          onProgressUpdate={(progress) => updateState({ uploadProgress: progress })}
        />
      )}

      {state.step === 'results' && state.results && (
        <ResultsModal
          results={state.results}
          onClose={resetFlow}
          onRetry={() => {
            updateState({ step: 'preview' });
          }}
        />
      )}
    </div>
  );
}