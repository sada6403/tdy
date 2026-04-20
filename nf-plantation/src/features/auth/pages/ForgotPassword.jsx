import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, ArrowRight, ArrowLeft, Smartphone, Shield, Key, CheckCircle, Eye, EyeOff, UserCircle } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';

const ForgotPassword = () => {
    const { t, language } = useLanguage();
    const { verifyNic, sendForgotPasswordOtp, verifyForgotPasswordOtp, resetForgotPassword } = useAuth();
    const navigate = useNavigate();

    // Steps: 1 = Identify (NIC), 2 = Choose Channel, 3 = Verify OTP, 4 = New Password, 5 = Success
    const [step, setStep] = useState(1);

    // Common State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Step 1 State: Identify
    const [nic, setNic] = useState('');
    const [userData, setUserData] = useState(null); // { userId, email, phone }

    // Step 2 State: Choose Channel
    const [channel, setChannel] = useState('EMAIL'); // 'EMAIL' or 'PHONE'

    // Step 3 State: Verify OTP
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);

    // Step 4 State: New Password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');

    // Timer Logic for OTP Resend
    useEffect(() => {
        let interval;
        if (step === 3 && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else if (resendTimer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, resendTimer]);

    // HANDLERS

    // Handler 1: Verify NIC
    const handleVerifyNic = async (e) => {
        e.preventDefault();
        setError('');
        if (!nic.trim()) return;

        setIsLoading(true);
        const result = await verifyNic(nic);
        setIsLoading(false);

        if (result.success) {
            setUserData(result.data);
            setStep(2);
        } else {
            setError(result.message);
        }
    };

    // Handler 2: Send OTP
    const handleSendOTP = async (e) => {
        e?.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await sendForgotPasswordOtp(userData.userId, channel);
        setIsLoading(false);

        if (result.success) {
            setStep(3);
            setResendTimer(30);
            setCanResend(false);
        } else {
            setError(result.message);
        }
    };

    // Handler 3: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        const otpString = otp.join('');
        if (otpString.length < 6) return;

        setIsLoading(true);
        const result = await verifyForgotPasswordOtp(userData.userId, channel, otpString);
        setIsLoading(false);

        if (result.success) {
            setStep(4);
        } else {
            setError(result.message);
        }
    };

    // Handler 4: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }
        // Strict Strength Validation
        if (newPassword.length < 6 || newPassword.length > 10) {
            setPasswordError("Password must be between 6 and 10 characters");
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            setPasswordError("Must include at least one CAPITAL letter");
            return;
        }
        if (!/[a-z]/.test(newPassword)) {
            setPasswordError("Must include at least one small letter");
            return;
        }
        if (!/[+#@$=]/.test(newPassword)) {
            setPasswordError("Must include at least one symbol (+, #, @, $, =)");
            return;
        }
        if (!/\d/.test(newPassword)) {
            setPasswordError("Must include at least one number");
            return;
        }

        setPasswordError("");
        setIsLoading(true);
        const result = await resetForgotPassword(userData.userId, newPassword, otp.join(''));
        setIsLoading(false);

        if (result.success) {
            setStep(5);
        } else {
            setError(result.message);
        }
    };

    // OTP Input Helpers
    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value !== '' && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    // COMPONENTS

    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
                <div 
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'w-8 bg-[#00c853]' : 'w-2 bg-gray-200 dark:bg-gray-700'}`} 
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans bg-gray-900 dark:bg-gray-950 transition-colors duration-300">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/auth-background.png"
                    alt="Plantation Background"
                    className="w-full h-full object-cover opacity-60 animate-subtle-scale"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 via-black/50 to-emerald-900/40" />
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-5xl mx-4 shadow-2xl rounded-[30px] overflow-hidden flex flex-col md:flex-row animate-content-enter">

                {/* Left Side (Visual) */}
                <div className="hidden md:flex flex-col justify-between p-12 w-5/12 bg-white/5 dark:bg-black/20 backdrop-blur-xl border-r border-white/5 text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                    <Link to="/company/nf-plantation/login" className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest w-fit hover:translate-x-[-4px]">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
                    </Link>

                    <div className="relative z-10 my-auto">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#00c853] to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40 mb-8">
                            <Leaf size={32} className="text-white" />
                        </div>
                        <h1 className="font-bold mb-4 leading-tight tracking-tight text-4xl lg:text-5xl">
                            Reset.<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c853] to-emerald-300">Verify.</span><br /> Access.
                        </h1>
                        <p className="text-emerald-100/70 text-sm leading-relaxed max-w-xs">
                            Secure your account through our multi-step identity verification process.
                        </p>
                    </div>

                    <div className="text-[10px] text-white/30 font-medium">
                        SECURE VERIFICATION SYSTEM
                    </div>
                </div>

                {/* Right Side (Form) */}
                <div className="w-full md:w-7/12 bg-white dark:bg-gray-900 p-10 md:p-16 flex flex-col justify-center relative transition-colors duration-300">
                    <div className="max-w-md mx-auto w-full">

                        {step < 5 && <StepIndicator />}

                        {/* STEP 1: VERIFY NIC */}
                        {step === 1 && (
                            <div className="animate-fade-in-up">
                                <div className="mb-8 text-center md:text-left">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Identify Yourself</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Please enter your NIC number to begin the recovery process.</p>
                                </div>

                                <form onSubmit={handleVerifyNic} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">NIC Number</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <UserCircle className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#00c853] transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                value={nic}
                                                onChange={(e) => setNic(e.target.value)}
                                                className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00c853]/50 focus:border-[#00c853] transition-all"
                                                placeholder="e.g. 199012345678 or 901234567V"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 text-sm rounded-r-md">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#00c853] hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {isLoading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Verify NIC <ArrowRight size={18} /></>}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* STEP 2: CHOOSE CHANNEL */}
                        {step === 2 && (
                            <div className="animate-fade-in-up">
                                <div className="mb-8 text-center md:text-left">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verification Method</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Where should we send the security code?</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div 
                                        onClick={() => setChannel('EMAIL')}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${channel === 'EMAIL' ? 'border-[#00c853] bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${channel === 'EMAIL' ? 'bg-[#00c853] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                            <Mail size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">Send to Email</p>
                                            <p className="text-xs text-gray-500">{userData.email}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${channel === 'EMAIL' ? 'border-[#00c853]' : 'border-gray-300'}`}>
                                            {channel === 'EMAIL' && <div className="w-2.5 h-2.5 bg-[#00c853] rounded-full" />}
                                        </div>
                                    </div>

                                    {userData.phone && (
                                        <div 
                                            onClick={() => setChannel('PHONE')}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${channel === 'PHONE' ? 'border-[#00c853] bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${channel === 'PHONE' ? 'bg-[#00c853] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                                                <Smartphone size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">Send to Mobile</p>
                                                <p className="text-xs text-gray-500">{userData.phone}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${channel === 'PHONE' ? 'border-[#00c853]' : 'border-gray-300'}`}>
                                                {channel === 'PHONE' && <div className="w-2.5 h-2.5 bg-[#00c853] rounded-full" />}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
                                )}

                                <div className="flex gap-4">
                                    <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold py-4 rounded-xl hover:bg-gray-50 transition-all">Back</button>
                                    <button onClick={handleSendOTP} disabled={isLoading} className="flex-[2] bg-[#00c853] hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                                        {isLoading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Continue <ArrowRight size={18} /></>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: VERIFY OTP */}
                        {step === 3 && (
                            <div className="animate-fade-in-up">
                                <div className="mb-8 text-center md:text-left">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Verify Security Code</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Enter the 6-digit code sent to your {channel.toLowerCase()}.</p>
                                </div>

                                <form onSubmit={handleVerifyOTP} className="space-y-8">
                                    <div className="flex gap-2 justify-between">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                id={`otp-${index}`}
                                                type="text"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#00c853] outline-none transition-all text-gray-900 dark:text-white"
                                            />
                                        ))}
                                    </div>

                                    {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={isLoading || otp.includes('')}
                                        className="w-full bg-[#00c853] hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Verify Code <Shield size={18} /></>}
                                    </button>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={handleSendOTP}
                                            disabled={!canResend}
                                            className={`text-sm font-bold ${canResend ? 'text-[#00c853] hover:underline' : 'text-gray-400'}`}
                                        >
                                            {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* STEP 4: RESET PASSWORD */}
                        {step === 4 && (
                            <div className="animate-fade-in-up">
                                <div className="mb-8 text-center md:text-left">
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">New Password</h2>
                                    <p className="text-gray-500 dark:text-gray-400">Protect your account with a strong new password.</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="block w-full px-12 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#00c853]"
                                            />
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {/* Requirement Guiders */}
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 px-1 leading-relaxed">
                                            Must be 6-10 characters with upper & lower case letters, numbers, and symbols (+, #, @, $, =)
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="block w-full px-12 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#00c853]"
                                            />
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        {passwordError && <p className="text-red-500 text-xs font-bold mt-1">{passwordError}</p>}
                                        {error && <p className="text-red-500 text-xs font-bold mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">{error}</p>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#00c853] hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <>Update Password <CheckCircle size={18} /></>}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* STEP 5: SUCCESS */}
                        {step === 5 && (
                            <div className="animate-fade-in-up text-center py-8">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Account Secured</h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">
                                    Your password has been changed successfully. You can now log in with your new credentials.
                                </p>
                                <button
                                    onClick={() => navigate('/company/nf-plantation/login')}
                                    className="w-full bg-[#00c853] hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1"
                                >
                                    Proceed to Login
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <style>{`
                @keyframes subtle-scale { 0% { transform: scale(1); } 100% { transform: scale(1.05); } }
                @keyframes content-enter { 0% { opacity: 0; transform: translateY(20px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
                .animate-subtle-scale { animation: subtle-scale 20s infinite alternate ease-in-out; }
                .animate-content-enter { animation: content-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ForgotPassword;

