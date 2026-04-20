import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { 
    User, FileText, CheckCircle, Wallet, ArrowRight, Check,
    ChevronLeft, Shield, AlertCircle, TrendingUp, Info
} from 'lucide-react';

const FDActivationFlow = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Core Data States
    const [profile, setProfile] = useState(null);
    const [wallet, setWallet] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    // Flow State
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [errors, setErrors] = useState({});
    const [allPlans, setAllPlans] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        amount: '',
        profitDestination: '',
        note: '',
        rulesAccepted: false,
        nicInput: '',
        selectedPlanId: planId || 'default'
    });

    // Signature Canvas Ref
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [showPlanDetails, setShowPlanDetails] = useState(false);
    const [signatureDataUrl, setSignatureDataUrl] = useState(null);

    // OTP State
    const [otpSent, setOtpSent] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    // NIC verification state
    const [nicVerified, setNicVerified] = useState(false);

    const handleSendOtp = async () => {
        try {
            setIsSendingOtp(true);
            await api.post('/customer/invest/send-otp');
            setOtpSent(true);
            setErrors(prev => ({ ...prev, otp: null }));
        } catch (error) {
            console.error(error);
            alert(error.message || "Failed to send OTP");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleNicChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, nicInput: val }));

        if (!profile?.nic) return;

        const profileNic = profile.nic.trim().toUpperCase();
        const inputNic = val.trim().toUpperCase();

        if (inputNic === profileNic) {
            setNicVerified(true);
            setErrors(prev => ({ ...prev, nicInput: null }));
            // Auto-send OTP once NIC is confirmed correct
            if (!otpSent && !otpVerified) {
                handleSendOtp();
            }
        } else if (inputNic.length >= profileNic.length) {
            setNicVerified(false);
            setErrors(prev => ({ ...prev, nicInput: 'NIC does not match our records' }));
        } else {
            setNicVerified(false);
            setErrors(prev => ({ ...prev, nicInput: null }));
        }
    };

    const handleVerifyOtp = async () => {
        try {
            setIsVerifyingOtp(true);
            await api.post('/customer/invest/verify-otp', { otp: otpInput });
            setOtpVerified(true);
            setErrors(prev => ({ ...prev, otp: null }));
        } catch (error) {
            console.error(error);
            setErrors(prev => ({ ...prev, otp: "Invalid or expired OTP" }));
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            try {
                const [profileRes, walletRes, plansRes] = await Promise.all([
                    api.get('/customer/profile'),
                    api.get('/customer/wallet').catch(() => ({ data: { availableBalance: 0 } })),
                    api.get('/customer/plans')
                ]);

                const proData = profileRes.data;

                setProfile(proData);
                setWallet(walletRes.data || walletRes);
                
                const activePlans = plansRes.data;
                setAllPlans(activePlans);

                let selected = null;
                const currentPlanId = formData.selectedPlanId;
                
                if (currentPlanId === 'default' && activePlans.length > 0) {
                    selected = activePlans[0];
                } else {
                    selected = activePlans.find(p => p._id === currentPlanId);
                }

                if (selected) {
                    setPlan(selected);
                    setFormData(prev => ({ 
                        ...prev, 
                        amount: prev.amount || selected.minAmount.toString(),
                        selectedPlanId: selected._id
                    }));
                }

            } catch (error) {
                console.error("Initialization Failed:", error);
                alert("Failed to load resources. Redirecting.");
                navigate('/company/nf-plantation/dashboard/fd-plans');
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, [planId, navigate]);

    // Signature Canvas Logic
    useEffect(() => {
        if (currentStep === 2 && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
        }
    }, [currentStep]);

    const startDrawing = (e) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.beginPath();
            setHasSignature(true);
        }
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        // Handle both mouse and touch events
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setHasSignature(false);
        }
    };


    const formatLKR = (val) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val || 0);

    const validateStep1 = () => {
        const newErrors = {};
        const amt = Number(formData.amount);
        if (!amt || isNaN(amt)) newErrors.amount = "Invalid amount entered";
        else if (amt < 100000) newErrors.amount = `Minimum amount is ${formatLKR(100000)}`;
        else if (amt > wallet.availableBalance) newErrors.amount = `Exceeds your available wallet balance (${formatLKR(wallet.availableBalance)})`;
        
        if (!formData.profitDestination) newErrors.profitDestination = "Please choose a profit destination";
        else if (formData.profitDestination === 'WALLET') newErrors.profitDestination = "Option B is currently unavailable. Please select Option A.";

        if (!formData.nicInput) newErrors.nicInput = "NIC verification is required";
        else if (formData.nicInput !== profile.nic) newErrors.nicInput = "NIC does not match our records";
        
        if (formData.note) {
            if (formData.note.length < 5) newErrors.note = "Notes must be at least 5 characters";
            if (formData.note.length > 50) newErrors.note = "Notes cannot exceed 50 characters";
        }

        if (!otpVerified) {
            newErrors.otpSystem = "Mobile OTP Verification is required before proceeding.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.rulesAccepted) newErrors.rulesAccepted = "You must read and agree to all rules";
        if (!hasSignature) newErrors.signatureConf = "A valid physical signature is mandatory";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        // Capture signature image when moving from step 2 → 3
        if (currentStep === 2 && canvasRef.current) {
            setSignatureDataUrl(canvasRef.current.toDataURL('image/png'));
        }
        setCurrentStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        if (!validateStep1() || !validateStep2()) {
            alert("Validation failed. Please review your inputs.");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await api.post('/customer/invest', {
                planId: plan._id,
                amountInvested: Number(formData.amount),
                profitDestination: formData.profitDestination,
                rulesAccepted: formData.rulesAccepted,
                signatureConfirmed: hasSignature,
                signatureData: signatureDataUrl || null,
                note: formData.note
            });

            setSuccessData(res.data);
            setCurrentStep(4); // Success screen
        } catch (error) {
            console.error(error);
            alert(error.message || "Failed to submit activation request");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
            <main className="max-w-4xl mx-auto">
                
                {currentStep < 4 && (
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Secure FD Activation</h1>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-200 tracking-widest uppercase">Contract Initialization Pipeline</p>
                        
                        {/* Stepper */}
                        <div className="flex justify-center items-center mt-8 gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${currentStep >= 1 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-200 text-slate-400'}`}>1</div>
                            <div className={`h-1 w-12 rounded-full ${currentStep >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${currentStep >= 2 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-200 text-slate-400'}`}>2</div>
                            <div className={`h-1 w-12 rounded-full ${currentStep >= 3 ? 'bg-emerald-600' : 'bg-slate-200'}`}></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${currentStep >= 3 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-200 text-slate-400'}`}>3</div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col relative">
                    
                    <div className="p-8 flex-1">
                        
                        {/* STEP 1: Details */}
                        {currentStep === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-8">
                                
                                {/* Readonly Profile Header */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-300 tracking-[0.2em] mb-1">Contractor Details</h3>
                                        <p className="font-bold text-slate-900 dark:text-white text-lg tracking-tight uppercase leading-tight">{profile.fullName}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase mt-1">Contractor ID: {profile.userId || 'N/A'}</p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Available Funding Source</h3>
                                        <p className="font-black text-emerald-600 text-xl tracking-tighter tabular-nums">{formatLKR(wallet.availableBalance)}</p>
                                    </div>
                                </div>

                                {/* Plan Selection & Summary */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-100 uppercase tracking-widest">Select Investment Plan <span className="text-red-500">*</span></label>
                                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                                        {allPlans.map(p => {
                                            const isSelected = formData.selectedPlanId === p._id;
                                            return (
                                                <div 
                                                    key={p._id}
                                                    onClick={() => {
                                                        setPlan(p);
                                                        setFormData({...formData, selectedPlanId: p._id, amount: p.minAmount.toString()});
                                                        setShowPlanDetails(false); // reset expanded view on change
                                                    }}
                                                    className={`min-w-[280px] shrink-0 snap-start relative p-5 rounded-2xl border-2 cursor-pointer transition-all overflow-hidden group ${isSelected ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300'}`}
                                                >
                                                    {isSelected && <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all -mr-6 -mt-6"></div>}
                                                    
                                                    <div className="flex justify-between items-start relative z-10">
                                                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                                            {p.duration} {p.durationUnit || 'Months'} Term
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                                            {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 relative z-10">
                                                        <p className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">{p.name}</p>
                                                        <p className="font-black text-emerald-600 text-xl tracking-tighter mt-1">{p.interestRate}% <span className="text-[10px] text-slate-500 dark:text-slate-100 tracking-widest uppercase align-middle">/ Month</span></p>
                                                    </div>
                                                    
                                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center relative z-10">
                                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-200 uppercase tracking-wider">Min: {formatLKR(p.minAmount)}</p>
                                                        {isSelected && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setShowPlanDetails(!showPlanDetails); }}
                                                                className="text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1.5 rounded-md transition-colors"
                                                            >
                                                                {showPlanDetails ? 'Close Details' : 'Learn More'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Dynamic Details Panel (visible if Lear More clicked on the selected plan) */}
                                {showPlanDetails && plan && (
                                    <div className="bg-slate-900 dark:bg-black rounded-2xl border border-slate-800 overflow-hidden text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                                        <div className="p-6 bg-gradient-to-r from-emerald-900/50 to-slate-900 border-b border-slate-800 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                                                <TrendingUp size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg uppercase tracking-tight text-white">{plan.name} Analytics</h3>
                                                <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Live Real-Time Calculator & Contract Terms</p>
                                            </div>
                                        </div>

                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Calculations */}
                                            <div className="space-y-5">
                                                <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-2">Calculated Returns on {formatLKR(Number(formData.amount) || plan.minAmount)}</h4>
                                                
                                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Interest Earnings</p>
                                                    <p className="font-black text-emerald-400 text-xl tracking-tight">
                                                        {formatLKR((Number(formData.amount) || plan.minAmount) * (plan.interestRate / 100))}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yearly Interest Earnings</p>
                                                    <p className="font-black text-amber-400 text-xl tracking-tight">
                                                        {formatLKR((Number(formData.amount) || plan.minAmount) * (plan.interestRate / 100) * 12)}
                                                    </p>
                                                </div>
                                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total {plan.duration} {plan.durationUnit || 'Months'} Maturity Profit</p>
                                                    <p className="font-black text-white text-2xl tracking-tighter">
                                                        {formatLKR((Number(formData.amount) || plan.minAmount) * (plan.interestRate / 100) * plan.duration)}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-500 mt-1">Plus return of {formatLKR(Number(formData.amount) || plan.minAmount)} Capital</p>
                                                </div>
                                            </div>

                                            {/* Penalty Rules */}
                                            <div>
                                                <h4 className="text-[10px] uppercase tracking-[0.2em] font-black text-rose-500 mb-4 flex items-center gap-2">
                                                    <AlertCircle size={14} /> Early Break Penalties
                                                </h4>
                                                
                                                <div className="space-y-4">
                                                    {plan.duration <= 12 && (
                                                        <ul className="space-y-3 text-xs font-medium text-slate-300">
                                                            <li className="flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                                                                <span><span className="text-white font-bold">Break within 3 Months:</span> You will lose exactly 75% of your total earned profits.</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                                                                <span><span className="text-white font-bold">Break at 6 Months:</span> You will lose exactly 50% of your total earned profits.</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                                                                <span><span className="text-white font-bold">Break before Maturity:</span> 25% of the profit will be aggressively deducted.</span>
                                                            </li>
                                                        </ul>
                                                    )}
                                                    {plan.duration > 12 && plan.duration <= 24 && (
                                                        <ul className="space-y-3 text-xs font-medium text-slate-300">
                                                            <li className="flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                                                                <span><span className="text-white font-bold">Break within 6 Months:</span> You will lose exactly 75% of your total earned profits.</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                                                                <span><span className="text-white font-bold">Break at 12 Months:</span> You will lose exactly 50% of your total earned profits.</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                                                                <span><span className="text-white font-bold">Break before Maturity:</span> 25% of the profit will be aggressively deducted.</span>
                                                            </li>
                                                        </ul>
                                                    )}
                                                    {plan.duration > 24 && (
                                                        <ul className="space-y-3 text-xs font-medium text-slate-300">
                                                            <li className="flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                                                                <span><span className="text-white font-bold">Break within 12 Months:</span> You will lose exactly 75% of your total earned profits.</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                                                                <span><span className="text-white font-bold">Break at 24 Months:</span> You will lose exactly 50% of your total earned profits.</span>
                                                            </li>
                                                            <li className="flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                                                                <span><span className="text-white font-bold">Break before Maturity:</span> 25% of the profit will be aggressively deducted.</span>
                                                            </li>
                                                        </ul>
                                                    )}
                                                </div>
                                                <div className="mt-6 p-3 bg-rose-900/20 border border-rose-900/50 rounded-xl">
                                                    <p className="text-[10px] leading-relaxed text-rose-300">
                                                        * Termination of the contract triggers a manual verification process before capital is released. Profit calculations are locked by the system based on days elapsed.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-700 dark:text-slate-100 uppercase tracking-widest mb-2">Finalization Amount (Rs.) <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            inputMode="numeric"
                                            value={formData.amount} 
                                            onChange={(e) => {
                                                // 1. Allow only digits (remove anything else)
                                                let valString = e.target.value.replace(/[^0-9]/g, '');
                                                let valNumber = Number(valString);
                                                
                                                // 2. Auto-clamp: If higher than wallet, set it to the maximum wallet balance
                                                if (valNumber > wallet.availableBalance) {
                                                    valString = wallet.availableBalance.toString();
                                                }
                                                
                                                setFormData({...formData, amount: valString});
                                            }}
                                            className={`w-full p-4 font-black text-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-xl outline-none focus:ring-4 focus:border-emerald-500 transition-all ${errors.amount ? 'border-red-500 focus:ring-red-100' : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500/20'}`}
                                            placeholder="Enter amount (Min 100,000)"
                                        />
                                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-100 uppercase mt-2 tracking-widest">Authorized Ceiling: {formatLKR(wallet.availableBalance)}</p>
                                        {errors.amount && <p className="text-red-500 text-xs font-bold uppercase tracking-wider mt-2 flex items-center gap-1"><AlertCircle size={14}/> {errors.amount}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-black text-slate-700 dark:text-slate-100 uppercase tracking-widest mb-2">Verify NIC Number <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.nicInput}
                                                onChange={handleNicChange}
                                                className={`w-full p-4 pr-12 font-black bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-xl outline-none focus:ring-4 transition-all ${
                                                    nicVerified
                                                        ? 'border-emerald-500 focus:ring-emerald-500/20'
                                                        : errors.nicInput
                                                            ? 'border-red-500 focus:ring-red-100'
                                                            : 'border-slate-200 dark:border-slate-700 focus:ring-emerald-500/20 focus:border-emerald-500'
                                                }`}
                                                placeholder="Enter your registered NIC"
                                            />
                                            {nicVerified && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            )}
                                            {errors.nicInput && !nicVerified && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                                                    <AlertCircle size={18} />
                                                </div>
                                            )}
                                        </div>
                                        {nicVerified && (
                                            <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mt-2 flex items-center gap-1">
                                                <Check size={13} /> NIC verified — OTP sent to your mobile
                                            </p>
                                        )}
                                        {errors.nicInput && !nicVerified && (
                                            <p className="text-red-500 text-xs font-bold uppercase tracking-wider mt-2 flex items-center gap-1">
                                                <AlertCircle size={14}/> {errors.nicInput}
                                            </p>
                                        )}

                                        {/* OTP Security Layer */}
                                        <div className={`mt-6 p-5 border-2 rounded-2xl transition-all ${nicVerified ? 'border-emerald-100 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 opacity-60 pointer-events-none'}`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Shield className="text-emerald-600 w-4 h-4" />
                                                <label className="block text-[10px] font-black text-slate-700 dark:text-slate-100 uppercase tracking-[0.2em]">Mobile Authorization <span className="text-red-500">*</span></label>
                                            </div>
                                            
                                            {otpVerified ? (
                                                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                        <Check size={16} />
                                                    </div>
                                                     <div>
                                                        <p className="text-xs font-black uppercase text-emerald-600">Identity Verified</p>
                                                        <p className="text-[10px] font-bold text-slate-500 pr-2">Your registered mobile number (
                                                            {(() => {
                                                                const phoneVal = profile?.phone && profile.phone.trim().toUpperCase() !== 'N/A' ? profile.phone : null;
                                                                const mobileVal = profile?.mobile && profile.mobile.trim().toUpperCase() !== 'N/A' ? profile.mobile : null;
                                                                const finalNum = phoneVal || mobileVal;
                                                                
                                                                return finalNum 
                                                                    ? `${finalNum.substring(0, 3)}***${finalNum.substring(finalNum.length - 2)}`
                                                                    : 'NOT REGISTERED';
                                                            })()}
                                                        ) has been securely validated.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-100 uppercase leading-relaxed">
                                                        An OTP will be sent to your registered mobile: <span className="font-black text-slate-700 dark:text-white">
                                                            {(() => {
                                                                const phoneVal = profile?.phone && profile.phone.trim().toUpperCase() !== 'N/A' ? profile.phone : null;
                                                                const mobileVal = profile?.mobile && profile.mobile.trim().toUpperCase() !== 'N/A' ? profile.mobile : null;
                                                                const finalNum = phoneVal || mobileVal;
                                                                
                                                                return finalNum 
                                                                    ? `${finalNum.substring(0, 3)}***${finalNum.substring(finalNum.length - 2)}`
                                                                    : 'NOT REGISTERED';
                                                            })()}
                                                        </span>
                                                    </p>
                                                    
                                                    {!otpSent ? (
                                                        <button 
                                                            type="button"
                                                            onClick={handleSendOtp}
                                                            disabled={isSendingOtp}
                                                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                                                        >
                                                            {isSendingOtp ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> : 'Send Secure OTP'}
                                                        </button>
                                                    ) : (
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="text" 
                                                                maxLength="6"
                                                                value={otpInput}
                                                                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                                                placeholder="Enter 6-digit OTP"
                                                                className={`flex-1 p-3 text-center tracking-[0.3em] font-black text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 ${errors.otp ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                                            />
                                                            <button 
                                                                type="button"
                                                                onClick={handleVerifyOtp}
                                                                disabled={otpInput.length !== 6 || isVerifyingOtp}
                                                                className="px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                                                            >
                                                                {isVerifyingOtp ? <span className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span> : 'Verify'}
                                                            </button>
                                                        </div>
                                                    )}
                                                    {errors.otp && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><AlertCircle size={12}/> {errors.otp}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-100 uppercase tracking-[0.2em] mb-3">Target Profit Destination Route <span className="text-red-500">*</span></label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div 
                                            onClick={() => setFormData({...formData, profitDestination: 'BANK'})}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-3 ${formData.profitDestination === 'BANK' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <Shield size={20} className={formData.profitDestination === 'BANK' ? 'text-emerald-500' : 'text-slate-400'} />
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.profitDestination === 'BANK' ? 'border-emerald-500' : 'border-slate-300'}`}>
                                                    {formData.profitDestination === 'BANK' && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase text-slate-900 dark:text-white">Option A: Auto Withdrawal</p>
                                                <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase leading-relaxed">Profits auto-route to your bank account. No admin approval required for monthly yields.</p>
                                            </div>
                                        </div>

                                        <div 
                                            className="p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-3 relative opacity-60 cursor-not-allowed group"
                                        >
                                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/5 dark:bg-slate-900/40 rounded-2xl">
                                                <span className="bg-slate-900 text-white dark:bg-emerald-600 text-[10px] font-black uppercase px-4 py-2 rounded-full tracking-tighter shadow-2xl scale-95 group-hover:scale-100 transition-transform flex items-center gap-2">
                                                    <Info size={12} /> Coming Soon
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center grayscale">
                                                <Wallet size={20} className="text-slate-400" />
                                                <div className="w-4 h-4 rounded-full border-2 border-slate-300 flex items-center justify-center"></div>
                                            </div>
                                            <div className="grayscale">
                                                <p className="text-sm font-black uppercase text-slate-900 dark:text-white">Option B: NF Wallet Storage</p>
                                                <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase leading-relaxed">This selection logic is currently being optimized for safe capital distribution.</p>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.profitDestination && <p className="text-red-500 text-xs font-bold uppercase tracking-wider mt-3 flex items-center gap-1"><AlertCircle size={14}/> {errors.profitDestination}</p>}
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-black text-slate-700 dark:text-slate-100 uppercase tracking-widest">Optional Contract Notes</label>
                                        <span className={`text-[9px] font-bold uppercase tracking-tight ${(formData.note.length > 50 || (formData.note.length < 5 && formData.note.length > 0)) ? 'text-red-500' : 'text-slate-400'}`}>
                                            {formData.note.length} / 50 Letters
                                        </span>
                                    </div>
                                    <textarea 
                                        rows="2"
                                        maxLength={50}
                                        value={formData.note}
                                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                                        className={`w-full p-4 text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border rounded-xl outline-none focus:ring-4 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all ${errors.note ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}
                                        placeholder="Min 5, Max 50 letters..."
                                    ></textarea>
                                    {errors.note && <p className="text-red-500 text-[10px] font-black uppercase mt-1 tracking-widest">{errors.note}</p>}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Rules & Agreement */}
                        {currentStep === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-8">
                                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                                        <Shield className="text-emerald-600" />
                                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Contract Notice & Legal Rules</h3>
                                    </div>
                                    <div className="p-6 h-80 overflow-y-auto text-sm text-slate-600 dark:text-slate-400 space-y-6">
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs mb-2">1. Monthly Profit Logistics</h4>
                                            <p className="text-xs leading-relaxed opacity-80">If it is a holiday of the office on the date of the monthly profit, the day of the office Profit will be deposited in working days. Monthly profits are calculated on the same calendar day of the activation (e.g. 25th of every month).</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs mb-2">2. Termination & Deductions</h4>
                                            <p className="text-xs leading-relaxed opacity-80 mb-3">Foreclosure/Suspension is allowed but subject to deductions from the initial investment amount based on the timeline of termination:</p>
                                            <div className="space-y-4 pt-2">
                                                <div className="pl-4 border-l-2 border-emerald-500">
                                                    <p className="font-bold text-slate-800 dark:text-slate-300 text-[11px] mb-1">For 12 Months Plan</p>
                                                    <ul className="text-[10px] list-disc pl-4 space-y-1">
                                                        <li>75% of the profit will be deducted in the event of pause in 3 months.</li>
                                                        <li>50% of the profit will be deducted at the time of suspension in 6 months.</li>
                                                        <li>25% of the profit will be deducted in case of discontinuation before 12 months.</li>
                                                    </ul>
                                                </div>
                                                <div className="pl-4 border-l-2 border-blue-500">
                                                    <p className="font-bold text-slate-800 dark:text-slate-300 text-[11px] mb-1">For 24 Months Plan</p>
                                                    <ul className="text-[10px] list-disc pl-4 space-y-1">
                                                        <li>75% of the profit will be deducted in the event of a break in 6 months.</li>
                                                        <li>50% of the profit will be deducted in the event of a 12-month pause.</li>
                                                        <li>25% of the profit will be deducted in case of termination before 24 months.</li>
                                                    </ul>
                                                </div>
                                                <div className="pl-4 border-l-2 border-amber-500">
                                                    <p className="font-bold text-slate-800 dark:text-slate-300 text-[11px] mb-1">For 36 Months Plan</p>
                                                    <ul className="text-[10px] list-disc pl-4 space-y-1">
                                                        <li>75% of the profit will be deducted in the event of a 12-month pause.</li>
                                                        <li>50% of the profit will be deducted in the event of a break in 24 months.</li>
                                                        <li>25% of the profit will be deducted in case of termination before 36 months.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs mb-2">3. Routing Policy</h4>
                                            <p className="text-xs leading-relaxed opacity-80">Choosing "Auto-Withdrawal" results in instant bank transfers marked as "Completed" in your history. NF Wallet storage requires your explicit withdrawal request for admin clearance.</p>
                                        </div>

                                        <p className="text-[10px] font-black italic border-t border-slate-100 dark:border-slate-800 pt-4 text-emerald-600 uppercase tracking-widest">Digital Stamp: AUTH-CONTRACT-SECURE-{Date.now()}</p>
                                    </div>
                                </div>

                                <label className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.rulesAccepted}
                                        onChange={(e) => setFormData({...formData, rulesAccepted: e.target.checked})}
                                        className="mt-1 w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">I Have Read and Accepted All Institutional Terms & Conditions.</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Mandatory confirmation checkpoint.</p>
                                    </div>
                                </label>
                                {errors.rulesAccepted && <p className="text-red-500 text-xs font-bold uppercase mt-2 px-2">{errors.rulesAccepted}</p>}

                                <div className="space-y-3">
                                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest flex justify-between">
                                        Digital Signature Proof <span className="text-red-500">*</span>
                                        <button onClick={clearSignature} type="button" className="text-[10px] text-slate-400 hover:text-red-500 tracking-wider">CLEAR CANVAS</button>
                                    </label>
                                    <div className={`bg-slate-50 dark:bg-slate-800 border rounded-2xl overflow-hidden hover:shadow-md transition-shadow relative ${errors.signatureConf ? 'border-red-500 shadow-sm shadow-red-500/20' : 'border-slate-300 dark:border-slate-700 border-dashed'}`}>
                                        <canvas 
                                            ref={canvasRef}
                                            width={600}
                                            height={200}
                                            className="w-full cursor-crosshair touch-none"
                                            onMouseDown={startDrawing}
                                            onMouseUp={stopDrawing}
                                            onMouseOut={stopDrawing}
                                            onMouseMove={draw}
                                            onTouchStart={startDrawing}
                                            onTouchEnd={stopDrawing}
                                            onTouchMove={draw}
                                        />
                                        {!hasSignature && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <span className="text-slate-300 dark:text-slate-600 font-bold tracking-[0.2em] uppercase text-xl opacity-50">Sign Here</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mt-2 italic">Note: Your Digital Signature must match the signature provided during registration.</p>
                                    {errors.signatureConf && <p className="text-red-500 text-xs font-bold uppercase mt-1 px-2">{errors.signatureConf}</p>}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Agreement Document */}
                        {currentStep === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                                {/* Agreement Document */}
                                <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-lg font-['Georgia',serif]">

                                    {/* Document Header */}
                                    <div className="bg-[#0F172A] px-8 py-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white flex items-center justify-center shadow-lg">
                                                <img src="/nf-logo.jpg" alt="NF" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span class="font-black text-slate-900 text-lg">NF</span>'; }} />
                                            </div>
                                            <div>
                                                <h2 className="text-white font-black text-base tracking-tight uppercase leading-none">NF Plantation (Pvt) Ltd.</h2>
                                                <p className="text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Institutional Investment Solutions</p>
                                                <p className="text-slate-500 text-[9px] font-bold tracking-wider mt-0.5 uppercase">Reg. No: PV 00303425 | Est. 2019</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Document Status</p>
                                            <span className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                                <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Pending Execution</span>
                                            </span>
                                            <p className="text-slate-500 text-[9px] mt-2 uppercase tracking-wider">Date: {new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}</p>
                                        </div>
                                    </div>

                                    {/* Document Title */}
                                    <div className="text-center py-6 border-b-2 border-slate-100 bg-slate-50">
                                        <h1 className="text-lg font-black text-slate-900 uppercase tracking-[0.15em]">Fixed Deposit Investment Agreement</h1>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Contract Initialization Document — Ref: {profile.userId || 'N/A'}</p>
                                    </div>

                                    <div className="p-8 space-y-6">

                                        {/* Section 1: Parties */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">1</div>
                                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em]">Parties to the Agreement</h3>
                                                <div className="flex-1 h-px bg-slate-200"></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Investor */}
                                                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-3">Investor / Contractor</p>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Full Name</span>
                                                            <span className="text-[10px] font-black text-slate-900 uppercase">{profile.fullName}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">NIC Number</span>
                                                            <span className="text-[10px] font-black text-slate-900 uppercase">{profile.nic}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Investor ID</span>
                                                            <span className="text-[10px] font-black text-slate-900 uppercase">{profile.userId || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Mobile</span>
                                                            <span className="text-[10px] font-black text-slate-900">{profile.mobile || profile.phone || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Email</span>
                                                            <span className="text-[10px] font-black text-slate-900">{profile.email || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Company */}
                                                <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Company / Institution</p>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Company</span>
                                                            <span className="text-[10px] font-black text-slate-900 uppercase">NF Plantation (Pvt) Ltd.</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Reg. No</span>
                                                            <span className="text-[10px] font-black text-slate-900">PV 00303425</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Type</span>
                                                            <span className="text-[10px] font-black text-slate-900 uppercase">Institutional Investment</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Country</span>
                                                            <span className="text-[10px] font-black text-slate-900 uppercase">Sri Lanka</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Branch</span>
                                                            <span className="text-[10px] font-black text-slate-900 uppercase">Kilinochchi</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 2: Investment Details */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">2</div>
                                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em]">Investment Details</h3>
                                                <div className="flex-1 h-px bg-slate-200"></div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div className="p-4 bg-slate-900 rounded-xl text-center">
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Plan Name</p>
                                                    <p className="font-black text-white text-sm uppercase leading-tight">{plan.name}</p>
                                                </div>
                                                <div className="p-4 bg-emerald-600 rounded-xl text-center">
                                                    <p className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest mb-1">Capital Amount</p>
                                                    <p className="font-black text-white text-sm leading-tight">{formatLKR(formData.amount)}</p>
                                                </div>
                                                <div className="p-4 bg-blue-600 rounded-xl text-center">
                                                    <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mb-1">Monthly Return</p>
                                                    <p className="font-black text-white text-xl leading-none">{plan.interestRate}%</p>
                                                    <p className="text-[9px] text-blue-200 font-bold">/ Month</p>
                                                </div>
                                                <div className="p-4 bg-amber-500 rounded-xl text-center">
                                                    <p className="text-[9px] font-bold text-amber-100 uppercase tracking-widest mb-1">Duration</p>
                                                    <p className="font-black text-white text-xl leading-none">{plan.duration}</p>
                                                    <p className="text-[9px] text-amber-100 font-bold uppercase">{plan.durationUnit || 'Months'}</p>
                                                </div>
                                            </div>
                                            {/* Return Summary */}
                                            <div className="mt-3 grid grid-cols-3 gap-3">
                                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Monthly Yield</p>
                                                    <p className="font-black text-emerald-600 text-sm">{formatLKR((Number(formData.amount) * plan.interestRate) / 100)}</p>
                                                </div>
                                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Profit</p>
                                                    <p className="font-black text-blue-600 text-sm">{formatLKR((Number(formData.amount) * plan.interestRate / 100) * plan.duration)}</p>
                                                </div>
                                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Profit Route</p>
                                                    <p className={`font-black text-sm ${formData.profitDestination === 'BANK' ? 'text-blue-600' : 'text-emerald-600'}`}>
                                                        {formData.profitDestination === 'BANK' ? 'Auto-Withdrawal' : 'Wallet Storage'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 3: Bank Details */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">3</div>
                                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em]">Profit Distribution Account</h3>
                                                <div className="flex-1 h-px bg-slate-200"></div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank Name</p>
                                                    <p className="font-black text-slate-900 text-sm uppercase">{profile.bankName || '—'}</p>
                                                </div>
                                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                                                    <p className="font-black text-slate-900 text-sm">{profile.accountNumber || '—'}</p>
                                                </div>
                                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Holder</p>
                                                    <p className="font-black text-slate-900 text-sm uppercase">{profile.accountHolder || profile.fullName}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section 4: Key Rules */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">4</div>
                                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em]">Key Investment Rules</h3>
                                                <div className="flex-1 h-px bg-slate-200"></div>
                                            </div>
                                            <div className="p-5 bg-rose-50 border border-rose-100 rounded-xl space-y-2">
                                                {[
                                                    'Monthly profits are credited on the same calendar day of activation.',
                                                    'If profit date falls on a holiday, payment is made on the next working day.',
                                                    `Early break within first 1/3 of term: 75% of earned profits will be deducted.`,
                                                    `Break at midpoint of term: 50% of earned profits will be deducted.`,
                                                    `Break before maturity: 25% of earned profits will be deducted.`,
                                                    'Capital is fully returned upon maturity or early termination after deductions.',
                                                    'This agreement is legally binding upon administrative approval.',
                                                ].map((rule, i) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                                                        <p className="text-[10px] font-medium text-rose-800 leading-relaxed">{rule}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Section 5: Declaration + Signature */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">5</div>
                                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.15em]">Declaration & Signature</h3>
                                                <div className="flex-1 h-px bg-slate-200"></div>
                                            </div>
                                            <div className="p-5 border border-slate-200 rounded-xl bg-slate-50">
                                                <p className="text-[11px] text-slate-700 leading-relaxed text-justify mb-6">
                                                    I, <strong className="text-emerald-700 uppercase">{profile.fullName}</strong> (NIC: <strong>{profile.nic}</strong>), hereby confirm and authorize NF Plantation (Pvt) Ltd. (Reg. No: PV 00303425) to hold the capital amount of <strong className="text-emerald-700">{formatLKR(formData.amount)}</strong> from my wallet and invest it in the <strong className="text-slate-900 uppercase">{plan.name}</strong> plan at <strong>{plan.interestRate}% monthly return</strong> for a duration of <strong>{plan.duration} {plan.durationUnit || 'months'}</strong>. I have read, understood, and agreed to all terms and rules of this contract. This document is digitally executed and binding upon administrative approval.
                                                </p>
                                                <div className="flex flex-col md:flex-row gap-8 items-end">
                                                    <div className="flex-1">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Investor Signature</p>
                                                        {signatureDataUrl ? (
                                                            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-inner h-24 flex items-center justify-center">
                                                                <img src={signatureDataUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-3 h-24 flex items-center justify-center text-slate-300 text-xs font-bold italic">Signature Captured</div>
                                                        )}
                                                        <div className="mt-2 border-t border-slate-300 pt-2">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{profile.fullName}</p>
                                                            <p className="text-[8px] text-slate-400 font-bold">Date: {new Date().toLocaleDateString('en-GB')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 text-center">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Authorized By</p>
                                                        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-inner h-24 flex items-center justify-center">
                                                            <div className="text-center">
                                                                <div className="text-2xl font-black text-slate-900 tracking-tighter">NF</div>
                                                                <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Official Stamp</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 border-t border-slate-300 pt-2">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">NF Plantation (Pvt) Ltd.</p>
                                                            <p className="text-[8px] text-slate-400 font-bold">Pending Admin Approval</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Document Footer */}
                                    <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">NF Plantation (Pvt) Ltd. | Confidential Investment Document</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Auth-{Date.now().toString().slice(-8)}</p>
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                    <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                                        By clicking <strong>"Submit & Sign Contract"</strong>, you confirm all details above are correct. You will receive a confirmation email with a PDF copy of this agreement, and an SMS and dashboard notification.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: SUCCESS */}
                        {currentStep === 4 && (
                            <div className="animate-in zoom-in-95 duration-500 text-center py-10 px-4">
                                {/* Confetti-style rings */}
                                <div className="relative w-28 h-28 mx-auto mb-8">
                                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping"></div>
                                    <div className="absolute inset-3 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDelay: '0.15s' }}></div>
                                    <div className="relative w-full h-full bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                                        <CheckCircle size={52} className="text-white" />
                                    </div>
                                </div>

                                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">Congratulations!</h2>
                                <p className="text-emerald-600 font-black uppercase tracking-widest text-sm mb-2">{profile?.fullName}</p>
                                <p className="text-slate-500 dark:text-slate-300 font-medium mb-8 max-w-md mx-auto leading-relaxed">
                                    Your FD investment contract has been successfully submitted. A confirmation email with PDF agreement has been sent to your registered email, along with an SMS to your mobile.
                                </p>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl mx-auto max-w-sm mb-6 border border-slate-100 dark:border-slate-700 shadow-inner">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">Contract Reference</p>
                                    <p className="font-mono text-lg font-black text-slate-900 dark:text-white tracking-widest">{successData?.referenceNumber || '—'}</p>
                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                                            <span>Plan</span><span className="text-slate-900 dark:text-white">{plan?.name}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                                            <span>Amount</span><span className="text-emerald-600">{formatLKR(formData.amount)}</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                                            <span>Monthly Return</span><span className="text-blue-600">{plan?.interestRate}% / Month</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">Pending Admin Approval</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-center gap-3 mb-8">
                                    {[
                                        { icon: '📧', label: 'Email sent with PDF' },
                                        { icon: '📱', label: 'SMS notification sent' },
                                        { icon: '🔔', label: 'Dashboard notified' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-[11px] font-bold text-emerald-700">
                                            <span>{item.icon}</span> {item.label}
                                        </div>
                                    ))}
                                </div>

                                <button onClick={() => navigate('/company/nf-plantation/dashboard/my-investment')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-10 py-4 rounded-2xl uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-emerald-500/20">
                                    View My Investments
                                </button>
                            </div>
                        )}

                    </div>

                    {/* Footer Controls */}
                    {currentStep < 4 && (
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center rounded-b-[2rem]">
                            <button
                                onClick={() => currentStep === 1 ? navigate('/company/nf-plantation/dashboard/fd-plans') : setCurrentStep(prev => prev - 1)}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
                            >
                                <ChevronLeft size={16} /> {currentStep === 1 ? 'Cancel' : 'Back'}
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-black dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-all"
                                >
                                    Proceed <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Transmitting Data...' : 'Submit & Sign Contract'}
                                </button>
                            )}
                        </div>
                    )}
                    {/* Validation Errors Overlay */}
                    {Object.keys(errors).length > 0 && currentStep === 1 && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-xs font-bold uppercase animate-in fade-in slide-in-from-top-2 shadow-lg z-50 flex gap-2 items-center">
                            <AlertCircle size={16} /> Please correctly complete all required fields and verify OTP
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FDActivationFlow;
