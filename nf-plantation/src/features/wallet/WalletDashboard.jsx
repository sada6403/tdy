import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, 
    PieChart, Activity, TrendingUp, Clock, ShieldCheck,
    CreditCard, Building2, ChevronRight, ArrowRight, Briefcase
} from 'lucide-react';
import api from '../../services/api';

const Wallet = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [walletData, setWalletData] = useState({
        availableBalance: 0,
        heldBalance: 0,
        totalInvested: 0,
        totalEarned: 0,
        totalWithdrawn: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/customer/wallet');
            if (res.success) setWalletData(res.data);
        } catch (error) {
            console.error("Wallet Sync Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) return (
        <div className="space-y-6 animate-pulse p-4 sm:p-8">
            <div className="h-64 bg-white rounded-3xl border border-slate-100"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-40 bg-white rounded-2xl border border-slate-100"></div>)}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10 max-w-6xl mx-auto">
            
            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
                <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight uppercase">My Wallet</h1>
                    <p className="text-[10px] md:text-sm text-slate-500 font-bold">Manage your funds and withdrawals</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => navigate('/company/nf-plantation/dashboard/add-cash')}
                        className="px-4 py-3 bg-[#16A34A] text-white rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#15803d] transition-all shadow-lg shadow-[#16A34A]/20"
                    >
                        <Plus size={14} /> Deposit
                    </button>
                    <button 
                        onClick={() => navigate('/company/nf-plantation/dashboard/withdraw')}
                        className="px-4 py-3 bg-white text-[#0F172A] border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <ArrowUpRight size={14} /> Withdraw
                    </button>
                </div>
            </div>

            {/* --- PRIMARY CARD --- */}
            <div className="bg-[#0F172A] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#16A34A]/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-24 -mb-24"></div>
                
                <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
                    <div className="text-center md:text-left">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Net Available Liquidity</p>
                        <div className="flex flex-col sm:flex-row items-center md:items-baseline gap-2 mb-8">
                            <span className="text-lg md:text-xl font-black text-[#16A34A]">LKR</span>
                            <h2 className="text-4xl md:text-7xl font-black tracking-tighter">
                                {(walletData.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </h2>
                        </div>
                        
                        <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Held Escrow</span>
                                <span className="text-lg font-bold text-amber-500 tracking-tight">Rs. {(walletData.heldBalance || 0).toLocaleString()}</span>
                            </div>
                            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Total Withdrawn</span>
                                <span className="text-lg font-bold text-emerald-400 tracking-tight">Rs. {(walletData.totalWithdrawn || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#16A34A] mb-6 flex items-center gap-2">
                            <PieChart size={16} /> Asset Allocation
                        </h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Invested Capital</span>
                                    <span>{((walletData.totalInvested / (walletData.totalInvested + walletData.availableBalance)) * 100 || 0).toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#16A34A]" style={{ width: `${(walletData.totalInvested / (walletData.totalInvested + walletData.availableBalance)) * 100 || 0}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Cash Balance</span>
                                    <span>{((walletData.availableBalance / (walletData.totalInvested + walletData.availableBalance)) * 100 || 0).toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${(walletData.availableBalance / (walletData.totalInvested + walletData.availableBalance)) * 100 || 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CARDS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#16A34A] mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                        <TrendingUp size={20} />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Earnings</p>
                    <h3 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">Rs. {(walletData.totalEarned || 0).toLocaleString()}</h3>
                    <p className="text-[9px] text-[#16A34A] font-black mt-4 flex items-center gap-1 uppercase tracking-tight">
                        <Activity size={12} /> Live Yield Tracking
                    </p>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                        <Briefcase size={20} />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Active Capital</p>
                    <h3 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">Rs. {(walletData.totalInvested || 0).toLocaleString()}</h3>
                    <p className="text-[9px] text-blue-600 font-black mt-4 flex items-center gap-1 uppercase tracking-tight cursor-pointer hover:underline" onClick={() => navigate('/company/nf-plantation/dashboard/my-investment')}>
                        View {walletData.activePlansCount || 0} Active Plans <ArrowRight size={12} />
                    </p>
                </div>

                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-5 md:mb-6 group-hover:scale-110 transition-transform">
                        <Clock size={20} />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Pending / Held</p>
                    <h3 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight">Rs. {(walletData.heldBalance || 0).toLocaleString()}</h3>
                    <p className="text-[9px] text-amber-600 font-black mt-4 uppercase tracking-tight italic">
                        Processing Withdrawal...
                    </p>
                </div>
            </div>

            {/* --- INFO PANEL --- */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                        <CreditCard size={20} className="text-[#16A34A]" /> Bank Account Linked
                    </h3>
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Withdrawal Bank</p>
                                <p className="text-sm font-bold text-[#0F172A] uppercase">{user.bankDetails?.bankName || 'NOT CONFIGURED'}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Number</span>
                            <span className="text-sm font-mono font-bold text-[#0F172A]">**** **** {user.bankDetails?.accountNumber?.slice(-4) || '0000'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-emerald-500/20">
                    <h3 className="text-xl font-bold mb-3">Instant Growth Simulation</h3>
                    <p className="text-emerald-100 text-sm font-medium mb-8">Calculate how much your balance could earn in our premium plantation plans.</p>
                    <button 
                        onClick={() => navigate('/company/nf-plantation/dashboard/calculator')}
                        className="w-full py-4 bg-white text-emerald-900 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all text-center flex items-center justify-center gap-2"
                    >
                         Try Calculator <ChevronRight size={16} />
                    </button>
                    <div className="absolute -bottom-8 -right-8 opacity-10 scale-150 rotate-12">
                        <TrendingUp size={100} />
                    </div>
                </div>
            </div>

             {/* --- SECURITY FOOTER --- */}
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-100/50 rounded-[1.5rem] border border-slate-200/50">
                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     <ShieldCheck size={16} className="text-[#16A34A]" /> Bank-Grade Encryption Verified
                 </div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                     NF PLANTATION WALLET V2.0
                 </div>
            </div>

        </div>
    );
};

export default Wallet;
