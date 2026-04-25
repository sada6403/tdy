import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    ChevronLeft, ChevronRight, Calendar as CalIcon,
    Clock, Filter, TrendingUp, Landmark, Wallet,
    Briefcase, ArrowRight, RefreshCw
} from 'lucide-react';
import api from '../../../services/api';

// Safe month addition — mirrors backend logic (Jan 31 + 1 = Feb 28, not Mar 3)
function addOneMonthSafe(date) {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + 1, 1);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return d;
}

// Project all payout dates from startDate to endDate
function getPayoutDates(investment) {
    if (!investment.startDate || !investment.endDate) return [];
    const endDate = new Date(investment.endDate);
    const dates = [];
    let current = addOneMonthSafe(new Date(investment.startDate));
    while (current <= endDate) {
        dates.push(new Date(current));
        current = addOneMonthSafe(current);
    }
    return dates;
}

const CalendarPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // All hooks at top — no hooks after conditional returns
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [investments, setInvestments] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [totalExpected, setTotalExpected] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/customer/my-investments');
            if (res.success && res.data) {
                const active = res.data.filter(inv => inv.status === 'ACTIVE');
                setInvestments(active);
                buildMilestones(active);
            }
        } catch (err) {
            console.error('Calendar Sync Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const buildMilestones = (active) => {
        const now = new Date();
        let total = 0;
        const events = [];

        active.forEach(inv => {
            const monthlyYield = inv.investedAmount * ((inv.monthlyROI || 0) / 100);
            const endDate = new Date(inv.endDate);

            // Next 3 upcoming payout dates
            getPayoutDates(inv)
                .filter(d => d > now)
                .slice(0, 3)
                .forEach(d => {
                    total += monthlyYield;
                    events.push({
                        id: `${inv._id}-${d.getTime()}`,
                        title: `${inv.planName || 'Investment'} Yield`,
                        rawDate: d,
                        date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        type: 'PAYOUT',
                        label: `LKR ${monthlyYield.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                    });
                });

            // Maturity
            if (endDate > now) {
                events.push({
                    id: `${inv._id}-maturity`,
                    title: `${inv.planName || 'Investment'} Maturity`,
                    rawDate: endDate,
                    date: endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    type: 'MATURITY',
                    label: `LKR ${inv.investedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
                });
            }
        });

        events.sort((a, b) => a.rawDate - b.rawDate);
        setMilestones(events.slice(0, 6));
        setTotalExpected(total);
    };

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

    // Build day-level event map for the displayed month
    const buildDayMap = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const map = {};

        investments.forEach(inv => {
            const endDate = new Date(inv.endDate);
            const monthlyYield = inv.investedAmount * ((inv.monthlyROI || 0) / 100);

            // Maturity
            if (endDate.getFullYear() === year && endDate.getMonth() === month) {
                const d = endDate.getDate();
                if (!map[d]) map[d] = { isPayout: false, isMaturity: false, payoutPlans: [], maturityPlans: [] };
                map[d].isMaturity = true;
                map[d].maturityPlans.push({ name: inv.planName, amount: inv.investedAmount });
            }

            // Payout dates
            getPayoutDates(inv).forEach(pd => {
                if (pd.getFullYear() === year && pd.getMonth() === month) {
                    const d = pd.getDate();
                    if (!map[d]) map[d] = { isPayout: false, isMaturity: false, payoutPlans: [], maturityPlans: [] };
                    map[d].isPayout = true;
                    map[d].payoutPlans.push({ name: inv.planName, amount: monthlyYield });
                }
            });
        });

        return map;
    };

    // Conditionals after all hooks
    if (loading) return null;
    if (!user) { navigate('/company/nf-plantation/login'); return null; }

    const dayMap = buildDayMap();
    const today = new Date();

    const prevMonth = () => setCurrentMonth(prev => {
        const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d;
    });
    const nextMonth = () => setCurrentMonth(prev => {
        const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d;
    });

    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <main className="max-w-6xl">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/company/nf-plantation/dashboard')}
                            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-500 hover:text-emerald-600 transition-all active:scale-95 shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">Payout Calendar</h1>
                            <p className="text-xs md:text-sm text-slate-500 font-medium">Track your upcoming investment milestones</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
                        title="Refresh"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── LEFT COLUMN ── */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Calendar Card */}
                        <div className="bg-white rounded-[2rem] p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">

                            {/* Month Nav */}
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tight">
                                    {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                                </h4>
                                <div className="flex gap-2">
                                    <button onClick={prevMonth} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentMonth(new Date())}
                                        className="px-4 py-2 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                                    >
                                        Today
                                    </button>
                                    <button onClick={nextMonth} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Day Headers */}
                            <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-[9px] md:text-[10px] font-black text-slate-400 mb-3 pb-4 border-b border-slate-50 uppercase tracking-widest">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d}>{d}</div>
                                ))}
                            </div>

                            {/* Days Grid */}
                            <div className="grid grid-cols-7 gap-1 md:gap-2">
                                {generateCalendarDays().map((day, i) => {
                                    if (!day) return <div key={i} className="aspect-square" />;

                                    const isToday =
                                        day === today.getDate() &&
                                        currentMonth.getMonth() === today.getMonth() &&
                                        currentMonth.getFullYear() === today.getFullYear();

                                    const info = dayMap[day];
                                    const isPayout = info?.isPayout;
                                    const isMaturity = info?.isMaturity;

                                    let cellClass = 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40';
                                    if (isToday) {
                                        cellClass = 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30';
                                    } else if (isMaturity && isPayout) {
                                        cellClass = 'bg-gradient-to-br from-emerald-50 to-blue-50 text-slate-800 border-2 border-emerald-300 ring-2 ring-emerald-100';
                                    } else if (isMaturity) {
                                        cellClass = 'bg-blue-50 text-blue-900 border-2 border-blue-300 ring-2 ring-blue-100';
                                    } else if (isPayout) {
                                        cellClass = 'bg-emerald-50 text-emerald-900 border-2 border-emerald-300 ring-2 ring-emerald-100';
                                    }

                                    return (
                                        <div
                                            key={i}
                                            className={`aspect-square flex flex-col items-center justify-center text-xs md:text-sm font-black rounded-xl md:rounded-2xl transition-all relative cursor-default ${cellClass}`}
                                        >
                                            <span>{day}</span>
                                            {!isToday && (isPayout || isMaturity) && (
                                                <div className="flex gap-0.5 mt-0.5">
                                                    {isPayout && (
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" title="Payout" />
                                                    )}
                                                    {isMaturity && (
                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" title="Maturity" />
                                                    )}
                                                </div>
                                            )}
                                            {isToday && (isPayout || isMaturity) && (
                                                <div className="flex gap-0.5 mt-0.5">
                                                    {isPayout && <div className="w-1.5 h-1.5 bg-white/70 rounded-full" />}
                                                    {isMaturity && <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend */}
                            <div className="mt-8 flex flex-wrap gap-5 border-t pt-6 border-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Monthly Payout</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Plan Maturity</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-600 rounded-full" />
                                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Today</span>
                                </div>
                            </div>
                        </div>

                        {/* Active Plans List */}
                        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                    <Briefcase size={16} className="text-emerald-600" />
                                    My Active Plans
                                    {investments.length > 0 && (
                                        <span className="ml-2 text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                            {investments.length}
                                        </span>
                                    )}
                                </h3>
                                <button
                                    onClick={() => navigate('/company/nf-plantation/dashboard/my-investment')}
                                    className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                                >
                                    View All <ArrowRight size={12} />
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
                                    ))}
                                </div>
                            ) : investments.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No active plans</p>
                                    <button
                                        onClick={() => navigate('/company/nf-plantation/dashboard/plans')}
                                        className="mt-4 px-5 py-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all"
                                    >
                                        Browse Plans
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {investments.map(inv => {
                                        const monthlyYield = inv.investedAmount * ((inv.monthlyROI || 0) / 100);
                                        const start = new Date(inv.startDate);
                                        const end = new Date(inv.endDate);
                                        const nextProfit = new Date(inv.nextProfitDate);
                                        const now = new Date();
                                        const totalDays = (end - start) / (1000 * 60 * 60 * 24);
                                        const doneDays = (now - start) / (1000 * 60 * 60 * 24);
                                        const progress = Math.min(100, Math.max(0, Math.round((doneDays / totalDays) * 100)));

                                        return (
                                            <div key={inv._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all group">
                                                {/* Plan header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                                            {inv.planName || 'Investment Plan'}
                                                        </h4>
                                                        <p className="text-[9px] font-bold text-slate-400 font-mono mt-0.5">
                                                            REF #{inv.referenceNumber}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                                            ACTIVE
                                                        </span>
                                                        {inv.profitDestination === 'BANK' ? (
                                                            <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                                                <Landmark size={10} /> Bank
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                                                <Wallet size={10} /> Wallet
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stats grid */}
                                                <div className="grid grid-cols-3 gap-3 mb-4">
                                                    <div className="bg-white rounded-xl p-3 border border-slate-100">
                                                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Capital</p>
                                                        <p className="text-sm font-black text-slate-900">
                                                            LKR {(inv.investedAmount || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                                        <p className="text-[8px] text-emerald-600 uppercase font-black tracking-widest mb-1">Monthly</p>
                                                        <p className="text-sm font-black text-emerald-700">
                                                            LKR {monthlyYield.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white rounded-xl p-3 border border-slate-100">
                                                        <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest mb-1">Next Payout</p>
                                                        <p className="text-sm font-black text-slate-900">
                                                            {nextProfit > now
                                                                ? nextProfit.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                                                                : '—'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Date range + ROI */}
                                                <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                    <span>
                                                        Started {start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-emerald-600">{inv.monthlyROI}% / mo · {inv.durationMonths}M</span>
                                                    <span>
                                                        Matures {end.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>

                                                {/* Progress bar */}
                                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[9px] text-slate-400 font-bold mt-1.5 text-right">
                                                    {progress}% complete
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="space-y-6">

                        {/* Earnings Summary Card */}
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-lg font-black tracking-tight mb-6 leading-snug">
                                    Earnings highlight<br />for next 3 months
                                </h3>
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected Payout</span>
                                        <span className="text-xl font-black font-mono">
                                            Rs. {totalExpected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Plan Returns</span>
                                        <span className="text-xl font-black font-mono">
                                            {String(investments.length).padStart(2, '0')} Active
                                        </span>
                                    </div>
                                    {investments.length > 0 && (
                                        <div className="flex items-center justify-between py-4">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Capital</span>
                                            <span className="text-lg font-black font-mono text-emerald-400">
                                                LKR {investments.reduce((s, i) => s + (i.investedAmount || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-8 -right-8 opacity-10 scale-150 rotate-12">
                                <Clock size={100} />
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">
                                    Upcoming Events
                                </h3>
                                <Filter size={14} className="text-slate-300" />
                            </div>

                            <div className="space-y-3">
                                {milestones.length > 0 ? (
                                    milestones.map(item => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:translate-x-1 transition-transform"
                                        >
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                                item.type === 'PAYOUT'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                <CalIcon size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[10px] font-black text-slate-800 uppercase leading-none truncate">
                                                    {item.title}
                                                </h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                    {item.date}
                                                </p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full flex-shrink-0 ${
                                                item.type === 'PAYOUT'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {item.label}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-slate-400 text-[10px] font-bold uppercase tracking-widest bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                        No upcoming events
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default CalendarPage;
