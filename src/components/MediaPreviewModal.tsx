import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface MediaPreviewModalProps {
  open: boolean;
  onClose: () => void;
  media: { url: string; type: 'image' | 'video' } | null;
  allMedia?: { url: string; type: 'image' | 'video' }[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({ 
  open, 
  onClose, 
  media,
  allMedia = [],
  currentIndex = 0,
  onNavigate
}) => {
  const [isZooming, setIsZooming] = React.useState(false);
  const [zoomPosition, setZoomPosition] = React.useState({ x: 0, y: 0 });

  if (!open || !media) return null;

  const hasMultipleMedia = allMedia.length > 1;
  const canGoPrev = hasMultipleMedia && currentIndex > 0;
  const canGoNext = hasMultipleMedia && currentIndex < allMedia.length - 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoPrev && onNavigate) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canGoNext && onNavigate) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZooming) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && canGoPrev && onNavigate) {
      onNavigate(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && canGoNext && onNavigate) {
      onNavigate(currentIndex + 1);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  React.useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, currentIndex, canGoPrev, canGoNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-8" onClick={e => e.stopPropagation()}>
        {/* Media content with buttons overlaid */}
        <div className="relative flex items-center justify-center max-w-full max-h-full group">
          {media.type === 'image' ? (
            <div
              className="relative overflow-hidden"
              style={{ cursor: isZooming ? 'zoom-out' : 'zoom-in' }}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: isZooming ? `url(${media.url})` : 'none',
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundSize: '250%',
                  backgroundRepeat: 'no-repeat',
                  transition: 'background-position 0.1s ease-out',
                }}
              >
                <img
                  src={media.url}
                  alt="media preview"
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                  style={{
                    opacity: isZooming ? 0 : 1,
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                />
              </div>
            </div>
          ) : (
            <video
              src={
                media.url.startsWith('http://') || media.url.startsWith('https://') 
                  ? media.url 
                  : `${import.meta.env.VITE_BACKEND_URL}${media.url.startsWith('/') ? media.url : `/${media.url}`}`
              }
              className="max-h-[90vh] max-w-[90vw] object-contain"
              controls
              autoPlay
            />
          )}

          {/* Close button - top right of image */}
          <button
            className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
            onClick={onClose}
            onMouseEnter={() => setIsZooming(false)}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Previous button - left side of image */}
          {hasMultipleMedia && canGoPrev && (
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
              onClick={handlePrev}
              onMouseEnter={() => setIsZooming(false)}
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next button - right side of image */}
          {hasMultipleMedia && canGoNext && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
              onClick={handleNext}
              onMouseEnter={() => setIsZooming(false)}
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Counter - bottom center of image */}
          {hasMultipleMedia && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-all">
              {currentIndex + 1} / {allMedia.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewModal;
