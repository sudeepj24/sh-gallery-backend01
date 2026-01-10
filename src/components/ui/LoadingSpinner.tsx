import React from 'react';
import { Loader2, Camera } from 'lucide-react';

export type LoadingVariant = 'spinner' | 'gallery' | 'dots';
export type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8'
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

export default function LoadingSpinner({ 
  variant = 'spinner', 
  size = 'md', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const renderSpinner = () => {
    switch (variant) {
      case 'gallery':
        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Camera className="text-white" size={20} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        );
      
      case 'dots':
        return (
          <div className="flex gap-2">
            <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        );
      
      default:
        return (
          <div className="relative">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
            <div className="absolute inset-0 animate-ping">
              <div className={`${sizeClasses[size]} border-2 border-blue-300 rounded-full opacity-20`}></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-700 font-medium bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50`}>
          {text}
        </p>
      )}
    </div>
  );
}