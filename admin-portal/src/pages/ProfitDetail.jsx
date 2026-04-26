import { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  User, Wallet, Landmark, TrendingUp, History,
  ShieldCheck, Loader2, FileText, Download,
  ExternalLink, Calendar, Info, RefreshCw,
  MoreVertical, CheckSquare, PieChart
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { profitService } from '../services/api/adminProfit';

const ProfitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await profitService.getPayoutDetail(id);
        if (res.success) {
          setData(res.data);
        } else {
          setError('Failed to fetch detail');
        }
      } catch (err) {
        setError(err.message || 'Error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleAction = (status) => {
    // Only placeholder for now
    alert(`Profit actions not fully implemented for this cycle type yet.`);
  };

  if (loading) return <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}><Loader2 size={32} className="animate-spin text-primary" /></div>;
  if (error || !data) return <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}><AlertTriangle size={48} style={{ margin: '0 auto 16px' }} /><p>{error || 'Not Found'}</p></div>;

  const log = data;
  const investment = log.investmentId || {};
  const plan = investment.planId || {};
  const customer = log.customerId || {};
  const formattedInvestment = `LKR ${investment.investedAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`;
  const formattedPayout = `LKR ${log.amountCalculated?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/monthly-profit')}
          style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>Profit Cycle Audit: #{id.substring(id.length - 6).toUpperCase()}</h1>
            <span className="badge badge-warning">{log.status}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{plan.title || 'Unknown Plan'} • Customer: {customer.fullName || 'Unknown'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Plan Summary & Full Schedule */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
             {/* Plan Details Card */}
             <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="var(--primary)" />
                  Investment Plan Summary
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {[
                    { label: 'Customer Name', value: customer.fullName || 'Unknown' },
                    { label: 'Total Investment', value: formattedInvestment },
                    { label: 'Plan Level', value: plan.title || 'Unknown' },
                    { label: 'Annual ROI %', value: `${plan.interestRate || 0}% Fixed` },
                    { label: 'Calculated Date', value: new Date(log.createdAt).toLocaleDateString(), highlight: true },
                    { label: 'Monthly Payout', value: formattedPayout, highlight: true },
                  ].map((item, i) => (
                    <div key={i}>
                      <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>{item.label}</p>
                      <p style={{ fontSize: item.highlight ? '15px' : '14px', fontWeight: '700', color: item.highlight ? 'var(--primary)' : 'var(--text-main)' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
             </div>

             {/* Destination Card */}
             <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {log.profitDestination === 'WALLET' ? <Wallet size={18} color="#059669" /> : <Landmark size={18} color="#3b82f6" />}
                  Payout Destination
                </h3>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: log.profitDestination === 'WALLET' ? '#ecfdf5' : '#eff6ff', border: log.profitDestination === 'WALLET' ? '1px solid #a7f3d0' : '1px solid #bfdbfe', display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      {log.profitDestination === 'WALLET' ? <Wallet size={24} color="#059669" /> : <Landmark size={24} color="#3b82f6" />}
                   </div>
                   <div>
                      <p style={{ fontSize: '14px', fontWeight: '800', color: log.profitDestination === 'WALLET' ? '#065f46' : '#1e3a8a' }}>{log.profitDestination === 'WALLET' ? 'Internal Wallet' : 'Bank Transfer'}</p>
                      <p style={{ fontSize: '11px', color: log.profitDestination === 'WALLET' ? '#047857' : '#1e40af', fontWeight: '600' }}>{log.profitDestination === 'WALLET' ? 'Instant Credit' : 'Logged for Processing'}</p>
                   </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Payout Rules</p>
                   <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>{log.profitDestination === 'WALLET' ? 'Automatically credited via WalletTx' : 'Automatic Bank Log Creation on Due Date'}</li>
                      <li style={{ fontSize: '12px', color: '#475569', fontWeight: '600' }}>{log.profitDestination === 'WALLET' ? 'No Bank Action Required' : 'Manual Reconciliation Required for Bank Payouts'}</li>
                   </ul>
                </div>
             </div>
          </div>

          {/* Full Cycle Logging */}
          <div className="card">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Target Log Details</h3>
                <button className="badge badge-info" style={{ border: 'none', cursor: 'pointer' }}>Download Profit Statement</button>
             </div>
             <div style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ backgroundColor: '#f8fafc' }}>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '14px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>CYCLE MONTH</th>
                        <th style={{ textAlign: 'left', padding: '14px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>PROCESSED ON</th>
                        <th style={{ textAlign: 'left', padding: '14px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>AMOUNT</th>
                        <th style={{ textAlign: 'left', padding: '14px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>TRANSACTION ID</th>
                        <th style={{ textAlign: 'right', padding: '14px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>STATUS</th>
                      </tr>
                   </thead>
                   <tbody>
                      <tr style={{ borderTop: '1px solid #f1f5f9' }}>
                         <td style={{ padding: '14px', fontSize: '13px', fontWeight: '700' }}>{log.cycleMonth}</td>
                         <td style={{ padding: '14px', fontSize: '13px', color: '#64748b' }}>{new Date(log.createdAt).toLocaleString()}</td>
                         <td style={{ padding: '14px', fontSize: '13px', fontWeight: '700', color: '#166534' }}>{formattedPayout}</td>
                         <td style={{ padding: '14px', fontSize: '12px', color: '#3b82f6', fontWeight: '700', fontFamily: 'monospace' }}>{log.transactionId || 'N/A'}</td>
                         <td style={{ padding: '14px', textAlign: 'right' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: log.status === 'COMPLETED' ? '#059669' : '#b91c1c', backgroundColor: log.status === 'COMPLETED' ? '#ecfdf5' : '#fef2f2', padding: '2px 8px', borderRadius: '4px' }}>{log.status}</span>
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Right Column: Actions & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>
           
           <div className="card" style={{ backgroundColor: '#f8fafc' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Cycle Operations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 {log.status === 'FAILED' && (
                   <button 
                     onClick={() => handleAction('Retried')}
                     style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                   >
                      <RefreshCw size={16} /> Retry Failed Transaction
                   </button>
                 )}
                 {log.status === 'PENDING' && (
                   <button 
                     onClick={() => handleAction('Manually Credited')}
                     style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                   >
                      <CheckSquare size={16} /> Mark Bank Payout Done
                   </button>
                 )}
                 <button 
                   style={{ width: '100%', padding: '12px', borderRadius: '10px', backgroundColor: 'var(--primary)', color: 'white', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.5, cursor: 'not-allowed' }}
                 >
                    <FileText size={18} /> View Payout Vouchers
                 </button>
              </div>
           </div>

           <div className="card" style={{ border: '1px solid #8b5cf620' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PieChart size={18} color="#8b5cf6" />
                Remaining Earnings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Profit Already Paid</p>
                    <p style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>LKR {investment.totalProfitEarned?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}</p>
                 </div>
                 <div style={{ padding: '1px', backgroundColor: '#f1f5f9', borderRadius: '2px' }}>
                    <div style={{ width: '12%', height: '8px', backgroundColor: '#8b5cf6', borderRadius: '2px' }}></div>
                 </div>
                 <div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Current Plan Status</p>
                    <p style={{ fontSize: '18px', fontWeight: '800', color: '#6d28d9' }}>{investment.status}</p>
                    <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>Since {new Date(investment.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>
           </div>

           {log.status === 'PENDING' && log.profitDestination === 'BANK' && (
             <div style={{ display: 'flex', gap: '8px', padding: '12px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa' }}>
                <AlertTriangle size={16} color="#c2410c" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '11px', color: '#9a3412', fontWeight: '600' }}>
                   Manual 'Mark Done' action should only be used after confirming funds have left the corporate bank account.
                </p>
             </div>
           )}
        </div>
      </div>

    </div>
  );
};

export default ProfitDetail;
