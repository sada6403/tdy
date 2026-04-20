import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import {
    Download, Info, ChevronLeft, CreditCard,
    Building2, Hash, User, DollarSign, FileText, CheckCircle2,
    History, Clock, RefreshCw
} from 'lucide-react';

const AddCash = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('request'); // 'request' | 'history'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        amount: '',
        referenceNumber: '',
        note: ''
    });
    const [file, setFile] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [fileName, setFileName] = useState('');
    const [depositHistory, setDepositHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        if (user && activeTab === 'history') fetchHistory();
    }, [user, activeTab]);

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const res = await api.get('/customer/deposit-history');
            if (res.success) setDepositHistory(res.data || []);
        } catch (err) {
            console.error('Deposit history error:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    if (loading) return null;
    if (!user) { navigate('/company/nf-plantation/login'); return null; }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Prevent negative values for amount
        if (name === 'amount' && value !== '' && parseFloat(value) < 0) {
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Check if it's a PDF
            if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
                setErrors(prev => ({ ...prev, file: 'ONLY PDF FILES ARE ALLOWED FOR RECEIPT UPLOADS' }));
                setFile(null);
                setFileName('');
                return;
            }

            setFile(selectedFile);
            setFileName(selectedFile.name);
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.file;
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.amount) newErrors.amount = 'Amount is required';
        else if (isNaN(formData.amount) || Number(formData.amount) <= 0) newErrors.amount = 'Enter a valid positive amount';
        
        if (!formData.referenceNumber) newErrors.referenceNumber = 'Reference number is required';
        if (!file) newErrors.file = 'Payment proof (PDF Bank Slip) is required';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('amount', formData.amount);
            data.append('referenceNumber', formData.referenceNumber);
            data.append('note', formData.note);
            data.append('bankProof', file);

            // Pass undefined Content-Type so axios auto-sets multipart/form-data with boundary
            const response = await api.post('/customer/deposit-request', data, {
                headers: { 'Content-Type': undefined }
            });

            if (response.success) {
                // Success celebration!
                setIsSuccess(true);
                // Scroll to top to see success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Deposit Error:', error);
            const serverMsg = error.message || 'Failed to submit deposit request. Please try again.';
            if (serverMsg.toLowerCase().includes('reference')) {
                setErrors(prev => ({ ...prev, referenceNumber: serverMsg }));
            } else {
                alert(serverMsg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                {/* Backdrop Blur */}
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"></div>
                
                {/* Success Modal */}
                <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-white dark:border-slate-800 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                    <div className="flex flex-col items-center text-center">
                        {/* Dynamic Icon */}
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse"></div>
                            <div className="relative w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40 transform rotate-12 transition-transform hover:rotate-0">
                                <CheckCircle2 size={48} />
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Submission Success!</h2>
                        
                        <div className="space-y-6">
                            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                                <p className="text-emerald-700 dark:text-emerald-400 font-black text-lg uppercase tracking-wide leading-snug">
                                    Successfully your request sended
                                </p>
                                <div className="h-0.5 w-12 bg-emerald-200 dark:bg-emerald-800 mx-auto my-4"></div>
                                <p className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-[11px] leading-relaxed">
                                    Your deposit will be verified and added to your wallet in 5 to 6 hours during working days.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 py-4 border-y border-slate-50 dark:border-slate-800">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Amount</span>
                                    <span className="text-slate-900 dark:text-white font-mono">Rs. {new Intl.NumberFormat('en-LK').format(formData.amount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Ref No</span>
                                    <span className="text-slate-900 dark:text-white font-mono">{formData.referenceNumber}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/company/nf-plantation/dashboard')}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all active:scale-[0.98]"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'UNDER_REVIEW': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'REJECTED': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Breadcrumb & Title */}
            <div className="mb-8 flex items-center gap-4">
                <button onClick={() => navigate('/company/nf-plantation/dashboard')} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-emerald-600 transition-all active:scale-95 shadow-sm">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Add Cash</h1>
                    <p className="text-sm text-slate-500 font-medium">Deposit funds to your wallet for new investments</p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-8 border-b border-slate-100 dark:border-slate-800">
                {[
                    { id: 'request', label: 'New Deposit', icon: <DollarSign size={16} /> },
                    { id: 'history', label: 'Deposit History', icon: <History size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                        {tab.icon} {tab.label}
                        {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full" />}
                    </button>
                ))}
            </div>

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between items-center mb-6">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">All your deposit requests</p>
                        <button onClick={fetchHistory} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
                            <RefreshCw size={16} className={historyLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    {historyLoading ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-20 text-center border border-slate-100 dark:border-slate-800">
                            <RefreshCw size={24} className="animate-spin text-emerald-500 mx-auto mb-4" />
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading history...</p>
                        </div>
                    ) : depositHistory.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-20 text-center border border-dashed border-slate-200 dark:border-slate-700">
                            <History size={40} className="mx-auto text-slate-300 mb-4" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-2">No Deposits Yet</h3>
                            <p className="text-slate-500 font-medium mb-6">You haven't made any deposit requests.</p>
                            <button onClick={() => setActiveTab('request')} className="px-6 py-3 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-colors">
                                Make First Deposit
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {depositHistory.map((dep, i) => (
                                <div key={dep._id || i} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                                            <DollarSign size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                LKR {(dep.amount || 0).toLocaleString()}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                REF: {dep.referenceNumber || dep._id?.slice(-8).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Clock size={10} className="inline mr-1" />
                                                {dep.createdAt ? new Date(dep.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(dep.status)}`}>
                                            {dep.status || 'PENDING'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'request' && (

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                
                {/* Left Side: Form */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Tracking ID</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"><User size={18} /></div>
                                        <input disabled value={`U-${user.id || '2849'}`} className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl px-14 py-4 text-sm font-black text-slate-400 capitalize" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Transfer Amount (LKR)</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 font-black">Rs</div>
                                        <input name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleInputChange} placeholder="0.00" className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.amount ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700'} rounded-2xl px-14 py-4 text-base font-black text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all`} />
                                    </div>
                                    {errors.amount && <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.amount}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bank Slip Reference Number</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"><Hash size={18} /></div>
                                    <input name="referenceNumber" value={formData.referenceNumber} onChange={handleInputChange} type="text" placeholder="TXN-90201844" className={`w-full bg-slate-50 dark:bg-slate-800 border ${errors.referenceNumber ? 'border-rose-500' : 'border-slate-100 dark:border-slate-700'} rounded-2xl px-14 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all uppercase tracking-widest`} />
                                </div>
                                {errors.referenceNumber ? (
                                    <p className="text-[10px] text-rose-500 font-bold ml-1 uppercase">{errors.referenceNumber}</p>
                                ) : (
                                    <p className="text-[9px] text-slate-400 font-bold ml-1 uppercase tracking-wider italic">Enter the unique transaction ID from your mobile app or bank receipt</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Optional Note</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-6 text-slate-300"><FileText size={18} /></div>
                                    <textarea name="note" value={formData.note} onChange={handleInputChange} rows="3" placeholder="Additional details..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-14 py-4 text-sm font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"></textarea>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Upload Payment Proof</label>
                                <div className={`group relative border-2 border-dashed ${errors.file ? 'border-rose-500 bg-rose-50/50' : file ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 animate-pulse'} rounded-[2rem] p-10 text-center hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all cursor-pointer overflow-hidden active:scale-[0.99]`}>
                                    <div className="relative z-10">
                                        <div className={`w-16 h-16 ${errors.file ? 'bg-rose-500 text-white' : file ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-300'} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:text-emerald-500 transition-colors shadow-sm`}>
                                            {errors.file ? <Info size={28} /> : file ? <CheckCircle2 size={28} /> : <Download size={28} />}
                                        </div>
                                        <p className={`text-sm font-black ${errors.file ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400'}`}>{errors.file || fileName || 'Click to Upload Bank Slip'}</p>
                                        {!errors.file && <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">PDF ONLY (Max 5MB)</p>}
                                    </div>
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" accept=".pdf" />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Processing Request...' : 'Submit Deposit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side: Bank Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-emerald-50/50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 bg-emerald-500/20 w-32 h-32 blur-2xl rounded-full"></div>
                        
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-6 border-b border-emerald-100/50 pb-3">Bank Information</h3>
                        
                        <div className="space-y-6">
                            <div className="space-y-1 group/item">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Bank Name</span>
                                <span className="text-base font-black tracking-tight text-slate-800 dark:text-slate-200 group-hover/item:text-emerald-600 transition-colors uppercase">Commercial Bank</span>
                            </div>
                            <div className="space-y-1 group/item">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Account Name</span>
                                <span className="text-base font-black tracking-tight text-slate-800 dark:text-slate-200 group-hover/item:text-emerald-600 transition-colors uppercase whitespace-nowrap">Natural Plantation</span>
                            </div>
                            <div className="space-y-1 group/item">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Account Number</span>
                                <span className="text-xl font-black tracking-[0.1em] text-emerald-600 font-mono">1001023531</span>
                            </div>
                            <div className="space-y-1 group/item">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Branch</span>
                                <span className="text-base font-black tracking-tight text-slate-800 dark:text-slate-200 group-hover/item:text-emerald-600 transition-colors uppercase">Kilinochchi</span>
                            </div>
                        </div>

                        <div className="mt-8 p-5 bg-white/60 dark:bg-slate-800/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
                            <div className="flex items-start gap-3">
                                <Info size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                                <p className="text-[10px] leading-relaxed font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
                                    Your deposit will be verified and added to your wallet in 5 to 6 hours during working days.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-5">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Security</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Monitored transactions</p>
                        </div>
                    </div>
                </div>

            </div>
            )}

        </div>
    );
};

export default AddCash;
