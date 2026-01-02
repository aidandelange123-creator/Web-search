// Intrusion Detection System (IDS) Security Layer
// Enhanced with bot protection integration

class IntrusionDetectionSystem {
    constructor() {
        this.alertMode = false;
        this.suspiciousActivities = [];
        this.activityLog = [];
        this.patterns = {
            bruteForce: { attempts: 0, window: 300000 }, // 5 minutes
            sqlInjection: 0,
            xssAttempt: 0,
            pathTraversal: 0
        };
        
        console.log('[IDS] Intrusion Detection System initialized');
    }

    // Monitor activity for suspicious patterns
    monitorActivity(req, res, next) {
        const activity = {
            timestamp: new Date().toISOString(),
            ip: this.getClientIP(req),
            method: req.method,
            url: req.url,
            userAgent: req.headers['user-agent'],
            suspicious: false
        };

        // Check for suspicious patterns
        const isSuspicious = this.checkForSuspiciousPatterns(req, activity);
        
        if (isSuspicious) {
            activity.suspicious = true;
            this.suspiciousActivities.push(activity);
            
            console.log(`[IDS] Suspicious activity detected from IP: ${activity.ip}`);
            
            // In alert mode, block suspicious requests
            if (this.alertMode) {
                console.log(`[IDS] Blocking suspicious request from IP: ${activity.ip}`);
                return res.status(403).send('Request blocked by security system');
            }
        }

        this.activityLog.push(activity);
        
        // Keep logs at a reasonable size
        if (this.activityLog.length > 1000) {
            this.activityLog = this.activityLog.slice(-500);
        }

        next();
    }

    // Check request for suspicious patterns
    checkForSuspiciousPatterns(req, activity) {
        const url = req.url || '';
        const body = JSON.stringify(req.body || {});
        const userAgent = req.headers['user-agent'] || '';

        // Check for SQL injection patterns
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
            /(\b(OR|AND)\s+[\w\s='"]+\s*=\s*[\w\s='"]+\s*(--|#|\/\*|\*\/))/i,
            /(['"])\s*(--|#|\/\*|\*\/)/i
        ];

        for (const pattern of sqlPatterns) {
            if (pattern.test(url) || pattern.test(body)) {
                console.log('[IDS] SQL injection attempt detected');
                return true;
            }
        }

        // Check for XSS patterns
        const xssPatterns = [
            /<script/i,
            /javascript:/i,
            /vbscript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /eval\(/i
        ];

        for (const pattern of xssPatterns) {
            if (pattern.test(url) || pattern.test(body)) {
                console.log('[IDS] XSS attempt detected');
                return true;
            }
        }

        // Check for path traversal
        const pathTraversalPatterns = [
            /\.\.\/|\.\.\\/g,
            /%2e%2e%2f|%2e%2e%5c/gi,
            /\/etc\/passwd/gi,
            /\/windows\/system32/gi
        ];

        for (const pattern of pathTraversalPatterns) {
            if (pattern.test(url) || pattern.test(body)) {
                console.log('[IDS] Path traversal attempt detected');
                return true;
            }
        }

        // Check for suspicious user agents
        const suspiciousUAs = [
            /python-requests/i,
            /curl/i,
            /wget/i,
            /httpclient/i,
            /bot/i,
            /crawler/i,
            /spider/i
        ];

        for (const ua of suspiciousUAs) {
            if (ua.test(userAgent)) {
                console.log('[IDS] Suspicious user agent detected');
                return true;
            }
        }

        return false;
    }

    // Activate alert mode (for emergency situations)
    activateAlertMode() {
        this.alertMode = true;
        console.log('[IDS] Alert mode activated - blocking suspicious requests');
    }

    // Deactivate alert mode
    deactivateAlertMode() {
        this.alertMode = false;
        console.log('[IDS] Alert mode deactivated');
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

    // Get security statistics
    getStats() {
        return {
            totalActivities: this.activityLog.length,
            suspiciousActivities: this.suspiciousActivities.length,
            alertMode: this.alertMode,
            lastSuspicious: this.suspiciousActivities[this.suspiciousActivities.length - 1] || null
        };
    }
}

module.exports = new IntrusionDetectionSystem();