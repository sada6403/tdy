import { useState, useEffect } from 'react';
import { Bell, Send, Search, CheckCircle2, Clock, Users, User, Loader2, RefreshCw, MessageSquare, Inbox } from 'lucide-react';
import { notificationsService } from '../services/api/adminNotifications';
import { adminNotifService } from '../services/api/adminSupport';

const Notifications = () => {
    const [activeTab, setActiveTab] = useState('sent');
    const [sentNotifications, setSentNotifications] = useState([]);
    const [inboxNotifications, setInboxNotifications] = useState([]);
    const [inboxUnread, setInboxUnread] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        title: '',
        message: '',
        targetType: 'ALL',
        targetId: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sentRes, inboxRes] = await Promise.all([
                notificationsService.getAll(),
                adminNotifService.getAll(50)
            ]);
            if (sentRes.success) setSentNotifications(sentRes.data || []);
            if (inboxRes.success) {
                setInboxNotifications(inboxRes.data || []);
                setInboxUnread(inboxRes.unreadCount || 0);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim()) {
            setErrorMsg('Title and message are required.');
            return;
        }
        setSending(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const payload = {
                title: form.title,
                message: form.message,
                targetType: form.targetType,
                ...(form.targetType === 'CUSTOMER' && form.targetId ? { targetId: form.targetId } : {})
            };
            const res = await notificationsService.send(payload);
            if (res.success) {
                setSuccessMsg(`Notification sent to ${form.targetType === 'ALL' ? 'all customers' : 'customer'}.`);
                setForm({ title: '', message: '', targetType: 'ALL', targetId: '' });
                fetchData();
            }
        } catch (err) {
            setErrorMsg(err.message || 'Failed to send notification.');
        } finally {
            setSending(false);
        }
    };

    const handleMarkInboxRead = async (notif) => {
        if (!notif.isRead) {
            try {
                await adminNotifService.markRead(notif._id);
                setInboxNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
                setInboxUnread(c => Math.max(0, c - 1));
            } catch {}
        }
    };

    const filteredSent = sentNotifications.filter(n => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (n.title || '').toLowerCase().includes(q) || (n.message || '').toLowerCase().includes(q);
    });

    const filteredInbox = inboxNotifications.filter(n => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (n.title || '').toLowerCase().includes(q) || (n.message || '').toLowerCase().includes(q);
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-display)' }}>Notifications</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Send announcements to customers and view your admin inbox.</p>
                </div>
                <button onClick={fetchData} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '10px', padding: '4px', border: '1px solid var(--border)', width: 'fit-content', gap: '4px' }}>
                <button
                    onClick={() => setActiveTab('sent')}
                    style={{
                        padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                        backgroundColor: activeTab === 'sent' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'sent' ? 'white' : '#64748b',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                    }}
                >
                    <Send size={15} /> Sent to Customers
                </button>
                <button
                    onClick={() => setActiveTab('inbox')}
                    style={{
                        padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                        backgroundColor: activeTab === 'inbox' ? 'var(--primary)' : 'transparent',
                        color: activeTab === 'inbox' ? 'white' : '#64748b',
                        display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
                        position: 'relative'
                    }}
                >
                    <Inbox size={15} /> Admin Inbox
                    {inboxUnread > 0 && (
                        <span style={{
                            minWidth: '18px', height: '18px', padding: '0 5px',
                            borderRadius: '9px', backgroundColor: '#ef4444', color: 'white',
                            fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>{inboxUnread}</span>
                    )}
                </button>
            </div>

            {activeTab === 'sent' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px', alignItems: 'start' }}>

                    {/* Left: Sent Notification List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="card" style={{ padding: '16px 20px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Search sent notifications..."
                                    className="input-field"
                                    style={{ width: '100%', paddingLeft: '40px' }}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            {loading ? (
                                <div style={{ padding: '48px', textAlign: 'center' }}>
                                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
                                    <p style={{ marginTop: '12px', color: '#94a3b8', fontSize: '13px' }}>Loading...</p>
                                </div>
                            ) : filteredSent.length === 0 ? (
                                <div style={{ padding: '60px', textAlign: 'center' }}>
                                    <Send size={40} style={{ margin: '0 auto 16px', color: '#e2e8f0' }} />
                                    <p style={{ color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>No sent notifications found.</p>
                                </div>
                            ) : filteredSent.map((n, i) => (
                                <div key={n._id || i} style={{
                                    padding: '20px 24px',
                                    borderBottom: '1px solid #f1f5f9',
                                    display: 'flex',
                                    gap: '16px',
                                    alignItems: 'flex-start'
                                }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                                        backgroundColor: '#f0fdf4', color: '#10b981',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <MessageSquare size={18} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>{n.title}</p>
                                            <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                                                {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{n.message}</p>
                                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px',
                                                backgroundColor: n.targetType === 'ALL' ? '#eff6ff' : '#f0fdf4',
                                                color: n.targetType === 'ALL' ? '#2563eb' : '#059669'
                                            }}>
                                                {n.targetType === 'ALL' ? 'All Customers' : 'Targeted'}
                                            </span>
                                            {n.targetType === 'CUSTOMER' && n.customerId && (
                                                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                                                    → {n.customerId?.fullName || 'Customer'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Send Notification Form */}
                    <div className="card" style={{ padding: '28px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Send size={18} style={{ color: 'var(--primary)' }} /> Send Notification
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Broadcast a message to customers instantly.</p>

                        {successMsg && (
                            <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '13px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={16} /> {successMsg}
                            </div>
                        )}
                        {errorMsg && (
                            <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Audience</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {['ALL', 'CUSTOMER'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, targetType: type }))}
                                            style={{
                                                flex: 1, padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                                                border: '1px solid',
                                                borderColor: form.targetType === type ? 'var(--primary)' : '#e2e8f0',
                                                backgroundColor: form.targetType === type ? 'var(--primary)' : 'white',
                                                color: form.targetType === type ? 'white' : '#64748b',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                            }}
                                        >
                                            {type === 'ALL' ? <Users size={14} /> : <User size={14} />}
                                            {type === 'ALL' ? 'All Customers' : 'Specific'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {form.targetType === 'CUSTOMER' && (
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Customer ID</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={{ width: '100%' }}
                                        placeholder="Enter Customer MongoDB ID..."
                                        value={form.targetId}
                                        onChange={(e) => setForm(f => ({ ...f, targetId: e.target.value }))}
                                    />
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Title</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    style={{ width: '100%' }}
                                    placeholder="Notification headline..."
                                    value={form.title}
                                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Message</label>
                                <textarea
                                    className="input-field"
                                    style={{ width: '100%', resize: 'vertical', minHeight: '120px' }}
                                    placeholder="Write your message here..."
                                    value={form.message}
                                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={sending}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {sending ? 'Sending...' : 'Send Notification'}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                /* Admin Inbox Tab */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="card" style={{ padding: '16px 20px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search inbox..."
                                className="input-field"
                                style={{ width: '100%', paddingLeft: '40px' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        {loading ? (
                            <div style={{ padding: '48px', textAlign: 'center' }}>
                                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--primary)' }} />
                            </div>
                        ) : filteredInbox.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center' }}>
                                <Inbox size={40} style={{ margin: '0 auto 16px', color: '#e2e8f0' }} />
                                <p style={{ color: '#94a3b8', fontWeight: '700', fontSize: '14px' }}>Inbox is empty.</p>
                            </div>
                        ) : filteredInbox.map((n, i) => (
                            <div
                                key={n._id || i}
                                onClick={() => handleMarkInboxRead(n)}
                                style={{
                                    padding: '20px 24px',
                                    borderBottom: '1px solid #f1f5f9',
                                    display: 'flex',
                                    gap: '16px',
                                    alignItems: 'flex-start',
                                    backgroundColor: n.isRead ? 'white' : '#fffbeb',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = n.isRead ? 'white' : '#fffbeb'}
                            >
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                                    backgroundColor: n.type === 'SUPPORT' ? '#fef2f2' : '#eff6ff',
                                    color: n.type === 'SUPPORT' ? '#ef4444' : '#3b82f6',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Bell size={18} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <p style={{ fontSize: '14px', fontWeight: n.isRead ? '600' : '800', color: '#1e293b' }}>{n.title}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {!n.isRead && <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', flexShrink: 0 }} />}
                                            <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                                                {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{n.message}</p>
                                    <div style={{ marginTop: '6px' }}>
                                        <span style={{
                                            fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px',
                                            backgroundColor: n.type === 'SUPPORT' ? '#fef2f2' : '#eff6ff',
                                            color: n.type === 'SUPPORT' ? '#ef4444' : '#2563eb'
                                        }}>{n.type || 'SYSTEM'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
