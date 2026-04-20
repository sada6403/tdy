import { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, UserCheck, Users, 
  Eye, Edit3, CheckCircle2, Lock, Unlock, 
  ChevronRight, Info, AlertTriangle, HelpCircle,
  Building2, Wallet, Zap, FileText, Settings, History
} from 'lucide-react';

const RolesPermissions = () => {
  const [activeRole, setActiveRole] = useState('Main Admin');

  const roles = [
    { title: 'Main Admin', level: 'Level 10 (Full Access)', users: 2, icon: <ShieldCheck size={28} /> },
    { title: 'Branch Admin', level: 'Level 7 (Branch Control)', users: 12, icon: <Building2 size={28} /> },
    { title: 'Manager', level: 'Level 5 (Operational)', users: 8, icon: <UserCheck size={28} /> },
    { title: 'Agent', level: 'Level 2 (Support Only)', users: 45, icon: <Users size={28} /> },
  ];

  const permissions = [
    { category: 'Customer Management', action: 'Approve Registrations', roles: { 'Main Admin': 'Full', 'Branch Admin': 'Limited', 'Manager': 'View Only', 'Agent': 'Restricted' } },
    { category: 'Financial Control', action: 'Approve Deposits', roles: { 'Main Admin': 'Full', 'Branch Admin': 'Limited', 'Manager': 'View Only', 'Agent': 'Restricted' } },
    { category: 'Financial Control', action: 'Plan Activations', roles: { 'Main Admin': 'Full', 'Branch Admin': 'Limited', 'Manager': 'View Only', 'Agent': 'Restricted' } },
    { category: 'Financial Control', action: 'Approve Withdrawals', roles: { 'Main Admin': 'Full', 'Branch Admin': 'Restricted', 'Manager': 'View Only', 'Agent': 'Restricted' } },
    { category: 'Finance Compliance', action: 'Payout Completion', roles: { 'Main Admin': 'Full', 'Branch Admin': 'Restricted', 'Manager': 'Restricted', 'Agent': 'Restricted' } },
    { category: 'Operations', action: 'Branch Management', roles: { 'Main Admin': 'Full', 'Branch Admin': 'View Only', 'Manager': 'View Only', 'Agent': 'Restricted' } },
    { category: 'Analytical Tools', action: 'View Reports', roles: { 'Main Admin': 'Full', 'Branch Admin': 'Branch Only', 'Manager': 'Full', 'Agent': 'Restricted' } },
    { category: 'Security Audit', action: 'View Audit Logs', roles: { 'Main Admin': 'Full', 'Branch Admin': 'Restricted', 'Manager': 'Full', 'Agent': 'Restricted' } },
    { category: 'System Configuration', action: 'System Settings', roles: { 'Main Admin': 'Full', 'Branch Admin': 'Restricted', 'Manager': 'Restricted', 'Agent': 'Restricted' } },
  ];

  const getPermissionLabel = (val) => {
    switch (val) {
      case 'Full': return { color: '#059669', bg: '#ecfdf5', icon: <Unlock size={12} /> };
      case 'Limited': return { color: '#2563eb', bg: '#eff6ff', icon: <ShieldCheck size={12} /> };
      case 'Branch Only': return { color: '#8b5cf6', bg: '#f5f3ff', icon: <Building2 size={12} /> };
      case 'View Only': return { color: '#4b5563', bg: '#f3f4f6', icon: <Eye size={12} /> };
      case 'Restricted': return { color: '#ef4444', bg: '#fef2f2', icon: <Lock size={12} /> };
      default: return { color: '#9ca3af', bg: '#f9fafb', icon: <Info size={12} /> };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Access Control & RBAC</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Establish a bank-grade Role-Based Access Control (RBAC) matrix for administrative actions.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
            <History size={18} /> Access Logs
          </button>
          <button className="btn-primary">
            Update Security Matrix
          </button>
        </div>
      </div>

      {/* Roles Selection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
         {roles.map((role, i) => (
           <button 
             key={i} 
             onClick={() => setActiveRole(role.title)}
             className="card" 
             style={{ 
               padding: '24px', 
               textAlign: 'left', 
               cursor: 'pointer',
               border: activeRole === role.title ? '2px solid var(--primary)' : '1px solid var(--border)',
               backgroundColor: activeRole === role.title ? '#ecfdf5' : 'white',
               transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
               transform: activeRole === role.title ? 'translateY(-4px)' : 'none'
             }}
           >
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', backgroundColor: activeRole === role.title ? 'var(--primary)' : '#f1f5f9', color: activeRole === role.title ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', transition: 'all 0.3s' }}>
                {role.icon}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '4px' }}>{role.title}</h3>
              <p style={{ fontSize: '11px', fontWeight: '800', color: activeRole === role.title ? 'var(--primary)' : '#94a3b8', textTransform: 'uppercase' }}>{role.level}</p>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{role.users} Active Users</span>
                 {activeRole === role.title && <CheckCircle2 size={18} color="var(--primary)" />}
              </div>
           </button>
         ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
        
        {/* Permission Matrix Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
           <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Permissions Matrix: {activeRole}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                 {['Full', 'Limited', 'View', 'Restricted'].map(l => (
                   <span key={l} style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>{l}</span>
                 ))}
              </div>
           </div>
           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                 <tr>
                    <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>MODULE CATEGORY</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>ACTION TYPE</th>
                    <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>LEVEL</th>
                    <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>CONSENT</th>
                 </tr>
              </thead>
              <tbody>
                 {permissions.map((perm, i) => {
                    const level = getPermissionLabel(perm.roles[activeRole]);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                         <td style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>{perm.category}</td>
                         <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{perm.action}</td>
                         <td style={{ padding: '16px', textAlign: 'center' }}>
                            <span style={{ 
                               padding: '4px 12px', 
                               borderRadius: '30px', 
                               fontSize: '11px', 
                               fontWeight: '800', 
                               backgroundColor: level.bg, 
                               color: level.color,
                               display: 'inline-flex',
                               alignItems: 'center',
                               gap: '6px'
                            }}>
                               {level.icon} {perm.roles[activeRole]}
                            </span>
                         </td>
                         <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <input 
                               type="checkbox" 
                               checked={perm.roles[activeRole] !== 'Restricted'} 
                               readOnly 
                               style={{ accentColor: 'var(--primary)', cursor: 'not-allowed' }} 
                            />
                         </td>
                      </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>

        {/* Access Rule Definitions Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>
           <div className="card" style={{ border: '1px solid var(--primary)30' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Info size={20} color="var(--primary)" />
                 Access Rule Protocol
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {[
                   { title: 'Full Access', desc: 'Can View, Edit, Approve, and override system configurations.', color: '#059669' },
                   { title: 'Limited / Branch', desc: 'Can only approve actions for customers within their assigned branch.', color: '#2563eb' },
                   { title: 'View Only', desc: 'Can see detail views and download reports, but all Action buttons are disabled.', color: '#4b5563' },
                   { title: 'Restricted', desc: 'Redirects to "Unauthorized" page if access is attempted. Actions are hidden.', color: '#ef4444' },
                 ].map((rule, i) => (
                   <div key={i} style={{ borderLeft: `3px solid ${rule.color}`, paddingLeft: '12px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '800', color: rule.color }}>{rule.title}</h4>
                      <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: '600' }}>{rule.desc}</p>
                   </div>
                 ))}
              </div>
           </div>

           <div className="card" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <ShieldAlert size={24} color="#ea580c" />
                 <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#9a3412' }}>Agent Restrictions</h4>
                    <p style={{ fontSize: '11px', color: '#c2410c', fontWeight: '600', marginTop: '4px' }}>
                       Agents are strictly forbidden from approving any financial movement (Deposits, Payouts, Plans) regardless of branch location.
                    </p>
                 </div>
              </div>
           </div>

           <div className="card" style={{ backgroundColor: '#f8fafc' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '12px' }}>Audit Verification</h3>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', lineHeight: 1.5 }}>
                 Every permission change is cryptographically signed by the implementing Main Admin and recorded in the immutable Security Logs.
              </p>
              <button style={{ width: '100%', marginTop: '16px', padding: '10px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid var(--border)', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                 <HelpCircle size={16} /> Matrix Documentation
              </button>
           </div>
        </div>

      </div>

    </div>
  );
};

export default RolesPermissions;
