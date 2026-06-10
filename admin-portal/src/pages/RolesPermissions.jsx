import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldCheck, ShieldAlert, Eye, Lock, Unlock,
  Info, AlertTriangle, History, Building2, CheckCircle2, Loader2
} from 'lucide-react';
import apiClient from '../services/api/client';

const permissions = [
  { category: 'Customer Management', action: 'Approve Registrations',  superAdmin: 'Full',       branchAdmin: 'Limited'    },
  { category: 'Financial Control',   action: 'Approve Deposits',        superAdmin: 'Full',       branchAdmin: 'Limited'    },
  { category: 'Financial Control',   action: 'Plan Activations',        superAdmin: 'Full',       branchAdmin: 'Limited'    },
  { category: 'Financial Control',   action: 'Approve Withdrawals',     superAdmin: 'Full',       branchAdmin: 'Restricted' },
  { category: 'Finance Compliance',  action: 'Payout Completion',       superAdmin: 'Full',       branchAdmin: 'Restricted' },
  { category: 'Operations',          action: 'Branch Management',       superAdmin: 'Full',       branchAdmin: 'View Only'  },
  { category: 'Analytical Tools',    action: 'View Reports',            superAdmin: 'Full',       branchAdmin: 'Branch Only'},
  { category: 'Security Audit',      action: 'View Audit Logs',         superAdmin: 'Full',       branchAdmin: 'Restricted' },
  { category: 'System Configuration',action: 'System Settings',         superAdmin: 'Full',       branchAdmin: 'Restricted' },
];

const levelStyle = (val) => {
  switch (val) {
    case 'Full':        return { color: '#059669', bg: '#ecfdf5', icon: <Unlock size={12} /> };
    case 'Limited':     return { color: '#2563eb', bg: '#eff6ff', icon: <ShieldCheck size={12} /> };
    case 'Branch Only': return { color: '#8b5cf6', bg: '#f5f3ff', icon: <Building2 size={12} /> };
    case 'View Only':   return { color: '#4b5563', bg: '#f3f4f6', icon: <Eye size={12} /> };
    case 'Restricted':  return { color: '#ef4444', bg: '#fef2f2', icon: <Lock size={12} /> };
    default:            return { color: '#9ca3af', bg: '#f9fafb', icon: <Info size={12} /> };
  }
};

