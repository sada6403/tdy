import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import {
    TrendingUp, ShieldCheck, ArrowRight, Lock,
    AlertCircle, CheckCircle2, ChevronRight, Briefcase,
    Clock, Info, Zap, Sparkles, Gem
} from 'lucide-react';
import { motion } from 'framer-motion';

const FDPlans = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [plansRes, profileRes] = await Promise.all([
                    api.get('/customer/plans'),
                    api.get('/customer/profile')
                ]);

                setPlans(plansRes.data.filter(p => p.status === 'ACTIVE'));
                setProfile(profileRes.data);
            } catch (error) {
                console.error("Error loading FD data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const isEligible = () => {
        if (!profile) return false;
        return profile.applicationStatus === 'APPROVED' || profile.kycStatus === 'VERIFIED' || profile.adminApproved === true;
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Portfolios...</p>
            </div>
        </div>
    );

    return (
        <div className="pb-16 pt-4">
            <main className="max-w-7xl mx-auto px-4">
                
                {/* --- PREMIUM HEADER --- */}
                <div className="mb-20 text-center relative">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 -mt-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"
                    ></motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-6 py-2 bg-white dark:bg-slate-800 shadow-xl shadow-emerald-500/5 border border-emerald-100 dark:border-emerald-800 rounded-full mb-8"
                    >
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">Fixed Deposit Core v3.0</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl md:text-7xl font-black text-[#0F172A] dark:text-white uppercase tracking-tighter mb-4 md:mb-6 leading-[0.9]"
                    >
                        Elite Investment <br className="hidden md:block"/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Portfolios</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto leading-relaxed"
                    >
                        Diversify your wealth with our state-of-the-art agricultural investment structures. Secured by bank-grade smart contracts.
                    </motion.p>
                </div>

                {/* --- ELIGIBILITY PROTOCOL --- */}
                {!isEligible() && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto mb-20 px-4"
                    >
                        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-[1px] rounded-[2.5rem] shadow-2xl shadow-amber-500/20">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/20 rounded-3xl flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
                                    <ShieldCheck size={40} />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Security Protocol Locked</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase leading-relaxed tracking-wider">
                                        Your account must complete the KYC verification protocol before you can inject capital into premium plantation portfolios.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => navigate('/company/nf-plantation/dashboard/profile')} 
                                    className="px-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl whitespace-nowrap"
                                >
                                    Verify Identity
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- PLANS VORTEX GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {plans.map((plan, index) => {
                        const styleSettings = [
                            { color: 'text-emerald-600', border: 'hover:border-emerald-500/30', bg: 'bg-emerald-500', glow: 'shadow-emerald-500/20', icon: Zap },
                            { color: 'text-indigo-600', border: 'hover:border-indigo-500/30', bg: 'bg-indigo-600', glow: 'shadow-indigo-500/20', icon: Sparkles },
                            { color: 'text-amber-500', border: 'hover:border-amber-500/30', bg: 'bg-amber-500', glow: 'shadow-amber-500/20', icon: Gem },
                        ];
                        const style = styleSettings[index % styleSettings.length];
                        const Icon = style.icon;

                        return (
                            <motion.div 
                                key={plan._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className={`group relative bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10 border border-slate-100 dark:border-slate-800 ${style.border} transition-all duration-500 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex flex-col h-full`}
                            >
                                {/* Header */}
                                <div className="flex justify-between items-start mb-10">
                                    <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${style.color} group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                                        <Icon size={28} />
                                    </div>
                                    <div className="px-5 py-2 bg-slate-50 dark:bg-slate-800 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Clock size={12} className={style.color} /> {plan.duration} {plan.durationUnit || 'Mo'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="mb-10">
                                    <h2 className="text-3xl font-black text-[#0F172A] dark:text-white uppercase tracking-tighter leading-none mb-4 group-hover:text-emerald-600 transition-colors">
                                        {plan.name}
                                    </h2>
                                    <div className="flex items-center gap-2 mb-8">
                                        <div className="h-1 w-8 bg-emerald-500 rounded-full"></div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Institutional Tier</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="relative">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Projected Yield</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className={`text-4xl md:text-6xl font-black ${style.color} tracking-tighter tabular-nums`}>{plan.interestRate}%</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">/ Month</span>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Min Entry</p>
                                                <p className="font-black text-slate-900 dark:text-white text-sm tabular-nums">Rs. {plan.minAmount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payout Logic</p>
                                                <p className="font-black text-emerald-600 text-sm italic uppercase tracking-tighter">Automatic</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-auto pt-8 space-y-4">
                                    <button
                                        disabled={!isEligible()}
                                        onClick={() => navigate(`/company/nf-plantation/dashboard/fd-activation/${plan._id}`)}
                                        className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 transition-all ${
                                            isEligible() 
                                                ? `${style.bg} ${style.glow} text-white hover:brightness-110 active:scale-95 shadow-xl` 
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                                        }`}
                                    >
                                        {isEligible() ? (
                                            <>Select Portfolio <ArrowRight size={16} /></>
                                        ) : (
                                            <><Lock size={14} /> Vault Locked</>
                                        )}
                                    </button>
                                    
                                    <button className="w-full py-2 bg-transparent text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2">
                                        <Info size={14} /> Audit Full Contract
                                    </button>
                                </div>

                                {/* Decorative Element */}
                                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-slate-50 dark:bg-slate-800 opacity-0 group-hover:opacity-40 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000"></div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* --- SECURE PROTOCOL FOOTER --- */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-24 bg-[#0F172A] rounded-[3rem] p-12 md:p-16 text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(15,23,42,0.5)]"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="max-w-xl text-center lg:text-left">
                            <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Secured by NF Core™ Encryption</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed uppercase tracking-wider opacity-80 mb-8">
                                All plantation portfolios are backed by physical land assets and verified via bank-grade recurring smart contracts. Your capital is protected by our Tier-1 institutional liquidity protocols.
                            </p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-8">
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                    <ShieldCheck size={18} /> Asset Backed
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                    <CheckCircle2 size={18} /> Regulated
                                </span>
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                    <Lock size={18} /> Encrypted
                                </span>
                            </div>
                        </div>
                        <div className="shrink-0 w-32 h-32 md:w-48 md:h-48 rounded-full border border-white/10 flex items-center justify-center bg-white/5 backdrop-blur-xl relative group">
                            <div className="absolute inset-0 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin-slow"></div>
                            <ShieldCheck size={64} className="text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                </motion.div>

            </main>

            <style>{`
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default FDPlans;
