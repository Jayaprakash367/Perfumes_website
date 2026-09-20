import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  Calendar, 
  CreditCard, 
  MapPin, 
  ShoppingBag, 
  Trash2, 
  Edit3,
  CheckCircle,
  Clock,
  Sparkles
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

  const [activeTab, setActiveTab] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  if (!isLoggedIn || !user) {
    return (
      <div className="profile-guest-view">
        <div className="guest-card">
          <User size={48} className="guest-icon" />
          <h2>Client Sanctuary</h2>
          <p>Please sign in to view your order history, saved flacons, and profile privileges.</p>
          <div className="guest-actions">
            <Link to="/login" className="btn-guest-login">Sign In</Link>
            <Link to="/signup" className="btn-guest-signup">Create Account</Link>
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

  return (
    <div className="profile-page">
      {/* Profile Header Banner */}
      <div className="profile-hero-card">
        <div className="profile-avatar-wrap">
          <img src={user.avatar} alt={user.name} className="profile-large-avatar" />
          <button 
            type="button" 
            className="btn-change-avatar"
            onClick={() => setIsEditing(true)}
            title="Update Profile"
          >
            <Edit3 size={14} />
          </button>
        </div>

        <div className="profile-meta-info">
          <div className="profile-name-tier">
            <h1 className="profile-display-name">{user.name}</h1>
            <span className="tier-badge-gold">
              <Sparkles size={14} /> {user.tier || 'Connoisseur Gold'}
            </span>
          </div>

          <p className="profile-username">@{user.username}</p>
          <p className="profile-bio-text">{user.bio || 'Connoisseur of fine olfactory compositions.'}</p>

          <div className="profile-quick-stats">
            <div className="stat-pill">
              <Package size={14} /> {orders.length} Orders
            </div>
            <div className="stat-pill">
              <Heart size={14} /> {wishlist.length} Wishlisted
            </div>
            <div className="stat-pill">
              <Calendar size={14} /> Member since {user.memberSince || '2024'}
            </div>
          </div>
        </div>

        <div className="profile-header-actions">
          <button 
            type="button" 
            className="btn-edit-profile-top"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 size={16} /> Edit Profile
          </button>
          <button 
            type="button" 
            className="btn-logout-top"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs-bar">
        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Package size={18} />
          <span>Flacon Order History ({orders.length})</span>
        </button>

        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          <Heart size={18} />
          <span>Saved Wishlist ({wishlist.length})</span>
        </button>

        <button
          type="button"
          className={`profile-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          <User size={18} />
          <span>Account & Privileges</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-tab-content">
        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="orders-tab-view">
            {orders.length === 0 ? (
              <div className="orders-empty-state">
                <Package size={40} />
                <h3>No Orders Placed Yet</h3>
                <p>Your journey into haute parfumerie awaits.</p>
                <Link to="/products" className="btn-explore-now">Discover Fragrances</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-history-card">
                    <div className="order-card-header">
                      <div className="order-id-date">
                        <span className="order-id-label">{order.id}</span>
                        <span className="order-date-label">• {order.date}</span>
                      </div>
                      <div className="order-status-badge">
                        <Clock size={14} />
                        <span>{order.status}</span>
                      </div>
                    </div>

                    <div className="order-items-grid">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-chip">
                          <img src={item.image} alt={item.name} />
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.volume} × {item.quantity}</span>
                          </div>
                          <span className="item-price-chip">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <div className="order-payment-meta">
                        <span>Payment: {order.paymentMethod}</span>
                      </div>
                      <div className="order-total-amount">
                        <span>Total Paid:</span>
                        <strong>₹{order.total}</strong>
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
          <div className="wishlist-tab-view">
            {wishlist.length === 0 ? (
              <div className="wishlist-empty-state">
                <Heart size={40} />
                <h3>Your Wishlist is Empty</h3>
                <p>Tap the heart icon on any flacon in our catalog to save it here for later.</p>
                <Link to="/products" className="btn-explore-now">Explore Fragrance Catalog</Link>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlist.map((item) => (
                  <div key={item.id} className="wishlist-item-card">
                    <img src={item.image} alt={item.name} className="wishlist-thumb" />
                    <div className="wishlist-item-info">
                      <span className="wishlist-cat">{item.category}</span>
                      <h4>{item.name}</h4>
                      <p className="wishlist-price">₹{item.price}</p>

                      <div className="wishlist-card-actions">
                        <button
                          type="button"
                          className="btn-wishlist-cart"
                          onClick={() => handleMoveToCart(item)}
                        >
                          <ShoppingBag size={15} /> Move to Cart
                        </button>
                        <button
                          type="button"
                          className="btn-wishlist-remove"
                          onClick={() => toggleWishlist(item)}
                          title="Remove from wishlist"
                        >
                          <Trash2 size={15} />
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
          <div className="details-tab-view">
            <div className="account-details-card">
              <h3>Personal Sanctuary Details</h3>
              <div className="details-grid-preview">
                <div className="detail-field">
                  <label>Full Name</label>
                  <p>{user.name}</p>
                </div>
                <div className="detail-field">
                  <label>Email Address</label>
                  <p>{user.email}</p>
                </div>
                <div className="detail-field">
                  <label>Contact Phone</label>
                  <p>{user.phone || '+91 98765 43210'}</p>
                </div>
                <div className="detail-field">
                  <label>Membership Status</label>
                  <p>{user.tier || 'Connoisseur Gold Member'}</p>
                </div>
                <div className="detail-field full">
                  <label>Olfactory Bio</label>
                  <p>{user.bio || 'Collector of fine niche perfumes & rare oriental ouds.'}</p>
                </div>
              </div>

              <button 
                type="button" 
                className="btn-trigger-edit"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={16} /> Edit Account Information
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Client Profile</h3>
            <form onSubmit={handleEditSubmit} className="edit-form">
              <div className="input-group">
                <label>Display Name</label>
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
                <label>Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Avatar Photo URL</label>
                <input
                  type="url"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>Fragrance Preferences Bio</label>
                <textarea
                  rows="3"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                />
              </div>

              <div className="modal-buttons-row">
                <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save-profile">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
