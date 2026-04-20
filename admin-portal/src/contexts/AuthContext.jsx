import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        setLoading(true);
        try {
            const response = await authService.getMe();
            if (response.success) {
                setUser(response.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth context check failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.error("Logout error", err);
        }
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, checkAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
