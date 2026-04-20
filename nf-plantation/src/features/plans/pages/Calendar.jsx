import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
    ChevronLeft, Calendar as CalIcon, ChevronRight, 
    Plus, Clock, ArrowRight, Dot, Filter 
} from 'lucide-react';

const CalendarPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date());

    if (loading) return null;
    if (!user) { navigate('/company/nf-plantation/login'); return null; }

    const [investments, setInvestments] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [totalExpected, setTotalExpected] = useState(0);

    const fetchData = async () => {
        try {
            const res = await api.get('/customer/my-investments');
            if (res.success && res.data) {
                const active = res.data.filter(inv => inv.status === 'ACTIVE');
                setInvestments(active);

                let total = 0;
                let upcomingEvents = [];
                const now = new Date();
                
                active.forEach(inv => {
                    const start = new Date(inv.startDate || inv.createdAt);
                    const end = new Date(inv.endDate);
                    const day = start.getDate();
                    
                    const monthlyYield = inv.monthlyProfit || ((inv.investedAmount * ((inv.planId?.interestRate || 0) / 100)) / 12);
                    total += monthlyYield * 3; // For 3 months summary
                    
                    let nextDate = new Date(now.getFullYear(), now.getMonth(), day);
                    if (nextDate < now) {
                        nextDate.setMonth(nextDate.getMonth() + 1);
                    }
                    
                    for(let i=0; i<3; i++) {
                        let eventDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + i, day);
                        if (eventDate <= end) {
                            upcomingEvents.push({
                                id: `${inv._id}-${i}`,
                                title: `${inv.planName || 'Investment'} Yield`,
                                date: eventDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
                                rawDate: eventDate,
                                type: 'Payout',
                                color: 'emerald',
                                label: `LKR ${monthlyYield.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                            });
                        }
                    }
                    
                    if (end > now) {
                        upcomingEvents.push({
                            id: `${inv._id}-maturity`,
                            title: `${inv.planName || 'Investment'} Maturity`,
                            date: end.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }),
                            rawDate: end,
                            type: 'Maturity',
                            color: 'blue',
                            label: 'CAPITAL RETURN'
                        });
                    }
                });

                upcomingEvents.sort((a, b) => a.rawDate - b.rawDate);
                setMilestones(upcomingEvents.slice(0, 5));
                setTotalExpected(total);
            }
        } catch (error) {
            console.error("Calendar Sync Error:", error);
        }
    };

    React.useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };

    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <main className="max-w-5xl">
                {/* Breadcrumb & Title */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/company/nf-plantation/dashboard')} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-emerald-600 transition-all active:scale-95 shadow-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Payout Calendar</h1>
                            <p className="text-xs md:text-sm text-slate-500 font-medium">Track your upcoming investment milestones</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* Left: Detailed Calendar Layout */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-5 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                            {/* Simple Grid Calendar UI */}
                            <div className="flex justify-between items-center mb-6 md:mb-10">
                                <h4 className="text-base md:text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                                    {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                </h4>
                                <div className="flex gap-2">
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"><ChevronLeft size={18} /></button>
                                    <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"><ChevronRight size={18} /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1 md:gap-4 text-center text-[8px] md:text-[10px] font-black text-slate-400 mb-4 md:mb-6 uppercase tracking-[0.1em] md:tracking-[0.2em] border-b pb-4 border-slate-50 dark:border-slate-800">
                                {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
                            </div>

                            <div className="grid grid-cols-7 gap-1 md:gap-4">
                                {generateCalendarDays().map((day, i) => {
                                    const today = new Date();
                                    const isToday = day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
                                    
                                    let isPayout = false;
                                    let isMaturity = false;

                                    if (day) {
                                        const dateOfThisCell = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                                        investments.forEach(inv => {
                                            const start = new Date(inv.startDate || inv.createdAt);
                                            const end = new Date(inv.endDate);
                                            
                                            // Check Maturity
                                            if (dateOfThisCell.getFullYear() === end.getFullYear() && dateOfThisCell.getMonth() === end.getMonth() && day === end.getDate()) {
                                                isMaturity = true;
                                            }
                                            // Check Payout (every month on the start date, until end date)
                                            else if (day === start.getDate() && dateOfThisCell >= new Date(start.getFullYear(), start.getMonth(), 1) && dateOfThisCell <= end) {
                                                isPayout = true;
                                            }
                                        });
                                    }

                                    return (
                                        <div key={i} className={`aspect-square flex flex-col items-center justify-center text-sm font-black rounded-2xl transition-all relative group cursor-default ${
                                            day === null ? 'opacity-0 h-0 pointer-events-none' : 
                                            isToday ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30' : 
                                            isMaturity ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 pt-1' :
                                            isPayout ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 pt-1' :
                                            'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}>
                                            {day}
                                            {(isPayout || isMaturity) && !isToday && (
                                                <div className="absolute top-1 right-1">
                                                    <Dot size={18} className={`animate-pulse ${isMaturity ? 'text-blue-600' : 'text-emerald-600'}`} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-8 md:mt-12 flex flex-wrap items-center justify-start gap-4 md:gap-6 border-t pt-6 md:pt-8 border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-emerald-600 rounded-full"></div>
                                    <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Payout</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full"></div>
                                    <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Maturity</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-amber-500 rounded-full"></div>
                                    <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Due</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Milestone List */}
                    <div className="space-y-8">
                        {/* Summary Info */}
                        <div className="bg-slate-900 dark:bg-black p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                             <div className="relative z-10">
                                <h3 className="text-xl font-black tracking-tighter mb-8 pr-12">Earnings highlight for next 3 months</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0 hover:text-emerald-400 transition-colors">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expected Payout</span>
                                        <span className="text-xl font-black tracking-tight font-mono">Rs. {totalExpected.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0 hover:text-emerald-400 transition-colors">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Plan Returns</span>
                                        <span className="text-xl font-black tracking-tight font-mono">{investments.length < 10 ? '0' : ''}{investments.length} Active</span>
                                    </div>
                                </div>
                             </div>
                             <div className="absolute top-0 right-0 p-4 opacity-10 bg-emerald-500/20 w-48 h-48 blur-3xl rounded-full"></div>
                             <div className="absolute -bottom-8 -right-8 opacity-10 scale-150 rotate-12"><Clock size={100} /></div>
                        </div>

                        {/* Schedule List Component */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Upcoming Events</h3>
                                <Filter size={16} className="text-slate-300" />
                            </div>
                            <div className="space-y-6">
                                {milestones.length > 0 ? milestones.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:translate-x-1 group">
                                        <div className={`w-10 h-10 bg-${item.color}-50 dark:bg-${item.color}-950/20 rounded-xl flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 group-hover:scale-110 transition-transform`}>
                                            <CalIcon size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200 tracking-tight uppercase leading-none mb-1">{item.title}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date}</p>
                                        </div>
                                        <div className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-white border border-slate-200 rounded-full`}>
                                            {item.label}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed">
                                        No upcoming events
                                    </div>
                                )}
                            </div>
                            <button className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 active:scale-95 transition-all">
                                Download Schedule <Plus size={14} />
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CalendarPage;
