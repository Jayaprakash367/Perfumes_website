import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { addToast } = useToast();

  const [user, setUser] = useState(() => {
    try {
      const sessionProfile = sessionStorage.getItem('userProfile');
      if (sessionProfile) return JSON.parse(sessionProfile);

      const localProfile = localStorage.getItem('lumora_savedUser');
      if (localProfile) return JSON.parse(localProfile);

      const sessionName = sessionStorage.getItem('userName');
      if (sessionName) {
        return {
          username: sessionName,
          name: sessionName,
          email: `${sessionName.toLowerCase()}@lumora.com`,
          tier: 'Connoisseur Gold',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          memberSince: '2024'
        };
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return sessionStorage.getItem('isLoggedIn') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem('lumora_orders');
      if (savedOrders) return JSON.parse(savedOrders);
    } catch (e) {
      console.error("Failed to load orders", e);
    }
    return [
      {
        id: 'LUM-84920',
        date: '14 Sep 2026',
        items: [
          { name: 'Ocean Breeze', volume: '100 ML', quantity: 1, price: 1299, image: '/karly-jones-4i9ef6xU738-unsplash.jpg' },
          { name: 'Romantic Rose', volume: '100 ML', quantity: 1, price: 1499, image: '/birgith-roosipuu-nka_sIQpKEU-unsplash.jpg' }
        ],
        total: 2798,
        status: 'Delivered',
        paymentMethod: 'Credit Card (ending in 4242)'
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('lumora_orders', JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to save orders", e);
    }
  }, [orders]);

  const login = (username, password) => {
    const defaultProfile = {
      username: username || 'FragranceLover',
      name: username || 'Alexandre Dubois',
      email: `${(username || 'alexandre').toLowerCase()}@lumora.com`,
      phone: '+1 (555) 234-5678',
      tier: 'Connoisseur Gold',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      bio: 'Collector of artisanal niche perfumes & rare oriental ouds.',
      memberSince: 'March 2024'
    };

    setUser(defaultProfile);
    setIsLoggedIn(true);

    try {
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userName', defaultProfile.username);
      sessionStorage.setItem('userProfile', JSON.stringify(defaultProfile));
      localStorage.setItem('lumora_savedUser', JSON.stringify(defaultProfile));
    } catch (e) {
      console.error(e);
    }

    addToast(`Welcome back, ${defaultProfile.name}!`, 'success');
  };

  const signup = (formData) => {
    const newProfile = {
      username: formData.username || formData.email.split('@')[0],
      name: formData.name || formData.username || 'Fragrance Enthusiast',
      email: formData.email,
      phone: formData.phone || '+1 (555) 987-6543',
      tier: 'Lumora Member',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      bio: 'New explorer of luxury fragrances.',
      memberSince: 'September 2026'
    };

    setUser(newProfile);
    setIsLoggedIn(true);

    try {
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userName', newProfile.username);
      sessionStorage.setItem('userProfile', JSON.stringify(newProfile));
      localStorage.setItem('lumora_savedUser', JSON.stringify(newProfile));
    } catch (e) {
      console.error(e);
    }

    addToast(`Welcome to House LUMORA, ${newProfile.name}!`, 'success');
  };

  const updateProfile = (updatedFields) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedFields };
      try {
        sessionStorage.setItem('userProfile', JSON.stringify(merged));
        localStorage.setItem('lumora_savedUser', JSON.stringify(merged));
      } catch (e) {
        console.error(e);
      }
      return merged;
    });
    addToast('Profile updated successfully!', 'success');
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);

    try {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('userProfile');
      sessionStorage.removeItem('userName');
    } catch (e) {
      console.error(e);
    }

    addToast('You have been signed out.', 'info');
  };

  const addOrder = (orderData) => {
    const newOrder = {
      id: `LUM-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Processing',
      ...orderData
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        signup,
        updateProfile,
        logout,
        orders,
        addOrder
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
