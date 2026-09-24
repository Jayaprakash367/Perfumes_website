import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { authApi } from '../api/auth';
import { ordersApi } from '../api/orders';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { addToast } = useToast();

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('lumora_savedUser');
      if (savedUser) return JSON.parse(savedUser);
    } catch (e) {
      console.error('Failed to load user from localStorage', e);
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('lumora_token'));
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Restore authenticated session from backend on mount
  useEffect(() => {
    const token = localStorage.getItem('lumora_token');
    if (token) {
      authApi
        .me()
        .then((res) => {
          if (res?.data?.user) {
            const apiUser = res.data.user;
            const fullProfile = {
              id: apiUser.userId || apiUser.id,
              username: apiUser.name || 'Connoisseur',
              name: apiUser.name || 'Connoisseur',
              email: apiUser.email,
              role: apiUser.role,
              phone: apiUser.phone || '+91 9876543210',
              tier: apiUser.role === 'ADMIN' ? 'Atelier Administrator' : 'Connoisseur Gold',
              avatar: apiUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
              memberSince: '2026',
            };
            setUser(fullProfile);
            setIsLoggedIn(true);
            localStorage.setItem('lumora_savedUser', JSON.stringify(fullProfile));
          }
        })
        .catch(() => {
          // Token expired or invalid
          localStorage.removeItem('lumora_token');
          setIsLoggedIn(false);
        });
    }
  }, []);

  // Fetch orders from backend whenever logged in
  useEffect(() => {
    if (isLoggedIn) {
      setLoadingOrders(true);
      ordersApi
        .getOrders()
        .then((res) => {
          if (res?.data?.orders) {
            setOrders(
              res.data.orders.map((o) => ({
                id: o.orderNumber,
                orderId: o.id,
                date: new Date(o.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }),
                items: o.items.map((item) => ({
                  name: item.productName,
                  volume: item.variantSize,
                  quantity: item.quantity,
                  price: item.unitPrice,
                  image: item.imageUrl,
                })),
                total: o.totalAmount,
                status: o.orderStatus,
                paymentStatus: o.paymentStatus,
                paymentMethod: 'Razorpay / UPI / Card',
              }))
            );
          }
        })
        .catch(() => {
          // Fallback to local orders
          try {
            const savedOrders = localStorage.getItem('lumora_orders');
            if (savedOrders) setOrders(JSON.parse(savedOrders));
          } catch {}
        })
        .finally(() => setLoadingOrders(false));
    }
  }, [isLoggedIn]);

  const login = async (usernameOrEmail, password) => {
    const isEmail = usernameOrEmail.includes('@');
    const emailToUse = isEmail ? usernameOrEmail.trim() : `${usernameOrEmail.toLowerCase().trim()}@lumora.com`;

    try {
      const res = await authApi.login({
        email: emailToUse,
        password: password,
      });

      if (res?.data?.token) {
        localStorage.setItem('lumora_token', res.data.token);
        const u = res.data.user;
        const profile = {
          id: u.id,
          username: u.name,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone || '',
          tier: u.role === 'ADMIN' ? 'Atelier Administrator' : u.role === 'MANAGER' ? 'Atelier Manager' : 'Connoisseur Gold',
          avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          memberSince: new Date(u.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
        setUser(profile);
        setIsLoggedIn(true);
        localStorage.setItem('lumora_savedUser', JSON.stringify(profile));
        sessionStorage.setItem('isLoggedIn', 'true');
        addToast(`Welcome back to LUMORA, ${profile.name}!`, 'success');
        return profile;
      }
      throw new Error(res?.message || 'Authentication failed');
    } catch (err) {
      const errMsg = err.message || 'Invalid email or password.';
      addToast(errMsg, 'error');
      throw err;
    }
  };

  const signup = async (formData) => {
    try {
      const res = await authApi.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone?.trim() || undefined,
      });

      if (res?.data?.token) {
        localStorage.setItem('lumora_token', res.data.token);
        const u = res.data.user;
        const profile = {
          id: u.id,
          username: u.name,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone || '',
          tier: 'Lumora Member',
          avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          memberSince: new Date(u.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
        setUser(profile);
        setIsLoggedIn(true);
        localStorage.setItem('lumora_savedUser', JSON.stringify(profile));
        sessionStorage.setItem('isLoggedIn', 'true');
        addToast(`Account created! Welcome to House LUMORA, ${profile.name}!`, 'success');
        return profile;
      }
      throw new Error(res?.message || 'Registration failed');
    } catch (err) {
      const errMsg = err.message || 'Registration failed. Please check your details.';
      addToast(errMsg, 'error');
      throw err;
    }
  };

  const updateProfile = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      try {
        localStorage.setItem('lumora_savedUser', JSON.stringify(merged));
      } catch (e) {
        console.error(e);
      }
      return merged;
    });
    addToast('Profile updated successfully!', 'success');
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem('lumora_token');
    localStorage.removeItem('lumora_savedUser');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userProfile');
    setUser(null);
    setIsLoggedIn(false);
    addToast('You have been signed out.', 'info');
  };

  const addOrder = (orderData) => {
    const newOrder = {
      id: `LUM-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Processing',
      ...orderData,
    };
    setOrders((prev) => [newOrder, ...prev]);
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
        loadingOrders,
        addOrder,
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
