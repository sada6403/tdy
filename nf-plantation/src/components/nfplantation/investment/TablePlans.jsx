import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { nfData } from '../../../constants/nfPlantationData';
import { TrendingUp, ShieldCheck, Clock, Award, CheckCircle2, DollarSign } from 'lucide-react';

const TablePlans = () => {
    const [dbPlans, setDbPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await api.get('/customer/plans');
                if (response.success && response.data.length > 0) {
                    setDbPlans(response.data);
                }
            } catch (error) {
                console.error("Backend Sync Delay, Using Fallback...", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const TableHeader = ({ labels }) => (
        <thead>
            <tr className="bg-slate-900 border-b border-white/5">
                {labels.map((label, i) => (
                    <th key={i} className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{label}</th>
                ))}
            </tr>
        </thead>
    );

    const TableRow = ({ data, isOdd }) => (
        <tr className={`group transition-all duration-300 hover:bg-emerald-500/5 ${isOdd ? 'bg-white/40 dark:bg-slate-900/40' : 'bg-transparent'}`}>
            {data.map((cell, i) => (
                <td key={i} className={`px-8 py-8 border-r border-slate-100 dark:border-white/5 last:border-r-0 ${i === 0 ? 'font-black text-slate-900 dark:text-white uppercase tracking-tighter italic text-lg' : 'text-sm font-medium text-slate-500 dark:text-slate-400'}`}>
                    {i === 1 && typeof cell === 'string' && cell.includes('Rs') ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">{cell}</span>
                    ) : i === 3 && typeof cell === 'string' && cell.includes('%') ? (
                        <span className="text-emerald-500 font-black">{cell}</span>
                    ) : (
                        cell
                    )}
                </td>
            ))}
        </tr>
    );

    return (
        <div className="w-full glass-card rounded-[3.5rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-2xl transition-all duration-500 hover:shadow-emerald-500/5">
            {loading ? (
                <div className="p-24 text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-white animate-spin mx-auto mb-6"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Syncing Asset Plans...</p>
                </div>
            ) : (
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        {dbPlans.length > 0 ? (
                            <>
                                <TableHeader labels={['Deposit Model', 'Min. Deposit', 'Tenure Cycle', 'Structured ROI']} />
                                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                    {dbPlans.map((plan, index) => (
                                        <TableRow 
                                            key={index} 
                                            isOdd={index % 2 === 0}
                                            data={[
                                                plan.name || plan.title || 'Standard Plan',
                                                `Rs. ${(plan.minAmount || plan.min_investment_amount)?.toLocaleString() || '0'}`,
                                                `${plan.duration || plan.duration_months || '0'} Months`,
                                                `${plan.interestRate || plan.expected_return_percentage || '0'}% / Month`
                                            ]}
                                        />
                                    ))}
                                </tbody>
                            </>
                        ) : (
                            <>
                                <TableHeader labels={['Deposit Scale', 'Phase 1 (3%)', 'Phase 2 (3.5%)', 'Phase 3 (4%)']} />
                                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                    {nfData.investment.tableRows.map((row, index) => (
                                        <TableRow 
                                            key={index} 
                                            isOdd={index % 2 === 0}
                                            data={[
                                                row.amount,
                                                row.y1,
                                                row.y2,
                                                row.y3
                                            ]}
                                        />
                                    ))}
                                </tbody>
                            </>
                        )}
                    </table>
                </div>
            )}
            
            {/* Table Footer - Human Design Detail */}
            <div className="px-10 py-8 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Returns</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">100% Asset-Linked</span>
                    </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white dark:bg-slate-950 px-4 py-2 rounded-full border border-slate-100 dark:border-white/5">
                    Updated <Clock size={12} className="inline ml-1 mb-0.5" /> 2h ago
                </div>
            </div>
        </div>
    );
};

export default TablePlans;
