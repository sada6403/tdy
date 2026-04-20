import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session from HttpOnly cookie on mount
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.success) setUser(res.data);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        restoreSession();
    }, []);

    const login = async ({ user_id, password }) => {
        try {
            const res = await api.post('/auth/login', { user_id, password, requiredRole: 'CUSTOMER' });
            if (res.success) {
                setUser(res.data);
                return { success: true, mustChangePassword: res.data.mustChangePassword };
            }
            return { success: false, message: res.message || 'Login failed' };
        } catch (err) {
            return { success: false, message: err.message || 'Login failed' };
        }
    };

    const logout = async () => {
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        setUser(null);
    };

    const updateProfile = (newData) => setUser(prev => ({ ...prev, ...newData }));

    const clearMustChangePassword = () => setUser(prev => ({ ...prev, mustChangePassword: false }));

    const verifyNic = async (nic) => {
        try {
            return await api.post('/auth/forgot-password/verify-nic', { nic });
        } catch (err) {
            return { success: false, message: err.message || 'Verification failed' };
        }
    };

    const sendForgotPasswordOtp = async (userId, channel) => {
        try {
            return await api.post('/auth/forgot-password/send-otp', { userId, channel });
        } catch (err) {
            return { success: false, message: err.message || 'Failed to send OTP' };
        }
    };

    const verifyForgotPasswordOtp = async (userId, channel, otp) => {
        try {
            return await api.post('/auth/forgot-password/verify-otp', { userId, channel, otp });
        } catch (err) {
            return { success: false, message: err.message || 'Invalid or expired OTP' };
        }
    };

    const resetForgotPassword = async (userId, newPassword, otp) => {
        try {
            return await api.post('/auth/forgot-password/reset', { userId, newPassword, otp });
        } catch (err) {
            return { success: false, message: err.message || 'Reset failed' };
        }
    };

    return (
        <AuthContext.Provider value={{
            user, loading,
            login, logout, updateProfile, clearMustChangePassword,
            verifyNic, sendForgotPasswordOtp, verifyForgotPasswordOtp, resetForgotPassword
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
