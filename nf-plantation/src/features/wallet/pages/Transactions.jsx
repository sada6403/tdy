import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
    Plus, ArrowUpRight, ArrowDownLeft, 
    Briefcase, Activity, RefreshCw, 
    Download, Filter, Search, MoreVertical,
    FileText, Zap, DollarSign, Calendar
} from 'lucide-react';
import api from '../../../services/api';

const Transactions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/customer/activities');
            if (res.success) setActivities(res.data);
        } catch (error) {
            console.error("Activities Sync Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             activity.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (activity.amount && activity.amount.toString().includes(searchQuery));
        const matchesFilter = filterType === 'ALL' || activity.type.includes(filterType);
        return matchesSearch && matchesFilter;
    });

    if (isLoading) return (
        <div className="space-y-6 animate-pulse p-4 sm:p-8">
            <div className="h-20 bg-white rounded-2xl border border-slate-100 mb-6"></div>
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-slate-100"></div>)}
        </div>
    );

    return (
        <div className="space-y-8 pb-10 max-w-6xl mx-auto">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight uppercase">Transactions</h1>
                    <p className="text-sm text-slate-500 font-medium italic">Complete historical record of your financial movements</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchData}
                        className="p-3 bg-white text-slate-500 border border-slate-200 rounded-xl hover:text-[#16A34A] transition-all shadow-sm group"
                        title="Refresh Activities"
                    >
                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                    <button 
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-black transition-all shadow-lg"
                    >
                        <Download size={16} /> Export Ledger
                    </button>
                </div>
            </div>

            {/* --- CONTROLS --- */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search transactions..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all outline-none uppercase tracking-widest text-[10px]"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {['ALL', 'DEPOSIT', 'WITHDRAWAL', 'INVESTMENT'].map(type => (
                        <button 
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === type ? 'bg-[#16A34A] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- MAIN CONTENT (Table on Desktop, Cards on Mobile) --- */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[11px] uppercase font-black text-slate-400 tracking-[0.2em] border-b border-slate-50">
                                <th className="px-8 py-6">Ledger Entry</th>
                                <th className="px-8 py-6">Date & Timestamp</th>
                                <th className="px-8 py-6 text-right">Volume (Rs.)</th>
                                <th className="px-8 py-6 text-center">Validation</th>
                                <th className="px-8 py-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredActivities.length > 0 ? (
                                filteredActivities.map((activity) => (
                                    <tr key={activity._id} className="hover:bg-slate-50/50 transition-all group cursor-default">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 ${
                                                    activity.type.includes('DEPOSIT') ? 'bg-emerald-50 text-emerald-600' : 
                                                    activity.type.includes('WITHDRAWAL') ? 'bg-blue-50 text-blue-600' : 
                                                    'bg-purple-50 text-purple-600'
                                                }`}>
                                                    {activity.type.includes('DEPOSIT') ? <Plus size={20} /> : 
                                                     activity.type.includes('WITHDRAWAL') ? <ArrowUpRight size={20} /> : <Briefcase size={20} />}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-black text-[#0F172A] uppercase tracking-tight group-hover:text-[#16A34A] transition-colors">{activity.type}</span>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">REF-{activity._id.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700 tracking-tight">{new Date(activity.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{new Date(activity.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <span className={`text-lg font-black tracking-tighter tabular-nums ${activity.type.includes('DEPOSIT') ? 'text-emerald-600' : 'text-[#0F172A]'}`}>
                                                {activity.type.includes('DEPOSIT') ? '+' : (activity.amount > 0 ? '+' : '')}{activity.amount ? activity.amount.toLocaleString() : '0'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                activity.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                activity.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' :
                                                'bg-rose-50 text-rose-600 border-rose-100'
                                            }`}>
                                                {activity.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-all shadow-sm">
                                                    <Zap size={16} />
                                                </button>
                                                <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-all shadow-sm">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center">
                                         <div className="max-w-xs mx-auto">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <Activity size={32} />
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 uppercase">No Matches Found</h4>
                                         </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-50">
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity) => (
                            <div key={activity._id} className="p-5 active:bg-slate-50 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${
                                            activity.type.includes('DEPOSIT') ? 'bg-emerald-50 text-emerald-600' : 
                                            activity.type.includes('WITHDRAWAL') ? 'bg-blue-50 text-blue-600' : 
                                            'bg-purple-50 text-purple-600'
                                        }`}>
                                            {activity.type.includes('DEPOSIT') ? <Plus size={18} /> : 
                                             activity.type.includes('WITHDRAWAL') ? <ArrowUpRight size={18} /> : <Briefcase size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#0F172A] uppercase tracking-tight">{activity.type}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(activity.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })} • {new Date(activity.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-base font-black tracking-tighter tabular-nums ${activity.type.includes('DEPOSIT') ? 'text-emerald-600' : 'text-[#0F172A]'}`}>
                                            {activity.type.includes('DEPOSIT') ? '+' : (activity.amount > 0 ? '+' : '')}{activity.amount ? activity.amount.toLocaleString() : '0'}
                                        </p>
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border mt-1 ${
                                            activity.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                            activity.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">REF-{activity._id.slice(-8).toUpperCase()}</span>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-slate-400 hover:text-[#16A34A] transition-all"><FileText size={14} /></button>
                                        <button className="p-2 text-slate-400"><MoreVertical size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-8 py-20 text-center">
                            <Activity size={32} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-xs font-black text-slate-400 uppercase">No History Found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- SUMMARY FOOTER --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#0F172A] p-6 rounded-2xl flex items-center gap-4 text-white">
                    <div className="w-10 h-10 bg-[#16A34A] rounded-xl flex items-center justify-center"><Download size={20} /></div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Inbound</p>
                        <p className="text-sm font-bold">Rs. {(activities.filter(a => a.type.includes('DEPOSIT')).reduce((acc, curr) => acc + curr.amount, 0)).toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center"><ArrowUpRight size={20} /></div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Outbound</p>
                        <p className="text-sm font-bold text-[#0F172A]">Rs. {(activities.filter(a => a.type.includes('WITHDRAWAL')).reduce((acc, curr) => acc + Math.abs(curr.amount), 0)).toLocaleString()}</p>
                    </div>
                </div>
                <div className="hidden lg:flex items-center gap-3 ml-auto px-6 italic text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <Activity size={14} className="text-[#16A34A]" /> Ledger Authenticated via Blockchain Node 12-B
                </div>
            </div>

        </div>
    );
};

export default Transactions;
