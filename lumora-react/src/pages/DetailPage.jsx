import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Share2, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Award,
  Grid,
  Maximize2,
  ChevronRight,
  ChevronDown,
  Info,
  Droplets,
  Flame,
  Wind,
  Feather,
  ShoppingBag,
  Gift,
  Eye,
  Check,
  Zap
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

  // Flacon options & interactive state
  const [selectedVolume, setSelectedVolume] = useState('100 ML');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [galleryViewMode, setGalleryViewMode] = useState('studio'); // 'studio' | 'mosaic'
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxInitialIdx, setLightboxInitialIdx] = useState(0);
  const [showFullStory, setShowFullStory] = useState(false);
  const [activeTab, setActiveTab] = useState('pyramid'); // 'pyramid' | 'ritual' | 'sourcing' | 'shipping'
  const [selectedNoteDetail, setSelectedNoteDetail] = useState(null);
  const [engravingOpen, setEngravingOpen] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [isAddedRecently, setIsAddedRecently] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Zoom magnifier states
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const [zoomCoord, setZoomCoord] = useState({ x: 50, y: 50 });
  const heroImageContainerRef = useRef(null);
  const buyBoxRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSelectedVolume('100 ML');
    setQuantity(1);
    setActiveImageIdx(0);
    setEngravingText('');
    setEngravingOpen(false);
    setSelectedNoteDetail(null);
  }, [id]);

  // Scroll listener for sticky floating bottom checkout dock
  useEffect(() => {
    const handleScroll = () => {
      if (buyBoxRef.current) {
        const rect = buyBoxRef.current.getBoundingClientRect();
        // If bottom of buy box is scrolled above view, show sticky bar
        setShowStickyBar(rect.bottom < 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const calculateVolumePrice = (basePrice, volume) => {
    if (volume === '50 ML') return Math.round(basePrice * 0.7);
    if (volume === '200 ML') return Math.round(basePrice * 1.6);
    return basePrice;
  };

  const currentPrice = calculateVolumePrice(product.price, selectedVolume);
  const currentOriginalPrice = calculateVolumePrice(product.originalPrice, selectedVolume);
  const savingsAmount = currentOriginalPrice - currentPrice;
  const isWishlisted = isInWishlist(product.id);

  // High-Resolution Editorial Gallery Assets
  const galleryImages = [
    {
      url: product.image,
      tag: 'Master Flacon',
      caption: 'The Signature Crystal Flacon with weighted magnetic closure'
    },
    {
      url: '/laura-chouette-4sKdeIMiFEI-unsplash.jpg',
      tag: 'Micro-Atomizer',
      caption: 'Ultra-fine diffusion nozzle delivering an enveloping sensory cloud'
    },
    {
      url: '/pesce-huang-mq73cWf9ZAQ-unsplash.jpg',
      tag: 'Chiaroscuro Silhouette',
      caption: 'Amber clarity reflecting through heavy French art-glass'
    },
    {
      url: '/s1UY-unsplash.jpg',
      tag: 'Botanical Alchemy',
      caption: 'Pure natural extracts harvested and aged in our Grasse atelier'
    },
    {
      url: '/s3-unsplash.jpg',
      tag: 'Artisanal Coffret',
      caption: 'Embossed presentation case with certificate of formulation'
    }
  ];

  const handleHeroMouseMove = (e) => {
    if (!heroImageContainerRef.current) return;
    const { left, top, width, height } = heroImageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setZoomCoord({ x, y });
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVolume, engravingText ? { engraving: engravingText } : null);
    setIsAddedRecently(true);
    addToast(`Added ${quantity} × ${product.name} (${selectedVolume}) to your cart.`, 'success');
    setTimeout(() => setIsAddedRecently(false), 2400);
  };

  const handleInstantBuy = () => {
    addToCart(product, quantity, selectedVolume, engravingText ? { engraving: engravingText } : null);
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
      addToast('Fragrance link copied to clipboard!', 'info');
    }
  };

  const openLightboxAt = (index) => {
    setLightboxInitialIdx(index);
    setLightboxOpen(true);
  };

  // Olfactory notes dictionary with rich tasting cards
  const topNotesList = product.topNotes ? product.topNotes.split(',').map((s) => s.trim()) : ['Bergamot', 'Cardamom', 'Citrus'];
  const heartNotesList = product.heartNotes ? product.heartNotes.split(',').map((s) => s.trim()) : ['Amber', 'Damask Rose', 'Spices'];
  const baseNotesList = product.baseNotes ? product.baseNotes.split(',').map((s) => s.trim()) : ['Oakmoss', 'Sandalwood', 'Vanilla'];

  const getNoteProfile = (noteName) => {
    const n = noteName.toLowerCase();
    if (n.includes('cinnamon')) return { origin: 'Ceylon Mountain Terraces', family: 'Spicy Warm', trait: 'Fiery sweet warmth that awakens the olfactory receptors instantly.' };
    if (n.includes('cardamom')) return { origin: 'Guatemala Highlands', family: 'Aromatic Spice', trait: 'Cracked green cardamom pods radiating cool herbal camphor.' };
    if (n.includes('amber')) return { origin: 'Baltic Resin Accord', family: 'Resinous Amber', trait: 'Velvety golden resin that mirrors skin temperature with radiant sillage.' };
    if (n.includes('vanilla')) return { origin: 'Madagascar Bourbon Wild Harvest', family: 'Gourmand Wood', trait: 'Dark, smoky vanilla bean aged inside toasted oak barrels.' };
    if (n.includes('rose')) return { origin: 'Taif & Grasse Valleys', family: 'Opulent Floral', trait: 'Dewy dawn-harvested petals with velvet honey facets.' };
    if (n.includes('bergamot')) return { origin: 'Calabrian Organic Groves', family: 'Sparkling Citrus', trait: 'Sun-drenched zest expressing crisp, uplifting radiance.' };
    if (n.includes('oakmoss') || n.includes('driftwood')) return { origin: 'French Maritime Forests', family: 'Earthy Woody', trait: 'Deep forest floor accord that anchors the sillage for 12+ hours.' };
    return { origin: 'Grasse Private Estates', family: 'Haute Essences', trait: 'Artisanal cold-distilled pure botanical extract of highest concentration.' };
  };

  const relatedFragrances = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="haute-detail-page">
      {/* 1. Elegant Breadcrumb Bar */}
      <nav className="haute-breadcrumb-nav" aria-label="Breadcrumb">
        <Link to="/" className="breadcrumb-link">Maison Lumora</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to={`/category/${encodeURIComponent(product.category)}`} className="breadcrumb-link">
          {product.category}
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      {/* 2. Top Luxury Header & Accreditations */}
      <header className="haute-product-header">
        <div className="header-titles-wrap">
          <div className="haute-badge-cluster">
            <span className="haute-tag-pill gold">
              <Sparkles size={13} /> Extrait de Parfum · 30% Pure Concentration
            </span>
            {product.isBestseller && (
              <span className="haute-tag-pill dark">
                <Award size={13} /> Maison Masterpiece 2026
              </span>
            )}
            <span className="haute-tag-pill subtle">
              Batch No. 042 / Hand-Numbered
            </span>
          </div>

          <h1 className="haute-product-title">{product.name}</h1>
          <p className="haute-product-subtitle">{product.subtitle}</p>
        </div>

        <div className="haute-header-actions">
          <div className="header-rating-capsule">
            <div className="stars-cluster">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#b89628" color="#b89628" />
              ))}
            </div>
            <span className="rating-score">{product.rating}</span>
            <span className="reviews-tally">({product.reviewsCount} Connoisseur Reviews)</span>
          </div>

          <div className="action-buttons-wrap">
            <button
              type="button"
              className="haute-icon-action-btn"
              onClick={handleShare}
              title="Share Fragrance"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
            <button
              type="button"
              className={`haute-icon-action-btn ${isWishlisted ? 'favorited' : ''}`}
              onClick={() => toggleWishlist(product)}
              title={isWishlisted ? 'Remove from Private Collection' : 'Save to Private Collection'}
            >
              <Heart
                size={16}
                fill={isWishlisted ? '#b89628' : 'none'}
                color={isWishlisted ? '#b89628' : 'currentColor'}
              />
              <span>{isWishlisted ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Showcase Grid (Left: Multi-Mode Gallery, Right: Luxury Purchase Suite) */}
      <div className="haute-hero-showcase">
        {/* Left Column: Interactive Image Experience */}
        <div className="haute-gallery-column">
          {/* Gallery View Mode Tabs */}
          <div className="gallery-control-strip">
            <div className="view-mode-toggles">
              <button
                type="button"
                className={`gallery-mode-btn ${galleryViewMode === 'studio' ? 'active' : ''}`}
                onClick={() => setGalleryViewMode('studio')}
              >
                <Maximize2 size={14} /> Studio Focus
              </button>
              <button
                type="button"
                className={`gallery-mode-btn ${galleryViewMode === 'mosaic' ? 'active' : ''}`}
                onClick={() => setGalleryViewMode('mosaic')}
              >
                <Grid size={14} /> Editorial Mosaic
              </button>
            </div>

            <button
              type="button"
              className="lightbox-expand-trigger"
              onClick={() => openLightboxAt(activeImageIdx)}
            >
              <Eye size={14} /> Fullscreen Lightbox ({galleryImages.length} Views)
            </button>
          </div>

          {/* Mode A: Studio Focus (Vertical Thumbnails + Main Zoom Lens) */}
          {galleryViewMode === 'studio' && (
            <div className="studio-gallery-layout">
              {/* Vertical Thumbnails Reel */}
              <div className="studio-thumbnails-reel">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`thumb-card ${idx === activeImageIdx ? 'active' : ''}`}
                    onClick={() => setActiveImageIdx(idx)}
                    onMouseEnter={() => setActiveImageIdx(idx)}
                  >
                    <img src={img.url} alt={img.tag} />
                    <span className="thumb-label">{img.tag}</span>
                  </button>
                ))}
              </div>

              {/* Main Flacon Hero Stage with Magnifier */}
              <div 
                className="studio-hero-stage"
                ref={heroImageContainerRef}
                onMouseEnter={() => setIsHoveringHero(true)}
                onMouseLeave={() => setIsHoveringHero(false)}
                onMouseMove={handleHeroMouseMove}
                onClick={() => openLightboxAt(activeImageIdx)}
              >
                <div className="hero-flacon-glow"></div>

                <img
                  src={galleryImages[activeImageIdx].url}
                  alt={galleryImages[activeImageIdx].caption}
                  className="studio-hero-image"
                  loading="eager"
                  fetchPriority="high"
                />

                {/* Simulated Engraved Monogram Preview on Bottle */}
                {engravingText && activeImageIdx === 0 && (
                  <div className="engraving-live-overlay">
                    <span className="engraved-script">{engravingText}</span>
                  </div>
                )}

                {/* Floating Tag */}
                <div className="hero-floating-caption">
                  <span className="pill-dot"></span>
                  <span>{galleryImages[activeImageIdx].caption}</span>
                </div>

                {/* Interactive Cursor Magnifier Lens */}
                {isHoveringHero && (
                  <div
                    className="magnifier-lens"
                    style={{
                      left: `${zoomCoord.x}%`,
                      top: `${zoomCoord.y}%`,
                      backgroundImage: `url(${galleryImages[activeImageIdx].url})`,
                      backgroundPosition: `${zoomCoord.x}% ${zoomCoord.y}%`
                    }}
                  />
                )}

                {/* Zoom Hint Icon */}
                <div className="hero-zoom-prompt">
                  <Eye size={13} /> Hover to magnify · Click to expand
                </div>
              </div>
            </div>
          )}

          {/* Mode B: Editorial Mosaic Grid (High-Fashion Collages with Hover Elevation) */}
          {galleryViewMode === 'mosaic' && (
            <div className="editorial-mosaic-grid">
              {galleryImages.map((item, idx) => (
                <div
                  key={idx}
                  className={`mosaic-tile tile-${idx}`}
                  onClick={() => openLightboxAt(idx)}
                >
                  <img src={item.url} alt={item.tag} loading="lazy" />
                  <div className="mosaic-overlay">
                    <span className="mosaic-badge">{item.tag}</span>
                    <p className="mosaic-caption">{item.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sensory Guarantees Row below gallery */}
          <div className="haute-perks-banner">
            <div className="perk-cell">
              <div className="perk-icon-wrap"><Droplets size={18} /></div>
              <div>
                <strong>30% Pure Concentration</strong>
                <p>Pure botanical essences harvested in Grasse</p>
              </div>
            </div>
            <div className="perk-cell">
              <div className="perk-icon-wrap"><RefreshCw size={18} /></div>
              <div>
                <strong>Complimentary 2ml Sample</strong>
                <p>Test on skin first; risk-free 30-day returns</p>
              </div>
            </div>
            <div className="perk-cell">
              <div className="perk-icon-wrap"><Truck size={18} /></div>
              <div>
                <strong>White-Glove Insured Delivery</strong>
                <p>Signature velvet coffret & wax seal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Luxury Purchase Suite */}
        <aside className="haute-purchase-column" ref={buyBoxRef}>
          <div className="luxury-purchase-card">
            {/* Price Row */}
            <div className="purchase-price-header">
              <div className="price-stack">
                <div className="current-price-row">
                  <span className="price-currency">₹</span>
                  <span className="price-digits">{currentPrice.toLocaleString()}</span>
                  <span className="price-volume-tag">/ {selectedVolume} Extrait</span>
                </div>
                {savingsAmount > 0 && (
                  <div className="savings-pill-row">
                    <span className="price-strikethrough">₹{currentOriginalPrice.toLocaleString()}</span>
                    <span className="savings-badge">Save ₹{savingsAmount.toLocaleString()} ({Math.round((savingsAmount / currentOriginalPrice) * 100)}%)</span>
                  </div>
                )}
              </div>

              <div className="stock-scarcity-indicator">
                <span className="pulsing-amber-dot"></span>
                <span className="scarcity-text">Small Batch No. 07 · <strong>12 Flacons Left</strong></span>
              </div>
            </div>

            <hr className="luxury-card-divider" />

            {/* 1. Flacon Volume Selector (Interactive Luxury Cards) */}
            <div className="option-section">
              <div className="option-section-header">
                <label className="section-label">Select Flacon Size</label>
                <span className="volume-guide-link">Need size guidance?</span>
              </div>

              <div className="flacon-size-cards-grid">
                {/* 50 ML */}
                <button
                  type="button"
                  className={`flacon-card ${selectedVolume === '50 ML' ? 'selected' : ''}`}
                  onClick={() => setSelectedVolume('50 ML')}
                >
                  <div className="flacon-icon-wrap mini">
                    <div className="flacon-silhouette mini"></div>
                  </div>
                  <div className="flacon-details">
                    <span className="flacon-name">50 ML Flacon</span>
                    <span className="flacon-desc">Travel & Discovery</span>
                  </div>
                  <div className="flacon-price-right">
                    <strong>₹{calculateVolumePrice(product.price, '50 ML').toLocaleString()}</strong>
                  </div>
                </button>

                {/* 100 ML - Signature */}
                <button
                  type="button"
                  className={`flacon-card ${selectedVolume === '100 ML' ? 'selected' : ''}`}
                  onClick={() => setSelectedVolume('100 ML')}
                >
                  <div className="popular-ribbon">Most Popular</div>
                  <div className="flacon-icon-wrap standard">
                    <div className="flacon-silhouette standard"></div>
                  </div>
                  <div className="flacon-details">
                    <span className="flacon-name">100 ML Flacon</span>
                    <span className="flacon-desc">Signature Atelier Edition</span>
                  </div>
                  <div className="flacon-price-right">
                    <strong>₹{product.price.toLocaleString()}</strong>
                  </div>
                </button>

                {/* 200 ML - Grand Prestige */}
                <button
                  type="button"
                  className={`flacon-card ${selectedVolume === '200 ML' ? 'selected' : ''}`}
                  onClick={() => setSelectedVolume('200 ML')}
                >
                  <div className="value-ribbon">Best Value</div>
                  <div className="flacon-icon-wrap grand">
                    <div className="flacon-silhouette grand"></div>
                  </div>
                  <div className="flacon-details">
                    <span className="flacon-name">200 ML Decanter</span>
                    <span className="flacon-desc">Grand Prestige Coffret</span>
                  </div>
                  <div className="flacon-price-right">
                    <strong>₹{calculateVolumePrice(product.price, '200 ML').toLocaleString()}</strong>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Complimentary Monogram Engraving Accordion */}
            <div className="engraving-feature-box">
              <button
                type="button"
                className="engraving-toggle-btn"
                onClick={() => setEngravingOpen(!engravingOpen)}
              >
                <div className="engraving-label-wrap">
                  <Gift size={16} className="gold-accent-icon" />
                  <span>Complimentary Gold Bottle Engraving</span>
                  <span className="free-gold-badge">FREE</span>
                </div>
                <ChevronDown
                  size={16}
                  style={{ transform: engravingOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                />
              </button>

              {engravingOpen && (
                <div className="engraving-input-drawer">
                  <p className="engraving-helper-text">
                    Personalize your flacon with hand-etched cursive initials or name (up to 12 characters):
                  </p>
                  <div className="engraving-input-row">
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="e.g. J.K. or ELEANOR"
                      value={engravingText}
                      onChange={(e) => setEngravingText(e.target.value.toUpperCase())}
                      className="engraving-text-input"
                    />
                    {engravingText && (
                      <button
                        type="button"
                        className="btn-clear-engraving"
                        onClick={() => setEngravingText('')}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {engravingText && (
                    <div className="engraving-preview-card">
                      <span className="preview-label">Live Engraving Preview:</span>
                      <span className="preview-monogram">"{engravingText}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Quantity & Action Buttons */}
            <div className="purchase-cta-suite">
              <div className="quantity-and-bag-row">
                <div className="haute-quantity-stepper">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="quantity-num">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Primary Gold Shimmer Add-to-Cart */}
                <button
                  type="button"
                  className={`btn-haute-add-to-cart ${isAddedRecently ? 'added-success' : ''}`}
                  onClick={handleAddToCart}
                >
                  {isAddedRecently ? (
                    <>
                      <Check size={18} /> Added to Coffret
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Bag · ₹{(currentPrice * quantity).toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secondary Instant Checkout */}
              <button
                type="button"
                className="btn-haute-instant-checkout"
                onClick={handleInstantBuy}
              >
                <Zap size={16} /> Instant Checkout & Free Discovery Sample
              </button>
            </div>

            {/* 4. The Maison Confidence Guarantee */}
            <div className="discovery-sample-guarantee-card">
              <div className="guarantee-icon-wrap">
                <ShieldCheck size={22} />
              </div>
              <div className="guarantee-text">
                <h5>Risk-Free Scent Experience</h5>
                <p>
                  Every order includes a sealed <strong>2ml discovery vial</strong>. Test the fragrance on your skin first. If it does not enchant you, return the unopened 100ml master flacon for a full 100% refund.
                </p>
              </div>
            </div>

            {/* Luxury Dispatch Breakdown */}
            <div className="luxury-dispatch-list">
              <div className="dispatch-item">
                <Truck size={15} />
                <span>Complimentary Express Dispatch in 24 Hours</span>
              </div>
              <div className="dispatch-item">
                <Gift size={15} />
                <span>Signature Velvet Sleeve & Gold Wax-Sealed Box</span>
              </div>
              <div className="dispatch-item">
                <Award size={15} />
                <span>Individually Numbered Certificate of Authenticity</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 4. Interactive Sensory & Olfactory Architecture */}
      <section className="haute-sensory-section">
        <div className="sensory-tabs-nav">
          <button
            type="button"
            className={`sensory-tab-btn ${activeTab === 'pyramid' ? 'active' : ''}`}
            onClick={() => setActiveTab('pyramid')}
          >
            <Sparkles size={16} /> Olfactory Architecture
          </button>
          <button
            type="button"
            className={`sensory-tab-btn ${activeTab === 'ritual' ? 'active' : ''}`}
            onClick={() => setActiveTab('ritual')}
          >
            <Clock size={16} /> Sensory Evolution & Sillage
          </button>
          <button
            type="button"
            className={`sensory-tab-btn ${activeTab === 'sourcing' ? 'active' : ''}`}
            onClick={() => setActiveTab('sourcing')}
          >
            <Feather size={16} /> Perfumer’s Journal
          </button>
          <button
            type="button"
            className={`sensory-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            <Truck size={16} /> Atelier Shipping & Returns
          </button>
        </div>

        <div className="sensory-tab-panel">
          {/* TAB 1: Olfactory Architecture with Interactive Ingredient Chips */}
          {activeTab === 'pyramid' && (
            <div className="olfactory-pyramid-container">
              <div className="pyramid-intro">
                <h3 className="haute-section-heading">The Fragrance Architecture</h3>
                <p className="haute-section-subline">
                  Click any ingredient to explore its harvest provenance and aromatic behavior on warm skin.
                </p>
              </div>

              <div className="pyramid-cards-triad">
                {/* Top Notes */}
                <div className="pyramid-phase-card top">
                  <div className="phase-card-header">
                    <span className="phase-indicator">Stage 01 · 0 - 15 Mins</span>
                    <h4 className="phase-title">Top Notes</h4>
                    <span className="phase-nature">The Sparkling Awakening</span>
                  </div>
                  <div className="phase-notes-chips">
                    {topNotesList.map((note, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`note-interactive-chip ${selectedNoteDetail?.name === note ? 'active' : ''}`}
                        onClick={() => setSelectedNoteDetail({ name: note, ...getNoteProfile(note) })}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                  <p className="phase-desc">
                    Initial crystalline radiance that greets the senses with vivacious energy.
                  </p>
                </div>

                {/* Heart Notes */}
                <div className="pyramid-phase-card heart">
                  <div className="phase-card-header">
                    <span className="phase-indicator">Stage 02 · 15 Mins - 4 Hours</span>
                    <h4 className="phase-title">Heart Notes</h4>
                    <span className="phase-nature">The Emotional Soul</span>
                  </div>
                  <div className="phase-notes-chips">
                    {heartNotesList.map((note, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`note-interactive-chip ${selectedNoteDetail?.name === note ? 'active' : ''}`}
                        onClick={() => setSelectedNoteDetail({ name: note, ...getNoteProfile(note) })}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                  <p className="phase-desc">
                    The core opulent harmony that blooms as the fragrance settles and warms against body heat.
                  </p>
                </div>

                {/* Base Notes */}
                <div className="pyramid-phase-card base">
                  <div className="phase-card-header">
                    <span className="phase-indicator">Stage 03 · 4 - 12+ Hours</span>
                    <h4 className="phase-title">Base Notes</h4>
                    <span className="phase-nature">The Enduring Memory</span>
                  </div>
                  <div className="phase-notes-chips">
                    {baseNotesList.map((note, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`note-interactive-chip ${selectedNoteDetail?.name === note ? 'active' : ''}`}
                        onClick={() => setSelectedNoteDetail({ name: note, ...getNoteProfile(note) })}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                  <p className="phase-desc">
                    Sensual amber and rare woods that linger intimately on garments and pulse points.
                  </p>
                </div>
              </div>

              {/* Selected Note Provenance Spotlight */}
              {selectedNoteDetail && (
                <div className="ingredient-spotlight-modal animate-fade-in">
                  <div className="spotlight-badge">Provenance Spotlight</div>
                  <div className="spotlight-row">
                    <div>
                      <h4 className="spotlight-title">{selectedNoteDetail.name}</h4>
                      <p className="spotlight-origin"><strong>Origin:</strong> {selectedNoteDetail.origin}</p>
                      <p className="spotlight-family"><strong>Olfactory Family:</strong> {selectedNoteDetail.family}</p>
                    </div>
                    <p className="spotlight-text">{selectedNoteDetail.trait}</p>
                    <button
                      type="button"
                      className="btn-close-spotlight"
                      onClick={() => setSelectedNoteDetail(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Sensory Evolution & Sillage Radar */}
          {activeTab === 'ritual' && (
            <div className="sensory-metrics-layout">
              <div className="metrics-column">
                <h3 className="haute-section-heading">Performance & Sensory Signature</h3>
                <p className="haute-section-subline">Calibrated for exceptional skin affinity and enduring elegance.</p>

                <div className="metrics-bars-list">
                  <div className="metric-row">
                    <div className="metric-info">
                      <strong>Skin Longevity</strong>
                      <span>{product.longevity || '12+ Hours'}</span>
                    </div>
                    <div className="metric-track">
                      <div className="metric-fill gold" style={{ width: '96%' }}></div>
                    </div>
                  </div>

                  <div className="metric-row">
                    <div className="metric-info">
                      <strong>Sillage Presence</strong>
                      <span>{product.sillage || 'Bold & Enveloping'}</span>
                    </div>
                    <div className="metric-track">
                      <div className="metric-fill gold" style={{ width: '92%' }}></div>
                    </div>
                  </div>

                  <div className="metric-row">
                    <div className="metric-info">
                      <strong>Natural Essence Purity</strong>
                      <span>30% Pure Extrait</span>
                    </div>
                    <div className="metric-track">
                      <div className="metric-fill gold" style={{ width: '98%' }}></div>
                    </div>
                  </div>

                  <div className="metric-row">
                    <div className="metric-info">
                      <strong>Occasion Versatility</strong>
                      <span>{product.perfectFor || 'Intimate Soirées & Evenings'}</span>
                    </div>
                    <div className="metric-track">
                      <div className="metric-fill gold" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layering & Ritual Tip */}
              <div className="sensory-ritual-card">
                <div className="ritual-seal-icon"><Flame size={24} /></div>
                <h4>The Application Ritual</h4>
                <p>
                  To experience the full spectrum of {product.name}, mist directly onto pulse points: the base of the throat, wrists, and collarbone from 15cm away. Allow the extrait to absorb naturally without rubbing, preserving the delicate top-note molecules.
                </p>
                <div className="ritual-quote">
                  "A great perfume does not simply announce your arrival; it tenderly lingers in the room long after you have departed."
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Master Perfumer's Journal */}
          {activeTab === 'sourcing' && (
            <div className="perfumer-journal-layout">
              <div className="perfumer-story-content">
                <h3 className="haute-section-heading">Master Perfumer’s Journal</h3>
                <p className="journal-lead">
                  "With {product.name}, my desire was to capture the warmth of ancient spice routes and the quiet intimacy of autumn twilights in Paris."
                </p>
                <p className="journal-body">
                  {product.description} Distilled in small seasonal batches at our Grasse laboratory, each harvest year yields subtle nuances based on precipitation and soil terroir. We insist on slow, cold maceration for six weeks before bottling to ensure every aromatic facet melds into seamless perfection.
                </p>
                <div className="perfumer-signature-row">
                  <div className="perfumer-avatar-wrap">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"
                      alt="Alexandre Dubois"
                    />
                  </div>
                  <div>
                    <strong className="perfumer-name">Alexandre Dubois</strong>
                    <span className="perfumer-title">Master Perfumer · Maison Lumora Atelier</span>
                  </div>
                  <div className="grasse-seal-badge">
                    <span>Grasse · Paris</span>
                  </div>
                </div>
              </div>

              <div className="artisan-features-grid">
                <div className="artisan-feature-item">
                  <Award size={20} className="artisan-icon" />
                  <strong>Cold Macerated 42 Days</strong>
                  <p>Ensures roundness and eliminates harsh alcohol peaks.</p>
                </div>
                <div className="artisan-feature-item">
                  <CheckCircle2 size={20} className="artisan-icon" />
                  <strong>100% Vegan & Cruelty-Free</strong>
                  <p>Ethical botanical harvesting without synthetic fixatives.</p>
                </div>
                <div className="artisan-feature-item">
                  <Gift size={20} className="artisan-icon" />
                  <strong>Hand-Crafted Art Glass</strong>
                  <p>Weighted base with precision laser-engraved monogramming.</p>
                </div>
                <div className="artisan-feature-item">
                  <Sparkles size={20} className="artisan-icon" />
                  <strong>Certified Authenticity</strong>
                  <p>Accompanied by a signed parchment batch inspection card.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Atelier Shipping & Returns */}
          {activeTab === 'shipping' && (
            <div className="atelier-shipping-layout">
              <div className="shipping-policy-card">
                <Truck size={24} className="policy-icon" />
                <h4>Insured White-Glove Dispatch</h4>
                <p>
                  Orders are dispatched within 24 hours from our climate-controlled boutique atelier in temperature-shielded luxury coffrets. Tracking information is sent immediately via SMS and email.
                </p>
              </div>

              <div className="shipping-policy-card">
                <RefreshCw size={24} className="policy-icon" />
                <h4>The Discovery Vial Guarantee</h4>
                <p>
                  We enclose a complimentary 2ml test vial with every flacon. Open and test the vial on your skin for up to 30 days. If the sillage does not meet your expectations, return the unopened master bottle for an immediate full refund.
                </p>
              </div>

              <div className="shipping-policy-card">
                <ShieldCheck size={24} className="policy-icon" />
                <h4>Authenticity & Safe Transit</h4>
                <p>
                  Each flacon is protected by a tamper-proof beeswax or gold foil seal. Should any issue occur during transit, we replace your order express at zero cost.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Connoisseur Reviews Showcase */}
      <section className="haute-reviews-section" id="reviews">
        <div className="reviews-section-header">
          <div>
            <span className="reviews-pre-title">Collector Feedback</span>
            <h2 className="reviews-main-title">{product.rating} / 5.0 · Connoisseur Reviews</h2>
          </div>
          <button type="button" className="btn-write-review">
            Share Your Experience
          </button>
        </div>

        {/* Radar Scores Grid */}
        <div className="reviews-scores-grid">
          <div className="score-tile">
            <span className="score-number">5.0</span>
            <span className="score-label">Skin Longevity</span>
            <div className="score-bar"><div className="fill" style={{ width: '100%' }}></div></div>
          </div>
          <div className="score-tile">
            <span className="score-number">4.9</span>
            <span className="score-label">Sillage Radiance</span>
            <div className="score-bar"><div className="fill" style={{ width: '98%' }}></div></div>
          </div>
          <div className="score-tile">
            <span className="score-number">5.0</span>
            <span className="score-label">Extract Purity</span>
            <div className="score-bar"><div className="fill" style={{ width: '100%' }}></div></div>
          </div>
          <div className="score-tile">
            <span className="score-number">4.9</span>
            <span className="score-label">Flacon Presentation</span>
            <div className="score-bar"><div className="fill" style={{ width: '98%' }}></div></div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="reviews-cards-grid">
          <div className="haute-review-card">
            <div className="review-card-top">
              <div className="reviewer-profile">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160"
                  alt="Eleanor Vance"
                  className="reviewer-avatar"
                />
                <div>
                  <div className="reviewer-name-row">
                    <strong>Eleanor Vance</strong>
                    <span className="verified-badge"><Check size={12} /> Verified Connoisseur</span>
                  </div>
                  <span className="reviewer-meta">London, United Kingdom · September 2026</span>
                </div>
              </div>
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#b89628" color="#b89628" />
                ))}
              </div>
            </div>
            <p className="review-text">
              "An absolute masterpiece. From the initial sparkling citrus opening to the deep, lingering base notes of amber and sandalwood twelve hours later, this is hands down the most complimented perfume in my collection. The complimentary 2ml vial gave me total confidence before breaking the seal."
            </p>
            <div className="review-helpful-row">
              <span className="purchased-flacon-tag">Purchased: 100 ML Signature Flacon</span>
              <button type="button" className="btn-helpful-vote">Helpful (42)</button>
            </div>
          </div>

          <div className="haute-review-card">
            <div className="review-card-top">
              <div className="reviewer-profile">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160"
                  alt="Marcus Thorne"
                  className="reviewer-avatar"
                />
                <div>
                  <div className="reviewer-name-row">
                    <strong>Marcus Thorne</strong>
                    <span className="verified-badge"><Check size={12} /> Verified Connoisseur</span>
                  </div>
                  <span className="reviewer-meta">Zurich, Switzerland · August 2026</span>
                </div>
              </div>
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#b89628" color="#b89628" />
                ))}
              </div>
            </div>
            <p className="review-text">
              "The presentation flacon is heavy, magnetic, and feels like pure luxury. The warm cinnamon and smoky cardamom notes radiate beautifully on autumn evenings. Having my initials engraved in gold was an exquisite touch."
            </p>
            <div className="review-helpful-row">
              <span className="purchased-flacon-tag">Purchased: 200 ML Grand Decanter with Monogram</span>
              <button type="button" className="btn-helpful-vote">Helpful (38)</button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Curated Pairings / Related Fragrances */}
      {relatedFragrances.length > 0 && (
        <section className="haute-related-section">
          <div className="related-section-header">
            <span className="reviews-pre-title">Complete Your Olfactory Wardrobe</span>
            <h2 className="related-main-title">You May Also Cherish</h2>
          </div>
          <div className="haute-products-grid">
            {relatedFragrances.map((frag) => (
              <ProductCard key={frag.id} product={frag} />
            ))}
          </div>
        </section>
      )}

      {/* 7. Floating Sticky Bottom Checkout Dock (Appears on Scroll) */}
      {showStickyBar && (
        <div className="haute-sticky-bottom-dock animate-slide-up">
          <div className="sticky-dock-inner">
            <div className="sticky-product-meta">
              <img src={product.image} alt={product.name} className="sticky-thumb" />
              <div>
                <h4 className="sticky-title">{product.name}</h4>
                <p className="sticky-sub">{selectedVolume} · Extrait de Parfum</p>
              </div>
            </div>

            <div className="sticky-actions-right">
              <div className="sticky-price-wrap">
                <span className="sticky-price">₹{(currentPrice * quantity).toLocaleString()}</span>
                {quantity > 1 && <span className="sticky-qty-tag">({quantity} flacons)</span>}
              </div>

              <div className="sticky-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="sticky-add-btn"
                onClick={handleAddToCart}
              >
                <ShoppingBag size={16} /> Add to Bag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Lightbox Multi-Image Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        images={galleryImages}
        initialIndex={lightboxInitialIdx}
        title={product.name}
        subtitle={product.subtitle}
        price={currentPrice}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
