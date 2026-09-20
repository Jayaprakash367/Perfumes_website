import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, SlidersHorizontal, X, Compass, Filter } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import CategoryBar from '../components/CategoryBar';
import FilterModal from '../components/FilterModal';
import QuickViewModal from '../components/QuickViewModal';
import ImageLightboxModal from '../components/ImageLightboxModal';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Advanced Filters State
  const [advancedFilters, setAdvancedFilters] = useState({
    category: initialCategory,
    maxPrice: 4500,
    minLongevity: '',
    minRating: 0
  });

  const [selectedQuickView, setSelectedQuickView] = useState(null);
  const [selectedLightbox, setSelectedLightbox] = useState(null);

  // Sync category with URL
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
      setAdvancedFilters(prev => ({ ...prev, category: cat }));
    }
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setAdvancedFilters(prev => ({ ...prev, category: cat }));
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleApplyAdvancedFilters = (newFilters) => {
    setAdvancedFilters(newFilters);
    setSelectedCategory(newFilters.category);
    if (newFilters.category !== 'All') {
      searchParams.set('category', newFilters.category);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setAdvancedFilters({
      category: 'All',
      maxPrice: 4500,
      minLongevity: '',
      minRating: 0
    });
    setSelectedCategory('All');
    setSearchQuery('');
    setSearchParams({});
  };

  // Count active filters (for badge)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.category !== 'All') count++;
    if (advancedFilters.maxPrice < 4500) count++;
    if (advancedFilters.minLongevity) count++;
    if (advancedFilters.minRating > 0) count++;
    return count;
  }, [advancedFilters]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      const matchesCategory =
        advancedFilters.category === 'All' ||
        product.category === advancedFilters.category;

      // Price filter
      const matchesPrice = product.price <= advancedFilters.maxPrice;

      // Longevity filter
      const matchesLongevity =
        !advancedFilters.minLongevity ||
        product.longevity.includes(advancedFilters.minLongevity.split(' ')[0]);

      // Rating filter
      const matchesRating =
        !advancedFilters.minRating || product.rating >= advancedFilters.minRating;

      // Text query
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.topNotes.toLowerCase().includes(query) ||
        product.heartNotes.toLowerCase().includes(query) ||
        product.baseNotes.toLowerCase().includes(query);

      return (
        matchesCategory &&
        matchesPrice &&
        matchesLongevity &&
        matchesRating &&
        matchesQuery
      );
    });
  }, [advancedFilters, searchQuery]);

  return (
    <div className="airbnb-catalog-page">
      {/* Category Icons Bar Strip (Fixed Airbnb Subheader) */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onOpenFilters={() => setIsFilterModalOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Main Listings Grid Container */}
      <main className="airbnb-listings-container">
        {/* Search / Filter Active Indicator Banner if any */}
        {(searchQuery || activeFiltersCount > 0) && (
          <div className="active-query-banner">
            <span className="query-results-text">
              Showing <strong>{filteredProducts.length}</strong> fragrances
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </span>
            <button className="btn-clear-query" onClick={handleResetFilters}>
              <X size={14} /> Clear all filters
            </button>
          </div>
        )}

        {/* The Airbnb Grid */}
        {filteredProducts.length > 0 ? (
          <div className="airbnb-products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setSelectedQuickView(p)}
              />
            ))}
          </div>
        ) : (
          <div className="airbnb-no-results">
            <div className="no-results-icon-wrap">
              <Filter size={32} />
            </div>
            <h3>No exact matches found</h3>
            <p>
              Try changing or clearing some of your filters or searching for different notes.
            </p>
            <button className="btn-airbnb-clear" onClick={handleResetFilters}>
              Remove all filters
            </button>
          </div>
        )}
      </main>

      {/* Airbnb Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={advancedFilters}
        onApplyFilters={handleApplyAdvancedFilters}
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
