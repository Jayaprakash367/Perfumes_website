import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  CheckCircle, 
  ArrowLeft, 
  Package, 
  Calendar
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersApi } from '../api/orders';

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

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.address.trim()) {
      addToast('Please enter your complete shipping details', 'warning');
      return;
    }

    if (paymentMethod === 'card' && (!formData.cardNumber || !formData.cardCvv)) {
      addToast('Please complete your card details', 'warning');
      return;
    }

    setIsSubmitting(true);

    const executeOrder = async () => {
      let saved = null;
      try {
        const token = localStorage.getItem('lumora_token');
        if (token) {
          const res = await ordersApi.createOrder({
            shippingAddress: {
              fullName: formData.fullName.trim(),
              phone: formData.phone.trim() || '+91 9876543210',
              addressLine1: formData.address.trim(),
              city: formData.city.trim(),
              state: formData.state.trim(),
              postalCode: formData.postalCode.trim(),
              country: 'India',
            },
            couponCode: appliedPromo?.code || undefined,
            notes: `Payment Method: ${paymentMethod.toUpperCase()}`,
          });

          if (res?.data?.order) {
            saved = {
              id: res.data.order.orderNumber,
              orderId: res.data.order.id,
              date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              items: [...items],
              subtotal,
              discount,
              total: res.data.order.totalAmount || grandTotal,
              shippingAddress: {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.postalCode}`
              },
              paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery',
            };
          }
        }
      } catch (err) {
        console.warn('Backend order call logged:', err.message);
      }

      if (!saved) {
        saved = addOrder({
          items: [...items],
          subtotal,
          discount,
          total: grandTotal,
          shippingAddress: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.postalCode}`
          },
          paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery',
        });
      }

      clearCart();
      setIsSubmitting(false);
      setCompletedOrder(saved);
      addToast('Order confirmed successfully.', 'success');
    };

    executeOrder();
  };

  // Render Order Confirmation View
  if (completedOrder) {
    return (
      <div className="order-confirmation-container">
        <div className="order-confirmation-card">
          <div className="confirmation-icon-circle">
            <CheckCircle size={44} className="check-icon" />
          </div>

          <h1 className="confirmation-title">Thank You for Your Order</h1>
          <p className="confirmation-subtitle">
            Your order has been received and is being prepared for shipment. A confirmation has been sent to <strong>{formData.email}</strong>.
          </p>

          <div className="order-summary-box">
            <div className="summary-line">
              <span>Order Number</span>
              <strong className="order-reference">{completedOrder.id}</strong>
            </div>
            <div className="summary-line">
              <span>Order Date</span>
              <span>{completedOrder.date}</span>
            </div>
            <div className="summary-line">
              <span>Payment Method</span>
              <span>{completedOrder.paymentMethod}</span>
            </div>
            <div className="summary-line">
              <span>Delivery Timeframe</span>
              <span>2 – 4 Business Days</span>
            </div>
            <div className="summary-line total">
              <span>Total Paid</span>
              <span className="total-amount">₹{completedOrder.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="order-items-preview">
            <h3 className="preview-heading">Items in Order</h3>
            <div className="preview-items-list">
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="preview-item-row">
                  <img src={item.image} alt={item.name} onError={(e) => { e.currentTarget.src = '/1.jpg'; }} />
                  <div className="preview-item-info">
                    <h4>{item.name}</h4>
                    <span>{item.selectedVolume || item.volume || '100 ML'} · Qty: {item.quantity}</span>
                  </div>
                  <span className="preview-item-price">₹{((item.price || 0) * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="confirmation-actions">
            <Link to="/profile" className="btn-secondary">
              <Package size={16} /> View in Order History
            </Link>
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-empty-container">
        <h2>Your Bag is Empty</h2>
        <p>Please select your fragrances before proceeding to checkout.</p>
        <Link to="/products" className="btn-primary">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-header">
        <Link to="/cart" className="back-link">
          <ArrowLeft size={16} /> Return to Bag
        </Link>
        <h1 className="checkout-title">Checkout</h1>
      </div>

      <div className="checkout-layout-grid">
        {/* Left Column: Form */}
        <div className="checkout-form-column">
          <form onSubmit={handlePlaceOrder} className="checkout-form">
            {/* 1. Contact Information */}
            <div className="checkout-card-section">
              <h2 className="section-title">1. Contact Information</h2>
              <div className="form-grid-two">
                <div className="input-group">
                  <label htmlFor="checkout-email">Email Address</label>
                  <input
                    id="checkout-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="checkout-phone">Phone Number</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="checkout-card-section">
              <h2 className="section-title">2. Delivery Address</h2>
              <div className="input-group">
                <label htmlFor="checkout-name">Full Name</label>
                <input
                  id="checkout-name"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="First and last name"
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="checkout-address">Street Address</label>
                <input
                  id="checkout-address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House/flat number, building, street"
                  required
                />
              </div>

              <div className="form-grid-three">
                <div className="input-group">
                  <label htmlFor="checkout-city">City</label>
                  <input
                    id="checkout-city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="checkout-state">State</label>
                  <input
                    id="checkout-state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="checkout-postal">PIN Code</label>
                  <input
                    id="checkout-postal"
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="PIN Code"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="checkout-card-section">
              <h2 className="section-title">3. Payment Method</h2>

              <div className="payment-options-selector">
                <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <CreditCard size={18} />
                  <span>Credit / Debit Card</span>
                </label>

                <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                  />
                  <Smartphone size={18} />
                  <span>UPI / QR</span>
                </label>

                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <Banknote size={18} />
                  <span>Cash on Delivery</span>
                </label>
              </div>

              {/* Card Inputs */}
              {paymentMethod === 'card' && (
                <div className="payment-method-fields">
                  <div className="input-group">
                    <label htmlFor="card-name">Name on Card</label>
                    <input
                      id="card-name"
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleChange}
                      placeholder="Name as printed on card"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="card-number">Card Number</label>
                    <input
                      id="card-number"
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      maxLength="19"
                      placeholder="•••• •••• •••• ••••"
                      required
                    />
                  </div>

                  <div className="form-grid-two">
                    <div className="input-group">
                      <label htmlFor="card-expiry">Expiry Date</label>
                      <input
                        id="card-expiry"
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
                      <label htmlFor="card-cvv">CVV</label>
                      <input
                        id="card-cvv"
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

              {/* UPI Inputs */}
              {paymentMethod === 'upi' && (
                <div className="payment-method-fields">
                  <div className="input-group">
                    <label htmlFor="upi-id">UPI ID / VPA</label>
                    <input
                      id="upi-id"
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleChange}
                      placeholder="e.g. mobile@upi or username@bank"
                      required
                    />
                  </div>
                  <span className="helper-note">Supports Google Pay, PhonePe, Paytm, BHIM, and bank UPI apps.</span>
                </div>
              )}

              {/* Cash on Delivery */}
              {paymentMethod === 'cod' && (
                <div className="payment-method-fields cod-box">
                  <p>You can pay via Cash or UPI QR upon delivery. Please ensure exact payment of <strong>₹{grandTotal.toLocaleString()}</strong> is ready upon courier arrival.</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn-place-order"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing Order...' : `Place Order • ₹${grandTotal.toLocaleString()}`}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary Recap */}
        <div className="checkout-summary-column">
          <div className="checkout-recap-card">
            <h3 className="recap-title">Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)})</h3>

            <div className="recap-items-list">
              {items.map((item) => {
                const itemVol = item.selectedVolume || item.volume || '100 ML';
                return (
                  <div key={`${item.id}-${itemVol}`} className="recap-item-row">
                    <div className="recap-thumb-wrap">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        onError={(e) => { e.currentTarget.src = '/1.jpg'; }}
                      />
                      <span className="recap-qty-badge">{item.quantity}</span>
                    </div>
                    <div className="recap-item-details">
                      <h4 className="recap-item-name">{item.name}</h4>
                      <span className="recap-item-size">{itemVol}</span>
                    </div>
                    <span className="recap-item-price">
                      ₹{((item.price || 0) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="recap-breakdown">
              <div className="recap-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="recap-row discount">
                  <span>Discount</span>
                  <span>−₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="recap-row">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? 'Complimentary' : `₹${shipping.toLocaleString()}`}
                </span>
              </div>

              <div className="recap-row subtle">
                <span>Taxes & Duties</span>
                <span>Included</span>
              </div>

              <hr className="recap-divider" />

              <div className="recap-row total">
                <span>Total</span>
                <span className="recap-grand-total">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
