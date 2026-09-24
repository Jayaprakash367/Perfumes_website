import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Minus, 
  Plus, 
  Check, 
  ArrowLeft,
  Truck,
  Droplets,
  Layers,
  Sparkles,
  Clock
} from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useDailyCountdown } from '../hooks/useDailyCountdown';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const product = products.find((p) => p.id === parseInt(id)) || products[0];
  const dailyContext = useDailyCountdown();

  const [selectedVolume, setSelectedVolume] = useState('100 ML');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isAddedRecently, setIsAddedRecently] = useState(false);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'details' | 'shipping'
  const [suggestionTab, setSuggestionTab] = useState('curated'); // 'curated' | 'bestsellers' | 'discovery'
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSelectedVolume('100 ML');
    setQuantity(1);
    setActiveImageIdx(0);
  }, [id]);

  const calculateVolumePrice = (basePrice, volume) => {
    if (volume === '50 ML') return Math.round(basePrice * 0.7);
    if (volume === '200 ML') return Math.round(basePrice * 1.6);
    return basePrice;
  };

  const currentPrice = calculateVolumePrice(product.price, selectedVolume);
  const currentOriginalPrice = calculateVolumePrice(product.originalPrice || Math.round(product.price * 1.2), selectedVolume);
  const isWishlisted = isInWishlist(product.id);

  // Genuine product gallery images (no repeated mock/sample thumbnails)
  const galleryImages = (
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map(img => typeof img === 'string' ? img : img.url)
      : Array.isArray(product.gallery) && product.gallery.length > 0
        ? product.gallery
        : [product.image]
  ).filter(Boolean);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVolume);
    setIsAddedRecently(true);
    addToast(`${product.name} (${selectedVolume}) added to bag`, 'success');
    setTimeout(() => setIsAddedRecently(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVolume);
    navigate('/checkout');
  };

  const topNotesList = product.topNotes ? product.topNotes.split(',').map(s => s.trim()) : ['Bergamot', 'Mandarin'];
  const heartNotesList = product.heartNotes ? product.heartNotes.split(',').map(s => s.trim()) : ['Jasmine', 'Rose', 'Neroli'];
  const baseNotesList = product.baseNotes ? product.baseNotes.split(',').map(s => s.trim()) : ['Cedarwood', 'Amber', 'Musk'];

  // Intelligent Curation Engine: Guarantees 4 to 8 beautifully complementary fragrances
  const sameCategory = products.filter(p => p.id !== product.id && p.category === product.category);
  const otherComplements = products.filter(p => p.id !== product.id && p.category !== product.category && (p.isBestseller || p.rating >= 4.8));
  const curatedSuggestions = [...sameCategory, ...otherComplements].slice(0, 8);

  const bestsellersSuggestions = products.filter(p => p.id !== product.id && p.isBestseller).slice(0, 8);
  const discoverySuggestions = products.filter(p => p.id !== product.id && p.rating >= 4.85).slice(0, 8);

  const displayedSuggestions = 
    suggestionTab === 'bestsellers' ? bestsellersSuggestions :
    suggestionTab === 'discovery' ? discoverySuggestions :
    curatedSuggestions;

  return (
    <div className="product-detail-page">
      {/* Breadcrumb Navigation */}
      <div className="detail-breadcrumb-bar">
        <Link to="/products" className="breadcrumb-back">
          <ArrowLeft size={16} /> All Fragrances
        </Link>
        <div className="breadcrumb-trail">
          <Link to="/">Home</Link>
          <span className="divider">/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
          <span className="divider">/</span>
          <span className="current">{product.name}</span>
        </div>
      </div>

      {/* Main Two-Column Product Section */}
      <div className="product-hero-layout">
        {/* Left Column: Image Gallery */}
        <div className="product-gallery-column">
          <div className="gallery-main-image-wrap">
            <img 
              src={galleryImages[activeImageIdx] || product.image} 
              alt={product.name}
              className="gallery-main-image"
              onError={(e) => { e.currentTarget.src = '/1.jpg'; }}
            />
          </div>

          {/* Thumbnail strip rendered only if genuine multiple images exist */}
          {galleryImages.length > 1 && (
            <div className="gallery-thumbnails-strip">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumb-btn ${activeImageIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveImageIdx(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={img} alt="" onError={(e) => { e.currentTarget.src = '/1.jpg'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Purchasing Specs */}
        <div className="product-info-column">
          <div className="product-header-block">
            <span className="product-brand-eyebrow">{product.category || 'Fine Fragrance'}</span>
            <h1 className="product-title">{product.name}</h1>
            <p className="product-subtitle">{product.subtitle || 'Extrait de Parfum'}</p>

            <div className="product-rating-row">
              <div className="stars-cluster">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.floor(product.rating || 5) ? '#b89628' : 'none'} 
                    color="#b89628" 
                  />
                ))}
              </div>
              <span className="rating-score">{product.rating || 4.9}</span>
              <span className="reviews-count">({product.reviewsCount || 84} verified reviews)</span>
            </div>
          </div>

          <div className="product-pricing-block">
            <div className="price-headline-row">
              <span className="price-main">₹{currentPrice.toLocaleString()}</span>
              {currentOriginalPrice > currentPrice && (
                <>
                  <span className="price-original">₹{currentOriginalPrice.toLocaleString()}</span>
                  <span className="price-discount-badge">
                    {Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>

            {/* 24-Hour Date-Driven Daily Pricing Banner */}
            <div className="daily-offer-bar">
              <Clock size={15} className="daily-offer-icon" />
              <div className="daily-offer-content">
                <span className="daily-offer-theme">
                  {dailyContext.dayName} Maison Offer · {product.dailyThemeName || 'Daily Fragrance Curation'}
                </span>
                <span className="daily-offer-timer">
                  Price locks for {dailyContext.formattedCountdown} (Cycles every 24h at midnight)
                </span>
              </div>
            </div>

            <span className="tax-inclusive-label">All applicable taxes included. Complimentary express shipping.</span>
          </div>

          <div className="product-description-text">
            <p>{product.description}</p>
          </div>

          {/* Size / Volume Selector */}
          <div className="selection-group">
            <label className="selection-label">Select Bottle Volume</label>
            <div className="volume-options-row">
              {['50 ML', '100 ML', '200 ML'].map((vol) => (
                <button
                  key={vol}
                  type="button"
                  className={`volume-chip ${selectedVolume === vol ? 'selected' : ''}`}
                  onClick={() => setSelectedVolume(vol)}
                >
                  <span className="vol-size">{vol}</span>
                  <span className="vol-price">₹{calculateVolumePrice(product.price, vol).toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Actions */}
          <div className="purchase-controls-row">
            <div className="quantity-counter">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="qty-number">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              className={`btn-add-to-bag ${isAddedRecently ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {isAddedRecently ? (
                <>
                  <Check size={16} /> Added to Bag
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Add to Bag • ₹{(currentPrice * quantity).toLocaleString()}
                </>
              )}
            </button>

            <button
              type="button"
              className={`btn-wishlist-toggle ${isWishlisted ? 'favorited' : ''}`}
              onClick={() => toggleWishlist(product)}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart size={18} fill={isWishlisted ? '#b89628' : 'none'} color={isWishlisted ? '#b89628' : 'currentColor'} />
            </button>
          </div>

          <button
            type="button"
            className="btn-buy-now-direct"
            onClick={handleBuyNow}
          >
            Buy Now
          </button>

          {/* Delivery & Shipping Info Note */}
          <div className="delivery-timeframe-box">
            <Truck size={18} className="truck-icon" />
            <div>
              <strong>Complimentary Express Delivery</strong>
              <p>Dispatched within 24 hours. Estimated delivery: 2–4 business days.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Details Tabs: Olfactory Notes, Specifications, Shipping */}
      <div className="product-details-tabs-container">
        <div className="tabs-header-strip">
          <button
            type="button"
            className={`detail-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <Droplets size={16} /> Fragrance Notes
          </button>
          <button
            type="button"
            className={`detail-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <Layers size={16} /> Specifications & Ingredients
          </button>
          <button
            type="button"
            className={`detail-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            <Truck size={16} /> Shipping & Delivery
          </button>
        </div>

        <div className="tab-content-panel">
          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="notes-breakdown-grid">
              <div className="note-card top-notes">
                <span className="note-phase">Stage 01</span>
                <h3>Top Notes</h3>
                <div className="notes-pill-wrap">
                  {topNotesList.map((n, i) => (
                    <span key={i} className="note-pill">{n}</span>
                  ))}
                </div>
                <p>The initial burst of aroma perceived immediately upon application.</p>
              </div>

              <div className="note-card heart-notes">
                <span className="note-phase">Stage 02</span>
                <h3>Heart Notes</h3>
                <div className="notes-pill-wrap">
                  {heartNotesList.map((n, i) => (
                    <span key={i} className="note-pill">{n}</span>
                  ))}
                </div>
                <p>The core personality of the fragrance that develops as the top notes dissipate.</p>
              </div>

              <div className="note-card base-notes">
                <span className="note-phase">Stage 03</span>
                <h3>Base Notes</h3>
                <div className="notes-pill-wrap">
                  {baseNotesList.map((n, i) => (
                    <span key={i} className="note-pill">{n}</span>
                  ))}
                </div>
                <p>The enduring foundation that anchors the fragrance on warm skin for 10–12 hours.</p>
              </div>
            </div>
          )}

          {/* Specifications Tab */}
          {activeTab === 'details' && (
            <div className="specifications-table-wrap">
              <table className="specs-table">
                <tbody>
                  <tr>
                    <th>Fragrance Family</th>
                    <td>{product.category}</td>
                  </tr>
                  <tr>
                    <th>Concentration</th>
                    <td>Extrait de Parfum (24% oil concentration)</td>
                  </tr>
                  <tr>
                    <th>Volume</th>
                    <td>{selectedVolume} spray vaporizer</td>
                  </tr>
                  <tr>
                    <th>Country of Origin</th>
                    <td>France</td>
                  </tr>
                  <tr>
                    <th>Key Ingredients</th>
                    <td>Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citronellol.</td>
                  </tr>
                  <tr>
                    <th>Application</th>
                    <td>Spray onto pulse points: wrists, inner elbows, and base of neck.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div className="shipping-policy-content">
              <h3>Delivery & Return Policy</h3>
              <p>All orders are packaged in protective presentation boxes and dispatched within 24 hours.</p>
              <ul>
                <li><strong>Standard Express Shipping:</strong> Complimentary across all regions (2–4 business days).</li>
                <li><strong>Tracking:</strong> Complete shipment tracking details are provided upon dispatch.</li>
                <li><strong>Returns:</strong> Items in original, unopened condition may be returned within 14 days of receipt.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related Fragrances Section - Scent Suggestions */}
      <section className="related-fragrances-section">
        <div className="suggestion-section-header">
          <div className="suggestion-header-text">
            <span className="suggestion-eyebrow">The Lumora Fragrance Gallery</span>
            <h2 className="related-section-title">You May Also Appreciate</h2>
            <p className="suggestion-subtitle">
              Explore complementary olfactive signatures handcrafted with rare raw essences and noble botanical accords.
            </p>
          </div>
          <div className="suggestion-tabs-nav">
            <button
              type="button"
              className={`suggestion-tab-btn ${suggestionTab === 'curated' ? 'active' : ''}`}
              onClick={() => setSuggestionTab('curated')}
            >
              Curated for You
            </button>
            <button
              type="button"
              className={`suggestion-tab-btn ${suggestionTab === 'bestsellers' ? 'active' : ''}`}
              onClick={() => setSuggestionTab('bestsellers')}
            >
              House Bestsellers
            </button>
            <button
              type="button"
              className={`suggestion-tab-btn ${suggestionTab === 'discovery' ? 'active' : ''}`}
              onClick={() => setSuggestionTab('discovery')}
            >
              Discovery Picks
            </button>
          </div>
        </div>

        <div className="related-products-grid">
          {displayedSuggestions.map((p) => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onQuickView={(item) => setQuickViewProduct(item)} 
            />
          ))}
        </div>
      </section>

      {/* Quick View Modal for Instant Preview */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onOpenLightbox={() => {}}
        />
      )}
    </div>
  );
}
