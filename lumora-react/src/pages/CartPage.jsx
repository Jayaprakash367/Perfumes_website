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
  CheckCircle
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
    if (!couponInput) return;
    applyPromo(couponInput);
    setCouponInput('');
  };

  const recommendations = products.slice(10, 14);

  if (items.length === 0) {
    return (
      <div className="cart-empty-page">
        <div className="empty-cart-card">
          <div className="cart-icon-halo">
            <ShoppingBag size={48} />
          </div>
          <h2>Your Luxury Cart is Empty</h2>
          <p>
            You have not added any perfumes to your personal flacon collection yet.
            Immerse yourself in our 65 master-crafted fragrances.
          </p>
          <Link to="/products" className="btn-browse-fragrances">
            <span>Explore Fragrance Catalog</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Similar Recommendations */}
        <div className="cart-recommendations-wrapper">
          <h3 className="rec-heading">Curated Connoisseur Favorites</h3>
          <div className="products-grid">
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
      {/* Header */}
      <div className="cart-header-row">
        <div>
          <h1 className="cart-page-title">Your Luxury Flacons</h1>
          <p className="cart-page-subtitle">
            Review your chosen fragrances before complimentary express dispatch.
          </p>
        </div>
        <Link to="/products" className="btn-continue-shopping">
          <ArrowLeft size={16} /> Continue Exploring
        </Link>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="free-shipping-card">
        <div className="shipping-bar-header">
          <div className="shipping-text">
            <Truck size={20} className="truck-icon" />
            {isFreeShipping ? (
              <span className="unlocked-text">
                <CheckCircle size={16} className="inline-check" /> <strong>Congratulations!</strong> You have unlocked Complimentary Express Shipping.
              </span>
            ) : (
              <span>
                Add <strong>₹{freeShippingRemaining}</strong> more of fine fragrances to unlock <strong>Complimentary Worldwide Express Delivery</strong>.
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

      {/* Main Two-Column Cart Layout */}
      <div className="cart-grid-layout">
        {/* Left Column: Items List */}
        <div className="cart-items-column">
          <div className="items-table-header">
            <span>Fragrance Description</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total Price</span>
          </div>

          <div className="items-list">
            {items.map((item) => (
              <div key={`${item.id}-${item.volume}`} className="cart-item-row">
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
                      <span className="item-unit-price">₹{item.price} each</span>
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
                      -
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

                {/* Subtotal and Delete */}
                <div className="item-pricing-block">
                  <span className="item-line-total">₹{item.price * item.quantity}</span>
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

          {/* Complimentary Discovery Notice */}
          <div className="complimentary-discovery-banner">
            <Sparkles size={20} className="sparkle-icon" />
            <div>
              <h4>Complimentary 2ml Extrait Vial Included</h4>
              <p>Every ordered flacon includes a complimentary sealed trial sample to test on your pulse points prior to opening the master bottle.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Checkout */}
        <div className="cart-summary-column">
          <div className="order-summary-card">
            <h3 className="summary-title">Order Summary</h3>

            {/* Promo Code Form */}
            <div className="promo-code-section">
              {appliedPromo ? (
                <div className="applied-promo-tag">
                  <div className="promo-info">
                    <Tag size={16} />
                    <span><strong>{appliedPromo.code}</strong> ({appliedPromo.discountPercent}% Off)</span>
                  </div>
                  <button type="button" onClick={removePromo} className="remove-promo-btn">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="coupon-form">
                  <input
                    type="text"
                    placeholder="Privilege Code (e.g. LUMORA10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="coupon-input"
                  />
                  <button type="submit" className="coupon-apply-btn">
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="summary-calculations">
              <div className="calc-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="calc-row discount-row">
                  <span>Privilege Discount ({appliedPromo?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="calc-row">
                <span>Express Worldwide Shipping</span>
                <span>{shipping === 0 ? <strong className="text-free">FREE</strong> : `₹${shipping}`}</span>
              </div>

              <div className="calc-row">
                <span>Estimated Taxes</span>
                <span className="text-inclusive">Included in Price</span>
              </div>

              <hr className="summary-divider" />

              <div className="calc-row grand-total-row">
                <span>Grand Total</span>
                <span className="grand-total-amount">₹{grandTotal}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              type="button"
              className="btn-proceed-checkout"
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div className="security-badges-block">
              <ShieldCheck size={18} />
              <span>Encrypted 256-Bit Bank-Grade Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Fragrances Slider */}
      <section className="cart-recommendations-section">
        <h3 className="section-title-alt">Connoisseurs Also Collected</h3>
        <div className="products-grid">
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
