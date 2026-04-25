import { Bell, Menu, User, ChevronDown, X, MessageSquare, CheckCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { adminNotifService } from '../../services/api/adminSupport';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await adminNotifService.getAll(10);
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await adminNotifService.markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await adminNotifService.markRead(notif._id);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch {}
    }
    setDropdownOpen(false);
    if (notif.referenceType === 'SUPPORT_REQUEST') {
      navigate('/customer-support');
    }
  };
  
  // Map path to title
  const getPageTitle = (pathname) => {
    const titles = {
      '/': 'Dashboard Overview',
      '/customer-approvals': 'Customer Approvals',
      '/kyc-verification': 'KYC Verification',
      '/deposits': 'Deposit Management',
      '/plan-activations': 'Plan Fund Activations',
      '/investments': 'Active Investments',
      '/withdrawals': 'Withdrawal Requests',
      '/monthly-profit': 'Monthly Profit Schedular',
      '/branches': 'Branch Network',
      '/agents': 'Field Agents & Assignments',
      '/notifications': 'System Notifications',
      '/customer-support': 'Customer Support',
      '/reports': 'Financial Reports',
      '/audit-logs': 'System Audit Logs',
      '/settings': 'System Settings',
    };
    return titles[pathname] || 'Admin Portal';
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'white',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 900,
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
    }}>
      {/* Left side: Menu toggle & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <button 
          onClick={toggleSidebar}
          style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Menu size={24} />
        </button>
        
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
            {getPageTitle(location.pathname)}
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
            <span>NF Plantation</span>
            <span>/</span>
            <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Admin</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            style={{ position: 'relative', color: 'var(--text-muted)', padding: '8px', borderRadius: '10px', transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                minWidth: '18px', height: '18px', padding: '0 4px',
                backgroundColor: '#ef4444', borderRadius: '9px', border: '2px solid white',
                fontSize: '9px', fontWeight: '800', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {/* Notification Dropdown */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 12px)', right: 0,
              width: '360px', backgroundColor: 'white', borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9',
              zIndex: 1000, overflow: 'hidden'
            }}>
              {/* Dropdown Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: '700', backgroundColor: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '10px' }}>
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              {/* Notification Items */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Bell size={32} style={{ margin: '0 auto 10px', color: '#e2e8f0' }} />
                    <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>No notifications yet</p>
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n._id}
                    onClick={() => handleNotifClick(n)}
                    style={{
                      padding: '14px 20px', borderBottom: '1px solid #f8fafc',
                      cursor: 'pointer', backgroundColor: n.isRead ? 'white' : '#fffbeb',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = n.isRead ? 'white' : '#fffbeb'}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                      backgroundColor: n.type === 'SUPPORT' ? '#fef2f2' : '#eff6ff',
                      color: n.type === 'SUPPORT' ? '#ef4444' : '#3b82f6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <MessageSquare size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                        <p style={{ fontSize: '13px', fontWeight: n.isRead ? '600' : '800', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</p>
                        {!n.isRead && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0, marginTop: '4px' }} />}
                      </div>
                      <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.message}</p>
                      <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontWeight: '600' }}>
                        {new Date(n.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                <button
                  onClick={() => { navigate('/customer-support'); setDropdownOpen(false); }}
                  style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}
                >
                  View All Support Requests →
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)' }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>{adminUser.name || 'System Admin'}</div>
            <div style={{ 
              fontSize: '10px', 
              fontWeight: '800', 
              color: 'var(--primary)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px',
              marginTop: '2px'
            }}>
              {adminUser.role || 'Super Admin'}
            </div>
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#e2e8f0',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            border: '2px solid white',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}>
            <User size={20} />
          </div>
          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </header>
  );
};

export default Header;
