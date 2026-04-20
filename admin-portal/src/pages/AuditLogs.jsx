import { useState } from 'react';
import { 
  Search, Filter, ChevronRight, History, 
  User, Shield, Eye, Download, Calendar,
  MoreVertical, Info, HardDrive, ShieldCheck, 
  AlertCircle, CheckCircle2, UserCog, Activity
} from 'lucide-react';

const AuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const logs = [
    { 
      id: 'LOG-88421', 
      user: 'Super Admin', 
      role: 'Main Admin', 
      action: 'Plan Activation Approved', 
      entity: 'Investment Plan',
      entityId: 'PLA-1102',
      description: 'Approved Platinum Growth plan for Kamal Gamage (NF-C-2104)',
      time: '2026-04-05 14:30:12',
      severity: 'Info'
    },
    { 
      id: 'LOG-88418', 
      user: 'Nimal Perera', 
      role: 'Branch Admin', 
      action: 'Customer KYC Verified', 
      entity: 'Customer Account',
      entityId: 'NF-C-2210',
      description: 'Verified NIC and bank documents for Dilshan Madushanka',
      time: '2026-04-05 13:15:45',
      severity: 'Success'
    },
    { 
      id: 'LOG-88415', 
      user: 'Sarah Smith', 
      role: 'Branch Manager', 
      action: 'Deposit Manual Approval', 
      entity: 'Transaction',
      entityId: 'DEP-8842',
      description: 'Manually verified deposit receipt of LKR 50,000.00',
      time: '2026-04-05 11:45:22',
      severity: 'Success'
    },
    { 
      id: 'LOG-88412', 
      user: 'System Bot', 
      role: 'Automated Service', 
      action: 'Profit Payout Failure', 
      entity: 'Payroll Cycle',
      entityId: 'PL-5512-08',
      description: 'Bank API rejected payout due to invalid account format',
      time: '2026-04-05 09:00:01',
      severity: 'Critical'
    },
    { 
      id: 'LOG-88405', 
      user: 'Super Admin', 
      role: 'Main Admin', 
      action: 'Withdrawal Approved', 
      entity: 'Wallet Payout',
      entityId: 'WDR-9918',
      description: 'Approved payout of LKR 12,500.00 for Sarah Jesudasan',
      time: '2026-04-04 16:20:10',
      severity: 'Info'
    },
  ];

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'Info': return { color: '#3b82f6', bg: '#eff6ff' };
      case 'Success': return { color: '#10b981', bg: '#ecfdf5' };
      case 'Critical': return { color: '#ef4444', bg: '#fef2f2' };
      default: return { color: '#64748b', bg: '#f8fafc' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Inviolable Audit Logs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Transparent lifecycle tracking of every administrative action for regulatory compliance.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="card" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #10b98130' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', fontWeight: '800', color: '#059669', textTransform: 'uppercase' }}>Security Integrity</p>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#064e3b' }}>100% SECURE</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} />
            </div>
          </button>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by Log ID, Admin Name, or Entity ID..." 
            className="input-field"
            style={{ width: '100%', paddingLeft: '48px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="input-field" style={{ width: '160px' }}>
          <option>All Roles</option>
          <option>Main Admin</option>
          <option>Branch Admin</option>
          <option>System Bot</option>
        </select>
        <select className="input-field" style={{ width: '160px' }}>
          <option>All Severity</option>
          <option>Info</option>
          <option>Success</option>
          <option>Critical</option>
        </select>
        <button className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
          <Calendar size={18} /> Select Date
        </button>
        <button className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
           <Download size={18} /> Export
        </button>
      </div>

      {/* Logs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>LOG ID</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>ADMINISTRATOR</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>ACTION & ENTITY</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>DESCRIPTION</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>DATE / TIME</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>DET...</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => {
              const severity = getSeverityStyle(log.severity);
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row">
                  <td style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#64748b', fontFamily: 'monospace' }}>{log.id}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} color="#64748b" />
                       </div>
                       <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{log.user}</div>
                          <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)' }}>{log.role}</div>
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{log.action}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{log.entity}: <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{log.entityId}</span></div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#475569', fontWeight: '600', maxWidth: '300px' }}>{log.description}</div>
                  </td>
                  <td style={{ padding: '16px', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>{log.time}</div>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button style={{ padding: '6px', borderRadius: '6px', color: '#94a3b8' }}>
                       <Eye size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Compliance Notice */}
      <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', gap: '16px', alignItems: 'center' }}>
         <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={24} color="#0369a1" />
         </div>
         <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0c4a6e' }}>Regulatory Data Integrity</h4>
            <p style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600' }}>
               Audit logs are immutable and cryptographically linked to the specific database transaction. Deleting or modifying logs is prohibited by corporate finance policy.
            </p>
         </div>
      </div>

    </div>
  );
};

export default AuditLogs;
