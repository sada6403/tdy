import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Search, Bell, Calendar, ChevronRight, MessageSquare, CheckCircle2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { formatDistanceToNow, format } from 'date-fns';

const Notifications = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/customer/notifications');
            if (res.success) setNotifications(res.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            navigate('/company/nf-plantation/login');
        } else if (user) {
            fetchNotifications();
        }
    }, [user, loading, navigate]);

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/customer/notifications/${id}/read`, {});
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const safeFormat = (dateStr, formatStr) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'N/A';
            return format(date, formatStr);
        } catch (e) {
            return 'N/A';
        }
    };

    const safeDistanceNow = (dateStr) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'Recently';
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (e) {
            return 'Recently';
        }
    };

    // Filter Logic
    const filteredNotifications = notifications.filter(notif => {
        const matchesSearch = (notif.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (notif.message || '').toLowerCase().includes(searchQuery.toLowerCase());

        // Use createdAt
        const notifDate = safeFormat(notif.createdAt, 'yyyy-MM-dd');
        const matchesDate = filterDate ? notifDate === filterDate : true;

        return matchesSearch && matchesDate;
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <main className="">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
                            <Bell className="text-emerald-600" size={28} />
                            Notifications
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500 font-bold mt-1">Latest alerts and announcements.</p>
                    </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white p-3 md:p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 md:mb-8 flex flex-col md:flex-row gap-3 md:gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search alerts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 md:py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-slate-900 font-bold text-sm"
                        />
                    </div>
                    <div className="relative md:w-64">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 md:py-4 bg-slate-50 border border-slate-50 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-slate-900 font-bold cursor-pointer text-sm"
                        />
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-4">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => (
                            <div key={notif._id} className={`group relative p-5 md:p-8 bg-white rounded-[1.5rem] md:rounded-3xl border ${notif.isRead ? 'border-slate-100' : 'border-emerald-100 shadow-md shadow-emerald-500/5'} hover:shadow-lg transition-all duration-300`}>
                                <div className="flex gap-3 md:gap-4 items-start">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${notif.isRead ? 'bg-slate-50 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                        <MessageSquare size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-1 gap-1">
                                            <h3 className={`text-sm md:text-lg font-black uppercase tracking-widest ${notif.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                                                {notif.title}
                                            </h3>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-slate-50 px-2.5 py-1 rounded-full w-fit">
                                                {safeDistanceNow(notif.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 font-bold text-xs md:text-sm mb-3 md:mb-4 leading-relaxed">
                                            {notif.message}
                                        </p>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4 text-[10px]">
                                            <span className="text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                                                <Calendar size={12} /> {safeFormat(notif.createdAt, 'PPP')}
                                            </span>
                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif._id)}
                                                    className="flex w-fit items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors font-black uppercase tracking-widest"
                                                >
                                                    <Check size={12} /> Mark Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {!notif.isRead && (
                                    <div className="absolute left-0 top-6 bottom-6 w-1 bg-emerald-500 rounded-r-full"></div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                                <Bell size={32} />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-2">No notifications found</h3>
                            <p className="text-slate-500 font-bold max-w-md mx-auto">
                                We couldn't find any notifications matching your search filters. Try clearing your search or checking back later.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setFilterDate(''); }}
                                className="mt-8 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notifications;
