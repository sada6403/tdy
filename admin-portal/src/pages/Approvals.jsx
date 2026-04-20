import { useState, useEffect } from 'react';
import { approvalsService } from '../services/api/adminApprovals';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  ExternalLink, 
  Clock, 
  MoreVertical,
  ChevronRight,
  ShieldAlert,
  IdCard,
  UserCheck
} from 'lucide-react';

const Approvals = () => {
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('pending'); // 'pending' or 'history'
    const [stats, setStats] = useState({ pending: 0, approvedToday: 0, rejectedToday: 0 });
    const [activeTab, setActiveTab] = useState('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchApprovals();
    }, [activeView]);

    const fetchApprovals = async () => {
        setLoading(true);
        try {
            const res = activeView === 'pending' 
                ? await approvalsService.getPendingApprovals() 
                : await approvalsService.getApprovalHistory();
                
            if (res.success) {
                if (activeView === 'pending') {
                    setApprovals(res.data?.approvals || []);
                    setStats(res.data?.stats || { pending: 0, approvedToday: 0, rejectedToday: 0 });
                } else {
                    setApprovals(res.data || []);
                }
            }
        } catch (err) {
            console.error('Error fetching approvals:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;
        
        try {
            if (action === 'approve') {
                const res = await approvalsService.approveRequest(id);
                if (res.success) fetchApprovals();
            } else if (action === 'reject') {
                const res = await approvalsService.rejectRequest(id, 'Rejected by admin');
                if (res.success) fetchApprovals();
            }
        } catch (err) {
            alert(err.message || `Failed to ${action}`);
        }
    };

    const filteredApprovals = approvals.filter(app => {
        if (activeTab !== 'ALL' && app.type !== activeTab) return false;
        if (search) {
          const searchLower = search.toLowerCase();
          const name = (app.customer?.fullName || app.customerName || '').toLowerCase();
          const nic = (app.customer?.nicNumber || app.nic || '').toLowerCase();
          const ref = (app.referenceId || '').toLowerCase();
          return name.includes(searchLower) || nic.includes(searchLower) || ref.includes(searchLower);
        }
        return true;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Action Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Pending Queue</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{stats.pending}</h3>
                </div>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Approved Today</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{stats.approvedToday}</h3>
                </div>
                <div className="card" style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Rejected Today</p>
                    <h3 style={{ fontSize: '24px', fontWeight: '800' }}>{stats.rejectedToday}</h3>
                </div>
            </div>

            {/* View Switcher Tabs */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
                <button 
                  onClick={() => setActiveView('pending')}
                  style={{
                    padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                    border: 'none', background: 'none', position: 'relative',
                    color: activeView === 'pending' ? '#0f172a' : '#94a3b8'
                  }}
                >
                  Actionable Applications
                  {activeView === 'pending' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: '#0f172a', borderRadius: '3px 3px 0 0' }}></div>}
                </button>
                <button 
                  onClick={() => setActiveView('history')}
                  style={{
                    padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                    border: 'none', background: 'none', position: 'relative',
                    color: activeView === 'history' ? '#0f172a' : '#94a3b8'
                  }}
                >
                  Customer Approval History
                  {activeView === 'history' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', backgroundColor: '#0f172a', borderRadius: '3px 3px 0 0' }}></div>}
                </button>
            </div>

            {/* Top Toolbar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['ALL', 'REGISTRATION', 'KYC', 'PLAN_ACTIVATION'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: activeTab === tab ? 'white' : '#64748b',
                                backgroundColor: activeTab === tab ? '#0f172a' : 'transparent',
                                transition: 'all 0.2s ease',
                                border: `1px solid ${activeTab === tab ? '#0f172a' : 'transparent'}`,
                            }}
                        >
                            {tab.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Find application..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                padding: '10px 16px 10px 40px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '14px',
                                backgroundColor: '#f8fafc',
                                width: '240px'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{activeView === 'pending' ? 'Verification Pipeline' : 'Archived Verifications'}</h2>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>{activeView === 'pending' ? 'Manage incoming customer requests and due diligence' : 'Review past registration outcomes and compliance audits'}</p>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Customer Details</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{activeView === 'pending' ? 'Type' : 'Reference'}</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{activeView === 'pending' ? 'Submission Date' : 'Completed On'}</th>
                                <th style={{ textAlign: 'left', padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ textAlign: 'right', padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Analyzing verification pipeline...</td>
                                </tr>
                            ) : filteredApprovals.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{activeView === 'pending' ? 'All requests processed. No pending items.' : 'No historical data available.'}</td>
                                </tr>
                            ) : filteredApprovals.map((app) => (
                                <tr key={app._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '10px',
                                                backgroundColor: '#f1f5f9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#0f172a'
                                            }}>
                                                <UserCheck size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{app.customer?.fullName || app.customerName || 'N/A'}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>{app.customerEmail || app.customer?.email || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600' }}>{activeView === 'pending' ? app.type : app.referenceId}</div>
                                        {activeView === 'history' && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{app.branch || 'Online'}</div>}
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontSize: '14px', color: '#475569' }}>{new Date(activeView === 'pending' ? app.createdAt : app.completedAt).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(activeView === 'pending' ? app.createdAt : app.completedAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            backgroundColor: app.status === 'APPROVED' ? '#ecfdf5' : app.status === 'REJECTED' ? '#fef2f2' : '#f1f5f9',
                                            color: app.status === 'APPROVED' ? '#059669' : app.status === 'REJECTED' ? '#dc2626' : '#475569',
                                            textTransform: 'uppercase'
                                        }}>
                                            {app.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            {activeView === 'pending' ? (
                                                <>
                                                    <button 
                                                      onClick={() => handleAction(app._id, 'approve')}
                                                      style={{
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#ecfdf5',
                                                        color: '#059669',
                                                        border: '1px solid #d1fae5'
                                                      }}>
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                    <button 
                                                      onClick={() => handleAction(app._id, 'reject')}
                                                      style={{
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#fef2f2',
                                                        color: '#dc2626',
                                                        border: '1px solid #fee2e2'
                                                      }}>
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            ) : null}
                                            <button style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                backgroundColor: '#f8fafc',
                                                color: '#64748b',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                {activeView === 'pending' ? <ChevronRight size={18} /> : <ExternalLink size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Placeholder */}
                <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Showing <b>{filteredApprovals.length}</b> of <b>{approvals.length}</b> records</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button disabled style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', color: '#cbd5e1', fontSize: '12px', fontWeight: '600' }}>Prev</button>
                        <button disabled style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', color: '#cbd5e1', fontSize: '12px', fontWeight: '600' }}>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Approvals;
