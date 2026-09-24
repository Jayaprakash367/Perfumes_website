import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.volume || '100 ML');
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  // Extract up to 2-3 primary scent notes
  const notesList = product.topNotes 
    ? product.topNotes.split(',').slice(0, 3).map(n => n.trim()) 
    : [];

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-catalog-card">
      {/* Product Image Frame */}
      <div className="card-image-wrapper">
        <Link to={`/product/${product.id}`} className="card-image-link" aria-label={`View ${product.name}`}>
          <img
            src={product.image}
            alt={product.name}
            className={`card-image ${imageLoaded ? 'loaded' : 'loading'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = '/1.jpg';
              setImageLoaded(true);
            }}
          />
        </Link>

        {/* Card Badge Pills (Bestseller / Discount) */}
        <div className="card-badge-stack">
          {product.isBestseller && (
            <span className="card-badge-pill bestseller">Bestseller</span>
          )}
          {discountPercent > 0 && (
            <span className="card-badge-pill discount">−{discountPercent}%</span>
          )}
        </div>

        {/* Wishlist Heart */}
        <button
          type="button"
          className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart
            size={17}
            fill={isWishlisted ? '#b89628' : 'none'}
            stroke={isWishlisted ? '#b89628' : '#1e293b'}
            strokeWidth={2}
          />
        </button>

        {/* Hover Quick View Trigger */}
        {onQuickView && (
          <div className="card-hover-actions">
            <button
              type="button"
              className="btn-card-action"
              onClick={handleQuickViewClick}
              title="Quick preview details"
            >
              <Eye size={14} /> Quick View
            </button>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="card-content">
        <div className="card-meta-line">
          <span className="card-category">{product.category || 'Eau de Parfum'}</span>
          {product.rating && (
            <div className="card-rating">
              <Star size={13} fill="#b89628" color="#b89628" />
              <span className="rating-val">{product.rating}</span>
              {product.reviewsCount && (
                <span className="rating-count">({product.reviewsCount})</span>
              )}
            </div>
          )}
        </div>

        <h3 className="card-title">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Olfactive Notes Preview */}
        {notesList.length > 0 ? (
          <div className="card-notes-chips">
            {notesList.map((note, idx) => (
              <span key={idx} className="note-chip">{note}</span>
            ))}
          </div>
        ) : product.subtitle ? (
          <p className="card-subtitle-preview">{product.subtitle}</p>
        ) : null}

        {/* Price & Size Row */}
        <div className="card-price-row">
          <div className="price-stack">
            <span className="current-price">₹{(product.price || 0).toLocaleString()}</span>
            {product.originalPrice > product.price && (
              <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          <span className="volume-label">{product.volume || '100 ML'}</span>
        </div>

        {/* Direct Action Button to Prompt Purchase */}
        <button
          type="button"
          className={`card-direct-add-btn ${isAdded ? 'added' : ''}`}
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name} to bag`}
        >
          {isAdded ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>Added to Bag</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} />
              <span>Add to Bag</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
