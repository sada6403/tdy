import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { 
    Info, ChevronLeft, CreditCard, Check, X,
    Building2, Hash, User, DollarSign, FileText, CheckCircle2,
    ArrowUpRight, Clock, AlertCircle, Trash2, Download, Eye,
    ShieldCheck, Activity
} from 'lucide-react';
import jsPDF from 'jspdf';

const Withdraw = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [errors, setErrors] = useState({});
    
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'request'); // 'request' or 'history'
    
    const [formData, setFormData] = useState({
        amount: '',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        branchName: '',
        reason: 'Personal Use',
        notes: '',
        nic: ''
    });

    // Cancel/Details Modals
    const [cancellingRequest, setCancellingRequest] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [detailsRequest, setDetailsRequest] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Terms & Signature
    const [isAgreed, setIsAgreed] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const canvasRef = React.useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0].clientY) - rect.top;
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => setIsDrawing(false);

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const reasons = ['Personal Use', 'Emergency', 'Business Need', 'Family Expenses', 'Other'];

    const fetchData = async () => {
        try {
            const [profileRes, historyRes] = await Promise.all([
                api.get('/customer/profile'),
                api.get('/customer/withdrawal-history')
            ]);

            if (profileRes.success) {
                setProfile(profileRes.data);
                // Sync bank details into form
                setFormData(prev => ({
                    ...prev,
                    bankName: profileRes.data.bankName || '',
                    accountNumber: profileRes.data.accountNumber || '',
                    accountHolder: profileRes.data.accountHolder || '',
                    branchName: profileRes.data.branchName || ''
                }));
            }
            if (historyRes.success) {
                // Fetch investments too to show unified "Holds"
                const invRes = await api.get('/customer/my-investments');

                let unifiedHistory = historyRes.data.map(item => ({ ...item, type: 'WITHDRAWAL' }));

                if (invRes.success) {
                    const pendingInvs = invRes.data
                        .filter(inv => inv.status === 'PENDING_ACTIVATION_APPROVAL')
                        .map(inv => ({
                            _id: inv._id,
                            createdAt: inv.createdAt,
                            referenceNumber: inv.referenceNumber,
                            amount: inv.investedAmount,
                            bankName: inv.planName, // Use plan name for "Vault Bank Scope" column
                            accountNumber: 'INVESTMENT',
                            status: inv.status,
                            type: 'INVESTMENT'
                        }));
                    unifiedHistory = [...unifiedHistory, ...pendingInvs];
                }

                // Sort by date descending
                unifiedHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setHistory(unifiedHistory);
            }
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading || isFetching) return null;
    if (!user) { navigate('/company/nf-plantation/login'); return null; }

    const availableBalance = profile?.walletBalance || 0;
    const totalBalance = profile?.walletSummary?.totalBalance || 0;
    const heldBalance = profile?.walletSummary?.heldBalance || 0;

    const handleInputChange = (e) => {
        let { name, value } = e.target;
        
        if (name === 'amount') {
            // Allow user to type freely, but keep it non-negative
            if (value !== '' && Number(value) < 0) value = '0';
            
            // Real-time Balance Check
            if (Number(value) > availableBalance) {
                setErrors(prev => ({ ...prev, amount: `Insufficient balance (Available: LKR ${availableBalance.toLocaleString()})` }));
            } else {
                setErrors(prev => { const newE = { ...prev }; delete newE.amount; return newE; });
            }
        }

        // Real-time NIC Verification
        if (name === 'nic') {
            const cleanValue = value.trim().toUpperCase();
            const storedNic = (profile?.nic || profile?.personalDetails?.nic || '').trim().toUpperCase();
            
            if (cleanValue && storedNic && cleanValue !== storedNic) {
                setErrors(prev => ({ ...prev, nic: 'NIC does not match our records' }));
            } else {
                setErrors(prev => { const newE = { ...prev }; delete newE.nic; return newE; });
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear general errors on change
        if (errors[name] && name !== 'nic' && name !== 'amount') {
            setErrors(prev => { const newE = { ...prev }; delete newE[name]; return newE; });
        }
    };

    const validateForm = (data, isEdit = false) => {
        const newErrors = {};
        if (!data.amount) newErrors.amount = 'Amount is required';
        else if (Number(data.amount) < 2000) newErrors.amount = 'Minimum LKR 2,000 req';
        
        if (!isEdit && Number(data.amount) > availableBalance) {
            newErrors.amount = 'Insufficient balance';
        }

        if (!isEdit && !data.nic) {
            newErrors.nic = 'NIC number is required for verification';
        } else if (!isEdit && profile?.nic && data.nic.trim().toUpperCase() !== profile.nic.trim().toUpperCase()) {
            newErrors.nic = 'NIC does not match our records';
        }
        
        if (!data.bankName) newErrors.bankName = 'Bank name required';
        if (!data.accountNumber) newErrors.accountNumber = 'Acc No required';
        if (!data.accountHolder) newErrors.accountHolder = 'Holder required';
        if (!data.branchName) newErrors.branchName = 'Branch required';

        if (!isEdit && !isAgreed) newErrors.submit = 'You must strictly agree to the secure withdrawal rules & policies.';
        if (!isEdit && !hasSignature) newErrors.submit = 'Digital Signature validation is strictly required.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm(formData)) return;

        setIsSubmitting(true);
        try {
            const response = await api.post('/customer/withdrawal-request', {
                amount: formData.amount,
                bankName: formData.bankName,
                accountName: formData.accountHolder,
                accountNumber: formData.accountNumber,
                branchName: formData.branchName,
                reason: formData.reason,
                note: `NIC: ${formData.nic} | ` + formData.notes
            });

            if (response.success) {
                setShowSuccessModal(true);
                setFormData({ ...formData, amount: '', notes: '' });
                setIsAgreed(false);
                clearSignature();
                fetchData();
            }
        } catch (error) {
            console.error('Withdrawal Error:', error);
            setErrors({ submit: error.message || 'Failed to submit.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelSubmission = async () => {
        if (!cancelReason.trim()) {
            alert('Please provide a reason for cancellation');
            return;
        }
        setActionLoading(true);
        try {
            const res = await api.post(`/customer/withdrawal-request/${cancellingRequest._id}/cancel`, {
                reason: cancelReason
            });
            if (res.success) {
                alert('Hold cancelled securely. Funds restored.');
                setCancellingRequest(null);
                setCancelReason('');
                fetchData();
            }
        } catch (error) {
            alert(error.message || 'Error cancelling request');
        } finally {
            setActionLoading(false);
        }
    };

    const downloadProof = (reqRecord) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('Withdrawal Request Receipt', 20, 20);
        doc.setFontSize(12);
        doc.text(`Reference: ${reqRecord.referenceNumber}`, 20, 35);
        doc.text(`Status: ${reqRecord.status}`, 20, 45);
        doc.text(`Amount: LKR ${reqRecord.amount.toLocaleString()}`, 20, 55);
        doc.text(`Date: ${new Date(reqRecord.createdAt).toLocaleString()}`, 20, 65);
        doc.text(`Bank: ${reqRecord.bankName} - ${reqRecord.branchName}`, 20, 75);
        doc.text(`Account No: XXXXXX${reqRecord.accountNumber?.slice(-4) || 'XXXX'}`, 20, 85);
        
        let py = 100;
        if(reqRecord.status === 'COMPLETED') {
            doc.text(`Payout Ref: ${reqRecord.payoutReferenceNumber || 'N/A'}`, 20, py);
            doc.text(`Completed: ${new Date(reqRecord.completedAt).toLocaleString()}`, 20, py+10);
        }
        
        doc.save(`Withdrawal_${reqRecord.referenceNumber}.pdf`);
    };

    const getStatusTheme = (status) => {
        switch(status){
            case 'PENDING': 
            case 'PENDING_ACTIVATION_APPROVAL': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'UNDER_REVIEW': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'APPROVED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'PROCESSING_PAYOUT': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'FAILED': 
            case 'CANCELLED': 
            case 'REJECTED': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Request On Hold</h2>
                        <p className="text-sm font-bold text-slate-500 mb-6">Your requested amount has been securely held from your available balance pending processing.</p>
                        <button onClick={() => { setShowSuccessModal(false); setActiveTab('history'); }} className="w-full bg-slate-900 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest">
                            View Status
                        </button>
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {cancellingRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-xl font-black uppercase tracking-widest text-rose-600 mb-2">Cancel Hold Request</h2>
                        <p className="text-sm text-slate-500 font-bold mb-4">The held funds of Rs. {cancellingRequest.amount.toLocaleString()} will be instantly restored back to your available balance.</p>
                        
                        <div className="mb-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Reason for Cancellation</label>
                            <textarea 
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Why are you cancelling this request?"
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-500/20 transition-all resize-none"
                                rows="3"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button onClick={()=>setCancellingRequest(null)} disabled={actionLoading} className="flex-1 py-3 text-xs font-black uppercase text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition">Go Back</button>
                            <button onClick={handleCancelSubmission} disabled={actionLoading} className="flex-1 py-3 text-xs font-black uppercase text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition">Confirm Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal (Premium Glassy Design) */}
            {detailsRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
                    <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] p-10 max-w-2xl w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative my-8 border border-white/20">
                        <button onClick={()=>setDetailsRequest(null)} className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-rose-600 transition-all active:scale-90"><X size={20}/></button>
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Audit Verification</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Transaction ID: {detailsRequest._id?.slice(-12).toUpperCase()}</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                                <Activity className="absolute -right-4 -bottom-4 text-slate-200 dark:text-slate-800 group-hover:scale-110 transition-transform" size={80} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Status Protocol</span>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusTheme(detailsRequest.status)}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${detailsRequest.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {detailsRequest.status.replace('_',' ')}
                                </div>
                            </div>
                            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group shadow-lg shadow-slate-900/20">
                                <DollarSign className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform" size={80} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Held Principal</span>
                                <p className="text-2xl font-black tabular-nums text-white">Rs. {detailsRequest.amount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Security Timeline</h3>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800 ml-4"></div>
                        </div>

                        <div className="space-y-6 ml-4 pl-8 border-l-2 border-slate-100 dark:border-slate-800 relative mb-10">
                            {detailsRequest.statusHistory?.map((hist, idx) => (
                                <div key={idx} className="relative group">
                                    <div className={`absolute -left-[41px] top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-slate-950 shadow-sm transition-colors ${idx === 0 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                                    <p className="text-[10px] font-black text-slate-400 mb-1 flex items-center gap-2">
                                        <Clock size={12} /> {new Date(hist.changedAt).toLocaleString()}
                                    </p>
                                    <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wide">{hist.status.replace('_',' ')}</p>
                                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/50">{hist.remark}</p>
                                </div>
                            ))}
                        </div>
                        
                        {(detailsRequest.failureReason || detailsRequest.adminRemarks) && (
                            <div className="mb-10 p-6 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-3xl border border-rose-100 dark:border-rose-900/30 flex items-start gap-4">
                                <AlertCircle className="shrink-0 mt-1" size={20} />
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1">Administrative Feedback</span>
                                    <p className="font-bold text-sm leading-relaxed">{detailsRequest.failureReason || detailsRequest.adminRemarks}</p>
                                </div>
                            </div>
                        )}
                        
                        <button onClick={()=>downloadProof(detailsRequest)} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98] text-white py-5 rounded-[1.5rem] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 transition-all">
                            <FileText size={18}/> 
                            Save Secure Verification Receipt
                        </button>
                    </div>
                </div>
            )}

                {/* Header */}
                <div className="mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/company/nf-plantation/dashboard')} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-emerald-600 transition-all active:scale-95 shadow-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Wallet Hub</h1>
                            <p className="text-sm text-slate-500 font-medium">Review your secure withdrawals and capital holds</p>
                        </div>
                    </div>
                </div>

                {/* Triple Balances Premium Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-slate-900 py-8 px-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 transform translate-x-12 -translate-y-12"><DollarSign size={100} /></div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 block mb-2">Maximum Total Balance</span>
                        <h3 className="text-4xl font-black tracking-tighter tabular-nums text-white z-10 relative">Rs. {totalBalance.toLocaleString()}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 border-t border-white/10 pt-4">Cumulative absolute worth</p>
                    </div>

                    <div className="bg-emerald-600 py-8 px-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden group transform hover:-translate-y-1 transition duration-300">
                        <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 transform translate-x-12 -translate-y-12 bg-white rounded-full w-48 h-48 blur-2xl"></div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100 block mb-2">Active Configured Available</span>
                        <h3 className="text-4xl font-black tracking-tighter tabular-nums drop-shadow-sm z-10 relative">Rs. {availableBalance.toLocaleString()}</h3>
                        <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mt-4 flex items-center gap-2 border-t border-emerald-500 pt-4"><Check size={14}/> Safely ready to use</p>
                    </div>

                    <div className="bg-amber-100 py-8 px-8 rounded-[2.5rem] text-amber-900 shadow-xl shadow-amber-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 transform translate-x-12 -translate-y-12"><Clock size={100} /></div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 block mb-2">Frozen / Awaiting Sent</span>
                        <h3 className="text-4xl font-black tracking-tighter tabular-nums z-10 relative">Rs. {heldBalance.toLocaleString()}</h3>
                        <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mt-4 border-t border-amber-200/50 pt-4 line-through decoration-amber-400 decoration-2">Cannot be withdrawn again</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 bg-slate-100 outline-none p-1.5 rounded-2xl inline-flex">
                    <button onClick={()=>setActiveTab('request')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'request' ? 'bg-white shadow relative text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>New Withdrawal</button>
                    <button onClick={()=>setActiveTab('history')} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white shadow relative text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>My Holds & History</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    
                    {/* Left Panel: Dynamic Body */}
                    <div className="lg:col-span-5">
                        
                        {activeTab === 'request' ? (
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                                {errors.submit && (
                                    <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-[11px] font-black uppercase tracking-widest rounded-xl border border-rose-100 flex items-center gap-2">
                                        <AlertCircle size={16} /> {errors.submit}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                                        
                                        {/* Financial Specs */}
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-3">Amount Specification & Identity</h3>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">USER ID</label>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><User size={16} /></div>
                                                        <input disabled value={user?.userId || profile?.userId || 'N/A'} className="w-full bg-slate-100 opacity-70 border-0 rounded-2xl pl-12 pr-4 py-4 text-xs font-black text-slate-400 uppercase tracking-widest" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity Verification (NIC)</label>
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"><CreditCard size={16} /></div>
                                                        <input name="nic" value={formData.nic} onChange={handleInputChange} type="text" placeholder="ENTER NIC" className={`w-full bg-slate-50 border ${errors.nic ? 'border-rose-500' : 'border-slate-100'} rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-slate-900 uppercase tracking-widest outline-none transition-all`} />
                                                    </div>
                                                    {errors.nic && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.nic}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total Safe Withdrawable Amount</label>
                                                <div className="relative">
                                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black">Rs</div>
                                                    <input name="amount" value={formData.amount} onChange={handleInputChange} type="number" min="0" placeholder="Enter amount" className={`w-full bg-emerald-50/50 border ${errors.amount ? 'border-rose-500' : 'border-emerald-100'} rounded-2xl px-14 py-5 text-xl font-black text-slate-900 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all`} />
                                                </div>
                                                {errors.amount && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.amount}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Fund Usage Necessity</label>
                                                <select name="reason" value={formData.reason} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-600 outline-none hover:bg-slate-100 transition-colors uppercase cursor-pointer">
                                                    {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Internal Remarks</label>
                                                <div className="relative">
                                                    <div className="absolute left-6 top-4 text-slate-300"><Hash size={18} /></div>
                                                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3" placeholder="Optional audit memo" className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-slate-500/10 outline-none transition-all tracking-wide resize-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Banking Destination */}
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-3">Destination Link (Locked)</h3>
                                            
                                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500"><Building2 size={24} /></div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Vault</p>
                                                        <p className={`font-black text-sm uppercase ${!formData.bankName ? 'text-rose-500' : 'text-slate-900'}`}>
                                                            {formData.bankName ? `${formData.bankName} - ${formData.branchName || 'N/A'}` : 'BANK NOT CONFIGURED'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3 px-4 py-4 bg-white rounded-2xl border border-slate-100">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-slate-400 uppercase tracking-widest">A/C Holder</span>
                                                        <span className={`font-black uppercase ${!(formData.accountHolder || formData.accountName) ? 'text-rose-500 font-black' : 'text-slate-900'}`}>
                                                            {formData.accountHolder || formData.accountName || 'NOT FOUND'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="font-bold text-slate-400 uppercase tracking-widest">A/C Number</span>
                                                        <span className={`font-black font-mono tracking-widest ${!formData.accountNumber ? 'text-rose-500 font-black' : 'text-slate-900'}`}>
                                                            {formData.accountNumber || 'NOT FOUND'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-2">Security Rules</h3>
                                                <ul className="space-y-2">
                                                    <li className="flex items-start gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight"><Check size={14} className="text-emerald-500 shrink-0"/> Withdrawal Limits: Min LKR 2,000 to Max Available Pool LKR.</li>
                                                    <li className="flex items-start gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight"><Clock size={14} className="text-amber-500 shrink-0"/> Processing usually executes within 24 to 48 banking hours.</li>
                                                    <li className="flex items-start gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight"><AlertCircle size={14} className="text-rose-500 shrink-0"/> Funds will be securely frozen into a tracking hold instantly.</li>
                                                </ul>
                                            </div>

                                            <div className="py-4 border-t border-slate-100">
                                                <label className="flex items-start gap-3 cursor-pointer group">
                                                    <div className="relative flex items-start mt-0.5">
                                                        <input type="checkbox" checked={isAgreed} onChange={(e)=>setIsAgreed(e.target.checked)} className="peer sr-only" />
                                                        <div className="w-5 h-5 border-2 border-slate-300 rounded-lg group-hover:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-colors flex items-center justify-center">
                                                            <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-relaxed">I have securely cross-verfied my mapped Bank Target and Identity specs. I am validating these financial terms explicitly.</p>
                                                </label>
                                            </div>

                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Digital Signature Verification</label>
                                                <div className="relative border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl overflow-hidden hover:border-slate-300 transition-colors">
                                                    <canvas 
                                                        ref={canvasRef}
                                                        width={400} 
                                                        height={120} 
                                                        className="w-full h-[120px] touch-none cursor-crosshair"
                                                        onMouseDown={startDrawing}
                                                        onMouseMove={draw}
                                                        onMouseUp={stopDrawing}
                                                        onMouseLeave={stopDrawing}
                                                        onTouchStart={startDrawing}
                                                        onTouchMove={draw}
                                                        onTouchEnd={stopDrawing}
                                                    ></canvas>
                                                    {hasSignature && (
                                                        <button type="button" onClick={clearSignature} className="absolute top-2 right-2 p-1.5 bg-rose-100 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-200 transition">Clear</button>
                                                    )}
                                                    {!hasSignature && (
                                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                            <span className="text-slate-300 font-black uppercase tracking-[0.3em] text-sm opacity-50">Sign Here</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                        </div>

                                    </div>

                                    <div className="pt-6 border-t border-slate-100">
                                        <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 rounded-2xl text-white text-sm font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50">
                                            {isSubmitting ? 'Freezing Requested Sum...' : 'Commit Secure Withdrawal Pipeline'}
                                        </button>
                                        <p className="text-center text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Amount securely shifts directly to Hold Status preventing double spends.</p>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                                
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date Logged</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger ID</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Request</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Vault Bank Scope</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Validation Point</th>
                                                <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Modifiers</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.length === 0 ? (
                                                <tr><td colSpan="6" className="py-8 text-center text-slate-400 text-sm font-bold">No historical routing requests linked to ledger.</td></tr>
                                            ) : history.map((req) => (
                                                <tr key={req._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-4 text-xs font-bold text-slate-600">{new Date(req.createdAt).toLocaleDateString()}</td>
                                                    <td className="py-4 text-xs font-black font-mono tracking-tighter text-slate-500">{req.referenceNumber}</td>
                                                    <td className="py-4 text-sm font-black tabular-nums text-slate-900">Rs. {req.amount.toLocaleString()}</td>
                                                    <td className="py-4 text-xs font-bold text-slate-600 truncate max-w-[150px] uppercase">
                                                        {req.type === 'INVESTMENT' ? (
                                                            <span>{req.bankName} (FD PLAN)</span>
                                                        ) : (
                                                            <span>{req.bankName} (*{req.accountNumber?.slice(-4)})</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`text-[10px] px-2.5 py-1 font-black uppercase tracking-widest rounded-lg border ${getStatusTheme(req.status)}`}>
                                                            {req.status.replace('_',' ')}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={()=>setDetailsRequest(req)} className="p-2 bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition" title="Timeline Details & Export">
                                                                 <Eye size={16}/>
                                                            </button>
                                                            {req.type === 'WITHDRAWAL' && ['PENDING', 'UNDER_REVIEW'].includes(req.status) && (
                                                                <button onClick={()=>setCancellingRequest(req)} className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-lg transition" title="Safely Refund Hold Back To Pool">
                                                                    <Trash2 size={16}/>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Mobile Cards */}
                                <div className="lg:hidden space-y-4">
                                    {history.map(req => (
                                        <div key={req._id} className="p-5 border border-slate-100 rounded-2xl shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-xs text-slate-400 font-bold mb-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                    <p className="font-black text-lg text-slate-900">Rs. {req.amount.toLocaleString()}</p>
                                                </div>
                                                <span className={`text-[9px] px-2 py-1 font-black uppercase tracking-widest rounded-lg border ${getStatusTheme(req.status)}`}>
                                                    {req.status.replace('_',' ')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold uppercase truncate mb-4">
                                                Ref: {req.referenceNumber} | {req.type === 'INVESTMENT' ? `${req.bankName} (FD)` : `${req.bankName} (*${req.accountNumber?.slice(-4)})`}
                                            </p>
                                            
                                            <div className="flex gap-2 border-t border-slate-100 pt-4">
                                                <button onClick={()=>setDetailsRequest(req)} className="flex-1 py-2 bg-slate-100 font-black uppercase text-[10px] text-slate-600 rounded-lg">Details/PDF</button>
                                                {req.type === 'WITHDRAWAL' && ['PENDING', 'UNDER_REVIEW'].includes(req.status) && (
                                                    <button onClick={()=>setCancellingRequest(req)} className="flex-1 py-2 bg-rose-50 font-black uppercase text-[10px] text-rose-600 rounded-lg">Cancel</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
    );
};

export default Withdraw;
