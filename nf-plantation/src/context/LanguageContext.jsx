import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../constants/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('nf_language') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('nf_language', language);
    }, [language]);

    const t = (key) => {
        const keys = key.split('.');
        // Safely access translations for current language, fallback to 'en' if missing
        let value = translations[language] || translations['en'];

        for (const k of keys) {
            // Check if value exists and has the key
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Fallback to key if not found
            }
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
