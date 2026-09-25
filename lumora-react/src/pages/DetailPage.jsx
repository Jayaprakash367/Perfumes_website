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
  Clock,
  MapPin,
  Share2,
  ShieldCheck,
  Award,
  Zap,
  Tag,
  Copy,
  ChevronRight,
  Feather,
  Compass,
  Gift
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

  // Flipkart-style interactive delivery & coupon states
  const [pincode, setPincode] = useState('560001');
  const [isPincodeChecking, setIsPincodeChecking] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

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
  const currentOriginalPrice = calculateVolumePrice(product.originalPrice || Math.round(product.price * 1.25), selectedVolume);
  const isWishlisted = isInWishlist(product.id);

  const discountPercent = currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 20;

  // Genuine product gallery images
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

  const topNotesList = product.topNotes ? product.topNotes.split(',').map(s => s.trim()) : ['Calabrian Bergamot', 'Italian Mandarin'];
  const heartNotesList = product.heartNotes ? product.heartNotes.split(',').map(s => s.trim()) : ['Grasse Rose', 'French Jasmine'];
  const baseNotesList = product.baseNotes ? product.baseNotes.split(',').map(s => s.trim()) : ['Mysore Sandalwood', 'White Amber'];

  // Dynamic estimated delivery date (3-4 business days ahead)
  const getEstimatedDeliveryDate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    return deliveryDate.toLocaleDateString('en-US', options);
  };

  const getCampaignImage = (category, currentImage) => {
    const cat = (category || '').toLowerCase();
    let img = '/atelier-craftsmanship.jpg';
    if (cat.includes('floral') || cat.includes('rose')) {
      img = '/laura-chouette-4sKdeIMiFEI-unsplash.jpg';
    } else if (cat.includes('fresh') || cat.includes('citrus')) {
      img = '/laura-chouette-R5jeBMGMjgA-unsplash.jpg';
    } else if (cat.includes('spice') || cat.includes('warm')) {
      img = '/yixian-zhao-q7iZCOXGOWY-unsplash.jpg';
    } else if (cat.includes('woody') || cat.includes('leather')) {
      img = '/pavlo-talpa-SIKp2vihB_s-unsplash.jpg';
    }
    if (img === currentImage) {
      img = currentImage === '/atelier-craftsmanship.jpg' ? '/laura-chouette-4sKdeIMiFEI-unsplash.jpg' : '/atelier-craftsmanship.jpg';
    }
    return img;
  };

  const handlePincodeSubmit = (e) => {
    e.preventDefault();
    if (!pincode.trim()) return;
    setIsPincodeChecking(true);
    setTimeout(() => {
      setIsPincodeChecking(false);
      addToast(`Estimated delivery to ${pincode.trim()} confirmed.`, 'success');
    }, 300);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast('Fragrance link copied to clipboard.', 'success');
    }
  };

  const handleCopyCoupon = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('LUMORA10');
      setCopiedCode(true);
      addToast('Privilege code LUMORA10 applied.', 'success');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Intelligent Curation Engine
  const sameCategory = products.filter(p => p.id !== product.id && p.category === product.category);
  const otherComplements = products.filter(p => p.id !== product.id && p.category !== product.category && (p.isBestseller || p.rating >= 4.8));
  const curatedSuggestions = [...sameCategory, ...otherComplements].slice(0, 8);

  const bestsellersSuggestions = products.filter(p => p.id !== product.id && p.isBestseller).slice(0, 8);
  const discoverySuggestions = products.filter(p => p.id !== product.id && p.rating >= 4.85).slice(0, 8);

  const displayedSuggestions = 
    suggestionTab === 'bestsellers' ? bestsellersSuggestions :
    suggestionTab === 'discovery' ? discoverySuggestions :
    curatedSuggestions;

  const activeMainImage = galleryImages[activeImageIdx] || product.image;

  return (
    <div className="product-detail-page">
      {/* Breadcrumb Navigation */}
      <div className="detail-breadcrumb-bar">
        <Link to="/products" className="breadcrumb-back">
          <ArrowLeft size={15} /> All Fragrances
        </Link>
        <div className="breadcrumb-trail">
          <Link to="/">Home</Link>
          <span className="divider">/</span>
          <Link to="/products">Fragrance Gallery</Link>
          <span className="divider">/</span>
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
          <span className="divider">/</span>
          <span className="current">{product.name}</span>
        </div>
      </div>

      {/* Main Luxury Product Layout */}
      <div className="product-hero-layout">
        {/* Left Section: Single Chosen Product Image + Right-Side Box Model of Two Containers */}
        <div className="product-media-and-specs">
          {/* 1. Single Chosen Product Image Showcase */}
          <div className="product-showcase-card">
            <div className="showcase-image-viewport">
              <img 
                src={activeMainImage} 
                alt={product.name}
                className="showcase-flacon-image"
                onError={(e) => { e.currentTarget.src = '/1.jpg'; }}
              />
              <div className="showcase-status-badge">
                <span className="badge-flacon-type">EXTRAIT DE PARFUM</span>
                {discountPercent > 0 && (
                  <span className="badge-privilege-discount">−{discountPercent}%</span>
                )}
              </div>
            </div>

            {/* Perspective thumbnails if multiple angles are available for this flacon */}
            {galleryImages.length > 1 && (
              <div className="flacon-perspectives-strip">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`flacon-thumb-btn ${activeImageIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`View perspective ${idx + 1}`}
                  >
                    <img src={img} alt="" onError={(e) => { e.currentTarget.src = '/1.jpg'; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Image Right-Side Box Model: Two Refined Containers */}
          <div className="product-specifications-duo">
            {/* Container 1: Olfactory Architecture */}
            <div className="luxury-spec-card spec-olfactive-profile">
              <div className="spec-card-header">
                <div className="spec-title-cluster">
                  <Sparkles size={15} className="spec-accent-icon" />
                  <span className="spec-title-text">OLFACTORY ARCHITECTURE</span>
                </div>
                <div className="spec-actions-cluster">
                  <button
                    type="button"
                    className={`spec-round-btn ${isWishlisted ? 'favorited' : ''}`}
                    onClick={() => toggleWishlist(product)}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    aria-label="Wishlist"
                  >
                    <Heart size={14} fill={isWishlisted ? '#b89628' : 'none'} color={isWishlisted ? '#b89628' : '#64748b'} />
                  </button>
                  <button
                    type="button"
                    className="spec-round-btn"
                    onClick={handleShare}
                    title="Share Fragrance"
                    aria-label="Share"
                  >
                    <Share2 size={14} color="#64748b" />
                  </button>
                </div>
              </div>

              <div className="olfactive-stages-flow">
                {/* Stage 1: Top Notes */}
                <div className="olfactive-stage-card">
                  <div className="stage-card-header">
                    <span className="stage-numeral">I</span>
                    <span className="stage-name">HEAD NOTES</span>
                    <span className="stage-subtitle">Opening effervescence</span>
                  </div>
                  <div className="stage-badges-wrap">
                    {topNotesList.map((n, i) => (
                      <span key={i} className="botanical-chip">{n}</span>
                    ))}
                  </div>
                </div>

                {/* Stage 2: Heart Notes */}
                <div className="olfactive-stage-card">
                  <div className="stage-card-header">
                    <span className="stage-numeral">II</span>
                    <span className="stage-name">HEART NOTES</span>
                    <span className="stage-subtitle">Signature core character</span>
                  </div>
                  <div className="stage-badges-wrap">
                    {heartNotesList.map((n, i) => (
                      <span key={i} className="botanical-chip">{n}</span>
                    ))}
                  </div>
                </div>

                {/* Stage 3: Base Notes */}
                <div className="olfactive-stage-card">
                  <div className="stage-card-header">
                    <span className="stage-numeral">III</span>
                    <span className="stage-name">BASE NOTES</span>
                    <span className="stage-subtitle">Enduring warm foundation</span>
                  </div>
                  <div className="stage-badges-wrap">
                    {baseNotesList.map((n, i) => (
                      <span key={i} className="botanical-chip">{n}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Longevity & Sillage Ribbon */}
              <div className="olfactive-metrics-ribbon">
                <div className="metric-cell">
                  <Clock size={13} className="metric-cell-icon" />
                  <span><strong>Longevity:</strong> {product.longevity || '10–12 Hours'}</span>
                </div>
                <span className="metric-dot">·</span>
                <div className="metric-cell">
                  <Droplets size={13} className="metric-cell-icon" />
                  <span><strong>Strength:</strong> 24% Extrait</span>
                </div>
                <span className="metric-dot">·</span>
                <div className="metric-cell">
                  <Sparkles size={13} className="metric-cell-icon" />
                  <span><strong>Sillage:</strong> {product.sillage || 'Alluring Aura'}</span>
                </div>
              </div>
            </div>

            {/* Container 2: Atelier Craftsmanship & Purity Standards */}
            <div className="luxury-spec-card spec-atelier-standards">
              <div className="spec-card-header">
                <div className="spec-title-cluster">
                  <Award size={15} className="spec-accent-icon" />
                  <span className="spec-title-text">ATELIER CRAFTSMANSHIP</span>
                </div>
                <span className="spec-region-tag">GRASSE & PARIS</span>
              </div>

              <div className="atelier-pillars-grid">
                <div className="pillar-tile">
                  <div className="pillar-icon-box">
                    <Droplets size={15} />
                  </div>
                  <div className="pillar-info">
                    <span className="pillar-title">Provence Distillation</span>
                    <span className="pillar-desc">Steam-extracted botanicals gathered at morning bloom in Grasse.</span>
                  </div>
                </div>

                <div className="pillar-tile">
                  <div className="pillar-icon-box">
                    <Layers size={15} />
                  </div>
                  <div className="pillar-info">
                    <span className="pillar-title">24% Pure Extrait</span>
                    <span className="pillar-desc">Master-compounded oil concentration for an enduring drydown.</span>
                  </div>
                </div>

                <div className="pillar-tile">
                  <div className="pillar-icon-box">
                    <Compass size={15} />
                  </div>
                  <div className="pillar-info">
                    <span className="pillar-title">Micro-Mist Vaporisateur</span>
                    <span className="pillar-desc">Engineered spray nozzle delivering a delicate, uniform veil.</span>
                  </div>
                </div>

                <div className="pillar-tile">
                  <div className="pillar-icon-box">
                    <Feather size={15} />
                  </div>
                  <div className="pillar-info">
                    <span className="pillar-title">Haute Clean Formulation</span>
                    <span className="pillar-desc">Organic wheat alcohol; free of parabens, phthalates, or artificial dyes.</span>
                  </div>
                </div>
              </div>

              <div className="atelier-standards-footer">
                <Check size={13} className="footer-check-icon" />
                <span>Formulated in compliance with International Fragrance Association (IFRA) standards</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Refined Luxury Purchasing Panel */}
        <div className="product-info-column">
          {/* Brand Eyebrow & Pure Title */}
          <div className="product-header-block">
            <span className="product-brand-eyebrow">HAUTE PARFUMERIE COLLECTION</span>
            <h1 className="product-title">{product.name}</h1>
            <p className="product-subtitle">{product.subtitle || 'Extrait de Parfum'} · {product.category}</p>

            {/* Subtle Luxury Rating & Reviews */}
            <div className="product-rating-row">
              <div className="luxury-rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.floor(product.rating || 5) ? '#b89628' : 'none'} 
                    color="#b89628" 
                  />
                ))}
              </div>
              <span className="luxury-rating-score">{product.rating || 5.0}</span>
              <span className="luxury-reviews-count">({(product.reviewsCount || 428).toLocaleString()} reviews)</span>
              <span className="luxury-recommend-pill">98% Recommend</span>
            </div>
          </div>

          {/* Pricing Section with Harmonious Palette */}
          <div className="product-pricing-block">
            <div className="price-headline-row">
              <span className="price-main">₹{currentPrice.toLocaleString()}</span>
              {currentOriginalPrice > currentPrice && (
                <span className="price-original">₹{currentOriginalPrice.toLocaleString()}</span>
              )}
              {discountPercent > 0 && (
                <span className="price-savings-pill">Save {discountPercent}%</span>
              )}
            </div>

            <span className="tax-inclusive-label">
              Complimentary express delivery across India · All taxes included
            </span>

            {/* Subtle Maison Privilege Card */}
            <div className="maison-privilege-card">
              <div className="privilege-text">
                <span className="privilege-title">Maison Welcome Privilege</span>
                <span className="privilege-desc">Receive an extra 10% privilege savings with code <strong>LUMORA10</strong></span>
              </div>
              <button
                type="button"
                className="btn-privilege-copy"
                onClick={handleCopyCoupon}
                title="Copy code LUMORA10"
              >
                {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedCode ? 'Applied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Volume / Size Variant Selector */}
          <div className="selection-group">
            <div className="selection-header-row">
              <label className="selection-label">Select Flacon Volume</label>
              <span className="selection-hint">Vaporisateur Spray</span>
            </div>
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

          {/* Quantity Selector */}
          <div className="quantity-selection-row">
            <span className="selection-label">Quantity</span>
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
          </div>

          {/* Side-by-Side Action Buttons in Cohesive Luxury Palette */}
          <div className="luxury-action-buttons-row">
            <button
              type="button"
              className={`luxury-btn-add-bag ${isAddedRecently ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {isAddedRecently ? (
                <>
                  <Check size={17} />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={17} />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="luxury-btn-buy-now"
              onClick={handleBuyNow}
            >
              <span>Buy Now · ₹{(currentPrice * quantity).toLocaleString()}</span>
            </button>
          </div>

          {/* Delivery & Pincode Checker Card */}
          <div className="luxury-delivery-card">
            <div className="delivery-card-header">
              <Truck size={16} className="delivery-icon" />
              <span className="delivery-header-title">Estimated Delivery</span>
            </div>

            <form onSubmit={handlePincodeSubmit} className="pincode-checker-row">
              <div className="pincode-input-wrap">
                <MapPin size={15} className="pin-icon" />
                <span className="pin-label">PIN</span>
                <input 
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter pincode"
                  className="pincode-input"
                />
              </div>
              <button type="submit" className="btn-pincode-check">
                {isPincodeChecking ? 'Checking...' : 'Check'}
              </button>
            </form>

            <div className="delivery-details-text">
              <p className="delivery-date-text">
                Delivery by <strong>{getEstimatedDeliveryDate()}</strong> · Priority Express Courier
              </p>
              <p className="delivery-origin-text">
                Dispatched directly from the atelier within 24 hours in presentation packaging.
              </p>
            </div>
          </div>

          {/* Refined Maison Privileges */}
          <div className="luxury-privileges-box">
            <div className="privilege-item">
              <Sparkles size={14} className="privilege-icon" />
              <span>Complimentary 2ml discovery vial included with every flacon</span>
            </div>
            <div className="privilege-item">
              <Gift size={14} className="privilege-icon" />
              <span>Arrives in signature embossed presentation box</span>
            </div>
            <div className="privilege-item">
              <Truck size={14} className="privilege-icon" />
              <span>Complimentary tracked express air delivery</span>
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
