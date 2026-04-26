import { Bell, Menu, User, ChevronDown, X, MessageSquare, CheckCheck, Lock, Eye, EyeOff, Shield, LogOut, Key, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { adminNotifService } from '../../services/api/adminSupport';
import { authService } from '../../services/api/auth';
import { useAuth } from '../../contexts/AuthContext';

const PWD_KEY = 'nf_admin_pwd_changed_at';
const PWD_REMINDER_DAYS = 60; // 2 months

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Profile panel
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Password change modal
  const [pwdModal, setPwdModal] = useState(false);
  const [pwdStep, setPwdStep] = useState(1); // 1=enter new pwd, 2=enter OTP
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [otp, setOtp] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  // 2-month reminder
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    const last = localStorage.getItem(PWD_KEY);
    if (!last) {
      setShowReminder(true);
      return;
    }
    const daysSince = (Date.now() - parseInt(last, 10)) / (1000 * 60 * 60 * 24);
    if (daysSince >= PWD_REMINDER_DAYS) setShowReminder(true);
  }, []);

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

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
    setNotifOpen(false);
    if (notif.referenceType === 'SUPPORT_REQUEST') navigate('/customer-support');
  };

  // Password change handlers
  const openPwdModal = () => {
    setPwdModal(true);
    setProfileOpen(false);
    setPwdStep(1);
    setNewPwd(''); setConfirmPwd(''); setOtp('');
    setPwdError(''); setPwdSuccess(false);
  };

  const handleSendOtp = async () => {
    if (!newPwd || newPwd.length < 8) { setPwdError('Password must be at least 8 characters.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Passwords do not match.'); return; }
    setPwdLoading(true); setPwdError('');
    try {
      const res = await authService.sendAdminChangeOtp();
      if (res.success) { setPwdStep(2); }
      else setPwdError(res.message || 'Failed to send OTP. Please try again.');
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Could not send OTP. Check your connection.');
    } finally { setPwdLoading(false); }
  };

  const handleConfirmChange = async () => {
    if (!otp || otp.length !== 6) { setPwdError('Please enter the 6-digit OTP.'); return; }
    setPwdLoading(true); setPwdError('');
    try {
      const res = await authService.adminChangePasswordWithOtp({ otp, newPassword: newPwd });
      if (res.success) {
        setPwdSuccess(true);
        localStorage.setItem(PWD_KEY, Date.now().toString());
        setShowReminder(false);
        setTimeout(() => { setPwdModal(false); setPwdSuccess(false); }, 2500);
      } else {
        setPwdError(res.message || 'OTP verification failed.');
      }
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally { setPwdLoading(false); }
  };

  const getPageTitle = (pathname) => {
    const titles = {
      '/': 'Dashboard Overview',
      '/customers': 'Customer Management',
      '/customer-approvals': 'Customer Approvals',
      '/deposits': 'Deposit Management',
      '/plan-activations': 'Plan Fund Activations',
      '/investments': 'Active Investments',
      '/withdrawals': 'Withdrawal Requests',
      '/monthly-profit': 'Monthly Profit Schedular',
      '/branches': 'Branch Network',
      '/branch-admins': 'Branch Administrators',
      '/agents': 'Field Agents & Assignments',
      '/notifications': 'System Notifications',
      '/customer-support': 'Customer Support',
      '/reports': 'Financial Reports',
      '/audit-logs': 'System Audit Logs',
      '/settings': 'System Settings',
      '/roles-permissions': 'Roles & Permissions',
      '/investment-plans': 'Investment Plans',
      '/payout': 'Payout Management',
      '/website-settings': 'Website Settings',
      '/hero-management': 'Hero Management',
      '/events-management': 'Events & Media',
    };
    return titles[pathname] || 'Admin Portal';
  };

  const adminUser = user || JSON.parse(localStorage.getItem('admin_user') || '{}');
  const displayName = adminUser.name || 'System Admin';
  const displayRole = adminUser.role === 'ADMIN' ? 'Super Admin' : adminUser.role === 'BRANCH_ADMIN' ? 'Branch Admin' : (adminUser.role || 'Admin');
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      {/* ── 2-Month Password Reminder Banner ── */}
      {showReminder && (
        <div style={{
          backgroundColor: '#fffbeb', borderBottom: '1px solid #fcd34d',
          padding: '10px 32px', display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#92400e', flex: 1 }}>
            Security reminder: It has been over 2 months since your last password change. Please update your password to maintain account security.
          </p>
          <button
            onClick={openPwdModal}
            style={{ fontSize: '12px', fontWeight: '800', color: '#d97706', padding: '6px 14px', borderRadius: '8px', border: '1px solid #fcd34d', backgroundColor: 'white', cursor: 'pointer', flexShrink: 0 }}
          >
            Change Now
          </button>
          <button onClick={() => setShowReminder(false)} style={{ color: '#d97706', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      )}

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
        {/* Left: Menu toggle & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button onClick={toggleSidebar} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Menu size={24} />
          </button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>
              {getPageTitle(location.pathname)}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '4px', alignItems: 'center', marginTop: '2px' }}>
              <span>NF Plantation</span><span>/</span>
              <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Admin</span>
            </div>
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
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

            {notifOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                width: '360px', backgroundColor: 'white', borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9',
                zIndex: 1000, overflow: 'hidden'
              }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Notifications</span>
                    {unreadCount > 0 && <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: '700', backgroundColor: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '10px' }}>{unreadCount} New</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCheck size={13} /> Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <Bell size={32} style={{ margin: '0 auto 10px', color: '#e2e8f0' }} />
                      <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>No notifications yet</p>
                    </div>
                  ) : notifications.map(n => (
                    <div key={n._id} onClick={() => handleNotifClick(n)} style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', backgroundColor: n.isRead ? 'white' : '#fffbeb', display: 'flex', gap: '12px', alignItems: 'flex-start', transition: 'background 0.15s' }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = n.isRead ? 'white' : '#fffbeb'}
                    >
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, backgroundColor: n.type === 'SUPPORT' ? '#fef2f2' : '#eff6ff', color: n.type === 'SUPPORT' ? '#ef4444' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                          <p style={{ fontSize: '13px', fontWeight: n.isRead ? '600' : '800', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</p>
                          {!n.isRead && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0, marginTop: '4px' }} />}
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.message}</p>
                        <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px', fontWeight: '600' }}>{new Date(n.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                  <button onClick={() => { navigate('/customer-support'); setNotifOpen(false); }} style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)' }}>
                    View All Support Requests →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border)' }} />

          {/* Profile Button + Dropdown */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <button
              onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px 10px', borderRadius: '12px', transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>{displayName}</div>
                <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{displayRole}</div>
              </div>
              <div style={{
                width: '40px', height: '40px', backgroundColor: adminUser.role === 'BRANCH_ADMIN' ? '#fef3c7' : '#ecfdf5',
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: adminUser.role === 'BRANCH_ADMIN' ? '#d97706' : 'var(--primary)',
                border: '2px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                fontSize: '13px', fontWeight: '900'
              }}>
                {initials || <User size={18} />}
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>

            {profileOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                width: '300px', backgroundColor: 'white', borderRadius: '16px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9',
                zIndex: 1000, overflow: 'hidden'
              }}>
                {/* Profile Header */}
                <div style={{ padding: '20px', background: 'linear-gradient(135deg, #0a1f13 0%, #0d2b1a 100%)', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: 'rgba(16,185,129,0.2)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', color: '#10b981', flexShrink: 0 }}>
                    {initials || <User size={22} color="#10b981" />}
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: '800', fontSize: '15px' }}>{displayName}</p>
                    <p style={{ color: '#10b981', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>{displayRole}</p>
                    {adminUser.userId && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginTop: '4px' }}>ID: {adminUser.userId}</p>}
                  </div>
                </div>

                {/* Profile Details */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                  {[
                    { label: 'Email', value: adminUser.email || '—' },
                    { label: 'Phone', value: adminUser.phone || '—' },
                    { label: 'Branch', value: adminUser.branchId ? 'Assigned' : 'Head Office' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '1px solid #f8fafc' : 'none' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{item.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', maxWidth: '160px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ padding: '10px' }}>
                  <button
                    onClick={openPwdModal}
                    style={{
                      width: '100%', padding: '11px 16px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      fontSize: '14px', fontWeight: '700', color: '#1e293b',
                      transition: 'background 0.15s', textAlign: 'left'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Lock size={16} color="var(--primary)" /> Change Password
                    {showReminder && <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: '800', backgroundColor: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '20px' }}>Due</span>}
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); logout(); }}
                    style={{
                      width: '100%', padding: '11px 16px', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', gap: '12px',
                      fontSize: '14px', fontWeight: '700', color: '#ef4444',
                      transition: 'background 0.15s', textAlign: 'left'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Password Change Modal ── */}
      {pwdModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
            {/* Modal Header */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={20} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Change Admin Password</h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>OTP will be sent to info@nfplantation.com</p>
                </div>
              </div>
              <button onClick={() => setPwdModal(false)} style={{ color: '#94a3b8', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Step indicator */}
            <div style={{ padding: '16px 28px', backgroundColor: '#f8fafc', display: 'flex', gap: '8px', alignItems: 'center' }}>
              {[{ n: 1, label: 'New Password' }, { n: 2, label: 'Verify OTP' }].map((s, i) => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: pwdStep > s.n ? '#10b981' : pwdStep === s.n ? '#10b981' : '#e2e8f0',
                    color: pwdStep >= s.n ? 'white' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800'
                  }}>{pwdStep > s.n ? <CheckCircle size={14} /> : s.n}</div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: pwdStep >= s.n ? '#0f172a' : '#94a3b8' }}>{s.label}</span>
                  {i === 0 && <div style={{ flex: 1, height: '1px', backgroundColor: pwdStep > 1 ? '#10b981' : '#e2e8f0' }} />}
                </div>
              ))}
            </div>

            <div style={{ padding: '24px 28px' }}>
              {pwdSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={30} color="#10b981" />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Password Updated!</h4>
                  <p style={{ fontSize: '13px', color: '#64748b' }}>Your admin password has been changed successfully. Next reminder in 2 months.</p>
                </div>
              ) : (
                <>
                  {pwdError && (
                    <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', fontWeight: '700', color: '#dc2626', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <AlertTriangle size={15} /> {pwdError}
                    </div>
                  )}

                  {pwdStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                          <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                          <input
                            type={showPwd ? 'text' : 'password'}
                            value={newPwd}
                            onChange={e => setNewPwd(e.target.value)}
                            placeholder="Minimum 8 characters"
                            className="input-field"
                            style={{ paddingLeft: '44px', paddingRight: '44px' }}
                          />
                          <button type="button" onClick={() => setShowPwd(p => !p)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {newPwd.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                            {[1,2,3,4].map(i => (
                              <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', backgroundColor: newPwd.length >= i * 3 ? (newPwd.length >= 12 ? '#10b981' : '#f59e0b') : '#e2e8f0' }} />
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Confirm New Password</label>
                        <div style={{ position: 'relative' }}>
                          <Key size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                          <input
                            type="password"
                            value={confirmPwd}
                            onChange={e => setConfirmPwd(e.target.value)}
                            placeholder="Re-enter new password"
                            className="input-field"
                            style={{ paddingLeft: '44px' }}
                          />
                        </div>
                        {confirmPwd && newPwd !== confirmPwd && (
                          <p style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700', marginTop: '6px' }}>Passwords do not match</p>
                        )}
                      </div>
                      <div style={{ padding: '12px 14px', backgroundColor: '#f0fdf4', borderRadius: '10px', fontSize: '12px', color: '#166534', fontWeight: '600', display: 'flex', gap: '8px' }}>
                        <Shield size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                        An OTP will be sent to info@nfplantation.com to verify this change.
                      </div>
                      <button
                        onClick={handleSendOtp}
                        disabled={pwdLoading}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
                      >
                        {pwdLoading ? <><Loader2 size={16} className="animate-spin" /> Sending OTP...</> : 'Send OTP to Email →'}
                      </button>
                    </div>
                  )}

                  {pwdStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#166534' }}>OTP sent to info@nfplantation.com</p>
                        <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Enter the 6-digit code from the email. Valid for 10 minutes.</p>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>One-Time Password (OTP)</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit OTP"
                          className="input-field"
                          style={{ textAlign: 'center', fontSize: '24px', fontWeight: '900', letterSpacing: '8px' }}
                          maxLength={6}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => { setPwdStep(1); setPwdError(''); }} style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#f1f5f9', fontSize: '14px', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}>
                          ← Back
                        </button>
                        <button
                          onClick={handleConfirmChange}
                          disabled={pwdLoading || otp.length !== 6}
                          className="btn-primary"
                          style={{ flex: 2, justifyContent: 'center', opacity: otp.length !== 6 ? 0.6 : 1 }}
                        >
                          {pwdLoading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : 'Confirm Password Change'}
                        </button>
                      </div>
                      <button onClick={() => { setPwdStep(1); setPwdError(''); handleSendOtp(); }} style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textAlign: 'center' }}>
                        Didn't receive the code? Resend OTP
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
