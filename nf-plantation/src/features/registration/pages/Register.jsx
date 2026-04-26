import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useLanguage } from '../../../context/LanguageContext';
import { 
    User, CreditCard, FileText, Upload, CheckCircle, Check,
    ChevronRight, ChevronLeft, ShieldCheck, 
    AlertCircle, X, Fingerprint, Mail, PenTool, Printer, Camera
} from 'lucide-react';

// Camera Capture Modal Component
const CameraCaptureModal = ({ isOpen, onClose, onCapture, label }) => {
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const [stream, setStream] = React.useState(null);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => stopCamera();
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError("Unable to access camera. Please ensure you have given permission.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
                const previewUrl = URL.createObjectURL(blob);
                onCapture({ file, previewUrl, name: file.name, type: file.type, size: file.size });
                onClose();
            }
        }, 'image/jpeg', 0.7);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <div className="bg-emerald-700 p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Capture {label}</h3>
                        <p className="text-xs opacity-70">Align your document or face within the frame</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="flex-1 bg-slate-950 relative min-h-[300px] flex items-center justify-center">
                    {error ? (
                        <div className="text-center p-8 text-white">
                            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                            <p className="text-sm font-medium">{error}</p>
                            <button onClick={startCamera} className="mt-4 px-6 py-2 bg-emerald-600 rounded-xl text-sm font-bold">Try Again</button>
                        </div>
                    ) : (
                        <>
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 border-[3px] border-emerald-500/30 pointer-events-none rounded-3xl m-8"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-dashed border-white/20 rounded-full pointer-events-none flex items-center justify-center">
                                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Focus Center</span>
                            </div>
                        </>
                    )}
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="p-8 bg-white flex justify-center gap-4">
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    {!error && (
                        <button 
                            onClick={capturePhoto}
                            className="bg-emerald-600 text-white px-10 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                        >
                            <Camera size={18} /> Take Photo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Signature Pad Component
const SignaturePad = ({ onSave, onClear, value }) => {
    const canvasRef = React.useRef(null);
    const [isDrawing, setIsDrawing] = React.useState(false);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#064e3b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Handle window resize to keep canvas mapping correct
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            // We don't want to reset canvas content on resize, but we need to know the scale
        };
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    const getCoords = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        
        // Scale coordinates based on canvas internal width/height vs display size
        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);
        return { x, y };
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        const { x, y } = getCoords(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
        e.preventDefault();
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { x, y } = getCoords(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
        e.preventDefault();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const dataUrl = canvasRef.current.toDataURL();
        onSave(dataUrl);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onClear();
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><PenTool size={10} /> Digital Signature</span>
                <button onClick={clear} className="text-[10px] font-bold text-red-500 hover:underline">Clear Signature</button>
            </div>
            <div className="relative border-2 border-dashed border-slate-200 rounded-3xl bg-white overflow-hidden h-64 md:h-80">
                <canvas 
                    ref={canvasRef}
                    width={800} // Higher resolution
                    height={400} 
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full cursor-crosshair touch-none"
                />
                {!value && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <span className="text-sm italic text-slate-400">Sign here using mouse or touch (Supports multiple strokes)</span>
                </div>}
            </div>
        </div>
    );
};

// ── Image compression: reduces any image to ≤ 2 MB before upload ─────────────
const MAX_DOC_BYTES = 2 * 1024 * 1024; // 2 MB

const compressImage = (file) => new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.size <= MAX_DOC_BYTES) {
        resolve(file);
        return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            const maxDim = 1920;
            if (width > maxDim || height > maxDim) {
                const scale = maxDim / Math.max(width, height);
                width = Math.round(width * scale);
                height = Math.round(height * scale);
            }
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            const tryQ = (q) => {
                canvas.toBlob((blob) => {
                    if (!blob) { resolve(file); return; }
                    if (blob.size <= MAX_DOC_BYTES || q <= 0.25) {
                        const name = file.name.replace(/\.[^.]+$/, '.jpg');
                        resolve(new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() }));
                    } else {
                        tryQ(+(q - 0.1).toFixed(1));
                    }
                }, 'image/jpeg', q);
            };
            tryQ(0.82);
        };
        img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
});

