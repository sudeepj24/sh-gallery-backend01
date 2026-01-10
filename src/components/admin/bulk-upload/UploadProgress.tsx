import React, { useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { BulkProduct, UploadResult } from './types';
import LoadingSpinner from '../../ui/LoadingSpinner';

interface UploadProgressProps {
  products: BulkProduct[];
  onComplete: (results: UploadResult) => void;
}

export default function UploadProgressComponent({
  products,
  onComplete
}: UploadProgressProps) {
  const hasCompleted = useRef(false);

  useEffect(() => {
    // Reset on mount
    hasCompleted.current = false;
    startUpload();
  }, []);

  const startUpload = async () => {
    const successful: any[] = [];
    const failed: any[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      try {
        // Upload image to storage
        const fileExt = product.file.compressedFile.type === 'image/webp' ? 'webp' : 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
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
          id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

        if (dbError) {
          // Check if this is a duplicate product_id error
          if (dbError.message?.includes('duplicate') || dbError.code === '23505') {
            // This is a true duplicate - product_id already exists
            await supabase.storage
              .from('gallery-images')
              .remove([storagePath]);
            throw new Error(`Product ID ${product.productId} already exists`);
          }
          
          // For other errors, check if product was actually inserted despite error (race condition)
          const { data: checkProduct } = await supabase
            .from('products')
            .select('id, path')
            .eq('product_id', product.productId)
            .single();
          
          if (checkProduct && checkProduct.path === publicUrl) {
            // Product was actually inserted successfully (same image path confirms it's our upload)
            successful.push({
              productId: product.productId,
              productName: product.productName,
              id: checkProduct.id
            });
          } else {
            // Product truly failed, clean up storage
            await supabase.storage
              .from('gallery-images')
              .remove([storagePath]);
            throw dbError;
          }
        } else {
          successful.push({
            productId: product.productId,
            productName: product.productName,
            id: productData.id
          });
        }

      } catch (error) {
        console.error(`Error uploading ${product.productName}:`, error);
        
        let errorMessage = 'Upload failed';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          errorMessage = (error as any).message || JSON.stringify(error);
        }
        
        failed.push({
          productId: product.productId,
          productName: product.productName,
          error: errorMessage,
          file: product.file
        });
      }
    }

    // Call onComplete ONLY ONCE
    if (!hasCompleted.current) {
      hasCompleted.current = true;
      onComplete({ successful, failed });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text="Uploading products..." variant="gallery" />
    </div>
  );
}