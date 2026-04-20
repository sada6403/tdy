import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
    Wallet, Plus, ArrowUpRight, ArrowDownLeft, 
    Calculator as CalculatorIcon, Calendar as CalendarIcon, 
    Briefcase, MapPin, Bell, ChevronRight, 
    TrendingUp, Clock, CheckCircle2, AlertCircle, X, Info, ExternalLink,
    Download, FileText, ArrowRight, DollarSign, PieChart, Activity,
    Headset, ShieldCheck, Zap, Sparkles, Gift, MoreHorizontal
} from 'lucide-react';
import api from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [walletData, setWalletData] = useState({
        availableBalance: 0,
        heldBalance: 0,
        totalInvested: 0,
        totalEarned: 0,
        totalWithdrawn: 0
    });
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBill, setSelectedBill] = useState(null);

    const downloadPDF = (bill) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text('OFFICIAL TRANSACTION RECEIPT', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Transaction ID: ${bill._id}`, 20, 40);
        doc.text(`Date & Time: ${new Date(bill.createdAt).toLocaleString()}`, 20, 50);
        doc.text(`Type: ${bill.type}`, 20, 60);
        doc.text(`Status: ${bill.status}`, 20, 70);
        doc.text(`Amount: LKR ${bill.amount.toLocaleString()}`, 20, 80);
        
        if (bill.description) {
           doc.text(`Description: ${bill.description}`, 20, 90);
        }
        
        doc.save(`Transaction_Receipt_${bill._id.substring(0, 8)}.pdf`);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [walletRes, activityRes] = await Promise.all([
                api.get('/customer/wallet'),
                api.get('/customer/activities')
            ]);

            setWalletData(walletRes.data);
            setActivities(activityRes.data);
        } catch (error) {
            console.error("Dashboard Sync Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const summaryStats = [
        { label: 'Total Invested', value: walletData.totalInvested, icon: Briefcase, color: 'emerald' },
        { label: 'Total Monthly Earnings', value: walletData.totalEarned || 0, icon: TrendingUp, color: 'emerald' },
        { label: 'Active Plans', value: `${walletData.activePlansCount || 0} Active`, icon: Activity, color: 'blue' },
        { label: 'Total Withdrawn', value: walletData.totalWithdrawn || 0, icon: ArrowUpRight, color: 'amber' },
    ];

    if (isLoading) return (
        <div className="space-y-6 animate-pulse">
            <div className="h-64 bg-white rounded-3xl border border-slate-100"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100"></div>)}
            </div>
            <div className="h-96 bg-white rounded-3xl border border-slate-100"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10">
            
            {/* --- BILL MODAL --- */}
            {selectedBill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col">
                        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                                <FileText size={18} className="text-emerald-600" />
                                Official Receipt
                            </h3>
                            <button onClick={() => setSelectedBill(null)} className="p-2 text-slate-400 hover:text-rose-500 bg-white rounded-full shadow-sm transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6 flex-1">
                            <div className="text-center pb-6 border-b border-dashed border-slate-200">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h4 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">Transaction Successful</h4>
                                <h1 className="text-3xl font-black text-slate-900">LKR {selectedBill.amount.toLocaleString()}</h1>
                            </div>
                            
                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Transaction Type</span>
                                    <span className="font-black text-slate-900 uppercase">{selectedBill.type}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Date & Time</span>
                                    <span className="font-bold text-slate-900">{new Date(selectedBill.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Status</span>
                                    <span className="text-emerald-600 font-black uppercase px-2 py-0.5 bg-emerald-50 rounded text-xs">{selectedBill.status}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Reference ID</span>
                                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded">{selectedBill._id}</span>
                                </div>
                                {selectedBill.description && (
                                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Remarks / Memo</span>
                                        <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedBill.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <button onClick={() => setSelectedBill(null)} className="py-3 text-xs font-black text-slate-500 uppercase tracking-widest bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                                Close
                            </button>
                            <button onClick={() => downloadPDF(selectedBill)} className="py-3 text-xs font-black text-white uppercase tracking-widest bg-emerald-600 rounded-xl flex justify-center items-center gap-2 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all">
                                <Download size={14} /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
            {/* --- HERO BALANCE CARD --- */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-[#0F172A] rounded-[2.5rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl border border-white/5"
            >
                 <div className="absolute top-0 right-0 w-80 h-80 bg-[#16A34A]/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-24 -mb-24"></div>
                 
                 <div className="relative z-10">
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mb-4">Total Liquidity Overview</p>
                     <div className="flex justify-center items-baseline gap-2 mb-2">
                         <span className="text-2xl font-bold text-[#16A34A]">LKR</span>
                         <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
                            {(walletData.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                         </h1>
                     </div>
                     
                     {walletData.heldBalance > 0 ? (
                         <div className="inline-flex items-center gap-2 px-6 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-widest mb-8">
                             <Clock size={14} className="animate-pulse" /> Held Capital: Rs. {(walletData.heldBalance || 0).toLocaleString()}
                         </div>
                     ) : (
                        <div className="h-10"></div>
                     )}

                     {/* Action Buttons inside card */}
                     <div className="hidden md:flex flex-wrap justify-center gap-4 mt-8">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/company/nf-plantation/dashboard/add-cash')}
                            className="px-10 py-4 bg-[#16A34A] hover:bg-[#15803d] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-xl shadow-[#16A34A]/20"
                        >
                            <Plus size={18} /> Add Cash
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/company/nf-plantation/dashboard/withdraw')}
                            className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/10 transition-all flex items-center gap-2"
                        >
                            <ArrowUpRight size={18} /> Withdraw
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/company/nf-plantation/dashboard/fd-activation/default')}
                            className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/10 transition-all flex items-center gap-2"
                        >
                            <Zap size={18} className="text-[#16A34A] fill-[#16A34A]" /> Plans
                        </motion.button>
                     </div>

                     {/* Mobile Quick Actions */}
                     <div className="md:hidden flex flex-col gap-3 mt-8">
                        <motion.button 
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/company/nf-plantation/dashboard/add-cash')}
                            className="w-full py-4 bg-[#16A34A] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Plus size={16} /> Instant Deposit
                        </motion.button>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => navigate('/company/nf-plantation/dashboard/withdraw')} className="py-3 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5">Withdraw</button>
                            <button onClick={() => navigate('/company/nf-plantation/dashboard/fd-activation/default')} className="py-3 bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5">View Plans</button>
                        </div>
                     </div>
                  </div>
            </motion.div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {summaryStats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[1.25rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 mb-3 md:mb-4 group-hover:bg-[#16A34A]/10 group-hover:text-[#16A34A] transition-colors`}>
                            <stat.icon size={18} />
                        </div>
                        <p className="text-slate-400 text-[9px] md:text-xs font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                        <h4 className="text-sm md:text-xl font-bold text-[#0F172A] tracking-tight">
                            {typeof stat.value === 'number' ? `Rs. ${stat.value.toLocaleString()}` : stat.value}
                        </h4>
                    </div>
                ))}
            </div>

            {/* --- TRANSACTION TABLE / LIST --- */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-10 md:mb-0">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-[#0F172A]">Recent Activity</h3>
                    <button onClick={() => navigate('/company/nf-plantation/dashboard/transactions')} className="text-[#16A34A] text-xs font-bold hover:underline">View All</button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {activities.slice(0, 10).map((activity) => (
                                <tr key={activity._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                activity.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-600' : 
                                                activity.type === 'WITHDRAWAL' ? 'bg-blue-50 text-blue-600' : 
                                                'bg-purple-50 text-purple-600'
                                            }`}>
                                                {activity.type === 'DEPOSIT' ? <Plus size={16} /> : 
                                                 activity.type === 'WITHDRAWAL' ? <ArrowUpRight size={16} /> : <Briefcase size={16} />}
                                            </div>
                                            <span className="text-sm font-bold text-[#0F172A]">{activity.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-slate-600">{new Date(activity.createdAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(activity.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-bold text-[#0F172A]">Rs. {activity.amount.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            activity.status === 'COMPLETED' ? 'bg-[#16A34A]/10 text-[#16A34A]' : 
                                            activity.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                            {activity.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <button 
                                            onClick={() => setSelectedBill(activity)}
                                            className="p-2 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <FileText size={16} /> Bill
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile List View */}
                <div className="md:hidden divide-y divide-slate-100">
                    {activities.length > 0 ? (
                        activities.slice(0, 8).map((activity) => (
                            <div key={activity._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors" onClick={() => setSelectedBill(activity)}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                                        activity.type === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-600' : 
                                        activity.type === 'WITHDRAWAL' ? 'bg-blue-50 text-blue-600' : 
                                        'bg-purple-50 text-purple-600'
                                    }`}>
                                        {activity.type === 'DEPOSIT' ? <Plus size={18} /> : 
                                         activity.type === 'WITHDRAWAL' ? <ArrowUpRight size={18} /> : <Briefcase size={18} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-[#0F172A] uppercase tracking-tight">{activity.type}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{new Date(activity.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <span className="text-xs font-black text-[#0F172A]">Rs. {activity.amount.toLocaleString()}</span>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                        activity.status === 'COMPLETED' ? 'text-emerald-600 bg-emerald-50' : 
                                        'text-amber-600 bg-amber-50'
                                    }`}>{activity.status}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-slate-400 text-xs">No recent activity</div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-50 bg-slate-50/20 text-center">
                    <button 
                        onClick={fetchData}
                        className="text-[10px] font-bold text-slate-400 hover:text-[#16A34A] uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                    >
                        <Activity size={14} /> Sync Status
                    </button>
                </div>
            </div>

            {/* --- MOBILE FAB --- */}
            <motion.button 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => navigate('/company/nf-plantation/dashboard/add-cash')}
                className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-[#16A34A] text-white rounded-full shadow-2xl flex items-center justify-center z-[110] border-4 border-white"
            >
                <Plus size={28} strokeWidth={3} />
            </motion.button>

            {/* --- SECURITY FOOTER --- */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-100/50 rounded-[1.5rem] border border-slate-200/50 grayscale opacity-60">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     <ShieldCheck size={16} className="text-[#16A34A]" /> Bank-Grade Security
                 </div>
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                     © 2026 NF PLANTATION CORE V2.5
                 </div>
            </div>

        </div>
    );
};

export default CustomerDashboard;
