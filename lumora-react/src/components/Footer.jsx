import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const { addToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      addToast('Please enter a valid email address', 'warning');
      return;
    }
    addToast('Welcome to the LUMORA Circle. Check your inbox for your 10% privilege code!', 'success');
    setNewsletterEmail('');
  };

  return (
    <footer className="lumora-footer" id="contact">
      {/* Brand Trust Pillars */}
      <div className="footer-pillars-strip">
        <div className="pillar-item">
          <Truck size={24} className="pillar-icon" />
          <div>
            <h4 className="pillar-title">Complimentary Express Shipping</h4>
            <p className="pillar-text">On luxury flacons over ₹3,000</p>
          </div>
        </div>

        <div className="pillar-item">
          <ShieldCheck size={24} className="pillar-icon" />
          <div>
            <h4 className="pillar-title">100% Authentic Haute Parfumerie</h4>
            <p className="pillar-text">Master perfumer botanical extracts</p>
          </div>
        </div>

        <div className="pillar-item">
          <RefreshCw size={24} className="pillar-icon" />
          <div>
            <h4 className="pillar-title">30-Day Privilege Returns</h4>
            <p className="pillar-text">Complimentary sample test vial included</p>
          </div>
        </div>

        <div className="pillar-item">
          <Award size={24} className="pillar-icon" />
          <div>
            <h4 className="pillar-title">Bespoke Gift Wrapping</h4>
            <p className="pillar-text">Signature black & gold embossing</p>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="footer-main">
        {/* Col 1: Brand & Atelier */}
        <div className="footer-col brand-col">
          <div className="footer-brand-header">
            <img
              src="https://cdn-icons-gif.flaticon.com/19001/19001681.gif"
              alt="LUMORA"
              className="footer-brand-icon"
            />
            <span className="footer-brand-title">LUMORA</span>
          </div>
          <p className="footer-story-text">
            Perfume is the art that makes memory speak. LUMORA creates transcendent, handcrafted olfactory experiences uniting rare botanicals, sustainably harvested resins, and timeless craftsmanship.
          </p>
          <div className="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="fa-brands fa-x-twitter"></i>
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <i className="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </div>

        {/* Col 2: The Collections */}
        <div className="footer-col">
          <h4 className="footer-heading">Collections</h4>
          <ul className="footer-links">
            <li><Link to="/products?category=Fresh Citrus">Fresh Citrus & Aquatic</Link></li>
            <li><Link to="/products?category=Floral Romance">Floral Romance & Rose</Link></li>
            <li><Link to="/products?category=Warm Spice">Warm Spices & Amber</Link></li>
            <li><Link to="/products?category=Woody Aromatic">Woody & Rare Vetiver</Link></li>
            <li><Link to="/products?category=Luxury Prestige">Haute Prestige Ouds</Link></li>
            <li><Link to="/products">Explore All 65 Fragrances</Link></li>
          </ul>
        </div>

        {/* Col 3: Client Concierge */}
        <div className="footer-col">
          <h4 className="footer-heading">Client Concierge</h4>
          <ul className="footer-links">
            <li><a href="#contact">Contact Fragrance Advisor</a></li>
            <li><Link to="/cart">Track My Flacon Order</Link></li>
            <li><a href="#shipping">Complimentary Delivery Terms</a></li>
            <li><a href="#returns">Exchange & 30-Day Guarantee</a></li>
            <li><a href="#faq">Fragrance Storage & Layering Guide</a></li>
            <li><a href="#stores">Boutique Locations</a></li>
          </ul>
        </div>

        {/* Col 4: Newsletter */}
        <div className="footer-col newsletter-col">
          <h4 className="footer-heading">The Lumora Circle</h4>
          <p className="newsletter-desc">
            Subscribe to receive private invitations to rare seasonal flacon harvests, private sample boxes, and early access.
          </p>
          <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit}>
            <div className="newsletter-input-group">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
          <span className="newsletter-note">
            Privilege code for 10% off your initial flacon will be emailed immediately.
          </span>
        </div>
      </div>

      {/* Payment Badges & Copyright */}
      <div className="footer-bottom-bar">
        <div className="payment-badges-row">
          <img src="https://cdn-icons-png.flaticon.com/128/349/349221.png" alt="Visa" className="pay-badge" />
          <img src="https://cdn-icons-png.flaticon.com/128/16174/16174534.png" alt="MasterCard" className="pay-badge" />
          <img src="https://cdn-icons-png.flaticon.com/128/174/174861.png" alt="PayPal" className="pay-badge" />
          <img src="https://cdn-icons-png.flaticon.com/128/349/349228.png" alt="American Express" className="pay-badge" />
          <img src="https://cdn-icons-png.flaticon.com/128/14034/14034951.png" alt="Visa Electron" className="pay-badge" />
          <img src="https://cdn-icons-png.flaticon.com/128/217/217445.png" alt="Maestro" className="pay-badge" />
        </div>

        <p className="copyright-text">
          &copy; {new Date().getFullYear()} LUMORA Haute Parfumerie. All rights reserved. Crafted with timeless precision.
        </p>
      </div>
    </footer>
  );
}
