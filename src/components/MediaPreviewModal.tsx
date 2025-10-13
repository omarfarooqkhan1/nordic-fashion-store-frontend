import React from 'react';

interface MediaPreviewModalProps {
  open: boolean;
  onClose: () => void;
  media: { url: string; type: 'image' | 'video' } | null;
}

const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({ open, onClose, media }) => {
  if (!open || !media) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-lg p-2 max-w-full max-h-full flex items-center justify-center relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        {media.type === 'image' ? (
          <img
            src={media.url}
            alt="media preview"
            className="max-h-[80vh] max-w-[80vw] object-contain"
          />
        ) : (
          <video
            src={
              media.url.startsWith('http://') || media.url.startsWith('https://') 
                ? media.url 
                : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}${media.url.startsWith('/') ? media.url : `/${media.url}`}`
            }
            className="max-h-[80vh] max-w-[80vw] object-contain"
            controls
            autoPlay
          />
        )}
      </div>
    </div>
  );
};

export default MediaPreviewModal;
