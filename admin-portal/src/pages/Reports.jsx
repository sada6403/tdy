import { useState } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, Download, Calendar, 
  Filter, Search, Users, Wallet, Landmark, Zap, 
  ArrowUpRight, ArrowDownRight, Building2, FileText,
  ChevronDown, ExternalLink
} from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('finance'); // 'finance', 'customers', 'investments'

  const financeData = {
    totalDeposits: 'LKR 84.5M',
    totalWithdrawals: 'LKR 12.2M',
    activeInvestments: 'LKR 214.8M',
    monthlyProfitPaid: 'LKR 8.4M',
    pendingPayouts: 'LKR 1.2M'
  };

  const branchWiseCustomers = [
    { name: 'Colombo Main', total: 1240, approved: 1100, rejected: 140 },
    { name: 'Gampaha Branch', total: 850, approved: 780, rejected: 70 },
    { name: 'Kandy Central', total: 720, approved: 680, rejected: 40 },
    { name: 'Galle Coastal', total: 640, approved: 590, rejected: 50 },
  ];

  const planWiseTotals = [
    { name: 'Platinum Growth', active: 142, matured: 12, completed: 8, total: 'LKR 112M' },
    { name: 'Gold Saver', active: 218, matured: 45, completed: 30, total: 'LKR 65M' },
    { name: 'Silver Plus', active: 110, matured: 88, completed: 72, total: 'LKR 37.8M' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Analytical Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Comprehensive financial and operational performance intelligence for the plantation network.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', backgroundColor: 'white' }}>
            <Calendar size={18} /> Last 30 Days <ChevronDown size={14} />
          </button>
          <button className="btn-primary">
            <Download size={18} /> Export PDF/CSV
          </button>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="card" style={{ padding: '6px', backgroundColor: '#f1f5f9', display: 'inline-flex', gap: '4px', width: 'fit-content' }}>
         <button onClick={() => setActiveTab('finance')} style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: activeTab === 'finance' ? 'white' : 'transparent', color: activeTab === 'finance' ? 'var(--primary)' : '#64748b', fontSize: '14px', fontWeight: '800', boxShadow: activeTab === 'finance' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
            Financial Performance
         </button>
         <button onClick={() => setActiveTab('customers')} style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: activeTab === 'customers' ? 'white' : 'transparent', color: activeTab === 'customers' ? 'var(--primary)' : '#64748b', fontSize: '14px', fontWeight: '800', boxShadow: activeTab === 'customers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
            Customer Analytics
         </button>
         <button onClick={() => setActiveTab('investments')} style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: activeTab === 'investments' ? 'white' : 'transparent', color: activeTab === 'investments' ? 'var(--primary)' : '#64748b', fontSize: '14px', fontWeight: '800', boxShadow: activeTab === 'investments' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}>
            Investment Portfolio
         </button>
      </div>

      {activeTab === 'finance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {[
                { label: 'Total Deposits', value: financeData.totalDeposits, icon: <ArrowDownRight />, color: '#10b981' },
                { label: 'Total Withdrawals', value: financeData.totalWithdrawals, icon: <ArrowUpRight />, color: '#ef4444' },
                { label: 'Active Capital', value: financeData.activeInvestments, icon: <Wallet />, color: 'var(--primary)' },
                { label: 'Profit Paid', value: financeData.monthlyProfitPaid, icon: <TrendingUp />, color: '#8b5cf6' },
                { label: 'Pending Payouts', value: financeData.pendingPayouts, icon: <FileText />, color: '#f59e0b' },
              ].map((item, i) => (
                <div key={i} className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                   </div>
                   <div>
                      <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>{item.label}</p>
                      <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{item.value}</p>
                   </div>
                </div>
              ))}
           </div>
           
           <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>Financial Volume Trends</h3>
              <div style={{ width: '100%', height: '300px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <BarChart3 size={48} color="#94a3b8" />
                 <p style={{ marginLeft: '12px', color: '#94a3b8', fontWeight: '600' }}>[ Financial Trends Visualization ]</p>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) 1fr', gap: '24px' }}>
           <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Branch-wise Customer Distribution</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                       <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>BRANCH NAME</th>
                       <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>TOTAL</th>
                       <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>APPROVED</th>
                       <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>REJECTED</th>
                    </tr>
                 </thead>
                 <tbody>
                    {branchWiseCustomers.map((br, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                         <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700' }}>{br.name}</td>
                         <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{br.total}</td>
                         <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#059669' }}>{br.approved}</td>
                         <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#dc2626' }}>{br.rejected}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           
           <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>KYC Completion Ratio</h3>
              <div style={{ height: '240px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                 <PieChart size={64} color="#94a3b8" />
                 <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>88.4%</p>
                    <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Verified Customers</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'investments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Plan-wise Investment Maturity Report</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                       <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>PLAN LEVEL</th>
                       <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>ACTIVE</th>
                       <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>MATURED</th>
                       <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>COMPLETED</th>
                       <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>PORTFOLIO VALUE</th>
                    </tr>
                 </thead>
                 <tbody>
                    {planWiseTotals.map((plan, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                         <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{plan.name}</td>
                         <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800' }}>{plan.active}</td>
                         <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#f59e0b' }}>{plan.matured}</td>
                         <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#64748b' }}>{plan.completed}</td>
                         <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '800', color: '#166534' }}>{plan.total}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

    </div>
  );
};

export default Reports;
