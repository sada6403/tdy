import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { authService } from '../../services/api/auth';
import { supportService } from '../../services/api/adminSupport';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Users, ShieldCheck, Wallet, FileCheck, Landmark,
  ArrowUpCircle, BarChart3, Building2, UserCog, Bell, FileText,
  History, Settings, LogOut, ChevronLeft, Shield, Monitor, Zap, Receipt, Globe, PlayCircle, ChevronDown, Headset
} from 'lucide-react';
// Routes accessible to Branch Admin
const BRANCH_ADMIN_PATHS = new Set(['/', '/customers', '/customer-approvals', '/deposits', '/plan-activations', '/withdrawals', '/monthly-profit', '/payout', '/agents', '/notifications', '/customer-support', '/reports']);

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isSuperAdmin, isBranchAdmin } = useAuth();
  const [openMenus, setOpenMenus] = useState({ 'Website Settings': true });
  const [supportUnread, setSupportUnread] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await supportService.getRequests({ status: 'NEW' });
        if (res.success) setSupportUnread(res.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleSubMenu = (title) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const allMenuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    {
      title: 'Website Settings',
      icon: <Globe size={20} />,
      path: '/website-settings',
      superAdminOnly: true,
      subItems: [
        { title: 'General Settings', path: '/website-settings' },
        { title: 'Hero Management', path: '/hero-management' },
        { title: 'Events & Media', path: '/events-management' },
      ]
    },
    { title: 'Customers', icon: <Users size={20} />, path: '/customers' },
    { title: 'Customer Approvals', icon: <Shield size={20} />, path: '/customer-approvals' },
    { title: 'Deposits', icon: <Wallet size={20} />, path: '/deposits' },
    { title: 'Plan Activations', icon: <FileCheck size={20} />, path: '/plan-activations' },
    { title: 'Investment Models', icon: <Zap size={20} />, path: '/investment-plans', superAdminOnly: true },
    { title: 'Withdrawals', icon: <ArrowUpCircle size={20} />, path: '/withdrawals' },
    { title: 'Payout', icon: <History size={20} />, path: '/payout' },
    { title: 'Monthly Profit', icon: <BarChart3 size={20} />, path: '/monthly-profit' },
    { title: 'Branches', icon: <Building2 size={20} />, path: '/branches', superAdminOnly: true },
    { title: 'Branch Admins', icon: <UserCog size={20} />, path: '/branch-admins', superAdminOnly: true },
    { title: 'Agents', icon: <UserCog size={20} />, path: '/agents' },
    { title: 'Notifications', icon: <Bell size={20} />, path: '/notifications' },
    { title: 'Customer Support', icon: <Headset size={20} />, path: '/customer-support', badge: supportUnread },
    { title: 'Expenses', icon: <Receipt size={20} />, path: '/expenses', superAdminOnly: true },
    { title: 'Reports', icon: <FileText size={20} />, path: '/reports' },
    { title: 'Audit Logs', icon: <History size={20} />, path: '/audit-logs', superAdminOnly: true },
    { title: 'Roles & Permissions', icon: <Shield size={20} />, path: '/roles-permissions', superAdminOnly: true },
    { title: 'Settings', icon: <Settings size={20} />, path: '/settings', superAdminOnly: true },
  ];

  // Branch admins see only their permitted routes
  const menuItems = isBranchAdmin
    ? allMenuItems.filter(item => !item.superAdminOnly && BRANCH_ADMIN_PATHS.has(item.path))
    : allMenuItems;

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error', err);
    }
    window.location.href = '/login';
  };

  return (
    <div style={{
      width: isOpen ? 'var(--sidebar-width)' : '0',
      backgroundColor: 'var(--sidebar-bg)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowX: 'hidden',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '10px 0 30px rgba(0,0,0,0.1)'
    }}>
      {/* Brand Section */}
      <div style={{
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        minWidth: 'var(--sidebar-width)'
      }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
          <img src="/logo.jpg" alt="NF Plantation" style={{ width: '36px', height: '36px', objectFit: 'cover' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: 'white', fontWeight: '800', fontSize: '16px', letterSpacing: '0.5px', fontFamily: 'var(--font-display)' }}>NF PLANTATION</span>
          <span style={{ color: isBranchAdmin ? '#f59e0b' : 'var(--primary)', fontSize: '10px', fontWeight: '700', letterSpacing: '1px' }}>
            {isBranchAdmin ? 'BRANCH ADMIN' : 'SUPER ADMIN'}
          </span>
        </div>
      </div>

      {/* Navigation section */}
      <nav className="sidebar-nav" style={{
        flex: 1,
        padding: '24px 16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: 'var(--sidebar-width)'
      }}>
        {menuItems.map((item, index) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isMenuOpen = openMenus[item.title];

          return (
            <div key={index}>
              {hasSubItems ? (
                <div
                  onClick={() => toggleSubMenu(item.title)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    color: 'var(--sidebar-text)',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    marginBottom: '2px',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                  <ChevronDown 
                    size={16} 
                    style={{ 
                      transition: 'transform 0.3s', 
                      transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      opacity: 0.5
                    }} 
                  />
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    color: isActive ? 'white' : 'var(--sidebar-text)',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    transition: 'all 0.2s ease',
                    marginBottom: '2px'
                  })}
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.title}</span>
                  {item.badge > 0 && (
                    <span style={{
                      minWidth: '20px', height: '20px', padding: '0 6px',
                      borderRadius: '10px', backgroundColor: '#ef4444', color: 'white',
                      fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{item.badge}</span>
                  )}
                </NavLink>
              )}

              {/* Sub Items Rendering */}
              {hasSubItems && isMenuOpen && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  marginLeft: '24px',
                  marginTop: '4px',
                  paddingLeft: '12px',
                  borderLeft: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {item.subItems.map((sub, subIdx) => (
                    <NavLink
                      key={subIdx}
                      to={sub.path}
                      end={sub.path === '/website-settings'}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        color: isActive ? 'var(--primary)' : 'var(--sidebar-text)',
                        backgroundColor: isActive ? 'rgba(37,168,94,0.1)' : 'transparent',
                        fontSize: '13px',
                        fontWeight: isActive ? '700' : '500',
                        transition: 'all 0.2s ease',
                      })}
                    >
                      {sub.title}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout section */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        minWidth: 'var(--sidebar-width)'
      }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            width: '100%',
            borderRadius: '12px',
            color: '#f87171',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: '600'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(248, 113, 113, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={20} />
          <span>Logout System</span>
        </button>
      </div>

      {/* Collapse Trigger - Mobile Style maybe? */}
      {/* (Removed for now to keep standard layout) */}
    </div>
  );
};

export default Sidebar;
