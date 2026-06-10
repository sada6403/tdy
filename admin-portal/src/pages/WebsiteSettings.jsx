import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    Globe, Phone, Mail, MapPin, Clock,
    Facebook, Twitter, Instagram, Linkedin, Youtube,
    Save, Building, ShieldCheck, Layout, Smartphone, PlayCircle
} from 'lucide-react';
import { getSettings, updateSettings } from '../services/api/adminSettings';

const WebsiteSettings = () => {
    const [settings, setSettings] = useState({
        contact: { email: '', phone: '', address: '', officeHours: '', mapIframe: '' },
        social: { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' },
        branding: { companyName: '', copyrightText: '' },
        mobileLinks: { appStore: '', googlePlay: '' }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await getSettings();
                if (res.success && res.data) {
                    setSettings(res.data);
                }
            } catch (error) {
                setNotification({ type: 'error', message: 'Failed to load settings. Please check your connection.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await updateSettings(settings);
            if (res.success) {
                setNotification({ type: 'success', message: 'Website settings updated successfully' });
            } else {
                setNotification({ type: 'error', message: res.message || 'Failed to update settings' });
            }
        } catch (error) {
            console.error('Update Error:', error);
            setNotification({ type: 'error', message: error.message || 'Failed to update settings. Please check your connection.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="card" style={{ height: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Loading Global Settings...</div>
            </div>
        );
    }

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
        transition: 'all 0.2s'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '11px',
        fontWeight: '800',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: '8px',
        letterSpacing: '0.5px'
    };

    const sectionTitleStyle = {
        fontSize: '18px',
        fontWeight: '800',
        color: 'var(--text-main)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        paddingBottom: '16px',
        borderBottom: '1px solid #f1f5f9',
        marginBottom: '24px'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1200px', position: 'relative' }}>
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
                    {notification.type === 'success' ? <Layout size={20} /> : <Globe size={20} />}
                    {notification.message}
                </div>
            )}
            
            <style>
                {`
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                `}
            </style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Globe size={28} style={{ color: 'var(--primary)' }} /> Website Configuration
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500', marginTop: '4px' }}>
                        Centralized control for public contact info, social presence, and global branding.
                    </p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ 
                        backgroundColor: 'var(--primary)', 
                        color: 'white', 
                        padding: '14px 32px', 
                        borderRadius: '14px', 
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
                        opacity: isSaving ? 0.7 : 1,
                        cursor: isSaving ? 'not-allowed' : 'pointer'
                    }}>
                    {isSaving ? 'Synchronizing...' : <><Save size={18} /> Save All Changes</>}
                </button>
            </div>

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
                    fontWeight: '700',
                    textDecoration: 'none',
                    backgroundColor: 'white',
                    color: 'var(--primary)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
                    fontWeight: '600',
                    textDecoration: 'none',
                    color: '#64748b',
                    transition: 'all 0.2s'
                }}>
                    Events & Media
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Contact Section */}
                    <div className="card">
                        <h3 style={sectionTitleStyle}>
                            <Phone size={20} style={{ color: '#10b981' }} /> Contact Channels
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Official Email Address</label>
                                <input 
                                    style={inputStyle}
                                    type="email" 
                                    value={settings.contact?.email || ''} 
                                    onChange={(e) => handleChange('contact', 'email', e.target.value)}
                                    placeholder="e.g. info@nfplantation.com"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Support Phone Number</label>
                                <input 
                                    style={inputStyle}
                                    type="text" 
                                    value={settings.contact?.phone || ''} 
                                    onChange={(e) => handleChange('contact', 'phone', e.target.value)}
                                    placeholder="e.g. +94 24 433 5099"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Headquarters Address</label>
                                <textarea 
                                    style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                                    value={settings.contact?.address || ''} 
                                    onChange={(e) => handleChange('contact', 'address', e.target.value)}
                                    placeholder="Enter full physical address..."
                                ></textarea>
                            </div>
                            <div>
                                <label style={labelStyle}>Operating Hours</label>
                                <input 
                                    style={inputStyle}
                                    type="text" 
                                    value={settings.contact?.officeHours || ''} 
                                    onChange={(e) => handleChange('contact', 'officeHours', e.target.value)}
                                    placeholder="e.g. Mon–Fri: 8AM–5PM, Sat: 10AM–2PM"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branding Section */}
                    <div className="card">
                        <h3 style={sectionTitleStyle}>
                            <Building size={20} style={{ color: '#6366f1' }} /> Global Branding
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Public Company Name</label>
                                <input 
                                    style={inputStyle}
                                    type="text" 
                                    value={settings.branding?.companyName || ''} 
                                    onChange={(e) => handleChange('branding', 'companyName', e.target.value)}
                                    placeholder="NF Plantation"
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Footer Copyright Text</label>
                                <input 
                                    style={inputStyle}
                                    type="text" 
                                    value={settings.branding?.copyrightText || ''} 
                                    onChange={(e) => handleChange('branding', 'copyrightText', e.target.value)}
                                    placeholder="© 2026 NF Plantation. All rights reserved."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mobile App Section */}
                    <div className="card">
                        <h3 style={sectionTitleStyle}>
                            <Smartphone size={20} style={{ color: '#ec4899' }} /> Mobile Applications
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Apple App Store URL</label>
                                <input 
                                    style={inputStyle}
                                    type="text" 
                                    value={settings.mobileLinks?.appStore || ''} 
                                    onChange={(e) => handleChange('mobileLinks', 'appStore', e.target.value)}
                                    placeholder="https://apps.apple.com/..."
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Google Play Store URL</label>
                                <input 
                                    style={inputStyle}
                                    type="text" 
                                    value={settings.mobileLinks?.googlePlay || ''} 
                                    onChange={(e) => handleChange('mobileLinks', 'googlePlay', e.target.value)}
                                    placeholder="https://play.google.com/store/apps/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Social Media Section */}
                    <div className="card">
                        <h3 style={sectionTitleStyle}>
                            <Globe size={20} style={{ color: '#3b82f6' }} /> Social Connectivity
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
                            Update your official social media URLs. Empty fields will automatically hide icons on the public website.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[
                                { id: 'facebook', icon: <Facebook size={18} />, color: '#1877f2', label: 'Facebook' },
                                { id: 'twitter', icon: <Twitter size={18} />, color: '#1da1f2', label: 'Twitter / X' },
                                { id: 'instagram', icon: <Instagram size={18} />, color: '#e4405f', label: 'Instagram' },
                                { id: 'linkedin', icon: <Linkedin size={18} />, color: '#0a66c2', label: 'LinkedIn' },
                                { id: 'youtube', icon: <Youtube size={18} />, color: '#ff0000', label: 'YouTube' }
                            ].map((social) => (
                                <div key={social.id}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <div style={{ 
                                            width: '32px', height: '32px', borderRadius: '8px', 
                                            backgroundColor: `${social.color}10`, color: social.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {social.icon}
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>{social.label}</span>
                                    </div>
                                    <input 
                                        style={inputStyle}
                                        type="text" 
                                        value={settings.social?.[social.id] || ''} 
                                        onChange={(e) => handleChange('social', social.id, e.target.value)}
                                        placeholder={`Enter ${social.label} URL...`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust Banner Information */}
                    <div className="card" style={{ backgroundColor: '#0f172a', color: 'white' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                            <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                            Institutional Trust
                        </h3>
                        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
                            Ensure your contact information matches your official government registration (PV 00303425) to maintain investor confidence and legal compliance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebsiteSettings;
