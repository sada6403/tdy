import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAuth } from '../../../context/AuthContext';
import RegisterIntroModal from '../../../components/nfplantation/ui/RegisterIntroModal';
import NFLoadingScreen from '../../../components/common/NFLoadingScreen';

const PlantationLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const { login } = useAuth();
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [isRegisterIntroOpen, setIsRegisterIntroOpen] = useState(false);
    const [showLoadingScreen, setShowLoadingScreen] = useState(false);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'ta', label: 'தமிழ் (Tamil)' },
        { code: 'si', label: 'සිංහල (Sinhala)' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login({ user_id: userId, password });
        setIsLoading(false);
        if (result.success) {
            if (result.mustChangePassword) {
                navigate('/company/nf-plantation/auth/change-password');
            } else {
                setShowLoadingScreen(true);
            }
        } else {
            setError(result.message);
        }
    };

    const handleLoadingComplete = () => {
        navigate('/company/nf-plantation/dashboard');
    };

    if (showLoadingScreen) {
        return <NFLoadingScreen onComplete={handleLoadingComplete} />;
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden font-sans bg-gray-900 dark:bg-gray-950 transition-colors duration-300">
            {/* Background Image - Subtle Scale only */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/auth-background.png"
                    alt="Plantation Background"
                    className="w-full h-full object-cover opacity-60 animate-subtle-scale"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 via-black/50 to-emerald-900/40" />
            </div>



            {/* Main Card */}
            <div className="relative z-10 w-full max-w-5xl mx-4 shadow-2xl rounded-[30px] overflow-hidden flex flex-col md:flex-row animate-content-enter">

                {/* Visual Side (Left) - Glass Effect */}
                <div className="hidden md:flex flex-col justify-between p-12 w-5/12 bg-white/5 dark:bg-black/20 backdrop-blur-xl border-r border-white/5 text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none"></div>

                    <Link to="/company/nf-plantation" className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest w-fit">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {t('back')}
                    </Link>

                    <div className="relative z-10 my-auto">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#00c853] to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40 mb-8">
                            <Leaf size={32} className="text-white" />
                        </div>
                        <h1 className={`font-bold mb-4 leading-tight tracking-tight ${language === 'ta' || language === 'si' ? 'text-3xl lg:text-4xl' : 'text-4xl lg:text-5xl'}`}>
                            {t('heroLogin.line1')}<br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c853] to-emerald-300">{t('heroLogin.line2')}</span><br /> {t('heroLogin.line3')}
                        </h1>
                        <p className="text-emerald-100/70 text-sm leading-relaxed max-w-xs">
                            {t('heroLogin.subtitle')}
                        </p>
                    </div>

                    <div className="text-[10px] text-white/30 font-medium">
                        {t('heroLogin.secure')}
                    </div>
                </div>

                {/* Form Side (Right) - White */}
                <div className="w-full md:w-7/12 bg-white dark:bg-gray-900 p-10 md:p-16 flex flex-col justify-center relative transition-colors duration-300">
                    <div className="max-w-md mx-auto w-full">
                        <div className="mb-10 text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('welcomeBack')}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{t('enterDetails')}</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 text-sm rounded-r-md">
                                {error}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('userId')}</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#00c853] dark:group-focus-within:text-[#00c853] transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00c853]/50 focus:border-[#00c853] transition-all duration-200 ease-in-out"
                                        placeholder="Enter your user ID"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('password')}</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#00c853] dark:group-focus-within:text-[#00c853] transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#00c853]/50 focus:border-[#00c853] transition-all duration-200 ease-in-out"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded group-hover:border-[#00c853] transition-colors flex items-center justify-center shrink-0">
                                        <input type="checkbox" className="peer sr-only" />
                                        <div className="w-2.5 h-2.5 bg-[#00c853] rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors whitespace-nowrap">{t('rememberMe')}</span>
                                </label>
                                <Link to="/company/nf-plantation/forgot-password" className="text-sm font-semibold text-[#00c853] hover:text-green-700 transition-colors whitespace-nowrap">{t('forgotPassword')}</Link>
                            </div>

                            <button disabled={isLoading} type="submit" className="w-full bg-[#00c853] hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-[0_10px_20px_-10px_rgba(0,200,83,0.4)] hover:shadow-[0_20px_25px_-5px_rgba(0,200,83,0.3)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0">
                                {isLoading ? 'Verifying...' : t('signIn')} {!isLoading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {t('dontHaveAccount')} <button onClick={() => setIsRegisterIntroOpen(true)} className="font-bold text-[#00c853] hover:underline bg-transparent border-none p-0">{t('registerNow')}</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes subtle-scale {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.05); }
                }
                 @keyframes content-enter {
                    0% { opacity: 0; transform: translateY(20px) scale(0.98); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-subtle-scale {
                     animation: subtle-scale 20s infinite alternate ease-in-out;
                }
                .animate-content-enter {
                     animation: content-enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                 @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                 .animate-fade-in-up {
                     animation: fade-in-up 0.2s ease-out forwards;
                }
            `}</style>

            <RegisterIntroModal 
                isOpen={isRegisterIntroOpen}
                onClose={() => setIsRegisterIntroOpen(false)}
                onAgree={() => {
                    setIsRegisterIntroOpen(false);
                    navigate('/company/nf-plantation/register');
                }}
            />
        </div>
    );
};

export default PlantationLogin;
