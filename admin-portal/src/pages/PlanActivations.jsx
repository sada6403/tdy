import { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronRight, Zap, Clock, 
  CheckCircle2, XCircle, AlertCircle, Download, 
  Eye, Wallet, PieChart, Landmark, FileText,
  User, Building2, UserCog, Calendar, ArrowUpRight, 
  Loader2, History, ShieldCheck, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { plansService } from '../services/api/adminPlans';
import { motion, AnimatePresence } from 'framer-motion';

const PlanActivations = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING or HISTORY
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      setLoading(true);
      try {
        const res = await plansService.getAllInvestments();
        if (res?.success) {
          setRequests(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch plan activations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvestments();
  }, []);

  const filteredRequests = requests.filter(req => {
    // First filter by tab
    const isHistory = activeTab === 'HISTORY';
    const isPending = req.status === 'PENDING_ACTIVATION_APPROVAL';
    
    if (activeTab === 'PENDING' && !isPending) return false;
    if (activeTab === 'HISTORY' && isPending) return false;

    // Then filter by search
    const searchLow = searchQuery.toLowerCase();
    const idMatch = req.id && req.id.toLowerCase().includes(searchLow);
    const refMatch = req.referenceNumber && req.referenceNumber.toLowerCase().includes(searchLow);
    const nameMatch = req.customer_name && req.customer_name.toLowerCase().includes(searchLow);
    const planMatch = req.plan_name && req.plan_name.toLowerCase().includes(searchLow);
    return idMatch || refMatch || nameMatch || planMatch;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING_ACTIVATION_APPROVAL': return { bg: '#fff7ed', text: '#ea580c', label: 'Pending Approval', icon: <Clock size={12} /> };
      case 'ACTIVE': return { bg: '#ecfdf5', text: '#059669', label: 'Active', icon: <CheckCircle2 size={12} /> };
      case 'MATURED': return { bg: '#dbeafe', text: '#1d4ed8', label: 'Matured', icon: <ShieldCheck size={12} /> };
      case 'REJECTED': return { bg: '#fef2f2', text: '#dc2626', label: 'Rejected', icon: <XCircle size={12} /> };
      case 'CANCELLED': return { bg: '#f1f5f9', text: '#475569', label: 'Cancelled', icon: <XCircle size={12} /> };
      default: return { bg: '#f8fafc', text: '#64748b', label: status || 'Unknown', icon: <AlertCircle size={12} /> };
    }
  };

  const stats = {
    pending: requests.filter(r => r.status === 'PENDING_ACTIVATION_APPROVAL').length,
    active: requests.filter(r => r.status === 'ACTIVE').length,
    totalVolume: requests.reduce((acc, r) => acc + (r.invested_amount || 0), 0)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '10px 0' }}>
      
      {/* Premium Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', shadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
              <Zap size={22} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
              Plan Activations
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: '500' }}>
            Authorize and manage customer investment portfolios with precision.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="card" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #10b98120', background: 'linear-gradient(to right, #ffffff, #f0fdf4)' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', fontWeight: '800', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Total Active AUM</p>
              <p style={{ fontSize: '20px', fontWeight: '900', color: '#064e3b' }}>LKR {(stats.totalVolume / 1000000).toFixed(2)}M</p>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PieChart size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs System */}
      <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '16px', alignSelf: 'flex-start' }}>
        <button 
          onClick={() => setActiveTab('PENDING')}
          style={{
            padding: '10px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'PENDING' ? 'white' : 'transparent',
            color: activeTab === 'PENDING' ? '#059669' : '#64748b',
            border: 'none',
            boxShadow: activeTab === 'PENDING' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <Clock size={16} /> 
          Pending Approvals
          {stats.pending > 0 && (
            <span style={{ background: '#ef4444', color: 'white', fontSize: '10px', padding: '2px 7px', borderRadius: '20px', marginLeft: '4px' }}>
              {stats.pending}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          style={{
            padding: '10px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'HISTORY' ? 'white' : 'transparent',
            color: activeTab === 'HISTORY' ? '#059669' : '#64748b',
            border: 'none',
            boxShadow: activeTab === 'HISTORY' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <History size={16} /> Activation History
        </button>
      </div>

      {/* Filters & Actions Bar */}
      <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '20px 24px', borderRadius: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by Request ID, Customer, or Plan Name..." 
            className="input-field"
            style={{ width: '100%', paddingLeft: '52px', height: '48px', fontSize: '14px', fontWeight: '600' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="input-field" style={{ width: '180px', height: '48px', fontWeight: '700' }}>
            <option>All Plans</option>
            <option>Premium Growth</option>
            <option>Standard Saver</option>
          </select>
          <button className="card" style={{ padding: '0 20px', height: '48px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '700', color: '#475569' }}>
            <Filter size={18} /> Filters
          </button>
          <button className="btn-secondary" style={{ height: '48px', width: '48px', padding: 0, justifyContent: 'center', borderRadius: '12px' }}>
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* Activations Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ textAlign: 'left', padding: '18px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Activation ID</th>
              <th style={{ textAlign: 'left', padding: '18px 20px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Customer Info</th>
              <th style={{ textAlign: 'left', padding: '18px 20px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Investment Details</th>
              <th style={{ textAlign: 'left', padding: '18px 20px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ROI & Returns</th>
              <th style={{ textAlign: 'left', padding: '18px 20px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '18px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode='wait'>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '80px', textAlign: 'center' }}>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Loader2 className="animate-spin text-emerald-500 mx-auto" size={40} />
                    <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '600' }}>Synchronizing activations...</p>
                  </motion.div>
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '80px', textAlign: 'center' }}>
                  <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', margin: '0 auto 16px' }}>
                      <FileText size={32} />
                    </div>
                    <p style={{ color: '#1e293b', fontWeight: '800', fontSize: '18px', marginBottom: '8px' }}>No records found</p>
                    <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>We couldn't find any activation requests matching your criteria.</p>
                  </div>
                </td>
              </tr>
            ) : filteredRequests.map((req, i) => {
              const status = getStatusStyle(req.status);
              const isPending = req.status === 'PENDING_ACTIVATION_APPROVAL';
              
              return (
                <motion.tr 
                  key={req.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid #f1f5f9' }} 
                  className="table-row hover:bg-slate-50/50 transition-colors"
                >
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', fontFamily: 'var(--font-display)' }}>
                      #{req.referenceNumber || (req.id ? req.id.substring(req.id.length - 8).toUpperCase() : 'N/A')}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', marginTop: '4px' }}>
                      {new Date(req.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: '800', border: '1px solid #e2e8f0' }}>
                        {(req.customer_name || 'U').charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{req.customer_name || 'Unknown'}</div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={10} /> Verified ID
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>LKR {req.invested_amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#6366f1', background: '#e0e7ff', padding: '1px 8px', borderRadius: '6px' }}>{req.plan_name || 'PLAN'}</span>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8' }}>· {req.durationMonths || 12}M</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#059669' }}>{req.monthlyROI}% Monthly</div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {req.profitDestination === 'BANK' ? <><Landmark size={11} /> Bank Transfer</> : <><Wallet size={11} /> NF Wallet</>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '800',
                      backgroundColor: status.bg,
                      color: status.text,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: `0 2px 4px ${status.text}10`
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: 'full', background: status.text, opacity: 0.5 }}></span>
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => navigate(`/plan-activations/${req.id}`)}
                      className={isPending ? "btn-primary" : "btn-secondary"}
                      style={{ 
                        height: '36px',
                        padding: '0 16px', 
                        fontSize: '13px',
                        fontWeight: '800',
                        gap: '6px',
                        borderRadius: '10px'
                      }}
                    >
                      {isPending ? 'Verify Request' : 'View Detail'}
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default PlanActivations;
