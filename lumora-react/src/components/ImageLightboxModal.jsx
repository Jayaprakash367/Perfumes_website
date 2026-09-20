import React, { useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

export default function ImageLightboxModal({ isOpen, image, title, price, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close image zoom">
          <X size={24} />
        </button>

        <div className="lightbox-image-wrapper">
          <img src={image} alt={title} className="lightbox-img" />
        </div>

        <div className="lightbox-info">
          <div className="lightbox-title-wrap">
            <h3 className="lightbox-title">{title}</h3>
            {price && <span className="lightbox-price">₹{price}</span>}
          </div>
          <span className="lightbox-hint">
            <ZoomIn size={14} /> High-Resolution Flacon Preview
          </span>
        </div>
      </div>
    </div>
  );
}
