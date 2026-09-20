import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  Share2, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  Wind, 
  Award,
  Grid,
  ChevronRight,
  Info
} from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import ImageLightboxModal from '../components/ImageLightboxModal';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const product = products.find((p) => p.id === parseInt(id)) || products[0];

  const [selectedVolume, setSelectedVolume] = useState('100 ML');
  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSelectedVolume('100 ML');
    setQuantity(1);
  }, [id]);

  const calculateVolumePrice = (basePrice, volume) => {
    if (volume === '50 ML') return Math.round(basePrice * 0.7);
    if (volume === '200 ML') return Math.round(basePrice * 1.6);
    return basePrice;
  };

  const currentPrice = calculateVolumePrice(product.price, selectedVolume);
  const currentOriginalPrice = calculateVolumePrice(product.originalPrice, selectedVolume);
  const isWishlisted = isInWishlist(product.id);

  // 5 photos for Airbnb Collage Grid:
  // 1 main product image + 4 related images
  const relatedImages = [
    product.image,
    '/s1UY-unsplash.jpg',
    '/laura-chouette-4sKdeIMiFEI-unsplash.jpg',
    '/pesce-huang-mq73cWf9ZAQ-unsplash.jpg',
    '/s3-unsplash.jpg'
  ];

  const handleReserve = () => {
    addToCart(product, quantity, selectedVolume);
    navigate('/cart');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Listing URL copied to clipboard!', 'info');
    }
  };

  const relatedFragrances = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="airbnb-detail-page">
      {/* 1. Airbnb Header Bar: Title, Rating, Share & Save */}
      <div className="airbnb-detail-header">
        <h1 className="airbnb-listing-heading">
          {product.name} — {product.subtitle}
        </h1>

        <div className="airbnb-header-subrow">
          <div className="header-meta-left">
            <span className="rating-badge-item">
              <Star size={14} fill="#222" color="#222" /> <strong>{product.rating}</strong>
            </span>
            <span className="meta-separator">·</span>
            <a href="#reviews" className="meta-reviews-link">
              <u>{product.reviewsCount} reviews</u>
            </a>
            <span className="meta-separator">·</span>
            {product.isBestseller && (
              <>
                <span className="guest-favorite-text">
                  <Award size={14} className="guest-favorite-icon" /> Guest favorite
                </span>
                <span className="meta-separator">·</span>
              </>
            )}
            <span className="meta-location">Grasse & Paris Atelier, France</span>
          </div>

          <div className="header-meta-right">
            <button type="button" className="btn-airbnb-action" onClick={handleShare}>
              <Share2 size={16} /> <u>Share</u>
            </button>
            <button
              type="button"
              className={`btn-airbnb-action ${isWishlisted ? 'saved' : ''}`}
              onClick={() => toggleWishlist(product)}
            >
              <Heart
                size={16}
                fill={isWishlisted ? '#ff385c' : 'none'}
                color={isWishlisted ? '#ff385c' : '#222'}
              />
              <u>{isWishlisted ? 'Saved' : 'Save'}</u>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Iconic Airbnb 5-Photo Collage Showcase */}
      <div className="airbnb-photo-collage" onClick={() => setLightboxOpen(true)}>
        <div className="collage-main-photo">
          <img src={relatedImages[0]} alt={product.name} />
        </div>
        <div className="collage-side-grid">
          <div className="side-photo"><img src={relatedImages[1]} alt="Atelier distillation" /></div>
          <div className="side-photo"><img src={relatedImages[2]} alt="Botanical extracts" /></div>
          <div className="side-photo"><img src={relatedImages[3]} alt="Luxury presentation" /></div>
          <div className="side-photo"><img src={relatedImages[4]} alt="Scent notes" /></div>
        </div>
        <button
          type="button"
          className="btn-show-all-photos"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
        >
          <Grid size={15} /> Show all 5 photos
        </button>
      </div>

      {/* 3. Main Detail Layout (Left: Info & Notes, Right: Floating Reservation Card) */}
      <div className="airbnb-detail-layout">
        {/* Left Column */}
        <div className="detail-primary-content">
          {/* Host / Atelier Summary */}
          <div className="airbnb-host-row">
            <div>
              <h2 className="host-heading">
                Artisanal Flacon hand-poured by Master Perfumer Alexandre Dubois
              </h2>
              <p className="host-subline">
                30% Pure Parfum concentration · {product.volume} · Eau de Parfum Extrait
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
              alt="Alexandre Dubois"
              className="host-avatar-circle"
            />
          </div>

          <hr className="airbnb-divider" />

          {/* Key Amenities Highlights (Airbnb format) */}
          <div className="airbnb-highlights-list">
            <div className="highlight-item">
              <Sparkles size={24} className="highlight-svg" />
              <div>
                <h4>Pure Botanical Extracts</h4>
                <p>100% natural essential oils harvested from private Grasse and Taif rose valleys.</p>
              </div>
            </div>

            <div className="highlight-item">
              <Clock size={24} className="highlight-svg" />
              <div>
                <h4>Extraordinary 12-Hour Skin Sillage</h4>
                <p>95% of recent connoisseurs gave this flacon a 5-star rating for longevity.</p>
              </div>
            </div>

            <div className="highlight-item">
              <RefreshCw size={24} className="highlight-svg" />
              <div>
                <h4>Complimentary 2ml Discovery Vial Included</h4>
                <p>Test the enclosed sample on your skin before opening the master flacon seal. Full 30-day returns.</p>
              </div>
            </div>
          </div>

          <hr className="airbnb-divider" />

          {/* Olfactory Pyramid (Where you'll sleep cards format) */}
          <section className="scent-breakdown-section">
            <h3 className="section-title-airbnb">Fragrance note evolution</h3>
            <p className="section-subtitle-airbnb">How this scent reveals itself over 12 hours on skin</p>

            <div className="airbnb-cards-row">
              <div className="breakdown-card">
                <span className="card-phase">Phase 01 · 0-15 Min</span>
                <h4 className="card-phase-title">Top Notes</h4>
                <p className="card-phase-text">{product.topNotes}</p>
                <span className="card-phase-note">Initial sparkling radiance</span>
              </div>

              <div className="breakdown-card">
                <span className="card-phase">Phase 02 · 15 Min - 4 Hr</span>
                <h4 className="card-phase-title">Heart Notes</h4>
                <p className="card-phase-text">{product.heartNotes}</p>
                <span className="card-phase-note">Core sensual body</span>
              </div>

              <div className="breakdown-card">
                <span className="card-phase">Phase 03 · 4 - 12+ Hr</span>
                <h4 className="card-phase-title">Base Notes</h4>
                <p className="card-phase-text">{product.baseNotes}</p>
                <span className="card-phase-note">Enduring memory trail</span>
              </div>
            </div>
          </section>

          <hr className="airbnb-divider" />

          {/* Description Section with Show More */}
          <section className="airbnb-desc-section">
            <h3 className="section-title-airbnb">About this creation</h3>
            <p className={`desc-paragraph ${showFullDesc ? 'expanded' : ''}`}>
              {product.description} Hand-crafted in small batches of only five hundred flacons per seasonal distillation. Each bottle is individually numbered with a master perfumer certificate of authenticity, sealed with organic beeswax, and presented in our signature embossed luxury gift box.
            </p>
            <button
              type="button"
              className="btn-show-more"
              onClick={() => setShowFullDesc(!showFullDesc)}
            >
              <u>{showFullDesc ? 'Show less' : 'Show more'}</u> <ChevronRight size={16} />
            </button>
          </section>

          <hr className="airbnb-divider" />

          {/* What this fragrance offers (Amenities Grid) */}
          <section className="amenities-section">
            <h3 className="section-title-airbnb">What this luxury flacon offers</h3>
            <div className="amenities-grid">
              <div className="amenity-item">
                <CheckCircle size={20} /> 100% Vegan & Cruelty-Free
              </div>
              <div className="amenity-item">
                <Award size={20} /> Numbered Certificate of Authenticity
              </div>
              <div className="amenity-item">
                <Truck size={20} /> Complimentary Express Insured Dispatch
              </div>
              <div className="amenity-item">
                <RefreshCw size={20} /> 30-Day Money-Back Guarantee
              </div>
              <div className="amenity-item">
                <Sparkles size={20} /> Signature Gold Embossed Presentation Case
              </div>
              <div className="amenity-item">
                <ShieldCheck size={20} /> 2ml Sealed Skin-Test Discovery Sample
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Airbnb Floating Sticky Reservation Box */}
        <aside className="detail-sticky-column">
          <div className="airbnb-reservation-card">
            <div className="reservation-card-header">
              <div className="reservation-price">
                <span className="price-amount">₹{currentPrice.toLocaleString()}</span>
                <span className="price-unit">/ {selectedVolume}</span>
              </div>

              <div className="reservation-rating">
                <Star size={13} fill="#222" color="#222" />
                <strong>{product.rating}</strong>
                <span className="rev-num">({product.reviewsCount})</span>
              </div>
            </div>

            {/* Picker Box (Airbnb check-in / guests box) */}
            <div className="airbnb-picker-box">
              <div className="picker-row top">
                <div className="picker-cell full">
                  <label>FLACON VOLUME</label>
                  <select
                    value={selectedVolume}
                    onChange={(e) => setSelectedVolume(e.target.value)}
                    className="picker-select"
                  >
                    <option value="50 ML">50 ML Extrait (₹{calculateVolumePrice(product.price, '50 ML')})</option>
                    <option value="100 ML">100 ML Extrait (₹{product.price}) — Standard</option>
                    <option value="200 ML">200 ML Flacon (₹{calculateVolumePrice(product.price, '200 ML')}) — Prestige</option>
                  </select>
                </div>
              </div>

              <div className="picker-row bottom">
                <div className="picker-cell full">
                  <label>QUANTITY</label>
                  <div className="quantity-inline-stepper">
                    <span>{quantity} flacon{quantity > 1 ? 's' : ''}</span>
                    <div className="stepper-mini-btns">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reserve Button (Iconic Airbnb Gradient Pill) */}
            <button
              type="button"
              className="btn-airbnb-reserve"
              onClick={handleReserve}
            >
              Reserve Flacon
            </button>

            <p className="reservation-hint">You won't be charged yet</p>

            {/* Transparent Cost Calculation Breakdown */}
            <div className="reservation-cost-breakdown">
              <div className="cost-row">
                <span>₹{currentPrice.toLocaleString()} × {quantity} flacon{quantity > 1 ? 's' : ''}</span>
                <span>₹{(currentPrice * quantity).toLocaleString()}</span>
              </div>
              <div className="cost-row">
                <span>Express Insured Delivery</span>
                <span className="free-tag">Free</span>
              </div>
              <div className="cost-row">
                <span>Bespoke Gift Packaging</span>
                <span className="free-tag">Free</span>
              </div>
              <div className="cost-row">
                <span>Haute Parfumerie Taxes</span>
                <span>Included</span>
              </div>

              <hr className="cost-divider" />

              <div className="cost-row total-row">
                <strong>Total before discounts</strong>
                <strong>₹{(currentPrice * quantity).toLocaleString()}</strong>
              </div>
            </div>

            <div className="reservation-rare-notice">
              <Info size={15} />
              <span>Only 14 hand-poured flacons remaining in this seasonal harvest.</span>
            </div>
          </div>
        </aside>
      </div>

      {/* 4. Airbnb Reviews Summary Grid */}
      <section className="airbnb-reviews-section" id="reviews">
        <hr className="airbnb-divider" />
        <div className="reviews-section-header">
          <Star size={22} fill="#222" color="#222" />
          <h2>{product.rating} · {product.reviewsCount} reviews</h2>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="rating-bars-grid">
          <div className="rating-bar-item">
            <span>Skin Longevity</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: '99%' }}></div></div>
            <span>5.0</span>
          </div>
          <div className="rating-bar-item">
            <span>Sillage Presence</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: '96%' }}></div></div>
            <span>4.9</span>
          </div>
          <div className="rating-bar-item">
            <span>Natural Ingredients</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: '98%' }}></div></div>
            <span>4.9</span>
          </div>
          <div className="rating-bar-item">
            <span>Flacon Presentation</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: '100%' }}></div></div>
            <span>5.0</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="airbnb-reviews-grid">
          <div className="review-box">
            <div className="review-author">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" alt="Eleanor" />
              <div>
                <strong>Eleanor Vance</strong>
                <span>London, United Kingdom · September 2026</span>
              </div>
            </div>
            <p>
              "An absolute masterpiece. From the initial sparkling citrus opening to the deep, lingering base notes of amber and sandalwood twelve hours later, this is hands down the most complimented perfume in my collection."
            </p>
          </div>

          <div className="review-box">
            <div className="review-author">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="Marcus" />
              <div>
                <strong>Marcus Thorne</strong>
                <span>Zurich, Switzerland · August 2026</span>
              </div>
            </div>
            <p>
              "The presentation flacon is heavy, magnetic, and feels like pure luxury. Having the 2ml trial vial enclosed gave me total confidence to test it first. Will be ordering the 200ml size next."
            </p>
          </div>
        </div>
      </section>

      {/* 5. Related Fragrances */}
      {relatedFragrances.length > 0 && (
        <section className="airbnb-related-section">
          <hr className="airbnb-divider" />
          <h2 className="related-title">More fragrances you may adore</h2>
          <div className="airbnb-products-grid">
            {relatedFragrances.map((frag) => (
              <ProductCard key={frag.id} product={frag} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        image={product.image}
        title={product.name}
        price={currentPrice}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
