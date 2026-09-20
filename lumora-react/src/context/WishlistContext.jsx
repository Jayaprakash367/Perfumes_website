import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { addToast } = useToast();

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('lumora_wishlist');
      if (saved) return JSON.parse(saved);
      const legacy = localStorage.getItem('wishlist');
      if (legacy) return JSON.parse(legacy);
    } catch (e) {
      console.error("Failed to load wishlist", e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('lumora_wishlist', JSON.stringify(wishlist));
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist", e);
    }
  }, [wishlist]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        addToast(`Removed ${product.name} from your Wishlist`, 'info');
        return prev.filter(item => item.id !== product.id);
      } else {
        addToast(`Added ${product.name} to your Wishlist!`, 'success');
        return [...prev, {
          id: product.id,
          name: product.name,
          subtitle: product.subtitle,
          price: product.price,
          image: product.image,
          category: product.category,
          rating: product.rating
        }];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        totalWishlist: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
