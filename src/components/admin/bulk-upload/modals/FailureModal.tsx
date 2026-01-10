import React from 'react';
import { XCircle, X, RefreshCw } from 'lucide-react';
import { UploadResult } from '../types';
import { getDetailedErrorMessage } from '../utils/errorUtils';

interface FailureModalProps {
  results: UploadResult;
  onClose: () => void;
  onRetry: () => void;
}

export default function FailureModal({ results, onClose, onRetry }: FailureModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-red-900">Upload Failed</h2>
                <p className="text-red-700">
                  {results.failed.length} product{results.failed.length !== 1 ? 's' : ''} could not be uploaded
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {/* Error Summary */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{results.failed.length}</div>
              <p className="text-red-800">Products failed to upload</p>
            </div>
          </div>

          {/* Detailed Error List */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Failed Products</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-red-100 border-b border-red-200 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-4 text-sm font-medium text-red-800">Product</th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-red-800">ID</th>
                      <th className="text-left py-2 px-4 text-sm font-medium text-red-800">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.failed.map((item, index) => {
                      const { message } = getDetailedErrorMessage(item.error);
                      return (
                        <tr key={index} className="border-b border-red-200 last:border-b-0">
                          <td className="py-2 px-4 text-sm text-red-800">{item.productName}</td>
                          <td className="py-2 px-4 text-sm font-mono text-red-800">{item.productId}</td>
                          <td className="py-2 px-4 text-sm text-red-700">{message}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              Fix & Retry ({results.failed.length})
            </button>
            
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start New Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}