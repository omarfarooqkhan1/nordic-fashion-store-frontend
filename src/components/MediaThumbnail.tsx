import React from 'react';

interface MediaThumbnailProps {
  media: { url: string; type: 'image' | 'video' } | null;
  onClick?: () => void;
  className?: string;
}

const MediaThumbnail: React.FC<MediaThumbnailProps> = ({ media, onClick, className = '' }) => {
  return (
    <div
      className={`flex-shrink-0 flex items-center justify-center w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border relative cursor-pointer group ${className}`}
      onClick={media ? onClick : undefined}
      tabIndex={media ? 0 : -1}
      role={media ? 'button' : undefined}
      aria-label={media ? 'Open media preview' : undefined}
    >
      {media ? (
        media.type === 'image' ? (
          <img
            src={media.url}
            alt="media thumbnail"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
          />
        ) : (
          <>
            <video
              src={media.url}
              className="object-cover w-full h-full"
              style={{ pointerEvents: 'none' }}
              tabIndex={-1}
              muted
              playsInline
            />
            {/* Play icon overlay */}
            <span className="absolute inset-0 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="rgba(0,0,0,0.4)"/><polygon points="14,11 27,18 14,25" fill="#fff"/></svg>
            </span>
          </>
        )
      ) : (
        <span className="text-gray-400 text-3xl">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="100%" height="100%" rx="6" fill="#f3f4f6"/><path d="M12 7a2 2 0 100 4 2 2 0 000-4zm-7 9.2V17a2 2 0 002 2h10a2 2 0 002-2v-.8a2 2 0 00-.8-1.6l-2.4-1.8a2 2 0 00-2.4 0l-2.4 1.8a2 2 0 00-.8 1.6z" fill="#d1d5db"/></svg>
        </span>
      )}
    </div>
  );
};

export default MediaThumbnail;
