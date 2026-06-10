import React, { useState, useEffect } from 'react';
import { 
    Globe, Phone, Mail, MapPin, Clock,
    Facebook, Twitter, Instagram, Linkedin, Youtube,
    Save, Building, ShieldCheck, Layout, Smartphone,
    Image as ImageIcon, PlayCircle, Award, MessageSquare, Plus, Trash2, Edit2, Check, X,
    ChevronDown, ChevronUp, GripVertical
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../services/api/adminEvents';

const EventsManagement = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('video');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        type: 'video',
        title: '',
        description: '',
        url: '',
        image: '',
        author: '',
        role: '',
        order: 0,
        isActive: true
    });

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const res = await getAllEvents();
            if (res.success) {
                setEvents(res.data);
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to load event media' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ ...item });
        } else {
            setEditingItem(null);
            setFormData({
                type: activeTab,
                title: '',
                description: '',
                url: '',
                image: '',
                author: '',
                role: '',
                order: events.filter(e => e.type === activeTab).length,
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let res;
            if (editingItem) {
                res = await updateEvent(editingItem._id, formData);
            } else {
                res = await createEvent(formData);
            }

            if (res.success) {
                setNotification({ type: 'success', message: `Event media ${editingItem ? 'updated' : 'created'} successfully` });
                fetchEvents();
                handleCloseModal();
            } else {
                setNotification({ type: 'error', message: res.message || 'Action failed' });
            }
        } catch (error) {
            setNotification({ type: 'error', message: error.message || 'An error occurred' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            const res = await deleteEvent(id);
            if (res.success) {
                setNotification({ type: 'success', message: 'Item deleted successfully' });
                fetchEvents();
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to delete item' });
        }
    };

    const tabs = [
        { id: 'video', label: 'Videos', icon: <PlayCircle size={18} /> },
        { id: 'achievement', label: 'Awards', icon: <Award size={18} /> },
        { id: 'work', label: 'Gallery', icon: <ImageIcon size={18} /> },
        { id: 'testimonial', label: 'Reviews', icon: <MessageSquare size={18} /> }
    ];

    const filteredEvents = events.filter(e => e.type === activeTab);

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        backgroundColor: '#f1f5f9',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-main)',
        outline: 'none',
        transition: 'all 0.2s',
        marginTop: '8px'
    };

    const labelStyle = {
        fontSize: '11px',
        fontWeight: '800',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        letterSpacing: '0.5px'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', position: 'relative' }}>
            {/* Sub-navigation Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                backgroundColor: '#f1f5f9', 
                padding: '6px', 
                borderRadius: '16px',
                width: 'fit-content'
            }}>
                <Link to="/website-settings" style={{
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    color: '#64748b',
                    transition: 'all 0.2s'
                }}>
                    General Settings
                </Link>
                <Link to="/hero-management" style={{
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    color: '#64748b',
                    transition: 'all 0.2s'
                }}>
                    Hero Management
                </Link>
                <Link to="/events-management" style={{
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    backgroundColor: 'white',
                    color: 'var(--primary)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    Events & Media
                </Link>
            </div>
            {/* Custom Toast Notification */}
            {notification && (
                <div style={{
                    position: 'fixed',
                    bottom: '40px',
                    right: '40px',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    zIndex: 9999,
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
                    {notification.message}
                </div>
            )}
            
            <style>
                {`
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .tab-active {
                    color: var(--primary) !important;
                    border-bottom: 2px solid var(--primary) !important;
                }
                .event-card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.05);
                }
                `}
            </style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <PlayCircle size={28} style={{ color: 'var(--primary)' }} /> Events & Media Management
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>Control the videos, achievements, and gallery items displayed on the public Events page.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    style={{ 
                        backgroundColor: 'var(--primary)', 
                        color: 'white', 
                        padding: '14px 28px', 
                        borderRadius: '14px', 
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
                        cursor: 'pointer'
                    }}>
                    <Plus size={18} /> Add New {tabs.find(t => t.id === activeTab).label.slice(0, -1)}
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '40px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={activeTab === tab.id ? 'tab-active' : ''}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '16px 4px',
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#64748b',
                            backgroundColor: 'transparent',
                            border: 'none',
                            borderBottom: '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List Section */}
            {isLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading items...</div>
            ) : filteredEvents.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ marginBottom: '16px', color: '#cbd5e1' }}>
                        {activeTab === 'video' ? <PlayCircle size={48} style={{margin:'0 auto'}} /> : 
                         activeTab === 'achievement' ? <Award size={48} style={{margin:'0 auto'}} /> :
                         activeTab === 'work' ? <ImageIcon size={48} style={{margin:'0 auto'}} /> :
                         <MessageSquare size={48} style={{margin:'0 auto'}} />}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#475569' }}>No {activeTab}s found</h3>
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>Click the button above to add your first {activeTab}.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                    {filteredEvents.map(item => (
                        <div key={item._id} className="card event-card-hover" style={{ transition: 'all 0.3s', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {item.image && (
                                <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                            {item.type === 'video' && item.url && (
                                <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <PlayCircle size={40} style={{ color: 'white', opacity: 0.8, zIndex: 2 }} />
                                    {/* Small preview if it's youtube */}
                                    {(item.url.includes('youtube') || item.url.includes('youtu.be')) && (() => {
                                        let videoId = '';
                                        if (item.url.includes('youtu.be/')) videoId = item.url.split('youtu.be/')[1]?.split('?')[0];
                                        else if (item.url.includes('v=')) videoId = item.url.split('v=')[1]?.split('&')[0];
                                        else if (item.url.includes('embed/')) videoId = item.url.split('embed/')[1]?.split('?')[0];
                                        
                                        if (!videoId) return null;
                                        
                                        return (
                                            <img 
                                                src={`https://img.youtube.com/vi/${videoId}/0.jpg`} 
                                                alt="Preview" 
                                                style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
                                            />
                                        );
                                    })()}
                                </div>
                            )}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{item.title}</h4>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleOpenModal(item)} style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(item._id)} style={{ padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                {item.description && <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px', lineHeight: '1.5' }}>{item.description}</p>}
                                {item.author && (
                                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}>
                                            {item.author.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{item.author}</div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.role}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Order: {item.order}</span>
                                <span style={{ 
                                    fontSize: '10px', 
                                    fontWeight: '800', 
                                    textTransform: 'uppercase', 
                                    padding: '4px 8px', 
                                    borderRadius: '6px',
                                    backgroundColor: item.isActive ? '#dcfce7' : '#f1f5f9',
                                    color: item.isActive ? '#166534' : '#64748b'
                                }}>
                                    {item.isActive ? 'Active' : 'Hidden'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        width: '100%',
                        maxWidth: '600px',
                        borderRadius: '24px',
                        padding: '32px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{editingItem ? 'Edit' : 'Add New'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                            <button onClick={handleCloseModal} style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Title / Name</label>
                                <input 
                                    style={inputStyle}
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder={activeTab === 'testimonial' ? "Customer Name" : "Item Title"}
                                    required
                                />
                            </div>

                            {activeTab === 'testimonial' && (
                                <div>
                                    <label style={labelStyle}>Role / Designation</label>
                                    <input 
                                        style={inputStyle}
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Investor since 2021"
                                        required={activeTab === 'testimonial'}
                                    />
                                    <input type="hidden" name="author" value={formData.title} />
                                </div>
                            )}

                            <div>
                                <label style={labelStyle}>{activeTab === 'testimonial' ? 'Review Text' : 'Description'}</label>
                                <textarea 
                                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter details..."
                                ></textarea>
                            </div>

                            {(activeTab === 'video') && (
                                <div>
                                    <label style={labelStyle}>YouTube Embed URL</label>
                                    <input 
                                        style={inputStyle}
                                        name="url"
                                        value={formData.url}
                                        onChange={handleInputChange}
                                        placeholder="https://www.youtube.com/embed/..."
                                        required={activeTab === 'video'}
                                    />
                                </div>
                            )}

                            {(activeTab === 'achievement' || activeTab === 'work') && (
                                <div>
                                    <label style={labelStyle}>Image URL</label>
                                    <input 
                                        style={inputStyle}
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        placeholder="Enter image link..."
                                        required={activeTab === 'achievement' || activeTab === 'work'}
                                    />
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Display Order</label>
                                    <input 
                                        style={inputStyle}
                                        type="number"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '32px' }}>
                                    <input 
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                                    />
                                    <label htmlFor="isActive" style={{ fontSize: '14px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>Active on Site</label>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', fontWeight: '700', color: '#64748b', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSaving}
                                    style={{ 
                                        flex: 2, padding: '14px', borderRadius: '12px', border: 'none', 
                                        backgroundColor: 'var(--primary)', color: 'white', fontWeight: '700', 
                                        cursor: 'pointer', opacity: isSaving ? 0.7 : 1 
                                    }}
                                >
                                    {isSaving ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventsManagement;
