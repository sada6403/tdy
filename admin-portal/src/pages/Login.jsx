import { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, TreeDeciduous } from 'lucide-react';
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
                const token = user.token;
                
                if (user.role !== 'ADMIN') {
                    setError('Unauthorized: Admin access only.');
                    setLoading(false);
                    return;
                }
                
                // Login relies on HttpOnly cookie set by backend. No localStorage needed.
                window.location.href = '/';
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            backgroundImage: 'radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%)',
            padding: '24px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '440px',
                backgroundColor: 'white',
                borderRadius: '24px',
                padding: '48px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '32px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#10b981',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        margin: '0 auto 24px auto',
                        boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Admin Operations</h1>
                    <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Authorize your session to manage NF Plantation</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        borderRadius: '12px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Lock size={16} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Administrator User ID</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                required
                                value={userIdentifier}
                                onChange={(e) => setUserIdentifier(e.target.value)}
                                placeholder="Enter Administrator ID"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    outline: 'none',
                                    fontSize: '15px',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '14px 44px 14px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    outline: 'none',
                                    fontSize: '15px',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <input type="checkbox" style={{ accentColor: '#10b981' }} />
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Stay logged in</span>
                        </label>
                        <button type="button" style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>Locked Out?</button>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: '#0f172a',
                            color: 'white',
                            padding: '14px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            marginTop: '12px',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                        onMouseOver={(e) => { if(!loading) e.target.style.backgroundColor = '#1e293b'; }}
                        onMouseOut={(e) => { if(!loading) e.target.style.backgroundColor = '#0f172a'; }}
                    >
                        {loading ? 'Authenticating Securely...' : 'Access Admin Securely'}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                        This is a restricted access system. All activities are recorded and audited for security purposes.
                    </p>
                </div>
            </div>
            
            {/* Background branding */}
            <div style={{
                position: 'fixed',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: 'rgba(255, 255, 255, 0.4)'
            }}>
                <TreeDeciduous size={20} />
                <span style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '2px', fontFamily: 'Outfit' }}>NF PLANTATION (PVT) LTD</span>
            </div>
        </div>
    );
};

export default Login;
