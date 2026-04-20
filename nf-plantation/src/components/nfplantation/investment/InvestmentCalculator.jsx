import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
    ArrowRight
} from 'lucide-react';

const InvestmentCalculator = () => {
    const [amount, setAmount] = useState(100000);
    const [duration, setDuration] = useState('1yr');
    const navigate = useNavigate();
    const { user } = useAuth();

    const RATES = { '1yr': 0.03, '2yr': 0.035, '3yr': 0.04 };
    const MONTHS = { '1yr': 12, '2yr': 24, '3yr': 36 };
    const LABELS = { '1yr': '12 Months', '2yr': '24 Months', '3yr': '36 Months' };
    const MIN_AMOUNT = 100000;
    const MAX_AMOUNT = 10000000;

    const currentRate = RATES[duration];
    const totalMonths = MONTHS[duration];
    const monthlyReturn = amount * currentRate;
    const totalProfit = monthlyReturn * totalMonths;
    const totalReturn = amount + totalProfit;

    const handleAmountChange = (e) => {
        let val = Number(e.target.value);
        if (val > MAX_AMOUNT) val = MAX_AMOUNT;
        setAmount(val);
    };

    const currency = (val) => new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(val);
    
    const handleGetPlan = () => {
        if (user) {
            navigate('/company/nf-plantation/dashboard/fd-plans');
        } else {
            navigate('/company/nf-plantation/login');
        }
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 font-sans">
            <div className="max-w-5xl mx-auto px-4 py-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left Side: Inputs */}
                    <div className="lg:col-span-7 space-y-8">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">1. Select Deposit Cycle</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {['1yr', '2yr', '3yr'].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDuration(d)}
                                        className={`py-4 sm:py-5 px-3 rounded-2xl border-2 transition-all duration-300 flex flex-row sm:flex-col justify-between sm:justify-center items-center gap-2 ${
                                            duration === d 
                                            ? 'border-[#0fb07d] bg-[#f0f9f6] dark:border-[#0fb07d]/50 dark:bg-[#0fb07d]/10 transition-all' 
                                            : 'border-slate-50 hover:border-slate-100 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                                        }`}
                                    >
                                        <div className={`font-black text-base sm:text-lg ${duration === d ? 'text-[#0fb07d]' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {LABELS[d]}
                                        </div>
                                        <div className={`text-[10px] font-bold tracking-widest uppercase ${duration === d ? 'text-[#0fb07d]' : 'text-slate-400'}`}>
                                            {(RATES[d]*100).toFixed(1)}% / m
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <label className="text-[10px] font-black text-[#0fb07d] uppercase tracking-[0.2em]">2. Principal Deposit Amount</label>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Min: 100,000 LKR</span>
                            </div>
                            
                            <div className="flex items-center gap-2 md:gap-4 mb-6">
                                <span className="text-xl md:text-3xl text-slate-300 font-serif italic">Rs</span>
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    onBlur={() => { if (amount < MIN_AMOUNT) setAmount(MIN_AMOUNT); if (amount > 10000000) setAmount(10000000); }}
                                    className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white bg-transparent outline-none w-full tracking-tighter"
                                />
                            </div>
                            
                            <input
                                type="range"
                                min={MIN_AMOUNT}
                                max={10000000}
                                step="50000"
                                value={amount}
                                onChange={handleAmountChange}
                                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#0fb07d] mb-6"
                            />

                            <div className="flex gap-2 flex-wrap">
                                {[100000, 500000, 1000000, 5000000].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val)}
                                        className="px-4 py-2 text-[9px] font-black text-slate-500 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest active:scale-95 shadow-sm"
                                    >
                                        {val >= 1000000 ? `${val/1000000}M` : `${val/1000}K`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Details & Results */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Plan Details Card */}
                        <div className="bg-[#f8faf9] dark:bg-slate-800/50 p-6 rounded-[2rem] border border-[#0fb07d]/10 animate-in fade-in slide-in-from-right-4">
                            <h4 className="text-[10px] font-black text-[#0fb07d] uppercase tracking-widest mb-4">Plan Summary</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium tracking-tight">Contract Term:</span>
                                    <span className="font-black text-slate-900 dark:text-white">{totalMonths} Months</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium tracking-tight">Structured Yield:</span>
                                    <span className="font-black text-[#0fb07d]">{(currentRate * 100).toFixed(1)}% Monthly</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium tracking-tight">Status:</span>
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-lg uppercase">Guaranteed</span>
                                </div>
                            </div>
                        </div>

                        {/* Results Box */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-50 dark:border-slate-800 p-8 shadow-sm">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Monthly</span>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Rs. {currency(monthlyReturn)}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-black text-[#0fb07d] uppercase tracking-widest mb-1 block">Net Profit</span>
                                    <div className="text-2xl font-black text-[#0fb07d] tracking-tighter">+Rs. {currency(totalProfit)}</div>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-slate-800">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Maturity Repayment</span>
                                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Rs. {currency(totalReturn)}</div>
                            </div>
                        </div>

                        <button
                            onClick={handleGetPlan}
                            className="w-full py-5 bg-[#0fb07d] hover:bg-[#0ca373] text-white font-black rounded-[1.5rem] flex items-center justify-center gap-3 transition-all uppercase tracking-[0.2em] text-[12px] shadow-lg shadow-[#0fb07d]/20 active:scale-95"
                        >
                            Start This Plan <ArrowRight size={18} />
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default InvestmentCalculator;

