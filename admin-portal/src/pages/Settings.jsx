import { useState, useEffect } from 'react';
import {
  Settings, Building2, Layout, Zap, Bell, Shield,
  Save, Trash2, Edit3, Image, FileText,
  Mail, Phone, Clock, MapPin, Globe, Loader2,
  Lock, Key, LifeBuoy, CheckCircle2, AlertTriangle, ExternalLink,
  Activity, ChevronLeft, ChevronRight, Check, X, ToggleLeft, ToggleRight
} from 'lucide-react';
import { plansService } from '../services/api/adminPlans';
import { auditService } from '../services/api/adminAudit';
import { getSettings, updateSettings } from '../services/api/adminSettings';

const ACTION_COLOR = {
    PROFIT_PAYOUT_EXECUTED: '#8b5cf6',
    INVESTMENT_APPROVED: '#10b981',
    INVESTMENT_REJECTED: '#ef4444',
    DEPOSIT_APPROVED: '#10b981',
    DEPOSIT_REJECTED: '#ef4444',
    WITHDRAWAL_APPROVED: '#10b981',
    WITHDRAWAL_REJECTED: '#ef4444',
    WITHDRAWAL_COMPLETED: '#2563eb',
    CUSTOMER_APPROVED: '#10b981',
    CUSTOMER_STATUS_UPDATED: '#f59e0b',
    DEFAULT: '#64748b'
};

const getActionColor = (action) => ACTION_COLOR[action] || ACTION_COLOR.DEFAULT;
const formatAction = (action) =>
    action?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown Action';

const DEFAULT_NOTIF = {
  welcomeEmail: true,
  depositApproval: true,
  depositRejection: true,
  withdrawalStatus: true,
  investmentActivation: true,
  profitPayout: true,
  otpSms: true,
  kycApproval: true,
};

const DEFAULT_SECURITY = [
  { key: 'sessionExpiry', label: 'Admin Session Expiry', value: '30', unit: 'Minutes', desc: 'Auto logout after period of inactivity' },
  { key: 'otpLife', label: 'OTP Validation Life', value: '5', unit: 'Minutes', desc: 'Duration for which mobile OTPs remain active' },
  { key: 'loginThreshold', label: 'Failed Login Threshold', value: '5', unit: 'Attempts', desc: 'Account lock duration after repeated failures' },
  { key: 'passwordRotation', label: 'Password Rotation Policy', value: '90', unit: 'Days', desc: 'Enforce password changes for all administrators' },
];

