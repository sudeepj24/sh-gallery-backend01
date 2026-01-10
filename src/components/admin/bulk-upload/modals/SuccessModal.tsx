import React from 'react';
import { CheckCircle, X, ExternalLink } from 'lucide-react';
import { UploadResult } from '../types';

interface SuccessModalProps {
  results: UploadResult;
  onClose: () => void;
}

export default function SuccessModal({ results, onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-green-900">Upload Successful!</h2>
                <p className="text-green-700">
                  {results.successful.length} product{results.successful.length !== 1 ? 's' : ''} uploaded successfully
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          {/* Success Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{results.successful.length}</div>
              <p className="text-green-800">Products successfully added to your gallery</p>
            </div>
          </div>

          {/* Successful Products List */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Uploaded Products</h3>
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <ExternalLink size={16} />
              View Gallery
            </a>
            
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