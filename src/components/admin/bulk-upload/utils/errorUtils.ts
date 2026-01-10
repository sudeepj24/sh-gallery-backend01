export const getDetailedErrorMessage = (error: string): { message: string; category: string; suggestion: string } => {
  const errorLower = error.toLowerCase();
  
  // Database constraint errors
  if (errorLower.includes('duplicate') || errorLower.includes('unique') || errorLower.includes('already exists')) {
    return {
      message: 'Product ID already exists',
      category: 'Duplicate Data',
      suggestion: 'Use a different Product ID or check existing products'
    };
  }
  
  // Storage/file errors
  if (errorLower.includes('file') || errorLower.includes('storage') || errorLower.includes('upload')) {
    if (errorLower.includes('size') || errorLower.includes('large')) {
      return {
        message: 'File size too large',
        category: 'File Size',
        suggestion: 'Compress the image or use a smaller file'
      };
    }
    if (errorLower.includes('format') || errorLower.includes('type')) {
      return {
        message: 'Unsupported file format',
        category: 'File Format',
        suggestion: 'Use JPG, PNG, or WebP format'
      };
    }
    return {
      message: 'File upload failed',
      category: 'Storage Error',
      suggestion: 'Check file integrity and try again'
    };
  }
  
  // Network errors
  if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('timeout')) {
    return {
      message: 'Network connection failed',
      category: 'Network Error',
      suggestion: 'Check your internet connection and retry'
    };
  }
  
  // Permission errors
  if (errorLower.includes('permission') || errorLower.includes('unauthorized') || errorLower.includes('forbidden')) {
    return {
      message: 'Access denied',
      category: 'Permission Error',
      suggestion: 'Contact administrator for access rights'
    };
  }
  
  // Database errors
  if (errorLower.includes('database') || errorLower.includes('sql') || errorLower.includes('constraint')) {
    return {
      message: 'Database operation failed',
      category: 'Database Error',
      suggestion: 'Verify data format and try again'
    };
  }
  
  // Generic fallback
  return {
    message: error || 'Unknown error occurred',
    category: 'General Error',
    suggestion: 'Please try again or contact support'
  };
};