const PlantationRegister = () => {
    const routerNavigate = useNavigate();
    const [branches, setBranches] = useState([]);

    // Steps Configuration
    const steps = [
        { id: 1, title: 'Personal', icon: User },
        { id: 2, title: 'Contact', icon: Mail },
        { id: 3, title: 'Verify', icon: ShieldCheck },
        { id: 4, title: 'Banking', icon: CreditCard },
        { id: 5, title: 'Upload', icon: Upload },
        { id: 6, title: 'Review', icon: CheckCircle },
    ];

    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [registrationError, setRegistrationError] = useState('');
    const [draftRestored, setDraftRestored] = useState(false);
    const [otpLoading, setOtpLoading] = useState({ phone: false, verifyPhone: false, email: false, verifyEmail: false });
    const [applicationRef, setApplicationRef] = useState('');
    const [activeCamera, setActiveCamera] = useState(null); // { field, label }
    const [timers, setTimers] = useState({ phone: 0, email: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prev => ({
                phone: prev.phone > 0 ? prev.phone - 1 : 0,
                email: prev.email > 0 ? prev.email - 1 : 0
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Generate or retrieve a persistent temp session ID
        let sessionId = localStorage.getItem('nf_reg_session');
        if (!sessionId) {
            sessionId = 'SSN-' + crypto.randomUUID();
            localStorage.setItem('nf_reg_session', sessionId);
        }
        setTempSessionId(sessionId);

        // Generate a frontend ref for UI display
        const ref = 'NF-' + Math.floor(100000 + Math.random() * 900000);
        setApplicationRef(prev => prev || ref);
    }, []);

    const [tempSessionId, setTempSessionId] = useState('');

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const response = await api.get('/customer/branches');
                if (response.success && response.data.length > 0) {
                    setBranches(response.data);
                } else {
                    setBranches([{ name: 'Kilinochchi HQ' }, { name: 'Jaffna Branch' }, { name: 'Colombo Office' }]);
                }
            } catch (err) {
                setBranches([{ name: 'Kilinochchi HQ' }, { name: 'Jaffna Branch' }, { name: 'Colombo Office' }]);
            }
        };
        fetchBranches();
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        // Personal Details
        name: '', 
        nic: '', 
        dob: '', 
        gender: '',
        
        // Contact & Address
        email: '', 
        phone: '+94', 
        address: '', 
        city: '', 
        district: '', 
        province: '',
        
        // Verification State
        otp: '', 
        isVerified: false, 
        isOtpSent: false,
        emailOtp: '', 
        isEmailVerified: false, 
        isEmailOtpSent: false,
        
        // Application & Banking
        registrationDate: new Date().toISOString().split('T')[0],
        bankName: '', 
        branchName: '', 
        preferredBranch: '', 
        accountHolder: '', 
        accountNumber: '',
        
        // Documents
        nicFront: null, 
        nicBack: null, 
        photo: null, 
        bankProof: null,
        signature: null
    });

    const saveDraftToServer = async (data = formData) => {
        if (!tempSessionId) return;
        try {
            const { nicFront, nicBack, photo, bankProof, signature, ...serializable } = data;
            await api.post('/registration/draft', {
                tempSessionId,
                formData: { ...serializable, currentStep, completionPercentage: Math.round((currentStep / 6) * 100) }
            });
        } catch (err) {
            console.warn("Draft sync failed", err);
        }
    };

    // Load Remote Draft on Mount
    useEffect(() => {
        const fetchDraft = async () => {
            const sessionId = localStorage.getItem('nf_reg_session');
            if (!sessionId) return;
            
            try {
                const res = await api.get(`/registration/draft/${sessionId}`);
                if (res.success) {
                    setFormData(prev => ({ ...prev, ...res.data }));
                    setCurrentStep(res.data.currentStep || 1);
                    setDraftRestored(true);
                    setTimeout(() => setDraftRestored(false), 5000);
                }
            } catch (err) {
                console.log("No remote draft found.");
            }
        };
        fetchDraft();
    }, [tempSessionId]);

    const [errors, setErrors] = useState({});

    const labelClass = 'text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500';
    const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10';
    const sectionCardClass = 'rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] md:p-8';
    const sectionTitleClass = 'text-xl font-bold tracking-tight text-slate-900';
    const otpButtonClass = 'rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 disabled:opacity-50';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: '' });
        if (registrationError) setRegistrationError('');
        
        // Reset verification if email or phone changes via general handleChange
        if (name === 'email') {
            setFormData(prev => ({ ...prev, isEmailOtpSent: false, isEmailVerified: false, emailOtp: '' }));
            setErrors(prev => ({ ...prev, email: '', emailOtp: '' }));
        }
    };

    const handlePhoneChange = (e) => {
        let input = e.target.value;
        
        // Always ensure start is +94
        if (!input.startsWith('+94')) {
            // If they deleted part of +94, restore it
            input = '+94' + input.replace(/\D/g, '').replace(/^94/, '');
        }

        let digits = input.substring(3).replace(/\D/g, ''); // Get digits after +94
        
        // Handle if user typed '0' immediately after +94 (remove it)
        if (digits.startsWith('0')) {
            digits = digits.substring(1);
        }
        
        // Handle if user typed '94' immediately after +94 (remove it)
        if (digits.startsWith('94')) {
            digits = digits.substring(2);
        }

        const finalVal = '+94' + digits.slice(0, 9);
        
        setFormData(prev => ({ ...prev, phone: finalVal, otp: '', isOtpSent: false, isVerified: false }));
        setErrors(prev => ({ ...prev, phone: '', otp: '' }));
    };

    const handleOtpInputChange = (e) => {
        setFormData(prev => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }));
        if (errors.otp) setErrors(prev => ({ ...prev, otp: '' }));
    };

    const handleEmailOtpInputChange = (e) => {
        setFormData(prev => ({ ...prev, emailOtp: e.target.value.replace(/\D/g, '').slice(0, 6) }));
        if (errors.emailOtp) setErrors(prev => ({ ...prev, emailOtp: '' }));
    };

    const handleFileChange = async (e, field) => {
        const raw = e.target.files[0];
        if (!raw) return;

        // PDFs and non-image files: reject if > 2 MB
        if (!raw.type.startsWith('image/') && raw.size > MAX_DOC_BYTES) {
            setErrors(prev => ({ ...prev, [field]: `File too large (${(raw.size / 1024 / 1024).toFixed(1)} MB). Max 2 MB.` }));
            e.target.value = '';
            return;
        }

        const file = await compressImage(raw);
        setFormData(prev => ({ ...prev, [field]: { file, previewUrl: URL.createObjectURL(file), name: file.name, type: file.type, size: file.size } }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const removeFile = (field) => setFormData({ ...formData, [field]: null });

    const handleSendOtp = async () => {
        if (formData.phone.length !== 12) return setErrors({ ...errors, phone: "Enter a valid 9-digit number" });
        setOtpLoading(prev => ({ ...prev, phone: true }));
        try {
            await api.post('/registration/send-otp', {
                tempSessionId,
                channel: 'MOBILE',
                targetValue: formData.phone
            });
            setFormData(prev => ({ ...prev, isOtpSent: true }));
            setTimers(prev => ({ ...prev, phone: 120 }));
            setErrors(prev => ({ ...prev, phone: '' }));
        } catch (err) {
            setErrors(prev => ({ ...prev, phone: err.response?.data?.message || "Failed" }));
        } finally { setOtpLoading(prev => ({ ...prev, phone: false })); }
    };

    const handleVerifyOtp = async () => {
        if (!formData.otp) return setErrors(prev => ({ ...prev, otp: "Required" }));
        setOtpLoading(prev => ({ ...prev, verifyPhone: true }));
        try {
            await api.post('/registration/verify-otp', {
                tempSessionId,
                channel: 'MOBILE',
                otp: formData.otp
            });
            setFormData(prev => ({ ...prev, isVerified: true }));
            setErrors(prev => ({ ...prev, otp: '', phone: '' }));
        } catch (err) {
            setErrors(prev => ({ ...prev, otp: "Invalid" }));
        } finally { setOtpLoading(prev => ({ ...prev, verifyPhone: false })); }
    };

    const handleSendEmailOtp = async () => {
        if (!formData.email.includes('@')) return setErrors({ ...errors, email: "Enter valid email" });
        setOtpLoading(prev => ({ ...prev, email: true }));
        try {
            await api.post('/registration/send-otp', {
                tempSessionId,
                channel: 'EMAIL',
                targetValue: formData.email
            });
            setFormData(prev => ({ ...prev, isEmailOtpSent: true }));
            setTimers(prev => ({ ...prev, email: 120 }));
            setErrors(prev => ({ ...prev, email: '' }));
        } catch (err) {
            setErrors(prev => ({ ...prev, email: "Failed" }));
        } finally { setOtpLoading(prev => ({ ...prev, email: false })); }
    };

    const handleVerifyEmailOtp = async () => {
        if (!formData.emailOtp) return setErrors(prev => ({ ...prev, emailOtp: "Required" }));
        setOtpLoading(prev => ({ ...prev, verifyEmail: true }));
        try {
            await api.post('/registration/verify-otp', {
                tempSessionId,
                channel: 'EMAIL',
                otp: formData.emailOtp
            });
            setFormData(prev => ({ ...prev, isEmailVerified: true }));
            setErrors(prev => ({ ...prev, emailOtp: '', email: '' }));
        } catch (err) {
            setErrors(prev => ({ ...prev, emailOtp: "Invalid" }));
        } finally { setOtpLoading(prev => ({ ...prev, verifyEmail: false })); }
    };

    const validateStep = (step) => {
        const e = {};
        if (step === 1) {
            if (!formData.name) e.name = "Full name is required";
            if (!formData.nic) e.nic = "NIC is required";
            if (!formData.dob) e.dob = "Date of Birth is required";
            if (!formData.gender) e.gender = "Gender is required";
        } else if (step === 2) {
            if (!formData.email || !formData.email.includes('@')) e.email = "Valid email required";
            if (formData.phone.length !== 12) e.phone = "Valid phone required";
            if (!formData.address) e.address = "Address is required";
            if (!formData.city) e.city = "City is required";
            if (!formData.district) e.district = "District is required";
            if (!formData.province) e.province = "Province is required";
        } else if (step === 3) {
            if (!formData.isEmailVerified) e.emailOtp = "Email verification required";
        } else if (step === 4) {
            if (!formData.preferredBranch) e.preferredBranch = "Preferred branch is required";
            if (!formData.bankName) e.bankName = "Bank name is required";
            if (!formData.branchName) e.branchName = "Branch name is required";
            if (!formData.accountHolder) e.accountHolder = "Account holder is required";
            if (!formData.accountNumber) e.accountNumber = "Account number is required";
        } else if (step === 5) {
            if (!formData.nicFront) e.nicFront = "NIC Front is required";
            if (!formData.photo) e.photo = "Photo is required";
            if (!formData.signature) e.signature = "Signature is required";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = async () => {
        if (validateStep(currentStep)) {
            // Save draft before proceeding
            await saveDraftToServer();

            // Proactive Duplicate Check
            if (currentStep === 1 || currentStep === 2) {
                setOtpLoading(prev => ({ ...prev, phone: true })); // Borrow loading state or add new
                try {
                    const checkData = {
                        nic: formData.nic,
                        email: currentStep === 2 ? formData.email : undefined,
                        phone: currentStep === 2 ? formData.phone : undefined
                    };
                    await api.post('/applications/check-duplicate', checkData);
                } catch (err) {
                    if (err.status === 409) {
                        const duplicateField = err.data?.field || 'Identity';
                        setErrors(prev => ({ 
                            ...prev, 
                            [currentStep === 1 ? 'nic' : (duplicateField.includes('Email') ? 'email' : 'phone')]: 
                            `This ${duplicateField} is already registered.`
                        }));
                        return; // Stop navigation
                    }
                } finally {
                    setOtpLoading(prev => ({ ...prev, phone: false }));
                }
            }

            if (!completedSteps.includes(currentStep)) setCompletedSteps([...completedSteps, currentStep]);
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => { setCurrentStep(currentStep - 1); window.scrollTo(0, 0); };

    const preparePayload = () => {
        const d = new FormData();
        
        // Flattened basic fields
        const basicFields = [
            'name', 'email', 'phone', 'nic', 'dob', 'gender',
            'address', 'city', 'district', 'province',
            'bankName', 'branchName', 'accountHolder', 'accountNumber',
            'preferredBranch', 'registrationDate'
        ];
        
        basicFields.forEach(field => {
            d.append(field, formData[field]);
        });
        
        // Identity & Workflow
        d.append('applicationRef', applicationRef);
        d.append('isPhoneVerified', formData.isVerified);
        d.append('isEmailVerified', formData.isEmailVerified);
        
        // Documents
        const fileFields = ['nicFront', 'nicBack', 'photo', 'bankProof'];
        fileFields.forEach(field => {
            if (formData[field]?.file) {
                d.append(field, formData[field].file);
            }
        });

        // Add base64 signature if exists
        if (formData.signature) {
            d.append('signature', formData.signature);
        }
        
        return d;
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setRegistrationError('');
        
        try {
            const payload = preparePayload();
            
            const res = await api.post('/applications/submit', payload, {
                headers: { 'Content-Type': undefined }
            });

            if (res.success) {
                // Clear local registration draft session
                localStorage.removeItem('nf_reg_session');
                setShowSuccessModal(true);
                // No auto-login: user must wait for admin approval
            }
        } catch (err) {
            setRegistrationError(err.message || "Critical failure during final submission. Please retry.");
            window.scrollTo(0, 0);
        } finally { 
            setIsSubmitting(false); 
        }
    };

    const renderFileUpload = (label, field) => (
        <div className="space-y-3">
            <span className={labelClass}>{label}</span>
            {!formData[field] ? (
                <div className="grid grid-cols-2 gap-3">
                    <div onClick={() => document.getElementById(field).click()} className={`flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all hover:bg-slate-100/50 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                        <input type="file" id={field} className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, field)} />
                        <Upload size={20} className="text-slate-400 mb-2" />
                        <span className="text-xs font-bold text-slate-500 italic">Upload File</span>
                    </div>
                    <div onClick={() => setActiveCamera({ field, label })} className={`flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-all hover:bg-emerald-50/50 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-emerald-200 bg-emerald-50/30'}`}>
                        <Camera size={20} className="text-emerald-600/60 mb-2" />
                        <span className="text-xs font-bold text-emerald-700 italic">Open Camera</span>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 rounded-2xl border bg-emerald-50 p-3">
                    <div className="h-10 w-10 overflow-hidden rounded-lg bg-white border shadow-sm">
                        {formData[field].type.includes('image') ? <img src={formData[field].previewUrl} className="h-full w-full object-cover" /> : <FileText className="m-2 text-emerald-500" />}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate text-[10px] font-bold text-slate-700">{formData[field].name}</span>
                        <span className="text-[8px] text-emerald-600 font-bold uppercase tracking-wider">
                            {formData[field].size ? `${(formData[field].size / 1024).toFixed(0)} KB · ` : ''}Ready to submit
                        </span>
                    </div>
                    <X size={16} className="cursor-pointer text-slate-400 hover:text-red-500 transition-colors" onClick={() => removeFile(field)} />
                </div>
            )}
            {errors[field] && <p className="text-[10px] font-bold text-red-500">{errors[field]}</p>}
        </div>
    );

    return (
        <div className="relative flex min-h-screen flex-col bg-slate-50 font-sans py-4 md:py-10">
            <div className="relative z-10 mx-auto w-full max-w-5xl bg-white shadow-2xl md:rounded-[2.5rem] border border-slate-200 flex flex-col overflow-visible">
                {/* Header */}
                <div className="bg-emerald-700 p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold">Online Application</h1>
                        <p className="text-sm opacity-80">Join our sustainable plantation project.</p>
                    </div>
                    <div className="flex gap-2">
                        {steps.map(s => (
                            <div key={s.id} className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${currentStep === s.id ? 'bg-white text-emerald-700' : 'border-emerald-100 text-white/80 font-bold'}`}>
                                {completedSteps.includes(s.id) ? <Check size={16} /> : s.id}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Area */}
                <div className="bg-slate-50 p-6 md:p-10">
                    {draftRestored && <div className="mb-6 rounded-xl bg-emerald-100 p-4 text-sm text-emerald-700 flex justify-between"><span>Draft restored automatically.</span><X size={16} onClick={() => setDraftRestored(false)} /></div>}
                    {registrationError && <div className="mb-6 rounded-xl bg-red-100 p-4 text-sm text-red-700">{registrationError}</div>}

                    {currentStep === 1 && (
                        <div className="space-y-8 animate-in slide-in-from-right-10">
                            <div className={sectionCardClass}>
                                <h2 className={sectionTitleClass}>Personal Details</h2>
                                <div className="mt-8 grid gap-6 md:grid-cols-2">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className={labelClass}>Full Name</label>
                                        <input name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="John Doe" />
                                        {errors.name && <p className="text-red-500 text-[10px] font-bold">{errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>NIC Number</label>
                                        <input name="nic" value={formData.nic} onChange={handleChange} className={inputClass} placeholder="123456789V" />
                                        {errors.nic && <p className="text-red-500 text-[10px] font-bold">{errors.nic}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Date of Birth</label>
                                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
                                        {errors.dob && <p className="text-red-500 text-[10px] font-bold">{errors.dob}</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className={labelClass}>Gender</label>
                                        <div className="flex gap-4">
                                            {['Male', 'Female', 'Other'].map(g => (
                                                <button key={g} onClick={() => setFormData({...formData, gender: g})} className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all ${formData.gender === g ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>{g}</button>
                                            ))}
                                        </div>
                                        {errors.gender && <p className="text-red-500 text-[10px] font-bold">{errors.gender}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-8 animate-in slide-in-from-right-10">
                            <div className={sectionCardClass}>
                                <h2 className={sectionTitleClass}>Contact & Address</h2>
                                <div className="mt-8 grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Email Address</label>
                                        <input name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="email@example.com" />
                                        {errors.email && <p className="text-red-500 text-[10px] font-bold">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Phone (+94)</label>
                                        <input value={formData.phone} onChange={handlePhoneChange} className={inputClass} placeholder="77 123 4567" />
                                        {errors.phone && <p className="text-red-500 text-[10px] font-bold">{errors.phone}</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className={labelClass}>Permanent Address</label>
                                        <textarea name="address" value={formData.address} onChange={handleChange} className={inputClass} rows="2" />
                                        {errors.address && <p className="text-red-500 text-[10px] font-bold">{errors.address}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>City</label>
                                        <input name="city" value={formData.city} onChange={handleChange} className={inputClass} />
                                        {errors.city && <p className="text-red-500 text-[10px] font-bold">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>District</label>
                                        <input name="district" value={formData.district} onChange={handleChange} className={inputClass} />
                                        {errors.district && <p className="text-red-500 text-[10px] font-bold">{errors.district}</p>}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className={labelClass}>Province</label>
                                        <select name="province" value={formData.province} onChange={handleChange} className={inputClass}>
                                            <option value="">Select Province</option>
                                            {['Northern', 'Western', 'Central', 'Southern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'].map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        {errors.province && <p className="text-red-500 text-[10px] font-bold">{errors.province}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-8 animate-in slide-in-from-right-10">
                            <div className={sectionCardClass}>
                                <h2 className={sectionTitleClass}>Security Verification</h2>
                                <div className="mt-8 space-y-8">
                                    {/* Phone Verification temporarily hidden due to SMS API issues */}
                                    {/* <div className="space-y-4">
                                        <label className={labelClass}>Phone Verification ({formData.phone})</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input disabled={formData.isVerified} value={formData.phone} readOnly className={`${inputClass} bg-slate-100 opacity-70`} />
                                                {formData.isVerified && <CheckCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />}
                                            </div>
                                            {!formData.isVerified && !formData.isOtpSent && <button onClick={handleSendOtp} disabled={otpLoading.phone} className={otpButtonClass}>{otpLoading.phone ? '...' : 'Send OTP'}</button>}
                                        </div>
                                        {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.phone}</p>}
                                        {formData.isOtpSent && !formData.isVerified && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex justify-between">
                                                    <span>Dual Delivery: Check SMS & Email</span>
                                                    <span>{Math.floor(timers.phone / 60)}:{(timers.phone % 60).toString().padStart(2, '0')} remaining</span>
                                                </p>
                                                <div className="animate-in fade-in zoom-in duration-300 flex gap-2 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 mt-2">
                                                    <input value={formData.otp} onChange={handleOtpInputChange} className={`${inputClass} text-center font-black tracking-[0.5em] text-lg bg-white border-emerald-200`} placeholder="0000" />
                                                    <button onClick={handleVerifyOtp} disabled={otpLoading.verifyPhone || timers.phone === 0} className={otpButtonClass}>Verify</button>
                                                </div>
                                                {timers.phone === 0 && <button onClick={handleSendOtp} className="text-[10px] font-bold text-emerald-600 hover:underline">Code expired. Resend OTP</button>}
                                            </div>
                                        )}
                                        {errors.otp && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.otp}</p>}
                                    </div> */}

                                    <div className="space-y-4">
                                        <label className={labelClass}>Email Verification ({formData.email})</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <input disabled={formData.isEmailVerified} value={formData.email} readOnly className={`${inputClass} bg-slate-100 opacity-70`} />
                                                {formData.isEmailVerified && <CheckCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />}
                                            </div>
                                            {!formData.isEmailVerified && !formData.isEmailOtpSent && <button onClick={handleSendEmailOtp} disabled={otpLoading.email} className={otpButtonClass}>{otpLoading.email ? '...' : 'Send OTP'}</button>}
                                        </div>
                                        {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.email}</p>}
                                        {formData.isEmailOtpSent && !formData.isEmailVerified && (
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex justify-between">
                                                    <span>Code sent to registered email</span>
                                                    <span>{Math.floor(timers.email / 60)}:{(timers.email % 60).toString().padStart(2, '0')} remaining</span>
                                                </p>
                                                <div className="animate-in fade-in zoom-in duration-300 flex gap-2 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 mt-2">
                                                    <input value={formData.emailOtp} onChange={handleEmailOtpInputChange} className={`${inputClass} text-center font-black tracking-[0.5em] text-lg bg-white border-emerald-200`} placeholder="0000" />
                                                    <button onClick={handleVerifyEmailOtp} disabled={otpLoading.verifyEmail || timers.email === 0} className={otpButtonClass}>Verify</button>
                                                </div>
                                                {timers.email === 0 && <button onClick={handleSendEmailOtp} className="text-[10px] font-bold text-emerald-600 hover:underline">Code expired. Resend OTP</button>}
                                            </div>
                                        )}
                                        {errors.emailOtp && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.emailOtp}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-8 animate-in slide-in-from-right-10">
                            <div className={sectionCardClass}>
                                <h2 className={sectionTitleClass}>Application & Banking</h2>
                                <div className="mt-8 grid gap-6 md:grid-cols-2">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className={labelClass}>Preferred <span className="notranslate" translate="no">NF Plantation</span> Branch</label>
                                        <select name="preferredBranch" value={formData.preferredBranch} onChange={handleChange} className={inputClass}>
                                            <option value="">Select Branch</option>
                                            {branches.map((b, i) => <option key={i} value={b.name}>{b.name}</option>)}
                                        </select>
                                        {errors.preferredBranch && <p className="text-red-500 text-[10px] font-bold">{errors.preferredBranch}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Bank Name</label>
                                        <input name="bankName" value={formData.bankName} onChange={handleChange} className={inputClass} />
                                        {errors.bankName && <p className="text-red-500 text-[10px] font-bold">{errors.bankName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Branch Name</label>
                                        <input name="branchName" value={formData.branchName} onChange={handleChange} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Account Holder</label>
                                        <input name="accountHolder" value={formData.accountHolder} onChange={handleChange} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Account Number</label>
                                        <input name="accountNumber" value={formData.accountNumber} onChange={handleChange} className={inputClass} />
                                        {errors.accountNumber && <p className="text-red-500 text-[10px] font-bold">{errors.accountNumber}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 5 && (
                        <div className="space-y-8 animate-in slide-in-from-right-10">
                            <div className={sectionCardClass}>
                                <h2 className={sectionTitleClass}>Upload Documents</h2>
                                <p className="text-sm text-slate-500 mb-8 italic">Please provide clear scans or photos of the following documents.</p>
                                <div className="grid gap-8 md:grid-cols-2">
                                    {renderFileUpload('NIC Front Side *', 'nicFront')}
                                    {renderFileUpload('NIC Back Side', 'nicBack')}
                                    {renderFileUpload('Bank Passbook / Statement', 'bankProof')}
                                    {renderFileUpload('Applicant Photo *', 'photo')}
                                </div>
                                <div className="mt-8 border-t pt-8">
                                    <SignaturePad 
                                        value={formData.signature}
                                        onSave={(data) => setFormData({...formData, signature: data})}
                                        onClear={() => setFormData({...formData, signature: null})}
                                    />
                                    {errors.signature && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.signature}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 6 && (
                        <div className="space-y-8 animate-in slide-in-from-right-10 pb-10">
                            {/* Official Header */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-emerald-800 pb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-emerald-700 rounded-2xl flex items-center justify-center p-2 text-white overflow-hidden shadow-lg border-2 border-white">
                                        <img src="/nf-logo.jpg" alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-emerald-900 tracking-tight text-center md:text-left notranslate" translate="no">NF PLANTATION (PVT) LTD</h2>
                                        <p className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-widest text-center md:text-left">Official Registration Application</p>
                                        <p className="text-[9px] text-slate-400 font-medium text-center md:text-left">Ref: {applicationRef} | Date: {new Date().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200">
                                {/* Section 1: Persona */}
                                <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                                    <div className="flex items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Customer Identity</h3>
                                        </div>
                                        <button onClick={() => { setCurrentStep(1); window.scrollTo(0,0); }} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">EDIT DETAILS</button>
                                    </div>
                                    <div className="grid md:grid-cols-4 gap-8">
                                        <div className="md:col-span-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</p>
                                            <p className="text-lg font-black text-slate-900">{formData.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">NIC Number</p>
                                            <p className="text-lg font-black text-slate-900">{formData.nic}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</p>
                                            <p className="text-lg font-black text-slate-900">{formData.gender}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Date of Birth</p>
                                            <p className="font-bold text-slate-800">{formData.dob}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Mobile Number</p>
                                            <p className="font-bold text-slate-800">{formData.phone}</p>
                                            {/* <span className={`text-[9px] font-bold ${formData.isVerified ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'} px-2 py-0.5 rounded-full border mt-1 inline-block`}>{formData.isVerified ? 'VERIFIED' : 'NOT VERIFIED'}</span> */}
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</p>
                                            <p className="font-bold text-slate-800">{formData.email}</p>
                                            <span className={`text-[9px] font-bold ${formData.isEmailVerified ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-600 bg-red-50 border-red-100'} px-2 py-0.5 rounded-full border mt-1 inline-block`}>{formData.isEmailVerified ? 'VERIFIED' : 'NOT VERIFIED'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Address */}
                                <div className="p-8 border-b border-slate-100">
                                    <div className="flex items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Residencial Information</h3>
                                        </div>
                                        <button onClick={() => { setCurrentStep(2); window.scrollTo(0,0); }} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">EDIT ADDRESS</button>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Permanent Address</p>
                                            <p className="text-md font-bold text-slate-800 leading-relaxed uppercase tracking-tight">{formData.address}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">City / Town</p>
                                            <p className="font-bold text-slate-800 uppercase">{formData.city}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">District</p>
                                                <p className="font-bold text-slate-800 uppercase">{formData.district}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Province</p>
                                                <p className="font-bold text-slate-800 uppercase">{formData.province}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Banking */}
                                <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                                    <div className="flex items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Financial Details</h3>
                                        </div>
                                        <button onClick={() => { setCurrentStep(4); window.scrollTo(0,0); }} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">EDIT BANKING</button>
                                    </div>
                                    <div className="grid md:grid-cols-4 gap-8">
                                        <div className="md:col-span-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Bank Name</p>
                                            <p className="font-bold text-slate-800 uppercase text-lg">{formData.bankName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Branch</p>
                                            <p className="font-bold text-slate-800 uppercase">{formData.branchName}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Account Holder</p>
                                            <p className="font-bold text-slate-800 uppercase">{formData.accountHolder}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Account Number</p>
                                            <p className="text-xl font-black text-emerald-900 tracking-widest">#{formData.accountNumber}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred <span className="notranslate" translate="no">NF Plantation</span> Branch</p>
                                            <p className="text-lg font-black text-emerald-700">{formData.preferredBranch}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Documents & Signature */}
                                <div className="p-8">
                                    <div className="flex items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                                            <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Authentication & Documents</h3>
                                        </div>
                                        <button onClick={() => { setCurrentStep(5); window.scrollTo(0,0); }} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all">EDIT DOCUMENTS</button>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'NIC Front', key: 'nicFront' },
                                                { label: 'NIC Back', key: 'nicBack' },
                                                { label: 'Bank Proof', key: 'bankProof' },
                                                { label: 'Applicant Photo', key: 'photo' }
                                            ].map(doc => (
                                                <div key={doc.key} className="group relative aspect-square rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden shadow-sm">
                                                    {formData[doc.key]?.previewUrl ? (
                                                        <img src={formData[doc.key].previewUrl} alt={doc.label} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                                            <FileText size={20} className="text-slate-300 mb-2" />
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase text-center">{doc.label}</p>
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-sm p-2">
                                                        <p className="text-[8px] font-bold text-white uppercase tracking-wider truncate">{doc.label}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-6 border-2 border-emerald-100 rounded-3xl bg-emerald-50/20">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-4 text-center">Digital Acknowledgment</p>
                                            {formData.signature ? (
                                                <img src={formData.signature} alt="Signature" className="max-h-24 w-auto grayscale" />
                                            ) : (
                                                <div className="h-24 flex items-center justify-center italic text-red-400 text-xs">Signature Missing</div>
                                            )}
                                            <div className="w-32 border-t border-slate-300 mt-2"></div>
                                            <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-tighter">Electronically Signed</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Declaration */}
                            <div className="rounded-3xl bg-slate-100/80 p-6 border-l-4 border-emerald-600">
                                <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase">Applicant Declaration</h4>
                                <p className="text-[10px] text-slate-600 leading-relaxed italic">
                                    I hereby declare that the details furnished above are true and correct to the best of my knowledge and belief and I undertake to inform you of any changes therein, immediately. In case any of the above information is found to be false or untrue or misleading or misrepresenting, I am aware that I may be held liable for it.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t bg-white px-8 py-6 flex justify-between items-center">
                    <button onClick={handleBack} disabled={currentStep === 1 || isSubmitting} className={`flex items-center gap-2 font-bold text-slate-400 uppercase tracking-widest text-xs transition-all hover:text-slate-600 ${currentStep === 1 ? 'invisible' : ''}`}><ChevronLeft size={16}/> Back</button>
                    {currentStep < 6 ? (
                        <button onClick={handleNext} className="rounded-2xl bg-emerald-600 px-10 py-4 font-bold text-white shadow-xl shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98]">Next Step</button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isSubmitting} className="rounded-2xl bg-emerald-600 px-10 py-4 font-bold text-white shadow-xl shadow-emerald-600/20 disabled:opacity-50 transition-all hover:bg-emerald-500 hover:scale-[1.02]">
                            {isSubmitting ? 'Processing...' : 'Complete & Submit'}
                        </button>
                    )}
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div>
                        <h2 className="text-2xl font-bold mb-2">Application Received!</h2>
                        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                            Your application (Ref: <span className="font-bold text-emerald-600">{applicationRef}</span>) has been successfully submitted for review. 
                            <br/><br/>
                            Our team will verify your documents within 24-48 hours. You will receive an email with your secure login credentials once approved.
                        </p>
                        <button onClick={() => routerNavigate('/company/nf-plantation')} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20">Return Home</button>
                    </div>
                </div>
            )}
            {/* Camera Capture Modal */}
            <CameraCaptureModal 
                isOpen={!!activeCamera}
                label={activeCamera?.label}
                onClose={() => setActiveCamera(null)}
                onCapture={(photoData) => {
                    setFormData(prev => ({ ...prev, [activeCamera.field]: photoData }));
                    if (errors[activeCamera.field]) setErrors(prev => ({ ...prev, [activeCamera.field]: '' }));
                }}
            />
        </div>
    );
};

export default PlantationRegister;
