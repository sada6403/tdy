import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoles = ['ADMIN', 'MAIN_ADMIN', 'BRANCH_ADMIN', 'MANAGER'];

const AdminLoadingScreen = () => {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const enterTimer = setTimeout(() => setPhase(1), 100);
        let current = 0;
        const interval = setInterval(() => {
            current += Math.random() * 5 + 2;
            if (current >= 95) { current = 95; clearInterval(interval); }
            setProgress(Math.min(current, 95));
        }, 60);
        return () => { clearTimeout(enterTimer); clearInterval(interval); };
    }, []);

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'linear-gradient(135deg, #020d18 0%, #041e33 40%, #062d4a 70%, #083d5e 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            opacity: phase === 1 ? 1 : 0,
            transition: 'opacity 0.5s ease',
        }}>
            <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', top: '-150px', right: '-150px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)', bottom: '-100px', left: '-100px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(16,185,129,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.04) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '180px', height: '180px', borderTop: '2px solid rgba(16,185,129,0.2)', borderLeft: '2px solid rgba(16,185,129,0.2)', borderTopLeftRadius: '4px', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '180px', height: '180px', borderBottom: '2px solid rgba(16,185,129,0.2)', borderRight: '2px solid rgba(16,185,129,0.2)', borderBottomRightRadius: '4px', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: phase >= 1 ? 'translateY(0)' : 'translateY(30px)', opacity: phase >= 1 ? 1 : 0, transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                <div style={{ position: 'relative', marginBottom: '32px' }}>
                    <div style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', background: 'conic-gradient(from 0deg, #10b981, #059669, #047857, #10b981)', animation: 'adminSpin 4s linear infinite', opacity: 0.6 }} />
                    <div style={{ position: 'absolute', inset: '-8px', borderRadius: '50%', backgroundColor: '#020d18' }} />
                    <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(16,185,129,0.5)', boxShadow: '0 0 40px rgba(16,185,129,0.25), 0 0 80px rgba(16,185,129,0.1)' }}>
                        <img src="/logo.jpg" alt="NF Plantation" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '6px', color: 'white', textTransform: 'uppercase', textShadow: '0 0 30px rgba(16,185,129,0.3)', fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0 }}>NF PLANTATION</h1>
                    <p style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '4px', color: 'rgba(16,185,129,0.8)', textTransform: 'uppercase', marginTop: '6px' }}>(PVT) LTD</p>
                </div>

                <div style={{ width: '200px', height: '1px', marginBottom: '16px', background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)' }} />

                <div style={{ padding: '6px 20px', borderRadius: '30px', border: '1px solid rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.08)', marginBottom: '52px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '3px', color: 'rgba(16,185,129,0.9)', textTransform: 'uppercase' }}>Admin Portal</span>
                </div>

                <div style={{ width: '280px', textAlign: 'center' }}>
                    <div style={{ width: '100%', height: '3px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
                        <div style={{ height: '100%', borderRadius: '4px', width: `${progress}%`, background: 'linear-gradient(90deg, #059669, #10b981, #34d399)', boxShadow: '0 0 10px rgba(16,185,129,0.6)', transition: 'width 0.1s ease', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: '30px', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', margin: 0 }}>
                        {progress < 40 ? 'Initializing system...' : progress < 75 ? 'Loading modules...' : 'Verifying session...'}
                    </p>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '40px', opacity: phase >= 1 ? 0.5 : 0, transition: 'opacity 1.2s ease 0.6s', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', fontWeight: '600', margin: 0 }}>SECURE · RELIABLE · TRANSPARENT</p>
            </div>

            <style>{`@keyframes adminSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

const ProtectedAdminRoute = ({ allowedRoles = AdminRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <AdminLoadingScreen />;
    }

    // Redirect unauthenticated explicitly
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Deny customer access or any unlisted roles
    if (user.role === 'CUSTOMER' || !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    // Authorized! Provide Outlet to nest specific layouts or pages
    return <Outlet />;
};

export default ProtectedAdminRoute;
