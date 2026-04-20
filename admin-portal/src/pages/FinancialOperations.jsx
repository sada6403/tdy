import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  CheckCircle2, 
  XSquare, 
  History,
  TrendingUp,
  CreditCard,
  CreditCardIcon,
  BadgeDollarSign
} from 'lucide-react';

const FinancialOperations = () => {
    const [deposits, setDeposits] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('DEPOSITS');

    useEffect(() => {
        fetchFinancials();
    }, []);

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const [depRes, witRes] = await Promise.all([
                axios.get('/api/admin/deposits', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setDeposits(depRes.data.data || []);
            setWithdrawals(witRes.data.data || []);
        } catch (err) {
            console.error('Error fetching financials:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type, id, action) => {
        if (!confirm(`Are you sure you want to ${action} this ${type}?`)) return;
        try {
            const token = localStorage.getItem('admin_token');
            const endpoint = `/api/admin/${type === 'DEPOSIT' ? 'deposits' : 'withdrawals'}/${id}/${action}`;
            const res = await axios.post(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) {
                fetchFinancials();
            }
        } catch (err) {
            alert(err.response?.data?.message || `Operation failed`);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Pending Liquidity Inflow</p>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>LKR {deposits.filter(d => d.status === 'PENDING').reduce((acc, d) => acc + d.amount, 0).toLocaleString()}</h2>
                            <p style={{ color: '#10b981', fontSize: '12px', fontWeight: '600' }}>{deposits.filter(d => d.status === 'PENDING').length} Verification Waiting</p>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                            <ArrowDownCircle size={24} style={{ margin: 'auto' }} />
                        </div>
                    </div>
                </div>
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Approved Outflow Queued</p>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>LKR {withdrawals.filter(w => w.status === 'APPROVED').reduce((acc, w) => acc + w.amount, 0).toLocaleString()}</h2>
                            <p style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '600' }}>{withdrawals.filter(w => w.status === 'APPROVED').length} Ready for Transfer</p>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fff7ed', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                            <ArrowUpCircle size={24} style={{ margin: 'auto' }} />
                        </div>
                    </div>
                </div>
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Total Wallet Volume</p>
                            <h2 style={{ fontSize: '24px', fontWeight: '800' }}>LKR 12.4M</h2>
                            <p style={{ color: '#3b82f6', fontSize: '12px', fontWeight: '600' }}>Real-time Audit</p>
                        </div>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
                            <Wallet size={24} style={{ margin: 'auto' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Operations Manager */}
            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button 
                          onClick={() => setTab('DEPOSITS')}
                          style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            padding: '8px 4px',
                            color: tab === 'DEPOSITS' ? '#0f172a' : '#94a3b8',
                            borderBottom: tab === 'DEPOSITS' ? '3px solid #10b981' : '3px solid transparent',
                            transition: 'all 0.2s'
                          }}>
                            Deposit Requests
                        </button>
                        <button 
                          onClick={() => setTab('WITHDRAWALS')}
                          style={{
                            fontSize: '15px',
                            fontWeight: '700',
                            padding: '8px 4px',
                            color: tab === 'WITHDRAWALS' ? '#0f172a' : '#94a3b8',
                            borderBottom: tab === 'WITHDRAWALS' ? '3px solid #10b981' : '3px solid transparent',
                            transition: 'all 0.2s'
                          }}>
                            Withdrawal Requests
                        </button>
                    </div>
                    <button onClick={fetchFinancials} style={{ color: '#10b981', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                        <History size={16} /> Sync Treasury
                    </button>
                </div>

                <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Queued Operations ({tab === 'DEPOSITS' ? deposits.length : withdrawals.length})</span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                          <option>Filter by Status</option>
                          <option>Pending</option>
                          <option>Approved</option>
                          <option>Rejected</option>
                        </select>
                    </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'white' }}>
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>REFERENCE/CUSTOMER</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>AMOUNT (LKR)</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>PAYMENT METHOD</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>TIMESTAMP</th>
                            <th style={{ textAlign: 'left', padding: '16px 24px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>STATUS</th>
                            <th style={{ textAlign: 'right', padding: '16px 24px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>Accessing financial records...</td></tr>
                        ) : (tab === 'DEPOSITS' ? deposits : withdrawals).length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>No records found for the selection.</td></tr>
                        ) : (tab === 'DEPOSITS' ? deposits : withdrawals).map((item) => (
                            <tr key={item._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                <td style={{ padding: '20px 24px' }}>
                                    <div>
                                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{item.customer?.fullName || 'NF-User'}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>#{item.referenceNumber || item._id.slice(-8).toUpperCase()}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontSize: '15px', fontWeight: '800', color: tab === 'DEPOSITS' ? '#10b981' : '#ef4444' }}>
                                      {item.amount?.toLocaleString()}
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CreditCard size={14} /> {item.paymentMethod || 'Bank Transfer'}
                                    </div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{new Date(item.createdAt).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(item.createdAt).toLocaleTimeString()}</div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                  <span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>
                                </td>
                                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        {item.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleAction(tab.slice(0, -1), item._id, 'approve')} style={{ color: '#10b981', padding: '8px', border: '1px solid #d1fae5', borderRadius: '6px' }} title="Approve"><CheckCircle2 size={16} /></button>
                                                <button onClick={() => handleAction(tab.slice(0, -1), item._id, 'reject')} style={{ color: '#ef4444', padding: '8px', border: '1px solid #fee2e2', borderRadius: '6px' }} title="Reject"><XSquare size={16} /></button>
                                            </>
                                        )}
                                        {item.status === 'APPROVED' && tab === 'WITHDRAWALS' && (
                                            <button onClick={() => handleAction('WITHDRAWAL', item._id, 'complete')} style={{ color: '#3b82f6', fontSize: '11px', fontWeight: '700', padding: '6px 12px', border: '1px solid #bfdbfe', borderRadius: '6px' }}>COMPLETE PAYOUT</button>
                                        )}
                                        <button style={{ color: '#94a3b8', padding: '8px', border: '1px solid #f1f5f9', borderRadius: '6px' }} title="View Receipt"><BadgeDollarSign size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancialOperations;
