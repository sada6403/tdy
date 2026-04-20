import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import PaymentGateway from '../../../components/nfplantation/investment/PaymentGateway';
import {
    CreditCard, Building, FileText, CheckCircle, AlertCircle,
    ArrowLeft, Upload, Download, Shield, Clock, XCircle, ChevronRight,
    DollarSign, User
} from 'lucide-react';

const PaymentProcess = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Application State
    const [application, setApplication] = useState(null);
    const [status, setStatus] = useState('LOADING'); // LOADING, EMPTY, DRAFT, PENDING_APPROVAL, APPROVED, REJECTED, ACTIVE, PAYMENT_PENDING_VERIFICATION

    // Payment Process State
    const [step, setStep] = useState(1); // 1: Review Plan, 2: Method Selection, 3: Gateway/Upload, 4: Success
    const [paymentMethod, setPaymentMethod] = useState(''); // 'card', 'bank'
    const [isProcessing, setIsProcessing] = useState(false);

    // Form States (for Step 1)
    const [planDetails, setPlanDetails] = useState({
        amount: '',
        duration: '1', // 1, 2, 3, bonus
        interestRate: '3%'
    });

    // Input States (for Step 3)
    const [receiptData, setReceiptData] = useState({
        referenceNo: '',
        transferDate: new Date().toISOString().split('T')[0],
        amount: '',
        receiptFile: null,
        previewUrl: null
    });

    // 1. Load Data on Mount
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/company/nf-plantation/login');
            return;
        }

        const loadData = () => {
            try {
                const savedApp = localStorage.getItem('nf_investment_application');
                if (savedApp) {
                    const parsed = JSON.parse(savedApp);
                    setApplication(parsed);
                    setStatus(parsed.status || 'DRAFT');

                    // Pre-fill data
                    if (parsed.data) {
                        setPlanDetails({
                            amount: parsed.data.amount || '',
                            duration: parsed.data.duration || '1',
                            interestRate: parsed.data.interestRate || '3%'
                        });
                        // Also set receipt amount
                        setReceiptData(prev => ({ ...prev, amount: parsed.data.amount }));
                    }
                } else {
                    setStatus('EMPTY');
                }
            } catch (e) {
                console.error("Failed to load application", e);
                setStatus('EMPTY');
            }
        };

        if (!authLoading) {
            loadData();
        }
    }, [authLoading, user, navigate]);

    // Handlers
    const handlePlanChange = (field, value) => {
        setPlanDetails(prev => ({ ...prev, [field]: value }));

        // Auto update interest based on duration (Mock logic)
        if (field === 'duration') {
            const rates = { '1': '3%', '2': '3.5%', '3': '4%', 'bonus': '5%' };
            setPlanDetails(prev => ({ ...prev, duration: value, interestRate: rates[value] || '3%' }));
        }
    };

    const handleStep1Submit = () => {
        // Update application data with reviewed details
        const updatedApp = {
            ...application,
            data: {
                ...application.data,
                amount: planDetails.amount,
                duration: planDetails.duration,
                interestRate: planDetails.interestRate
            }
        };
        localStorage.setItem('nf_investment_application', JSON.stringify(updatedApp));
        setApplication(updatedApp);
        setReceiptData(prev => ({ ...prev, amount: planDetails.amount }));
        setStep(2);
    };

    const handleReceiptChange = (e) => {
        const { name, value } = e.target;
        setReceiptData({ ...receiptData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setReceiptData({
                ...receiptData,
                receiptFile: file,
                previewUrl: URL.createObjectURL(file)
            });
        }
    };

    const updateApplicationStatus = (newStatus, paymentDetails = null) => {
        const updatedApp = {
            ...application,
            status: newStatus,
            payment: paymentDetails || application.payment
        };
        localStorage.setItem('nf_investment_application', JSON.stringify(updatedApp));
        setApplication(updatedApp);
        setStatus(newStatus);
    };

    const processCardPayment = () => {
        setStep(4); // Success Screen

        const paymentDetails = {
            method: 'card',
            transactionId: 'TXN-' + Math.floor(Math.random() * 10000000),
            date: new Date().toISOString(),
            amount: planDetails.amount
        };

        setTimeout(() => {
            updateApplicationStatus('ACTIVE', paymentDetails);
        }, 3000);
    };

    const submitBankReceipt = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            const paymentDetails = {
                method: 'bank_transfer',
                referenceNo: receiptData.referenceNo,
                date: receiptData.transferDate,
                amount: receiptData.amount,
                receiptFile: receiptData.previewUrl
            };
            updateApplicationStatus('PAYMENT_PENDING_VERIFICATION', paymentDetails);
        }, 2000);
    };

    // --- Render Logic ---

    if (status === 'LOADING' || authLoading) {
        return (
            <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
                        <p className="text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Initializing Secure Gateway...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'EMPTY' || status === 'REJECTED' || status === 'PENDING_APPROVAL') {
        if (status === 'EMPTY') return (
            <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="max-w-lg mx-auto text-center py-10">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
                        <AlertCircle size={64} className="mx-auto text-amber-500 mb-6" />
                        <h2 className="text-2xl font-black dark:text-white mb-4 uppercase tracking-tight">No Active Registry</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">We could not locate any pending investment application for your profile.</p>
                        <button onClick={() => navigate('/company/nf-plantation/dashboard/fd-plans')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all w-full">Initialize Plan Registry</button>
                    </div>
                </div>
            </div>
        );
        if (status === 'PENDING_APPROVAL') return (
            <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="max-w-lg mx-auto text-center py-10">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-amber-500/30">
                        <Clock size={64} className="mx-auto text-amber-500 mb-6" />
                        <h2 className="text-2xl font-black dark:text-white mb-4 uppercase tracking-tight">Protocol Pending</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Your investment application is currently undergoing administrative verification.</p>
                        <button onClick={() => navigate('/company/nf-plantation/dashboard/fd-plans')} className="bg-slate-900 dark:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 active:scale-95 transition-all w-full">Review Application Status</button>
                    </div>
                </div>
            </div>
        );
        if (status === 'REJECTED') return (
            <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="max-w-lg mx-auto text-center py-10">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-red-500/30">
                        <XCircle size={64} className="mx-auto text-red-500 mb-6" />
                        <h2 className="text-2xl font-black dark:text-white mb-4 uppercase tracking-tight">Registry Declined</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Your application was not approved. Please review the remarks and resubmit.</p>
                        <button onClick={() => navigate('/company/nf-plantation/dashboard/fd-plans')} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-red-700 active:scale-95 transition-all w-full">Re-Initialize Registry</button>
                    </div>
                </div>
            </div>
        );
    }

    // Status: PAYMENT_PENDING_VERIFICATION or ACTIVE (Success Views)
    if (status === 'PAYMENT_PENDING_VERIFICATION' || status === 'ACTIVE') {
        if (status === 'PAYMENT_PENDING_VERIFICATION') return (
            <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-blue-500/30 text-center">
                    <Shield size={64} className="mx-auto text-blue-500 mb-6" />
                    <h2 className="text-3xl font-black dark:text-white mb-4 uppercase tracking-tighter">Verification in Pipeline</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg mb-8 leading-relaxed">
                        Your transaction receipt has been submitted. Our fiscal department is verifying the transfer details.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl text-left border border-blue-100 dark:border-blue-900/30 mb-8">
                        <p className="text-xs text-blue-800 dark:text-blue-300 font-bold uppercase tracking-widest mb-1">Institutional Note</p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            Verification typically completes within 12-24 business hours. Your dashboard will reflect "ACTIVE" status once confirmed.
                        </p>
                    </div>
                    <button onClick={() => navigate('/company/nf-plantation/dashboard')} className="bg-slate-900 dark:bg-slate-800 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all w-full md:w-auto">
                        Back to Command Center
                    </button>
                </div>
            </div>
        );

        if (status === 'ACTIVE') return (
            <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 border border-emerald-500/30 shadow-2xl text-center">
                        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle size={56} className="text-emerald-500" />
                        </div>
                        <h1 className="text-4xl font-black dark:text-white mb-4 uppercase tracking-tighter">Registry Active</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-mono text-sm uppercase tracking-widest mb-10">Vault Reference: {application.payment?.transactionId}</p>
                        <button onClick={() => navigate('/company/nf-plantation/dashboard')} className="bg-emerald-600 text-white hover:bg-emerald-700 px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">Go to Command Center</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN FLOW (Steps 1, 2, 3, 4) ---

    // Intermediate Success Screen (Card Payment) - Step 4
    if (step === 4) {
        return (
            <div className="fixed inset-0 z-50 bg-emerald-600 flex items-center justify-center p-4">
                <div className="text-center text-white animate-in zoom-in duration-500">
                    <CheckCircle size={80} className="mx-auto mb-6" />
                    <h1 className="text-5xl font-black mb-2 uppercase tracking-tighter">SUCCESS!</h1>
                    <p className="text-emerald-100 font-bold uppercase tracking-[0.3em] text-xs">Registry Activated Instantly</p>
                </div>
            </div>
        );
    }

    // Steps 1-3
    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10 transition-colors duration-300">
            <main className="max-w-5xl">

                {/* Stepper Header (Simplified) */}
                <div className="flex items-center justify-between gap-4 mb-8 overflow-x-auto pb-4">
                    {[
                        { id: 1, icon: DollarSign, label: 'Investment Details' },
                        { id: 2, icon: CreditCard, label: 'Payment Method' },
                        { id: 3, icon: Shield, label: 'Secure Payment' },
                        { id: 4, icon: CheckCircle, label: 'Completion' }
                    ].map((s) => (
                        <div key={s.id} className={`flex items-center gap-2 min-w-fit ${step >= s.id ? 'text-emerald-600' : 'text-gray-300'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= s.id ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                                <s.icon size={18} />
                            </div>
                            <span className={`text-sm font-bold hidden md:block ${step === s.id ? 'text-gray-900 dark:text-white' : ''}`}>{s.label}</span>
                            {s.id < 4 && <div className="w-12 h-1 bg-gray-200 dark:bg-gray-800 mx-2 rounded-full hidden md:block" />}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="">

                    {/* Step 1: Investment Details Review */}
                    {step === 1 && (
                        <div className="animate-in slide-in-from-right-4">
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Investment Details</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Investment Amount (LKR) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={planDetails.amount}
                                                onChange={(e) => handlePlanChange('amount', e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 text-xl font-bold bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-gray-900 dark:text-white"
                                                placeholder="500,000"
                                            />
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">LKR</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Monthly Interest Rate</label>
                                        <div className="w-full px-4 py-4 text-xl font-bold bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500">
                                            {planDetails.interestRate}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Plan Duration <span className="text-red-500">*</span></label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { id: '1', title: '1 Year', sub: '12 Months', rate: '3% / Mo' },
                                            { id: '2', title: '2 Years', sub: '24 Months', rate: '3.5% / Mo' },
                                            { id: '3', title: '3 Years', sub: '36 Months', rate: '4% / Mo' },
                                            { id: 'bonus', title: 'Bonus Plan', sub: '6 Months', rate: '5% / Mo' },
                                        ].map((plan) => (
                                            <div
                                                key={plan.id}
                                                onClick={() => handlePlanChange('duration', plan.id)}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center ${planDetails.duration === plan.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200'}`}
                                            >
                                                <h4 className={`font-bold text-lg ${planDetails.duration === plan.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>{plan.title}</h4>
                                                <p className="text-xs text-gray-500 mt-1">{plan.sub}</p>
                                                <p className="text-xs font-bold text-emerald-600 mt-2">{plan.rate}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Coupon / Offer Code <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl focus:border-emerald-500 outline-none bg-transparent"
                                        placeholder="Enter code if any"
                                    />
                                </div>

                                <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
                                    <button onClick={() => navigate('/company/nf-plantation/dashboard')} className="flex items-center gap-2 font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white px-4 py-2 rounded-lg transition-colors">
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button onClick={handleStep1Submit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all">
                                        Next Step <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Method Selection */}
                    {step === 2 && (
                        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 animate-in slide-in-from-right-4">
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Select Payment Method</h2>
                                <p className="text-sm text-gray-500 mt-1">Total to pay: <span className="font-bold text-emerald-600">LKR {Number(planDetails.amount).toLocaleString()}</span></p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">Pay Online (Card)</h4>
                                            <p className="text-xs md:text-sm text-gray-500">Instant activation. Visa, Mastercard, Amex.</p>
                                        </div>
                                    </div>
                                    <input type="radio" name="method" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500" />
                                </label>

                                <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                            <Building size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">Bank Transfer / Deposit</h4>
                                            <p className="text-xs md:text-sm text-gray-500">Upload receipt. Requires verification.</p>
                                        </div>
                                    </div>
                                    <input type="radio" name="method" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500" />
                                </label>
                            </div>

                            <div className="flex justify-between items-center">
                                <button onClick={() => setStep(1)} className="flex items-center gap-2 font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white px-4 py-2 rounded-lg transition-colors">
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!paymentMethod}
                                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all"
                                >
                                    Proceed to Pay <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Gateway / Upload */}
                    {step === 3 && (
                        <div className="animate-in slide-in-from-right-4">
                            {paymentMethod === 'card' ? (
                                <PaymentGateway
                                    amount={planDetails.amount}
                                    onSuccess={processCardPayment}
                                    onCancel={() => setStep(2)}
                                />
                            ) : (
                                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Receipt</h2>
                                        <button onClick={() => setStep(2)} className="text-sm font-bold text-emerald-600">Change Method</button>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 mb-6">
                                        <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2 text-sm"><Building size={16} /> Transfer Details</h3>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm text-blue-900 dark:text-blue-100">
                                            <p className="opacity-70">Bank:</p><p className="font-bold">Commercial Bank</p>
                                            <p className="opacity-70">Branch:</p><p className="font-bold">Kilinochchi</p>
                                            <p className="opacity-70">Account:</p><p className="font-bold font-mono">1001023531</p>
                                            <p className="opacity-70">Name:</p><p className="font-bold">Natural Plantation</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">Reference No <span className="text-red-500">*</span></label>
                                                <input name="referenceNo" value={receiptData.referenceNo} onChange={handleReceiptChange} className="input-field" placeholder="Ref ID" />
                                            </div>
                                            <div>
                                                <label className="label">Amount <span className="text-red-500">*</span></label>
                                                <input type="number" name="amount" value={receiptData.amount} onChange={handleReceiptChange} className="input-field" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="label">Upload Receipt <span className="text-red-500">*</span></label>
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 flex flex-col items-center justify-center hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all cursor-pointer relative min-h-[120px]">
                                                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,application/pdf" />
                                                <Upload className="text-gray-400 mb-2" size={24} />
                                                <p className="text-xs text-gray-500 font-bold">Click to upload</p>
                                            </div>
                                            {receiptData.previewUrl && (
                                                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-2 border border-gray-200 dark:border-gray-700">
                                                    <CheckCircle size={16} className="text-emerald-500" />
                                                    <span className="text-xs font-medium truncate flex-1 dark:text-gray-300">{receiptData.receiptFile?.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-center mt-6">
                                            <button onClick={() => setStep(2)} className="flex items-center gap-2 font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white px-4 py-2 rounded-lg transition-colors">
                                                <ArrowLeft size={18} /> Back
                                            </button>
                                            <button onClick={submitBankReceipt} disabled={isProcessing || !receiptData.referenceNo || !receiptData.receiptFile} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition-all">
                                                {isProcessing ? 'Submitting...' : 'Confirm'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PaymentProcess;