const loadFromStorage = (key, def) => {
  try { return JSON.parse(localStorage.getItem(key)) || def; } catch { return def; }
};

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Company profile state — pulled from website-settings API
  const [siteSettings, setSiteSettings] = useState(null);
  const [siteLoading, setSiteLoading] = useState(false);

  // Investment plans
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

  // Activity log
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityPage, setActivityPage] = useState(1);
  const [activityPagination, setActivityPagination] = useState({ total: 0, pages: 1 });

  // Notification preferences (localStorage-persisted)
  const [notifPrefs, setNotifPrefs] = useState(() => loadFromStorage('nf_notif_prefs', DEFAULT_NOTIF));

  // Security settings (localStorage-persisted)
  const [securitySettings, setSecuritySettings] = useState(() => loadFromStorage('nf_security_settings', DEFAULT_SECURITY));
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadSiteSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'plans') loadPlans();
    if (activeTab === 'activity') loadActivityLog(1);
  }, [activeTab]);

  const loadSiteSettings = async () => {
    setSiteLoading(true);
    try {
      const res = await getSettings();
      if (res.success && res.data) setSiteSettings(res.data);
    } catch {}
    finally { setSiteLoading(false); }
  };

  const loadActivityLog = async (page = 1) => {
    setActivityLoading(true);
    try {
      const res = await auditService.getAuditLogs({ page, limit: 20 });
      if (res.success) {
        setActivityLogs(res.data);
        setActivityPagination(res.pagination);
        setActivityPage(page);
      }
    } catch {}
    finally { setActivityLoading(false); }
  };

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
      const response = await plansService.getAllPlans();
      if (response.success) setPlans(response.data);
    } catch {}
    finally { setPlansLoading(false); }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to disable this plan?')) return;
    try { await plansService.deletePlan(id); loadPlans(); } catch { alert('Error disabling plan'); }
  };

  const handleContactChange = (field, value) => {
    setSiteSettings(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  };

  const handleBrandingChange = (field, value) => {
    setSiteSettings(prev => ({ ...prev, branding: { ...prev.branding, [field]: value } }));
  };

  const handleSaveCompany = async () => {
    if (!siteSettings) return;
    setSaving(true);
    try {
      const res = await updateSettings(siteSettings);
      setSaveMsg(res.success ? 'Company profile saved successfully.' : 'Save failed. Please try again.');
    } catch { setSaveMsg('Connection error. Could not save.'); }
    finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 4000);
    }
  };

  const toggleNotif = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    localStorage.setItem('nf_notif_prefs', JSON.stringify(updated));
  };

  const startEditSecurity = (item) => {
    setEditingKey(item.key);
    setEditValue(item.value);
  };

  const saveSecurity = () => {
    const updated = securitySettings.map(s => s.key === editingKey ? { ...s, value: editValue } : s);
    setSecuritySettings(updated);
    localStorage.setItem('nf_security_settings', JSON.stringify(updated));
    setEditingKey(null);
  };

  const Toggle = ({ on, onToggle }) => (
    <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      {on
        ? <ToggleRight size={32} color="#10b981" />
        : <ToggleLeft size={32} color="#cbd5e1" />}
    </button>
  );

  const notifItems = [
    { key: 'welcomeEmail', label: 'Welcome Email', desc: 'Sent to new customers when their account is approved' },
    { key: 'depositApproval', label: 'Deposit Approval Email', desc: 'Notify customer when deposit is approved' },
    { key: 'depositRejection', label: 'Deposit Rejection Email', desc: 'Notify customer when deposit is rejected' },
    { key: 'withdrawalStatus', label: 'Withdrawal Status Email', desc: 'Notify customer on every withdrawal status change' },
    { key: 'investmentActivation', label: 'Investment Activation Email', desc: 'Sent when an investment plan is activated' },
    { key: 'profitPayout', label: 'Profit Payout Notification', desc: 'In-app and email alert when monthly profit is credited' },
    { key: 'otpSms', label: 'OTP SMS Delivery', desc: 'Send one-time passwords via SMS for login and verification' },
    { key: 'kycApproval', label: 'KYC Approval Notification', desc: 'Notify customer when KYC documents are verified' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>System Configuration</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage core company parameters, website content, and global security policies.</p>
        </div>
        {activeTab === 'company' && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {saveMsg && (
              <span style={{ fontSize: '13px', fontWeight: '700', color: saveMsg.includes('successfully') ? '#059669' : '#dc2626' }}>{saveMsg}</span>
            )}
            <button className="card" onClick={loadSiteSettings} style={{ padding: '10px 16px', color: '#64748b', fontSize: '14px', fontWeight: '700' }}>Cancel Changes</button>
            <button onClick={handleSaveCompany} className="btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save All Changes</>}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', alignItems: 'start' }}>

        {/* Sidebar Navigation */}
        <div className="card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'company', label: 'Company Profile', icon: <Building2 size={18} /> },
            { id: 'content', label: 'Homepage Content', icon: <Layout size={18} /> },
            { id: 'plans', label: 'Investment Plans', icon: <Zap size={18} /> },
            { id: 'notifications', label: 'Email & Notification', icon: <Bell size={18} /> },
            { id: 'security', label: 'Security & Access', icon: <Shield size={18} /> },
            { id: 'activity', label: 'Activity Timeline', icon: <Activity size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '12px',
                fontSize: '14px', fontWeight: '800',
                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#64748b',
                transition: 'all 0.2s', textAlign: 'left'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ── COMPANY PROFILE ── */}
          {activeTab === 'company' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {siteLoading ? (
                <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                  <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                  <p style={{ color: '#94a3b8', fontWeight: '600' }}>Loading company data...</p>
                </div>
              ) : (
                <>
                  <div className="card">
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Legal & Contact Identity</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={16} /> Official Company Name</label>
                        <input
                          type="text"
                          className="input-field"
                          value={siteSettings?.branding?.companyName || ''}
                          onChange={e => handleBrandingChange('companyName', e.target.value)}
                          placeholder="NF Plantation (Pvt) Ltd"
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Registration Number</label>
                        <input type="text" className="input-field" defaultValue="PV 00303425" readOnly style={{ backgroundColor: '#f8fafc', color: '#94a3b8' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={16} /> Support Email</label>
                        <input
                          type="email"
                          className="input-field"
                          value={siteSettings?.contact?.email || ''}
                          onChange={e => handleContactChange('email', e.target.value)}
                          placeholder="info@nfplantation.com"
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={16} /> Head Office Phone</label>
                        <input
                          type="text"
                          className="input-field"
                          value={siteSettings?.contact?.phone || ''}
                          onChange={e => handleContactChange('phone', e.target.value)}
                          placeholder="024 4335099"
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> General Working Hours</label>
                        <input
                          type="text"
                          className="input-field"
                          value={siteSettings?.contact?.officeHours || ''}
                          onChange={e => handleContactChange('officeHours', e.target.value)}
                          placeholder="Mon–Fri: 9AM–5PM"
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={16} /> Corporate Website</label>
                        <input type="text" className="input-field" defaultValue="www.nfplantation.com" readOnly style={{ backgroundColor: '#f8fafc', color: '#94a3b8' }} />
                      </div>
                      <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Physical Office Address</label>
                        <textarea
                          className="input-field"
                          style={{ height: '80px', paddingTop: '12px' }}
                          value={siteSettings?.contact?.address || ''}
                          onChange={e => handleContactChange('address', e.target.value)}
                          placeholder="No: 150, Housing Scheme, Kannakipuram West, Kilinochchi"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ border: '1px dashed rgba(16,185,129,0.3)', backgroundColor: '#f0fdf4' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <LifeBuoy size={24} color="var(--primary)" />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Identity Verification</h4>
                        <p style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>Changes to your legal entity name or registration number require corporate approval from the legal department.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── HOMEPAGE CONTENT ── */}
          {activeTab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Homepage Hero Slides</h3>
                  <button className="badge badge-info" style={{ border: 'none', cursor: 'pointer' }}>+ Add Slide</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[1, 2].map(n => (
                    <div key={n} style={{ padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', gap: '20px' }}>
                      <div style={{ width: '160px', height: '90px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image size={32} color="#cbd5e1" />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input type="text" placeholder="Title for slide..." className="input-field" defaultValue={n === 1 ? 'Grow Your Wealth with Nature' : 'Secure Your Future Today'} />
                        <input type="text" placeholder="Subtitle..." className="input-field" defaultValue={n === 1 ? 'Sustainable plantation investments with fixed monthly returns.' : 'Fixed Deposit plans with state-of-the-art security.'} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#64748b' }}><Edit3 size={16} /></button>
                        <button style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── INVESTMENT PLANS ── */}
          {activeTab === 'plans' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Investment Plan Matrix</h3>
                <button className="btn-primary" style={{ height: '36px', fontSize: '12px' }}>+ New Plan Model</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {plansLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '12px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Syncing with Asset Engine...</p>
                  </div>
                ) : plans.length > 0 ? (
                  plans.map((plan, i) => (
                    <div key={i} style={{ padding: '16px', border: '1px solid #f1f5f9', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: plan.status === 'INACTIVE' ? 0.6 : 1 }}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: plan.status === 'ACTIVE' ? '#f0fdf4' : '#f1f5f9', color: plan.status === 'ACTIVE' ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Zap size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{plan.name || plan.title}</h4>
                          <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{plan.duration || plan.duration_months} Months • {plan.interestRate || plan.expected_return_percentage}% Monthly ROI</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>MIN DEPOSIT</p>
                          <p style={{ fontSize: '13px', fontWeight: '800' }}>LKR {(plan.minAmount || plan.min_investment_amount)?.toLocaleString()}</p>
                        </div>
                        <span className={`badge ${plan.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}>{plan.status}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button style={{ padding: '8px', color: '#64748b' }}><Edit3 size={18} /></button>
                          {plan.status === 'ACTIVE' && (
                            <button onClick={() => handleDeletePlan(plan._id)} style={{ padding: '8px', color: '#ef4444' }}><Trash2 size={18} /></button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', border: '2px dashed #f1f5f9', borderRadius: '16px' }}>
                    <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '700' }}>No active investment models found.</p>
                    <button className="btn-primary" style={{ marginTop: '12px', height: '32px', fontSize: '11px' }}>Create First Plan</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── EMAIL & NOTIFICATION ── */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Notification Delivery Preferences</h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px', fontWeight: '600' }}>Control which automated messages are sent to customers. Changes are saved immediately.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {notifItems.map((item, i) => (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '18px 4px',
                        borderBottom: i < notifItems.length - 1 ? '1px solid #f1f5f9' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                          backgroundColor: notifPrefs[item.key] ? '#ecfdf5' : '#f8fafc',
                          color: notifPrefs[item.key] ? '#059669' : '#94a3b8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {item.key.includes('Sms') || item.key === 'otpSms' ? <Key size={16} /> : <Mail size={16} />}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{item.label}</p>
                          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{item.desc}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: notifPrefs[item.key] ? '#059669' : '#94a3b8' }}>
                          {notifPrefs[item.key] ? 'Active' : 'Off'}
                        </span>
                        <Toggle on={notifPrefs[item.key]} onToggle={() => toggleNotif(item.key)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#10b981" /> Email Template Gallery
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Welcome Email Template', icon: <Mail size={16} />, key: 'WELCOME' },
                    { label: 'SMS OTP Format', icon: <Key size={16} />, key: 'OTP' },
                    { label: 'Deposit Confirmation', icon: <FileText size={16} />, key: 'DEPOSIT' },
                    { label: 'Plan Activation Receipt', icon: <CheckCircle2 size={16} />, key: 'ACTIVATION' },
                  ].map((tmp, i) => (
                    <div key={i} className="card" style={{ padding: '16px', cursor: 'pointer', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ color: 'var(--primary)' }}>{tmp.icon}</div>
                        <ExternalLink size={14} color="#cbd5e1" />
                      </div>
                      <h4 style={{ fontSize: '13px', fontWeight: '800' }}>{tmp.label}</h4>
                      <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Last modified: Apr 01, 2026</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SECURITY & ACCESS ── */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} color="#ef4444" />
                  Global Access Policies
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {securitySettings.map((sec, i) => (
                    <div
                      key={sec.key}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '18px 4px',
                        borderBottom: i < securitySettings.length - 1 ? '1px solid #f1f5f9' : 'none'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{sec.label}</h4>
                        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{sec.desc}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {editingKey === sec.key ? (
                          <>
                            <input
                              type="number"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              style={{
                                width: '70px', padding: '6px 10px', borderRadius: '8px',
                                border: '2px solid var(--primary)', fontSize: '14px', fontWeight: '800',
                                textAlign: 'center', outline: 'none'
                              }}
                              autoFocus
                              onKeyDown={e => { if (e.key === 'Enter') saveSecurity(); if (e.key === 'Escape') setEditingKey(null); }}
                            />
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{sec.unit}</span>
                            <button onClick={saveSecurity} style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '800', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={14} /> Save
                            </button>
                            <button onClick={() => setEditingKey(null)} style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#ef4444' }}>
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', minWidth: '80px', textAlign: 'right' }}>
                              {sec.value} {sec.unit}
                            </span>
                            <button onClick={() => startEditSecurity(sec)} style={{ padding: '6px', color: 'var(--primary)', borderRadius: '8px' }}>
                              <Edit3 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fff1f2', border: '1px solid #fecaca', display: 'flex', gap: '12px' }}>
                <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '12px', color: '#991b1b', fontWeight: '700', lineHeight: 1.6 }}>
                  Sensitive security changes will invalidate all active sessions immediately and force an administrative re-authentication.
                </p>
              </div>
            </div>
          )}

          {/* ── ACTIVITY TIMELINE ── */}
          {activeTab === 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="var(--primary)" /> Admin Activity Timeline
                  </h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', fontWeight: '600' }}>Auto-recorded system events — read-only audit trail</p>
                </div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#f1f5f9', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                  {activityPagination.total} Events
                </span>
              </div>

              {activityLoading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
                  <p style={{ color: '#94a3b8', fontWeight: '600', fontSize: '13px' }}>Loading activity log...</p>
                </div>
              ) : activityLogs.length === 0 ? (
                <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                  <Activity size={36} style={{ color: '#e2e8f0', margin: '0 auto 12px' }} />
                  <p style={{ color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>No activity recorded yet.</p>
                </div>
              ) : (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 0' }}>
                    {activityLogs.map((log, i) => {
                      const color = getActionColor(log.action);
                      const ts = new Date(log.createdAt);
                      const dateStr = ts.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                      const timeStr = ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      const actor = log.userId?.name || log.userId?.userId || 'System';
                      return (
                        <div key={log._id} style={{ display: 'flex', gap: '0', padding: '0 24px', borderBottom: i < activityLogs.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px', flexShrink: 0, paddingTop: '20px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, border: '2px solid white', boxShadow: `0 0 0 2px ${color}30`, flexShrink: 0, zIndex: 1 }} />
                            {i < activityLogs.length - 1 && <div style={{ width: '1px', flex: 1, backgroundColor: '#f1f5f9', marginTop: '4px' }} />}
                          </div>
                          <div style={{ flex: 1, padding: '16px 0 16px 16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '12px', fontWeight: '800', padding: '3px 10px', borderRadius: '20px', backgroundColor: `${color}15`, color }}>
                                    {formatAction(log.action)}
                                  </span>
                                  {log.severity && log.severity !== 'INFO' && (
                                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '20px', backgroundColor: log.severity === 'CRITICAL' ? '#fee2e2' : '#fef3c7', color: log.severity === 'CRITICAL' ? '#dc2626' : '#d97706' }}>
                                      {log.severity}
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                                  {log.target && <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Target: <span style={{ color: '#1e293b' }}>{log.target}</span></span>}
                                  {log.description && <span style={{ fontSize: '12px', color: '#64748b' }}>{log.description}</span>}
                                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>By: <span style={{ color: '#475569' }}>{actor}</span></span>
                                </div>
                                {log.ipAddress && log.ipAddress !== 'SYSTEM' && (
                                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>IP: {log.ipAddress}</span>
                                )}
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>{dateStr}</p>
                                <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{timeStr}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activityPagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
                  <button onClick={() => loadActivityLog(activityPage - 1)} disabled={activityPage <= 1} className="card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', opacity: activityPage <= 1 ? 0.4 : 1 }}>
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Page {activityPage} of {activityPagination.pages}</span>
                  <button onClick={() => loadActivityLog(activityPage + 1)} disabled={activityPage >= activityPagination.pages} className="card" style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', opacity: activityPage >= activityPagination.pages ? 0.4 : 1 }}>
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
