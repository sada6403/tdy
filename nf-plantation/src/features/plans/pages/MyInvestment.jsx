import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import {
    TrendingUp, Calendar, CheckCircle2, Clock, XCircle,
    ShieldCheck, ChevronLeft, Briefcase, Download,
    ArrowRight, Wallet, Landmark, Zap, BarChart3, RefreshCw
} from 'lucide-react';

const MyInvestment = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [investments, setInvestments] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) navigate('/company/nf-plantation/login');
    }, [user, loading, navigate]);

    const fetchInvestments = async () => {
        setIsLoadingData(true);
        try {
            const res = await api.get('/customer/my-investments');
            setInvestments(res.data || []);
        } catch (error) {
            console.error('Failed fetching investments:', error);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => { fetchInvestments(); }, []);

    if (loading || !user) return null;

    const handleDownloadCertificate = async (invId, refNum) => {
        try {
            const response = await api.get(`/customer/my-investments/${invId}/certificate`, {
                responseType: 'blob',
                transformResponse: (data) => data
            });
            const url = window.URL.createObjectURL(new Blob([response]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate_${refNum}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Certificate not available yet. Please try after admin approval.');
        }
    };

    const formatLKR = (val) =>
        new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(val || 0);

    const formatDate = (d) => {
        if (!d) return '—';
        return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
    };

    const getProgress = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const now = Date.now();
        return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'ACTIVE':
                return { label: 'Active', dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', icon: <CheckCircle2 size={12} /> };
            case 'PENDING_ACTIVATION_APPROVAL':
                return { label: 'Pending Approval', dot: 'bg-amber-500 animate-pulse', text: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={12} /> };
            case 'MATURED':
                return { label: 'Matured', dot: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', icon: <ShieldCheck size={12} /> };
            case 'CANCELLED':
                return { label: 'Cancelled', dot: 'bg-red-400', text: 'text-red-500', bg: 'bg-red-50', icon: <XCircle size={12} /> };
            default:
                return { label: status?.replace(/_/g, ' ') || 'Unknown', dot: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-50', icon: <Clock size={12} /> };
        }
    };

    // Summary stats
    const activeInvestments = investments.filter(i => i.status === 'ACTIVE');
    const totalInvested = investments.reduce((s, i) => s + (i.investedAmount || 0), 0);
    const totalMonthlyYield = investments.reduce((s, i) => s + ((i.investedAmount || 0) * (i.monthlyROI || 0) / 100), 0);

    return (
        <div className="pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/company/nf-plantation/dashboard')}
                        className="w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Investments</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Portfolio & Holding Overview</p>
                    </div>
                </div>
                <button
                    onClick={fetchInvestments}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-slate-500 hover:text-emerald-600 hover:border-emerald-200 text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
                >
                    <RefreshCw size={14} className={isLoadingData ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* ── Summary Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {[
                    {
                        label: 'Total Invested',
                        value: formatLKR(totalInvested),
                        icon: <Briefcase size={20} />,
                        color: 'emerald',
                        bg: 'bg-emerald-500',
                    },
                    {
                        label: 'Monthly Yield',
                        value: formatLKR(totalMonthlyYield),
                        icon: <TrendingUp size={20} />,
                        color: 'blue',
                        bg: 'bg-blue-500',
                    },
                    {
                        label: 'Active Plans',
                        value: `${activeInvestments.length} Plan${activeInvestments.length !== 1 ? 's' : ''}`,
                        icon: <BarChart3 size={20} />,
                        color: 'violet',
                        bg: 'bg-violet-500',
                    },
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-sm">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${stat.bg} flex items-center justify-center text-white shadow-lg`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-lg md:text-xl font-black text-slate-900 tracking-tight mt-0.5">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Content ── */}
            {isLoadingData ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-slate-100 rounded-2xl p-6 animate-pulse">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                                <div className="space-y-2">
                                    <div className="h-4 w-40 bg-slate-100 rounded" />
                                    <div className="h-3 w-24 bg-slate-100 rounded" />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                {[1,2,3,4].map(j => <div key={j} className="h-12 bg-slate-100 rounded-xl" />)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : investments.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={36} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No Investments Yet</h3>
                    <p className="text-sm text-slate-400 font-medium mb-8 max-w-xs mx-auto">Activate a high-yield Fixed Deposit plan to start growing your wealth.</p>
                    <button
                        onClick={() => navigate('/company/nf-plantation/dashboard/fd-plans')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95"
                    >
                        Explore Plans <ArrowRight size={14} />
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {investments.map((inv, index) => {
                        const status = getStatusConfig(inv.status);
                        const progress = getProgress(inv.startDate, inv.endDate);
                        const monthlyYield = (inv.investedAmount || 0) * (inv.monthlyROI || 0) / 100;
                        const totalReturn = monthlyYield * (inv.durationMonths || 0);

                        return (
                            <div
                                key={inv._id}
                                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                                style={{ animationDelay: `${index * 60}ms` }}
                            >
                                {/* Card Top Bar */}
                                <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 opacity-60" />

                                <div className="p-6">
                                    {/* Row 1: Plan info + Status */}
                                    <div className="flex items-start justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                                <Zap size={22} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 text-base uppercase tracking-tight leading-none">
                                                    {inv.planName || 'Investment Plan'}
                                                </h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                                                    REF: {inv.referenceNumber || inv._id?.slice(-10).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-1.5 px-3 py-1.5 ${status.bg} rounded-full shrink-0`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${status.text}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Row 2: Key Metrics */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                        <div className="p-3 md:p-4 bg-slate-50 rounded-xl">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Capital</p>
                                            <p className="font-black text-slate-900 text-sm tabular-nums">{formatLKR(inv.investedAmount)}</p>
                                        </div>
                                        <div className="p-3 md:p-4 bg-emerald-50 rounded-xl">
                                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Monthly Yield</p>
                                            <p className="font-black text-emerald-600 text-sm tabular-nums">{formatLKR(monthlyYield)}</p>
                                            <p className="text-[9px] text-emerald-500 font-bold mt-0.5">{inv.monthlyROI || 0}% / month</p>
                                        </div>
                                        <div className="p-3 md:p-4 bg-blue-50 rounded-xl">
                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Return</p>
                                            <p className="font-black text-blue-600 text-sm tabular-nums">{formatLKR(totalReturn)}</p>
                                            <p className="text-[9px] text-blue-400 font-bold mt-0.5">{inv.durationMonths || '—'} months</p>
                                        </div>
                                        <div className="p-3 md:p-4 bg-slate-50 rounded-xl">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Profit Route</p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {inv.profitDestination === 'BANK'
                                                    ? <><Landmark size={13} className="text-slate-600" /><span className="font-black text-slate-700 text-[10px] uppercase">Bank</span></>
                                                    : <><Wallet size={13} className="text-slate-600" /><span className="font-black text-slate-700 text-[10px] uppercase">Wallet</span></>
                                                }
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 3: Progress + Dates + Actions */}
                                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {formatDate(inv.startDate)} → {formatDate(inv.endDate)}
                                                    </span>
                                                </div>
                                                {inv.status === 'ACTIVE' && (
                                                    <span className="text-[10px] font-black text-emerald-600">{progress}%</span>
                                                )}
                                            </div>
                                            {inv.status === 'ACTIVE' ? (
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full">
                                                    <div className="h-full w-0 bg-slate-200 rounded-full" />
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleDownloadCertificate(inv._id, inv.referenceNumber)}
                                            disabled={inv.status !== 'ACTIVE'}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0"
                                            title={inv.status !== 'ACTIVE' ? 'Available after approval' : 'Download Certificate'}
                                        >
                                            <Download size={13} />
                                            Certificate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Explore CTA (when has investments) ── */}
            {investments.length > 0 && !isLoadingData && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => navigate('/company/nf-plantation/dashboard/fd-plans')}
                        className="inline-flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                        <Zap size={14} /> Add New Investment
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyInvestment;
