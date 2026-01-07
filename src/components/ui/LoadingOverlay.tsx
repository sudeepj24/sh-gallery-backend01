import React from 'react';
import LoadingSpinner, { LoadingVariant, LoadingSize } from './LoadingSpinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  variant?: LoadingVariant;
  size?: LoadingSize;
  className?: string;
}

export default function LoadingOverlay({ 
  isVisible, 
  text = 'Loading...', 
  variant = 'spinner',
  size = 'lg',
  className = ''
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={`absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg ${className}`}>
      <LoadingSpinner 
        variant={variant} 
        size={size} 
        text={text}
      />
    </div>
  );
}