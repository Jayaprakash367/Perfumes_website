import React, { createContext, useContext, useState, useEffect } from 'react';
import { promoCodes } from '../data/products';
import { useToast } from './ToastContext';

const CartContext = createContext();

const FREE_SHIPPING_THRESHOLD = 3000;
const SHIPPING_FEE = 199;

export function CartProvider({ children }) {
  const { addToast } = useToast();

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('lumora_cart');
      if (saved) return JSON.parse(saved);
      // Fallback check legacy cart
      const legacy = localStorage.getItem('cart');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return parsed.map(p => ({
          ...p,
          volume: p.volume || '100 ML',
          quantity: p.quantity || 1
        }));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
    return [];
  });

  const [appliedPromo, setAppliedPromo] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lumora_cart', JSON.stringify(items));
      // Also keep legacy cart in sync for any legacy scripts
      localStorage.setItem('cart', JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [items]);

  const calculateVolumePrice = (basePrice, volume) => {
    if (volume === '50 ML') return Math.round(basePrice * 0.7);
    if (volume === '200 ML') return Math.round(basePrice * 1.6);
    return basePrice;
  };

  const addToCart = (product, quantity = 1, volume = '100 ML') => {
    const unitPrice = calculateVolumePrice(product.price, volume);
    
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === product.id && item.volume === volume);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            subtitle: product.subtitle,
            image: product.image,
            category: product.category,
            basePrice: product.price,
            price: unitPrice,
            volume,
            quantity
          }
        ];
      }
    });

    addToast(`Added ${quantity} × ${product.name} (${volume}) to cart!`, 'success');
  };

  const updateQuantity = (id, volume, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id, volume);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id && item.volume === volume ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeFromCart = (id, volume) => {
    setItems(prev => {
      const target = prev.find(item => item.id === id && item.volume === volume);
      if (target) {
        addToast(`Removed ${target.name} from cart`, 'info');
      }
      return prev.filter(item => !(item.id === id && item.volume === volume));
    });
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
  };

  const applyPromo = (code) => {
    const trimmed = code.trim().toUpperCase();
    if (promoCodes[trimmed]) {
      setAppliedPromo({
        code: trimmed,
        ...promoCodes[trimmed]
      });
      addToast(`Promo code "${trimmed}" applied: ${promoCodes[trimmed].description}!`, 'success');
      return { success: true };
    } else {
      addToast(`Invalid promo code. Try LUMORA10 or FIRSTLUX`, 'warning');
      return { success: false, message: 'Invalid coupon code' };
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    addToast('Coupon removed', 'info');
  };

  // Computations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const discount = appliedPromo 
    ? Math.round((subtotal * appliedPromo.discountPercent) / 100) 
    : 0;

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || items.length === 0;
  const shipping = isFreeShipping ? 0 : SHIPPING_FEE;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const grandTotal = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        totalItems,
        discount,
        appliedPromo,
        applyPromo,
        removePromo,
        shipping,
        isFreeShipping,
        freeShippingRemaining,
        freeShippingProgress,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        grandTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
