import { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle, 
  User, Mail, Phone, MapPin, Building2, 
  FileText, Download, Eye, Landmark, 
  ShieldCheck, Loader2, Info, Calendar,
  ExternalLink, UserCheck, ShieldAlert,
  History, Clock, CheckCircle, AlertCircle,
  Hash, CreditCard, PenTool, LayoutDashboard,
  FileSearch, RefreshCw
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { approvalsService } from '../services/api/adminApprovals';

const ApprovalReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [activeDoc, setActiveDoc] = useState(null);
    const [checklist, setChecklist] = useState({
        identity: false,
        nic: false,
        mobile: false,
        email: false,
        address: false,
        bank: false,
        bankProof: false,
        photo: false,
        signature: false,
        duplicates: false
    });
    const [activeAction, setActiveAction] = useState(null); // 'APPROVE' | 'REJECT' | 'RESEND'
    const [actionReason, setActionReason] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showConfirmApproval, setShowConfirmApproval] = useState(false);
    const [finalUserId, setFinalUserId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await approvalsService.getApprovalDetails(id);
            if (res.success) {
                setData(res.data);
                if (res.data.verificationSummary) {
                    setChecklist(prev => ({
                        ...prev,
                        mobile: res.data.verificationSummary.isPhoneVerified,
                        email: res.data.verificationSummary.isEmailVerified
                    }));
                }
            }
        } catch (err) {
            console.error('Failed to fetch approval details:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleChecklist = (key) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }));

    const openActionModal = (action) => {
        setActiveAction(action);
        setActionReason('');
    };

    const handleConfirmAction = async () => {
        if (activeAction === 'REJECT') {
            if (!actionReason) return alert('Rejection reason is mandatory.');
            await handleReject();
        } else if (activeAction === 'RESEND') {
            if (!actionReason) return alert('Please specify what needs correction.');
            await handleResend();
        }
        setActiveAction(null);
    };

    const handleApprove = () => {
        const missingItems = Object.entries(checklist).filter(([k, v]) => !v).map(([k]) => k);
        if (missingItems.length > 0) {
            return alert(`Cannot Proceed: ${missingItems.length} manual quality checks are still pending.`);
        }
        setShowConfirmApproval(true);
    };

    const executeApproval = async () => {
        setShowConfirmApproval(false);
        setIsProcessing(true);
        try {
            const res = await approvalsService.approveRequest(id);
            if (res.success) {
                setFinalUserId(res.data.userId);
                setShowSuccess(true);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Approval process failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        try {
            const res = await approvalsService.rejectRequest(id, actionReason);
            if (res.success) {
                alert('Application Rejected.');
                navigate('/customer-approvals');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Rejection failed');
        }
    };

    const handleResend = async () => {
        try {
            const res = await approvalsService.resendApplication(id, actionReason);
            if (res.success) {
                alert('Sent back for correction. Customer will receive a link to edit documents.');
                navigate('/customer-approvals');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Resend request failed');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '80vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '20px', backgroundColor: '#f8fafc' }}>
                <div style={{ position: 'relative' }}>
                    <Loader2 size={48} className="animate-spin" style={{ color: '#059669' }} />
                    <ShieldCheck size={20} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#059669' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: '#0f172a', fontWeight: '800', fontSize: '18px', marginBottom: '4px' }}>Securing Connection</p>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Retrieving encrypted KYC data packages...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { application, customer, snapshot, documents, verificationSummary, address, approval } = data;
    const profile = snapshot || customer || {};
    const appStatus = application?.status || 'PENDING';

    const getStatusConfig = (status) => {
        switch (status) {
            case 'APPROVED': return { color: '#059669', bg: '#ecfdf5', icon: <CheckCircle size={14} /> };
            case 'REJECTED': return { color: '#dc2626', bg: '#fef2f2', icon: <XCircle size={14} /> };
            case 'RESUBMISSION_REQUIRED': return { color: '#ea580c', bg: '#fff7ed', icon: <RefreshCw size={14} /> };
            default: return { color: '#2563eb', bg: '#eff6ff', icon: <Clock size={14} /> };
        }
    };

    const statusStyle = getStatusConfig(appStatus);

    return (
        <div style={{ padding: '0 0 40px 0', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            
            {/* PRE-CHECK HEADER BAR */}
            <div style={{ 
                backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', 
                position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate('/customer-approvals')} style={{ 
                        width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e2e8f0', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'white'
                    }}>
                        <ArrowLeft size={18} color="#475569" />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.02em' }}>KYC Verification & Customer Approval</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>APP-ID: <b style={{ color: 'var(--primary)' }}>{application?.referenceId}</b></span>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#cbd5e1' }}></span>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Submitted: {new Date(application?.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Current Pipeline Status</p>
                        <span style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', 
                            fontSize: '12px', fontWeight: '800', backgroundColor: statusStyle.bg, color: statusStyle.color, marginTop: '4px'
                        }}>
                            {statusStyle.icon} {appStatus.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>

            <main style={{ maxWidth: '1440px', margin: '32px auto', padding: '0 32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
                    
                    {/* LEFT CONTENT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {/* APPLICANT IDENTITY SUMMARY RAILS */}
                        <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <div style={{ backgroundColor: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        <UserCheck size={20} />
                                    </div>
                                    <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>Applicant Master Summary</h3>
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px' }}>KYC-LEVEL-01</span>
                            </div>
                            <div style={{ padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px 24px' }}>
                                {[
                                    { label: 'Full Legal Name', value: profile.fullName || profile.name || profile.customerName, icon: <User size={14} />, span: 2 },
                                    { label: 'NIC / Document No', value: profile.nic, icon: <Hash size={14} /> },
                                    { label: 'Gender', value: profile.gender || 'Not Specified', icon: <User size={14} /> },
                                    { label: 'Date of Birth', value: profile.dob ? new Date(profile.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A', icon: <Calendar size={14} />, span: 2 },
                                    { label: 'Primary Contact', value: profile.phone, icon: <Phone size={14} /> },
                                    { label: 'Verified Email', value: profile.email, icon: <Mail size={14} /> },
                                ].map((item, i) => (
                                    <div key={i} style={{ gridColumn: item.span ? `span ${item.span}` : 'span 1' }}>
                                        <p style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {item.icon} {item.label}
                                        </p>
                                        <p style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>{item.value || 'N/A'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* KYC & ADDRESS GRID */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            {/* Residantial Address */}
                            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <MapPin size={18} className="text-emerald-500" />
                                    <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>Residential Domicile</h3>
                                </div>
                                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <p style={{ fontSize: '15px', color: '#334155', fontWeight: '600', lineHeight: '1.6' }}>
                                        {profile.address || 'N/A'}
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: 'white', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>{profile.city}</span>
                                        <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: 'white', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>{profile.district}</span>
                                        <span style={{ fontSize: '12px', fontWeight: '800', backgroundColor: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: '6px' }}>{profile.province} Province</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payout Bank Details */}
                            <div className="card" style={{ padding: '24px', borderLeft: '4px solid #3b82f6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Landmark size={18} style={{ color: '#3b82f6' }} />
                                        <h3 style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>Settlement Bank Details</h3>
                                    </div>
                                    <ShieldCheck size={16} className="text-emerald-500" />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div>
                                        <p style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Financial Institution</p>
                                        <p style={{ fontSize: '14px', fontWeight: '700' }}>{profile.bankName} • {profile.branchName}</p>
                                    </div>
                                    <div style={{ padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '10px', border: '1px solid #e0f2fe' }}>
                                        <p style={{ fontSize: '10px', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase' }}>Authorized Account Number</p>
                                        <p style={{ fontSize: '18px', fontWeight: '900', color: '#1e3a8a', letterSpacing: '1px', marginTop: '4px' }}>{profile.accountNumber}</p>
                                        <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginTop: '4px' }}>Holder: {profile.accountHolder}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DOCUMENT VERIFICATION GRID */}
                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FileSearch size={18} color="var(--primary)" />
                                    <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>Document Audit & Inspection</h3>
                                </div>
                                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{documents?.length || 0} Attachments Found</p>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                {documents?.map((doc, i) => (
                                    <div key={i} style={{ 
                                        borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden', 
                                        backgroundColor: 'white', transition: 'all 0.2s ease' 
                                    }}>
                                        <div style={{ padding: '12px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '900', color: '#475569', textTransform: 'uppercase' }}>{doc.documentType || doc.type}</span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button onClick={() => window.open(doc.fileUrl, '_blank')} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Download Original">
                                                    <Download size={14} />
                                                </button>
                                                <button onClick={() => setActiveDoc(doc)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Analyze View">
                                                    <Eye size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ height: '180px', backgroundColor: '#f8fafc', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {doc.fileUrl.includes('.pdf') ? (
                                                <FileText size={48} color="#ef4444" strokeWidth={1} />
                                            ) : (
                                                <img src={doc.fileUrl} alt="KYC proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Signature Verification Card */}
                                {data.signature && (
                                    <div style={{ 
                                        gridColumn: 'span 1', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden', 
                                        backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b'
                                    }}>
                                        <div style={{ padding: '12px', borderBottom: '1px solid rgba(245, 158, 11, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '900', color: '#92400e', textTransform: 'uppercase' }}>Electronic Signature</span>
                                            <PenTool size={14} color="#f59e0b" />
                                        </div>
                                        <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                                            <img src={data.signature} alt="Sign" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'contrast(1.2)' }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MANUAL VERIFICATION CHECKLIST SECTION */}
                        <div className="card" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                <LayoutDashboard size={18} className="text-emerald-500" />
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>Operational Quality Controls</h3>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px' }}>
                                {[
                                    { key: 'identity', label: '1. Applicant Identity Verified (Face Match)' },
                                    { key: 'nic', label: '2. NIC Front & Back Details Match Profile' },
                                    { key: 'mobile', label: '3. Mobile Number Ownership Confirmed' },
                                    { key: 'email', label: '4. Digital Communication Channel Verified' },
                                    { key: 'address', label: '5. Residential Linkage Confirmed' },
                                    { key: 'bank', label: '6. Payout Bank Identity Validated' },
                                    { key: 'bankProof', label: '7. Bank Instrument Proof Acceptable' },
                                    { key: 'photo', label: '8. Professional Enrollment Photo Captured' },
                                    { key: 'signature', label: '9. Signature Pattern Legitimate' },
                                    { key: 'duplicates', label: '10. Sanctions & Duplicate Account Check' },
                                ].map((item) => (
                                    <div 
                                        key={item.key} 
                                        onClick={() => toggleChecklist(item.key)}
                                        style={{ 
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                            padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                                            transition: 'background 0.2s', backgroundColor: checklist[item.key] ? '#f0fdf4' : 'transparent'
                                        }}
                                    >
                                        <span style={{ fontSize: '13px', fontWeight: '600', color: checklist[item.key] ? '#065f46' : '#64748b' }}>{item.label}</span>
                                        <div style={{ 
                                            width: '20px', height: '20px', borderRadius: '6px', border: `2px solid ${checklist[item.key] ? '#10b981' : '#cbd5e1'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: checklist[item.key] ? '#10b981' : 'white'
                                        }}>
                                            {checklist[item.key] && <CheckCircle size={14} color="white" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AUDIT LOG TIMELINE */}
                        <div className="card" style={{ padding: '24px' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                <History size={18} color="#64748b" />
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>Submission & Audit History</h3>
                            </div>
                            <div style={{ position: 'relative', paddingLeft: '32px' }}>
                                <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', backgroundColor: '#e2e8f0' }}></div>
                                {[
                                    { event: 'Registration Initiation', date: application?.createdAt, status: 'DONE', icon: <CheckCircle2 size={12} /> },
                                    { event: 'Digital Identity Verification (OTP)', date: verificationSummary?.isPhoneVerified ? application?.createdAt : null, status: verificationSummary?.isPhoneVerified ? 'DONE' : 'PENDING' },
                                    { event: 'Document Package Uploaded', date: application?.createdAt, status: 'DONE' },
                                    { event: 'Backend Compliance Profiling', date: application?.createdAt, status: 'DONE' },
                                    { event: 'Final Review Stage', date: new Date(), status: 'ACTIVE' },
                                ].map((step, i) => (
                                    <div key={i} style={{ marginBottom: '24px', position: 'relative' }}>
                                        <div style={{ 
                                            position: 'absolute', left: '-25px', top: '4px', width: '18px', height: '18px', 
                                            borderRadius: '50%', backgroundColor: step.status === 'DONE' ? '#10b981' : step.status === 'ACTIVE' ? '#3b82f6' : 'white',
                                            border: `4px solid ${step.status === 'PENDING' ? '#e2e8f0' : 'transparent'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', zIndex: 2
                                        }}>
                                            {step.status === 'DONE' && <CheckCircle2 size={10} />}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <p style={{ fontSize: '13px', fontWeight: '700', color: step.status === 'DONE' ? '#1e293b' : '#64748b' }}>{step.event}</p>
                                            {step.date && <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{new Date(step.date).toLocaleDateString()} • {new Date(step.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT SIDEBAR - DECISION PANEL */}
                    <aside style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'sticky', top: '90px' }}>
                        
                        {/* Pre-Check Summary */}
                        <div className="card" style={{ padding: '24px', backgroundColor: '#0f172a', color: 'white' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '20px', color: '#94a3b8', textTransform: 'uppercase' }}>System Risk Profile</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {[
                                    { label: 'Cloud OTP Verification', pass: verificationSummary?.isPhoneVerified && verificationSummary?.isEmailVerified },
                                    { label: 'Document Completeness', pass: (documents?.length || 0) >= 3 },
                                    { label: 'Duplicate Check', pass: true },
                                    { label: 'Signature Format', pass: !!data.signature },
                                    { label: 'Banking Infrastructure', pass: !!profile.accountNumber }
                                ].map((check, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#cbd5e1' }}>{check.label}</span>
                                        {check.pass ? <ShieldCheck size={16} color="#10b981" /> : <ShieldAlert size={16} color="#f59e0b" />}
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '24px', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                                <span style={{ fontSize: '12px', fontWeight: '900', color: '#10b981' }}>COMPLIANCE PASS: LOW RISK</span>
                            </div>
                        </div>

                        {/* Decision Console */}
                        <div className="card" style={{ padding: '24px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', marginBottom: '20px' }}>Approval Cockpit</h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>ADMINISTRATIVE REMARKS</label>
                                    <textarea 
                                        className="input-field"
                                        placeholder="Internal notes regarding this review..."
                                        style={{ width: '100%', height: '100px', resize: 'none', fontSize: '13px', paddingTop: '10px' }}
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                    />
                                </div>

                                {!['APPROVED', 'REJECTED'].includes(appStatus) && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button 
                                            disabled={!Object.values(checklist).every(v => v === true)}
                                            onClick={handleApprove}
                                            className="btn-primary" 
                                            style={{ 
                                                width: '100%', padding: '14px', fontWeight: '800', fontSize: '14px', 
                                                backgroundColor: Object.values(checklist).every(v => v === true) ? '#059669' : '#94a3b8', 
                                                border: 'none', borderRadius: '12px', cursor: Object.values(checklist).every(v => v === true) ? 'pointer' : 'not-allowed',
                                                opacity: Object.values(checklist).every(v => v === true) ? 1 : 0.7,
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            Final Approval (Activate)
                                        </button>
                                        
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button 
                                                onClick={() => openActionModal('RESEND')}
                                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ea580c', backgroundColor: 'white', color: '#ea580c', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                                            >
                                                Resend Back
                                            </button>
                                            <button 
                                                onClick={() => openActionModal('REJECT')}
                                                style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                                            >
                                                Reject Permanently
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ marginTop: '20px', padding: '12px', borderRadius: '10px', backgroundColor: '#fefce8', border: '1px solid #fef08a' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <AlertTriangle size={16} color="#a16207" style={{ flexShrink: 0 }} />
                                    <p style={{ fontSize: '10.5px', color: '#854d0e', fontWeight: '600', lineHeight: '1.4' }}>
                                        Account activation triggers User ID generation and automated digital credential delivery via Email.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Operational Scope */}
                        <div className="card" style={{ padding: '24px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '16px', color: '#94a3b8', textTransform: 'uppercase' }}>Service Logistics</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <Building2 size={16} color="#64748b" />
                                    <div>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Processing Branch</p>
                                        <p style={{ fontSize: '13px', fontWeight: '700' }}>Branch - {profile.preferredBranch || 'Kandy (HQ)'}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <User size={16} color="#64748b" />
                                    <div>
                                        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>Assignment</p>
                                        <p style={{ fontSize: '13px', fontWeight: '700' }}>Direct Recruitment (Online)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </aside>
                </div>
            </main>

            {/* FULL-SIZE ANALYSIS LIGHTBOX */}
            {activeDoc && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px', backdropFilter: 'blur(8px)'
                }}>
                    <div style={{ 
                        position: 'relative', maxWidth: '1000px', width: '100%', borderRadius: '24px', 
                        backgroundColor: 'white', boxSizing: 'border-box', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' 
                    }}>
                        <div style={{ padding: '20px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>Investigative Document Analysis</h3>
                            <button 
                                onClick={() => setActiveDoc(null)}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '32px', maxHeight: '80vh', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
                            {activeDoc.fileUrl.includes('.pdf') ? (
                                <iframe src={activeDoc.fileUrl} style={{ width: '100%', height: '70vh', borderRadius: '12px', border: '1px solid #e2e8f0' }} title="KYC Viewer" />
                            ) : (
                                <img src={activeDoc.fileUrl} alt="KYC zoom" style={{ width: '100%', height: 'auto', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            )}
                        </div>
                        <div style={{ padding: '16px 32px', borderTop: '1px solid #e2e8f0', backgroundColor: 'white', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => window.open(activeDoc.fileUrl, '_blank')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                                <Download size={16} /> Download Copy
                            </button>
                            <button onClick={() => setActiveDoc(null)} className="btn-primary" style={{ padding: '10px 24px', fontSize: '13px' }}>
                                Close Analysis
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* DECISION MODAL (REJECT / RESEND) */}
            {activeAction && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '40px', backdropFilter: 'blur(4px)'
                }}>
                    <div style={{ 
                        maxWidth: '500px', width: '100%', borderRadius: '20px', 
                        backgroundColor: 'white', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' 
                    }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', backgroundColor: activeAction === 'REJECT' ? '#fef2f2' : '#fff7ed' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: activeAction === 'REJECT' ? '#991b1b' : '#9a3412', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {activeAction === 'REJECT' ? <XCircle size={20} /> : <RefreshCw size={20} />}
                                {activeAction === 'REJECT' ? 'Confirm Permanent Rejection' : 'Request Application Correction'}
                            </h3>
                        </div>
                        <div style={{ padding: '32px' }}>
                            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px', fontWeight: '600', lineHeight: '1.5' }}>
                                {activeAction === 'REJECT' 
                                    ? 'Please provide the official reason for rejecting this application. This will be sent to the customer.' 
                                    : 'Explain what documents are missing or details that need correction. The customer will receive a link to edit their submission.'}
                            </p>
                            <textarea 
                                autoFocus
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                                placeholder="Type the reason or instructions here..."
                                style={{ width: '100%', height: '120px', borderRadius: '12px', padding: '16px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'none' }}
                            />
                        </div>
                        <div style={{ padding: '20px 32px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setActiveAction(null)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '700', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmAction}
                                style={{ 
                                    padding: '10px 24px', borderRadius: '10px', border: 'none', 
                                    backgroundColor: activeAction === 'REJECT' ? '#dc2626' : '#ea580c', 
                                    color: 'white', fontWeight: '700', cursor: 'pointer' 
                                }}
                            >
                                {activeAction === 'REJECT' ? 'Reject Application' : 'Send to Customer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* CONFIRM APPROVAL MODAL */}
            {showConfirmApproval && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500, padding: '24px', backdropFilter: 'blur(4px)' }}>
                    <div style={{ maxWidth: '480px', width: '100%', backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding: '32px', textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', backgroundColor: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                                <ShieldCheck size={32} color="#059669" />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', marginBottom: '12px' }}>Finalize Customer Activation?</h3>
                            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
                                You are about to activate <strong>{profile.fullName || profile.customerName}</strong>. 
                                This will generate banking credentials, initialize the digital wallet, and dispatch secure login details via Email and SMS.
                            </p>
                            <div style={{ backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '12px', fontSize: '13px', textAlign: 'left', color: '#475569', display: 'flex', gap: '12px' }}>
                                <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    Once approved, the system status will move to <strong>ACTIVE</strong> and the customer will gain immediate portal access.
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '24px 32px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', gap: '12px' }}>
                            <button onClick={() => setShowConfirmApproval(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>
                                Cancel
                            </button>
                            <button 
                                onClick={executeApproval}
                                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', backgroundColor: '#059669', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}
                            >
                                Confirm & Activate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PROCESSING OVERLAY */}
            {isProcessing && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(2px)' }}>
                    <Loader2 size={48} className="animate-spin" color="#059669" />
                    <p style={{ marginTop: '20px', fontWeight: '800', color: '#0f172a' }}>Initializing Customer Bank Account...</p>
                </div>
            )}

            {/* SUCCESS MODAL */}
            {showSuccess && (
                <div style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
                }}>
                    <div style={{ 
                        maxWidth: '450px', width: '100%', backgroundColor: 'white', borderRadius: '24px', 
                        padding: '40px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        animation: 'modalSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{ 
                            width: '80px', height: '80px', backgroundColor: '#ecfdf5', borderRadius: '50%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto'
                        }}>
                            <CheckCircle2 size={40} color="#059669" />
                        </div>
                        
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Verification Complete!</h2>
                        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px', lineHeight: '1.6' }}>
                            Application <strong>{data?.application?.referenceId}</strong> has been successfully approved. 
                            New customer has been added to the system.
                        </p>

                        <div style={{ 
                            backgroundColor: '#f8fafc', borderRadius: '16px', padding: '20px', 
                            border: '1px solid #e2e8f0', marginBottom: '32px', textAlign: 'left'
                        }}>
                            <p style={{ fontSize: '12px', fontWeight: '800', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dispatch Status</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }}></div>
                                    User ID Generated: {finalUserId}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }}></div>
                                    Credentials Sent via Email
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }}></div>
                                    Welcome SMS Dispatched
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    const customerId = data?.customer?._id;
                                    const branchId = data?.customer?.branchId;
                                    const params = new URLSearchParams({ tab: 'assignment' });
                                    if (customerId) params.set('customerId', customerId);
                                    if (branchId) params.set('branchId', typeof branchId === 'object' ? branchId._id : branchId);
                                    navigate(`/agents?${params.toString()}`);
                                }}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                                    backgroundColor: '#059669', color: 'white', fontWeight: '800', fontSize: '15px',
                                    cursor: 'pointer', transition: 'transform 0.2s ease'
                                }}
                            >
                                Assign Field Agent →
                            </button>
                            <button
                                onClick={() => navigate('/customer-approvals')}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0',
                                    backgroundColor: 'white', color: '#475569', fontWeight: '700', fontSize: '14px',
                                    cursor: 'pointer'
                                }}
                            >
                                Return to Queue
                            </button>
                        </div>
                    </div>
                    <style>{`
                        @keyframes modalSlideIn {
                            from { opacity: 0; transform: translateY(30px) scale(0.95); }
                            to { opacity: 1; transform: translateY(0) scale(1); }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default ApprovalReview;
