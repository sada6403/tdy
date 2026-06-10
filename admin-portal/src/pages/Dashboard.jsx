import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Wallet, Clock, TrendingUp, Zap, ArrowUpRight,
  CreditCard, MessageSquare, CheckCircle2, XCircle,
  ShieldCheck, BarChart2, Activity, ArrowRight, Loader2,
  Building2, FileCheck
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { dashboardService } from '../services/api/adminDashboard';
import { approvalsService } from '../services/api/adminApprovals';
import { depositsService } from '../services/api/adminDeposits';
import { withdrawalsService } from '../services/api/adminWithdrawals';
import { plansService } from '../services/api/adminPlans';
import { inquiriesService } from '../services/api/adminInquiries';

const fmtLKR = (n) => {
  if (!n) return 'LKR 0';
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `LKR ${(n / 1_000).toFixed(0)}K`;
  return `LKR ${n.toLocaleString()}`;
};

const monthLabel = (m) => {
  if (!m) return '';
  const [y, mo] = m.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(mo) - 1]} ${y?.slice(2)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '13px', fontWeight: '800', color: p.color, margin: '2px 0' }}>
          {p.name}: {fmtLKR(p.value)}
        </p>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ metrics: {}, approvals: [], deposits: [], withdrawals: [], investments: [], inquiries: [] });

  useEffect(() => {
    const load = async () => {
      const [metricsRes, approvalsRes, depositsRes, withdrawalsRes, investmentsRes, inquiriesRes] = await Promise.allSettled([
        dashboardService.getMetrics(),
        approvalsService.getPendingApprovals(),
        depositsService.getDepositRequests(),
        withdrawalsService.getWithdrawalRequests(),
        plansService.getAllInvestments(),
        inquiriesService.getAll()
      ]);
      setData({
        metrics: metricsRes.status === 'fulfilled' && metricsRes.value?.success ? metricsRes.value.data : {},
        approvals: approvalsRes.status === 'fulfilled' && approvalsRes.value?.success ? (approvalsRes.value.data?.approvals || []) : [],
        deposits: depositsRes.status === 'fulfilled' && depositsRes.value?.success ? (depositsRes.value.data || []) : [],
        withdrawals: withdrawalsRes.status === 'fulfilled' && withdrawalsRes.value?.success ? (withdrawalsRes.value.data || []) : [],
        investments: investmentsRes.status === 'fulfilled' && investmentsRes.value?.success ? (investmentsRes.value.data || []) : [],
        inquiries: inquiriesRes.status === 'fulfilled' && inquiriesRes.value?.success ? (inquiriesRes.value.data || []) : [],
      });
      setLoading(false);
    };
    load();
  }, []);

  const { metrics, approvals, deposits, withdrawals, investments, inquiries } = data;

  const pendingDeposits = deposits.filter(d => ['PENDING', 'UNDER_REVIEW'].includes(d.status));
  const pendingWithdrawals = withdrawals.filter(w => ['PENDING', 'PROCESSING'].includes(w.status));
  const pendingPlans = investments.filter(i => i.status === 'PENDING_ACTIVATION_APPROVAL');
  const newInquiries = inquiries.filter(q => q.status === 'NEW');

  // Build chart data from metrics
  const growthData = (metrics?.chartData?.investmentGrowth || []).map(d => ({
    month: monthLabel(d.month),
    investments: d.total,
    profit: metrics?.chartData?.monthlyProfit?.find(p => p.month === d.month)?.total || 0
  }));

  const kpis = [
    { title: 'Total Customers', value: metrics?.totalCustomers ?? '—', icon: <Users size={20} />, color: '#3b82f6', bg: '#eff6ff', sub: 'Registered accounts', path: '/customers' },
    { title: 'Active Capital', value: fmtLKR(metrics?.totalInvestmentVolume), icon: <TrendingUp size={20} />, color: '#10b981', bg: '#ecfdf5', sub: 'Investments under management', path: '/plan-activations' },
    { title: 'Customer Approvals', value: approvals.length, icon: <ShieldCheck size={20} />, color: '#f59e0b', bg: '#fffbeb', sub: 'Pending review', badge: approvals.length > 0, path: '/customer-approvals' },
    { title: 'Pending Deposits', value: pendingDeposits.length, icon: <Wallet size={20} />, color: '#6366f1', bg: '#eef2ff', sub: 'Awaiting approval', badge: pendingDeposits.length > 0, path: '/deposits' },
    { title: 'Plan Activations', value: pendingPlans.length, icon: <Zap size={20} />, color: '#8b5cf6', bg: '#f5f3ff', sub: 'Pending activation', badge: pendingPlans.length > 0, path: '/plan-activations' },
    { title: 'Withdrawals', value: pendingWithdrawals.length, icon: <ArrowUpRight size={20} />, color: '#ef4444', bg: '#fef2f2', sub: 'Pending processing', badge: pendingWithdrawals.length > 0, path: '/withdrawals' },
    { title: 'Active Plans', value: metrics?.activePlans ?? '—', icon: <FileCheck size={20} />, color: '#0ea5e9', bg: '#f0f9ff', sub: 'Investment plan models', path: '/investment-plans' },
    { title: 'New Inquiries', value: newInquiries.length, icon: <MessageSquare size={20} />, color: '#ec4899', bg: '#fdf2f8', sub: 'Unread messages', badge: newInquiries.length > 0, path: '/customer-support' },
  ];

  const quickActions = [
    { label: 'Review Customers', color: '#3b82f6', count: approvals.length, path: '/customer-approvals' },
    { label: 'Approve Deposits', color: '#10b981', count: pendingDeposits.length, path: '/deposits' },
    { label: 'Plan Requests', color: '#8b5cf6', count: pendingPlans.length, path: '/plan-activations' },
    { label: 'Withdrawals', color: '#ef4444', count: pendingWithdrawals.length, path: '/withdrawals' },
  ];

  const recentActivity = [
    ...approvals.slice(0, 3).map(a => ({ id: a._id?.slice(-5).toUpperCase(), type: 'Approval', name: a.customer?.fullName || 'Customer', amount: null, status: 'PENDING', color: '#f59e0b' })),
    ...pendingDeposits.slice(0, 3).map(d => ({ id: d._id?.slice(-5).toUpperCase(), type: 'Deposit', name: d.customerId?.name || 'Customer', amount: d.amount, status: d.status, color: '#6366f1' })),
    ...pendingWithdrawals.slice(0, 2).map(w => ({ id: w._id?.slice(-5).toUpperCase(), type: 'Withdrawal', name: w.customerId?.name || 'Customer', amount: w.amount, status: w.status, color: '#ef4444' })),
  ].slice(0, 6);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '16px' }}>
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      <p style={{ fontWeight: '600', color: '#64748b' }}>Loading dashboard...</p>
    </div>
  );

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '3px' }}>{today}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {quickActions.map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)} className="card"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', border: `1px solid ${a.color}25`, cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: a.color }} />
              {a.label}
              {a.count > 0 && <span style={{ minWidth: '18px', height: '18px', padding: '0 4px', borderRadius: '10px', backgroundColor: a.color, color: 'white', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{a.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {kpis.map((kpi, i) => (
          <div key={i} onClick={() => navigate(kpi.path)} className="card"
            style={{ padding: '20px', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', position: 'relative', overflow: 'hidden' }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', borderRadius: '0 0 0 80px', backgroundColor: `${kpi.color}08`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: kpi.bg, color: kpi.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {kpi.icon}
              </div>
              {kpi.badge && kpi.value > 0 && (
                <span style={{ fontSize: '10px', fontWeight: '800', color: kpi.color, backgroundColor: kpi.bg, padding: '3px 8px', borderRadius: '20px', border: `1px solid ${kpi.color}30` }}>
                  ACTION
                </span>
              )}
            </div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{kpi.title}</p>
            <h3 style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', fontFamily: 'var(--font-display)', lineHeight: 1 }}>{kpi.value}</h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: '600' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>

        {/* Investment Growth Area Chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Investment Growth</h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Last 6 months capital deployed</p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '3px', borderRadius: '2px', backgroundColor: '#10b981' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Investments</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '3px', borderRadius: '2px', backgroundColor: '#6366f1' }} />
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>Profit Paid</span>
              </div>
            </div>
          </div>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={growthData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gInv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="investments" name="Investments" stroke="#10b981" strokeWidth={2.5} fill="url(#gInv)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="profit" name="Profit Paid" stroke="#6366f1" strokeWidth={2.5} fill="url(#gProfit)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: '10px', gap: '8px' }}>
              <BarChart2 size={28} color="#cbd5e1" />
              <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>No chart data yet</p>
            </div>
          )}
        </div>

        {/* Financial Summary */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Financial Snapshot</h3>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>Current portfolio at a glance</p>

          {/* Big number */}
          <div style={{ padding: '20px', borderRadius: '14px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)' }} />
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>Total Active Capital</p>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'white', fontFamily: 'var(--font-display)' }}>{fmtLKR(metrics?.totalInvestmentVolume)}</h2>
            <p style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', marginTop: '6px' }}>Under management</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              { label: 'Pending Payouts', value: fmtLKR(metrics?.pendingPayouts), color: '#f59e0b', dot: '#f59e0b' },
              { label: 'Total Customers', value: metrics?.totalCustomers ?? 0, color: '#3b82f6', dot: '#3b82f6' },
              { label: 'Active Plans', value: metrics?.activePlans ?? 0, color: '#10b981', dot: '#10b981' },
              { label: 'New Inquiries', value: newInquiries.length, color: '#ec4899', dot: '#ec4899' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: row.dot }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{row.label}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>

        {/* Pending Queue */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Pending Queue</h3>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{recentActivity.length} items</span>
          </div>
          {recentActivity.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <CheckCircle2 size={32} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontWeight: '700', color: '#10b981', fontSize: '14px' }}>All clear — no pending requests</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '12px 12px', fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>TYPE</th>
                  <th style={{ textAlign: 'left', padding: '12px 12px', fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>CUSTOMER</th>
                  <th style={{ textAlign: 'right', padding: '12px 24px', fontSize: '10px', fontWeight: '800', color: '#94a3b8' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '13px 24px', fontSize: '12px', fontWeight: '800', color: '#94a3b8', fontFamily: 'monospace' }}>#{item.id}</td>
                    <td style={{ padding: '13px 12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: item.color, backgroundColor: `${item.color}15`, padding: '3px 8px', borderRadius: '6px' }}>{item.type}</span>
                    </td>
                    <td style={{ padding: '13px 12px', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{item.name}</td>
                    <td style={{ padding: '13px 24px', textAlign: 'right', fontSize: '13px', fontWeight: '800', color: item.amount ? '#059669' : '#94a3b8' }}>
                      {item.amount ? fmtLKR(item.amount) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right panel: System health + Recent inquiries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* System Status */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="var(--primary)" /> System Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Payment Engine', status: 'Operational' },
                { label: 'Customer Portal', status: 'Operational' },
                { label: 'Profit Engine', status: 'Scheduled' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>{s.label}</span>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: s.status === 'Operational' ? '#10b981' : '#f59e0b', backgroundColor: s.status === 'Operational' ? '#ecfdf5' : '#fffbeb', padding: '3px 8px', borderRadius: '10px' }}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Inquiries */}
          <div className="card" style={{ padding: '20px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Recent Inquiries</h3>
              <button onClick={() => navigate('/customer-support')} style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View all <ArrowRight size={12} />
              </button>
            </div>
            {newInquiries.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600', textAlign: 'center', padding: '20px 0' }}>No new inquiries</p>
            ) : newInquiries.slice(0, 3).map((inq, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 0', borderBottom: i < 2 ? '1px solid #f8fafc' : 'none' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={14} color="#ec4899" />
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>{inq.name || 'Anonymous'}</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{inq.message || inq.subject || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
