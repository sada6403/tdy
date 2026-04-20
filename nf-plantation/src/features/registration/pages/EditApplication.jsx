import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
    User, CreditCard, Upload, CheckCircle, ChevronRight, ChevronLeft,
    AlertCircle, AlertTriangle, FileText, X, Loader2, RefreshCw
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const EditApplication = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [adminRemarks, setAdminRemarks] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [referenceId, setReferenceId] = useState('');
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', nic: '', dob: '', gender: '',
        address: '', city: '', district: '', province: '',
        bankName: '', branchName: '', accountHolder: '', accountNumber: '', preferredBranch: '',
    });

    const [files, setFiles] = useState({
        nicFront: null, nicBack: null, photo: null, bankProof: null,
    });

    const [existingDocs, setExistingDocs] = useState({});

    useEffect(() => {
        if (!id || !token) {
            setError('Invalid resubmission link. Please use the link from your email.');
            setLoading(false);
            return;
        }
        fetchApplicationData();
    }, [id, token]);

    const fetchApplicationData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/applications/resubmit/${id}?token=${token}`);
            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to load application');
            }

            const { application, customer, address, documents } = data.data;

            setAdminRemarks(application.adminRemarks || '');
            setReferenceId(application.referenceId || '');

            setFormData({
                name: customer?.fullName || '',
                email: customer?.email || '',
                phone: customer?.phone || '',
                nic: customer?.nic || '',
                dob: customer?.dob ? customer.dob.split('T')[0] : '',
                gender: customer?.gender || '',
                address: address?.permanentAddress || '',
                city: address?.city || '',
                district: address?.district || '',
                province: address?.province || '',
                bankName: application?.bankDetails?.bankName || '',
                branchName: application?.bankDetails?.branchName || '',
                accountHolder: application?.bankDetails?.accountHolder || '',
                accountNumber: application?.bankDetails?.accountNumber || '',
                preferredBranch: application?.preferredBranch || '',
            });

            // Map existing documents
            const docMap = {};
            (documents || []).forEach(doc => { docMap[doc.type] = doc; });
            setExistingDocs(docMap);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [field]: { file, previewUrl: URL.createObjectURL(file), name: file.name, type: file.type } }));
            if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const removeFile = (field) => setFiles(prev => ({ ...prev, [field]: null }));

    const steps = [
        { id: 1, title: 'Personal Details', icon: User },
        { id: 2, title: 'Account Details', icon: CreditCard },
        { id: 3, title: 'Documents', icon: Upload },
        { id: 4, title: 'Review & Submit', icon: CheckCircle },
    ];

    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.name) newErrors.name = 'Full name is required';
            if (!formData.nic) newErrors.nic = 'NIC is required';
            if (!formData.phone) newErrors.phone = 'Phone is required';
            if (!formData.address) newErrors.address = 'Address is required';
        }
        if (step === 2) {
            if (!formData.bankName) newErrors.bankName = 'Bank name is required';
            if (!formData.branchName) newErrors.branchName = 'Branch name is required';
            if (!formData.accountHolder) newErrors.accountHolder = 'Account holder is required';
            if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
            if (!formData.preferredBranch) newErrors.preferredBranch = 'Preferred branch is required';
        }
        if (step === 3) {
            // Only require re-upload if no existing doc
            ['nicFront', 'nicBack', 'photo', 'bankProof'].forEach(field => {
                if (!files[field] && !existingDocs[field]) {
                    newErrors[field] = `${field} is required`;
                }
            });
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(s => s + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) { setCurrentStep(3); return; }
        setIsSubmitting(true);
        try {
            const body = new FormData();
            Object.entries(formData).forEach(([k, v]) => body.append(k, v));
            body.append('applicationRef', referenceId);
            body.append('isPhoneVerified', 'true');
            body.append('isEmailVerified', 'true');
            // Append new files only
            ['nicFront', 'nicBack', 'photo', 'bankProof'].forEach(field => {
                if (files[field]?.file) body.append(field, files[field].file);
            });

            const res = await fetch(`${API_BASE}/applications/submit`, {
                method: 'POST',
                body,
            });

            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Submission failed');

            setSubmitted(true);
            setReferenceId(data.data.referenceId || referenceId);
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFileField = (label, field) => {
        const existing = existingDocs[field];
        const newFile = files[field];
        return (
            <div className="space-y-2">
                <span className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                {existing && !newFile && (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-800 dark:text-emerald-300 mb-2">
                        <CheckCircle size={16} className="shrink-0" />
                        <span className="truncate flex-1">Existing: {existing.fileName || existing.type}</span>
                        <a href={existing.fileUrl} target="_blank" rel="noreferrer" className="underline text-xs shrink-0">View</a>
                    </div>
                )}
                {newFile ? (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                        {newFile.type?.includes('image') ? (
                            <img src={newFile.previewUrl} alt="preview" className="w-14 h-14 object-cover rounded-lg shrink-0" />
                        ) : (
                            <FileText size={40} className="text-gray-400 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{newFile.name}</p>
                            <p className="text-xs text-gray-400 uppercase">{newFile.type?.split('/')[1]}</p>
                        </div>
                        <button onClick={() => removeFile(field)} className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500">
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <label htmlFor={`file-${field}`} className={`flex flex-col items-center gap-2 p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${errors[field] ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'}`}>
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">{existing ? 'Replace file (optional)' : 'Click to upload'}</span>
                        <input type="file" id={`file-${field}`} className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, field)} />
                    </label>
                )}
                {errors[field] && <p className="text-red-500 text-xs">{errors[field]}</p>}
            </div>
        );
    };

    // ─── Loading / Error states ──────────────────────────────────────
    if (loading) {
        return (
            <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center space-y-4">
                        <Loader2 size={40} className="animate-spin text-emerald-500 mx-auto" />
                        <p className="text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Registry Vault...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-center p-6 py-20">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl p-10 text-center border border-slate-100 dark:border-slate-800">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={30} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Access Restricted</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{error}</p>
                        <button onClick={() => navigate('/company/nf-plantation/login')} className="w-full py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-lg active:scale-95 transition-all">
                            Authenticate Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Success state ───────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex-1 flex items-center justify-center p-6 py-20">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
                        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8">
                            <CheckCircle size={48} className="text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Vault Re-Synched</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed uppercase text-xs tracking-widest">Your amended legal registry has been successfully transmitted for re-evaluation.</p>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-10 border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2">Protocol Reference</p>
                            <p className="text-2xl font-mono font-black text-slate-900 dark:text-white tracking-tighter">{referenceId}</p>
                        </div>
                        <button onClick={() => navigate('/company/nf-plantation/login')} className="w-full py-5 bg-emerald-600 text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                            Terminal Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Main Form ───────────────────────────────────────────────────
    return (
        <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <main className="max-w-4xl">

                {/* Admin Remarks Banner */}
                {adminRemarks && (
                    <div className="mb-8 p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl flex gap-4">
                        <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-amber-800 dark:text-amber-300 mb-1">Action Required by Admin</p>
                            <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">{adminRemarks}</p>
                        </div>
                    </div>
                )}

                {/* Title */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <RefreshCw size={12} /> Resubmission
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Update Your Application</h1>
                    <p className="text-gray-500 mt-2">Reference: <span className="font-mono font-semibold">{referenceId}</span></p>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
                    {steps.map((step, i) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isDone = currentStep > step.id;
                        return (
                            <React.Fragment key={step.id}>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : isDone ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                    {isDone ? <CheckCircle size={14} /> : <Icon size={14} />}
                                    <span>{step.title}</span>
                                </div>
                                {i < steps.length - 1 && <div className={`h-px w-6 ${currentStep > step.id ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                            </React.Fragment>
                        );
                    })}
                </div>

                <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="p-6 md:p-10">

                        {/* Step 1: Personal */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Personal Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                                        <input name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300`} />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIC Number *</label>
                                        <input name="nic" value={formData.nic} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors.nic ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300`} />
                                        {errors.nic && <p className="text-red-500 text-xs mt-1">{errors.nic}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                                        <input name="phone" value={formData.phone} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors.phone ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300`} />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                        <input name="email" value={formData.email} readOnly className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Permanent Address *</label>
                                        <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={`w-full px-4 py-2.5 rounded-xl border ${errors.address ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none`} />
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                        <input name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
                                        <input name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Bank */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Account Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { name: 'bankName', label: 'Bank Name' },
                                        { name: 'branchName', label: 'Branch Name' },
                                        { name: 'accountHolder', label: 'Account Holder' },
                                        { name: 'accountNumber', label: 'Account Number' },
                                    ].map(f => (
                                        <div key={f.name}>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label} *</label>
                                            <input name={f.name} value={formData[f.name]} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors[f.name] ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300`} />
                                            {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]}</p>}
                                        </div>
                                    ))}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred NF Branch *</label>
                                        <select name="preferredBranch" value={formData.preferredBranch} onChange={handleChange} className={`w-full px-4 py-2.5 rounded-xl border ${errors.preferredBranch ? 'border-red-400' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-300`}>
                                            <option value="">Select a branch</option>
                                            <option>Kilinochchi HQ</option>
                                            <option>Jaffna Branch</option>
                                            <option>Colombo Office</option>
                                        </select>
                                        {errors.preferredBranch && <p className="text-red-500 text-xs mt-1">{errors.preferredBranch}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Documents */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Documents</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Existing documents are preserved. Only upload a replacement if the admin flagged an issue.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderFileField('NIC Front Side', 'nicFront')}
                                    {renderFileField('NIC Back Side', 'nicBack')}
                                    {renderFileField('Applicant Photo', 'photo')}
                                    {renderFileField('Bank Proof', 'bankProof')}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">Review & Confirm</h2>
                                <div className="space-y-4 text-sm">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-bold text-gray-900 dark:text-white">Personal Details</h3>
                                            <button onClick={() => setCurrentStep(1)} className="text-xs text-emerald-600 font-semibold hover:underline">Edit</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
                                            <div><p className="text-gray-400 text-xs">Name</p><p className="font-medium">{formData.name}</p></div>
                                            <div><p className="text-gray-400 text-xs">NIC</p><p className="font-medium">{formData.nic}</p></div>
                                            <div><p className="text-gray-400 text-xs">Phone</p><p className="font-medium">{formData.phone}</p></div>
                                            <div><p className="text-gray-400 text-xs">Email</p><p className="font-medium">{formData.email}</p></div>
                                            <div className="col-span-2"><p className="text-gray-400 text-xs">Address</p><p className="font-medium">{formData.address}</p></div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-bold text-gray-900 dark:text-white">Account Details</h3>
                                            <button onClick={() => setCurrentStep(2)} className="text-xs text-emerald-600 font-semibold hover:underline">Edit</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
                                            <div><p className="text-gray-400 text-xs">Bank</p><p className="font-medium">{formData.bankName}</p></div>
                                            <div><p className="text-gray-400 text-xs">Branch</p><p className="font-medium">{formData.branchName}</p></div>
                                            <div><p className="text-gray-400 text-xs">Account No</p><p className="font-medium">{formData.accountNumber}</p></div>
                                            <div><p className="text-gray-400 text-xs">Preferred Branch</p><p className="font-medium">{formData.preferredBranch}</p></div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-bold text-gray-900 dark:text-white">Documents</h3>
                                            <button onClick={() => setCurrentStep(3)} className="text-xs text-emerald-600 font-semibold hover:underline">Edit</button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {['nicFront', 'nicBack', 'photo', 'bankProof'].map(field => {
                                                const isNew = !!files[field];
                                                const isExisting = !!existingDocs[field];
                                                return (
                                                    <div key={field} className={`p-3 rounded-xl text-center text-xs font-medium ${isNew ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700' : isExisting ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : 'bg-red-50 text-red-600'}`}>
                                                        {field}
                                                        <p className="mt-1 text-[10px] uppercase">{isNew ? '✓ New Upload' : isExisting ? '✓ Existing' : '✗ Missing'}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                {errors.submit && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl text-red-600 text-sm">
                                        {errors.submit}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                        <button
                            onClick={() => { setCurrentStep(s => s - 1); window.scrollTo(0, 0); }}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all text-sm ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm'}`}
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                        {currentStep < 4 ? (
                            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm">
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 text-sm">
                                {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><CheckCircle size={16} /> Submit Application</>}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EditApplication;
