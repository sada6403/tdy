const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    res.status(404);
    next(error);
};

const MAX_LOG_BYTES = 5 * 1024 * 1024; // 5 MB max, then rotate

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

    // Write error to rotating log file (max 5 MB before truncation)
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '../../latest_error.log');
    try {
        const entry = `\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n${err.stack}\n`;
        const stat = fs.existsSync(logPath) ? fs.statSync(logPath) : null;
        if (stat && stat.size > MAX_LOG_BYTES) {
            fs.writeFileSync(logPath, entry); // rotate: truncate and start fresh
        } else {
            fs.appendFileSync(logPath, entry);
        }
    } catch (e) {}

    if (statusCode >= 500 || err.name === 'ReferenceError') {
        console.error(`[CRITICAL ERROR] ${req.method} ${req.originalUrl}:`, err);
        console.error('Stack:', err.stack);
    }
    res.status(statusCode).json({
        success: false,
        message: err.message,
        data: null,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { notFound, errorHandler };
