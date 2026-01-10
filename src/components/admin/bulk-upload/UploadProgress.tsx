import React, { useEffect, useState } from 'react';
import { Upload, CheckCircle, XCircle, Pause, Play } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { BulkProduct, UploadProgress, UploadResult } from './types';

interface UploadProgressProps {
  products: BulkProduct[];
  progress: UploadProgress;
  onComplete: (results: UploadResult) => void;
  onProgressUpdate: (progress: UploadProgress) => void;
}

export default function UploadProgressComponent({
  products,
  progress,
  onComplete,
  onProgressUpdate
}: UploadProgressProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    successful: any[];
    failed: any[];
    processing: string[];
  }>({
    successful: [],
    failed: [],
    processing: []
  });

  useEffect(() => {
    if (!isPaused) {
      startUpload();
    }
  }, [isPaused]);

  const startUpload = async () => {
    const successful: any[] = [];
    const failed: any[] = [];

    for (let i = 0; i < products.length; i++) {
      if (isPaused) break;

      const product = products[i];
      
      onProgressUpdate({
        current: i + 1,
        total: products.length,
        currentItem: product.productName
      });

      setUploadResults(prev => ({
        ...prev,
        processing: [product.id]
      }));

      try {
        // Upload image to storage
        const fileExt = product.file.compressedFile.type === 'image/webp' ? 'webp' : 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;
        const storagePath = `${product.categoryId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(storagePath, product.file.compressedFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gallery-images')
          .getPublicUrl(storagePath);

        // Save product to database
        const productData = {
          id: `product-${Date.now()}-${i}`,
          product_id: product.productId,
          filename: product.file.originalFile.name,
          path: publicUrl,
          product_name: product.productName,
          description: product.description,
          main_category: product.categoryId,
          subcategories: product.subcategories,
          tags: product.tags,
          display_order: 999
        };

        const { error: dbError } = await supabase
          .from('products')
          .insert(productData);

        if (dbError) throw dbError;

        successful.push({
          productId: product.productId,
          productName: product.productName,
          id: productData.id
        });

        setUploadResults(prev => ({
          ...prev,
          successful: [...prev.successful, product.id],
          processing: []
        }));

      } catch (error) {
        console.error(`Error uploading ${product.productName}:`, error);
        
        failed.push({
          productId: product.productId,
          productName: product.productName,
          error: error instanceof Error ? error.message : 'Upload failed',
          file: product.file
        });

        setUploadResults(prev => ({
          ...prev,
          failed: [...prev.failed, product.id],
          processing: []
        }));
      }

      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Complete the upload process
    onComplete({ successful, failed });
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const progressPercentage = (progress.current / progress.total) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Uploading Products</h3>
        <p className="text-gray-600 text-sm">
          Please wait while we upload your products. This may take a few minutes.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Upload className="text-blue-600" size={24} />
            <div>
              <h4 className="font-medium">Upload Progress</h4>
              <p className="text-sm text-gray-600">{progress.currentItem}</p>
            </div>
          </div>
          <button
            onClick={togglePause}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{progress.current} of {progress.total} products</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">{uploadResults.successful.length}</div>
            <div className="text-sm text-gray-600">Successful</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">{uploadResults.failed.length}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{uploadResults.processing.length}</div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
        </div>
      </div>

      {/* Product Status List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b sticky top-0">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isSuccessful = uploadResults.successful.includes(product.id);
                const isFailed = uploadResults.failed.includes(product.id);
                const isProcessing = uploadResults.processing.includes(product.id);
                
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.file.preview}
                          alt={product.productName}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="text-sm">{product.productName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">{product.productId}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isProcessing && (
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                          <span className="text-xs">Uploading...</span>
                        </div>
                      )}
                      {isSuccessful && (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle size={16} />
                          <span className="text-xs">Success</span>
                        </div>
                      )}
                      {isFailed && (
                        <div className="flex items-center justify-center gap-2 text-red-600">
                          <XCircle size={16} />
                          <span className="text-xs">Failed</span>
                        </div>
                      )}
                      {!isProcessing && !isSuccessful && !isFailed && (
                        <div className="flex items-center justify-center gap-2 text-gray-400">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          <span className="text-xs">Waiting</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isPaused && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Pause className="text-yellow-600" size={20} />
            <div>
              <h4 className="font-medium text-yellow-900">Upload Paused</h4>
              <p className="text-sm text-yellow-700">Click Resume to continue uploading products.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}