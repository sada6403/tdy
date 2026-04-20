import { NavLink } from 'react-router-dom';
import { authService } from '../../services/api/auth';
import {
  LayoutDashboard, Users, ShieldCheck, Wallet, FileCheck, Landmark,
  ArrowUpCircle, BarChart3, Building2, UserCog, Bell, FileText,
  History, Settings, LogOut, ChevronLeft, TreeDeciduous, Shield, Monitor, Zap, Receipt, Globe, PlayCircle
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { title: 'Hero Management', icon: <Monitor size={20} />, path: '/hero-management' },
    { title: 'Website Settings', icon: <Globe size={20} />, path: '/website-settings' },
    { title: 'Events & Media', icon: <PlayCircle size={20} />, path: '/events-management' },
    { title: 'Customers', icon: <Users size={20} />, path: '/customers' },
    { title: 'Customer Approvals', icon: <Shield size={20} />, path: '/customer-approvals' },
    { title: 'Deposits', icon: <Wallet size={20} />, path: '/deposits' },
    { title: 'Plan Activations', icon: <FileCheck size={20} />, path: '/plan-activations' },
    { title: 'Investment Models', icon: <Zap size={20} />, path: '/investment-plans' },
    { title: 'Withdrawals', icon: <ArrowUpCircle size={20} />, path: '/withdrawals' },
    { title: 'Payout', icon: <History size={20} />, path: '/payout' },
    { title: 'Monthly Profit', icon: <BarChart3 size={20} />, path: '/monthly-profit' },
    { title: 'Branches', icon: <Building2 size={20} />, path: '/branches' },
    { title: 'Agents', icon: <UserCog size={20} />, path: '/agents' },
    { title: 'Notifications', icon: <Bell size={20} />, path: '/notifications' },
    { title: 'Expenses', icon: <Receipt size={20} />, path: '/expenses' },
    { title: 'Reports', icon: <FileText size={20} />, path: '/reports' },
    { title: 'Audit Logs', icon: <History size={20} />, path: '/audit-logs' },
    { title: 'Roles & Permissions', icon: <Shield size={20} />, path: '/roles-permissions' },
    { title: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

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
        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: 'var(--primary)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <TreeDeciduous size={22} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: 'white', fontWeight: '800', fontSize: '16px', letterSpacing: '0.5px', fontFamily: 'var(--font-display)' }}>NF PLANTATION</span>
          <span style={{ color: 'var(--primary)', fontSize: '10px', fontWeight: '700', letterSpacing: '1px' }}>ADMIN PANEL</span>
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
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
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
            <span>{item.title}</span>
          </NavLink>
        ))}
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
