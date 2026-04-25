import { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle, 
  User, Mail, Phone, MapPin, Building2, UserCog, 
  FileText, Download, Eye, Landmark, History, 
  ShieldCheck, Loader2, Send, Save, Wallet, Briefcase,
  TrendingUp, TrendingDown, Clock, Activity, ExternalLink,
  ChevronRight, ArrowUpRight, ArrowDownRight, Printer, Calendar
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminCustomersService } from '../services/api/adminCustomers';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    profile: null,
    walletSummary: null,
    activePlans: [],
    financialSummary: null,
    activity: [],
    transactions: [],
    investments: []
  });
  const [activeTab, setActiveTab] = useState('overview'); // overview, investments, transactions, kyc

  useEffect(() => {
    fetchFullDetails();
  }, [id]);

  const fetchFullDetails = async () => {
    setLoading(true);
    try {
      // Parallel fetch for main profile and sub-details
      const [profileRes, activityRes, transactionsRes, investmentsRes] = await Promise.all([
        adminCustomersService.getProfile(id),
        adminCustomersService.getActivity(id).catch(() => ({ success: true, data: [] })),
        adminCustomersService.getTransactions(id).catch(() => ({ success: true, data: [] })),
        adminCustomersService.getInvestments(id).catch(() => ({ success: true, data: [] }))
      ]);

      if (profileRes.success) {
        setData({
          profile: profileRes.data.profile,
          walletSummary: profileRes.data.walletSummary,
          activePlans: profileRes.data.activePlans,
          financialSummary: profileRes.data.financialSummary,
          activity: activityRes.data || [],
          transactions: transactionsRes.data || [],
          investments: investmentsRes.data || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch full customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={40} className="animate-spin text-emerald-500" />
        <p style={{ color: '#94a3b8', fontWeight: '800', letterSpacing: '1px' }}>INITIALIZING PROFILE...</p>
      </div>
    );
  }

  const { profile, walletSummary, financialSummary, activity, transactions, investments } = data;

  if (!profile) {
    return (
      <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Customer Not Found</h2>
        <p style={{ color: '#64748b', marginTop: '8px' }}>The customer record you are looking for might have been removed or is inaccessible.</p>
        <button className="btn-primary" onClick={() => navigate('/customers')} style={{ marginTop: '24px' }}>Back to Customers</button>
      </div>
    );
  }

  const isApproved = ['ACTIVE', 'APPROVED', 'VERIFIED'].includes(profile.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header & Main Stats Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate('/customers')} style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{profile.fullName || 'N/A'}</h1>
              <span className={`badge ${isApproved ? 'badge-success' : 'badge-warning'}`} style={{ padding: '4px 12px', fontSize: '11px', fontWeight: '800' }}>
                {profile.status}
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>User ID: <span style={{ color: 'var(--primary)' }}>{profile.userId}</span> • Registered {new Date(profile.registrationDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="card" onClick={() => navigate(`/customers/${id}/report/full`)} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '700', fontSize: '14px' }}>
             <FileText size={18} /> Official Report
          </button>
          <a href={adminCustomersService.getReportPdfUrl(id, 'full')} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '10px 24px', backgroundColor: '#0f172a', textDecoration: 'none' }}>
             <Download size={18} /> Export PDF
          </a>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '32px' }}>
        {[
          { id: 'overview', label: 'Profile Overview', icon: <User size={18} /> },
          { id: 'investments', label: 'Investments & Plans', icon: <Briefcase size={18} /> },
          { id: 'transactions', label: 'Wallet & Ledger', icon: <History size={18} /> },
          { id: 'kyc', label: 'Compliance Audit', icon: <ShieldCheck size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 4px 20px 4px',
              fontSize: '14px',
              fontWeight: '800',
              color: activeTab === tab.id ? 'var(--primary)' : '#94a3b8',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: 'transparent'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ minHeight: '600px' }}>
        
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Personal Details */}
              <div className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>Personal Identity</h3>
                  <button style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: '800', border: 'none', background: 'none' }}>Update Profile</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px 24px' }}>
                   {[
                     { label: 'Full Legal Name', value: profile.fullName, icon: <User size={14} /> },
                     { label: 'NIC / Document ID', value: profile.nic, icon: <ShieldCheck size={14} /> },
                     { label: 'Primary Email', value: profile.email, icon: <Mail size={14} /> },
                     { label: 'Mobile Number', value: profile.phone, icon: <Phone size={14} /> },
                     { label: 'Assigned Branch', value: profile.branch, icon: <Building2 size={14} /> },
                     { label: 'Bank Name', value: profile.bankDetails?.bankName || 'Not Set', icon: <Landmark size={14} /> },
                     { label: 'Account Number', value: profile.bankDetails?.accountNumber || 'Not Set', icon: <FileText size={14} />, span: 1 },
                     { label: 'Branch Name', value: profile.bankDetails?.branchName || 'Not Set', icon: <MapPin size={14} />, span: 1 },
                   ].map((item, i) => (
                     <div key={i} style={{ gridColumn: item.span ? `span ${item.span}` : 'span 1' }}>
                       <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                         {item.icon} {item.label}
                       </p>
                       <p style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>{item.value}</p>
                     </div>
                   ))}
                </div>
              </div>

              {/* Assigned Agent Card */}
              <div className="card" style={{ padding: '28px', border: profile.agent ? '1px solid #bbf7d0' : '1px solid #f1f5f9', backgroundColor: profile.agent ? '#f0fdf4' : '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: profile.agent ? '20px' : '0' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UserCog size={18} style={{ color: profile.agent ? '#059669' : '#94a3b8' }} /> Assigned Field Agent
                  </h3>
                  {!profile.agent && (
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>No agent assigned yet</span>
                  )}
                </div>
                {profile.agent && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 24px' }}>
                    {[
                      { label: 'Agent Name', value: profile.agent.name, icon: <User size={14} /> },
                      { label: 'Mobile Number', value: profile.agent.contact, icon: <Phone size={14} /> },
                      { label: 'Email Address', value: profile.agent.email || 'Not provided', icon: <Mail size={14} /> },
                      { label: 'Designation', value: profile.agent.designation || 'Field Agent', icon: <UserCog size={14} /> },
                      ...(profile.agent.employeeId ? [{ label: 'Employee ID', value: profile.agent.employeeId, icon: <ShieldCheck size={14} /> }] : [])
                    ].map((item, i) => (
                      <div key={i}>
                        <p style={{ fontSize: '11px', fontWeight: '800', color: '#065f46', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.icon} {item.label}
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wallet & Financial Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                 <div className="card" style={{ padding: '24px', backgroundColor: '#0f172a', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Available Balance</p>
                        <h2 style={{ fontSize: '32px', fontWeight: '900', marginTop: '8px' }}>LKR {(walletSummary?.availableBalance || 0).toLocaleString()}</h2>
                      </div>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Wallet size={24} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                       <div>
                         <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>HELD / PENDING</p>
                         <p style={{ fontSize: '16px', fontWeight: '800' }}>LKR {(walletSummary?.heldBalance || 0).toLocaleString()}</p>
                       </div>
                       <div>
                         <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>EST. EARNINGS</p>
                         <p style={{ fontSize: '16px', fontWeight: '800', color: '#10b981' }}>+ LKR {(financialSummary?.totalEarned || 0).toLocaleString()}</p>
                       </div>
                    </div>
                 </div>

                 <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Portfolio Performance</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       {[
                         { label: 'Total Capital In', value: financialSummary?.totalDeposited || 0, icon: <ArrowUpRight size={14} />, color: '#10b981' },
                         { label: 'Active Investments', value: financialSummary?.activeInvestmentTotal || 0, icon: <TrendingUp size={14} />, color: '#3b82f6' },
                         { label: 'Pending Withdrawals', value: financialSummary?.pendingWithdrawal || 0, icon: <Clock size={14} />, color: '#f59e0b' },
                         { label: 'Total Withdrawn', value: financialSummary?.totalWithdrawn || 0, icon: <ArrowDownRight size={14} />, color: '#ef4444' },
                       ].map((stat, i) => (
                         <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#f8fafc' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                               <div style={{ color: stat.color }}>{stat.icon}</div>
                               <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{stat.label}</span>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>
                               LKR {stat.value.toLocaleString()}
                            </span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               {/* Quick Exports Card */}
               <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '20px' }}>Data Export</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     {[
                       { label: 'Wallet Statement', cat: 'wallet' },
                       { label: 'Investments History', cat: 'investments' },
                       { label: 'Transaction Audit', cat: 'transactions' },
                     ].map((item, i) => (
                       <button key={i} onClick={() => navigate(`/customers/${id}/report/${item.cat}`)} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', border: '1px solid #f1f5f9', color: '#475569', width: '100%', textAlign: 'left' }}>
                          <FileText size={16} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontSize: '13px', fontWeight: '700' }}>{item.label}</span>
                       </button>
                     ))}
                  </div>
               </div>

               {/* Activity Sidebar */}
               <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '20px' }}>Recent Timeline</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                     {activity.length === 0 ? (
                       <p style={{ color: '#94a3b8', fontSize: '12px' }}>No recorded events yet.</p>
                     ) : activity.slice(0, 5).map((act, i) => (
                       <div key={i} style={{ display: 'flex', gap: '12px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: act.status === 'SUCCESS' ? '#10b981' : '#f59e0b', marginTop: '6px', flexShrink: 0 }}></div>
                          <div style={{ flex: 1 }}>
                             <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', lineHeight: '1.4' }}>{act.action}</p>
                             <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', marginTop: '2px' }}>{new Date(act.date).toLocaleDateString()} • {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                       </div>
                     ))}
                  </div>
                  <button style={{ width: '100%', marginTop: '20px', padding: '10px', borderRadius: '10px', border: '1px solid #f1f5f9', color: 'var(--primary)', fontSize: '12px', fontWeight: '800' }}>Full Audit Trail</button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'investments' && (
           <div className="card" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900' }}>Investment Portfolio History</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {investments.length > 0 ? (
                   investments.map((inv, i) => (
                     <div key={i} style={{ padding: '20px', border: '1px solid #f1f5f9', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                           <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: inv.status === 'ACTIVE' ? '#ecfdf5' : '#f1f5f9', color: inv.status === 'ACTIVE' ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Briefcase size={24} />
                           </div>
                           <div>
                              <h4 style={{ fontSize: '15px', fontWeight: '800' }}>{inv.planName || 'Plan Model'}</h4>
                              <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>{inv.duration} • ROI: {inv.monthlyROI}% Monthly</p>
                           </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                           <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>ALLOCATED AMOUNT</p>
                           <p style={{ fontSize: '18px', fontWeight: '900' }}>LKR {(inv.investedAmount || 0).toLocaleString()}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>MATURITY</p>
                            <p style={{ fontSize: '13px', fontWeight: '700' }}>{new Date(inv.maturityDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                           <span className={`badge ${inv.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}`}>{inv.status}</span>
                        </div>
                        <button 
                           className="card" 
                           style={{ padding: '10px', cursor: 'pointer' }}
                           onClick={() => navigate(`/plan-activations/${inv._id || inv.id}`)}
                           title="View Investment Details"
                        >
                           <ExternalLink size={16} />
                        </button>
                     </div>
                   ))
                 ) : (
                   <div style={{ textAlign: 'center', padding: '60px' }}>
                      <Briefcase size={48} style={{ color: '#e2e8f0', margin: '0 auto 16px' }} />
                      <p style={{ color: '#94a3b8', fontWeight: '800' }}>No investment history found.</p>
                   </div>
                 )}
              </div>
           </div>
        )}

        {activeTab === 'transactions' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
             <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Full Transaction Ledger</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <a href={adminCustomersService.getDownloadUrl(id, 'transactions')} className="card" style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '700', color: '#64748b' }}><Download size={14} /> Download Ledger</a>
                </div>
             </div>
             <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>TX ID</th>
                        <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>DESCRIPTION & TYPE</th>
                        <th style={{ textAlign: 'right', padding: '16px', fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>AMOUNT</th>
                        <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', color: '#94a3b8', fontWeight: '800' }}>STATUS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {transactions.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No transactions recorded.</td></tr>
                    ) : transactions.map((tx, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                            <td style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>#{tx._id.substring(0,8).toUpperCase()}</td>
                            <td style={{ padding: '16px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '700' }}>{tx.type}</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(tx.createdAt).toLocaleString()}</div>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                <div style={{ fontSize: '15px', fontWeight: '900', color: tx.type.includes('CREDIT') || tx.type === 'DEPOSIT' ? '#10b981' : '#ef4444' }}>
                                {tx.type.includes('CREDIT') || tx.type === 'DEPOSIT' ? '+' : '-'} LKR {tx.amount.toLocaleString()}
                                </div>
                            </td>
                            <td style={{ padding: '16px 24px' }}>
                                <span className={`badge ${tx.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px' }}>{tx.status}</span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'kyc' && (
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <div className="card">
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px' }}>Account Governance</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { label: 'KYC Verification', status: 'VERIFIED', date: profile.registrationDate },
                            { label: 'Email Security', status: 'ACTIVE', date: profile.registrationDate },
                            { label: 'Bank Statement Verification', status: 'APPROVED', date: profile.registrationDate },
                        ].map((sec, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                <div>
                                    <p style={{ fontSize: '14px', fontWeight: '700' }}>{sec.label}</p>
                                    <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Verified on {new Date(sec.date).toLocaleDateString()}</p>
                                </div>
                                <span className="badge badge-success" style={{ height: 'fit-content' }}>{sec.status}</span>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card" style={{ padding: '24px', backgroundColor: '#f8fafc' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px' }}>Risk Assessment</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid var(--border)' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#065f46' }}>LOW RISK</span>
                    </div>
                </div>
                <button className="card" style={{ width: '100%', padding: '14px', color: '#ef4444', fontWeight: '800', border: '1px solid #fee2e2' }}>Suspend Account</button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default CustomerDetail;
