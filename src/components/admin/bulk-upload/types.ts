export interface BulkUploadState {
  step: 'category' | 'images' | 'defaults' | 'preview' | 'uploading' | 'results';
  selectedCategory: Category | null;
  selectedFiles: File[];
  compressedFiles: CompressedFile[];
  idStrategy: 'sequential' | 'custom';
  startingNumber: number;
  bulkMetadata: BulkMetadata;
  products: BulkProduct[];
  isUploading: boolean;
  uploadProgress: UploadProgress;
  results: UploadResult | null;
}

export interface Category {
  id: string;
  label: string;
  subcategories: SubcategoryGroup[];
  display_order: number;
}

export interface SubcategoryGroup {
  id: string;
  label: string;
  options: SubcategoryOption[];
}

export interface SubcategoryOption {
  id: string;
  label: string;
}

export interface CompressedFile {
  originalFile: File;
  compressedFile: File;
  preview: string;
  id: string;
}

export interface BulkMetadata {
  description: string;
  tags: string;
  subcategories: Record<string, string>;
}

export interface BulkProduct {
  id: string;
  productId: string;
  productName: string;
  description: string;
  tags: string[];
  subcategories: Record<string, string>;
  categoryId: string;
  file: CompressedFile;
  hasError?: boolean;
  errorMessage?: string;
}

export interface UploadProgress {
  current: number;
  total: number;
  currentItem: string;
}

export interface UploadResult {
  successful: SuccessfulUpload[];
  failed: FailedUpload[];
}

export interface SuccessfulUpload {
  productId: string;
  productName: string;
  id: string;
}

export interface FailedUpload {
  productId: string;
  productName: string;
  error: string;
  file?: CompressedFile;
}

export interface IdConflict {
  productId: string;
  existingProduct?: {
    id: string;
    product_name: string;
  };
}