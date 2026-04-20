import { Bell, Menu, User, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
  
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
      '/agents': 'Field Agents',
      '/notifications': 'System Notifications',
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
        <button style={{ position: 'relative', color: 'var(--text-muted)' }}>
          <Bell size={22} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '10px',
            height: '10px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid white'
          }}></span>
        </button>

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
