import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Eye, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, '100 ML');
  };

  return (
    <div className="haute-product-card airbnb-listing-card">
      {/* Photo Container with Shimmer Skeleton */}
      <div className={`listing-photo-box ${!imageLoaded ? 'is-loading-skeleton' : ''}`}>
        <Link to={`/product/${product.id}`} className="listing-photo-link">
          <img
            src={product.image}
            alt={product.name}
            className={`listing-image ${imageLoaded ? 'img-fade-in' : 'img-pre-load'}`}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = '/1.jpg';
              setImageLoaded(true);
            }}
          />
        </Link>

        {/* Top-Left: Haute Accolade Badge */}
        {product.isBestseller && (
          <div className="airbnb-guest-favorite-badge haute-card-badge">
            <Sparkles size={11} className="badge-sparkle" />
            <span>Maison Favorite</span>
          </div>
        )}
        {product.isNew && !product.isBestseller && (
          <div className="airbnb-new-badge haute-new-badge">
            <span>New Harvest</span>
          </div>
        )}

        {/* Top-Right: Gold Wishlist Heart */}
        <button
          type="button"
          className={`airbnb-wishlist-heart ${isWishlisted ? 'favorited' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from private collection' : 'Save to private collection'}
        >
          <Heart
            size={20}
            className="heart-icon"
            fill={isWishlisted ? '#b89628' : 'rgba(0, 0, 0, 0.4)'}
            stroke="#ffffff"
            strokeWidth={2}
          />
        </button>

        {/* Hover Quick View Pill */}
        <div className="listing-hover-overlay">
          <button
            type="button"
            className="airbnb-quick-action-btn"
            onClick={handleQuickViewClick}
            title="Inspect fragrance notes"
          >
            <Eye size={14} /> Quick View
          </button>
          <button
            type="button"
            className="airbnb-quick-action-btn primary"
            onClick={handleQuickAdd}
            title="Add 100 ML to cart"
          >
            <ShoppingBag size={14} /> Add to Bag
          </button>
        </div>
      </div>

      {/* Listing Content Details */}
      <div className="listing-details">
        {/* Row 1: Title + Star Rating */}
        <div className="listing-row-primary">
          <h3 className="listing-title">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <div className="listing-rating">
            <Star size={12} fill="#b89628" color="#b89628" />
            <span>{product.rating}</span>
          </div>
        </div>

        {/* Row 2: Category & Olfactory Notes */}
        <p className="listing-subtitle">
          {product.category} · {product.topNotes ? product.topNotes.split(',')[0] : ''}
        </p>

        {/* Row 3: Longevity & Concentration */}
        <p className="listing-specs">
          {product.longevity || '12+ Hours'} · Extrait de Parfum
        </p>

        {/* Row 4: Pricing */}
        <div className="listing-price-row">
          <span className="price-bold">₹{product.price.toLocaleString()}</span>
          <span className="price-period">/ 100 ML</span>
          {product.originalPrice > product.price && (
            <span className="price-struck">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
