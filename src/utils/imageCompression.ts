import imageCompression from 'browser-image-compression';
import heic2any from 'heic2any';

export interface CompressionProgress {
  progress: number;
  message: string;
}

export interface CompressionResult {
  success: boolean;
  file?: File;
  error?: string;
}

export const compressImage = async (
  file: File,
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult> => {
  try {
    // Validate file type
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';
    if (!file.type.startsWith('image/') && !isHeic) {
      return { success: false, error: 'Please select a valid image file.' };
    }

    onProgress?.({ progress: 5, message: 'Processing image...' });

    // Convert HEIC to JPEG if needed
    let processFile = file;
    if (isHeic) {
      try {
        onProgress?.({ progress: 10, message: 'Converting HEIC format...' });
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        }) as Blob;
        processFile = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
          type: 'image/jpeg'
        });
        onProgress?.({ progress: 20, message: 'HEIC converted successfully...' });
      } catch (heicError) {
        console.error('HEIC conversion error:', heicError);
        return { success: false, error: 'Failed to convert HEIC image. Please try a different format.' };
      }
    }

    onProgress?.({ progress: 25, message: 'Processing image...' });

    // Primary compression options (WebP)
    const webpOptions = {
      maxSizeMB: 0.25, // 250KB
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'image/webp' as const,
      initialQuality: 0.8,
      onProgress: (progress: number) => {
        onProgress?.({ 
          progress: 10 + (progress * 0.7), 
          message: 'Processing image...' 
        });
      }
    };

    onProgress?.({ progress: 30, message: 'Processing image...' });

    let compressedFile: File;
    
    try {
      // Try WebP compression first
      compressedFile = await imageCompression(processFile, webpOptions);
      
      // If still too large, try with reduced quality
      if (compressedFile.size > 250 * 1024) {
        onProgress?.({ progress: 50, message: 'Processing image...' });
        
        const reducedOptions = {
          ...webpOptions,
          initialQuality: 0.7,
          maxWidthOrHeight: 1100
        };
        
        compressedFile = await imageCompression(file, reducedOptions);
      }
      
    } catch (webpError) {
      // Fallback to JPEG if WebP fails
      onProgress?.({ progress: 60, message: 'Processing image...' });
      
      const jpegOptions = {
        maxSizeMB: 0.25,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
        initialQuality: 0.75,
        onProgress: (progress: number) => {
          onProgress?.({ 
            progress: 60 + (progress * 0.3), 
            message: 'Processing image...' 
          });
        }
      };
      
      compressedFile = await imageCompression(processFile, jpegOptions);
    }

    // Final size check and emergency compression
    if (compressedFile.size > 250 * 1024) {
      onProgress?.({ progress: 85, message: 'Processing image...' });
      
      const emergencyOptions = {
        maxSizeMB: 0.25,
        maxWidthOrHeight: 1000,
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
        initialQuality: 0.6
      };
      
      compressedFile = await imageCompression(file, emergencyOptions);
    }

    onProgress?.({ progress: 100, message: 'Image ready!' });

    // Final validation
    if (compressedFile.size > 250 * 1024) {
      return { 
        success: false, 
        error: 'Unable to compress image to required size. Please try a different image.' 
      };
    }

    return { success: true, file: compressedFile };

  } catch (error) {
    console.error('Image compression error:', error);
    return { 
      success: false, 
      error: 'Failed to process image. Please try a different image.' 
    };
  }
};