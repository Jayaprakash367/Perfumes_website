import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  ShieldCheck, 
  Gift, 
  RotateCcw, 
  Gem, 
  ArrowRight, 
  ArrowUp, 
  Globe, 
  ChevronDown, 
  Check, 
  Leaf, 
  Crown 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const { addToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('India (INR ₹)');

  const currencies = [
    'India (INR ₹)',
    'United States (USD $)',
    'United Kingdom (GBP £)',
    'European Union (EUR €)',
    'United Arab Emirates (AED د.إ)'
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast('Please enter a valid email address', 'warning');
      return;
    }
    if (!agreed) {
      addToast('Please agree to receive emails from LUMORA', 'warning');
      return;
    }
    addToast('Welcome to The LUMORA Circle. Check your inbox for your 10% welcome privilege!', 'success');
    setNewsletterEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="lumora-footer-dark" id="contact">
      {/* 1. TOP BRAND TRUST PILLARS STRIP */}
      <div className="dark-pillars-strip-wrapper">
        <div className="dark-pillars-strip">
          {/* Pillar 1 */}
          <div className="dark-pillar-item">
            <div className="dark-pillar-icon-box">
              <Truck size={26} strokeWidth={1.4} className="dark-pillar-icon" />
            </div>
            <div className="dark-pillar-info">
              <h4 className="dark-pillar-title">Complimentary Express Shipping</h4>
              <p className="dark-pillar-sub">On all orders over ₹3,000</p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="dark-pillar-item">
            <div className="dark-pillar-icon-box">
              <ShieldCheck size={26} strokeWidth={1.4} className="dark-pillar-icon" />
            </div>
            <div className="dark-pillar-info">
              <h4 className="dark-pillar-title">Direct Maison Sourcing</h4>
              <p className="dark-pillar-sub">Authentic formulations from master perfumers</p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="dark-pillar-item">
            <div className="dark-pillar-icon-box">
              <Gift size={26} strokeWidth={1.4} className="dark-pillar-icon" />
            </div>
            <div className="dark-pillar-info">
              <h4 className="dark-pillar-title">Complimentary Samples</h4>
              <p className="dark-pillar-sub">With every order</p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="dark-pillar-item">
            <div className="dark-pillar-icon-box">
              <RotateCcw size={26} strokeWidth={1.4} className="dark-pillar-icon" />
            </div>
            <div className="dark-pillar-info">
              <h4 className="dark-pillar-title">30-Day Easy Returns</h4>
              <p className="dark-pillar-sub">Hassle-free experience</p>
            </div>
          </div>

          {/* Pillar 5 */}
          <div className="dark-pillar-item">
            <div className="dark-pillar-icon-box">
              <Gem size={26} strokeWidth={1.4} className="dark-pillar-icon" />
            </div>
            <div className="dark-pillar-info">
              <h4 className="dark-pillar-title">Exquisite Gift Wrapping</h4>
              <p className="dark-pillar-sub">Signature black & gold packaging</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="dark-footer-main-wrapper">
        <div className="dark-footer-main">
          {/* Col 1: Brand Atelier */}
          <div className="dark-footer-col brand-col">
            <div className="dark-brand-identity">
              <svg viewBox="0 0 24 24" className="dark-brand-star" aria-hidden="true">
                <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" fill="#cda861" />
              </svg>
              <h3 className="dark-brand-name">L U M O R A</h3>
              <p className="dark-brand-tagline">SCENTS FOR A BRIGHTER YOU</p>
            </div>

            <p className="dark-brand-story">
              More than fragrance, LUMORA is a feeling. We bring the world&apos;s finest scents to your everyday moments — timeless, authentic, and unforgettable.
            </p>

            <div className="dark-brand-signature">
              Live the Scent
            </div>

            <div className="dark-social-links" aria-label="Social media links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="dark-social-btn">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="dark-social-btn">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter (X)" className="dark-social-btn">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="dark-social-btn">
                <i className="fa-brands fa-youtube"></i>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="dark-social-btn">
                <i className="fa-brands fa-pinterest-p"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="dark-social-btn">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Col 2: Shop */}
          <div className="dark-footer-col nav-col">
            <h4 className="dark-col-heading">Shop</h4>
            <div className="dark-heading-line"></div>
            <ul className="dark-links-list">
              <li><Link to="/products">All Fragrances</Link></li>
              <li><Link to="/products?tag=new">New Arrivals</Link></li>
              <li><Link to="/products?sort=popular">Bestsellers</Link></li>
              <li><Link to="/products?category=Luxury Prestige">Exclusive Collections</Link></li>
              <li><Link to="/products?category=Gift Sets">Gift Sets</Link></li>
              <li><Link to="/products?category=Travel">Travel Sizes</Link></li>
              <li><Link to="/products?sale=true">Offers & Privileges</Link></li>
              <li><Link to="/products">Shop by Brand</Link></li>
            </ul>
          </div>

          {/* Col 3: Discover */}
          <div className="dark-footer-col nav-col">
            <h4 className="dark-col-heading">Discover</h4>
            <div className="dark-heading-line"></div>
            <ul className="dark-links-list">
              <li><a href="#about">Our Story</a></li>
              <li><a href="#art">The Art of Perfumery</a></li>
              <li><a href="#journal">Fragrance Journal</a></li>
              <li><a href="#sustainability">Sustainability</a></li>
              <li><a href="#ingredients">Ingredients & Sourcing</a></li>
              <li><a href="#stores">Store Locator</a></li>
              <li><a href="#circle">LUMORA Circle</a></li>
              <li><a href="#corporate">Corporate Gifting</a></li>
            </ul>
          </div>

          {/* Col 4: Customer Care */}
          <div className="dark-footer-col nav-col">
            <h4 className="dark-col-heading">Customer Care</h4>
            <div className="dark-heading-line"></div>
            <ul className="dark-links-list">
              <li><a href="#contact">Contact Us</a></li>
              <li><Link to="/cart">Track Your Order</Link></li>
              <li><a href="#shipping">Shipping Information</a></li>
              <li><a href="#returns">Returns & Exchanges</a></li>
              <li><a href="#faqs">FAQs</a></li>
              <li><a href="#advisor">Fragrance Advisor</a></li>
              <li><a href="#guide">Size Guide</a></li>
              <li><a href="#storage">Care & Storage</a></li>
            </ul>
          </div>

          {/* Col 5: Join The LUMORA Circle */}
          <div className="dark-footer-col circle-col">
            <div className="dark-newsletter-section">
              <h4 className="dark-col-heading">Join The LUMORA Circle</h4>
              <div className="dark-heading-line"></div>
              <p className="dark-newsletter-subtitle">
                Be the first to know about new releases, exclusive offers, and private events.
              </p>

              <form className="dark-newsletter-form" onSubmit={handleNewsletterSubmit}>
                <div className="dark-newsletter-input-box">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="dark-newsletter-input"
                    aria-label="Email address"
                    required
                  />
                  <button type="submit" className="dark-newsletter-btn" aria-label="Subscribe to newsletter">
                    <ArrowRight size={17} strokeWidth={2.2} />
                  </button>
                </div>

                <label className="dark-terms-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="dark-checkbox-native"
                  />
                  <span className={`dark-custom-checkbox ${agreed ? 'checked' : ''}`}>
                    {agreed && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="dark-terms-text">I agree to receive emails from LUMORA.</span>
                </label>
              </form>

              {/* 3 Circle Value Perks */}
              <div className="dark-circle-perks">
                <div className="dark-perk-item">
                  <Leaf size={22} strokeWidth={1.3} className="dark-perk-icon" />
                  <span className="dark-perk-label">Exclusive Previews</span>
                </div>
                <div className="dark-perk-item">
                  <Gift size={22} strokeWidth={1.3} className="dark-perk-icon" />
                  <span className="dark-perk-label">Members Only Offers</span>
                </div>
                <div className="dark-perk-item">
                  <Crown size={22} strokeWidth={1.3} className="dark-perk-icon" />
                  <span className="dark-perk-label">Early Access to Collections</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 6: Floating Signature Quote over Perfume Background */}
          <div className="dark-footer-col quote-col">
            <div className="dark-showcase-quote">
              <p className="dark-quote-text">
                &ldquo;A fragrance for<br />a more beautiful tomorrow.&rdquo;
              </p>
              <p className="dark-quote-author">&mdash; LUMORA</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM BAR (Payment Badges, Values, Region, Copyright, Scroll to Top) */}
      <div className="dark-footer-bottom-wrapper">
        <div className="dark-footer-bottom">
          {/* Payment Badges */}
          <div className="dark-payment-badges">
            <span className="dark-pay-chip visa" title="Visa">
              <span className="pay-text-visa">VISA</span>
            </span>
            <span className="dark-pay-chip mc" title="Mastercard">
              <span className="mc-circle mc-red"></span>
              <span className="mc-circle mc-orange"></span>
            </span>
            <span className="dark-pay-chip amex" title="American Express">
              <span className="pay-text-amex">AMEX</span>
            </span>
            <span className="dark-pay-chip paypal" title="PayPal">
              <span className="pay-text-paypal"><i>P</i><i>P</i></span>
            </span>
            <span className="dark-pay-chip upi" title="UPI">
              <span className="pay-text-upi">UPI</span>
            </span>
            <span className="dark-pay-chip apple" title="Apple Pay">
              <i className="fa-brands fa-apple"></i>
              <span>Pay</span>
            </span>
            <span className="dark-pay-chip gpay" title="Google Pay">
              <span className="pay-text-g">G</span>
              <span>Pay</span>
            </span>
          </div>

          {/* Central Values */}
          <div className="dark-brand-values">
            <span>AUTHENTIC</span>
            <span className="value-separator">|</span>
            <span>SUSTAINABLE</span>
            <span className="value-separator">|</span>
            <span>LUXURY</span>
            <span className="value-separator">|</span>
            <span>GLOBAL</span>
          </div>

          {/* Right Region, Copyright & Scroll to Top */}
          <div className="dark-bottom-right">
            <div className="dark-currency-picker-container">
              <button 
                type="button" 
                className="dark-currency-btn"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                aria-label="Select currency and region"
              >
                <Globe size={14} className="globe-icon" />
                <span>{selectedCurrency}</span>
                <ChevronDown size={13} className={`chevron-icon ${currencyOpen ? 'rotate' : ''}`} />
              </button>
              
              {currencyOpen && (
                <ul className="dark-currency-dropdown">
                  {currencies.map((curr) => (
                    <li 
                      key={curr} 
                      className={`currency-option ${selectedCurrency === curr ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCurrency(curr);
                        setCurrencyOpen(false);
                      }}
                    >
                      {curr}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <p className="dark-copyright-text">
              &copy; {new Date().getFullYear()} LUMORA. All rights reserved.
            </p>

            <button 
              type="button" 
              onClick={scrollToTop} 
              className="dark-scroll-top-btn" 
              aria-label="Scroll to top of page"
              title="Scroll to top"
            >
              <ArrowUp size={18} strokeWidth={2.4} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
