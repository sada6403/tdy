import { useState, useEffect } from 'react';
import {
    ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
    User, Wallet, Landmark, Zap, ShieldCheck, Loader2,
    Info, Scale, FileSignature, Check, MapPin,
    RefreshCw, AlertCircle, Eye
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { plansService } from '../services/api/adminPlans';

/* ── tiny helpers ── */
const fmtLKR = (v) => `LKR ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

/* ── Section header component ── */
const SectionHeader = ({ icon, title, color = '#6366f1' }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            {title}
        </h3>
    </div>
);

/* ── Info row ── */
const InfoRow = ({ label, value, highlight, ok, badge }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', minWidth: '120px' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: highlight ? '800' : '700', color: ok === true ? '#10b981' : ok === false ? '#ef4444' : highlight || '#334155', textAlign: 'right' }}>
            {badge ? (
                <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#166534' : '#991b1b' }}>
                    {value}
                </span>
            ) : value || '—'}
        </span>
    </div>
);

/* ── Verify toggle button ── */
const VerifyToggle = ({ checked, onToggle, label }) => (
    <button
        onClick={onToggle}
        style={{
            width: '100%',
            marginTop: '16px',
            padding: '10px 16px',
            borderRadius: '10px',
            border: `1.5px solid ${checked ? '#10b981' : '#cbd5e1'}`,
            background: checked ? '#f0fdf4' : '#f8fafc',
            color: checked ? '#166534' : '#64748b',
            fontSize: '12px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
        }}
    >
        {checked ? <CheckCircle2 size={15} /> : <Eye size={15} />}
        {checked ? `✓ ${label} — Verified` : `Mark as Verified`}
    </button>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const PlanActivationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectNote, setRejectNote] = useState('');
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [showReject, setShowReject] = useState(false);

    /* 6 verification categories — admin must tick all */
    const [verified, setVerified] = useState({
        identity: false,
        financials: false,
        plan: false,
        bank: false,
        signature: false,
        agreement: false
    });
    const [regSigError, setRegSigError] = useState(false);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await plansService.getInvestmentDetails(id);
            if (res?.success) {
                setData(res.data);
            } else {
                setError('Failed to load details');
            }
        } catch (err) {
            setError(err.message || 'Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDetails(); }, [id]);

    const toggleVerify = (key) => setVerified(prev => ({ ...prev, [key]: !prev[key] }));
    const allVerified = Object.values(verified).every(Boolean);
    const verifiedCount = Object.values(verified).filter(Boolean).length;

    const handleApprove = async () => {
        if (!allVerified) return;
        setActionLoading(true);
        try {
            const res = await plansService.approveInvestment(id);
            if (res?.success) navigate('/plan-activations');
            else alert(res?.message || 'Approval failed');
        } catch (err) {
            alert(err.message || 'An error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectNote.trim()) return alert('Please enter a rejection reason.');
        setActionLoading(true);
        try {
            const res = await plansService.rejectInvestment(id, rejectNote);
            if (res?.success) navigate('/plan-activations');
            else alert(res?.message || 'Rejection failed');
        } catch (err) {
            alert(err.message || 'An error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    /* ── Loading / Error states ── */
    if (loading) return (
        <div style={{ display: 'flex', height: '60vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '12px' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Loading activation details...</p>
        </div>
    );

    if (error || !data) return (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
            <AlertTriangle size={48} style={{ margin: '0 auto 16px', color: '#ef4444' }} />
            <p style={{ color: '#ef4444', fontWeight: '700' }}>{error || 'Record not found'}</p>
            <button onClick={() => navigate('/plan-activations')} style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                ← Back to List
            </button>
        </div>
    );

    /* ── Destructure data ── */
    const { investment, customer, wallet, application, hasDuplicate } = data;
    const plan = investment?.planId || {};
    const addr = customer?.address || {};
    const hasAddress = !!(addr.line1 || addr.city || addr.district || addr.province);
    const isPending = investment?.status === 'PENDING_ACTIVATION_APPROVAL';
    const monthlyYield = ((investment?.investedAmount || 0) * (investment?.monthlyROI || plan?.interestRate || 0)) / 100;
    const totalReturn = monthlyYield * (investment?.durationMonths || plan?.duration || 0);
    const walletCoverage = wallet?.heldBalance >= investment?.investedAmount;
    const bankDetails = customer?.bankDetails || application?.bankDetails || {};

    const statusBadge = {
        PENDING_ACTIVATION_APPROVAL: { label: 'Pending Approval', color: '#f59e0b', bg: '#fef3c7' },
        ACTIVE: { label: 'Active', color: '#10b981', bg: '#d1fae5' },
        REJECTED: { label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
        CANCELLED: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2' },
        MATURED: { label: 'Matured', color: '#3b82f6', bg: '#dbeafe' },
    }[investment?.status] || { label: investment?.status, color: '#64748b', bg: '#f1f5f9' };

    /* ── progress bar for wallet coverage ── */
    const coveragePct = Math.min(100, Math.round(((wallet?.heldBalance || 0) / (investment?.investedAmount || 1)) * 100));

    /* Right-panel section list */
    const sections = [
        { key: 'identity', label: 'Customer Identity', icon: <User size={13} />, color: '#6366f1' },
        { key: 'financials', label: 'Financial Position', icon: <Wallet size={13} />, color: '#10b981' },
        { key: 'plan', label: 'Plan Configuration', icon: <Zap size={13} />, color: '#f59e0b' },
        { key: 'bank', label: 'Bank Details', icon: <Landmark size={13} />, color: '#3b82f6' },
        { key: 'signature', label: 'Signature Match', icon: <FileSignature size={13} />, color: '#8b5cf6' },
        { key: 'agreement', label: 'Agreement & Terms', icon: <Scale size={13} />, color: '#0ea5e9' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ── HEADER ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                    onClick={() => navigate('/plan-activations')}
                    style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
                >
                    <ArrowLeft size={18} />
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h1 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-display)', margin: 0 }}>
                            Plan Activation — #{investment.referenceNumber || id.slice(-8).toUpperCase()}
                        </h1>
                        <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', backgroundColor: statusBadge.bg, color: statusBadge.color }}>
                            {statusBadge.label}
                        </span>
                        {hasDuplicate && (
                            <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertCircle size={11} /> Duplicate Plan Active
                            </span>
                        )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                        {customer?.fullName || 'Unknown Customer'} · {investment.planName || plan?.name || 'Investment Plan'} · {investment.durationMonths || plan?.duration || '—'} Months · Submitted {fmtDateTime(investment.createdAt)}
                    </p>
                </div>
                <button onClick={fetchDetails} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <RefreshCw size={15} />
                </button>
            </div>

            {/* ── BODY: 2-col layout ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '24px', alignItems: 'start' }}>

                {/* ════════════ LEFT COLUMN — 6 Verification Sections ════════════ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* ── SECTION 1: Customer Identity ── */}
                    <div className="card" style={{ padding: '24px', borderLeft: verified.identity ? '3px solid #10b981' : '3px solid #e2e8f0' }}>
                        <SectionHeader icon={<User size={16} />} title="1. Customer Identity & Personal Information" color="#6366f1" />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Left: Profile */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '20px', flexShrink: 0 }}>
                                        {(customer?.fullName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{customer?.fullName || '—'}</p>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, fontWeight: '600' }}>User ID: {customer?.userId || '—'}</p>
                                    </div>
                                </div>
                                <InfoRow label="NIC Number" value={customer?.nic || '—'} highlight="#0f172a" />
                                <InfoRow label="Mobile" value={customer?.mobile || '—'} />
                                <InfoRow label="Email" value={customer?.email || '—'} />
                                <InfoRow label="KYC Status" value={customer?.kycStatus || 'PENDING'} ok={customer?.kycStatus === 'VERIFIED'} badge />
                                <InfoRow label="Account Status" value={customer?.applicationStatus || 'N/A'} ok={customer?.applicationStatus === 'APPROVED'} badge />
                            </div>
                            {/* Right: Address */}
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Registered Address</p>
                                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {hasAddress ? (
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                            <MapPin size={14} style={{ color: '#94a3b8', marginTop: '1px', flexShrink: 0 }} />
                                            <div>
                                                {addr.line1 && <p style={{ fontSize: '13px', fontWeight: '700', color: '#334155', margin: 0 }}>{addr.line1}</p>}
                                                <p style={{ fontSize: '12px', color: '#64748b', margin: addr.line1 ? '4px 0 0' : 0 }}>
                                                    {[addr.city, addr.district, addr.province].filter(Boolean).join(', ') || '—'}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <MapPin size={14} style={{ color: '#cbd5e1' }} />
                                            <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Address not on file</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginTop: '16px' }}>
                                    <InfoRow label="Branch" value={application?.preferredBranch || customer?.branchId || '—'} />
                                    <InfoRow label="Registered" value={fmtDate(customer?.createdAt)} />
                                    <InfoRow label="Application Ref" value={application?.referenceId || '—'} />
                                    <InfoRow label="App Date" value={fmtDate(application?.applicationDate)} />
                                </div>
                            </div>
                        </div>

                        <VerifyToggle checked={verified.identity} onToggle={() => toggleVerify('identity')} label="Identity" />
                    </div>

                    {/* ── SECTION 2: Financial Position ── */}
                    <div className="card" style={{ padding: '24px', borderLeft: verified.financials ? '3px solid #10b981' : '3px solid #e2e8f0' }}>
                        <SectionHeader icon={<Wallet size={16} />} title="2. Financial Position & Wallet Verification" color="#10b981" />

                        {/* Balance overview tiles */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
                            {[
                                { label: 'Available Balance', value: fmtLKR(wallet?.availableBalance), color: '#10b981', bg: '#f0fdf4' },
                                { label: 'Held Balance', value: fmtLKR(wallet?.heldBalance), color: walletCoverage ? '#f59e0b' : '#ef4444', bg: walletCoverage ? '#fffbeb' : '#fef2f2' },
                                { label: 'Total Balance', value: fmtLKR(wallet?.totalBalance), color: '#3b82f6', bg: '#eff6ff' },
                            ].map((t, i) => (
                                <div key={i} style={{ padding: '14px', borderRadius: '12px', background: t.bg, textAlign: 'center' }}>
                                    <p style={{ fontSize: '10px', fontWeight: '700', color: t.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{t.label}</p>
                                    <p style={{ fontSize: '16px', fontWeight: '900', color: t.color, margin: 0 }}>{t.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Coverage visual */}
                        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Held vs Required (Investment Amount)</span>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: walletCoverage ? '#10b981' : '#ef4444' }}>
                                    {coveragePct}% coverage
                                </span>
                            </div>
                            <div style={{ height: '8px', borderRadius: '99px', background: '#e2e8f0', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${coveragePct}%`, borderRadius: '99px', background: walletCoverage ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#ef4444,#f87171)', transition: 'width 0.6s' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Required: {fmtLKR(investment?.investedAmount)}</span>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: walletCoverage ? '#10b981' : '#ef4444' }}>
                                    {walletCoverage ? '✓ Sufficient' : '✗ Insufficient'}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <InfoRow label="Total Invested" value={fmtLKR(wallet?.totalInvested)} />
                            <InfoRow label="Total Withdrawn" value={fmtLKR(wallet?.totalWithdrawn || 0)} />
                            <InfoRow label="Min. Investment" value="LKR 100,000" ok={(investment?.investedAmount || 0) >= 100000} />
                            <InfoRow label="Amount Requested" value={fmtLKR(investment?.investedAmount)} highlight="#0f172a" />
                        </div>

                        <VerifyToggle checked={verified.financials} onToggle={() => toggleVerify('financials')} label="Financials" />
                    </div>

                    {/* ── SECTION 3: Plan Configuration ── */}
                    <div className="card" style={{ padding: '24px', borderLeft: verified.plan ? '3px solid #10b981' : '3px solid #e2e8f0' }}>
                        <SectionHeader icon={<Zap size={16} />} title="3. Investment Plan Configuration" color="#f59e0b" />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <InfoRow label="Plan Name" value={investment.planName || plan?.name || '—'} highlight="#0f172a" />
                                <InfoRow label="Plan Status" value={plan?.status || 'ACTIVE'} ok={plan?.status !== 'INACTIVE'} badge />
                                <InfoRow label="Duration" value={`${investment.durationMonths || plan?.duration || '—'} Months`} />
                                <InfoRow label="Monthly ROI" value={`${investment.monthlyROI || plan?.interestRate || 0}%`} highlight="#10b981" />
                                <InfoRow label="Profit Route" value={investment.profitDestination === 'BANK' ? 'Auto Bank Transfer' : 'NF Wallet'} />
                            </div>
                            <div>
                                {/* Return calculation box */}
                                <div style={{ padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0' }}>
                                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Return Projection</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div>
                                            <p style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', margin: 0 }}>Capital</p>
                                            <p style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>{fmtLKR(investment?.investedAmount)}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', margin: 0 }}>Monthly Yield</p>
                                                <p style={{ fontSize: '16px', fontWeight: '900', color: '#10b981', margin: 0 }}>{fmtLKR(monthlyYield)}</p>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '10px', color: '#6b7280', fontWeight: '600', margin: 0 }}>Total Return</p>
                                                <p style={{ fontSize: '16px', fontWeight: '900', color: '#3b82f6', margin: 0 }}>{fmtLKR(totalReturn)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <VerifyToggle checked={verified.plan} onToggle={() => toggleVerify('plan')} label="Plan" />
                    </div>

                    {/* ── SECTION 4: Bank Details ── */}
                    <div className="card" style={{ padding: '24px', borderLeft: verified.bank ? '3px solid #10b981' : '3px solid #e2e8f0' }}>
                        <SectionHeader icon={<Landmark size={16} />} title="4. Bank Account Verification" color="#3b82f6" />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Bank details from customer profile */}
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Registered Bank Account</p>
                                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #e2e8f0' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Landmark size={18} color="white" />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: 0 }}>{bankDetails?.bankName || '—'}</p>
                                            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{bankDetails?.branchName || '—'}</p>
                                        </div>
                                    </div>
                                    <InfoRow label="Account Holder" value={bankDetails?.accountHolder || '—'} highlight="#0f172a" />
                                    <InfoRow label="Account No." value={bankDetails?.accountNumber || '—'} highlight="#0f172a" />
                                </div>
                            </div>
                            {/* Profit destination */}
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Profit Destination</p>
                                <div style={{ padding: '16px', borderRadius: '12px', background: investment?.profitDestination === 'BANK' ? '#eff6ff' : '#f0fdf4', border: `1px solid ${investment?.profitDestination === 'BANK' ? '#bfdbfe' : '#bbf7d0'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        {investment?.profitDestination === 'BANK'
                                            ? <Landmark size={20} style={{ color: '#3b82f6' }} />
                                            : <Wallet size={20} style={{ color: '#10b981' }} />}
                                        <p style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: investment?.profitDestination === 'BANK' ? '#1d4ed8' : '#166534' }}>
                                            {investment?.profitDestination === 'BANK' ? 'Automatic Bank Transfer' : 'NF Wallet Credit'}
                                        </p>
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                                        {investment?.profitDestination === 'BANK'
                                            ? `Monthly profit of ${fmtLKR(monthlyYield)} will be transferred to the registered bank account above.`
                                            : `Monthly profit of ${fmtLKR(monthlyYield)} will be credited to the customer's NF Wallet.`}
                                    </p>
                                </div>
                                {investment?.profitDestination === 'BANK' && !bankDetails?.accountNumber && (
                                    <div style={{ marginTop: '10px', padding: '8px 12px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '11px', color: '#dc2626', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <AlertCircle size={13} /> Bank account details not on file — verify before approving
                                    </div>
                                )}
                            </div>
                        </div>

                        <VerifyToggle checked={verified.bank} onToggle={() => toggleVerify('bank')} label="Bank Details" />
                    </div>

                    {/* ── SECTION 5: Signature Comparison ── */}
                    <div className="card" style={{ padding: '24px', borderLeft: verified.signature ? '3px solid #10b981' : '3px solid #e2e8f0' }}>
                        <SectionHeader icon={<FileSignature size={16} />} title="5. Signature Verification & Comparison" color="#8b5cf6" />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                            {/* Registration Signature */}
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={12} /> Registration Signature
                                    <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#64748b', fontWeight: '600', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px', textTransform: 'none', letterSpacing: 0 }}>On File (KYC)</span>
                                </p>
                                <div style={{ height: '160px', borderRadius: '12px', border: '1.5px dashed #c4b5fd', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                    {customer?.registrationSignature && !regSigError ? (
                                        <img
                                            src={customer.registrationSignature}
                                            alt="Registration Signature"
                                            style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain', padding: '8px' }}
                                            onError={() => setRegSigError(true)}
                                        />
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '16px' }}>
                                            <FileSignature size={28} style={{ color: '#c4b5fd', margin: '0 auto 8px' }} />
                                            <p style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '600', margin: 0 }}>
                                                {regSigError ? 'Unable to load signature image' : 'Not on file'}
                                            </p>
                                            {customer?.registrationSignature && regSigError && (
                                                <p style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 0 0' }}>Signature recorded — image may require S3 access</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* FD Activation Signature */}
                            <div>
                                <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FileSignature size={12} /> FD Activation Signature
                                    <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#64748b', fontWeight: '600', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px', textTransform: 'none', letterSpacing: 0 }}>Submitted Now</span>
                                </p>
                                <div style={{ height: '160px', borderRadius: '12px', border: '1.5px dashed #a7f3d0', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                    {investment?.signatureData ? (
                                        <img src={investment.signatureData} alt="FD Activation Signature" style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain', padding: '8px' }} />
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '16px' }}>
                                            <FileSignature size={28} style={{ color: '#6ee7b7', margin: '0 auto 8px' }} />
                                            <p style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', margin: 0 }}>Signature confirmed digitally</p>
                                            <p style={{ fontSize: '10px', color: '#94a3b8', margin: '4px 0 0' }}>(Image not stored for this submission)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Comparison notice */}
                        <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '10px', background: '#faf5ff', border: '1px solid #e9d5ff', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <Info size={14} color="#8b5cf6" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <p style={{ fontSize: '12px', color: '#6d28d9', fontWeight: '600', margin: 0, lineHeight: '1.6' }}>
                                Visually compare both signatures. The activation signature should match the customer's registration signature.
                                <strong> Mark as verified only if they match</strong> or the registration signature is unavailable and the activation signature appears authentic.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                            <InfoRow label="Signature Confirmed" value={investment?.signatureConfirmed ? 'YES' : 'NO'} ok={!!investment?.signatureConfirmed} badge />
                            <InfoRow label="Rules Accepted" value={investment?.rulesAccepted ? 'YES' : 'NO'} ok={!!investment?.rulesAccepted} badge />
                        </div>

                        <VerifyToggle checked={verified.signature} onToggle={() => toggleVerify('signature')} label="Signatures" />
                    </div>

                    {/* ── SECTION 6: Agreement & Submission ── */}
                    <div className="card" style={{ padding: '24px', borderLeft: verified.agreement ? '3px solid #10b981' : '3px solid #e2e8f0' }}>
                        <SectionHeader icon={<Scale size={16} />} title="6. Agreement, Terms & Submission Details" color="#0ea5e9" />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <InfoRow label="Reference Number" value={investment?.referenceNumber || '—'} highlight="#0f172a" />
                                <InfoRow label="Submission Date" value={fmtDateTime(investment?.createdAt)} />
                                <InfoRow label="Rules Accepted" value={investment?.rulesAccepted ? 'Accepted' : 'Not Accepted'} ok={!!investment?.rulesAccepted} badge />
                                <InfoRow label="Signature Confirmed" value={investment?.signatureConfirmed ? 'Confirmed' : 'Not Confirmed'} ok={!!investment?.signatureConfirmed} badge />
                                <InfoRow label="Duplicate Check" value={hasDuplicate ? 'Duplicate Found' : 'No Duplicate'} ok={!hasDuplicate} badge />
                            </div>
                            <div>
                                {investment?.note ? (
                                    <div>
                                        <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Customer Note</p>
                                        <div style={{ padding: '14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', fontSize: '13px', color: '#78350f', lineHeight: '1.6' }}>
                                            {investment.note}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', fontSize: '12px', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic', marginTop: '4px' }}>
                                        No customer note provided
                                    </div>
                                )}
                                {application?.adminRemarks && (
                                    <div style={{ marginTop: '12px' }}>
                                        <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Previous Admin Remark</p>
                                        <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '12px', color: '#7f1d1d' }}>
                                            {application.adminRemarks}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <VerifyToggle checked={verified.agreement} onToggle={() => toggleVerify('agreement')} label="Agreement" />
                    </div>

                </div>

                {/* ════════════ RIGHT COLUMN — Sticky panel ════════════ */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '80px' }}>

                    {/* Verification Progress */}
                    <div className="card" style={{ padding: '20px', border: allVerified ? '1px solid #bbf7d0' : '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ShieldCheck size={14} style={{ color: 'var(--primary)' }} /> Verification Status
                            </h3>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: allVerified ? '#10b981' : '#f59e0b' }}>
                                {verifiedCount}/6
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div style={{ height: '6px', borderRadius: '99px', background: '#e2e8f0', marginBottom: '16px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(verifiedCount / 6) * 100}%`, borderRadius: '99px', background: allVerified ? '#10b981' : 'linear-gradient(90deg,#f59e0b,#fb923c)', transition: 'width 0.4s' }} />
                        </div>

                        {/* Section checklist */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {sections.map((s) => (
                                <div
                                    key={s.key}
                                    onClick={() => toggleVerify(s.key)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        padding: '9px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        background: verified[s.key] ? '#f0fdf4' : '#f8fafc',
                                        border: `1px solid ${verified[s.key] ? '#bbf7d0' : '#f1f5f9'}`,
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: verified[s.key] ? '#10b981' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: verified[s.key] ? 'white' : '#94a3b8', flexShrink: 0 }}>
                                        {verified[s.key] ? <Check size={12} /> : s.icon}
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: verified[s.key] ? '#15803d' : '#64748b', flex: 1 }}>{s.label}</span>
                                    {verified[s.key] && <span style={{ fontSize: '10px', fontWeight: '800', color: '#10b981' }}>✓</span>}
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '12px', padding: '8px 12px', borderRadius: '8px', background: allVerified ? '#f0fdf4' : '#fefce8', border: `1px solid ${allVerified ? '#bbf7d0' : '#fde68a'}`, fontSize: '11px', fontWeight: '700', color: allVerified ? '#166534' : '#92400e', textAlign: 'center' }}>
                            {allVerified ? '✓ All sections verified — ready to authorize' : `${6 - verifiedCount} section${6 - verifiedCount !== 1 ? 's' : ''} remaining`}
                        </div>
                    </div>

                    {/* Decision Panel */}
                    <div className="card" style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Decision & Execution</h3>

                        {isPending ? (
                            <>
                                {!showReject ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button
                                            onClick={handleApprove}
                                            disabled={actionLoading || !allVerified}
                                            className="btn-primary"
                                            style={{ width: '100%', height: '48px', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', opacity: (!allVerified || actionLoading) ? 0.4 : 1, cursor: !allVerified ? 'not-allowed' : 'pointer' }}
                                        >
                                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            {actionLoading ? 'Processing...' : 'Authorize Activation'}
                                        </button>
                                        {!allVerified && (
                                            <p style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '600', textAlign: 'center', margin: 0 }}>
                                                Verify all {6 - verifiedCount} remaining section{6 - verifiedCount !== 1 ? 's' : ''} to enable
                                            </p>
                                        )}
                                        <button
                                            onClick={() => setShowReject(true)}
                                            disabled={actionLoading}
                                            style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1.5px solid #fecaca', background: 'white', color: '#b91c1c', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            Reject Application
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Rejection Reason *</label>
                                        <textarea
                                            placeholder="Enter detailed reason for rejection..."
                                            value={rejectNote}
                                            onChange={(e) => setRejectNote(e.target.value)}
                                            style={{ width: '100%', height: '90px', borderRadius: '8px', border: '1.5px solid #fecaca', padding: '10px 12px', fontSize: '12px', resize: 'none', outline: 'none', boxSizing: 'border-box', background: '#fff5f5' }}
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            <button onClick={() => setShowReject(false)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', color: '#64748b', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleReject}
                                                disabled={actionLoading || !rejectNote.trim()}
                                                style={{ padding: '10px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', opacity: !rejectNote.trim() ? 0.5 : 1 }}
                                            >
                                                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '14px', padding: '10px 12px', borderRadius: '8px', background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <Info size={13} color="#0369a1" style={{ flexShrink: 0, marginTop: '1px' }} />
                                    <p style={{ fontSize: '11px', color: '#0369a1', fontWeight: '600', margin: 0, lineHeight: '1.5' }}>
                                        Approval deducts <strong>{fmtLKR(investment?.investedAmount)}</strong> from held balance, activates the plan, and sends an email with PDF, SMS, and dashboard notification to the customer.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '20px', background: investment?.status === 'ACTIVE' ? '#f0fdf4' : '#fef2f2', borderRadius: '12px', textAlign: 'center', border: `1px solid ${investment?.status === 'ACTIVE' ? '#bbf7d0' : '#fecaca'}` }}>
                                {investment?.status === 'ACTIVE'
                                    ? <CheckCircle2 size={32} style={{ color: '#10b981', margin: '0 auto 10px' }} />
                                    : <XCircle size={32} style={{ color: '#ef4444', margin: '0 auto 10px' }} />}
                                <p style={{ fontWeight: '800', fontSize: '14px', color: investment?.status === 'ACTIVE' ? '#166534' : '#991b1b', margin: 0 }}>
                                    {investment?.status === 'ACTIVE' ? 'Investment Activated' : `Status: ${investment?.status}`}
                                </p>
                                {investment?.status === 'ACTIVE' && (
                                    <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px', margin: '6px 0 0' }}>
                                        Since {fmtDate(investment?.startDate)} · Matures {fmtDate(investment?.endDate)}
                                    </p>
                                )}
                                {investment?.rejectionReason && (
                                    <p style={{ fontSize: '11px', color: '#991b1b', marginTop: '8px', background: '#fef2f2', padding: '8px', borderRadius: '6px' }}>
                                        Reason: {investment.rejectionReason}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quick Summary Card */}
                    <div className="card" style={{ padding: '16px', background: '#f8fafc' }}>
                        <p style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Quick Summary</p>
                        {[
                            { label: 'Customer', value: customer?.fullName || '—' },
                            { label: 'Amount', value: fmtLKR(investment?.investedAmount) },
                            { label: 'Plan', value: investment?.planName || plan?.name || '—' },
                            { label: 'Monthly Yield', value: fmtLKR(monthlyYield) },
                            { label: 'Duration', value: `${investment?.durationMonths || '—'} Months` },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '11px' }}>
                                <span style={{ color: '#94a3b8', fontWeight: '600' }}>{item.label}</span>
                                <span style={{ color: '#334155', fontWeight: '800' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PlanActivationDetail;
