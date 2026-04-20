const Idempotency = require('../models/Idempotency');

/**
 * Ensures a request is processed at most once using an Idempotency-Key.
 * @param {Object} options Configuration (e.g., expiry period)
 */
exports.requireIdempotency = (options = { expiresIn: 24 * 60 * 60 * 1000 }) => {
    return async (req, res, next) => {
        const key = req.headers['idempotency-key'] || (req.body && req.body.idempotencyKey);
        
        if (!key) return next(); // Opt-in by default if not strictly required

        try {
            const existing = await Idempotency.findOne({ key });
            if (existing) {
                console.log(`[IDEMPOTENCY] Cache HIT for key: ${key}`);
                return res.status(existing.status || 200).json(existing.response);
            }

            // Capture the response function to cache the result
            const originalJson = res.json;
            res.json = function (data) {
                // Cache the response asynchronously
                Idempotency.create({
                    key,
                    response: data,
                    status: res.statusCode,
                    expiresAt: new Date(Date.now() + options.expiresIn)
                }).catch(err => console.error('[IDEMPOTENCY] Cache SAVE FAILED:', err));

                return originalJson.call(this, data);
            };

            next();
        } catch (error) {
            next(error);
        }
    };
};
