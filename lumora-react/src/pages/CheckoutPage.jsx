import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ShieldCheck, 
  CheckCircle, 
  ArrowLeft, 
  Lock, 
  Package, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, discount, appliedPromo, shipping, grandTotal, clearCart } = useCart();
  const { user, addOrder } = useAuth();
  const { addToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '142 Luxury Boulevard, Suite 8',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400050',
    cardNumber: '4532 8920 1823 4242',
    cardName: user?.name || 'ALEXANDRE DUBOIS',
    cardExpiry: '08/29',
    cardCvv: '839',
    upiId: 'alexandre@okaxis'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.address) {
      addToast('Please provide your complete shipping details', 'warning');
      return;
    }

    if (paymentMethod === 'card' && (!formData.cardNumber || !formData.cardCvv)) {
      addToast('Please complete your card details', 'warning');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderPayload = {
        items: [...items],
        subtotal,
        discount,
        promoCode: appliedPromo?.code || null,
        shipping,
        total: grandTotal,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.postalCode}`
        },
        paymentMethod:
          paymentMethod === 'card'
            ? `Credit Card (•••• ${formData.cardNumber.slice(-4)})`
            : paymentMethod === 'upi'
            ? `UPI (${formData.upiId})`
            : 'Cash on Delivery (COD)'
      };

      const saved = addOrder(orderPayload);
      clearCart();
      setIsSubmitting(false);
      setCompletedOrder(saved);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#e29578', '#111215', '#ffffff']
        });
      } catch (err) {
        console.error(err);
      }
    }, 1800);
  };

  // Render Order Confirmation View
  if (completedOrder) {
    return (
      <div className="order-success-page">
        <div className="order-success-card">
          <div className="success-icon-badge">
            <CheckCircle size={56} className="check-svg" />
          </div>

          <span className="success-eyebrow">Haute Parfumerie Dispatch Confirmed</span>
          <h1 className="success-title">Thank You, {formData.fullName.split(' ')[0]}</h1>
          <p className="success-message">
            Your flacon harvest has been reserved. A confirmation invoice along with your bespoke tracking number has been sent to <strong>{formData.email}</strong>.
          </p>

          <div className="order-details-box">
            <div className="detail-row">
              <span>Order Reference</span>
              <strong className="order-code">{completedOrder.id}</strong>
            </div>
            <div className="detail-row">
              <span>Date Placed</span>
              <span>{completedOrder.date}</span>
            </div>
            <div className="detail-row">
              <span>Payment Protocol</span>
              <span>{completedOrder.paymentMethod}</span>
            </div>
            <div className="detail-row">
              <span>Estimated Delivery</span>
              <span className="delivery-date-text">
                <Calendar size={14} /> 2 - 4 Business Days (Express Insured)
              </span>
            </div>
            <div className="detail-row total-row">
              <span>Total Amount</span>
              <span className="total-val">₹{completedOrder.total}</span>
            </div>
          </div>

          <div className="order-items-preview">
            <h4>Flacons in This Shipment</h4>
            <div className="preview-list">
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="preview-item">
                  <img src={item.image} alt={item.name} />
                  <div className="preview-info">
                    <strong>{item.name}</strong>
                    <span>{item.volume} • Qty: {item.quantity}</span>
                  </div>
                  <span className="preview-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="success-actions-row">
            <Link to="/profile" className="btn-success-profile">
              <Package size={18} /> View in Order History
            </Link>
            <Link to="/products" className="btn-success-continue">
              Discover More Fragrances &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty-container">
        <h2>Your Cart is Empty</h2>
        <p>Please select your luxury fragrances before proceeding to checkout.</p>
        <Link to="/products" className="btn-browse-fragrances">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Header */}
      <div className="checkout-header-bar">
        <Link to="/cart" className="back-to-cart-link">
          <ArrowLeft size={18} /> Return to Cart
        </Link>
        <div className="checkout-security-badge">
          <Lock size={16} /> 256-Bit SSL Encrypted Protocol
        </div>
      </div>

      <h1 className="checkout-title">Haute Parfumerie Checkout</h1>

      <div className="checkout-layout-grid">
        {/* Left Column: Forms */}
        <div className="checkout-form-column">
          <form onSubmit={handlePlaceOrder} id="checkoutForm">
            {/* Step 1: Client & Shipping Info */}
            <section className="form-step-card">
              <div className="step-card-header">
                <span className="step-pill">1</span>
                <h3>Shipping & Concierge Details</h3>
              </div>

              <div className="form-grid-two">
                <div className="input-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Lady / Lord / Monsieur"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Email Address for Tracking *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-two">
                <div className="input-group">
                  <label>Contact Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Street Address & Residence *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House/Apartment, Street"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-three">
                <div className="input-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>State / Region *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Payment Method */}
            <section className="form-step-card">
              <div className="step-card-header">
                <span className="step-pill">2</span>
                <h3>Payment Protocol</h3>
              </div>

              {/* Payment Tabs */}
              <div className="payment-tabs-group">
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={18} />
                  <span>Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <Smartphone size={18} />
                  <span>UPI / GPay / PhonePe</span>
                </button>

                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <Banknote size={18} />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="card-payment-view">
                  {/* Virtual Card Preview */}
                  <div className="virtual-card-preview">
                    <div className="card-top-row">
                      <span className="card-chip"></span>
                      <span className="card-brand-label">LUMORA BLACK CARD</span>
                    </div>
                    <div className="card-number-display">
                      {formData.cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="card-bottom-row">
                      <div>
                        <span className="card-meta-label">CARDHOLDER</span>
                        <div className="card-name-display">{formData.cardName || 'CONNOISSEUR'}</div>
                      </div>
                      <div>
                        <span className="card-meta-label">EXPIRES</span>
                        <div className="card-expiry-display">{formData.cardExpiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Cardholder Full Name</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      placeholder="Name as it appears on card"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      maxLength="19"
                      placeholder="4532 •••• •••• ••••"
                      required
                    />
                  </div>

                  <div className="form-grid-two">
                    <div className="input-group">
                      <label>Expiry Date (MM/YY)</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        maxLength="5"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Security CVV</label>
                      <input
                        type="password"
                        name="cardCvv"
                        value={formData.cardCvv}
                        onChange={handleChange}
                        maxLength="4"
                        placeholder="•••"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Form */}
              {paymentMethod === 'upi' && (
                <div className="upi-payment-view">
                  <p className="upi-instruction">
                    Enter your Virtual Payment Address (VPA) or scan instantly on the next prompt:
                  </p>
                  <div className="input-group">
                    <label>UPI ID / VPA</label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleChange}
                      placeholder="username@bank or mobile@upi"
                      required
                    />
                  </div>
                  <div className="upi-provider-icons">
                    <span>Google Pay</span>
                    <span>PhonePe</span>
                    <span>Paytm</span>
                    <span>BHIM</span>
                  </div>
                </div>
              )}

              {/* Cash on Delivery */}
              {paymentMethod === 'cod' && (
                <div className="cod-view">
                  <p className="cod-text">
                    You can pay in cash or via QR upon delivery of your luxury presentation flacons.
                    Please ensure the exact amount of <strong>₹{grandTotal}</strong> is available at the time of courier arrival.
                  </p>
                </div>
              )}
            </section>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-complete-order"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Dispatching Order...</span>
              ) : (
                <span>Confirm & Place Order • ₹{grandTotal}</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary Preview */}
        <div className="checkout-summary-column">
          <div className="checkout-recap-card">
            <h3>Your Selected Flacons ({items.length})</h3>

            <div className="recap-items-list">
              {items.map((item) => (
                <div key={`${item.id}-${item.volume}`} className="recap-item">
                  <img src={item.image} alt={item.name} className="recap-img" />
                  <div className="recap-info">
                    <strong className="recap-name">{item.name}</strong>
                    <span className="recap-vol">{item.volume} • Qty: {item.quantity}</span>
                  </div>
                  <span className="recap-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <hr className="recap-divider" />

            <div className="recap-totals-block">
              <div className="recap-row">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="recap-row discount">
                  <span>Privilege Code ({appliedPromo?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="recap-row">
                <span>Express Insured Shipping</span>
                <span>{shipping === 0 ? <strong className="text-free">FREE</strong> : `₹${shipping}`}</span>
              </div>
              <div className="recap-row grand-total">
                <strong>Grand Total</strong>
                <strong className="amount">₹{grandTotal}</strong>
              </div>
            </div>

            <div className="recap-perk">
              <Sparkles size={16} />
              <span>Complimentary 2ml trial vial & gift wrapping included</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
