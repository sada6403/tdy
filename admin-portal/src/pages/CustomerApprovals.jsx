import { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronRight, Eye, CheckCircle2, XCircle, 
  Clock, Phone, Mail, UserCheck, AlertCircle, Download, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { approvalsService } from '../services/api/adminApprovals';

const CustomerApprovals = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ pending: 0, total: 0, approvedToday: 0, rejectedToday: 0 });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await approvalsService.getPendingApprovals();
      if (res.success && res.data) {
        setApplications(res.data.approvals || []);
        setStats(res.data.stats || {});
      }
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return { bg: '#fff7ed', text: '#ea580c', icon: <Clock size={12} /> };
      case 'UNDER_REVIEW': return { bg: '#eff6ff', text: '#2563eb', icon: <UserCheck size={12} /> };
      case 'RESUBMISSION_REQUIRED': return { bg: '#fef2f2', text: '#dc2626', icon: <AlertCircle size={12} /> };
      default: return { bg: '#f1f5f9', text: '#475569', icon: <Clock size={12} /> };
    }
  };

  const filteredApps = applications.filter(app => {
    if (!searchQuery) return true;
    const lower = searchQuery.toLowerCase();
    return (
      (app.customerName && app.customerName.toLowerCase().includes(lower)) ||
      (app.referenceId && app.referenceId.toLowerCase().includes(lower)) ||
      (app.id && app.id.toLowerCase().includes(lower))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Customer Approvals</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Review and verify new customer registration applications.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="card" onClick={fetchApplications} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
            <Clock size={18} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>PENDING QUEUE</p>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{stats.pending || 0}</h2>
        </div>
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>APPROVED TODAY</p>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{stats.approvedToday || 0}</h2>
        </div>
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #ef4444' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>REJECTED TODAY</p>
          <h2 style={{ fontSize: '24px', fontWeight: '800' }}>{stats.rejectedToday || 0}</h2>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by Name or Reference ID..." 
            className="input-field"
            style={{ width: '100%', paddingLeft: '48px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>REFERENCE ID</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>CUSTOMER NAME</th>
              <th style={{ textAlign: 'center', padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>VERIFICATION</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>BRANCH</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>SUBMITTED ON</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>STATUS</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}><Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 10px' }}/> Loading queue...</td></tr>
            ) : filteredApps.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No pending applications found.</td></tr>
            ) : filteredApps.map((app, i) => {
              const status = getStatusStyle(app.status);
              return (
                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row">
                  <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                    {app.referenceId || `#${app.id.substring(0, 8)}`}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{app.customerName || 'N/A'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{app.requestType.replace('_', ' ')}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <Phone size={14} style={{ color: app.isPhoneVerified ? '#10b981' : '#cbd5e1' }} title={app.isPhoneVerified ? "Phone Verified" : "Phone Pending"}/>
                      <Mail size={14} style={{ color: app.isEmailVerified ? '#10b981' : '#cbd5e1' }} title={app.isEmailVerified ? "Email Verified" : "Email Pending"} />
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{app.branch || 'Online'}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(app.submittedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', 
                      backgroundColor: status.bg, color: status.text, display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}>
                      {status.icon}
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => navigate(`/customer-approvals/${app.id}`)}
                      style={{ 
                        padding: '8px 16px', borderRadius: '8px', backgroundColor: '#f1f5f9', 
                        color: 'var(--text-main)', fontSize: '13px', fontWeight: '600',
                        display: 'inline-flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      Process <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerApprovals;
