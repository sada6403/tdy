import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
    Bell, User, Moon, Sun, Globe, LogOut, 
    X, Check, Settings, MessageSquare, AlertTriangle,
    LayoutDashboard, Wallet, PlusCircle, ArrowDownCircle,
    PieChart, Briefcase, Activity, Calculator, Calendar,
    Headset, Menu, ChevronLeft, ChevronRight, Shield
} from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = () => {
    const { user, logout, loading } = useAuth();
    const { t, language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    // Custom back-button interceptor for standard BrowserRouter
    useEffect(() => {
        // Add a dummy entry to history to intercept the "Back" action
        window.history.pushState(null, '', window.location.href);

        const handlePopState = (event) => {
            // Check if user is trying to leave the dashboard
            const isLeavingDashboard = !window.location.pathname.startsWith('/company/nf-plantation/dashboard');
            
            if (isLeavingDashboard || !showExitConfirm) {
                // Prevent the back action and show our custom modal
                window.history.pushState(null, '', window.location.href);
                setShowExitConfirm(true);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [showExitConfirm]);

    const handleConfirmExit = () => {
        setShowExitConfirm(false);
        // Manually navigate to homepage after a small delay to ensure modal closes
        setTimeout(() => {
            navigate('/company/nf-plantation');
        }, 100);
    };

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const profileMenuRef = useRef(null);
    const notificationRef = useRef(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/company/nf-plantation/login');
        }
    }, [user, loading, navigate]);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/customer/notifications');
            if (res.success) {
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.isRead).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setIsProfileOpen(false);
            if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationOpen(false);
        };
        
        // Prevent accidental tab closing/refresh
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
            return '';
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        navigate('/company/nf-plantation');
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/company/nf-plantation/dashboard' },
        { name: 'Wallet', icon: Wallet, path: '/company/nf-plantation/dashboard/wallet' },
        { name: 'Deposit', icon: PlusCircle, path: '/company/nf-plantation/dashboard/add-cash' },
        { name: 'Withdraw', icon: ArrowDownCircle, path: '/company/nf-plantation/dashboard/withdraw' },
        { name: 'Investment Plans', icon: PieChart, path: '/company/nf-plantation/dashboard/fd-plans' },
        { name: 'My Investments', icon: Briefcase, path: '/company/nf-plantation/dashboard/my-investment' },
        { name: 'Transactions', icon: Activity, path: '/company/nf-plantation/dashboard/transactions' },
        { name: 'Calculator', icon: Calculator, path: '/company/nf-plantation/dashboard/calculator' },
        { name: 'Calendar', icon: Calendar, path: '/company/nf-plantation/dashboard/calendar' },
        { name: 'Settings', icon: Settings, path: '/company/nf-plantation/dashboard/settings' },
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#16A34A]"></div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col md:flex-row font-['Inter',_sans-serif] overflow-x-hidden">
            
            {/* --- SIDEBAR --- */}
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 256 : 80 }}
                className={`fixed top-0 left-0 h-full z-[60] bg-[#0F172A] text-white transition-all duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar Header/Logo */}
                    <div className="h-[80px] flex items-center px-6 border-b border-white/5 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-[#16A34A] flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 shadow-lg shadow-emerald-500/20">
                            <img src="/nf-logo.jpg" alt="NF" className="w-full h-full object-cover" />
                        </div>
                        {isSidebarOpen && (
                            <div className="ml-3 flex flex-col">
                                <span className="font-black text-sm tracking-tighter leading-none text-white">NF PLANTATION</span>
                                <span className="text-[9px] font-bold text-[#16A34A] uppercase tracking-[0.2em] mt-1">Secured Portal</span>
                            </div>
                        )}
                    </div>

                    {/* Navigation Menu */}
                    <nav className="flex-1 overflow-y-auto flex flex-col py-6 px-3 gap-1 custom-scrollbar">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                    className={`flex items-center ${isSidebarOpen ? 'gap-3 px-4' : 'justify-center'} py-3.5 rounded-2xl transition-all duration-300 group relative ${isActive ? 'bg-[#16A34A] text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <item.icon size={22} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white group-hover:scale-110 transition-transform'}`} />
                                    {isSidebarOpen && <span className="text-[13px] font-bold tracking-tight">{item.name}</span>}
                                    {isActive && isSidebarOpen && (
                                        <motion.div 
                                            layoutId="activePill"
                                            className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer - Cleaned */}
                    <div className="p-4 border-t border-white/5 opacity-40">
                         <div className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500">
                             <Shield size={16} />
                             {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Secured Core</span>}
                         </div>
                    </div>

                    {/* Desktop Collapse Toggle */}
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-[#16A34A] rounded-full items-center justify-center shadow-lg border-2 border-[#0F172A] hover:scale-110 transition-transform"
                    >
                        {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileSidebarOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] md:hidden"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    ></motion.div>
                )}
            </AnimatePresence>

            {/* --- MAIN CONTENT AREA --- */}
            <div className={`flex-1 w-full min-w-0 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
                
                {/* --- TOP HEADER --- */}
                <header className="sticky top-0 z-50 h-[60px] bg-white dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-slate-400 dark:text-slate-500 text-sm font-medium hidden md:block">
                            Dashboard <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
                            <span className="text-[#0F172A] dark:text-slate-100 font-semibold">
                                {menuItems.find(i => location.pathname === i.path)?.name || 
                                 (location.pathname.includes('fd-activation') ? 'Plan Activation' : 
                                  location.pathname.includes('profile') ? 'Profile' :
                                  location.pathname.includes('notifications') ? 'Notifications' :
                                  location.pathname.includes('support') ? 'Support' : 'Home')
                                }
                            </span>
                        </h2>
                        {/* Mobile Brand Name */}
                        <div className="md:hidden flex flex-col">
                             <span className="text-[11px] font-black tracking-tighter leading-none text-[#0F172A] dark:text-white">NF PLANTATION</span>
                             <span className="text-[8px] font-bold text-[#16A34A] uppercase tracking-widest">Portal</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6">
                        {/* Date Display */}
                        <div className="hidden lg:flex flex-col text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none">{format(new Date(), 'EEEE')}</span>
                            <span className="text-xs font-semibold text-slate-700 mt-1">{format(new Date(), 'MMM dd, yyyy')}</span>
                        </div>

                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all relative"
                            >
                                <Bell size={22} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                                )}
                            </button>
                            {/* Notification Dropdown */}
                            {isNotificationOpen && (
                                <div className="fixed md:absolute top-[64px] md:top-full left-0 md:left-auto right-0 md:mt-2 w-full md:w-96 bg-white dark:bg-[#1E293B] md:rounded-2xl shadow-2xl md:shadow-xl border-b md:border border-slate-100 dark:border-slate-700 z-[110] animate-in fade-in slide-in-from-top-2 overflow-hidden">
                                    <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/30">
                                        <span className="text-xs font-bold text-[#0F172A] dark:text-slate-100 uppercase tracking-wider">Notifications</span>
                                        <Link to="/company/nf-plantation/dashboard/notifications" onClick={() => setIsNotificationOpen(false)} className="text-[10px] font-bold text-[#16A34A] hover:underline">VIEW ALL</Link>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">No notifications yet</div>
                                        ) : (
                                            notifications.slice(0, 5).map(n => (
                                                <div key={n._id} className="p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{n.title}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Link (Direct to Settings) */}
                        <div className="relative">
                            <Link
                                to="/company/nf-plantation/dashboard/settings"
                                className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group"
                            >
                                <div className="hidden sm:block text-right">
                                    <p className="text-xs font-black text-[#0F172A] dark:text-white tracking-tighter uppercase leading-none group-hover:text-[#16A34A] transition-colors">{user?.name || 'User'}</p>
                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-bold uppercase tracking-widest">{user?.userId || 'GUEST-ID'}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-[#16A34A] flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                                    {user?.photoUrl ? <img src={user.photoUrl} alt="U" className="w-full h-full object-cover" /> : (user?.name?.charAt(0) || 'U')}
                                </div>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* --- MAIN PAGE CONTENT --- */}
                <main className="p-4 sm:p-8 min-h-[calc(100vh-60px)] bg-[#F8FAFC] dark:bg-[#0F172A]">
                    <Outlet />
                </main>

                {/* --- MOBILE BOTTOM NAVIGATION --- */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 dark:bg-[#1E293B]/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 px-6 pb-6 pt-3 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                    {[
                        { icon: LayoutDashboard, path: '/company/nf-plantation/dashboard', label: 'Home' },
                        { icon: Wallet, path: '/company/nf-plantation/dashboard/wallet', label: 'Wallet' },
                        { icon: PieChart, path: '/company/nf-plantation/dashboard/fd-plans', label: 'Plans' },
                        { icon: Settings, path: '/company/nf-plantation/dashboard/settings', label: 'More' }
                    ].map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.label}
                                to={item.path}
                                className="flex flex-col items-center gap-1 group relative"
                            >
                                <div className={`w-12 h-8 flex items-center justify-center rounded-2xl transition-all duration-300 ${isActive ? 'bg-[#16A34A]/10 text-[#16A34A]' : 'text-slate-400'}`}>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-[#16A34A]' : 'text-slate-400'}`}>{item.label}</span>
                                {isActive && (
                                    <motion.div layoutId="bottomActive" className="absolute -top-3 w-1 h-1 rounded-full bg-[#16A34A]" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Exit Confirmation Modal */}
            {showExitConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-xl" 
                        onClick={() => {
                            setShowExitConfirm(false);
                        }}
                    ></div>
                    <div className="relative bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 md:p-10 max-w-md w-full text-center shadow-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Shield size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-3">Confirm Dashboard Exit?</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                            You are about to leave your secure dashboard session. For your security, please confirm if you want to return to the public website.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setShowExitConfirm(false);
                                }}
                                className="py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                            >
                                No, Stay
                            </button>
                            <button 
                                onClick={handleConfirmExit}
                                className="py-4 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                            >
                                Yes, Exit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm shadow-xl" onClick={() => setShowLogoutConfirm(false)}></div>
                    <div className="relative bg-white dark:bg-[#1E293B] rounded-[2rem] p-8 md:p-10 max-w-md w-full text-center shadow-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-3">Confirm Logout?</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">Are you sure you want to end your session? You will need to log in again to access your dashboard.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="py-3 px-6 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                            >
                                Stay
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="py-3 px-6 rounded-xl bg-red-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
