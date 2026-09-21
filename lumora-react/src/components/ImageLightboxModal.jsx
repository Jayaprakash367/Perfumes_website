import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export default function ImageLightboxModal({
  isOpen,
  images = [],
  image,
  initialIndex = 0,
  title,
  subtitle,
  price,
  onClose
}) {
  const imageList = images.length > 0 ? images : (image ? [image] : []);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, imageList.length, onClose]);

  if (!isOpen || imageList.length === 0) return null;

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const currentImg = imageList[currentIndex];

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox-container haute-lightbox" onClick={(e) => e.stopPropagation()}>
        {/* Top bar controls */}
        <div className="lightbox-top-bar">
          <div className="lightbox-counter">
            <span>{currentIndex + 1}</span> / <span>{imageList.length}</span>
            {subtitle && <span className="lightbox-tag-caption">· {subtitle}</span>}
          </div>
          <div className="lightbox-actions-group">
            <button
              type="button"
              className={`lightbox-btn-icon ${isZoomed ? 'active' : ''}`}
              onClick={() => setIsZoomed(!isZoomed)}
              title={isZoomed ? 'Reset zoom' : 'Zoom in'}
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              className="lightbox-close"
              onClick={onClose}
              aria-label="Close image zoom"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main stage with prev/next controls */}
        <div className="lightbox-stage">
          {imageList.length > 1 && (
            <button
              type="button"
              className="lightbox-nav-btn prev"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              <ChevronLeft size={26} />
            </button>
          )}

          <div
            className={`lightbox-image-wrapper ${isZoomed ? 'zoomed-in' : ''}`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={typeof currentImg === 'string' ? currentImg : currentImg?.url}
              alt={title || 'Flacon detail'}
              className="lightbox-img"
            />
          </div>

          {imageList.length > 1 && (
            <button
              type="button"
              className="lightbox-nav-btn next"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight size={26} />
            </button>
          )}
        </div>

        {/* Bottom bar with titles & thumbnail track */}
        <div className="lightbox-footer">
          <div className="lightbox-title-wrap">
            <div>
              <h3 className="lightbox-title">{title}</h3>
              {typeof currentImg === 'object' && currentImg?.caption && (
                <p className="lightbox-img-desc">{currentImg.caption}</p>
              )}
            </div>
            {price && <span className="lightbox-price">₹{price.toLocaleString()}</span>}
          </div>

          {imageList.length > 1 && (
            <div className="lightbox-thumbnails-strip">
              {imageList.map((imgItem, idx) => {
                const src = typeof imgItem === 'string' ? imgItem : imgItem?.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`lightbox-thumb-btn ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => {
                      setIsZoomed(false);
                      setCurrentIndex(idx);
                    }}
                  >
                    <img src={src} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
