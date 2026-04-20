import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ChevronRight, Info } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const ChangePassword = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        // Strict Strength Validation (Matches ForgotPassword.jsx)
        if (newPassword.length < 6 || newPassword.length > 10) {
            setError("Password must be between 6 and 10 characters");
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            setError("Must include at least one CAPITAL letter");
            return;
        }
        if (!/[a-z]/.test(newPassword)) {
            setError("Must include at least one small letter");
            return;
        }
        if (!/[+#@$=]/.test(newPassword)) {
            setError("Must include at least one symbol (+, #, @, $, =)");
            return;
        }
        if (!/\d/.test(newPassword)) {
            setError("Must include at least one number");
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.post('/auth/change-password', { currentPassword, newPassword });
            if (res.success) {
                setIsSuccess(true);
                setTimeout(() => navigate('/company/nf-plantation/dashboard'), 2000);
            }
        } catch (err) {
            setError(err.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[32px] p-12 text-center shadow-2xl border border-emerald-500/20">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle2 size={40} className="text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Security Updated!</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-8 font-medium">Your password has been changed successfully. Redirecting you to your dashboard...</p>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-[loading_2s_linear_forwards]"></div>
                    </div>
                </div>
                <style>{`@keyframes loading { from { width: 0%; } to { width: 100%; } }`}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-xl w-full relative z-10">
                <div className="bg-white dark:bg-gray-900 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden border border-white dark:border-gray-800">
                    <div className="p-8 md:p-14">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <ShieldCheck size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Secure Your Account</h1>
                                <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mt-1">Mandatory Security Update</p>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 p-5 rounded-r-2xl mb-10">
                            <p className="text-amber-800 dark:text-amber-300 text-sm font-medium leading-relaxed">
                                <strong>Notice:</strong> You are using a temporary password. For your protection, you must set a new secure password before accessing your dashboard.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">Current/Temporary Password</label>
                                <div className="relative group">
                                    <input
                                        type={showPasswords ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-gray-800/50 border-2 border-slate-100 dark:border-gray-700/50 rounded-[22px] focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 transition-all font-medium text-slate-900 dark:text-white"
                                        placeholder="Enter current password"
                                        required
                                    />
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Lock size={20} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-6 pr-6 py-5 bg-slate-50 dark:bg-gray-800/50 border-2 border-slate-100 dark:border-gray-700/50 rounded-[22px] focus:outline-none focus:border-emerald-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-[13px]"
                                            placeholder="Strong Password Required"
                                            required
                                        />
                                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium mt-3 ml-2 flex items-center gap-1.5">
                                            <Info size={12} className="text-emerald-500" />
                                            6-10 characters, including Capital, Small, Number & Symbols (+#@$=)
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full pl-6 pr-6 py-5 bg-slate-50 dark:bg-gray-800/50 border-2 border-slate-100 dark:border-gray-700/50 rounded-[22px] focus:outline-none focus:border-emerald-500 transition-all font-medium text-slate-900 dark:text-white"
                                            placeholder="Repeat new password"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-emerald-500 transition-colors ml-2"
                            >
                                {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                                {showPasswords ? "Hide Passwords" : "Show Passwords"}
                            </button>

                            <div className="pt-6">
                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className="w-full bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-black py-5 rounded-[22px] shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        "Updating Account..."
                                    ) : (
                                        <>
                                            Update Password <ChevronRight size={20} />
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={() => logout()}
                                    className="w-full mt-4 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors py-2"
                                >
                                    Sign out and do this later
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 dark:text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">
                        &copy; {new Date().getFullYear()} NF Plantation Secure Protocol
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
