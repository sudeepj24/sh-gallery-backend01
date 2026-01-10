import React, { useState, useRef } from 'react';
import CategorySelection from './bulk-upload/CategorySelection';
import ImageSelection from './bulk-upload/ImageSelection';
import DefaultValues from './bulk-upload/DefaultValues';
import ProductPreview from './bulk-upload/ProductPreview';
import UploadProgress from './bulk-upload/UploadProgress';
import SuccessModal from './bulk-upload/modals/SuccessModal';
import FailureModal from './bulk-upload/modals/FailureModal';
import MixedResultsModal from './bulk-upload/modals/MixedResultsModal';
import { BulkUploadState } from './bulk-upload/types';
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
  const [showModal, setShowModal] = useState(false);
  const [modalResults, setModalResults] = useState<{ successful: any[]; failed: any[] } | null>(null);
  const hasShownModal = useRef(false);
  
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
    isUploading: false
  });

  const updateState = (updates: Partial<BulkUploadState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    const steps: BulkUploadState['step'][] = ['category', 'images', 'defaults', 'preview'];
    const currentIndex = steps.indexOf(state.step as any);
    if (currentIndex >= 0 && currentIndex < steps.length - 1) {
      updateState({ step: steps[currentIndex + 1] });
    }
  };

  const handleBack = () => {
    const steps: BulkUploadState['step'][] = ['category', 'images', 'defaults', 'preview'];
    const currentIndex = steps.indexOf(state.step as any);
    if (currentIndex > 0) {
      updateState({ step: steps[currentIndex - 1] });
    }
  };

  const handleUpload = () => {
    updateState({ isUploading: true, step: 'uploading' });
  };

  const handleComplete = (results: { successful: any[]; failed: any[] }) => {
    // Store results and show modal ONLY ONCE
    if (!hasShownModal.current) {
      hasShownModal.current = true;
      setModalResults(results);
      setShowModal(true);
      
      // Filter out successfully uploaded products and their files, keep only failed ones
      if (results.failed.length > 0) {
        const failedProductIds = new Set(results.failed.map(f => f.productId));
        const remainingProducts = state.products.filter(p => failedProductIds.has(p.productId));
        const remainingFiles = state.compressedFiles.filter((_, index) => {
          const product = state.products[index];
          return product && failedProductIds.has(product.productId);
        });
        
        updateState({ 
          isUploading: false, 
          step: 'preview',
          products: remainingProducts,
          compressedFiles: remainingFiles
        });
      } else {
        updateState({ 
          isUploading: false, 
          step: 'preview'
        });
      }
    }
  };

  const handleResultsClose = () => {
    setShowModal(false);
    setModalResults(null);
    hasShownModal.current = false;
    onSuccess();
    resetFlow();
  };

  const getModalType = (results: { successful: any[]; failed: any[] }): 'success' | 'failure' | 'mixed' => {
    if (results.successful.length === 0) return 'failure';
    if (results.failed.length === 0) return 'success';
    return 'mixed';
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
      isUploading: false
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
          onComplete={handleComplete}
        />
      )}

      {showModal && modalResults && (
        <div>
          {(() => {
            const modalType = getModalType(modalResults);
            if (modalType === 'success') {
              return (
                <SuccessModal
                  results={modalResults}
                  onClose={handleResultsClose}
                />
              );
            } else if (modalType === 'failure') {
              return (
                <FailureModal
                  results={modalResults}
                  onClose={handleResultsClose}
                  onRetry={() => {
                    setShowModal(false);
                    hasShownModal.current = false;
                    updateState({ step: 'preview' });
                  }}
                />
              );
            } else {
              return (
                <MixedResultsModal
                  results={modalResults}
                  onClose={handleResultsClose}
                  onRetry={() => {
                    setShowModal(false);
                    hasShownModal.current = false;
                    updateState({ step: 'preview' });
                  }}
                />
              );
            }
          })()
          }
        </div>
      )}
    </div>
  );
}