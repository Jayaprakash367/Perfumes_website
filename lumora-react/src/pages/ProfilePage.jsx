import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  Calendar, 
  ShoppingBag, 
  Trash2, 
  Edit3,
  Clock,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout, updateProfile, orders } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'wishlist' | 'details'
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  if (!isLoggedIn || !user) {
    return (
      <div className="profile-guest-container">
        <div className="profile-guest-card">
          <div className="guest-icon-box">
            <User size={36} strokeWidth={1.5} />
          </div>
          <h2>Sign In to Your Account</h2>
          <p>Please sign in to view your orders, saved fragrances, and account settings.</p>
          <div className="guest-actions">
            <Link to="/login" className="btn-primary">Sign In</Link>
            <Link to="/signup" className="btn-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateProfile(editForm);
    setIsEditing(false);
  };

  const handleMoveToCart = (product) => {
    addToCart(product, 1, '100 ML');
    toggleWishlist(product);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="profile-page-container">
      {/* Account Overview Header */}
      <div className="profile-account-header">
        <div className="account-avatar-col">
          <div className="avatar-circle">
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </div>
        </div>

        <div className="account-info-col">
          <div className="name-role-row">
            <h1 className="account-name">{user.name}</h1>
            {isAdmin && (
              <span className="role-tag admin">Administrator</span>
            )}
          </div>
          <p className="account-email">{user.email}</p>
          <div className="account-meta-stats">
            <span>Member since {user.memberSince || '2026'}</span>
            <span>•</span>
            <span>{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</span>
            <span>•</span>
            <span>{wishlist.length} Wishlisted</span>
          </div>
        </div>

        <div className="account-actions-col">
          {isAdmin && (
            <Link to="/admin" className="btn-admin-portal">
              <ShieldCheck size={16} /> Admin Dashboard
            </Link>
          )}
          <button type="button" onClick={handleLogout} className="btn-signout">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs-strip">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Package size={16} /> Orders ({orders.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          <Heart size={16} /> Wishlist ({wishlist.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <Settings size={16} /> Account Details
        </button>
      </div>

      {/* Tab Panels */}
      <div className="profile-content-panel">
        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="orders-panel">
            {orders.length === 0 ? (
              <div className="empty-panel-card">
                <Package size={36} strokeWidth={1.5} className="empty-icon" />
                <h3>No Orders Yet</h3>
                <p>When you purchase fragrances, your order history and tracking will appear here.</p>
                <Link to="/products" className="btn-primary">Browse Fragrances</Link>
              </div>
            ) : (
              <div className="orders-stack">
                {orders.map((order) => (
                  <div key={order.id} className="order-history-card">
                    <div className="order-card-header">
                      <div className="order-id-date">
                        <span className="order-ref">Order #{order.id}</span>
                        <span className="order-date">{order.date}</span>
                      </div>
                      <div className="order-status-pill">
                        <Clock size={13} />
                        <span>{order.status || 'Confirmed'}</span>
                      </div>
                    </div>

                    <div className="order-card-items">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="order-item-line">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            onError={(e) => { e.currentTarget.src = '/1.jpg'; }}
                          />
                          <div className="order-item-desc">
                            <strong>{item.name}</strong>
                            <span>{item.volume || '100 ML'} · Qty: {item.quantity}</span>
                          </div>
                          <span className="order-item-price">₹{((item.price || 0) * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <div className="payment-note">Payment: {order.paymentMethod || 'Razorpay / Card / UPI'}</div>
                      <div className="total-note">
                        <span>Total:</span>
                        <strong>₹{(order.total || 0).toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="wishlist-panel">
            {wishlist.length === 0 ? (
              <div className="empty-panel-card">
                <Heart size={36} strokeWidth={1.5} className="empty-icon" />
                <h3>Your Wishlist is Empty</h3>
                <p>Save fragrances you are interested in by clicking the heart icon on any product.</p>
                <Link to="/products" className="btn-primary">Explore Fragrances</Link>
              </div>
            ) : (
              <div className="wishlist-items-grid">
                {wishlist.map((item) => (
                  <div key={item.id} className="wishlist-product-card">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="wishlist-thumb" 
                      onError={(e) => { e.currentTarget.src = '/1.jpg'; }}
                    />
                    <div className="wishlist-meta">
                      <span className="cat-label">{item.category}</span>
                      <h4 className="name-label">{item.name}</h4>
                      <p className="price-label">₹{(item.price || 0).toLocaleString()}</p>
                      <div className="wishlist-btns-row">
                        <button
                          type="button"
                          className="btn-move-cart"
                          onClick={() => handleMoveToCart(item)}
                        >
                          <ShoppingBag size={14} /> Move to Bag
                        </button>
                        <button
                          type="button"
                          className="btn-remove-wishlist"
                          onClick={() => toggleWishlist(item)}
                          title="Remove from wishlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Account Details */}
        {activeTab === 'details' && (
          <div className="account-details-panel">
            <div className="details-card">
              <div className="details-header-row">
                <h3>Personal Information</h3>
                {!isEditing && (
                  <button type="button" onClick={() => setIsEditing(true)} className="btn-edit-details">
                    <Edit3 size={15} /> Edit
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="details-display-grid">
                  <div className="field-block">
                    <span className="field-label">Full Name</span>
                    <span className="field-value">{user.name}</span>
                  </div>
                  <div className="field-block">
                    <span className="field-label">Email Address</span>
                    <span className="field-value">{user.email}</span>
                  </div>
                  <div className="field-block">
                    <span className="field-label">Phone Number</span>
                    <span className="field-value">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="field-block">
                    <span className="field-label">Role</span>
                    <span className="field-value">{user.role}</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="details-edit-form">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="form-actions-row">
                    <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" className="btn-save">
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
