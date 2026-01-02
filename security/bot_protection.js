// Advanced Bot Protection System
// Hidden security bots that protect players from attackers
// Strong bots that block hackers and issue perm bans with IP tracking

const fs = require('fs');
const path = require('path');

class BotProtectionSystem {
    constructor() {
        this.activeBots = [];
        this.suspiciousIPs = new Set();
        this.permBannedIPs = new Set();
        this.attackLog = [];
        this.transporter = null;
        
        // Initialize the bot protection system
        this.initializeBots();
        this.setupEmailTransporter();
        this.loadBannedIPs();
        
        console.log('[BOT-PROTECTION] Advanced bot protection system initialized');
        console.log('[BOT-PROTECTION] Hidden security bots deployed across the system');
    }

    // Initialize various security bots in hidden locations
    initializeBots() {
        // Hidden bot 1: Input validation bot
        this.activeBots.push({
            id: 'input-validator-bot-7839',
            type: 'input-validation',
            location: 'hidden-validator-layer',
            active: true,
            detect: (req) => {
                // Check for malicious input patterns
                const maliciousPatterns = [
                    /<script/i,
                    /javascript:/i,
                    /vbscript:/i,
                    /on\w+\s*=/i,
                    /<iframe/i,
                    /eval\(/i,
                    /document\.cookie/i,
                    /\.\.\/|~\//i  // Path traversal
                ];
                
                const body = JSON.stringify(req.body || {});
                const query = JSON.stringify(req.query || {});
                const params = JSON.stringify(req.params || {});
                
                for (const pattern of maliciousPatterns) {
                    if (pattern.test(body) || pattern.test(query) || pattern.test(params)) {
                        return true;
                    }
                }
                return false;
            }
        });

        // Hidden bot 2: Rate limiting bot
        this.activeBots.push({
            id: 'rate-limiter-bot-2468',
            type: 'rate-limiting',
            location: 'hidden-firewall-layer',
            active: true,
            requestCounts: new Map(),
            detect: (req) => {
                const ip = this.getClientIP(req);
                const now = Date.now();
                const windowMs = 60000; // 1 minute window
                const maxRequests = 50; // Max requests per window
                
                if (!this.requestCounts.has(ip)) {
                    this.requestCounts.set(ip, []);
                }
                
                const requests = this.requestCounts.get(ip);
                // Remove requests outside the window
                const validRequests = requests.filter(time => now - time < windowMs);
                validRequests.push(now);
                this.requestCounts.set(ip, validRequests);
                
                return validRequests.length > maxRequests;
            }
        });

        // Hidden bot 3: URL validation bot
        this.activeBots.push({
            id: 'url-validator-bot-1357',
            type: 'url-validation',
            location: 'hidden-url-layer',
            active: true,
            detect: (req) => {
                // Check for SSRF and open redirect attempts
                const url = req.query.redirect || req.body.redirect || req.headers['referer'];
                
                if (url) {
                    // Check for internal IP addresses or localhost
                    const internalPatterns = [
                        /^https?:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)/i,
                        /^https?:\/\/[^\/]*@/i, // Check for credentials in URL
                        /169\.254\.\d+\.\d+/i, // Link-local addresses
                        /::1|fe80::/i // IPv6 local addresses
                    ];
                    
                    for (const pattern of internalPatterns) {
                        if (pattern.test(url)) {
                            return true;
                        }
                    }
                }
                return false;
            }
        });

        // Hidden bot 4: File access bot
        this.activeBots.push({
            id: 'file-guard-bot-9753',
            type: 'file-access',
            location: 'hidden-file-layer',
            active: true,
            detect: (req) => {
                // Check for path traversal attempts
                const dangerousPatterns = [
                    /\.\.\/|\.\.\\/g,
                    /%2e%2e%2f|%2e%2e%5c/gi, // URL encoded traversal
                    /0x2e0x2e0x2f/gi, // Hex encoded
                    /\/etc\/passwd/gi,
                    /\/windows\/system32/gi,
                    /c:\/windows/gi
                ];
                
                const url = req.url || '';
                const body = JSON.stringify(req.body || {});
                
                for (const pattern of dangerousPatterns) {
                    if (pattern.test(url) || pattern.test(body)) {
                        return true;
                    }
                }
                return false;
            }
        });

        // Hidden bot 5: Session hijacking bot
        this.activeBots.push({
            id: 'session-guard-bot-8642',
            type: 'session-protection',
            location: 'hidden-session-layer',
            active: true,
            detect: (req) => {
                // Check for suspicious session behavior
                const userAgent = req.headers['user-agent'] || '';
                const accept = req.headers['accept'] || '';
                
                // Suspicious user agents
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
                        return true;
                    }
                }
                
                // Suspicious accept headers (often missing in automated attacks)
                if (!accept.includes('text/html') && !accept.includes('*/*')) {
                    return true;
                }
                
                return false;
            }
        });

        console.log(`[BOT-PROTECTION] Deployed ${this.activeBots.length} hidden security bots`);
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

    // Setup email transporter for notifications
    setupEmailTransporter() {
        // In a real system, you'd configure with actual email credentials
        // For this example, we'll simulate the functionality
        this.transporter = {
            sendMail: (options) => {
                console.log(`[EMAIL-NOTIFICATION] Would send email to: ${options.to}`);
                console.log(`[EMAIL-NOTIFICATION] Subject: ${options.subject}`);
                console.log(`[EMAIL-NOTIFICATION] Message: ${options.text}`);
                // In a real implementation, you would send the actual email here
                return Promise.resolve({ messageId: 'simulated-message-id' });
            }
        };
    }

    // Main protection middleware
    getMiddleware() {
        return (req, res, next) => {
            // Check if IP is already permanently banned
            const clientIP = this.getClientIP(req);
            
            if (this.permBannedIPs.has(clientIP)) {
                console.log(`[BOT-PROTECTION] Blocked permanently banned IP: ${clientIP}`);
                return res.status(403).send('Access denied - permanently banned');
            }

            // Run all active bots to check for threats
            const threats = [];
            
            for (const bot of this.activeBots) {
                if (bot.active && bot.detect(req)) {
                    threats.push(bot.id);
                    console.log(`[BOT-PROTECTION] Bot ${bot.id} detected threat from IP: ${clientIP}`);
                }
            }

            if (threats.length > 0) {
                // Log the attack
                this.logAttack(clientIP, req, threats);
                
                // Add to suspicious IPs
                this.suspiciousIPs.add(clientIP);
                
                // Issue permanent ban
                this.issuePermBan(clientIP, req, threats);
                
                // Block the request
                console.log(`[BOT-PROTECTION] Blocking malicious request from: ${clientIP}`);
                return res.status(403).send('Request blocked by security system');
            }

            // Continue to next middleware if no threats detected
            next();
        };
    }

    // Log attack details
    logAttack(ip, req, threats) {
        const attackRecord = {
            timestamp: new Date().toISOString(),
            ip: ip,
            method: req.method,
            url: req.url,
            userAgent: req.headers['user-agent'],
            threats: threats,
            body: req.body ? JSON.stringify(req.body).substring(0, 200) : null
        };
        
        this.attackLog.push(attackRecord);
        console.log(`[ATTACK-LOG] Attack detected and logged from IP: ${ip}`);
        
        // Save to file for persistent logging
        try {
            const logPath = path.join(__dirname, '../.security_attack_log.txt');
            fs.appendFileSync(logPath, JSON.stringify(attackRecord) + '\n');
        } catch (error) {
            console.error('[ATTACK-LOG] Failed to save attack log:', error);
        }
    }

    // Issue permanent ban and send notification email
    async issuePermBan(ip, req, threats) {
        // Add to permanent ban list
        this.permBannedIPs.add(ip);
        this.saveBannedIPs();
        
        console.log(`[BAN-SYSTEM] Permanently banned IP: ${ip}`);
        
        // Send notification email to the IP (simulated)
        try {
            if (this.transporter) {
                const emailContent = `
ATTENTION: SECURITY VIOLATION DETECTED

Your IP address (${ip}) has been permanently banned from accessing our services due to suspicious activity detected by our security system.

Violations detected:
${threats.map(threat => `- ${threat}`).join('\n')}

If you believe this is an error, please contact our security team.
If this is intentional malicious activity, we may involve law enforcement with the technical evidence we have collected.

Request details:
- Method: ${req.method}
- URL: ${req.url}
- Timestamp: ${new Date().toISOString()}
- User Agent: ${req.headers['user-agent'] || 'Unknown'}

Do not attempt to circumvent this ban as additional measures will be taken.
                `;
                
                await this.transporter.sendMail({
                    from: '"Security System" <security@protected-app.com>',
                    to: 'abuse@' + this.extractDomainFromIP(ip), // Simulated email
                    subject: 'URGENT: Permanent Ban - Security Violation',
                    text: emailContent
                });
                
                console.log(`[EMAIL-NOTIFICATION] Ban notification sent for IP: ${ip}`);
            }
        } catch (error) {
            console.error('[EMAIL-NOTIFICATION] Failed to send ban notification:', error);
        }
    }

    // Extract domain from IP for simulated email (in real system would be different)
    extractDomainFromIP(ip) {
        // This is a simulation - in reality, you wouldn't email IPs directly
        return 'example.com';
    }

    // Load previously banned IPs from file
    loadBannedIPs() {
        try {
            const banFilePath = path.join(__dirname, '../.banned_ips.txt');
            if (fs.existsSync(banFilePath)) {
                const content = fs.readFileSync(banFilePath, 'utf8');
                const ips = content.split('\n').filter(ip => ip.trim() !== '');
                ips.forEach(ip => this.permBannedIPs.add(ip.trim()));
                console.log(`[BAN-SYSTEM] Loaded ${this.permBannedIPs.size} banned IPs from file`);
            }
        } catch (error) {
            console.error('[BAN-SYSTEM] Failed to load banned IPs:', error);
        }
    }

    // Save banned IPs to file
    saveBannedIPs() {
        try {
            const banFilePath = path.join(__dirname, '../.banned_ips.txt');
            const ipList = Array.from(this.permBannedIPs).join('\n');
            fs.writeFileSync(banFilePath, ipList);
        } catch (error) {
            console.error('[BAN-SYSTEM] Failed to save banned IPs:', error);
        }
    }

    // Get security statistics
    getStats() {
        return {
            activeBots: this.activeBots.length,
            suspiciousIPs: this.suspiciousIPs.size,
            permBannedIPs: this.permBannedIPs.size,
            totalAttacksDetected: this.attackLog.length,
            botStatus: this.activeBots.map(bot => ({
                id: bot.id,
                type: bot.type,
                active: bot.active
            }))
        };
    }

    // Emergency lockdown - ban all suspicious IPs
    lockdown() {
        console.log('[SECURITY] Emergency lockdown initiated');
        for (const ip of this.suspiciousIPs) {
            this.permBannedIPs.add(ip);
        }
        this.saveBannedIPs();
        console.log(`[SECURITY] ${this.suspiciousIPs.size} IPs added to permanent ban list during lockdown`);
    }

    // Get the middleware function
    getProtectionMiddleware() {
        return this.getMiddleware();
    }
}

// Export a singleton instance
const botProtectionSystem = new BotProtectionSystem();
module.exports = botProtectionSystem;