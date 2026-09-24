import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  User, 
  ShoppingBag, 
  Heart, 
  Package, 
  LogOut, 
  Sparkles,
  Globe,
  SlidersHorizontal,
  X,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const { totalWishlist } = useWishlist();
  const { user, isLoggedIn, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchModalOpen(false);
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(quickQuery.trim())}`);
      setSearchModalOpen(false);
    } else {
      navigate('/products');
      setSearchModalOpen(false);
    }
  };

  return (
    <>
      <header className={`airbnb-navbar ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="airbnb-nav-container">
          {/* Left: Brand Logo */}
          <Link to="/" className="airbnb-brand-block" aria-label="LUMORA Haute Parfumerie">
            <span className="airbnb-logo-icon">
              <img 
                src="https://cdn-icons-gif.flaticon.com/19001/19001681.gif" 
                alt="Lumora Logo" 
                className="logo-gif" 
              />
            </span>
            <span className="airbnb-brand-text">LUMORA</span>
          </Link>

          {/* Center: Iconic Airbnb Search Capsule Bar */}
          <div 
            className="airbnb-search-capsule"
            onClick={() => setSearchModalOpen(true)}
            role="button"
            tabIndex={0}
            title="Search perfumes, notes, and collections"
          >
            <button type="button" className="capsule-segment primary">
              <span>Any Scent Family</span>
            </button>
            <div className="capsule-divider"></div>
            <button type="button" className="capsule-segment secondary">
              <span>Any Season</span>
            </button>
            <div className="capsule-divider"></div>
            <button type="button" className="capsule-segment tertiary">
              <span className="light-text">Add notes & price</span>
            </button>
            <div className="capsule-search-btn">
              <Search size={15} strokeWidth={2.5} color="#fff" />
            </div>
          </div>

          {/* Right: Actions & User Pill Menu */}
          <div className="airbnb-nav-actions">
            {/* Mobile Search Button */}
            <button
              type="button"
              className="airbnb-mobile-search-btn"
              onClick={() => setSearchModalOpen(true)}
              aria-label="Search perfumes"
              title="Search perfumes"
            >
              <Search size={18} />
            </button>

            {isLoggedIn && (user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
              <Link
                to="/admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  color: '#fef08a',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
                title="Atelier Admin & User Login Activity Dashboard"
              >
                <ShieldCheck size={14} color="#d4af37" /> Admin Portal
              </Link>
            )}

            <Link to="/products" className="airbnb-curator-link">
              Explore 65 Scents
            </Link>

            {/* Cart Button */}
            <Link to="/cart" className="airbnb-cart-btn" title="Your Cart">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="airbnb-cart-badge">{totalItems}</span>
              )}
            </Link>

            {/* User Pill Button (Hamburger + Avatar) */}
            <div className="airbnb-user-pill-container" ref={menuRef}>
              <button
                type="button"
                className="airbnb-user-pill"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-label="User navigation menu"
              >
                <Menu size={16} className="pill-menu-icon" />
                <div className="pill-avatar-wrap">
                  {isLoggedIn && user ? (
                    <img src={user.avatar} alt={user.name} className="pill-avatar-img" />
                  ) : (
                    <User size={18} className="pill-user-fallback" />
                  )}
                </div>
              </button>

              {/* Floating Menu Popup */}
              {menuOpen && (
                <div className="airbnb-menu-dropdown">
                  {isLoggedIn && user ? (
                    <>
                      <div className="dropdown-section user-welcome">
                        <span className="user-greeting">Signed in as</span>
                        <strong className="user-name-label">{user.name}</strong>
                      </div>
                      <hr className="airbnb-dropdown-hr" />
                      {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                        <>
                          <Link to="/admin" className="dropdown-action-link bold" style={{ color: '#d4af37' }}>
                            <ShieldCheck size={16} color="#d4af37" /> Admin & Login Activity
                          </Link>
                          <hr className="airbnb-dropdown-hr" />
                        </>
                      )}
                      <Link to="/profile" className="dropdown-action-link bold">
                        <User size={16} /> My Account
                      </Link>
                      <Link to="/profile" className="dropdown-action-link">
                        <Package size={16} /> Order History ({user.orders?.length || 1})
                      </Link>
                      <Link to="/profile" className="dropdown-action-link">
                        <Heart size={16} /> Wishlists ({totalWishlist})
                      </Link>
                      <hr className="airbnb-dropdown-hr" />
                      <Link to="/products" className="dropdown-action-link">
                        Browse Fragrance Atelier
                      </Link>
                      <a href="#contact" className="dropdown-action-link">
                        Client Concierge & Help
                      </a>
                      <hr className="airbnb-dropdown-hr" />
                      <button
                        type="button"
                        className="dropdown-action-link logout-link"
                        onClick={logout}
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/signup" className="dropdown-action-link bold highlight">
                        Sign Up
                      </Link>
                      <Link to="/login" className="dropdown-action-link">
                        Log In
                      </Link>
                      <hr className="airbnb-dropdown-hr" />
                      <Link to="/products" className="dropdown-action-link">
                        Explore All 65 Fragrances
                      </Link>
                      <a href="#story" className="dropdown-action-link">
                        Our Atelier & Heritage
                      </a>
                      <a href="#contact" className="dropdown-action-link">
                        Help & Concierge
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Expanded Airbnb Search Modal Overlay */}
      {searchModalOpen && (
        <div className="airbnb-search-overlay" onClick={() => setSearchModalOpen(false)}>
          <div className="airbnb-search-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-search-top">
              <span className="search-modal-title">Search Fragrance Atelier</span>
              <button 
                type="button" 
                className="search-modal-close" 
                onClick={() => setSearchModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="search-modal-form">
              <div className="modal-input-field">
                <Search size={20} className="modal-search-svg" />
                <input
                  type="text"
                  placeholder="Search by scent name or note (e.g., Oud, Rose, Citrus, Vanilla)..."
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="search-quick-tags">
                <span className="tags-label">Trending Scents:</span>
                {['Ocean Breeze', 'Romantic Rose', 'Exotic Amber', 'Sandalwood', 'Oud'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="tag-pill"
                    onClick={() => {
                      setQuickQuery(tag);
                      navigate(`/products?search=${encodeURIComponent(tag)}`);
                      setSearchModalOpen(false);
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="modal-search-actions">
                <button
                  type="button"
                  className="btn-cancel-search"
                  onClick={() => setSearchModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-do-search">
                  <Search size={16} /> Search Fragrances
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
