import { useState, useEffect } from 'react';
import { 
  Plus, Zap, Clock, DollarSign, TrendingUp, Trash2, 
  CheckCircle2, AlertCircle, Save, X, Loader2, Info,
  Eye, Edit3, ArrowUpRight, Filter, ChevronRight,
  Monitor, Layout, ShieldCheck, HelpCircle, Star,
  EyeOff, MoreHorizontal, Calendar, History
} from 'lucide-react';
import { plansService } from '../services/api/adminPlans';

const InvestmentPlans = () => {
    // State Management
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // UI States
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    
    // Form State
    const initialFormState = {
        name: '',
        shortDescription: '',
        duration: '',
        durationUnit: 'Months',
        interestRate: '',
        minAmount: '',
        maxAmount: '',
        payoutType: 'Monthly Return',
        displayOrder: 0,
        isActive: true,
        customerVisible: true,
        isPopular: false,
        badgeText: '',
        termsSummary: '',
        earlyWithdrawalAllowed: false,
        penaltyNote: '',
        internalNote: '',
        status: 'ACTIVE'
    };
    
    const [formData, setFormData] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});

    // Fetch Initial Data
    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await plansService.getAllPlans();
            if (response.success) {
                setPlans(response.data);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    // Form Event Handlers
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        
        // Clear error when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name) errors.name = 'Plan name is required';
        if (!formData.duration || formData.duration <= 0) errors.duration = 'Valid duration is required';
        if (formData.interestRate === '' || formData.interestRate < 0) errors.interestRate = 'Valid interest rate is required';
        if (!formData.minAmount || formData.minAmount < 0) errors.minAmount = 'Valid minimum amount is required';
        if (formData.maxAmount && Number(formData.maxAmount) <= Number(formData.minAmount)) {
            errors.maxAmount = 'Max amount must be greater than min amount';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openDrawer = (plan = null) => {
        if (plan) {
            setEditingPlan(plan);
            setFormData({ ...initialFormState, ...plan });
        } else {
            setEditingPlan(null);
            setFormData(initialFormState);
        }
        setDrawerOpen(true);
        setFormErrors({});
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setTimeout(() => {
            setEditingPlan(null);
            setFormData(initialFormState);
        }, 300);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setActionLoading(true);
        try {
            const payload = {
                ...formData,
                minAmount: Number(formData.minAmount),
                maxAmount: formData.maxAmount ? Number(formData.maxAmount) : undefined,
                duration: Number(formData.duration),
                interestRate: Number(formData.interestRate),
                displayOrder: Number(formData.displayOrder)
            };

            let response;
            if (editingPlan) {
                response = await plansService.updatePlan(editingPlan._id, payload);
            } else {
                response = await plansService.createPlan(payload);
            }

            if (response.success) {
                closeDrawer();
                fetchPlans();
            }
        } catch (error) {
            console.error('Operation failed:', error);
            setFormErrors({ server: error.response?.data?.message || 'Operation failed' });
        } finally {
            setActionLoading(false);
        }
    };

    const togglePlanStatus = async (plan) => {
        try {
            const newStatus = plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            const response = await plansService.updatePlan(plan._id, { 
                status: newStatus,
                isActive: newStatus === 'ACTIVE'
            });
            if (response.success) fetchPlans();
        } catch (error) {
            alert('Error updating status');
        }
    };

    // Summary Calculations
    const activePlans = plans.filter(p => p.status === 'ACTIVE');
    const totalPlans = plans.length;
    const avgInterest = activePlans.length > 0 
        ? (activePlans.reduce((sum, p) => sum + p.interestRate, 0) / activePlans.length).toFixed(1) 
        : '0';
    const minEntry = activePlans.length > 0
        ? Math.min(...activePlans.map(p => p.minAmount)).toLocaleString()
        : '0';

    return (
        <div style={{ position: 'relative', minHeight: '100vh', paddingBottom: '40px' }}>
            
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' }}>Investment Plans Management</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px', fontWeight: '500' }}>Create, update, activate, and control customer-facing investment plans.</p>
                </div>
                <button 
                    onClick={() => openDrawer()}
                    className="btn-primary"
                    style={{ 
                        padding: '12px 24px', 
                        borderRadius: '12px', 
                        fontSize: '14px', 
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
                    }}
                >
                    <Plus size={18} /> New Investment Plan
                </button>
            </div>

            {/* Summary Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Plans', value: totalPlans, sub: 'In database', icon: <Layout />, color: '#3b82f6' },
                    { label: 'Active Plans', value: activePlans.length, sub: 'Visible to engine', icon: <CheckCircle2 />, color: '#10b981' },
                    { label: 'Avg. Interest Rate', value: `${avgInterest}%`, sub: 'Per investment cycle', icon: <TrendingUp />, color: '#8b5cf6' },
                    { label: 'Min Entry Range', value: `LKR ${minEntry}`, sub: 'Starting price', icon: <DollarSign />, color: '#f59e0b' }
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px' }}>{stat.label}</p>
                                <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: '8px 0 4px 0' }}>{stat.value}</h3>
                                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{stat.sub}</p>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '14px', backgroundColor: `${stat.color}15`, color: stat.color }}>
                                {stat.icon}
                            </div>
                        </div>
                        {/* Subtle background decoration */}
                        <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }}>
                            <Zap size={100} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Filters & Table */}
            <div className="card" style={{ padding: '0', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        {['ALL', 'ACTIVE', 'INACTIVE', 'DRAFT'].map(status => (
                            <button 
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                style={{ 
                                    padding: '8px 4px', 
                                    fontSize: '13px', 
                                    fontWeight: '800', 
                                    color: filterStatus === status ? 'var(--primary)' : '#94a3b8',
                                    borderBottom: `2px solid ${filterStatus === status ? 'var(--primary)' : 'transparent'}`,
                                    transition: 'all 0.2s',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                {status === 'ALL' ? 'All Plans' : `${status} Plans`}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', border: '1px solid #f1f5f9', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>
                            <Filter size={14} /> Refine View
                        </div>
                    </div>
                </div>

                <div className="table-responsive" style={{ overflowX: 'auto' }}>
                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'left' }}>Plan Identity</th>
                                <th style={{ padding: '16px 12px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'left' }}>Parameters</th>
                                <th style={{ padding: '16px 12px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'left' }}>Financials</th>
                                <th style={{ padding: '16px 12px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '16px 12px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'center' }}>Visibility</th>
                                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '100px', textAlign: 'center' }}>
                                        <Loader2 className="animate-spin mx-auto mb-4" size={40} color="var(--primary)" />
                                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>Syncing with Asset Management Engine...</p>
                                    </td>
                                </tr>
                            ) : plans.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '100px', textAlign: 'center' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                            <Info size={30} color="#cbd5e1" />
                                        </div>
                                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#475569' }}>No investment plans configured yet</h4>
                                        <p style={{ color: '#94a3b8', margin: '8px 0 24px', fontSize: '14px' }}>Start by creating your first asset model for investors.</p>
                                        <button onClick={() => openDrawer()} className="btn-primary" style={{ padding: '10px 20px', height: 'auto', fontSize: '13px' }}>+ Create First Plan</button>
                                    </td>
                                </tr>
                            ) : (
                                plans
                                .filter(p => filterStatus === 'ALL' || p.status === filterStatus)
                                .map((plan, idx) => (
                                    <tr key={plan._id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#fcfdfe', borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: plan.status === 'ACTIVE' ? '#f0fdf4' : '#f1f5f9', color: plan.status === 'ACTIVE' ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Zap size={22} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ fontWeight: '800', fontSize: '15px', color: '#1e293b' }}>{plan.name}</span>
                                                        {plan.isPopular && <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#d97706', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Popular</span>}
                                                    </div>
                                                    <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', width: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.shortDescription || 'No description provided'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 12px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Clock size={13} color="#94a3b8" />
                                                    <span style={{ fontWeight: '700', fontSize: '13px' }}>{plan.duration} {plan.durationUnit}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <History size={13} color="#94a3b8" />
                                                    <span style={{ fontWeight: '600', fontSize: '11px', color: '#64748b' }}>{plan.payoutType}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 12px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontWeight: '800', color: '#111827', fontSize: '14px' }}>LKR {plan.minAmount.toLocaleString()}</span>
                                                <span style={{ fontWeight: '700', color: '#16a34a', fontSize: '12px' }}>{plan.interestRate}% Return</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 12px', textAlign: 'center' }}>
                                            <span className={`badge ${plan.status === 'ACTIVE' ? 'badge-success' : plan.status === 'DRAFT' ? 'badge-info' : 'badge-error'}`} style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '11px' }}>
                                                {plan.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 12px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                                {plan.customerVisible ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontWeight: '700', fontSize: '12px' }}>
                                                        <Eye size={14} /> Public
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontWeight: '700', fontSize: '12px' }}>
                                                        <EyeOff size={14} /> Hidden
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => togglePlanStatus(plan)} title={plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#f8fafc', color: plan.status === 'ACTIVE' ? '#dc2626' : '#16a34a' }}>
                                                    {plan.status === 'ACTIVE' ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button onClick={() => openDrawer(plan)} style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#f8fafc', color: '#64748b' }}>
                                                    <Edit3 size={16} />
                                                </button>
                                                <button style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#f8fafc', color: '#64748b' }}>
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Showing {plans.length} total models in current registry</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="badge" style={{ padding: '8px 16px', border: '1px solid #f1f5f9' }}>Previous</button>
                        <button className="badge" style={{ padding: '8px 16px', border: '1px solid #f1f5f9' }}>Next</button>
                    </div>
                </div>
            </div>

            {/* Premium Side Drawer Overlay */}
            {drawerOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end' }}>
                    {/* Backdrop closer */}
                    <div style={{ position: 'absolute', inset: 0 }} onClick={closeDrawer}></div>
                    
                    {/* Drawer Content */}
                    <div style={{ 
                        width: '600px', 
                        height: '100%', 
                        backgroundColor: 'white', 
                        position: 'relative', 
                        boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'slideLeft 0.3s ease-out'
                    }}>
                        {/* Drawer Header */}
                        <div style={{ padding: '32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{editingPlan ? 'Refine Investment Plan' : 'Configure New Asset Model'}</h2>
                                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>Define terms, payouts, and customer visibility settings.</p>
                            </div>
                            <button onClick={closeDrawer} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drawer Scrollable Body */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                            <form id="plan-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                
                                {/* Section 1: Core Identity */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'var(--primary)15', color: 'var(--primary)' }}><Monitor size={14} /></div>
                                        <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Core Identity & Descriptor</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Plan Administrative Name *</label>
                                            <input name="name" value={formData.name} onChange={handleInputChange} className="input-field" placeholder="e.g. Platinum Harvest Elite" />
                                            {formErrors.name && <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '700' }}>{formErrors.name}</span>}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Short Consumer Description</label>
                                            <textarea name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} className="input-field" style={{ minHeight: '80px', paddingTop: '12px' }} placeholder="Max 120 characters describing the benefit..." />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Financial Matrix */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#8b5cf615', color: '#8b5cf6' }}><DollarSign size={14} /></div>
                                        <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Financial Growth Matrix</h4>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Minimum Entrance (LKR) *</label>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>Rs.</div>
                                                <input name="minAmount" type="number" value={formData.minAmount} onChange={handleInputChange} className="input-field" style={{ paddingLeft: '40px' }} placeholder="0.00" />
                                            </div>
                                            {formErrors.minAmount && <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '700' }}>{formErrors.minAmount}</span>}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Interest Rate (% Month) *</label>
                                            <div style={{ position: 'relative' }}>
                                                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>%</div>
                                                <input name="interestRate" type="number" step="0.1" value={formData.interestRate} onChange={handleInputChange} className="input-field" placeholder="0.0" />
                                            </div>
                                            {formErrors.interestRate && <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '700' }}>{formErrors.interestRate}</span>}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Tenure Scale *</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input name="duration" type="number" value={formData.duration} onChange={handleInputChange} className="input-field" style={{ flex: 1 }} placeholder="Value" />
                                                <select name="durationUnit" value={formData.durationUnit} onChange={handleInputChange} className="input-field" style={{ width: '100px' }}>
                                                    <option value="Months">Months</option>
                                                    <option value="Years">Years</option>
                                                </select>
                                            </div>
                                            {formErrors.duration && <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '700' }}>{formErrors.duration}</span>}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '12px', fontWeight: '800', color: '#475569' }}>Payout Frequency</label>
                                            <select name="payoutType" value={formData.payoutType} onChange={handleInputChange} className="input-field">
                                                <option value="Monthly Return">Monthly Return</option>
                                                <option value="Maturity Only">Maturity Only</option>
                                                <option value="Custom">Custom Algorithm</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Visibility & Promotions */}
                                <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                        <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f59e0b15', color: '#f59e0b' }}><Monitor size={14} /></div>
                                        <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>Consumer Exposure Settings</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {[
                                            { name: 'isActive', label: 'Engine Status', desc: 'Allow this plan to accept new investments', icon: <Zap size={16} /> },
                                            { name: 'customerVisible', label: 'Public Visibility', desc: 'Display this plan on the public website', icon: <Eye size={16} /> },
                                            { name: 'isPopular', label: 'Market Spotlight', desc: 'Highlight as "Recommended" for customers', icon: <Star size={16} /> },
                                            { name: 'earlyWithdrawalAllowed', label: 'Early Liquidity', desc: 'Allow principal withdrawal before maturity', icon: <ShieldCheck size={16} /> }
                                        ].map(field => (
                                            <div key={field.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                                    <div style={{ marginTop: '2px', color: '#94a3b8' }}>{field.icon}</div>
                                                    <div>
                                                        <p style={{ fontSize: '13px', fontWeight: '800', color: '#334155' }}>{field.label}</p>
                                                        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{field.desc}</p>
                                                    </div>
                                                </div>
                                                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        name={field.name}
                                                        checked={formData[field.name]}
                                                        onChange={handleInputChange}
                                                        style={{ opacity: 0, width: 0, height: 0 }}
                                                    />
                                                    <span style={{ 
                                                        position: 'absolute', cursor: 'pointer', inset: 0, 
                                                        backgroundColor: formData[field.name] ? 'var(--primary)' : '#cbd5e1',
                                                        borderRadius: '34px', transition: '0.3s'
                                                    }}>
                                                        <span style={{ 
                                                            position: 'absolute', height: '18px', width: '18px', left: formData[field.name] ? '22px' : '3px', 
                                                            bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '0.3s' 
                                                        }}></span>
                                                    </span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Customer Preview Panel */}
                                <div style={{ marginTop: '10px' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '16px' }}>Public Website Preview</h4>
                                    <div style={{ padding: '24px', borderRadius: '24px', background: 'linear-gradient(135deg, #052c1e 0%, #10b981 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                                        {formData.isPopular && <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'white', color: '#052c1e', padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: '900' }}>POPULAR CHOICE</div>}
                                        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '800' }}>INVESTMENT MODEL</p>
                                        <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '4px 0 12px 0' }}>{formData.name || 'Plan Identity Name'}</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                            <div>
                                                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>DURATION</p>
                                                <p style={{ fontSize: '14px', fontWeight: '800' }}>{formData.duration || '--'} {formData.durationUnit}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontWeight: '700' }}>MONTHLY RETURN</p>
                                                <p style={{ fontSize: '14px', fontWeight: '800' }}>{formData.interestRate || '0.0'}%</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                            <p style={{ fontSize: '12px', fontWeight: '800' }}>LKR {Number(formData.minAmount || 0).toLocaleString()}+</p>
                                            <ArrowUpRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Drawer Footer */}
                        <div style={{ padding: '32px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '16px', backgroundColor: '#fcfdfe' }}>
                            <button onClick={closeDrawer} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontSize: '14px', fontWeight: '800' }}>Discard Changes</button>
                            <button form="plan-form" disabled={actionLoading} type="submit" className="btn-primary" style={{ flex: 2, padding: '14px', borderRadius: '12px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                {actionLoading ? <Loader2 size={20} className="animate-spin" /> : editingPlan ? <><Save size={20} /> Update Framework</> : <><Plus size={20} /> Deploy New Plan</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Animations Component Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slideLeft {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .switch input:checked + span { background-color: var(--primary); }
                .admin-table tbody tr:hover { background-color: #f8fafc !important; }
            `}} />
        </div>
    );
};

export default InvestmentPlans;
