import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  ArrowRight, 
  ShoppingBag, 
  Plus, 
  Minus,
  Tag, 
  ArrowLeft,
  X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';

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
    grandTotal
  } = useCart();

  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyPromo(couponInput.trim());
    setCouponInput('');
  };

  const recommendations = products.slice(0, 4);

  const cartItemIds = new Set(items.map((i) => i.id));
  const cartSuggestions = products
    .filter((p) => !cartItemIds.has(p.id) && (p.isBestseller || p.rating >= 4.8))
    .slice(0, 4);

  if (items.length === 0) {
    return (
      <div className="cart-page-container empty-state">
        <div className="empty-cart-card">
          <div className="empty-icon-circle">
            <ShoppingBag size={36} strokeWidth={1.5} />
          </div>
          <h2>Your Shopping Bag is Empty</h2>
          <p>Explore our catalog of fine fragrances to select your perfume.</p>
          <Link to="/products" className="btn-primary-action">
            <span>Explore Fragrances</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="cart-featured-section">
          <h3 className="section-title">Recommended Fragrances</h3>
          <div className="cart-recommendations-grid">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-page-header">
        <Link to="/products" className="back-link">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
        <h1 className="page-title">Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})</h1>
      </div>

      <div className="cart-layout-grid">
        {/* Left Column: Bag Items List */}
        <div className="cart-items-column">
          <div className="cart-items-card">
            <div className="items-table-header">
              <span className="col-product">Product</span>
              <span className="col-quantity">Quantity</span>
              <span className="col-price">Total</span>
            </div>

            <div className="items-list">
              {items.map((item) => {
                const itemVol = item.volume || item.selectedVolume || '100 ML';
                const itemTotal = (item.price || 0) * (item.quantity || 1);
                return (
                  <div key={`${item.id}-${itemVol}`} className="cart-item-row">
                    {/* Thumbnail & Product Details */}
                    <div className="item-product-col">
                      <Link to={`/product/${item.id}`} className="item-thumbnail-link">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="item-thumbnail" 
                          onError={(e) => { e.currentTarget.src = '/1.jpg'; }}
                        />
                      </Link>
                      <div className="item-meta">
                        <span className="item-category">{item.category || 'Eau de Parfum'}</span>
                        <h3 className="item-name">
                          <Link to={`/product/${item.id}`}>{item.name}</Link>
                        </h3>
                        <span className="item-volume">{itemVol}</span>
                        <span className="item-unit-price">₹{(item.price || 0).toLocaleString()} each</span>
                      </div>
                    </div>

                    {/* Quantity Picker */}
                    <div className="item-quantity-col">
                      <div className="quantity-stepper">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, itemVol, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="stepper-btn"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="quantity-val">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, itemVol, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="stepper-btn"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id, itemVol)}
                        className="btn-remove-item"
                        title="Remove item"
                        aria-label={`Remove ${item.name} from bag`}
                      >
                        <Trash2 size={15} /> Remove
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="item-price-col">
                      <span className="line-total-price">₹{itemTotal.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="cart-summary-column">
          <div className="cart-summary-card">
            <h2 className="summary-title">Order Summary</h2>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="coupon-form">
              <div className="coupon-input-wrap">
                <Tag size={16} className="coupon-icon" />
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="coupon-input"
                />
                <button type="submit" className="coupon-apply-btn">Apply</button>
              </div>
            </form>

            {appliedPromo && (
              <div className="applied-promo-chip">
                <span>Code <strong>{appliedPromo.code}</strong> applied ({appliedPromo.discountPercent}% off)</span>
                <button type="button" onClick={removePromo} className="btn-remove-promo" aria-label="Remove promo">
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="summary-breakdown">
              <div className="breakdown-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="breakdown-row discount">
                  <span>Discount</span>
                  <span>−₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="breakdown-row">
                <span>Standard Delivery</span>
                <span>
                  {shipping === 0 ? (
                    <span className="free-text">Complimentary</span>
                  ) : (
                    `₹${shipping.toLocaleString()}`
                  )}
                </span>
              </div>

              <div className="breakdown-row subtle">
                <span>Applicable Taxes</span>
                <span>Included</span>
              </div>

              <hr className="summary-divider" />

              <div className="breakdown-row total">
                <span>Total</span>
                <span className="grand-total-amount">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-checkout-primary"
              onClick={() => navigate('/checkout')}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Cart Product Suggestions to Complete Ritual */}
      {cartSuggestions.length > 0 && (
        <section className="cart-suggestions-section">
          <div className="cart-suggestions-header">
            <span className="cart-suggestions-eyebrow">Harmonious Pairings</span>
            <h2 className="cart-suggestions-title">You May Also Appreciate</h2>
            <p className="cart-suggestions-subtitle">
              Top customer favorites that pair exquisitely with your selected perfumes.
            </p>
          </div>
          <div className="cart-suggestions-grid">
            {cartSuggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
