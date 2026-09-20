import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Award, 
  Star, 
  CheckCircle, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShoppingBag
} from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import CategoryBar from '../components/CategoryBar';
import FilterModal from '../components/FilterModal';
import QuickViewModal from '../components/QuickViewModal';
import ImageLightboxModal from '../components/ImageLightboxModal';

// Signature hero slides from original website requested by user
const heroSlides = [
  '/s1UY-unsplash.jpg',
  '/s2plash.jpg',
  '/s3-unsplash.jpg',
  '/s4splash.jpg'
];

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedQuickView, setSelectedQuickView] = useState(null);
  const [selectedLightbox, setSelectedLightbox] = useState(null);

  // Hero Slider State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-advance hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Advanced Filters
  const [filters, setFilters] = useState({
    category: 'All',
    maxPrice: 4500,
    minLongevity: '',
    minRating: 0
  });

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setFilters(prev => ({ ...prev, category: cat }));
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setSelectedCategory(newFilters.category);
  };

  const handleResetFilters = () => {
    setFilters({
      category: 'All',
      maxPrice: 4500,
      minLongevity: '',
      minRating: 0
    });
    setSelectedCategory('All');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.maxPrice < 4500) count++;
    if (filters.minLongevity) count++;
    if (filters.minRating > 0) count++;
    return count;
  }, [filters]);

  // Filtered Products
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = filters.category === 'All' || p.category === filters.category;
      const matchPrice = p.price <= filters.maxPrice;
      const matchLong = !filters.minLongevity || p.longevity.includes(filters.minLongevity.split(' ')[0]);
      const matchRate = !filters.minRating || p.rating >= filters.minRating;
      return matchCat && matchPrice && matchLong && matchRate;
    });
  }, [filters]);

  return (
    <div className="airbnb-home-page">
      {/* 1. Full-Bleed Header Slider (Exact design format from user screenshot) */}
      <div className="header-slider">
        <div className="slider-images">
          {heroSlides.map((slide, index) => (
            <img
              key={index}
              src={slide}
              className={`slider-img ${index === currentSlideIndex ? 'active' : ''}`}
              alt={`LUMORA Scent Slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="slider-caption">
          <h1 className="candal-regular"><i>The Art of Scent</i></h1>
          <p><i>Perfume is the art that makes memory speak.</i></p>
          <button
            type="button"
            className="header-button"
            onClick={() => navigate('/products')}
          >
            EXPLORE NOW
          </button>
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          className="header-slider-arrow prev"
          onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          aria-label="Previous perfume slide"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          className="header-slider-arrow next"
          onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length)}
          aria-label="Next perfume slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Slide Indicator Dots */}
        <div className="header-slider-dots">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`header-slider-dot ${idx === currentSlideIndex ? 'active' : ''}`}
              onClick={() => setCurrentSlideIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Airbnb Category Icons Bar Strip (Fixed subheader just like Airbnb) */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* 3. Main Listings Grid (Airbnb Stay Format) */}
      <section className="airbnb-main-listings-section">
        <div className="listings-header-row">
          <div>
            <h2 className="listings-section-title">
              {selectedCategory === 'All' ? 'Popular Worldwide Flacons' : `${selectedCategory} Collection`}
            </h2>
            <p className="listings-section-sub">
              Showing {displayedProducts.length} flacons curated with rare aromatic essences
            </p>
          </div>

          <Link to="/products" className="see-all-link">
            <u>Show all 65</u> &rarr;
          </Link>
        </div>

        {displayedProducts.length > 0 ? (
          <div className="airbnb-products-grid">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setSelectedQuickView(p)}
              />
            ))}
          </div>
        ) : (
          <div className="airbnb-no-results">
            <Filter size={32} />
            <h3>No fragrances found</h3>
            <p>Try resetting your price or longevity filters to view available perfumes.</p>
            <button className="btn-airbnb-clear" onClick={handleResetFilters}>
              Reset all filters
            </button>
          </div>
        )}
      </section>

      {/* 4. Airbnb Host / Atelier Heritage Section */}
      <section className="airbnb-atelier-feature" id="story">
        <div className="atelier-inner-box">
          <div className="atelier-content-col">
            <span className="eyebrow-airbnb">Master Perfumer Craftsmanship</span>
            <h2 className="atelier-title-airbnb">Distilled without compromise</h2>
            <p>
              In our Grasse atelier, master perfumers spend months perfecting each formula. We harvest Damask roses at dawn, age resins in French oak, and bottle in heavy crystalline flacons with magnetic seals.
            </p>

            <div className="atelier-stats-grid">
              <div className="stat-card-airbnb">
                <span className="stat-big-num">65</span>
                <span className="stat-caption">Bespoke formulations</span>
              </div>
              <div className="stat-card-airbnb">
                <span className="stat-big-num">100%</span>
                <span className="stat-caption">Natural essential extracts</span>
              </div>
              <div className="stat-card-airbnb">
                <span className="stat-big-num">12+ Hr</span>
                <span className="stat-caption">Documented skin longevity</span>
              </div>
            </div>

            <Link to="/products" className="btn-visit-atelier">
              Explore The Complete Harvest &rarr;
            </Link>
          </div>

          <div className="atelier-photo-col">
            <img 
              src="/laura-chouette-4sKdeIMiFEI-unsplash.jpg" 
              alt="LUMORA Atelier Craft" 
              className="atelier-featured-photo"
            />
          </div>
        </div>
      </section>

      {/* 5. Trust Pillars Bar */}
      <section className="airbnb-trust-pillars">
        <div className="trust-pillar-item">
          <ShieldCheck size={26} className="pillar-icon-airbnb" />
          <div>
            <h4>100% Authentic Guarantee</h4>
            <p>Direct from our certified Parisian and Grasse ateliers.</p>
          </div>
        </div>

        <div className="trust-pillar-item">
          <Truck size={26} className="pillar-icon-airbnb" />
          <div>
            <h4>Express Worldwide Delivery</h4>
            <p>Complimentary insured delivery on orders over ₹3,000.</p>
          </div>
        </div>

        <div className="trust-pillar-item">
          <RefreshCw size={26} className="pillar-icon-airbnb" />
          <div>
            <h4>30-Day Flacon Returns</h4>
            <p>Complimentary 2ml sample vial included with every flacon.</p>
          </div>
        </div>
      </section>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedQuickView}
        isOpen={!!selectedQuickView}
        onClose={() => setSelectedQuickView(null)}
        onOpenLightbox={(p) => setSelectedLightbox(p)}
      />

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={!!selectedLightbox}
        image={selectedLightbox?.image}
        title={selectedLightbox?.name}
        price={selectedLightbox?.price}
        onClose={() => setSelectedLightbox(null)}
      />
    </div>
  );
}
