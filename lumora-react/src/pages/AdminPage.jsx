import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Users, 
  Package, 
  DollarSign, 
  RefreshCw, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  Laptop,
  Smartphone,
  ChevronRight,
  TrendingUp,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminApi } from '../api/admin';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('activity'); // 'activity', 'users', 'orders', 'security'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats State
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 65,
  });

  // Login Activities State
  const [activities, setActivities] = useState([]);
  const [activityStats, setActivityStats] = useState({
    totalAttempts: 0,
    successCount: 0,
    failedCount: 0,
    successRate: 100,
    todayAttempts: 0,
    recentFailedCount: 0,
  });
  const [activityFilter, setActivityFilter] = useState('ALL'); // 'ALL', 'SUCCESS', 'FAILED'
  const [searchQuery, setSearchQuery] = useState('');

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [togglingUserId, setTogglingUserId] = useState(null);

  // Orders State
  const [ordersList, setOrdersList] = useState([]);

  // Check Admin Authorization
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'MANAGER');

  const fetchData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch Dashboard Stats
      const [dashRes, actStatsRes, actListRes, usersRes, ordersRes] = await Promise.all([
        adminApi.getDashboardStats().catch(() => null),
        adminApi.getLoginActivityStats().catch(() => null),
        adminApi.getLoginActivities({
          status: activityFilter === 'ALL' ? undefined : activityFilter,
          search: searchQuery || undefined,
          limit: 30,
        }).catch(() => null),
        adminApi.getUsers({ limit: 50 }).catch(() => null),
        adminApi.getOrders({ limit: 30 }).catch(() => null),
      ]);

      if (dashRes?.data?.stats) {
        setStats(dashRes.data.stats);
      }
      if (actStatsRes?.data?.summary) {
        setActivityStats(actStatsRes.data.summary);
      }
      if (actListRes?.data?.items) {
        setActivities(actListRes.data.items);
      }
      if (usersRes?.data?.items) {
        setUsersList(usersRes.data.items);
      }
      if (ordersRes?.data?.items) {
        setOrdersList(ordersRes.data.items);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      addToast('Failed to sync admin telemetry: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAdmin, activityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleToggleUser = async (targetUser) => {
    if (targetUser.role === 'ADMIN') {
      addToast('Cannot modify master administrator account status.', 'warning');
      return;
    }
    const newStatus = !targetUser.isActive;
    setTogglingUserId(targetUser.id);
    try {
      await adminApi.toggleUserStatus(targetUser.id, newStatus);
      addToast(`User ${targetUser.name} ${newStatus ? 'activated' : 'suspended'}.`, 'success');
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isActive: newStatus } : u))
      );
    } catch (err) {
      addToast('Action failed: ' + err.message, 'error');
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      addToast(`Order #${orderId} marked as ${newStatus}.`, 'success');
      setOrdersList((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      addToast('Failed to update order status: ' + err.message, 'error');
    }
  };

  // Unauthorized View
  if (!isLoggedIn || !isAdmin) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: '#090d16',
        color: '#f8fafc'
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '36px',
          textAlign: 'center',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
        }}>
          <ShieldAlert size={56} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px' }}>
            Atelier Administration Restricted
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            Access to user login telemetry, real PostgreSQL audit records, and security controls requires an authorized administrator session.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link
              to="/login"
              style={{
                background: 'linear-gradient(135deg, #d4af37, #aa820a)',
                color: '#000',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Sign In as Administrator
            </Link>
            <Link
              to="/"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#e2e8f0',
                padding: '12px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070b14',
      color: '#e2e8f0',
      paddingBottom: '80px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Top Admin Navigation Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.25)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '16px 28px',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #d4af37, #926a10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 800,
              fontSize: '18px'
            }}>
              L
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  LUMORA Security & Admin Sanctum
                </h1>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  PostgreSQL Active
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                Real-Time User Login Activity & Cyber Defense System
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={fetchData}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
              {refreshing ? 'Syncing...' : 'Refresh Telemetry'}
            </button>
            <Link
              to="/products"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#fef08a',
                padding: '8px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              <ExternalLink size={14} /> View Store
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '32px auto 0', padding: '0 24px' }}>
        {/* Real-Time Metrics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
          marginBottom: '32px'
        }}>
          {/* Card 1: Total Login Activity */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>Total Login Events</span>
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '8px', borderRadius: '8px', color: '#60a5fa' }}>
                <Activity size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc' }}>
              {activityStats.totalAttempts}
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#34d399', fontWeight: 600 }}>{activityStats.successRate}% Success Rate</span>
              <span>• {activityStats.todayAttempts} today</span>
            </div>
          </div>

          {/* Card 2: Successful Logins */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>Authenticated Access</span>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '8px', color: '#34d399' }}>
                <CheckCircle size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399' }}>
              {activityStats.successCount}
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
              Verified Argon2id credentials matched
            </div>
          </div>

          {/* Card 3: Failed / Flagged Attempts */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>Blocked / Failed Attempts</span>
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '8px', borderRadius: '8px', color: '#f87171' }}>
                <ShieldAlert size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f87171' }}>
              {activityStats.failedCount}
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
              Cyber brute-force protection active
            </div>
          </div>

          {/* Card 4: Registered Users */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>Registered Users in DB</span>
              <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '8px', borderRadius: '8px', color: '#d4af37' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fef08a' }}>
              {usersList.length || stats.totalCustomers}
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
              Real customer & admin accounts in PostgreSQL
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '12px',
          marginBottom: '24px',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('activity')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'activity' ? 'linear-gradient(135deg, #d4af37, #926a10)' : 'transparent',
              color: activeTab === 'activity' ? '#000' : '#94a3b8',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Activity size={16} /> User Login Activity Tracker ({activities.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'users' ? 'linear-gradient(135deg, #d4af37, #926a10)' : 'transparent',
              color: activeTab === 'users' ? '#000' : '#94a3b8',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Users size={16} /> Registered Users ({usersList.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'orders' ? 'linear-gradient(135deg, #d4af37, #926a10)' : 'transparent',
              color: activeTab === 'orders' ? '#000' : '#94a3b8',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Package size={16} /> Customer Orders & Purchases ({ordersList.length})
          </button>

          <button
            onClick={() => setActiveTab('security')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'security' ? 'linear-gradient(135deg, #d4af37, #926a10)' : 'transparent',
              color: activeTab === 'security' ? '#000' : '#94a3b8',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <ShieldCheck size={16} /> Cyber Threat Protections
          </button>
        </div>

        {/* TAB 1: User Login Activity Tracker */}
        {activeTab === 'activity' && (
          <div>
            {/* Filters & Search Toolbar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}>
              {/* Filter Pills */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActivityFilter('ALL')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activityFilter === 'ALL' ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                    color: activityFilter === 'ALL' ? '#000' : '#cbd5e1',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  All Logs ({activityStats.totalAttempts})
                </button>
                <button
                  onClick={() => setActivityFilter('SUCCESS')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activityFilter === 'SUCCESS' ? '#34d399' : 'rgba(16, 185, 129, 0.1)',
                    color: activityFilter === 'SUCCESS' ? '#000' : '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Success Only ({activityStats.successCount})
                </button>
                <button
                  onClick={() => setActivityFilter('FAILED')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activityFilter === 'FAILED' ? '#f87171' : 'rgba(239, 68, 68, 0.1)',
                    color: activityFilter === 'FAILED' ? '#000' : '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}
                >
                  Failed / Suspicious ({activityStats.failedCount})
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', minWidth: '320px' }}>
                <div style={{
                  position: 'relative',
                  flex: 1
                }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="Search by email, IP address, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#f8fafc',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Filter
                </button>
              </form>
            </div>

            {/* Activities Table */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(30, 41, 59, 0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>User / Email</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Device & Browser</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>IP Address</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Timestamp</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Security Note / Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No login activity found matching current query.
                      </td>
                    </tr>
                  ) : (
                    activities.map((act) => {
                      const isSuccess = act.status === 'SUCCESS';
                      return (
                        <tr
                          key={act.id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'background 0.15s'
                          }}
                        >
                          {/* Status */}
                          <td style={{ padding: '14px 18px' }}>
                            {isSuccess ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 600
                              }}>
                                <CheckCircle size={13} /> SUCCESS
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 600
                              }}>
                                <AlertTriangle size={13} /> FAILED
                              </span>
                            )}
                          </td>

                          {/* User & Email */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: isSuccess ? 'rgba(212, 175, 55, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '12px',
                                color: isSuccess ? '#fef08a' : '#fca5a5'
                              }}>
                                {act.user?.name ? act.user.name[0].toUpperCase() : act.email[0].toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                                  {act.user?.name || 'Unregistered Attempt'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                  {act.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Device & Browser */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0' }}>
                              {act.device?.includes('Mobile') ? <Smartphone size={15} color="#60a5fa" /> : <Laptop size={15} color="#cbd5e1" />}
                              <span>{act.device || 'Desktop Browser'}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              {act.os || 'Windows/Linux/Mac'}
                            </div>
                          </td>

                          {/* IP Address */}
                          <td style={{ padding: '14px 18px', fontFamily: 'monospace', color: '#93c5fd' }}>
                            {act.ipAddress || '127.0.0.1 (Localhost)'}
                          </td>

                          {/* Timestamp */}
                          <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                            <div>{new Date(act.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {new Date(act.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </td>

                          {/* Reason / Failure detail */}
                          <td style={{ padding: '14px 18px' }}>
                            {isSuccess ? (
                              <span style={{ color: '#34d399', fontSize: '12px' }}>
                                {act.failureReason === 'INITIAL_REGISTRATION' ? '✨ Initial Account Registration' : '✓ Standard Verified Login'}
                              </span>
                            ) : (
                              <span style={{ color: '#f87171', fontSize: '12px', fontWeight: 500 }}>
                                ⚠ {act.failureReason || 'Invalid Credentials'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Registered Users Management */}
        {activeTab === 'users' && (
          <div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(30, 41, 59, 0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>User Full Name</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Registered Email</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Role</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Account Status</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Registered Date</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Security Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => {
                    const isMasterAdmin = u.role === 'ADMIN';
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#f8fafc' }}>
                          {u.name}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#cbd5e1' }}>
                          {u.email}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: u.role === 'ADMIN' ? 'rgba(212, 175, 55, 0.2)' : u.role === 'MANAGER' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            color: u.role === 'ADMIN' ? '#fef08a' : u.role === 'MANAGER' ? '#93c5fd' : '#cbd5e1'
                          }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {u.isActive ? (
                            <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <UserCheck size={14} /> Active
                            </span>
                          ) : (
                            <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <UserX size={14} /> Suspended
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#94a3b8' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          {!isMasterAdmin && (
                            <button
                              onClick={() => handleToggleUser(u)}
                              disabled={togglingUserId === u.id}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                background: u.isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: u.isActive ? '#f87171' : '#34d399',
                                border: u.isActive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              {togglingUserId === u.id ? 'Updating...' : u.isActive ? 'Suspend User' : 'Reactivate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Customer Orders & Purchases */}
        {activeTab === 'orders' && (
          <div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(30, 41, 59, 0.7)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Order ID</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Customer</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Total Amount</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Payment Status</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Fulfillment Status</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Placed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersList.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        No orders recorded yet. Real purchases will appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    ordersList.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#fef08a' }}>
                          {ord.orderNumber}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600, color: '#f8fafc' }}>{ord.user?.name || 'Customer'}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{ord.user?.email}</div>
                        </td>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: '#f8fafc' }}>
                          ₹{ord.totalAmount?.toLocaleString()}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: ord.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                            color: ord.paymentStatus === 'PAID' ? '#34d399' : '#fde047'
                          }}>
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <select
                            value={ord.orderStatus}
                            onChange={(e) => handleOrderStatusUpdate(ord.id, e.target.value)}
                            style={{
                              background: 'rgba(30, 41, 59, 0.9)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              color: '#f8fafc',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#94a3b8' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Cyber Defense & Security Shield */}
        {activeTab === 'security' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px'
          }}>
            {/* Protection Item 1 */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '10px', color: '#34d399' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Argon2id Password Hashing Engine</h3>
                  <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 600 }}>Active • GPU/ASIC Hardened</span>
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                Every user credential is encrypted with memory-hard Argon2id (winner of the international Password Hashing Competition), making offline dictionary & rainbow table attacks computationally infeasible.
              </p>
            </div>

            {/* Protection Item 2 */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '10px', borderRadius: '10px', color: '#60a5fa' }}>
                  <Lock size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Brute-Force & Account Lockout Shield</h3>
                  <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 600 }}>Active • 5 Attempt Max / 15m</span>
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                Repeated failed login attempts from any email or IP are automatically detected in PostgreSQL. Upon 5 failed attempts, access is locked for 15 minutes to defeat automated credential stuffing bots.
              </p>
            </div>

            {/* Protection Item 3 */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '10px', borderRadius: '10px', color: '#d4af37' }}>
                  <Database size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>SQL Injection Defense (Prisma ORM)</h3>
                  <span style={{ fontSize: '12px', color: '#fef08a', fontWeight: 600 }}>Active • 100% Parameterized</span>
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                All PostgreSQL database queries utilize prepared statements and strictly typed schemas, eliminating SQL injection vulnerabilities across all catalog, user, and transaction models.
              </p>
            </div>

            {/* Protection Item 4 */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '14px',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '10px', borderRadius: '10px', color: '#c084fc' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#f8fafc' }}>Token Rotation & Session Revocation</h3>
                  <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 600 }}>Active • Refresh Token Rotation</span>
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                JWT access tokens expire after 15 minutes. Refresh tokens are single-use rotated in the database. Suspended users immediately have all active refresh tokens revoked in PostgreSQL.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
