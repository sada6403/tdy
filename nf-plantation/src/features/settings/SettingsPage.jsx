import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
    User, Moon, Sun, Headset, LogOut, 
    Shield, ChevronRight, Phone, Mail, 
    Clock, Send, Lock, Eye, EyeOff, Camera,
    CheckCircle2, AlertCircle, Info, ChevronDown, MapPin,
    Navigation, ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
    const { user, logout, updateProfile } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    
    // States
    const [activeSection, setActiveSection] = useState('profile');
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [photoError, setPhotoError] = useState(false);
    const fileInputRef = useRef(null);

    // Support Form State
    const [supportForm, setSupportForm] = useState({ subject: 'General Inquiry', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [supportSuccess, setSupportSuccess] = useState('');
    const [supportError, setSupportError] = useState('');

    // Password Change State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwdStep, setPwdStep] = useState(1); // 1: NIC, 2: OTP/NewPwd
    const [pwdData, setPwdData] = useState({ nic: '', otp: '', newPassword: '', confirmPassword: '' });
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/customer/profile');
                if (res.success) {
                    setProfileData(res.data);
                    setPhotoError(false); // Reset error state on fresh data
                }
            } catch (error) {
                console.error("Fetch Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSendPwdOtp = async () => {
        if (!pwdData.nic) return setPwdError('Please enter your NIC to verify identity.');
        setPwdLoading(true);
        setPwdError('');
        try {
            const res = await api.post('/customer/change-password/send-otp', { nic: pwdData.nic });
            if (res.success) {
                setPwdStep(2);
            }
        } catch (error) {
            setPwdError(error.message || 'Verification failed. Check your NIC.');
        } finally {
            setPwdLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!pwdData.otp || !pwdData.newPassword) return setPwdError('All fields are required.');
        if (pwdData.newPassword !== pwdData.confirmPassword) return setPwdError('Passwords do not match.');
        
        setPwdLoading(true);
        setPwdError('');
        try {
            const res = await api.post('/customer/change-password/update', {
                otp: pwdData.otp,
                newPassword: pwdData.newPassword
            });
            if (res.success) {
                alert('Password updated successfully!');
                setShowPasswordModal(false);
                setPwdStep(1);
                setPwdData({ nic: '', otp: '', newPassword: '', confirmPassword: '' });
            }
        } catch (error) {
            setPwdError(error.message || 'Update failed. Check OTP.');
        } finally {
            setPwdLoading(false);
        }
    };

    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        if (!supportForm.message.trim()) {
            setSupportError('Please enter a message.');
            return;
        }
        setIsSubmitting(true);
        setSupportError('');
        setSupportSuccess('');
        try {
            const res = await api.post('/customer/support', {
                subject: supportForm.subject,
                message: supportForm.message,
            });
            if (res.success) {
                setSupportSuccess('Your request has been submitted. We will respond shortly.');
                setSupportForm({ subject: 'General Inquiry', message: '' });
            }
        } catch (err) {
            setSupportError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('photo', file);

            const res = await api.post('/customer/update-photo', formData, {
                headers: { 'Content-Type': undefined }
            });

            if (res.success) {
                const newPhoto = res.photoUrl;
                updateProfile({ photoUrl: newPhoto });
                setProfileData(prev => ({ ...prev, photoUrl: newPhoto }));
                setPhotoError(false);
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Failed to upload photo. Check console.");
        } finally {
            setIsUploading(false);
        }
    };

    const sections = [
        { id: 'profile', name: 'Profile Settings', icon: User },
        { id: 'appearance', name: 'Appearance Settings', icon: PaletteIcon },
        { id: 'security', name: 'Security & Privacy', icon: Shield },
        { id: 'branches', name: 'Nearby Branches', icon: MapPin },
        { id: 'support', name: 'Support', icon: Headset }
    ];

    const branches = [
        { name: 'Kilinochchi HQ', address: 'No. 12, Main Street, Kilinochchi', contact: '021 228 1234', hours: '8:30 AM - 5:30 PM', type: 'Main Headquarters', nearest: true },
        { name: 'Jaffna Branch', address: 'KKS Road, Jaffna Central', contact: '021 221 4321', hours: '9:00 AM - 5:00 PM', type: 'Regional Office' },
        { name: 'Colombo Sub-Office', address: 'Liberty Plaza, Colombo 03', contact: '011 257 8888', hours: '10:00 AM - 6:00 PM', type: 'Support Office' },
    ];

    // Mobile specific: show only menu or only content
    const [showMobileMenu, setShowMobileMenu] = useState(true);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#16A34A]"></div>
        </div>
    );

    const displayName = profileData?.name || profileData?.fullName || user?.name || 'Account Holder';
    const displayEmail = profileData?.email || user?.email || 'N/A';
    const displayPhone = profileData?.phone || user?.phone || 'No phone added';

    const selectSection = (id) => {
        setActiveSection(id);
        setShowMobileMenu(false);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 animate-in fade-in duration-500">
            
            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* --- SETTINGS SIDEBAR (Desktop) / MENU (Mobile) --- */}
                <div className={`lg:w-72 shrink-0 ${!showMobileMenu ? 'hidden lg:block' : 'block'}`}>
                    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-2 shadow-sm overflow-hidden">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => selectSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all text-left ${activeSection === section.id && !showMobileMenu ? 'bg-[#F8FAFC] text-[#16A34A]' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeSection === section.id && !showMobileMenu ? 'bg-[#16A34A] text-white' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                                    <section.icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-bold tracking-tight block">{section.name}</span>
                                    <span className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-black lg:hidden">Configure Preference</span>
                                </div>
                                <ChevronRight size={16} className="ml-auto text-[#CBD5E1]" />
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 bg-white border border-[#E5E7EB] rounded-2xl p-2 shadow-sm">
                        <button 
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-[#EF4444] hover:bg-red-50 transition-all text-left"
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                <LogOut size={20} />
                            </div>
                            <span className="text-sm font-bold">Logout Session</span>
                            <ChevronRight size={16} className="ml-auto text-red-200 lg:hidden" />
                        </button>
                    </div>
                </div>

                {/* --- SETTINGS CONTENT --- */}
                <div className={`flex-1 space-y-8 min-w-0 ${showMobileMenu ? 'hidden lg:block' : 'block'}`}>
                    
                    {/* Mobile Header with Back Button */}
                    <div className="lg:hidden flex items-center gap-4 mb-6">
                        <button 
                            onClick={() => setShowMobileMenu(true)}
                            className="p-3 bg-white border border-[#E5E7EB] rounded-2xl text-[#64748B] active:scale-95 transition-all shadow-sm"
                        >
                            <ChevronDown size={20} className="rotate-90" />
                        </button>
                        <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">
                            {sections.find(s => s.id === activeSection)?.name}
                        </h2>
                    </div>
                    
                    {/* 👤 PROFILE SECTION */}
                    {activeSection === 'profile' && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">

                            {/* ── Header Card ── */}
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-center gap-8">

                                    {/* Photo */}
                                    <div className="relative shrink-0">
                                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[#F1F5F9] overflow-hidden shadow-md bg-[#F1F5F9] flex items-center justify-center">
                                            {profileData?.photoUrl && !photoError ? (
                                                <img
                                                    src={profileData.photoUrl}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    onError={() => setPhotoError(true)}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white text-4xl font-black select-none">
                                                    {displayName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-full">
                                                    <div className="animate-spin rounded-full h-7 w-7 border-2 border-[#16A34A] border-t-transparent"></div>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-1 right-1 p-2.5 bg-[#16A34A] text-white rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform"
                                            title="Change photo"
                                        >
                                            <Camera size={13} />
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
                                    </div>

                                    {/* Name / ID / Actions */}
                                    <div className="text-center sm:text-left flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                            <h2 className="text-2xl font-bold text-[#0F172A] truncate">{displayName}</h2>
                                            <span className={`self-center sm:self-auto px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ${profileData?.adminApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                {profileData?.adminApproved ? '● KYC Verified' : '● Pending Verification'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#64748B]">{displayEmail}</p>
                                        <p className="text-xs text-[#94A3B8] font-medium mt-0.5">{displayPhone}</p>
                                        <p className="text-[10px] text-[#CBD5E1] font-mono mt-1 uppercase tracking-widest">Member ID: {profileData?.userId || 'N/A'}</p>

                                        <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-3">
                                            <button className="px-6 py-2.5 bg-[#16A34A] text-white text-xs font-semibold rounded-xl hover:bg-[#15803D] transition-all shadow-sm">
                                                Edit Profile
                                            </button>
                                            <button
                                                onClick={() => setShowPasswordModal(true)}
                                                className="px-6 py-2.5 bg-white border border-[#E5E7EB] text-[#0F172A] text-xs font-semibold rounded-xl hover:bg-[#F8FAFC] transition-all"
                                            >
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Info Grid ── */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                                {/* Personal Info */}
                                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                                    <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest mb-5">Personal Information</p>
                                    <div className="space-y-4">
                                        <ProfileField label="Full Name" value={displayName} />
                                        <ProfileField label="NIC / National ID" value={profileData?.nic || 'N/A'} />
                                        <ProfileField label="Date of Birth" value={profileData?.dob ? new Date(profileData.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'} />
                                        <ProfileField label="Gender" value={profileData?.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1).toLowerCase() : 'N/A'} />
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                                    <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest mb-5">Contact Details</p>
                                    <div className="space-y-4">
                                        <ProfileField label="Email Address" value={displayEmail} />
                                        <ProfileField label="Mobile Number" value={displayPhone} />
                                        <ProfileField label="Residential Address" value={
                                            typeof profileData?.address === 'string' && profileData.address
                                                ? profileData.address
                                                : profileData?.address?.line1 || profileData?.address?.city
                                                    ? [profileData.address.line1, profileData.address.city, profileData.address.district].filter(Boolean).join(', ')
                                                    : ''
                                        } multiline />
                                    </div>
                                </div>

                                {/* Bank Details — full width */}
                                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm lg:col-span-2">
                                    <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest mb-5">Bank Account Details</p>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        <ProfileField label="Bank Name" value={profileData?.bankName || 'N/A'} />
                                        <ProfileField label="Branch" value={profileData?.branchName || 'N/A'} />
                                        <ProfileField label="Account Holder" value={profileData?.accountHolder || 'N/A'} />
                                        <ProfileField label="Account Number" value={
                                            profileData?.accountNumber
                                                ? '•••• •••• ' + String(profileData.accountNumber).slice(-4)
                                                : 'N/A'
                                        } />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🎨 APPEARANCE SECTION */}
                    {activeSection === 'appearance' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                                <legend className="text-base font-semibold text-[#0F172A] mb-8">Theme Preferences</legend>
                                <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#E5E7EB]">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-white text-amber-500 shadow-sm border border-[#E5E7EB]'}`}>
                                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#0F172A]">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                                            <p className="text-[10px] text-[#64748B] uppercase tracking-widest font-black mt-0.5">System Visual Protocol</p>
                                        </div>
                                    </div>

                                    {/* Toggle Switch */}
                                    <button
                                        onClick={toggleTheme}
                                        className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-7 shadow-sm' : 'left-1'}`} />
                                    </button>
                                </div>
                                <p className="mt-6 text-xs text-[#94A3B8] leading-relaxed">Adjust the layout appearance to match your preferred working environment and reduce eye strain.</p>
                            </div>
                        </div>
                    )}

                    {/* 🔐 SECURITY SECTION */}
                    {activeSection === 'security' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                                <h3 className="text-base font-semibold text-[#0F172A] mb-8 uppercase tracking-widest text-xs">Security Protocol</h3>
                                
                                <div className="divide-y divide-[#F1F5F9]">
                                    <SecurityRow 
                                        icon={Lock} 
                                        title="Change Password" 
                                        desc="Update your authentication credentials regularly" 
                                        onClick={() => setShowPasswordModal(true)}
                                    />
                                    <SecurityRow 
                                        icon={Shield} 
                                        title="Two-Factor Authentication" 
                                        desc="Add an extra layer of security to your account (Optional)" 
                                        status="Setup"
                                    />
                                    <SecurityRow 
                                        icon={Info} 
                                        title="Data Privacy Info" 
                                        desc="View how your information is handled and protected" 
                                        onClick={() => {}}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 📍 BRANCHES SECTION */}
                    {activeSection === 'branches' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                                <div className="mb-8">
                                    <h3 className="text-base font-semibold text-[#0F172A] uppercase tracking-widest text-xs">Physical Infrastructure</h3>
                                    <p className="text-xs text-[#64748B] mt-1">Visit our nearest office for documentation and in-person support.</p>
                                </div>

                                <div className="space-y-6">
                                    {branches.map((branch, i) => (
                                        <div key={i} className={`p-6 rounded-3xl border transition-all ${branch.nearest ? 'bg-[#F8FAFC] border-[#16A34A]/20' : 'bg-white border-[#F1F5F9]'}`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${branch.nearest ? 'bg-[#16A34A] text-white' : 'bg-[#F1F5F9] text-[#16A34A]'}`}>
                                                        <MapPin size={22} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-[#0F172A] uppercase tracking-tight">{branch.name}</h4>
                                                        <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">{branch.type}</p>
                                                    </div>
                                                </div>
                                                {branch.nearest && <span className="text-[8px] font-black px-2 py-0.5 bg-[#16A34A] text-white rounded-md uppercase tracking-widest">Nearest</span>}
                                            </div>

                                            <p className="text-xs font-medium text-[#64748B] mb-6 leading-relaxed bg-white border border-[#F1F5F9] p-3 rounded-xl">{branch.address}</p>

                                            <div className="grid grid-cols-2 gap-4 border-b border-[#F1F5F9] pb-6 mb-6">
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest block">Contact</span>
                                                    <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5"><Phone size={12} className="text-[#16A34A]" /> {branch.contact}</span>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest block">Hours</span>
                                                    <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5"><Clock size={12} className="text-[#16A34A]" /> {branch.hours}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button className="flex-1 h-10 bg-white border border-[#E5E7EB] text-[#64748B] text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-[#F8FAFC] transition-all"><Navigation size={12} /> Directions</button>
                                                <button className="flex-1 h-10 bg-[#16A34A] text-white text-[9px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-[#15803D] transition-all shadow-sm"><ExternalLink size={12} /> Google Maps</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 🆘 SUPPORT SECTION */}
                    {activeSection === 'support' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">

                            {/* Assigned Agent Card */}
                            {profileData?.agent ? (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Your Assigned Field Agent</p>
                                            <p className="text-[11px] text-emerald-600 mt-0.5">Your personal point of contact at NF Plantation</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-white rounded-xl p-4 border border-emerald-100">
                                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Agent Name</p>
                                            <p className="text-sm font-bold text-[#0F172A]">{profileData.agent.name}</p>
                                            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{profileData.agent.designation || 'Field Agent'}</p>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-emerald-100">
                                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Mobile Number</p>
                                            <a href={`tel:${profileData.agent.contact}`} className="text-sm font-bold text-emerald-700 hover:underline flex items-center gap-1">
                                                <Phone size={13} /> {profileData.agent.contact}
                                            </a>
                                        </div>
                                        {profileData.agent.email && (
                                            <div className="bg-white rounded-xl p-4 border border-emerald-100">
                                                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">Email Address</p>
                                                <a href={`mailto:${profileData.agent.email}`} className="text-sm font-bold text-emerald-700 hover:underline flex items-center gap-1 truncate">
                                                    <Mail size={13} /> {profileData.agent.email}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-5 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-[#E2E8F0] rounded-xl flex items-center justify-center text-[#94A3B8]">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[#475569]">No field agent assigned yet</p>
                                        <p className="text-xs text-[#94A3B8] mt-0.5">Our team will assign a dedicated agent to your account shortly.</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Support Contacts */}
                                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                                    <h3 className="text-base font-semibold text-[#0F172A] mb-8 uppercase tracking-widest text-xs">Direct Connectivity</h3>
                                    <div className="space-y-8">
                                        <ContactItem icon={Phone} label="Phone Support" value="+94 77 123 4567" />
                                        <ContactItem icon={Mail} label="Official Email" value="support@nfplantation.lk" />
                                        <ContactItem icon={Clock} label="Operational Hours" value="Mon - Sat: 9:00 AM - 6:00 PM" />
                                    </div>
                                </div>

                                {/* Support Form */}
                                <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-sm">
                                    <h3 className="text-base font-semibold text-[#0F172A] mb-8 uppercase tracking-widest text-xs">Service Request</h3>
                                    <form className="space-y-4" onSubmit={handleSupportSubmit}>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Subject</label>
                                            <select
                                                value={supportForm.subject}
                                                onChange={e => setSupportForm(p => ({ ...p, subject: e.target.value }))}
                                                className="w-full h-11 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 text-sm text-[#0F172A] focus:ring-1 focus:ring-[#16A34A] outline-none"
                                            >
                                                <option>General Inquiry</option>
                                                <option>Technical Issue</option>
                                                <option>Investment Assistance</option>
                                                <option>Profile Update Request</option>
                                                <option>Withdrawal Support</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Message</label>
                                            <textarea
                                                rows="5"
                                                placeholder="How can we help you?"
                                                value={supportForm.message}
                                                onChange={e => setSupportForm(p => ({ ...p, message: e.target.value }))}
                                                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4 text-sm text-[#0F172A] focus:ring-1 focus:ring-[#16A34A] outline-none resize-none placeholder:text-[#94A3B8]"
                                            />
                                        </div>
                                        {supportSuccess && (
                                            <p className="text-xs font-bold text-[#16A34A] bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">{supportSuccess}</p>
                                        )}
                                        {supportError && (
                                            <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{supportError}</p>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto h-11 px-8 bg-[#16A34A] text-white text-xs font-semibold rounded-xl hover:bg-[#15803D] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {isSubmitting ? <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" /> : <Send size={14} />}
                                            {isSubmitting ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- CHANGE PASSWORD MODAL --- */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
                            onClick={() => !pwdLoading && setShowPasswordModal(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white border border-[#E5E7EB] shadow-2xl rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full overflow-hidden"
                        >
                            {/* Step Indicator */}
                            <div className="flex gap-2 mb-8">
                                <div className={`h-1.5 flex-1 rounded-full ${pwdStep >= 1 ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'}`} />
                                <div className={`h-1.5 flex-1 rounded-full ${pwdStep >= 2 ? 'bg-[#16A34A]' : 'bg-[#E5E7EB]'}`} />
                            </div>

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">{pwdStep === 1 ? 'Verify Identity' : 'Set New Password'}</h3>
                                <p className="text-xs text-[#64748B] mt-1">{pwdStep === 1 ? 'Confirm your NIC to receive a security OTP code.' : 'Enter the OTP and your new access credentials.'}</p>
                            </div>

                            {pwdError && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-600 animate-in shake-in duration-300">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <p className="text-[11px] font-bold leading-relaxed">{pwdError}</p>
                                </div>
                            )}

                            {pwdStep === 1 ? (
                                <div className="space-y-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Valid NIC Number</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-4 top-3.5 text-[#94A3B8]" />
                                            <input 
                                                type="text" 
                                                value={pwdData.nic}
                                                onChange={(e) => setPwdData({...pwdData, nic: e.target.value.toUpperCase()})}
                                                placeholder="ENTER NIC NUMBER"
                                                className="w-full h-12 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl pl-11 pr-4 text-sm font-semibold text-[#0F172A] outline-none focus:border-[#16A34A] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleSendPwdOtp}
                                        disabled={pwdLoading}
                                        className="w-full h-12 bg-[#16A34A] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-[#15803D] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {pwdLoading ? <CheckCircle2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                        Receive Mobile OTP
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-1.5 bg-[#F8FAFC] p-4 rounded-2xl border border-[#E5E7EB]">
                                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">OTP Code (SMS)</label>
                                        <input 
                                            type="text" 
                                            maxLength="6"
                                            value={pwdData.otp}
                                            onChange={(e) => setPwdData({...pwdData, otp: e.target.value})}
                                            className="w-full bg-transparent text-lg font-black tracking-[0.5em] text-[#16A34A] outline-none text-center"
                                            placeholder="000000"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">New Password</label>
                                        <input 
                                            type="password" 
                                            value={pwdData.newPassword}
                                            onChange={(e) => setPwdData({...pwdData, newPassword: e.target.value})}
                                            className="w-full h-12 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-4 text-sm font-semibold outline-none focus:border-[#16A34A]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Confirm Password</label>
                                        <input 
                                            type="password" 
                                            value={pwdData.confirmPassword}
                                            onChange={(e) => setPwdData({...pwdData, confirmPassword: e.target.value})}
                                            className="w-full h-12 bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl px-4 text-sm font-semibold outline-none focus:border-[#16A34A]"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleUpdatePassword}
                                        disabled={pwdLoading}
                                        className="w-full h-12 bg-[#16A34A] text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-[#15803D] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {pwdLoading ? <CheckCircle2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                                        Secure My Account
                                    </button>
                                </div>
                            )}

                            <button 
                                onClick={() => !pwdLoading && setShowPasswordModal(false)}
                                className="w-full mt-6 text-[10px] font-black text-[#64748B] uppercase tracking-widest hover:text-[#0F172A] transition-all"
                            >
                                Cancel & Return
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- HELPER COMPONENTS ---

const PaletteIcon = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.39 2.3-1 .61-.61 1-1.38 1-2.3 0-1.27 1.03-2.3 2.3-2.3.92 0 1.7.39 2.3 1 .61.61 1 1.38 1 2.3 0 5.5-4.5 10-10 10z"/><path d="M12 22s4.5-10 10-10"/>
    </svg>
);

const SecurityRow = ({ icon: Icon, title, desc, onClick, status }) => (
    <div 
        onClick={onClick}
        className="group flex flex-col sm:flex-row items-center gap-6 py-6 cursor-pointer hover:bg-[#F8FAFC] px-4 -mx-4 rounded-xl transition-all"
    >
        <div className="w-12 h-12 bg-[#F1F5F9] text-[#64748B] group-hover:bg-white group-hover:text-[#16A34A] rounded-xl flex items-center justify-center transition-all border border-transparent group-hover:border-[#E5E7EB] group-hover:shadow-sm">
            <Icon size={20} />
        </div>
        <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-sm font-semibold text-[#0F172A]">{title}</p>
            <p className="text-xs text-[#64748B] mt-1">{desc}</p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
            {status && <span className="px-3 py-1 bg-emerald-50 text-[#16A34A] text-[10px] font-bold rounded-full uppercase tracking-wider">{status}</span>}
            <ChevronRight size={16} className="text-[#94A3B8]" />
        </div>
    </div>
);

const ProfileField = ({ label, value, multiline = false }) => {
    let display = value;
    if (value && typeof value === 'object') {
        // Object slipped through (e.g. address sub-document) — stringify gracefully
        display = Object.values(value).filter(v => v && typeof v === 'string').join(', ');
    }
    return (
        <div>
            <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-sm font-semibold text-[#0F172A] ${multiline ? 'leading-relaxed' : 'truncate'}`}>
                {display || 'N/A'}
            </p>
        </div>
    );
};

const ContactItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#F1F5F9] text-[#16A34A] rounded-xl flex items-center justify-center border border-[#E5E7EB]/50">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-sm font-semibold text-[#0F172A] tracking-tight">{value}</p>
        </div>
    </div>
);

export default Settings;
