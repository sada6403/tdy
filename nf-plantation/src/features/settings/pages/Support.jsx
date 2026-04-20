import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
    ChevronLeft, Phone, Mail, MessageSquare, 
    Send, Info, Clock, ExternalLink, Globe,
    ChevronRight, ArrowRight, UserCircle2, CheckCircle2
} from 'lucide-react';

const Support = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (loading) return null;
    if (!user) { navigate('/company/nf-plantation/login'); return null; }

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            alert('Your request has been sent! Our support team will contact you soon.');
            navigate('/company/nf-plantation/dashboard');
        }, 1500);
    };

    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <main className="max-w-5xl">
                {/* Breadcrumb & Title */}
                <div className="mb-10 flex items-center gap-4">
                    <button onClick={() => navigate('/company/nf-plantation/dashboard')} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-emerald-600 transition-all active:scale-95 shadow-sm">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Customer Support</h1>
                        <p className="text-sm text-slate-500 font-medium">Get professional investment assistance and tech support</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    
                    {/* Left Side: Contact Information Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-slate-900 dark:bg-black p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-500 mb-10 pb-4 border-b border-white/10">Primary Channels</h3>
                            
                            <div className="space-y-8">
                                <div className="space-y-2 group/item">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Investment Enquiries</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-black tracking-tight group-hover/item:text-emerald-400 transition-colors">+94 (21) 228 1234</span>
                                        <button className="p-3 bg-white/5 hover:bg-emerald-500/20 rounded-xl transition-all shadow-sm active:scale-90"><Phone size={18} className="text-emerald-500" /></button>
                                    </div>
                                </div>
                                <div className="space-y-2 group/item">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Technical Support</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-black tracking-tight group-hover/item:text-emerald-400 transition-colors">+94 (11) 257 8888</span>
                                        <button className="p-3 bg-white/5 hover:bg-emerald-500/20 rounded-xl transition-all shadow-sm active:scale-90"><Phone size={18} className="text-emerald-500" /></button>
                                    </div>
                                </div>
                                <div className="space-y-2 group/item">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Official Email</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-black tracking-tight group-hover/item:text-emerald-400 transition-colors">support@nfplantation.lk</span>
                                        <button className="p-3 bg-white/5 hover:bg-emerald-500/20 rounded-xl transition-all shadow-sm active:scale-90"><Send size={18} className="text-emerald-500" /></button>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-14 flex items-center gap-3 text-slate-400">
                                <Clock size={16} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Active Hours: 08:30am - 05:30pm (Daily)</span>
                            </div>

                            <div className="absolute top-0 right-0 p-4 opacity-10 bg-emerald-500/20 w-48 h-48 blur-3xl rounded-full"></div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-5 shadow-sm group hover:scale-[1.02] transition-transform cursor-pointer">
                            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                                <MessageSquare size={28} />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Real-time Whatsapp Help</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Chat directly with an agent</p>
                            </div>
                            <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                    </div>

                    {/* Right Side: Help Request Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-12 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-1.5 h-10 bg-emerald-500 rounded-full"></div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Send a Help Request</h3>
                                    <p className="text-xs text-slate-500 font-medium">We usually respond within 60 minutes during business hours.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Support Category</label>
                                        <select className="w-full bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl px-6 py-4 text-xs font-black text-slate-700 dark:text-slate-300 outline-none focus:ring-4 focus:ring-emerald-500/10 cursor-pointer appearance-none transition-all">
                                            <option>General Investment Question</option>
                                            <option>Withdrawal or Payout Help</option>
                                            <option>Document Verification Status</option>
                                            <option>New Plan Activation Service</option>
                                            <option>Technical Issue (Portal/Login)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority Level</label>
                                        <div className="flex gap-4">
                                            {['Routine', 'Argent'].map((p) => (
                                                <button key={p} type="button" className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${p === 'Routine' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-800'}`}>
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Content</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-6 text-slate-300 group-focus-within:text-emerald-500"><MessageSquare size={18} /></div>
                                        <textarea required rows="4" placeholder="How can we help you today?" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] px-14 py-6 text-sm font-medium text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none shadow-inner"></textarea>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button disabled={isSubmitting} type="submit" className="group w-full bg-slate-900 py-6 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                        {isSubmitting ? 'Sending Request...' : 'Transmit Help Message'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6">
                            {[
                                { title: 'User Guide', icon: Globe },
                                { title: 'Investment FAQ', icon: Info },
                                { title: 'Safety Desk', icon: CheckCircle2 },
                            ].map((item, i) => (
                                <button key={i} className="flex items-center justify-center gap-3 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-600 hover:border-emerald-500/30 transition-all shadow-sm active:scale-95">
                                    <item.icon size={16} /> {item.title}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Support;
