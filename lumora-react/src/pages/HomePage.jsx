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

// Verified high-resolution luxury hero slides
const heroSlides = [
  '/atelier-craftsmanship.jpg',
  '/footer-full-bg.jpg',
  '/s1UY-unsplash.jpg',
  '/s5A-unsplash.jpg'
];

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedQuickView, setSelectedQuickView] = useState(null);
  const [selectedLightbox, setSelectedLightbox] = useState(null);

  // Hero Slider State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-advance hero slider & preload all slides in background for zero lag
  useEffect(() => {
    // Background preload
    heroSlides.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
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
      {/* 1. Full-Bleed Header Slider Filling Correctly with Box Design at Bottom */}
      <div className="header-slider">
        <div className="slider-images">
          {heroSlides.map((slide, index) => (
            <img
              key={index}
              src={slide}
              className={`slider-img ${index === currentSlideIndex ? 'active' : ''}`}
              alt={`LUMORA Scent Slide ${index + 1}`}
              loading="eager"
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/atelier-craftsmanship.jpg';
              }}
            />
          ))}
          <div className="slider-bottom-vignette"></div>
        </div>

        {/* Content Box Centered in Image */}
        <div className="slider-bottom-box">
          <div className="slider-box-card">
            <h1 className="slider-box-title"><i>The Art of Scent</i></h1>
            <p className="slider-box-desc"><i>Perfume is the art that makes memory speak.</i></p>
            <button
              type="button"
              className="header-button"
              onClick={() => navigate('/products')}
            >
              EXPLORE NOW
            </button>
          </div>
        </div>

        {/* Slide Indicator Dots at Bottom */}
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