const RulesPanel = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
    <div className="card" style={{ border: '1px solid var(--primary)30' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Info size={18} color="var(--primary)" /> Access Rule Protocol
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {[
          { title: 'Full Access', desc: 'Can View, Edit, Approve, and override system configurations.', color: '#059669' },
          { title: 'Limited / Branch', desc: 'Can only approve actions for customers within their assigned branch.', color: '#2563eb' },
          { title: 'View Only', desc: 'Can see detail views and download reports — Action buttons disabled.', color: '#4b5563' },
          { title: 'Restricted', desc: 'Access attempt redirects to "Unauthorized". Actions are hidden.', color: '#ef4444' },
        ].map((rule, i) => (
          <div key={i} style={{ borderLeft: `3px solid ${rule.color}`, paddingLeft: '12px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '800', color: rule.color }}>{rule.title}</h4>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: '600', lineHeight: 1.5 }}>{rule.desc}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="card" style={{ backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <ShieldAlert size={22} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#9a3412' }}>Branch Admin Scope</h4>
          <p style={{ fontSize: '11px', color: '#c2410c', fontWeight: '600', marginTop: '4px', lineHeight: 1.5 }}>
            Branch Admins can only view and manage data within their assigned branch. Cross-branch access is blocked at the API level.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const PermissionsTable = ({ activeRole }) => (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Permissions Matrix — {activeRole === 'superAdmin' ? 'Super Admin' : 'Branch Admin'}</h3>
    </div>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead style={{ backgroundColor: '#f8fafc' }}>
        <tr>
          <th style={{ textAlign: 'left', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>MODULE</th>
          <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>ACTION</th>
          <th style={{ textAlign: 'center', padding: '14px 16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>LEVEL</th>
          <th style={{ textAlign: 'center', padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>ALLOWED</th>
        </tr>
      </thead>
      <tbody>
        {permissions.map((perm, i) => {
          const val = activeRole === 'superAdmin' ? perm.superAdmin : perm.branchAdmin;
          const style = levelStyle(val);
          return (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '14px 24px', fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>{perm.category}</td>
              <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{perm.action}</td>
              <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', backgroundColor: style.bg, color: style.color, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  {style.icon} {val}
                </span>
              </td>
              <td style={{ padding: '14px 24px', textAlign: 'center' }}>
                <input type="checkbox" checked={val !== 'Restricted'} readOnly style={{ accentColor: 'var(--primary)', cursor: 'not-allowed' }} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// Branch admin: read-only view of their own permissions
const BranchAdminView = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>My Access Permissions</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Your role-based access level within NF Plantation Admin Portal.</p>
    </div>
    <div style={{ padding: '14px 18px', borderRadius: '10px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', display: 'flex', gap: '10px', alignItems: 'center' }}>
      <AlertTriangle size={18} color="#d97706" />
      <p style={{ fontSize: '13px', fontWeight: '600', color: '#92400e' }}>
        Permissions are managed by the Super Admin. Contact them to request access changes.
      </p>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
      <PermissionsTable activeRole="branchAdmin" />
      <RulesPanel />
    </div>
  </div>
);

// Super admin: full interactive view
const SuperAdminView = () => {
  const [activeRole, setActiveRole] = useState('superAdmin');
  const [counts, setCounts] = useState({ superAdminCount: 1, branchAdminCount: 0 });
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    apiClient.get('/admin/role-summary')
      .then(res => { if (res.success) setCounts(res.data); })
      .catch(() => {})
      .finally(() => setLoadingCounts(false));
  }, []);

  const roles = [
    {
      id: 'superAdmin',
      title: 'Super Admin',
      level: 'Level 10 — Full Access',
      count: counts.superAdminCount,
      icon: <ShieldCheck size={26} />,
      desc: 'Unrestricted access to all system modules, settings and financial operations.'
    },
    {
      id: 'branchAdmin',
      title: 'Branch Admin',
      level: 'Level 7 — Branch Control',
      count: counts.branchAdminCount,
      icon: <Building2 size={26} />,
      desc: 'Manages day-to-day operations limited to their assigned branch only.'
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Access Control & RBAC</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Role-Based Access Control matrix for all administrative personnel.</p>
        </div>
        <button className="btn-primary">Update Security Matrix</button>
      </div>

      {/* Role Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role.id)}
            className="card"
            style={{
              padding: '28px',
              textAlign: 'left',
              cursor: 'pointer',
              border: activeRole === role.id ? '2px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: activeRole === role.id ? '#f0fdf4' : 'white',
              transition: 'all 0.2s ease',
              transform: activeRole === role.id ? 'translateY(-3px)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: activeRole === role.id ? 'var(--primary)' : '#f1f5f9', color: activeRole === role.id ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {role.icon}
              </div>
              {activeRole === role.id && <CheckCircle2 size={20} color="var(--primary)" />}
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '4px', color: '#0f172a' }}>{role.title}</h3>
            <p style={{ fontSize: '11px', fontWeight: '800', color: activeRole === role.id ? 'var(--primary)' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>{role.level}</p>
            <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', lineHeight: 1.5, marginBottom: '16px' }}>{role.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                {loadingCounts ? <Loader2 size={16} className="animate-spin" /> : role.count}
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>active accounts</span>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
        <PermissionsTable activeRole={activeRole} />
        <RulesPanel />
      </div>
    </div>
  );
};

const RolesPermissions = () => {
  const { isBranchAdmin } = useAuth();
  return isBranchAdmin ? <BranchAdminView /> : <SuperAdminView />;
};

export default RolesPermissions;
