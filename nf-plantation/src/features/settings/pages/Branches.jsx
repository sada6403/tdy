import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
    ChevronLeft, MapPin, ExternalLink, 
    Phone, Clock, Filter, Navigation, Info 
} from 'lucide-react';

const Branches = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) return null;
    if (!user) { navigate('/company/nf-plantation/login'); return null; }

    const branches = [
        { name: 'Kilinochchi HQ', address: 'No. 12, Main Street, Kilinochchi', contact: '021 228 1234', hours: '8:30 AM - 5:30 PM', coords: '9.39, 80.40', type: 'Main Headquarters', nearest: true },
        { name: 'Jaffna Branch', address: 'KKS Road, Jaffna Central', contact: '021 221 4321', hours: '9:00 AM - 5:00 PM', coords: '9.66, 80.01', type: 'Regional Office' },
        { name: 'Colombo Sub-Office', address: 'Liberty Plaza, Colombo 03', contact: '011 257 8888', hours: '10:00 AM - 6:00 PM', coords: '6.91, 79.85', type: 'Support Office' },
    ];

    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <main className="max-w-5xl">
                {/* Breadcrumb & Title */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/company/nf-plantation/dashboard')} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-emerald-600 transition-all active:scale-95 shadow-sm">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Nearby Branches</h1>
                            <p className="text-sm text-slate-500 font-medium">Find our physical offices for documentation and face-to-face support</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 active:scale-95 transition-all shadow-sm">
                        <Filter size={14} /> Filter Region
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* Left: Branch List Grid */}
                    <div className="lg:col-span-2 space-y-6 animate-in slide-in-from-left-5 duration-700">
                        {branches.map((branch, i) => (
                            <div key={i} className={`p-10 rounded-[3rem] border transition-all hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-none group relative overflow-hidden bg-white dark:bg-slate-900 ${
                                branch.nearest ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-100 dark:border-slate-800'
                            }`}>
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                                            branch.nearest ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-emerald-600 border border-slate-100 dark:border-slate-800'
                                        }`}>
                                            <MapPin size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">{branch.name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{branch.type}</p>
                                        </div>
                                    </div>
                                    {branch.nearest && (
                                        <span className="text-[9px] font-black px-3 py-1 bg-emerald-600 text-white rounded-full uppercase tracking-widest shadow-md">Nearest</span>
                                    )}
                                </div>
                                
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-10 pl-2 opacity-80 leading-relaxed border-l-2 border-emerald-500/30">
                                    {branch.address}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 border-b border-slate-50 dark:border-slate-800 relative z-10">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Primary</span>
                                        <span className="text-base font-black text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
                                            <Phone size={14} className="text-emerald-500" /> {branch.contact}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Office Hours</span>
                                        <span className="text-base font-black text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
                                            <Clock size={14} className="text-emerald-500" /> {branch.hours}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="pt-8 flex gap-4 relative z-10">
                                    <button className="flex-1 py-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2">
                                        <Navigation size={14} /> Directions
                                    </button>
                                    <button className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2">
                                        <ExternalLink size={14} /> Open Maps
                                    </button>
                                </div>

                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform"><MapPin size={100} /></div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Map Preview / Assistance */}
                    <div className="space-y-8 animate-in slide-in-from-right-5 duration-700">
                        {/* Summary Info */}
                        <div className="bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                             <div className="p-10 relative z-10">
                                <h3 className="text-xl font-black tracking-tighter mb-4 pr-12">Visit an Office for Document Verification</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-10">Our branch managers are available for in-person consultations and to verify original documents.</p>
                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                                    <div className="flex items-center gap-4 group/item cursor-pointer">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-emerald-400"><Navigation size={18} /></div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Navigation</p>
                                            <p className="text-xs font-bold group-hover:text-emerald-400 transition-colors">Find Route to Kilinochchi</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                             {/* Map Mockup Placeholder */}
                             <div className="aspect-square bg-slate-800/50 overflow-hidden relative border-t border-white/10">
                                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center text-center p-10 group cursor-pointer">
                                     <div className="space-y-4">
                                        <MapPin size={48} className="mx-auto text-emerald-500 animate-bounce" />
                                        <p className="text-xs font-black uppercase tracking-widest opacity-60">Interactive Map Preview</p>
                                        <button className="px-6 py-2 bg-emerald-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg group-hover:scale-110 transition-transform">Enable Map</button>
                                     </div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-10 bg-emerald-500/20 w-48 h-48 blur-3xl rounded-full"></div>
                             </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-start gap-4 shadow-sm">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/20 rounded-xl flex items-center justify-center text-blue-600 shrink-0"><Info size={20} /></div>
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">Branches are closed on public holidays and Sundays. Please call ahead to schedule an appointment.</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Branches;
