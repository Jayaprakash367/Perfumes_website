import React, { useRef, useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Sparkles,
  Flame,
  Sun,
  Flower2,
  TreePine,
  Gem,
  Coffee,
  Feather,
  Crown,
  Compass,
  Zap,
  Moon,
  Droplets,
  Heart
} from 'lucide-react';
import { categories } from '../data/products';

// Mapping categories to iconic Airbnb-style icons
const categoryIcons = {
  "All": Sparkles,
  "Fresh Citrus": Sun,
  "Floral Romance": Flower2,
  "Warm Spice": Flame,
  "Woody Aromatic": TreePine,
  "Fresh Floral": Droplets,
  "Amber Vanilla": Gem,
  "Leather Aromatic": Coffee,
  "Powdery Floral": Feather,
  "Energetic Citrus": Zap,
  "Mysterious Oriental": Moon,
  "Classic Timeless": Compass,
  "Modern Oriental": Sparkles,
  "Fresh & Clean": Droplets,
  "Luxury Prestige": Crown,
  "Sweet Wood": TreePine,
  "Fresh Green": TreePine,
  "Sensual Oriental": Heart,
  "Unique Avant-Garde": Compass,
  "Powerful Statement": Crown
};

export default function CategoryBar({ selectedCategory, onSelectCategory, onOpenFilters, activeFiltersCount }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 380;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkScroll, 350);
  };

  return (
    <div className="airbnb-category-bar-wrapper">
      <div className="category-bar-inner">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            type="button"
            className="category-scroll-btn scroll-left"
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {/* Scrollable Category Icons List */}
        <div 
          className="category-carousel-track" 
          ref={scrollRef}
          onScroll={checkScroll}
        >
          {categories.map((cat) => {
            const IconComponent = categoryIcons[cat] || Sparkles;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                className={`airbnb-cat-item ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat)}
              >
                <div className="cat-icon-wrap">
                  <IconComponent size={22} className="cat-icon" />
                </div>
                <span className="cat-label">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            type="button"
            className="category-scroll-btn scroll-right"
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Filters Pill Button */}
        <div className="category-filter-trigger-box">
          <button
            type="button"
            className={`airbnb-filters-pill-btn ${activeFiltersCount > 0 ? 'has-active' : ''}`}
            onClick={onOpenFilters}
          >
            <SlidersHorizontal size={15} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="filter-active-count">{activeFiltersCount}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
