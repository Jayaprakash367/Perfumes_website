import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Eye, Heart, Star, CheckCircle, ShieldCheck, Sparkles, Clock, Wind } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import FragrancePyramid from './FragrancePyramid';

export default function QuickViewModal({ product, isOpen, onClose, onOpenLightbox }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedVolume, setSelectedVolume] = useState('100 ML');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedVolume('100 ML');
      setQuantity(1);
    }
  }, [product]);

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

  if (!isOpen || !product) return null;

  const calculateVolumePrice = (basePrice, volume) => {
    if (volume === '50 ML') return Math.round(basePrice * 0.7);
    if (volume === '200 ML') return Math.round(basePrice * 1.6);
    return basePrice;
  };

  const currentPrice = calculateVolumePrice(product.price, selectedVolume);
  const currentOriginalPrice = calculateVolumePrice(product.originalPrice, selectedVolume);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVolume);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="modal-layout">
          {/* Left: Product Media */}
          <div className="modal-media-col">
            <div className="modal-image-container">
              <img src={product.image} alt={product.name} className="modal-image" />
              <button 
                className="modal-zoom-btn" 
                onClick={() => onOpenLightbox(product)}
                title="Expand full screen"
              >
                <Eye size={18} />
              </button>
              <button
                className={`modal-wish-btn ${isWishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={18} fill={isWishlisted ? '#b93b46' : 'none'} color={isWishlisted ? '#b93b46' : '#fff'} />
              </button>
              {product.isBestseller && <span className="modal-badge bestseller">Bestseller</span>}
            </div>

            <div className="modal-guarantees">
              <div className="guarantee-item">
                <ShieldCheck size={16} /> Direct Maison Bottling
              </div>
              <div className="guarantee-item">
                <CheckCircle size={16} /> Botanical Raw Essences
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="modal-info-col">
            <div className="modal-category">{product.category}</div>
            <h2 className="modal-title">{product.name}</h2>
            <p className="modal-subtitle">{product.subtitle}</p>

            <div className="modal-rating-row">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#d4af37" color="#d4af37" />
                ))}
              </div>
              <span className="rating-num">{product.rating}</span>
              <span className="reviews-text">({product.reviewsCount} reviews)</span>
            </div>

            <div className="modal-price-row">
              <span className="modal-price">₹{currentPrice}</span>
              {currentOriginalPrice > currentPrice && (
                <span className="modal-original-price">₹{currentOriginalPrice}</span>
              )}
              <span className="modal-discount-pill">
                Save ₹{currentOriginalPrice - currentPrice}
              </span>
            </div>

            <p className="modal-description">{product.description}</p>

            {/* Volume Selector */}
            <div className="modal-volume-group">
              <label className="group-label">Flacon Size:</label>
              <div className="volume-options">
                {['50 ML', '100 ML', '200 ML'].map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    className={`volume-pill ${selectedVolume === vol ? 'active' : ''}`}
                    onClick={() => setSelectedVolume(vol)}
                  >
                    <span>{vol}</span>
                    <span className="volume-price">₹{calculateVolumePrice(product.price, vol)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fragrance Metrics */}
            <div className="modal-metrics-grid">
              <div className="metric-box">
                <Clock size={16} className="metric-icon" />
                <div>
                  <span className="metric-label">Longevity</span>
                  <span className="metric-value">{product.longevity}</span>
                </div>
              </div>
              <div className="metric-box">
                <Wind size={16} className="metric-icon" />
                <div>
                  <span className="metric-label">Sillage</span>
                  <span className="metric-value">{product.sillage}</span>
                </div>
              </div>
              <div className="metric-box full-width">
                <Sparkles size={16} className="metric-icon" />
                <div>
                  <span className="metric-label">Ideal For</span>
                  <span className="metric-value">{product.perfectFor}</span>
                </div>
              </div>
            </div>

            {/* Olfactory Scent Pyramid */}
            <div className="modal-pyramid-wrap">
              <h4 className="section-label">Fragrance Pyramid</h4>
              <FragrancePyramid
                topNotes={product.topNotes}
                heartNotes={product.heartNotes}
                baseNotes={product.baseNotes}
              />
            </div>

            {/* Actions: Quantity + Add to Cart */}
            <div className="modal-purchase-actions">
              <div className="quantity-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button className="btn-add-cart" onClick={handleAddToCart}>
                <ShoppingBag size={18} />
                <span>Add to Cart • ₹{currentPrice * quantity}</span>
              </button>

              <Link
                to={`/product/${product.id}`}
                className="btn-full-details"
                onClick={onClose}
              >
                View Full Details &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
