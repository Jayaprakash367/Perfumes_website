import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  ArrowRight, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  Tag, 
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Lock,
  Gift,
  Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    discount,
    appliedPromo,
    applyPromo,
    removePromo,
    shipping,
    isFreeShipping,
    freeShippingRemaining,
    freeShippingProgress,
    grandTotal
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyPromo(couponInput.trim());
    setCouponInput('');
  };

  const recommendations = products.slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="cart-empty-page">
        <div className="empty-cart-card">
          <div className="cart-icon-halo">
            <ShoppingBag size={44} />
          </div>
          <h2>Your Luxury Cart is Empty</h2>
          <p>
            You have not added any fragrances to your personal flacon collection yet.
            Immerse yourself in our master-crafted haute parfumerie collection.
          </p>
          <Link to="/products" className="btn-browse-fragrances">
            <span>Explore Fragrance Vault</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Curated Recommendations for Empty State */}
        <div className="cart-recommendations-wrapper">
          <div className="rec-header-row">
            <h3 className="rec-heading">Curated Connoisseur Selections</h3>
            <p className="rec-subtitle">Iconic flacons loved by private patrons worldwide</p>
          </div>
          <div className="cart-products-recommendation-grid">
            {recommendations.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        </div>

        <QuickViewModal
          product={quickViewProduct}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onOpenLightbox={(prod) => setQuickViewProduct(prod)}
        />
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Checkout Progress Stepper Indicator */}
      <div className="cart-stepper-header">
        <div className="step-crumb active">
          <span className="step-num">1</span>
          <span className="step-label">Flacon Selection</span>
        </div>
        <div className="step-divider active"></div>
        <div className="step-crumb">
          <span className="step-num">2</span>
          <span className="step-label">Atelier Delivery</span>
        </div>
        <div className="step-divider"></div>
        <div className="step-crumb">
          <span className="step-num">3</span>
          <span className="step-label">Secure Payment</span>
        </div>
      </div>

      {/* Header Row */}
      <div className="cart-header-row">
        <div>
          <h1 className="cart-page-title">Your Luxury Flacons</h1>
          <p className="cart-page-subtitle">
            {items.reduce((sum, item) => sum + item.quantity, 0)} {items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'flacon' : 'flacons'} prepared for complimentary atelier dispatch.
          </p>
        </div>
        <Link to="/products" className="btn-continue-shopping">
          <ArrowLeft size={16} /> Continue Exploring
        </Link>
      </div>

      {/* Free Express Shipping Meter */}
      <div className="free-shipping-card">
        <div className="shipping-bar-header">
          <div className="shipping-text">
            <Truck size={20} className="truck-icon" />
            {isFreeShipping ? (
              <span className="unlocked-text">
                <CheckCircle2 size={17} className="inline-check" /> <strong>Congratulations!</strong> You have unlocked Complimentary Express Air Delivery.
              </span>
            ) : (
              <span>
                Add <strong>₹{freeShippingRemaining.toLocaleString()}</strong> more to unlock <strong>Complimentary Express Air Delivery</strong>.
              </span>
            )}
          </div>
          <span className="shipping-percent">{freeShippingProgress}%</span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${freeShippingProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Main Two-Column Cart Grid */}
      <div className="cart-grid-layout">
        {/* Left Column: Cart Items List */}
        <div className="cart-items-column">
          <div className="items-table-header">
            <span>Flacon Selection</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Investment</span>
          </div>

          <div className="items-list">
            {items.map((item) => (
              <div key={`${item.id}-${item.volume}`} className="cart-item-row">
                {/* Item Details */}
                <div className="item-details-block">
                  <Link to={`/product/${item.id}`} className="item-thumbnail-link">
                    <img src={item.image} alt={item.name} className="item-thumbnail" />
                  </Link>
                  <div className="item-meta">
                    <span className="item-cat">{item.category}</span>
                    <h3 className="item-name">
                      <Link to={`/product/${item.id}`}>{item.name}</Link>
                    </h3>
                    <div className="item-specs">
                      <span className="item-volume-badge">{item.volume} Extrait</span>
                      <span className="item-unit-price">₹{item.price.toLocaleString()} each</span>
                    </div>
                  </div>
                </div>

                {/* Stepper */}
                <div className="item-stepper-block">
                  <div className="quantity-stepper small">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.volume, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.volume, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Subtotal & Delete */}
                <div className="item-pricing-block">
                  <span className="item-line-total">₹{(item.price * item.quantity).toLocaleString()}</span>
                  <button
                    type="button"
                    className="item-remove-btn"
                    onClick={() => removeFromCart(item.id, item.volume)}
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Complimentary Discovery & Packaging Assurance */}
          <div className="complimentary-discovery-banner">
            <div className="discovery-icon-halo">
              <Gift size={22} className="sparkle-icon" />
            </div>
            <div className="discovery-text">
              <h4>Complimentary 2ml Extrait Vial & Bespoke Presentation</h4>
              <p>
                Each ordered flacon includes a complimentary sealed 2ml discovery vial to test on pulse points prior to opening the master bottle, plus signature satin ribbons and wax seal.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout Action */}
        <div className="cart-summary-column">
          <div className="order-summary-card">
            <h3 className="summary-title">Order Summary</h3>

            {/* Privilege Code Section */}
            <div className="promo-code-section">
              {appliedPromo ? (
                <div className="applied-promo-tag">
                  <div className="promo-info">
                    <Tag size={16} />
                    <span><strong>{appliedPromo.code}</strong> ({appliedPromo.discountPercent}% Off Applied)</span>
                  </div>
                  <button type="button" onClick={removePromo} className="btn-remove-promo">
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleApplyCoupon} className="promo-input-form">
                    <div className="promo-input-wrap">
                      <Tag size={15} className="promo-tag-icon" />
                      <input
                        type="text"
                        placeholder="Privilege Code (e.g. LUMORA10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="promo-input"
                      />
                    </div>
                    <button type="submit" className="btn-apply-promo">
                      Apply
                    </button>
                  </form>
                  <div className="promo-hints">
                    <span>Try code:</span>
                    <button 
                      type="button" 
                      className="promo-chip"
                      onClick={() => applyPromo('LUMORA10')}
                    >
                      LUMORA10 (10% OFF)
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Price Calculations */}
            <div className="summary-cost-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="summary-row">
                  <span>Privilege Discount ({appliedPromo?.code})</span>
                  <span className="discount-text">−₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Express Worldwide Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="free-shipping-badge">FREE</span>
                  ) : (
                    `₹${shipping.toLocaleString()}`
                  )}
                </span>
              </div>

              <div className="summary-row">
                <span>Estimated Taxes & Duties</span>
                <span className="text-inclusive">Included in Price</span>
              </div>

              <hr className="summary-divider" />

              <div className="summary-total-row">
                <span>Grand Total</span>
                <span className="total-gold-price">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              type="button"
              className="btn-checkout-primary"
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Secure Checkout</span>
              <ArrowRight size={18} />
            </button>

            {/* Trust Assurance Strip */}
            <div className="cart-security-badges">
              <div className="security-point">
                <Lock size={15} className="sec-icon" />
                <span>256-Bit Bank-Grade SSL Encryption</span>
              </div>
              <div className="security-point">
                <ShieldCheck size={15} className="sec-icon" />
                <span>30-Day Privilege Return Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Fragrances Section */}
      <section className="cart-recommendations-section">
        <div className="rec-section-header">
          <div>
            <h3 className="rec-section-title">Connoisseurs Also Collected</h3>
            <p className="rec-section-subtitle">Complementary olfactory accords curated by our master perfumers</p>
          </div>
          <Link to="/products" className="rec-see-all-link">
            <u>Explore All 65</u> &rarr;
          </Link>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="cart-products-recommendation-grid">
          {recommendations.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onOpenLightbox={(prod) => setQuickViewProduct(prod)}
      />
    </div>
  );
}
