import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 20000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('nf_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        const status  = error.response?.status;
        if (status === 401 && !error.config?.url?.includes('/auth/me')) {
            localStorage.removeItem('nf_token');
            window.location.href = '/company/nf-plantation/login';
        }
        return Promise.reject({ message, status, data: error.response?.data });
    }
);

// ── Request deduplication + short-lived cache for GET requests ──────────────
// Prevents duplicate concurrent calls and reduces server load for 5k users
const _cache   = new Map(); // key → { data, ts }
const _inFlight = new Map(); // key → Promise
const CACHE_TTL = 25_000; // 25 seconds for stable public data

function cachedGet(url, config = {}) {
    const key = url + '|' + JSON.stringify(config.params || {});
    const hit = _cache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL) return Promise.resolve(hit.data);
    if (_inFlight.has(key)) return _inFlight.get(key);
    const req = api.get(url, config)
        .then(data => { _cache.set(key, { data, ts: Date.now() }); _inFlight.delete(key); return data; })
        .catch(err => { _inFlight.delete(key); throw err; });
    _inFlight.set(key, req);
    return req;
}

/** Call this when data changes on the server so cache is invalidated */
export function invalidateCache(urlPattern) {
    for (const key of _cache.keys()) {
        if (key.includes(urlPattern)) _cache.delete(key);
    }
}

// ── Public Services ──────────────────────────────────────
export const PublicService = {
    getHeroSlides: ()     => cachedGet('/public/hero-slides'),
    getBranches:   ()     => cachedGet('/public/branches'),
    sendContact:   (data) => api.post('/public/contact', data),
    getStats:      ()     => cachedGet('/public/stats'),
    getSettings:   ()     => cachedGet('/public/settings'),
    getEvents:     ()     => cachedGet('/public/events'),
};

// ── Auth Services ────────────────────────────────────────
export const AuthService = {
    me:             ()                           => api.get('/auth/me'),
    login:          (data)                       => api.post('/auth/login', data),
    logout:         ()                           => api.post('/auth/logout'),
    register:       (data)                       => api.post('/auth/register', data),
    verifyNic:      (nic)                        => api.post('/auth/forgot-password/verify-nic', { nic }),
    sendOtp:        (userId, channel)            => api.post('/auth/forgot-password/send-otp', { userId, channel }),
    verifyOtp:      (userId, channel, otp)       => api.post('/auth/forgot-password/verify-otp', { userId, channel, otp }),
    resetPassword:  (userId, newPassword, otp)   => api.post('/auth/forgot-password/reset', { userId, newPassword, otp }),
};

// ── Customer Services ────────────────────────────────────
export const CustomerService = {
    getProfile:           ()           => api.get('/customer/profile'),
    updateProfile:        (data)       => api.put('/customer/profile', data),
    getPlans:             ()           => cachedGet('/customer/plans'),
    getMyInvestments:     ()           => api.get('/customer/my-investments'),
    activatePlan:         (planId, data) => api.post(`/customer/plans/${planId}/activate`, data),
    getWallet:            ()           => api.get('/customer/wallet'),
    getTransactions:      (params)     => api.get('/customer/transactions', { params }),
    addCash:              (data)       => api.post('/customer/wallet/deposit', data),
    withdraw:             (data)       => api.post('/customer/wallet/withdraw', data),
    getNotifications:     ()           => api.get('/customer/notifications'),
    markNotificationRead: (id)         => api.put(`/customer/notifications/${id}/read`),
    markAllRead:          ()           => api.put('/customer/notifications/read-all'),
    getCalendar:          (month, year) => api.get(`/customer/calendar?month=${month}&year=${year}`),
    getBranches:          ()           => cachedGet('/customer/branches'),
    submitSupport:        (data)       => api.post('/customer/support', data),
};

export default api;
