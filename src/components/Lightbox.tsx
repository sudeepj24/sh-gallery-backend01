import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Product } from '../config/categories';

interface LightboxProps {
  product: Product;
  allProducts: Product[];
  onClose: () => void;
  onNavigate: (product: Product) => void;
}

export default function Lightbox({ product, allProducts, onClose, onNavigate }: LightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageError, setImageError] = useState(false);

  const currentIndex = allProducts.findIndex(p => p.id === product.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allProducts.length - 1;
  const productNumber = product.id.split('-').pop()?.toUpperCase() || '';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrevious) onNavigate(allProducts[currentIndex - 1]);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(allProducts[currentIndex + 1]);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNavigate, currentIndex, allProducts, hasPrevious, hasNext]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && zoom > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button
          onClick={handleZoomIn}
          disabled={zoom >= 4}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={zoom <= 1}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-6 h-6 text-white" />
        </button>
        <div className="px-3 py-2 bg-white/10 rounded-full text-white text-sm font-medium">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {hasPrevious && (
        <button
          onClick={() => onNavigate(allProducts[currentIndex - 1])}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={() => onNavigate(allProducts[currentIndex + 1])}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      )}

      <div className="w-full h-full flex flex-col lg:flex-row">
        <div
          className="flex-1 lg:flex-1 h-3/4 lg:h-full flex items-center justify-center p-4 pt-16 lg:p-8 overflow-hidden"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-white">
              <div className="w-32 h-32 mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-white/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">Image placeholder</p>
              <p className="text-sm text-gray-400">{product.filename}</p>
            </div>
          ) : (
            <img
              src={product.path}
              alt={product.productName}
              onError={() => setImageError(true)}
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                maxWidth: zoom === 1 ? '100%' : 'none',
                maxHeight: zoom === 1 ? '100%' : 'none',
                objectFit: 'contain'
              }}
              className="select-none"
              draggable={false}
            />
          )}
        </div>

        <div className="h-1/4 lg:h-full lg:w-96 bg-black/50 backdrop-blur-sm p-4 lg:p-8 overflow-y-auto">
          <div className="inline-block bg-white px-3 py-1 rounded-md text-sm font-bold text-gray-900 mb-4">
            #{productNumber}
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">{product.productName}</h2>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase mb-2">Description</h3>
            <p className="text-gray-100 leading-relaxed">{product.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-300 uppercase mb-2">Category</h3>
            <p className="text-gray-100 capitalize">
              {product.mainCategory.replace(/-/g, ' ')}
            </p>
          </div>

          {Object.keys(product.subcategories).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 uppercase mb-2">Specifications</h3>
              <dl className="space-y-2">
                {Object.entries(product.subcategories).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <dt className="text-gray-400 capitalize">{key}:</dt>
                    <dd className="text-gray-100 capitalize">{value.replace(/-/g, ' ')}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 text-white text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
