import React, { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import { compressImage } from '../../../utils/imageCompression';
import { CompressedFile } from './types';

interface ImageSelectionProps {
  selectedFiles: File[];
  compressedFiles: CompressedFile[];
  onFilesSelect: (files: File[]) => void;
  onFilesCompressed: (files: CompressedFile[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ImageSelection({
  selectedFiles,
  compressedFiles,
  onFilesSelect,
  onFilesCompressed,
  onNext,
  onBack
}: ImageSelectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert(`${files.length - imageFiles.length} non-image files were filtered out.`);
    }
    
    onFilesSelect(imageFiles);
    await processImages(imageFiles);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const allFiles = [...selectedFiles, ...imageFiles];
    
    onFilesSelect(allFiles);
    await processImages(allFiles);
  }, [selectedFiles]);

  const processImages = async (filesToProcess: File[]) => {
    setIsProcessing(true);
    const compressed: CompressedFile[] = [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      try {
        const result = await compressImage(file);
        if (result.success && result.file) {
          compressed.push({
            originalFile: file,
            compressedFile: result.file,
            preview: URL.createObjectURL(result.file),
            id: `${Date.now()}-${i}`
          });
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    onFilesCompressed(compressed);
    setIsProcessing(false);
    
    // Auto-proceed to next step
    if (compressed.length > 0) {
      setTimeout(() => onNext(), 500);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newCompressed = compressedFiles.filter((_, i) => i !== index);
    onFilesSelect(newFiles);
    onFilesCompressed(newCompressed);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Select Images</h3>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors relative"
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">Drop images here or click to browse</p>
          <p className="text-sm text-gray-500">Supports JPG, PNG, WebP formats</p>
        </div>
        <label className="absolute inset-0 cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isProcessing}
            className="sr-only"
          />
        </label>
      </div>

      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
            <span className="font-medium text-blue-900">Processing images...</span>
          </div>
        </div>
      )}

      {selectedFiles.length > 0 && !isProcessing && (
        <div>
          <h4 className="font-medium mb-4">{selectedFiles.length} images selected</h4>
          <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={compressedFiles.length === 0 || isProcessing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          Continue
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}