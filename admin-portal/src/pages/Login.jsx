import { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, TrendingUp, Users, Building2 } from 'lucide-react';
import { authService } from '../services/api/auth';

const Login = () => {
    const [userIdentifier, setUserIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authService.login({ user_id: userIdentifier, password });
            if (response.success) {
                const user = response.data;
                if (!['ADMIN', 'BRANCH_ADMIN'].includes(user.role)) {
                    setError('Unauthorized: Admin access only.');
                    setLoading(false);
                    return;
                }
                window.location.href = '/';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { icon: <Users size={16} />, label: 'Active Investors', value: '2,400+' },
        { icon: <Building2 size={16} />, label: 'Branch Network', value: '12 Cities' },
        { icon: <TrendingUp size={16} />, label: 'Monthly Returns', value: 'Up to 4%' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            fontFamily: "'Outfit', 'Inter', sans-serif"
        }}>
            {/* ── LEFT PANEL ── */}
            <div style={{
                width: '44%',
                background: 'linear-gradient(145deg, #0a1f13 0%, #0d2b1a 40%, #112214 70%, #0f1f12 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '52px 48px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '80px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-40px', right: '60px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,168,94,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Logo + Brand */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '60px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '2px solid rgba(16,185,129,0.3)', boxShadow: '0 0 20px rgba(16,185,129,0.15)' }}>
                            <img src="/logo.jpg" alt="NF Plantation" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <div style={{ color: 'white', fontWeight: '800', fontSize: '15px', letterSpacing: '1px' }}>NF PLANTATION</div>
                            <div style={{ color: '#10b981', fontSize: '10px', fontWeight: '700', letterSpacing: '2px' }}>PVT LTD</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{ color: 'white', fontSize: '38px', fontWeight: '900', lineHeight: 1.15, marginBottom: '16px' }}>
                            Grow <span style={{ color: '#10b981' }}>Wealth</span><br />
                            Sustainably.
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.7, fontWeight: '500', maxWidth: '280px' }}>
                            Empowering investors through nature-backed financial instruments with consistent monthly returns.
                        </p>
                    </div>

                    {/* Stats grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {stats.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {s.icon}
                                </div>
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.label}</div>
                                    <div style={{ color: 'white', fontSize: '15px', fontWeight: '800', marginTop: '2px' }}>{s.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom security badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <ShieldCheck size={16} color="#10b981" />
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: '600' }}>
                        256-bit encrypted • Restricted admin access • All sessions audited
                    </p>
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={{
                flex: 1,
                backgroundColor: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 60px'
            }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>

                    {/* Header */}
                    <div style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', marginBottom: '20px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#065f46', letterSpacing: '0.5px' }}>ADMIN PORTAL</span>
                        </div>
                        <h2 style={{ fontSize: '30px', fontWeight: '900', color: '#0f172a', marginBottom: '8px' }}>Welcome back</h2>
                        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Sign in to your administrator account to continue</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: '600' }}>
                            <Lock size={15} />
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Administrator User ID</label>
                            <div style={{ position: 'relative' }}>
                                <User size={17} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type="text"
                                    required
                                    value={userIdentifier}
                                    onChange={(e) => setUserIdentifier(e.target.value)}
                                    placeholder="Enter your admin user ID"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px 14px 46px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #e5e7eb',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        fontSize: '14px',
                                        color: '#111827',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#374151' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={17} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••"
                                    style={{
                                        width: '100%',
                                        padding: '14px 46px 14px 46px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #e5e7eb',
                                        backgroundColor: 'white',
                                        outline: 'none',
                                        fontSize: '14px',
                                        color: '#111827',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', padding: '4px' }}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-4px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" style={{ accentColor: '#10b981', width: '15px', height: '15px' }} />
                                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Stay logged in</span>
                            </label>
                            <button type="button" style={{ fontSize: '13px', color: '#10b981', fontWeight: '700' }}>Locked out?</button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '15px',
                                borderRadius: '12px',
                                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                fontSize: '15px',
                                fontWeight: '800',
                                letterSpacing: '0.3px',
                                marginTop: '8px',
                                transition: 'all 0.2s',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: loading ? 'none' : '0 4px 15px rgba(16,185,129,0.35)'
                            }}
                            onMouseOver={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 20px rgba(16,185,129,0.45)'; }}
                            onMouseOut={(e) => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 15px rgba(16,185,129,0.35)'; }}
                        >
                            {loading ? 'Authenticating...' : 'Access Admin Dashboard →'}
                        </button>
                    </form>

                    {/* Footer note */}
                    <p style={{ marginTop: '28px', fontSize: '11px', color: '#9ca3af', textAlign: 'center', lineHeight: 1.6, fontWeight: '500' }}>
                        Restricted access system. All login attempts and admin activities are<br />
                        recorded and audited for security compliance.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
