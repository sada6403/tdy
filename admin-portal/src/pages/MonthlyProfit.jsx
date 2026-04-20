import { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronRight, PieChart, Clock, 
  CheckCircle2, XCircle, AlertCircle, Download, 
  RotateCcw, Wallet, Landmark, Calendar, User, 
  TrendingUp, FileText, Settings, PlayCircle, Eye, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { profitService } from '../services/api/adminProfit';

const MonthlyProfit = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await profitService.getPayoutSchedules(statusFilter);
      if (res.success) {
        setSchedules(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [statusFilter]);

  const handleRunPayouts = async () => {
    setProcessing(true);
    try {
      const res = await profitService.runMonthlyPayouts();
      if (res.success) {
        setSuccessMessage(res.message || 'Profit distribution cycle completed successfully.');
        setShowSuccessModal(true);
        fetchSchedules(); // Refresh the list
      }
    } catch (err) {
      alert(`Error running payouts: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const filteredSchedules = schedules.filter(item => {
    const term = searchQuery.toLowerCase();
    return (
      item.customer.toLowerCase().includes(term) ||
      (item.id && item.id.toLowerCase().includes(term)) ||
      item.plan.toLowerCase().includes(term)
    );
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'DUE': return { bg: '#e0f2fe', text: '#0284c7', icon: <Clock size={12} /> };
      case 'PENDING': return { bg: '#fff7ed', text: '#ea580c', icon: <Clock size={12} /> };
      case 'COMPLETED': return { bg: '#ecfdf5', text: '#059669', icon: <Wallet size={12} /> };
      case 'BANK_LOGGED': return { bg: '#eff6ff', text: '#2563eb', icon: <Landmark size={12} /> };
      case 'FAILED': return { bg: '#fef2f2', text: '#dc2626', icon: <XCircle size={12} /> };
      default: return { bg: '#f1f5f9', text: '#475569', icon: <Clock size={12} /> };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '32px' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#f0fdf4', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Batch Cycle Complete</h2>
              <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '24px' }}>{successMessage}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  onClick={() => navigate('/payout-list')}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '700', fontSize: '15px' }}
                >
                  View Payout List
                </button>
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '15px' }}
                >
                  Close
                </button>
              </div>
           </div>
        </div>
      )}
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Monthly Profit Schedule</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Audit and manage recurring profit distributions for active investment cycles.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderColor: '#8b5cf630' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', fontWeight: '800', color: '#8b5cf6', textTransform: 'uppercase' }}>Volume Next 7 Days</p>
              <p style={{ fontSize: '16px', fontWeight: '800', color: '#6d28d9' }}>LKR 425,000.00</p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#8b5cf6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChart size={20} />
            </div>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by ID, Customer Name, or Plan ID..." 
            className="input-field"
            style={{ width: '100%', paddingLeft: '48px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
           <select 
             className="input-field" 
             style={{ width: '140px' }}
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
           >
             <option value="">All Statuses</option>
             <option value="DUE">Due (Projected)</option>
             <option value="PENDING">Pending (Logs)</option>
             <option value="COMPLETED">Completed</option>
             <option value="FAILED">Failed</option>
           </select>
        </div>
        <button className="btn-primary" style={{ height: '42px' }} onClick={handleRunPayouts} disabled={processing}>
           {processing ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />} Bulk Process Due
        </button>
      </div>

      {/* Schedule Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CYCLE ID</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CUSTOMER / PLAN</th>
              <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CYCLE</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>PROFIT AMOUNT</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>DUE DATE</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>DESTINATION</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>STATUS</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AUDIT</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
            ) : error ? (
              <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>{error}</td></tr>
            ) : filteredSchedules.length === 0 ? (
               <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No schedules or logs found.</td></tr>
            ) : filteredSchedules.map((item, i) => {
              const status = getStatusStyle(item.status);
              const isProjected = item.isProjected;
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row">
                  <td style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: '#1e293b', fontFamily: 'monospace' }}>
                    {item.id.substring(item.id.length - 6).toUpperCase()}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{item.customer}</div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>{item.plan}</div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                     <div style={{ fontSize: '12px', fontWeight: '800', color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>{item.cycle}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#166534' }}>
                        LKR {item.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '13px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Calendar size={14} color="#94a3b8" /> {new Date(item.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#475569', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                       {item.destination === 'WALLET' ? <Wallet size={14} /> : <Landmark size={14} />}
                       {item.destination}
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
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                       {!isProjected && (
                          <button onClick={() => navigate(`/monthly-profit/${item.id}`)} style={{ padding: '6px', borderRadius: '6px', color: '#64748b' }} title="View Detail"><Eye size={18} /></button>
                       )}
                    </div>
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

export default MonthlyProfit;
