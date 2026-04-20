import { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, 
  Wallet, Landmark, ShieldCheck, Loader2, 
  CreditCard, ArrowRightCircle, History,
  Info, Banknote
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { withdrawalsService } from '../services/api/adminWithdrawals';

const PayoutExecution = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [checklist, setChecklist] = useState({
    customerValid: false,
    walletHoldCreated: true,
    amountValid: true,
    bankVerified: false,
    signatureAcceptable: true,
    noPriorPayout: false
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [bankReference, setBankReference] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await withdrawalsService.getWithdrawalDetails(id);
        if (res?.success) {
          setData(res.data);
          // Pre-check some system values
          const { withdrawal, wallet } = res.data;
          setChecklist(prev => ({
            ...prev,
            amountValid: wallet?.availableBalance >= 0, // Since it's already in hold
            walletHoldCreated: true
          }));
        } else {
          setError('Payout record not found');
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
    setValidationError('');
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checklist).every(v => v === true);

  const handleCompletePayout = async () => {
    setValidationError('');
    if (!allChecked) {
      setValidationError('Please verify all integrity checks by ticking the boxes above.');
      return;
    }
    if (!bankReference.trim()) {
      setValidationError('Please enter the Bank Receipt Reference Number to confirm the transfer.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await withdrawalsService.completeWithdrawal(id, bankReference);
      if (res && res.success) {
        setShowSuccessModal(true);
      } else {
        setValidationError(res?.message || 'Failed to complete payout. Please check your connection.');
      }
    } catch (err) {
      setValidationError(err.message || 'An error occurred during payout completion');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
      <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Loading Payout Data...</p>
    </div>
  );

  if (error || !data || !data.withdrawal) return (
    <div className="card" style={{ padding: '60px', textAlign: 'center', maxWidth: '500px', margin: '40px auto' }}>
      <div style={{ width: '64px', height: '64px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <AlertTriangle size={32} />
      </div>
      <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Payout Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>{error || 'The requested payout record could not be retrieved.'}</p>
      <button onClick={() => navigate('/payout')} className="btn-secondary" style={{ padding: '10px 24px' }}>Back to List</button>
    </div>
  );

  const { withdrawal, wallet } = data;
  const isCompleted = withdrawal.status === 'COMPLETED';
  
  const formattedAvailable = `LKR ${(wallet?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const formattedHold = `LKR ${(wallet?.heldBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const formattedAmount = `LKR ${(withdrawal?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '40px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 0 8px #f0fdf4' }}>
                <CheckCircle2 size={40} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1e293b', marginBottom: '12px' }}>Payout Completed!</h2>
              <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5', marginBottom: '32px' }}>
                The bank transfer has been verified and settled. Funds have been deducted from hold balance and the customer has been notified.
              </p>
              <button 
                onClick={() => navigate('/payout')}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '800', fontSize: '15px' }}
              >
                Back to Payout List
              </button>
           </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={() => navigate('/payout')}
          style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>Payout Execution: #{displayId}</h1>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: '800', 
              textTransform: 'uppercase',
              backgroundColor: isCompleted ? '#ecfdf5' : '#fff7ed',
              color: isCompleted ? '#059669' : '#c2410c',
              border: isCompleted ? '1px solid #bbf7d0' : '1px solid #fed7aa'
            }}>
              {isCompleted ? 'SETTLED' : 'READY FOR DISBURSEMENT'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Settlement of approved funds to {bankInfo.bankName}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Wallet Info */}
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={18} color="var(--primary)" />
                Escrow Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: isCompleted ? '#f1f5f9' : '#fff7ed', border: `1px solid ${isCompleted ? '#e2e8f0' : '#ffedd5'}` }}>
                   <p style={{ fontSize: '11px', fontWeight: '700', color: isCompleted ? '#64748b' : '#c2410c', textTransform: 'uppercase' }}>{isCompleted ? 'Final Settlement Value' : 'Held for Payout'}</p>
                   <p style={{ fontSize: '18px', fontWeight: '800', color: isCompleted ? '#1e293b' : '#ea580c' }}>{formattedAmount}</p>
                </div>
                {!isCompleted && (
                  <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Net Settlement Amount</p>
                    <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#10b981' }}>{formattedAmount}</h2>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Details */}
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Landmark size={18} color="#3b82f6" />
                Target Bank Account
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 {[
                   { label: 'Beneficiary Name', value: bankInfo.accountName },
                   { label: 'Bank Name', value: bankInfo.bankName },
                   { label: 'Account Number', value: bankInfo.accountNumber },
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

          {/* Audit Trail */}
          <div className="card">
             <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <History size={18} color="#64748b" />
               Settlement Timeline
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                   <div>
                     <p style={{ fontSize: '13px', fontWeight: '700' }}>Administrative Approval</p>
                     <p style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(withdrawal.approvedAt || withdrawal.updatedAt || Date.now()).toLocaleString()}</p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px' }}>APPROVED</span>
                   </div>
                </div>
                {isCompleted && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                     <div>
                       <p style={{ fontSize: '13px', fontWeight: '700', color: '#065f46' }}>Bank Settlement Confirmed</p>
                       <p style={{ fontSize: '11px', color: '#059669' }}>{new Date(withdrawal.completedAt || Date.now()).toLocaleString()}</p>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', fontWeight: '800', color: '#065f46' }}>REF: {withdrawal.payoutReferenceNumber || 'N/A'}</p>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Payout Execution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '100px' }}>
          
          {!isCompleted ? (
            <>
              {/* Integrity Check */}
              <div className="card" style={{ border: '1px solid #10b98120' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={18} style={{ color: '#10b981' }} />
                  Settlement Verification
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { key: 'customerValid', label: 'Verify Beneficiary Identity' },
                    { key: 'bankVerified', label: 'Validate Bank Coordinates' },
                    { key: 'noPriorPayout', label: 'Check for Duplicate Settlement' },
                  ].map((item) => (
                    <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px 14px', borderRadius: '10px', backgroundColor: checklist[item.key] ? '#f0fdf4' : '#f8fafc', border: `1px solid ${checklist[item.key] ? '#bbf7d0' : '#e2e8f0'}`, transition: 'all 0.2s' }}>
                      <input 
                        type="checkbox" 
                        checked={checklist[item.key]} 
                        onChange={() => toggleCheck(item.key)}
                        style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: checklist[item.key] ? '#166534' : '#64748b' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bank Reference Input */}
              <div className="card" style={{ backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Bank Confirmation</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Bank Receipt Reference #</label>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder="e.g. TXN-99088712"
                      style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: '700', border: validationError ? '2px solid #ef4444' : '2px solid var(--border)' }}
                      value={bankReference}
                      onChange={(e) => {
                        setValidationError('');
                        setBankReference(e.target.value);
                      }}
                    />
                    {validationError && (
                      <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertTriangle size={14} /> {validationError}
                      </p>
                    )}
                  </div>

                  <button 
                    disabled={actionLoading || !allChecked}
                    onClick={handleCompletePayout}
                    style={{ 
                      width: '100%', 
                      padding: '16px', 
                      borderRadius: '12px', 
                      backgroundColor: allChecked ? 'var(--primary)' : '#cbd5e1', 
                      color: 'white', 
                      fontWeight: '800', 
                      fontSize: '15px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '10px',
                      cursor: allChecked ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s'
                    }}
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <><Banknote size={20} /> Confirm Settlement</>}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
               <div style={{ width: '64px', height: '64px', backgroundColor: '#f0fdf4', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <CheckCircle2 size={32} />
               </div>
               <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b', marginBottom: '8px' }}>Payout Settled</h3>
               <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>This transaction has been successfully disbursed to the beneficiary.</p>
               <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <p style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Bank Reference</p>
                  <p style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', fontFamily: 'monospace' }}>{withdrawal.payoutReferenceNumber || 'N/A'}</p>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PayoutExecution;
