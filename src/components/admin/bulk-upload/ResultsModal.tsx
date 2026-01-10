import React from 'react';
import { CheckCircle, XCircle, RefreshCw, X, ExternalLink } from 'lucide-react';
import { UploadResult } from './types';

interface ResultsModalProps {
  results: UploadResult;
  onClose: () => void;
  onRetry: () => void;
}

export default function ResultsModal({ results, onClose, onRetry }: ResultsModalProps) {
  const totalUploaded = results.successful.length;
  const totalFailed = results.failed.length;
  const totalAttempted = totalUploaded + totalFailed;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Upload Complete</h2>
              <p className="text-gray-600">
                {totalUploaded} of {totalAttempted} products uploaded successfully
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Success Card */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="text-green-600" size={24} />
                <h3 className="font-medium text-green-900">Successful Uploads</h3>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">{totalUploaded}</div>
              <p className="text-sm text-green-700">Products successfully added to gallery</p>
            </div>

            {/* Failure Card */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="text-red-600" size={24} />
                <h3 className="font-medium text-red-900">Failed Uploads</h3>
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">{totalFailed}</div>
              <p className="text-sm text-red-700">Products that couldn't be uploaded</p>
            </div>
          </div>

          {/* Successful Uploads */}
          {results.successful.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                Successfully Uploaded ({results.successful.length})
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-green-100 border-b border-green-200">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm font-medium text-green-800">Product Name</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-green-800">Product ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.successful.map((item, index) => (
                        <tr key={index} className="border-b border-green-200 last:border-b-0">
                          <td className="py-2 px-4 text-sm text-green-800">{item.productName}</td>
                          <td className="py-2 px-4 text-sm font-mono text-green-800">{item.productId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Failed Uploads */}
          {results.failed.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="text-red-600" size={20} />
                Failed Uploads ({results.failed.length})
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-red-100 border-b border-red-200">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm font-medium text-red-800">Product Name</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-red-800">Product ID</th>
                        <th className="text-left py-2 px-4 text-sm font-medium text-red-800">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.failed.map((item, index) => (
                        <tr key={index} className="border-b border-red-200 last:border-b-0">
                          <td className="py-2 px-4 text-sm text-red-800">{item.productName}</td>
                          <td className="py-2 px-4 text-sm font-mono text-red-800">{item.productId}</td>
                          <td className="py-2 px-4 text-sm text-red-700">
                            {item.error.includes('already exists') ? (
                              <span className="flex items-center gap-1">
                                <span>Duplicate Product ID</span>
                              </span>
                            ) : (
                              item.error
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {results.successful.length > 0 && (
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <ExternalLink size={16} />
                View Gallery
              </a>
            )}
            
            {results.failed.length > 0 && (
              <button
                onClick={onRetry}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                Retry Failed ({results.failed.length})
              </button>
            )}
            
            <button
              onClick={onClose}
              className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {results.successful.length > 0 ? 'Start New Upload' : 'Close'}
            </button>
          </div>

          {/* Tips */}
          {results.failed.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Failed Uploads</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Duplicate Product ID:</strong> Change the Product ID to a unique value</li>
                <li>• <strong>Image too large:</strong> Try compressing the image further or use a different image</li>
                <li>• <strong>Network error:</strong> Check your internet connection and try again</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}