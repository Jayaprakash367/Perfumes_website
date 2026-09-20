import React, { useState } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { categories } from '../data/products';

export default function FilterModal({ isOpen, onClose, filters, onApplyFilters, onResetFilters }) {
  const [localFilters, setLocalFilters] = useState(filters);

  if (!isOpen) return null;

  const handlePriceChange = (e) => {
    setLocalFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value) }));
  };

  const toggleCategory = (cat) => {
    setLocalFilters(prev => ({
      ...prev,
      category: prev.category === cat ? 'All' : cat
    }));
  };

  const handleLongevitySelect = (val) => {
    setLocalFilters(prev => ({
      ...prev,
      minLongevity: prev.minLongevity === val ? '' : val
    }));
  };

  const handleRatingSelect = (val) => {
    setLocalFilters(prev => ({
      ...prev,
      minRating: prev.minRating === val ? 0 : val
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetState = {
      category: 'All',
      maxPrice: 4500,
      minLongevity: '',
      minRating: 0
    };
    setLocalFilters(resetState);
    onResetFilters();
    onClose();
  };

  return (
    <div className="airbnb-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="airbnb-filter-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="filter-modal-header">
          <button className="filter-close-btn" onClick={onClose} aria-label="Close filters">
            <X size={18} />
          </button>
          <h3 className="filter-modal-title">Filters</h3>
          <div style={{ width: 32 }}></div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="filter-modal-body">
          {/* Price Range */}
          <section className="filter-section">
            <h4 className="filter-section-title">Price range</h4>
            <p className="filter-section-subtitle">Prices include all luxury taxes & express insurance</p>

            <div className="price-slider-wrapper">
              <input
                type="range"
                min="1000"
                max="4500"
                step="100"
                value={localFilters.maxPrice}
                onChange={handlePriceChange}
                className="airbnb-range-slider"
              />
              <div className="price-inputs-row">
                <div className="price-box">
                  <span className="price-box-label">Minimum</span>
                  <div className="price-box-value">₹1,000</div>
                </div>
                <div className="price-range-divider">—</div>
                <div className="price-box">
                  <span className="price-box-label">Maximum</span>
                  <div className="price-box-value">₹{localFilters.maxPrice.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </section>

          <hr className="filter-divider" />

          {/* Fragrance Families */}
          <section className="filter-section">
            <h4 className="filter-section-title">Fragrance family</h4>
            <div className="filter-pills-grid">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-pill-item ${localFilters.category === cat ? 'selected' : ''}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {localFilters.category === cat && <Check size={14} className="check-icon" />}
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </section>

          <hr className="filter-divider" />

          {/* Skin Longevity */}
          <section className="filter-section">
            <h4 className="filter-section-title">Minimum longevity on skin</h4>
            <div className="filter-buttons-row">
              {['8 - 10 Hours', '10 - 12 Hours', '12+ Hours', '16+ Hours'].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  className={`filter-option-btn ${localFilters.minLongevity === dur ? 'active' : ''}`}
                  onClick={() => handleLongevitySelect(dur)}
                >
                  {dur}
                </button>
              ))}
            </div>
          </section>

          <hr className="filter-divider" />

          {/* Connoisseur Rating */}
          <section className="filter-section">
            <h4 className="filter-section-title">Connoisseur rating</h4>
            <div className="filter-buttons-row">
              {[
                { label: 'Any', val: 0 },
                { label: '★ 4.8+', val: 4.8 },
                { label: '★ 4.9+', val: 4.9 },
                { label: '★ 5.0 (Flawless)', val: 5.0 }
              ].map((r) => (
                <button
                  key={r.label}
                  type="button"
                  className={`filter-option-btn ${localFilters.minRating === r.val ? 'active' : ''}`}
                  onClick={() => handleRatingSelect(r.val)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="filter-modal-footer">
          <button type="button" className="btn-clear-all" onClick={handleReset}>
            Clear all
          </button>
          <button type="button" className="btn-apply-filters" onClick={handleApply}>
            Show fragrances
          </button>
        </div>
      </div>
    </div>
  );
}
