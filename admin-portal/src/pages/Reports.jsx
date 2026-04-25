import { useState, useEffect } from 'react';
import {
  BarChart3, PieChart, TrendingUp, Download, Calendar,
  Users, Wallet, ArrowUpRight, ArrowDownRight, Building2, FileText,
  ChevronDown, Loader2, AlertCircle
} from 'lucide-react';
import apiClient from '../services/api/client';

const fmt = (n) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `LKR ${(n / 1_000).toFixed(1)}K`;
  return `LKR ${n.toLocaleString()}`;
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState('finance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/admin/reports/summary');
        if (res.data.success) setData(res.data.data);
        else setError('Failed to load report data.');
      } catch (err) {
        setError('Could not connect to server.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleExportPDF = () => {
    if (!data) return;
    const logoUrl = window.location.origin + '/logo.jpg';
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    const financeRows = data.finance ? `
      <tr><td>Total Deposits (Approved)</td><td class="amount green">${fmt(data.finance.totalDeposits)}</td></tr>
      <tr><td>Total Withdrawals (Processed)</td><td class="amount red">${fmt(data.finance.totalWithdrawals)}</td></tr>
      <tr><td>Active Capital Under Management</td><td class="amount blue">${fmt(data.finance.activeCapital)}</td></tr>
      <tr><td>Total Profit Paid to Customers</td><td class="amount purple">${fmt(data.finance.totalProfitPaid)}</td></tr>
      <tr><td>Pending Payouts (Queued)</td><td class="amount orange">${fmt(data.finance.pendingPayouts)}</td></tr>
    ` : '';

    const branchRows = (data.customers?.branchWise || []).map(b => `
      <tr>
        <td>${b.name}</td>
        <td style="text-align:center">${b.total}</td>
        <td style="text-align:center;color:#059669;font-weight:700">${b.active}</td>
        <td style="text-align:center;color:#64748b">${b.inactive}</td>
      </tr>
    `).join('');

    const planRows = (data.investments?.planWise || []).map(p => `
      <tr>
        <td>${p.name}</td>
        <td style="text-align:center">${p.active}</td>
        <td style="text-align:center;color:#f59e0b">${p.matured}</td>
        <td style="text-align:center;color:#64748b">${p.completed}</td>
        <td style="text-align:right;color:#166534;font-weight:700">${fmt(p.totalAmount)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html><html><head><meta charset="UTF-8">
      <title>NF Plantation – Analytical Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 40px; }
        .header { display: flex; align-items: center; gap: 20px; padding-bottom: 20px; margin-bottom: 24px; border-bottom: 3px solid #10b981; }
        .logo { width: 72px; height: 72px; object-fit: contain; border-radius: 8px; }
        .company h1 { font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: 1px; }
        .company p { font-size: 12px; color: #64748b; margin-top: 3px; }
        .meta { margin-left: auto; text-align: right; font-size: 12px; color: #64748b; }
        .meta strong { display: block; font-size: 13px; color: #0f172a; }
        h2 { font-size: 15px; font-weight: 800; color: #0f172a; margin: 24px 0 12px; border-left: 4px solid #10b981; padding-left: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #f1f5f9; text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #94a3b8; border-bottom: 1px solid #e2e8f0; }
        td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .amount { font-weight: 800; text-align: right; }
        .amount.green { color: #059669; }
        .amount.red { color: #dc2626; }
        .amount.blue { color: #2563eb; }
        .amount.purple { color: #7c3aed; }
        .amount.orange { color: #d97706; }
        .kpi-row { display: flex; gap: 16px; margin-bottom: 20px; }
        .kpi { flex: 1; padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 8px; }
        .kpi label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; }
        .kpi .val { font-size: 18px; font-weight: 900; color: #0f172a; margin-top: 4px; }
        .kpi .val.green { color: #059669; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header">
        <img class="logo" src="${logoUrl}" alt="NF Plantation" />
        <div class="company">
          <h1>NF PLANTATION (PVT) LTD</h1>
          <p>Official Business Analytics Report</p>
        </div>
        <div class="meta">
          <strong>Report Date</strong>${today}
        </div>
      </div>

      <h2>Financial Performance Summary</h2>
      <div class="kpi-row">
        <div class="kpi"><label>Active Capital</label><div class="val blue">${fmt(data.finance?.activeCapital)}</div></div>
        <div class="kpi"><label>Total Deposits</label><div class="val green">${fmt(data.finance?.totalDeposits)}</div></div>
        <div class="kpi"><label>Total Profit Paid</label><div class="val">${fmt(data.finance?.totalProfitPaid)}</div></div>
        <div class="kpi"><label>Pending Payouts</label><div class="val orange">${fmt(data.finance?.pendingPayouts)}</div></div>
      </div>
      <table><thead><tr><th>Metric</th><th style="text-align:right">Value</th></tr></thead><tbody>${financeRows}</tbody></table>

      <h2>Customer Analytics – Branch Distribution</h2>
      <table>
        <thead><tr><th>Branch Name</th><th style="text-align:center">Total</th><th style="text-align:center">Active</th><th style="text-align:center">Inactive</th></tr></thead>
        <tbody>${branchRows || '<tr><td colspan="4" style="text-align:center;color:#94a3b8">No branch data</td></tr>'}</tbody>
      </table>
      <p style="font-size:12px;color:#64748b;margin-bottom:20px">KYC Completion: <strong style="color:#059669">${data.customers?.kycRatio}%</strong> (${data.customers?.kycVerified?.toLocaleString()} of ${data.customers?.totalCustomers?.toLocaleString()} customers verified)</p>

      <h2>Investment Portfolio – Plan-wise Report</h2>
      <table>
        <thead><tr><th>Plan Level</th><th style="text-align:center">Active</th><th style="text-align:center">Matured</th><th style="text-align:center">Completed</th><th style="text-align:right">Portfolio Value</th></tr></thead>
        <tbody>${planRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8">No investment data</td></tr>'}</tbody>
      </table>

      <div class="footer">This report is auto-generated by the NF Plantation Admin System. For internal use only. &copy; ${new Date().getFullYear()} NF Plantation (Pvt) Ltd.</div>
      <script>window.onload = function() { window.print(); }</script>
      </body></html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const finance = data?.finance;
  const customers = data?.customers;
  const investments = data?.investments;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Analytical Reports</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Comprehensive financial and operational performance intelligence for the plantation network.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-primary"
            onClick={handleExportPDF}
            disabled={!data}
            style={{ opacity: data ? 1 : 0.5 }}
          >
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: '6px', backgroundColor: '#f1f5f9', display: 'inline-flex', gap: '4px', width: 'fit-content' }}>
        {['finance', 'customers', 'investments'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? 'var(--primary)' : '#64748b', fontSize: '14px', fontWeight: '800', boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
          >
            {tab === 'finance' ? 'Financial Performance' : tab === 'customers' ? 'Customer Analytics' : 'Investment Portfolio'}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8', fontWeight: '600' }}>Loading report data...</p>
        </div>
      )}

      {error && !loading && (
        <div className="card" style={{ padding: '24px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '12px', color: '#dc2626' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {activeTab === 'finance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
                {[
                  { label: 'Total Deposits', value: fmt(finance?.totalDeposits), icon: <ArrowDownRight />, color: '#10b981' },
                  { label: 'Total Withdrawals', value: fmt(finance?.totalWithdrawals), icon: <ArrowUpRight />, color: '#ef4444' },
                  { label: 'Active Capital', value: fmt(finance?.activeCapital), icon: <Wallet />, color: 'var(--primary)' },
                  { label: 'Profit Paid', value: fmt(finance?.totalProfitPaid), icon: <TrendingUp />, color: '#8b5cf6' },
                  { label: 'Pending Payouts', value: fmt(finance?.pendingPayouts), icon: <FileText />, color: '#f59e0b' },
                ].map((item, i) => (
                  <div key={i} className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>{item.label}</p>
                      <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>Finance Overview</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f8fafc' }}>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>METRIC</th>
                      <th style={{ textAlign: 'right', padding: '14px 20px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Total Deposits (Approved)', value: fmt(finance?.totalDeposits), color: '#059669' },
                      { label: 'Total Withdrawals (Processed)', value: fmt(finance?.totalWithdrawals), color: '#dc2626' },
                      { label: 'Active Capital Under Management', value: fmt(finance?.activeCapital), color: '#2563eb' },
                      { label: 'Total Profit Paid to Customers', value: fmt(finance?.totalProfitPaid), color: '#7c3aed' },
                      { label: 'Pending Payouts (Queued)', value: fmt(finance?.pendingPayouts), color: '#d97706' },
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '600' }}>{row.label}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: '15px', fontWeight: '800', color: row.color }}>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>ACTIVE</th>
                      <th style={{ textAlign: 'center', padding: '16px', fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>INACTIVE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(customers?.branchWise || []).length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No branch data available</td></tr>
                    ) : (customers?.branchWise || []).map((br, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700' }}>{br.name}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{br.total}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#059669' }}>{br.active}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#94a3b8' }}>{br.inactive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px' }}>KYC Completion Ratio</h3>
                <div style={{ height: '220px', backgroundColor: '#f8fafc', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: `conic-gradient(#10b981 ${customers?.kycRatio || 0}%, #e2e8f0 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: '900', color: '#10b981' }}>{customers?.kycRatio}%</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Verified Customers</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>{customers?.kycVerified?.toLocaleString()} of {customers?.totalCustomers?.toLocaleString()} total</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'investments' && (
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
                  {(investments?.planWise || []).length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No investment data available</td></tr>
                  ) : (investments?.planWise || []).map((plan, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{plan.name}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800' }}>{plan.active}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#f59e0b' }}>{plan.matured}</td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#64748b' }}>{plan.completed}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '800', color: '#166534' }}>{fmt(plan.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
