import { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronRight, ArrowUpRight, Clock, 
  CheckCircle2, XCircle, AlertCircle, Download, 
  Eye, Wallet, Landmark, CreditCard, User, 
  Building2, Calendar, MoreVertical, Send, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { withdrawalsService } from '../services/api/adminWithdrawals';

const Withdrawals = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING, APPROVED, REJECTED
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await withdrawalsService.getWithdrawalRequests();
        if (res?.success) {
          setRequests(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch withdrawal requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(req => {
    // Tab filtering
    const matchesTab = activeTab === 'PENDING' 
      ? (req.status || '').toUpperCase() === 'PENDING'
      : activeTab === 'APPROVED'
      ? (req.status || '').toUpperCase() === 'APPROVED' || (req.status || '').toUpperCase() === 'COMPLETED'
      : (req.status || '').toUpperCase() === 'REJECTED';

    if (!matchesTab) return false;
    
    // Search filtering
    if (!searchQuery.trim()) return true;
    const searchLow = searchQuery.toLowerCase();
    const idMatch = (req.referenceNumber || req._id || '').toLowerCase().includes(searchLow);
    const nameMatch = (req.customerId?.name || req.customerId?.fullName || '').toLowerCase().includes(searchLow);
    const nicMatch = (req.customerId?.nic || '').toLowerCase().includes(searchLow);
    const reasonMatch = (req.reason || '').toLowerCase().includes(searchLow);
    return idMatch || nameMatch || nicMatch || reasonMatch;
  });

  const getStatusStyle = (status) => {
    const s = (status || '').toUpperCase();
    switch (s) {
      case 'PENDING': return { bg: '#fff7ed', text: '#ea580c', icon: <Clock size={12} /> };
      case 'APPROVED': return { bg: '#ecfdf5', text: '#059669', icon: <CheckCircle2 size={12} /> };
      case 'PROCESSING_PAYOUT': return { bg: '#eff6ff', text: '#2563eb', icon: <Loader2 size={12} className="animate-spin" /> };
      case 'COMPLETED': return { bg: '#f1f5f9', text: '#1e293b', icon: <CheckCircle2 size={12} /> };
      case 'REJECTED': return { bg: '#fef2f2', text: '#dc2626', icon: <XCircle size={12} /> };
      case 'FAILED': return { bg: '#fef2f2', text: '#dc2626', icon: <XCircle size={12} /> };
      default: return { bg: '#f1f5f9', text: '#475569', icon: <Clock size={12} /> };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Withdrawal Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Analyze and process customer payout requests from their wallet.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="card" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #ef444420' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase' }}>Volume ({activeTab.toLowerCase()})</p>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#991b1b' }}>LKR {filteredRequests.reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '2px' }}>
        <button 
          onClick={() => setActiveTab('PENDING')}
          style={{ 
            padding: '10px 20px', 
            fontSize: '14px', 
            fontWeight: '700', 
            color: activeTab === 'PENDING' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'PENDING' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Pending Requests
        </button>
        <button 
          onClick={() => setActiveTab('APPROVED')}
          style={{ 
            padding: '10px 20px', 
            fontSize: '14px', 
            fontWeight: '700', 
            color: activeTab === 'APPROVED' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'APPROVED' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Approved History
        </button>
        <button 
          onClick={() => setActiveTab('REJECTED')}
          style={{ 
            padding: '10px 20px', 
            fontSize: '14px', 
            fontWeight: '700', 
            color: activeTab === 'REJECTED' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'REJECTED' ? '2px solid var(--primary)' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Reject History
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by Request ID, Customer Name, or NIC..." 
            className="input-field"
            style={{ width: '100%', paddingLeft: '48px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      {/* Requests Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>REQUEST ID</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CUSTOMER</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AMOUNT</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PURPOSE / BANK</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>REQUESTED ON</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>STATUS</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center' }}>
                  <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                  <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Loading requests...</p>
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No withdrawal requests found for this category.
                </td>
              </tr>
            ) : filteredRequests.map((req, i) => {
              const status = getStatusStyle(req.status);
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row">
                  <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    {req.referenceNumber || req._id.substring(0, 8)}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{req.customerId?.name || req.customerId?.fullName || 'Unknown'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{req.customerId?.nic || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>
                       LKR {req.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{req.reason || 'Personal Withdrawal'}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Landmark size={12} /> {req.bankName || 'Not Provided'}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(req.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(req.createdAt).toLocaleTimeString()}</div>
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
                      onClick={() => navigate(`/withdrawals/${req._id}`)}
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        backgroundColor: 'var(--primary)', 
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {activeTab === 'PENDING' ? 'Review' : 'View Details'} <ChevronRight size={14} />
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

export default Withdrawals;
