import { useState } from 'react';
import { 
  Settings, Building2, Layout, Zap, Bell, Shield, 
  Save, X, Plus, Trash2, Edit3, Image, 
  Mail, Phone, Clock, MapPin, Globe, Loader2,
  Lock, Key, LifeBuoy, CheckCircle2, AlertTriangle, ExternalLink
} from 'lucide-react';
import { plansService } from '../services/api/adminPlans';
import { useEffect } from 'react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('company'); // 'company', 'content', 'plans', 'notifications', 'security'
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'plans') {
        loadPlans();
    }
  }, [activeTab]);

  const loadPlans = async () => {
    setPlansLoading(true);
    try {
        const response = await plansService.getAllPlans();
        if (response.success) {
            setPlans(response.data);
        }
    } catch (error) {
        console.error("Error loading plans:", error);
    } finally {
        setPlansLoading(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you sure you want to disable this plan?')) return;
    try {
        await plansService.deletePlan(id);
        loadPlans();
    } catch (error) {
        alert('Error disabling plan');
    }
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Settings updated successfully!');
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>System Configuration</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Manage core company parameters, website content, and global security policies.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="card" style={{ padding: '10px 16px', color: '#64748b', fontSize: '14px', fontWeight: '700' }}>Cancel Changes</button>
          <button onClick={handleSave} className="btn-primary" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save All Changes</>}
          </button>
        </div>
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
           ].map((tab) => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               style={{ 
                 width: '100%', 
                 padding: '12px 16px', 
                 borderRadius: '10px', 
                 display: 'flex', 
                 alignItems: 'center', 
                 gap: '12px',
                 fontSize: '14px', 
                 fontWeight: '800',
                 backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                 color: activeTab === tab.id ? 'white' : '#64748b',
                 transition: 'all 0.2s',
                 textAlign: 'left'
               }}
             >
               {tab.icon} {tab.label}
             </button>
           ))}
        </div>

        {/* Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           
           {activeTab === 'company' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                   <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Legal & Contact Identity</h3>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      {[
                        { label: 'Official Company Name', value: 'NF Plantation (Pvt) Ltd', icon: <Building2 size={16} /> },
                        { label: 'Registration Number', value: 'PV-10293847', icon: <FileText size={16} /> },
                        { label: 'Support Email', value: 'contact@nfplantation.lk', icon: <Mail size={16} /> },
                        { label: 'Head Office Phone', value: '+94 11 223 4455', icon: <Phone size={16} /> },
                        { label: 'General Working Hours', value: '09:00 AM - 05:00 PM (M-F)', icon: <Clock size={16} /> },
                        { label: 'Corporate Website', value: 'https://nfplantation.lk', icon: <Globe size={16} /> },
                      ].map((field, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                           <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>{field.icon} {field.label}</label>
                           <input type="text" value={field.value} className="input-field" readOnly />
                        </div>
                      ))}
                      <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                         <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> Physical Office Address</label>
                         <textarea className="input-field" style={{ height: '80px', paddingTop: '12px' }}>No 45, Flower Road, Colombo 03, Sri Lanka.</textarea>
                      </div>
                   </div>
                </div>
                
                <div className="card" style={{ border: '1px dashed var(--primary)30', backgroundColor: '#f0fdf4' }}>
                   <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <LifeBuoy size={24} color="var(--primary)" />
                      </div>
                      <div>
                         <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Identity Verification</h4>
                         <p style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>Changes to your legal entity name or registration number require corporate approval from the legal department.</p>
                      </div>
                   </div>
                </div>
             </div>
           )}

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

           {activeTab === 'plans' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
             </div>
           )}

           {activeTab === 'notifications' && (
             <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px' }}>System Template Gallery</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                   {[
                     { id: 'WELCOME', label: 'Welcome Email Template', icon: <Mail size={16} /> },
                     { id: 'OTP', label: 'SMS OTP Format', icon: <Bell size={16} /> },
                     { id: 'DEPOSIT', label: 'Deposit Confirmation PDF', icon: <FileText size={16} /> },
                     { id: 'ACTIVATION', label: 'Plan Activation Receipt', icon: <CheckCircle2 size={16} /> },
                   ].map((tmp, i) => (
                     <div key={i} className="card" style={{ padding: '20px', cursor: 'pointer', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                           <div style={{ color: 'var(--primary)' }}>{tmp.icon}</div>
                           <ExternalLink size={14} color="#cbd5e1" />
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{tmp.label}</h4>
                        <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Last modified: Apr 01, 2026</p>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'security' && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="card">
                   <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lock size={18} color="#ef4444" />
                      Global Access Policies
                   </h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {[
                        { label: 'Admin Session Expiry', value: '30 Minutes', desc: 'Auto logout after period of inactivity' },
                        { label: 'OTP Validation Life', value: '5 Minutes', desc: 'Duration for which mobile OTPs remain active' },
                        { label: 'Failed Login Threshold', value: '5 Attempts', desc: 'Account lock duration after repeated failures' },
                        { label: 'Password Rotation Policy', value: '90 Days', desc: 'Enforce password changes for all administrators' },
                      ].map((sec, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none', paddingBottom: i < 3 ? '16px' : '0' }}>
                           <div>
                              <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{sec.label}</h4>
                              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{sec.desc}</p>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{sec.value}</span>
                              <button style={{ padding: '6px', color: 'var(--primary)' }}><Edit3 size={16} /></button>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
                
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fff1f2', border: '1px solid #fecaca', display: 'flex', gap: '12px' }}>
                   <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                   <p style={{ fontSize: '12px', color: '#991b1b', fontWeight: '700' }}>
                     Sensitive security changes will invalidate all active sessions immediately and force an administrative re-authentication.
                   </p>
                </div>
             </div>
           )}

        </div>
      </div>

    </div>
  );
};

export default SettingsPage;
