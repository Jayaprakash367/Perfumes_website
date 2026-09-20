import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Eye, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

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

  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <div className="airbnb-listing-card">
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

        {/* Top-Left: Airbnb Guest Favorite / Bestseller Badge */}
        {product.isBestseller && (
          <div className="airbnb-guest-favorite-badge">
            <span>Guest favorite</span>
          </div>
        )}
        {product.isNew && !product.isBestseller && (
          <div className="airbnb-new-badge">
            <span>New harvest</span>
          </div>
        )}

        {/* Top-Right: Airbnb Wishlist Heart */}
        <button
          type="button"
          className={`airbnb-wishlist-heart ${isWishlisted ? 'favorited' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from saved' : 'Save this perfume'}
        >
          <Heart
            size={22}
            className="heart-icon"
            fill={isWishlisted ? '#ff385c' : 'rgba(0, 0, 0, 0.45)'}
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
            <Eye size={15} /> Quick View
          </button>
          <button 
            type="button" 
            className="airbnb-quick-action-btn primary"
            onClick={handleQuickAdd}
            title="Add 100 ML to cart"
          >
            <ShoppingBag size={15} /> Add
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
            <Star size={13} fill="#222222" color="#222222" />
            <span>{product.rating}</span>
          </div>
        </div>

        {/* Row 2: Category & Olfactory Notes */}
        <p className="listing-subtitle">
          {product.category} · {product.topNotes.split(',')[0]}
        </p>

        {/* Row 3: Longevity & Concentration */}
        <p className="listing-specs">
          {product.longevity} · Extrait de Parfum
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
