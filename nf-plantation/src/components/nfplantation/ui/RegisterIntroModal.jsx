import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, ClipboardCheck, ArrowRight, UserPlus, Info } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const RegisterIntroModal = ({ isOpen, onClose, onAgree }) => {
    const { t } = useLanguage();
    const [isAgreed, setIsAgreed] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
            if (!isOpen) {
                setIsAgreed(false);
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sections = [
        {
            title: "Who can open an NF Plantation Investor Account?",
            answer: "Any individual who is 18 years or older can open an NF Plantation Investor Account. Applicants must have a valid National Identity Card (NIC) or Passport, an active mobile phone number, and a valid email address to complete the registration process."
        },
        {
            title: "Select Your Desired Investment Plan",
            answer: "NF Plantation offers a range of plantation investment plans designed to suit different financial goals. During registration, users can choose the investment plan that best matches their investment amount, preferred duration, and expected returns."
        },
        {
            title: "What You’ll Need",
            answer: "To complete the registration, the applicant must have:",
            list: [
                "A valid NIC or Passport",
                "An active mobile phone number",
                "A valid email address",
                "Bank proof (Bank book copy or Bank statement)",
                "Basic personal information such as full name, address, and date of birth"
            ]
        },
        {
            title: "What Happens After You Apply?",
            answer: "Once the application is submitted:",
            list: [
                "The information will be reviewed and verified by the NF Plantation team",
                "If the application meets the requirements, it will be approved",
                "The applicant will receive a confirmation email or SMS notification",
                "After confirmation, the user can log in to the account and begin plantation investment"
            ]
        },
        {
            title: "Government Registration Proof",
            answer: "NF Plantation (PVT) LTD is a legally incorporated company with the Government of Sri Lanka (Reg No: 00303425). We maintain complete transparency with our investors and regulatory bodies.",
            image: "/images/certificate.png"
        }
    ];

    const renderSection = (section, idx) => (
        <div key={idx} className="group relative p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-emerald-500/30 transition-all duration-300">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    0{idx + 1}
                </span>
                {section.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-9">
                {section.answer}
            </p>
            {section.list && (
                <ul className="mt-4 space-y-2.5 pl-9">
                    {section.list.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )}
            {section.image && (
                <div className="mt-6 pl-9">
                    <img 
                        src={section.image} 
                        alt={section.title} 
                        className="rounded-xl border border-gray-200 dark:border-white/10 shadow-sm w-full max-h-64 object-contain bg-white dark:bg-gray-800 p-2"
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-500"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[2rem] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden transform transition-all duration-500 flex flex-col max-h-[90vh] ${isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                
                {/* Header */}
                <div className="relative p-6 sm:p-8 border-b border-gray-100 dark:border-white/5 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{t('nfPlantation.registerIntro.title')}</h2>
                                <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium mt-1.5 flex items-center gap-1.5">
                                    <Info size={14} /> {t('nfPlantation.registerIntro.guide')}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                    <div className="space-y-6">
                        {sections.map((section, idx) => renderSection(section, idx))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/40">
                    <label className="flex items-center gap-3 cursor-pointer group mb-6 select-none">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                className="peer sr-only"
                                checked={isAgreed}
                                onChange={(e) => setIsAgreed(e.target.checked)}
                            />
                            <div className={`w-6 h-6 border-2 rounded-lg transition-all duration-200 flex items-center justify-center ${isAgreed ? 'bg-emerald-600 border-emerald-600 scale-110' : 'border-gray-300 dark:border-gray-700 group-hover:border-emerald-500'}`}>
                                <CheckCircle2 size={14} className={`text-white transition-opacity ${isAgreed ? 'opacity-100' : 'opacity-0'}`} />
                            </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {t('nfPlantation.registerIntro.checkbox')}
                        </span>
                    </label>

                    <button 
                        disabled={!isAgreed}
                        onClick={onAgree}
                        className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 ${isAgreed 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 translate-y-0' 
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed translate-y-0'}`}
                    >
                        <span>{t('nfPlantation.registerIntro.agreeBtn')}</span>
                        <ArrowRight size={20} className={`transition-transform duration-300 ${isAgreed ? 'translate-x-1' : ''}`} />
                    </button>
                </div>

                {/* Technical Aesthetic Blobs */}
                <div className="absolute top-0 right-0 -z-10 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-400/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 -z-10 w-48 h-48 bg-blue-500/10 dark:bg-blue-400/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.4);
                }
            `}</style>
        </div>
    );
};

export default RegisterIntroModal;
