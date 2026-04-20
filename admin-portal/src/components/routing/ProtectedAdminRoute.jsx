import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoles = ['ADMIN', 'MAIN_ADMIN', 'BRANCH_ADMIN', 'MANAGER'];

const ProtectedAdminRoute = ({ allowedRoles = AdminRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc', color: '#0f172a', fontWeight: '600' }}>
                Verifying Admin Session...
            </div>
        );
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
