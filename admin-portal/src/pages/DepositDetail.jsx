import { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle, 
  User, Mail, Phone, Landmark, History, 
  ShieldCheck, Loader2, FileText, Download,
  ExternalLink, CreditCard, Calendar, Info
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { depositsService } from '../services/api/adminDeposits';

const DepositDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [deposit, setDeposit] = useState(null);
  const [error, setError] = useState(null);
  
  // Mock Checklist State
  const [checklist, setChecklist] = useState({
    receiptUploaded: true,
    receiptReadable: false,
    referenceValid: false,
    amountValid: false,
    customerExists: true,
    noDuplicate: true
  });

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const res = await depositsService.getDepositRequests();
        if (res?.success) {
          const found = res.data.find(d => d._id === id);
          if (found) {
            setDeposit(found);
            setChecklist(prev => ({
              ...prev,
              receiptUploaded: !!found.proofUrl,
              customerExists: !!found.customerId
            }));

            // Automatically mark as Under Review if currently Pending
            if (found.status === 'PENDING') {
              try {
                await depositsService.markAsReview(id);
                setDeposit(prev => ({ ...prev, status: 'UNDER_REVIEW' }));
              } catch (reviewErr) {
                console.warn('Failed to auto-mark as review:', reviewErr);
              }
            }
          } else {
            setError('Deposit request not found.');
          }
        }
      } catch (err) {
        setError('Failed to fetch deposit details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeposit();
  }, [id]);

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ title: '', message: '' });

  const handleAction = async (action) => {
    if (action === 'REJECTED' && !internalNote.trim()) {
      return alert('You must provide a rejection reason/internal note.');
    }
    setActionLoading(true);
    try {
      let res;
      if (action === 'APPROVED') {
        res = await depositsService.approveDeposit(id);
      } else if (action === 'REJECTED') {
        res = await depositsService.rejectDeposit(id, internalNote);
      }

      if (res && res.success) {
        if (action === 'APPROVED') {
          setSuccessData({
            title: 'Deposit Successfully Verified',
            message: `LKR ${deposit.amount?.toLocaleString()} has been successfully added to ${res.customerName || deposit.customerId?.name || 'the customer'}'s wallet. Notifications have been dispatched via Email and SMS.`
          });
          setShowSuccessModal(true);
        } else {
          alert('Deposit rejected successfully.');
          navigate('/deposits');
        }
      } else {
        alert(res?.message || `Failed to process ${action}`);
      }
    } catch (err) {
      console.error('[Action Error]', err);
      alert(err.message || `An error occurred while processing ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  const isAllChecked = Object.values(checklist).every(v => v === true);

  if (loading) {
    return <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center' }}><Loader2 size={32} className="animate-spin text-primary" /></div>;
  }

  if (error || !deposit) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
        <AlertTriangle size={48} style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Not Found</h3>
        <p>{error || 'Deposit Request Not Found'}</p>
        <button onClick={() => navigate('/deposits')} className="btn-primary" style={{ marginTop: '16px' }}>Back to Deposits</button>
      </div>
    );
  }

  const submitTime = new Date(deposit.createdAt);
  const formattedAmount = `LKR ${deposit.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, backdropFilter: 'blur(8px)'
        }}>
          <div className="card animate-in fade-in zoom-in duration-300" style={{
            maxWidth: '480px', width: '90%', padding: '40px',
            textAlign: 'center', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '20px'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              backgroundColor: '#ecfdf5', color: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 10px #f0fdf4'
            }}>
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>{successData.title}</h2>
              <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '15px' }}>{successData.message}</p>
            </div>
            <button 
              onClick={() => navigate('/deposits')}
              className="btn-primary"
              style={{ width: '100%', height: '50px', justifyContent: 'center', fontSize: '16px' }}
            >
              Back to Deposits Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/deposits')}
          style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>Deposit Verification: #{id.substring(id.length - 6).toUpperCase()}</h1>
            <span className="badge badge-warning">{deposit.status}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Received via Bank Transfer • Ref: {deposit.referenceNumber || 'N/A'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Transaction Details & Document */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
            {/* Transaction Brief */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>Request Info</h3>
              
              {[
                { label: 'Amount to Credit', value: formattedAmount, highlight: true },
                { label: 'Reference Number', value: deposit.referenceNumber || 'N/A' },
                { label: 'Deposit Date', value: submitTime.toLocaleDateString() },
                { label: 'Customer ID', value: deposit.customerId?.userId || 'N/A' },
                { label: 'Payment Method', value: 'Bank Transfer' },
                { label: 'Submitted By', value: deposit.customerId?.name || 'Unknown' },
              ].map((item, i) => (
                <div key={i}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>{item.label}</p>
                  <p style={{ fontSize: item.highlight ? '20px' : '14px', fontWeight: '700', color: item.highlight ? 'var(--primary)' : 'var(--text-main)' }}>{item.value}</p>
                </div>
              ))}

              {deposit.notes && (
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#0369a1', textTransform: 'uppercase', marginBottom: '4px' }}>Customer Remark</p>
                  <p style={{ fontSize: '13px', color: '#0c4a6e', fontStyle: 'italic' }}>"{deposit.notes}"</p>
                </div>
              )}
            </div>

            {/* Document Preview */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700' }}>Deposit Receipt Preview</h3>
                {deposit.proofUrl && (
                    <button 
                        onClick={() => window.open(deposit.proofUrl, '_blank')}
                        style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ExternalLink size={14} /> Full Screen
                    </button>
                )}
              </div>
              <div style={{ 
                flex: 1, 
                minHeight: '400px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '12px', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {deposit.proofUrl ? (
                    deposit.proofUrl.toLowerCase().endsWith('.pdf') || deposit.proofUrl.includes('view-document') ? (
                        <iframe 
                            src={deposit.proofUrl} 
                            style={{ width: '100%', height: '400px', border: 'none' }}
                            title="Receipt PDF"
                        />
                    ) : (
                        <img 
                          src={deposit.proofUrl} 
                          alt="Deposit Receipt" 
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        />
                    )
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '24px', 
                            backgroundColor: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            margin: '0 auto 20px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
                        }}>
                            <Landmark size={40} color="var(--primary)" />
                        </div>
                        <p style={{ color: '#64748b', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', tracking: '1px' }}>No Receipt Uploaded</p>
                        <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', marginTop: '4px' }}>Verify with customer or manual bank sync</p>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Context */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Customer Relationship Context</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {[
                { label: 'Customer Name', value: deposit.customerId?.name || 'Unknown' },
                { label: 'Customer ID', value: deposit.customerId?.userId || 'N/A' },
                { label: 'Deposit Method', value: 'Manual Bank Transfer' },
                { label: 'Amount', value: formattedAmount },
              ].map((item, i) => (
                <div key={i}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: '700' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Timeline */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '20px' }}>Request Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { time: `${submitTime.toLocaleDateString()} ${submitTime.toLocaleTimeString()}`, action: 'Deposit Request Submitted', by: 'Customer (Web Portal)' },
                { time: 'Pending', action: 'Awaiting Admin Verification', by: 'System Workflow' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', position: 'relative', paddingBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)', zIndex: 1 }}></div>
                    {i !== 1 && <div style={{ width: '2px', flex: 1, backgroundColor: '#e2e8f0', margin: '4px 0' }}></div>}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{step.action}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>By {step.by} • {step.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Verification & Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>
          
          {/* Verification Panel */}
          <div className="card" style={{ border: '1px solid #10b98120' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
              Reconciliation Checklist
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'receiptUploaded', label: 'Receipt File Uploaded' },
                { key: 'receiptReadable', label: 'Receipt Image is Clear' },
                { key: 'referenceValid', label: 'Ref # Matches Bank Sync' },
                { key: 'amountValid', label: 'Amount Matches Receipt' },
                { key: 'customerExists', label: 'Customer Identity Verified' },
                { key: 'noDuplicate', label: 'Unique Transaction Ref' },
              ].map((item) => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', backgroundColor: checklist[item.key] ? '#ecfdf5' : '#f8fafc', transition: 'all 0.2s' }}>
                  <input 
                    type="checkbox" 
                    checked={checklist[item.key]} 
                    onChange={() => toggleCheck(item.key)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: checklist[item.key] ? '#065f46' : '#64748b' }}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Panel */}
          <div className="card" style={{ backgroundColor: '#f8fafc' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Decision & Actions</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Internal Processor Notes</label>
                <textarea 
                  placeholder="Notes for rejection reason or audit trail..."
                  style={{ width: '100%', height: '80px', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px', fontSize: '13px', outline: 'none', resize: 'none' }}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  disabled={actionLoading || deposit.status !== 'PENDING' || !isAllChecked}
                  onClick={() => handleAction('APPROVED')}
                  className="btn-primary" 
                  style={{ justifyContent: 'center', height: '48px', opacity: (!isAllChecked || deposit.status !== 'PENDING') ? 0.5 : 1, width: '100%' }}
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle2 size={18} /> Approve & Credit Wallet</>}
                </button>
                
                <button 
                  disabled={actionLoading || deposit.status !== 'PENDING'}
                  onClick={() => handleAction('REJECTED')}
                  style={{ height: '44px', borderRadius: '10px', border: '1px solid #fecaca', backgroundColor: 'white', color: '#b91c1c', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: deposit.status !== 'PENDING' ? 0.5 : 1 }}
                >
                  <XCircle size={18} /> Reject Deposit
                </button>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', padding: '12px', borderRadius: '8px', backgroundColor: '#fff7ed', display: 'flex', gap: '10px' }}>
                <AlertTriangle size={16} color="#c2410c" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '11px', color: '#c2410c', fontWeight: '500' }}>
                    Approving this will instantly increase the customer's wallet balance by {formattedAmount}. This action requires a full match of the bank statement details.
                </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default DepositDetail;
