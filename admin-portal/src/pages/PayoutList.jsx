import { useState, useEffect, useRef } from 'react';
import { 
  Search, Filter, ChevronRight, ArrowUpRight, Clock, 
  CheckCircle2, XCircle, AlertCircle, Download, 
  Eye, Wallet, Landmark, CreditCard, User, 
  Building2, Calendar, MoreVertical, Send, Loader2,
  ArrowRightCircle, CheckSquare, Banknote, ListTodo, History,
  ChevronDown, FileText, FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { withdrawalsService } from '../services/api/adminWithdrawals';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PayoutList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'HISTORY'
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = activeTab === 'ACTIVE' 
        ? await withdrawalsService.getPayoutList()
        : await withdrawalsService.getPayoutHistory();
      
      if (res?.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredRequests = requests.filter(req => {
    if (!searchQuery.trim()) return true;
    const searchLow = searchQuery.toLowerCase();
    const refMatch = (req.payoutReferenceNumber || '').toLowerCase().includes(searchLow);
    const internalRefMatch = (req.referenceNumber || '').toLowerCase().includes(searchLow);
    const nameMatch = (req.customerId?.fullName || req.customerId?.name || '').toLowerCase().includes(searchLow);
    const nicMatch = (req.customerId?.nic || '').toLowerCase().includes(searchLow);
    return refMatch || internalRefMatch || nameMatch || nicMatch;
  });

  const totalPayout = filteredRequests.reduce((sum, req) => sum + (req.amount || 0), 0);

  const handleExportExcel = () => {
    const data = filteredRequests.map(req => ({
      'Reference': activeTab === 'ACTIVE' ? req.referenceNumber : req.payoutReferenceNumber,
      'Internal ID': req.referenceNumber,
      'Customer Name': req.customerId?.fullName || req.customerId?.name || 'N/A',
      'NIC': req.customerId?.nic || 'N/A',
      'Amount (LKR)': req.amount,
      'Bank': req.bankName || 'N/A',
      'Account': req.accountNumber || 'N/A',
      'Branch': req.branchName || 'N/A',
      'Date': activeTab === 'ACTIVE' 
        ? new Date(req.approvedAt || req.updatedAt).toLocaleDateString()
        : new Date(req.completedAt || req.updatedAt).toLocaleDateString(),
      'Status': activeTab === 'ACTIVE' ? 'APPROVED' : 'SETTLED'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payouts");
    XLSX.writeFile(wb, `NF_Plantation_Payouts_${activeTab}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportMenu(false);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    // Header Branding
    doc.setFillColor(16, 185, 129); // var(--primary) #10b981
    doc.roundedRect(14, 15, 12, 12, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('T', 18, 24); // Representing the Tree icon

    doc.setTextColor(30, 41, 59); // #1e293b
    doc.setFontSize(18);
    doc.text('NF PLANTATION', 30, 22);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // var(--primary)
    doc.text('PAYOUT LIST', 30, 28);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // #64748b
    doc.text(`Generated on: ${today}`, 196, 22, { align: 'right' });
    doc.text(`Report Type: ${activeTab === 'ACTIVE' ? 'Pending Settlements' : 'Completed Payouts'}`, 196, 27, { align: 'right' });

    doc.setDrawColor(226, 232, 240); // #e2e8f0
    doc.line(14, 35, 196, 35);

    // Summary Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 40, 182, 15, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Total Records: ${filteredRequests.length}`, 20, 50);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount: LKR ${totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 190, 50, { align: 'right' });

    const tableColumn = ["Ref", "Customer", "NIC", "Amount (LKR)", "Bank/Account", "Date"];
    const tableRows = filteredRequests.map(req => [
      activeTab === 'ACTIVE' ? req.referenceNumber : (req.payoutReferenceNumber || req.referenceNumber),
      req.customerId?.fullName || req.customerId?.name || 'N/A',
      req.customerId?.nic || 'N/A',
      req.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 }),
      `${req.bankName}\n${req.accountNumber}`,
      activeTab === 'ACTIVE' 
        ? new Date(req.approvedAt || req.updatedAt).toLocaleDateString()
        : new Date(req.completedAt || req.updatedAt).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 10, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 30 },
        3: { halign: 'right', fontStyle: 'bold' },
        5: { halign: 'center' }
      },
      styles: { fontSize: 9, cellPadding: 4 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Page ${i} of ${pageCount} | NF Plantation Financial Audit System`, 14, 287);
    }

    doc.save(`NF_Plantation_Payouts_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`);
    setShowExportMenu(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Module Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Payout Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {activeTab === 'ACTIVE' 
              ? 'Execute approved bank transfers for withdrawals and automated monthly returns.' 
              : 'Complete audit trail of all settled bank transfers and automated payouts.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="card" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #f1f5f9' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                {activeTab === 'ACTIVE' ? 'Ready for Payout' : 'Total Settled Value'}
              </p>
              <p style={{ fontSize: '16px', fontWeight: '800', color: activeTab === 'ACTIVE' ? 'var(--primary-dark)' : '#1e293b' }}>
                LKR {totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: activeTab === 'ACTIVE' ? 'var(--primary)' : '#f1f5f9', color: activeTab === 'ACTIVE' ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeTab === 'ACTIVE' ? <Banknote size={20} /> : <History size={20} />}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '2px' }}>
        <button 
          onClick={() => setActiveTab('ACTIVE')}
          style={{ 
            padding: '10px 20px', 
            fontSize: '14px', 
            fontWeight: '700', 
            color: activeTab === 'ACTIVE' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'ACTIVE' ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          Active Payouts
        </button>
        <button 
          onClick={() => setActiveTab('HISTORY')}
          style={{ 
            padding: '10px 20px', 
            fontSize: '14px', 
            fontWeight: '700', 
            color: activeTab === 'HISTORY' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === 'HISTORY' ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
        >
          Payout History
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px 24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder={activeTab === 'ACTIVE' ? "Search by Internal Ref, Name, or NIC..." : "Search by Bank Ref, Internal Ref, Name, or NIC..."} 
            className="input-field"
            style={{ width: '100%', paddingLeft: '48px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Export Dropdown */}
        <div style={{ position: 'relative' }} ref={exportMenuRef}>
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="card" 
            style={{ 
              padding: '10px 16px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '14px', 
              fontWeight: '600', 
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              border: '1px solid #e2e8f0',
              transition: 'all 0.2s'
            }}
          >
            <Download size={18} /> Export List <ChevronDown size={14} style={{ transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          
          {showExportMenu && (
            <div style={{ 
              position: 'absolute', 
              top: '100%', 
              right: 0, 
              marginTop: '8px', 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
              border: '1px solid #f1f5f9', 
              padding: '8px', 
              zIndex: 100, 
              minWidth: '180px' 
            }}>
              <button 
                onClick={handleExportPDF}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#1e293b', fontSize: '13px', fontWeight: '600' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FileText size={16} color="#ef4444" /> Export as PDF
              </button>
              <button 
                onClick={handleExportExcel}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#1e293b', fontSize: '13px', fontWeight: '600' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FileSpreadsheet size={16} color="#10b981" /> Export as Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payouts Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {activeTab === 'ACTIVE' ? 'REF NUMBER' : 'BANK REF / INTERNAL'}
              </th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>CUSTOMER / NIC</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AMOUNT</th>
              {activeTab === 'ACTIVE' ? (
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BANK ACCOUNT</th>
              ) : (
                <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SETTLED ON</th>
              )}
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{activeTab === 'ACTIVE' ? 'APPROVED ON' : 'STATUS'}</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>
                  <Loader2 className="animate-spin text-primary" style={{ margin: '0 auto' }} size={24} />
                  <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Loading payouts...</p>
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {activeTab === 'ACTIVE' ? 'No approved payouts for today.' : 'No settled payouts found.'}
                </td>
              </tr>
            ) : filteredRequests.map((req, i) => {
              const dateObj = activeTab === 'ACTIVE' 
                ? new Date(req.approvedAt || req.updatedAt)
                : new Date(req.completedAt || req.updatedAt);
              
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }} className="table-row">
                  <td style={{ padding: '16px 24px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    {activeTab === 'ACTIVE' ? (
                      <>
                        {req.referenceNumber}
                        {(req.type === 'MONTHLY_RETURN' || req.referenceNumber?.startsWith('AUTO')) && (
                          <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '9px', backgroundColor: '#ecfdf5', color: '#059669', borderRadius: '4px', fontWeight: '800' }}>AUTO</span>
                        )}
                        {req.type === 'WITHDRAWAL' && !req.referenceNumber?.startsWith('AUTO') && (
                          <span style={{ marginLeft: '8px', padding: '2px 6px', fontSize: '9px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '4px', fontWeight: '800' }}>MANUAL</span>
                        )}
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>{req.payoutReferenceNumber || 'N/A'}</div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8' }}>{req.referenceNumber}</div>
                      </>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{req.customerId?.name || req.customerId?.fullName || 'Unknown'}</div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>{req.customerId?.nic || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: activeTab === 'ACTIVE' ? '#111827' : '#1e293b' }}>
                       LKR {req.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  {activeTab === 'ACTIVE' ? (
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{req.bankName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CreditCard size={12} /> {req.accountNumber}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{req.branchName}</div>
                    </td>
                  ) : (
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{dateObj.toLocaleDateString()}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{dateObj.toLocaleTimeString()}</div>
                    </td>
                  )}
                  <td style={{ padding: '16px' }}>
                    {activeTab === 'ACTIVE' ? (
                      <>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{dateObj.toLocaleDateString()}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{dateObj.toLocaleTimeString()}</div>
                      </>
                    ) : (
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        backgroundColor: '#ecfdf5', 
                        color: '#059669',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircle2 size={12} />
                        Settled
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button 
                      onClick={() => navigate(`/payout/${req.withdrawalRequestId || req._id}`)}
                      style={{ 
                        padding: activeTab === 'ACTIVE' ? '8px 16px' : '6px 12px', 
                        borderRadius: activeTab === 'ACTIVE' ? '8px' : '6px', 
                        backgroundColor: activeTab === 'ACTIVE' ? 'var(--primary)' : '#f8fafc', 
                        color: activeTab === 'ACTIVE' ? 'white' : '#64748b',
                        fontSize: activeTab === 'ACTIVE' ? '13px' : '12px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        border: activeTab === 'ACTIVE' ? 'none' : '1px solid #e2e8f0'
                      }}
                    >
                      {activeTab === 'ACTIVE' ? <>Process Payout <ArrowRightCircle size={14} /></> : 'Audit'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default PayoutList;
