import { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronRight, Wallet, Clock, 
  CheckCircle2, XCircle, AlertCircle, Download, 
  Eye, ArrowUpRight, Landmark, CreditCard, 
  Calendar, User, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { depositsService } from '../services/api/adminDeposits';

const Deposits = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const res = await depositsService.getDepositRequests();
        if (res?.success) {
          setRequests(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch deposits:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  const stats = {
    pending: requests.filter(r => r.status === 'PENDING').length,
    underReview: requests.filter(r => r.status === 'UNDER_REVIEW').length,
    approvedToday: requests.filter(r => {
      const today = new Date().toDateString();
      return r.status === 'APPROVED' && new Date(r.updatedAt).toDateString() === today;
    }).length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
    dailyTotal: requests
      .filter(r => r.status === 'APPROVED' && new Date(r.updatedAt).toDateString() === new Date().toDateString())
      .reduce((sum, r) => sum + (r.amount || 0), 0)
  };

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  const filteredRequests = requests.filter(req => {
    const searchLow = searchQuery.toLowerCase();
    const idMatch = req._id && req._id.toLowerCase().includes(searchLow);
    const refMatch = req.referenceNumber && req.referenceNumber.toLowerCase().includes(searchLow);
    const nameMatch = req.customerId && req.customerId.name && req.customerId.name.toLowerCase().includes(searchLow);
    
    // Tab logic
    const isActionable = ['PENDING', 'UNDER_REVIEW'].includes(req.status);
    const isHistory = ['APPROVED', 'REJECTED'].includes(req.status);
    
    const tabMatch = activeTab === 'pending' ? isActionable : isHistory;
    
    const statusMatch = statusFilter === 'All Statuses' || req.status === statusFilter.toUpperCase().replace(' ', '_');
    
    return (idMatch || refMatch || nameMatch) && statusMatch && tabMatch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return { bg: '#fff7ed', text: '#ea580c', icon: <Clock size={12} /> };
      case 'UNDER_REVIEW': return { bg: '#eff6ff', text: '#2563eb', icon: <Eye size={12} /> };
      case 'REJECTED': return { bg: '#fef2f2', text: '#dc2626', icon: <XCircle size={12} /> };
      case 'APPROVED': return { bg: '#ecfdf5', text: '#059669', icon: <CheckCircle2 size={12} /> };
      default: return { bg: '#f1f5f9', text: '#475569', icon: <Clock size={12} /> };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Deposit Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Verify and approve customer bank deposit requests.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="card" style={{ padding: '4px 16px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f0fdf4', border: '1px solid #10b98120' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#15803d', textTransform: 'uppercase' }}>Daily Total</p>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#166534' }}>LKR {stats.dailyTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Pending Deposits', value: stats.pending, color: '#f59e0b', icon: <Clock size={16} /> },
          { label: 'Under Review', value: stats.underReview, color: '#3b82f6', icon: <Eye size={16} /> },
          { label: 'Verified Today', value: stats.approvedToday, color: '#10b981', icon: <CheckCircle2 size={16} /> },
          { label: 'Rejections', value: stats.rejected, color: '#ef4444', icon: <XCircle size={16} /> },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${stat.color}10`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>{stat.label}</p>
              <p style={{ fontSize: '18px', fontWeight: '800' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            border: 'none', background: 'none', position: 'relative',
            color: activeTab === 'pending' ? 'var(--primary)' : '#94a3b8'
          }}
        >
          Active Requests ({stats.pending + stats.underReview})
          {activeTab === 'pending' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: 'var(--primary)', borderRadius: '3px 3px 0 0' }}></div>}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
            border: 'none', background: 'none', position: 'relative',
            color: activeTab === 'history' ? 'var(--primary)' : '#94a3b8'
          }}
        >
          Deposit Approval History
          {activeTab === 'history' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: 'var(--primary)', borderRadius: '3px 3px 0 0' }}></div>}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by Request ID, Customer Name, or Ref Number..." 
            className="input-field"
            style={{ width: '100%', paddingLeft: '48px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <input type="date" className="input-field" style={{ width: '160px' }} disabled />
        <select 
          className="input-field" 
          style={{ width: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Statuses</option>
          <option>Pending</option>
          <option>Under Review</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <button className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Deposits Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>REQUEST ID</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>CUSTOMER</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>AMOUNT</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>REFERENCE #</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>DATED</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>STATUS</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>
                  <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                  <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Loading deposits...</p>
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {activeTab === 'pending' ? 'No pending deposit requests found.' : 'No deposit history recorded.'}
                </td>
              </tr>
            ) : filteredRequests.map((req, i) => {
              const status = getStatusStyle(req.status);
              const dateObj = new Date(req.createdAt);
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row">
                  <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    #{req._id ? req._id.substring(req._id.length - 6).toUpperCase() : 'N/A'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                      {req.customerId?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>
                      {req.customerId?.userId || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#166534' }}>
                      LKR {req.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '13px', color: '#475569', fontWeight: '600', fontFamily: 'monospace' }}>
                    {req.referenceNumber || 'N/A'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {activeTab === 'history' ? new Date(req.updatedAt).toLocaleDateString() : dateObj.toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {activeTab === 'history' ? new Date(req.updatedAt).toLocaleTimeString() : dateObj.toLocaleTimeString()}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      backgroundColor: status.bg, 
                      color: status.text,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {status.icon}
                      {req.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => navigate(`/deposits/${req._id}`)}
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        backgroundColor: activeTab === 'pending' ? '#f1f5f9' : '#fff', 
                        color: activeTab === 'pending' ? 'var(--text-main)' : 'var(--primary)',
                        border: activeTab === 'pending' ? 'none' : '1px solid var(--primary)',
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {activeTab === 'pending' ? 'Verify' : 'View Audit'} <ChevronRight size={14} />
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

const TrendingUp = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

export default Deposits;
