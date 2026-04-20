import { useState, useEffect } from 'react';
import { 
  Users, Wallet, Clock, TrendingUp, Landmark, FileCheck, ArrowUpRight, ArrowDownRight, 
  Zap, Building2, PieChart, History, CheckCircle, ShieldCheck, XCircle, CreditCard, MessageSquare
} from 'lucide-react';
import { dashboardService } from '../services/api/adminDashboard';
import { approvalsService } from '../services/api/adminApprovals';
import { depositsService } from '../services/api/adminDeposits';
import { withdrawalsService } from '../services/api/adminWithdrawals';
import { plansService } from '../services/api/adminPlans';
import { inquiriesService } from '../services/api/adminInquiries';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    metrics: null,
    approvals: [],
    deposits: [],
    withdrawals: [],
    investments: [],
    inquiries: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          metricsRes, 
          approvalsRes, 
          depositsRes, 
          withdrawalsRes,
          investmentsRes,
          inquiriesRes
        ] = await Promise.all([
          dashboardService.getMetrics().catch(() => ({ success: false, data: {} })),
          approvalsService.getPendingApprovals().catch(() => ({ success: false, data: [] })),
          depositsService.getDepositRequests().catch(() => ({ success: false, data: [] })),
          withdrawalsService.getWithdrawalRequests().catch(() => ({ success: false, data: [] })),
          plansService.getAllInvestments().catch(() => ({ success: false, data: [] })),
          inquiriesService.getAll().catch(() => ({ success: false, data: [] }))
        ]);

        setData({
          metrics: metricsRes.success ? metricsRes.data : {},
          approvals: approvalsRes.success ? (approvalsRes.data?.approvals || []) : [],
          deposits: depositsRes.success ? (depositsRes.data || []) : [],
          withdrawals: withdrawalsRes.success ? (withdrawalsRes.data || []) : [],
          investments: investmentsRes.success ? (investmentsRes.data || []) : [],
          inquiries: inquiriesRes.success ? (inquiriesRes.data || []) : []
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="card" style={{ height: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Aggregating Live Financial Data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <XCircle size={48} style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Systems Sync Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  const { metrics, approvals, deposits, withdrawals, investments } = data;
  
  const pendingDeposits = deposits.filter(d => ['PENDING', 'UNDER_REVIEW'].includes(d.status));
  const pendingWithdrawals = withdrawals.filter(w => ['PENDING', 'PROCESSING'].includes(w.status));
  const pendingInvestments = investments.filter(inv => inv.status === 'PENDING');

  const summaryStats = [
    { title: 'Total Customers', value: metrics?.totalCustomers || 0, icon: <Users size={20} />, color: '#3b82f6' },
    { title: 'Active Plans', value: metrics?.activePlans || 0, icon: <FileCheck size={20} />, color: '#10b981' },
    { title: 'Cust. Approvals', value: approvals.length, icon: <Clock size={20} />, color: '#f59e0b', status: 'Pending' },
    { title: 'Pending Deposits', value: pendingDeposits.length, icon: <Wallet size={20} />, color: '#f59e0b', status: 'Pending' },
    { title: 'Plan Activations', value: pendingInvestments.length, icon: <Zap size={20} />, color: '#6366f1', status: 'Pending' },
    { title: 'Withdrawals', value: pendingWithdrawals.length, icon: <ArrowUpRight size={20} />, color: '#ef4444', status: 'Pending' },
    { title: 'Total Volume', value: `LKR ${((metrics?.totalInvestmentVolume || 0) / 1000).toFixed(1)}k`, icon: <CreditCard size={20} />, color: '#0f172a' },
    { title: 'New Inquiries', value: data.inquiries.filter(q => q.status === 'NEW').length, icon: <MessageSquare size={20} />, color: '#ec4899', status: 'New' }
  ];

  // Map pending queues for the list
  const approvalQueues = [
    ...approvals.slice(0, 2).map(a => ({ 
      id: a._id.slice(-6).toUpperCase(), type: a.type || 'Registration', 
      name: a.customer?.fullName || 'N/A', branch: 'Online', time: 'Pending', status: 'Pending' 
    })),
    ...pendingDeposits.slice(0, 2).map(d => ({ 
      id: d._id.slice(-6).toUpperCase(), type: 'Deposit', 
      name: d.customerId?.name || d.customerId?.fullName || 'N/A', branch: 'Online', 
      time: `LKR ${d.amount}`, status: d.status === 'UNDER_REVIEW' ? 'Reviewing' : 'Pending' 
    }))
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Review New Customers', color: '#3b82f6' },
          { label: 'Approve Deposits', color: '#10b981' },
          { label: 'Review Plan Requests', color: '#6366f1' },
          { label: 'Complete Withdrawals', color: '#ef4444' }
        ].map((action, i) => (
          <button key={i} className="card" style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px', cursor: 'pointer',
            border: `1px solid ${action.color}20`, backgroundColor: 'white'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: action.color }}></div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Summary Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {summaryStats.map((stat, i) => (
          <div key={i} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px', 
                backgroundColor: `${stat.color}10`, color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              {stat.status && (
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: stat.color === '#f59e0b' ? '#d97706' : stat.color, backgroundColor: `${stat.color}15`, padding: '2px 8px', borderRadius: '4px' }}>
                  {stat.status}
                </span>
              )}
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '4px' }}>{stat.title}</p>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} style={{ color: 'var(--primary)' }} /> Pending Queues Summary
          </h3>
          <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>TYPE</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>ENTITY</th>
                  <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>INFO</th>
                  <th style={{ textAlign: 'center', padding: '14px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {approvalQueues.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>No pending requests</td></tr>
                ) : approvalQueues.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: '700' }}>{item.id}</td>
                    <td style={{ padding: '16px', fontSize: '13px' }}>{item.type}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>{item.time}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span className="badge badge-warning" style={{ fontSize: '10px' }}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ backgroundColor: '#0f172a', color: 'white' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={18} style={{ color: 'var(--primary)' }} />
              Financial Liquidity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>Total Investments</span>
                <span style={{ fontSize: '14px', fontWeight: '700' }}>LKR {metrics?.totalInvestmentVolume || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} style={{ color: '#ec4899' }} />
              Recent Inquiries
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {data.inquiries.length === 0 ? (
                 <div style={{ fontSize: '12px', color: '#64748b' }}>No recent inquiries.</div>
               ) : (
                 data.inquiries.slice(0, 5).map((q, idx) => (
                   <div key={idx} style={{ 
                     padding: '10px', 
                     borderRadius: '8px',
                     background: q.status === 'NEW' ? 'rgba(236, 72, 153, 0.05)' : 'transparent',
                     border: q.status === 'NEW' ? '1px solid rgba(236, 72, 153, 0.1)' : '1px solid #f1f5f9'
                   }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '13px' }}>{q.name}</strong>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{new Date(q.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.message}</p>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
