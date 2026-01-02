// Firewall Security Layer
// Enhanced with bot protection integration

class Firewall {
    constructor() {
        this.rateLimits = new Map();
        this.ipWhitelist = new Set();
        this.ipBlacklist = new Set();
        this.strictMode = false;
        
        console.log('[FIREWALL] Firewall security layer initialized');
    }

    // Apply rate limiting to requests
    applyRateLimiting(req, res, next) {
        if (this.strictMode) {
            // In strict mode, apply more aggressive rate limiting
            return this.applyStrictRateLimiting(req, res, next);
        }

        const clientIP = this.getClientIP(req);
        const now = Date.now();
        const windowMs = 15 * 60 * 1000; // 15 minutes
        const maxRequests = 100; // Max requests per window

        if (!this.rateLimits.has(clientIP)) {
            this.rateLimits.set(clientIP, []);
        }

        const requests = this.rateLimits.get(clientIP);
        // Remove requests outside the window
        const validRequests = requests.filter(time => now - time < windowMs);
        validRequests.push(now);
        this.rateLimits.set(clientIP, validRequests);

        if (validRequests.length > maxRequests) {
            console.log(`[FIREWALL] Rate limit exceeded for IP: ${clientIP}`);
            return res.status(429).send('Too Many Requests');
        }

        next();
    }

    // Apply strict rate limiting (used during lockdown)
    applyStrictRateLimiting(req, res, next) {
        const clientIP = this.getClientIP(req);
        const now = Date.now();
        const windowMs = 60 * 1000; // 1 minute
        const maxRequests = 10; // Max requests per window in strict mode

        if (!this.rateLimits.has(clientIP)) {
            this.rateLimits.set(clientIP, []);
        }

        const requests = this.rateLimits.get(clientIP);
        // Remove requests outside the window
        const validRequests = requests.filter(time => now - time < windowMs);
        validRequests.push(now);
        this.rateLimits.set(clientIP, validRequests);

        if (validRequests.length > maxRequests) {
            console.log(`[FIREWALL] Strict rate limit exceeded for IP: ${clientIP}`);
            return res.status(429).send('Too Many Requests - Strict Mode Active');
        }

        next();
    }

    // Get client IP address (considering proxies)
    getClientIP(req) {
        return req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
               '127.0.0.1';
    }

    // Enforce strict mode (for emergency situations)
    enforceStrictMode() {
        this.strictMode = true;
        console.log('[FIREWALL] Strict mode activated');
    }

    // Add IP to whitelist
    addToWhitelist(ip) {
        this.ipWhitelist.add(ip);
        console.log(`[FIREWALL] Added IP to whitelist: ${ip}`);
    }

    // Add IP to blacklist
    addToBlacklist(ip) {
        this.ipBlacklist.add(ip);
        console.log(`[FIREWALL] Added IP to blacklist: ${ip}`);
    }

    // Check if IP is whitelisted
    isWhitelisted(ip) {
        return this.ipWhitelist.has(ip);
    }

    // Check if IP is blacklisted
    isBlacklisted(ip) {
        return this.ipBlacklist.has(ip);
    }
}

module.exports = new Firewall();