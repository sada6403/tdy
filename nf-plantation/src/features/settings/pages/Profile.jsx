import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Mail, Phone, MapPin, Grid, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import api from '../../../services/api';

const Profile = () => {
    const { user, updateProfile, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const fileInputRef = useRef(null);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/customer/profile');
            if (res.success) setProfileData(res.data);
        } catch (error) {
            console.error("Profile Fetch Error:", error);
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/company/nf-plantation/login');
        } else if (user) {
            fetchProfile();
        }
    }, [user, authLoading, navigate]);

    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (profileData?.photoUrl) {
            setPreviewImage(profileData.photoUrl);
        }
    }, [profileData]);

    if (authLoading || fetchLoading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500" size={40} />
        </div>
    );

    if (!user || !profileData) return null;

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('photo', file);

            const res = await api.post('/customer/update-photo', formData, {
                headers: { 'Content-Type': undefined }
            });

            if (res.success) {
                updateProfile({ ...user, photoUrl: res.photoUrl });
                setProfileData({ ...profileData, photoUrl: res.photoUrl });
                alert("Profile photo updated successfully!");
            }
        } catch (error) {
            console.error("Photo Upload Error:", error);
            alert("Failed to update profile photo. Please try again.");
            setPreviewImage(profileData.photoUrl);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-5xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">My Profile</h1>
                    <p className="text-sm font-medium text-slate-500">View your protected identity details and update your display photo.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden group">
                            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-emerald-50/50 dark:from-emerald-900/10 to-transparent"></div>
                            
                            <div className="relative inline-block mb-8 mt-4">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center relative">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[#16A34A] flex items-center justify-center text-white text-4xl font-black">{profileData.name?.charAt(0)}</div>
                                    )}
                                    {isLoading && (
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                                            <Loader2 className="animate-spin" size={24} />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 p-3 bg-[#16A34A] text-white rounded-full shadow-xl hover:bg-[#15803d] transition-all active:scale-90 border-2 border-white dark:border-slate-800"
                                    title="Update Avatar"
                                >
                                    <Camera size={18} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>

                            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-tight">{profileData.name}</h2>
                            <p className="text-[10px] font-black text-[#16A34A] mb-8 uppercase tracking-widest">{profileData.role || 'Verified Investor'}</p>

                            <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-3">
                                <button
                                    onClick={logout}
                                    className="w-full py-4 rounded-2xl font-black text-[10px] text-red-500 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    <LogOut size={14} /> End Secure Session
                                </button>
                            </div>
                        </div>

                        <div className="bg-emerald-600 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-emerald-500/20">
                            <h3 className="text-lg font-bold mb-2">Need to Update Info?</h3>
                            <p className="text-emerald-100 text-xs font-medium mb-6 leading-relaxed">For security reasons, residential and contact changes must be requested through support.</p>
                            <button onClick={() => navigate('/company/nf-plantation/dashboard/support')} className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Support Center</button>
                            <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={100} />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm relative h-full">
                            <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50 dark:border-slate-800">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Protected Identity Details</h3>
                                <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Grid size={12} /> Read-Only Data
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Legal Name</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all">
                                        <User size={18} className="text-slate-300" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{profileData.name}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">NIC / Identity Number</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all">
                                        <Grid size={18} className="text-slate-300" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{profileData.nic || 'Not Verified'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Mail Address</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all">
                                        <Mail size={18} className="text-slate-300" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{profileData.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Phone Protocol</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all">
                                        <Phone size={18} className="text-slate-300" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{profileData.phone}</span>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Residence</label>
                                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group transition-all min-h-[100px]">
                                        <MapPin size={18} className="text-slate-300 mt-0.5" />
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">{profileData.address || 'Address information restricted or not provided.'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
                                <ShieldCheck size={20} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-500 leading-relaxed uppercase tracking-tight">
                                    Identity data is encrypted and verified for KYC compliance. To resolve data discrepancies, please open a high-priority support ticket.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
