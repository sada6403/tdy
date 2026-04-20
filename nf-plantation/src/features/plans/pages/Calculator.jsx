import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import InvestmentCalculator from '../../../components/nfplantation/investment/InvestmentCalculator';
import { 
    ChevronLeft, Calculator as CalcIcon
} from 'lucide-react';

const Calculator = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return null;
    if (!user) { navigate('/company/nf-plantation/login'); return null; }

    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <main className="max-w-6xl text-slate-900 dark:text-white mx-auto">
                {/* Breadcrumb & Title */}
                <div className="mb-10 flex items-center gap-4">
                    <button onClick={() => navigate('/company/nf-plantation/dashboard')} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-emerald-600 transition-all active:scale-95 shadow-sm">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-black tracking-tight uppercase text-slate-900 dark:text-white">Investment Calculator</h1>
                        <p className="text-sm text-slate-500 font-medium italic">Simulate growth and estimate your potential earnings</p>
                    </div>
                </div>

                <div className="w-full">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-4 sm:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                        <InvestmentCalculator />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Calculator;
