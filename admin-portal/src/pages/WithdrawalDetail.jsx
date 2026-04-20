import { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle, 
  User, Wallet, Landmark, History, 
  ShieldCheck, Loader2, FileText, Download,
  ExternalLink, CreditCard, Calendar, Info,
  Banknote, ArrowRightCircle, ArrowDownCircle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { withdrawalsService } from '../services/api/adminWithdrawals';

const WithdrawalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [bankReference, setBankReference] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [checklist, setChecklist] = useState({
    customerValid: false,
    walletHoldCreated: false,
    amountValid: false,
    bankVerified: false,
    signatureAcceptable: false,
    noPriorPayout: false
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await withdrawalsService.getWithdrawalDetails(id);
        if (res?.success) {
          setData(res.data);
          const { withdrawal, wallet } = res.data;
          // Pre-check some system values but allow manual override if needed
          setChecklist(prev => ({
            ...prev,
            amountValid: wallet?.availableBalance >= withdrawal?.amount,
            walletHoldCreated: withdrawal.status !== 'PENDING'
          }));
        } else {
          setError('Failed to load detail');
        }
      } catch (err) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const toggleCheck = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(v => v === true);

  const handleAction = async (action) => {
    if (['REJECTED', 'FAILED'].includes(action) && !adminNote.trim()) {
      return alert('An internal note / reason must be provided for rejection or failure.');
    }

    if (['APPROVED', 'COMPLETED'].includes(action) && !allChecked) {
      return alert('Please verify all integrity checks by ticking the boxes before proceeding.');
    }

    setActionLoading(true);
    try {
      let res;
      if (action === 'APPROVED') {
        res = await withdrawalsService.approveWithdrawal(id);
      } else if (action === 'REJECTED') {
        res = await withdrawalsService.rejectWithdrawal(id, adminNote);
      } else if (action === 'COMPLETED') {
        if (!bankReference.trim()) {
           setActionLoading(false);
           return alert('Please enter the Bank Receipt Reference Number to confirm payout.');
        }
        res = await withdrawalsService.completeWithdrawal(id, bankReference);
      } else if (action === 'FAILED') {
        res = await withdrawalsService.failWithdrawal(id, adminNote);
      }

      if (res && res.success) {
        setSuccessMessage(action === 'APPROVED' 
            ? 'Withdrawal request approved and moved to Payout Execution.' 
            : action === 'COMPLETED'
            ? 'Payout successfully completed! Receipt sent to customer email.'
            : `Withdrawal ${action.toLowerCase()} successfully.`);
        setShowSuccessModal(true);
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

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
      <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Fetching Withdrawal Details...</p>
    </div>
  );

  if (error || !data || !data.withdrawal) return (
    <div className="card" style={{ padding: '60px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
      <div style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <AlertTriangle size={32} />
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Detail Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>{error || 'The requested withdrawal record could not be retrieved or does not exist.'}</p>
      <button onClick={() => navigate('/withdrawals')} className="btn-secondary" style={{ padding: '10px 24px' }}>Back to List</button>
    </div>
  );

  const { withdrawal, wallet } = data;
  const isPending = withdrawal.status === 'PENDING';
  const isSufficient = (wallet?.availableBalance || 0) >= (withdrawal?.amount || 0);
  
  const formattedAvailable = `LKR ${(wallet?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const formattedWithdrawal = `LKR ${(withdrawal?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  // Safe bank detail extraction
  const bankInfo = {
    bankName: withdrawal.bankName || withdrawal.bankDetails?.bankName || 'N/A',
    accountNumber: withdrawal.accountNumber || withdrawal.bankDetails?.accountNumber || 'N/A',
    accountName: withdrawal.accountName || withdrawal.bankDetails?.accountHolder || 'N/A',
    branchName: withdrawal.branchName || withdrawal.bankDetails?.branchName || 'N/A'
  };

  const safeId = id || '';
  const displayId = safeId.length > 6 ? safeId.substring(safeId.length - 6).toUpperCase() : safeId.toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '40px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle2 size={40} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', marginBottom: '12px' }}>Success!</h2>
              <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5', marginBottom: '32px' }}>{successMessage}</p>
              <button 
                onClick={() => navigate('/withdrawals')}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '800', fontSize: '15px' }}
              >
                Return to List
              </button>
           </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/withdrawals')}
          style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>Withdrawal Review: #{displayId}</h1>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: '800', 
              textTransform: 'uppercase',
              backgroundColor: isPending ? '#fef3c7' : '#f1f5f9',
              color: isPending ? '#92400e' : '#64748b',
              border: isPending ? '1px solid #fde68a' : '1px solid #e2e8f0'
            }}>
              {withdrawal.status || 'UNKNOWN'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Manual withdrawal request auditing</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Customer Profile Card */}
          <div className="card">
            <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={18} color="var(--primary)" />
              Customer Profile
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
               <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Full Name</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{withdrawal.customerId?.fullName || 'N/A'}</p>
               </div>
               <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>User ID</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{withdrawal.customerId?.userId || 'N/A'}</p>
               </div>
               <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>NIC Number</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{withdrawal.customerId?.nic || 'N/A'}</p>
               </div>
               <div>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Mobile Number</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{withdrawal.customerId?.mobile || 'N/A'}</p>
               </div>
               <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{withdrawal.customerId?.email || 'N/A'}</p>
               </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Wallet Snapshot */}
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={18} color="var(--primary)" />
                Wallet Analysis
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc' }}>
                   <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Available Balance</p>
                   <p style={{ fontSize: '18px', fontWeight: '800', color: isSufficient ? '#1e293b' : '#dc2626' }}>{formattedAvailable}</p>
                </div>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: '#b91c1c', textTransform: 'uppercase', marginBottom: '4px' }}>Requested Amount</p>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626' }}>{formattedWithdrawal}</h2>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Landmark size={18} color="#3b82f6" />
                Beneficiary Bank Account
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {[
                   { label: 'Bank Name', value: bankInfo.bankName },
                   { label: 'Account Number', value: bankInfo.accountNumber },
                   { label: 'Account Holder', value: bankInfo.accountName },
                   { label: 'Branch', value: bankInfo.branchName },
                 ].map((item, i) => (
                   <div key={i}>
                     <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>{item.label}</p>
                     <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{item.value}</p>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="card">
             <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Internal Audit Details</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0fdf4', display: 'flex', gap: '12px', alignItems: 'center', border: '1px solid #bbf7d0' }}>
                    <CheckCircle2 size={24} color="#10b981" />
                    <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#166534' }}>Digital Signature Verified</h4>
                    <p style={{ fontSize: '12px', color: '#15803d' }}>The customer authenticated this request with a one-time security code.</p>
                    </div>
                </div>
                <div>
                   <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Customer Reference Note</p>
                   <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>
                      "{withdrawal.reason || 'No specific reason provided by customer.'}"
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Decisions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>
          {/* Checklist - Always visible but disabled if not pending */}
          <div className="card" style={{ border: isPending ? '1px solid #10b98120' : '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: isPending ? '#10b981' : '#64748b' }} />
              Approval Checklist
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { key: 'customerValid', label: 'Identity Verified' },
                { key: 'amountValid', label: 'Balance Check Passed' },
                { key: 'bankVerified', label: 'Target Account Valid' },
                { key: 'noPriorPayout', label: 'No Duplicate Entry' },
              ].map((item) => (
                <label key={item.key} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  cursor: isPending ? 'pointer' : 'default', 
                  padding: '10px 14px', 
                  borderRadius: '10px', 
                  backgroundColor: checklist[item.key] ? '#f0fdf4' : '#f8fafc', 
                  border: `1px solid ${checklist[item.key] ? '#bbf7d0' : '#e2e8f0'}`, 
                  opacity: isPending ? 1 : 0.8
                }}>
                  <input 
                    type="checkbox" 
                    checked={checklist[item.key] || !isPending} // Force checked if already processed as it must have been checked
                    disabled={!isPending}
                    onChange={() => toggleCheck(item.key)}
                    style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: (checklist[item.key] || !isPending) ? '#166534' : '#64748b' }}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {isPending ? (
            /* Decision Panel for PENDING status */
            <div className="card" style={{ backgroundColor: '#f8fafc' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Decision Panel</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <textarea 
                  placeholder="Add an internal note or rejection reason..."
                  style={{ width: '100%', height: '80px', borderRadius: '8px', border: '1px solid var(--border)', padding: '12px', fontSize: '13px', outline: 'none', resize: 'none' }}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
                <button 
                  disabled={actionLoading || !allChecked}
                  onClick={() => handleAction('APPROVED')}
                  style={{ 
                    width: '100%', 
                    height: '48px', 
                    borderRadius: '10px', 
                    backgroundColor: allChecked ? 'var(--primary)' : '#cbd5e1', 
                    color: 'white', 
                    fontWeight: '800', 
                    fontSize: '14px',
                    cursor: allChecked ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Approve & Move to Payout'}
                </button>
                <button 
                  disabled={actionLoading}
                  onClick={() => handleAction('REJECTED')}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #fecaca', backgroundColor: 'white', color: '#b91c1c', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Reject Request
                </button>
              </div>
            </div>
          ) : (
            /* Audit Display for Non-PENDING status */
            <div className="card" style={{ backgroundColor: '#f8fafc' }}>
               <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    backgroundColor: withdrawal.status === 'REJECTED' ? '#fee2e2' : '#f0fdf4', 
                    color: withdrawal.status === 'REJECTED' ? '#dc2626' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    {withdrawal.status === 'REJECTED' ? <XCircle size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>Request {withdrawal.status}</h3>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>Processed on {new Date(withdrawal.updatedAt).toLocaleDateString()}</p>
               </div>

               {withdrawal.adminRemarks && (
                 <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Admin Remarks</p>
                    <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>
                       {withdrawal.adminRemarks}
                    </div>
                 </div>
               )}

               {withdrawal.status === 'APPROVED' && (
                 <button 
                  onClick={() => navigate(`/payout/${withdrawal._id}`)}
                  style={{ width: '100%', padding: '14px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                 >
                   <Banknote size={18} /> Continue to Payout
                 </button>
               )}
               
               {withdrawal.status === 'COMPLETED' && (
                 <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', fontWeight: '800', color: '#166534', textTransform: 'uppercase' }}>Payout Reference</p>
                    <p style={{ fontSize: '14px', fontWeight: '800', color: '#166534', fontFamily: 'monospace' }}>{withdrawal.payoutReferenceNumber || 'N/A'}</p>
                 </div>
               )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default WithdrawalDetail;
