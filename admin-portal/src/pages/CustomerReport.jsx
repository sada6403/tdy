import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Printer, Download, ArrowLeft, Loader2, 
  ShieldCheck, Landmark, Wallet, History, 
  Briefcase, Activity, Calendar, User, Mail, Phone, MapPin
} from 'lucide-react';
import { adminCustomersService } from '../services/api/adminCustomers';
import { useAuth } from '../contexts/AuthContext';

const CustomerReport = () => {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [id, category]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await adminCustomersService.getReport(id, category);
      if (res.success) {
        setReport(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const url = adminCustomersService.getReportPdfUrl(id, category);
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px' }}>
        <Loader2 size={48} className="animate-spin text-emerald-500" />
        <p style={{ color: '#64748b', fontWeight: '800' }}>ASSEMBLING OFFICIAL REPORT...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Report could not be generated.</h2>
        <button onClick={() => navigate(-1)} className="btn-primary">Back</button>
      </div>
    );
  }

  const { profile, wallet, summary, investments, transactions, timeline, metadata } = report;

  return (
    <div className="report-container">
      {/* Action Bar - Hidden in Print */}
      <div className="no-print" style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, 
        height: '70px', backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center', 
        padding: '0 40px', zIndex: 1000, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Report Preview</h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{metadata.reportTitle} • {profile.fullName}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handleDownloadPdf} className="btn-primary" style={{ backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Export PDF
          </button>
          <button onClick={handlePrint} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={18} /> Print Document
          </button>
        </div>
      </div>

      {/* Main Report Document */}
      <div className="report-paper">
        {/* Document Header */}
        <div className="doc-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#10b981', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Landmark size={24} />
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', letterSpacing: '-1px', margin: 0 }}>NF PLANTATION</h1>
              </div>
              <p style={{ fontSize: '10px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Official Investment & Financial Solutions</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', margin: '0 0 4px 0' }}>{metadata.reportTitle}</h2>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Reference: <span style={{ color: '#475569', fontWeight: '700' }}>REP-{Date.now().toString().slice(-8)}</span></p>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Date: <span style={{ color: '#475569', fontWeight: '700' }}>{new Date(metadata.generatedAt).toLocaleDateString()}</span></p>
            </div>
          </div>
          <div style={{ height: '2px', backgroundColor: '#10b981', marginTop: '20px' }}></div>
        </div>

        {/* Section: Customer Profile */}
        <div className="doc-section">
          <h3 className="section-title">1. CUSTOMER IDENTITY PROFILE</h3>
          <div className="info-grid">
            <div className="info-item"><label>FULL NAME</label><span>{profile.fullName}</span></div>
            <div className="info-item"><label>USER ID</label><span style={{ color: '#10b981', fontWeight: '900' }}>{profile.userId}</span></div>
            <div className="info-item"><label>NIC / DOCUMENT ID</label><span>{profile.nic}</span></div>
            <div className="info-item"><label>CONTACT EMAIL</label><span>{profile.email}</span></div>
            <div className="info-item"><label>MOBILE NUMBER</label><span>{profile.mobile}</span></div>
            <div className="info-item"><label>ASSIGNED BRANCH</label><span>{profile.branch}</span></div>
            <div className="info-item"><label>REGISTRATION DATE</label><span>{new Date(profile.registrationDate).toLocaleDateString()}</span></div>
            <div className="info-item"><label>KYC STATUS</label><span className={`status-${profile.status.toLowerCase()}`}>{profile.status}</span></div>
          </div>
        </div>

        {/* Section: Wallet Summary */}
        {wallet && (
          <div className="doc-section">
            <h3 className="section-title">2. WALLET & LIQUIDITY SUMMARY</h3>
            <div className="wallet-grid">
              <div className="wallet-stat">
                <label>AVAILABLE BALANCE</label>
                <div className="value">LKR {wallet.availableBalance.toLocaleString()}</div>
              </div>
              <div className="wallet-stat">
                <label>HELD / PENDING</label>
                <div className="value">LKR {wallet.heldBalance.toLocaleString()}</div>
              </div>
              <div className="wallet-stat highlight">
                <label>TOTAL ACCOUNT VALUE</label>
                <div className="value">LKR {(wallet.availableBalance + wallet.heldBalance + (summary?.activeInvestmentTotal || 0)).toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Section: Financial Performance Metrics */}
        {summary && (
          <div className="doc-section">
            <h3 className="section-title">3. FINANCIAL PERFORMANCE METRICS</h3>
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Metric Description</th>
                  <th style={{ textAlign: 'right' }}>Amount (LKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Total Lifetime Deposits Approved</td><td style={{ textAlign: 'right', fontWeight: '700' }}>{summary.totalDeposited.toLocaleString()}</td></tr>
                <tr><td>Total Capital Injected into Investments</td><td style={{ textAlign: 'right', fontWeight: '700' }}>{summary.totalInvested.toLocaleString()}</td></tr>
                <tr><td>Total Accrued Profits (Lifetime Earnings)</td><td style={{ textAlign: 'right', fontWeight: '700', color: '#10b981' }}>+ {summary.totalEarned.toLocaleString()}</td></tr>
                <tr><td>Total Payouts / Withdrawals Processed</td><td style={{ textAlign: 'right', fontWeight: '700', color: '#ef4444' }}>- {summary.totalWithdrawn.toLocaleString()}</td></tr>
                <tr><td>Current Active Investment Capital</td><td style={{ textAlign: 'right', fontWeight: '900' }}>{summary.activeInvestmentTotal.toLocaleString()}</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Section: Investment Portfolio */}
        {investments && investments.length > 0 && (
          <div className="doc-section">
            <h3 className="section-title">4. INVESTMENT PORTFOLIO AUDIT</h3>
            <table className="doc-table">
              <thead>
                <tr>
                  <th>PLAN MODEL</th>
                  <th>AMOUNT</th>
                  <th>ANN. ROI</th>
                  <th>START DATE</th>
                  <th>MATURITY</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '800' }}>{inv.planName}</td>
                    <td>{inv.amount.toLocaleString()}</td>
                    <td>{inv.roi}%</td>
                    <td>{new Date(inv.startDate).toLocaleDateString()}</td>
                    <td>{new Date(inv.maturityDate).toLocaleDateString()}</td>
                    <td><span className={`status-${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section: Recent Transactions */}
        {transactions && transactions.length > 0 && (
          <div className="doc-section">
            <h3 className="section-title">5. TRANSACTION LEDGER (RECENT)</h3>
            <table className="doc-table compact">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>TYPE</th>
                  <th>DESCRIPTION</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: '10px' }}>{new Date(tx.date).toLocaleDateString()}</td>
                    <td style={{ fontWeight: '800', fontSize: '10px' }}>{tx.type}</td>
                    <td style={{ fontSize: '10px' }}>{tx.description}</td>
                    <td style={{ textAlign: 'right', fontWeight: '800', fontSize: '11px' }}>{tx.amount.toLocaleString()}</td>
                    <td><span style={{ fontSize: '9px' }}>{tx.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Document Footer */}
        <div className="doc-footer">
          <div style={{ height: '1px', backgroundColor: '#e2e8f0', marginBottom: '15px' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0 }}>This document is system-generated by NF Plantation Admin Portal.</p>
              <p style={{ margin: 0 }}>Authorized Admin: {adminUser?.name || 'ADMIN_USER'} • {adminUser?.role || 'ADMIN'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: '800' }}>NF Plantation IT Department</p>
              <p style={{ margin: 0 }}>© {new Date().getFullYear()} All Rights Reserved</p>
            </div>
          </div>
        </div>

        {/* Extra Styling for Print */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { background-color: #f1f5f9; margin: 0; padding: 0; }
          .report-container { padding-top: 100px; padding-bottom: 50px; }
          .report-paper { 
            width: 210mm; 
            min-height: 297mm; 
            margin: 0 auto; 
            background: white; 
            padding: 20mm; 
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            position: relative;
            box-sizing: border-box;
          }
          
          .doc-header { margin-bottom: 30px; }
          .section-title { 
            font-size: 14px; 
            font-weight: 900; 
            color: #0f172a; 
            background-color: #f8fafc; 
            padding: 10px 15px; 
            border-left: 4px solid #10b981;
            margin: 30px 0 15px 0;
            letter-spacing: 0.5px;
          }
          
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px 30px; }
          .info-item { display: flex; flex-direction: column; gap: 4px; }
          .info-item label { font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 0.5px; }
          .info-item span { font-size: 13px; font-weight: 700; color: #334155; }
          
          .wallet-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
          .wallet-stat { padding: 15px; border: 1px solid #e2e8f0; border-radius: 10px; }
          .wallet-stat label { font-size: 10px; font-weight: 800; color: #94a3b8; }
          .wallet-stat .value { font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 5px; }
          .wallet-stat.highlight { background-color: #0f172a; border-color: #0f172a; }
          .wallet-stat.highlight label { color: #94a3b8; }
          .wallet-stat.highlight .value { color: #10b981; }
          
          .doc-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .doc-table th { background-color: #f8fafc; padding: 12px 15px; text-align: left; font-size: 11px; font-weight: 900; color: #64748b; border-bottom: 2px solid #e2e8f0; }
          .doc-table td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #475569; }
          .doc-table.compact td { padding: 8px 15px; }
          
          .status-active, .status-verified, .status-approved { color: #10b981; font-weight: 800; }
          .status-pending { color: #f59e0b; font-weight: 800; }
          .status-matured { color: #3b82f6; font-weight: 800; }
          
          .doc-footer { margin-top: 60px; font-size: 10px; color: #94a3b8; line-height: 1.6; }
          
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
            .report-container { padding: 0 !important; }
            .report-paper { 
              box-shadow: none !important; 
              width: 100% !important; 
              margin: 0 !important;
              padding: 0 !important;
            }
            .section-title { -webkit-print-color-adjust: exact; }
            .wallet-stat.highlight { -webkit-print-color-adjust: exact; background-color: #0f172a !important; }
            .doc-table th { -webkit-print-color-adjust: exact; }
            @page { margin: 15mm; }
          }
        ` }} />
      </div>
    </div>
  );
};

export default CustomerReport;
