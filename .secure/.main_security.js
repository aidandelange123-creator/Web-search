// Main Security Orchestrator
// Coordinates all security layers including the new bot protection system

const validator = require('./.layers/.hidden/.core/.validator');
const firewall = require('./.layers/.hidden/.firewall');
const ids = require('./.layers/.hidden/.ids');
const fileGuard = require('./.layers/.hidden/.filesystem_guard');
const botProtection = require('../security/bot_protection');

class MainSecuritySystem {
    constructor() {
        this.validator = validator;
        this.firewall = firewall;
        this.ids = ids;
        this.fileGuard = fileGuard;
        this.botProtection = botProtection;
        this.securityEnabled = true;
        this.securityStats = {
            requestsProcessed: 0,
            threatsDetected: 0,
            requestsBlocked: 0,
            activeBots: 0
        };
        
        console.log('[MAIN-SECURITY] Security orchestrator initialized');
        console.log('[MAIN-SECURITY] All security layers connected');
    }

    // Get middleware that combines all security layers
    getMiddleware() {
        return (req, res, next) => {
            if (!this.securityEnabled) {
                return next();
            }

            // Update stats
            this.securityStats.requestsProcessed++;

            // Apply bot protection first (highest level of security)
            this.botProtection.getMiddleware()(req, res, (err) => {
                if (err) {
                    this.securityStats.requestsBlocked++;
                    return next(err);
                }

                // Apply other security layers
                this.firewall.applyRateLimiting(req, res, () => {
                    this.ids.monitorActivity(req, res, () => {
                        next();
                    });
                });
            });
        };
    }

    // Enable security system
    enableSecurity() {
        this.securityEnabled = true;
        console.log('[MAIN-SECURITY] Security system enabled');
    }

    // Disable security system (for maintenance)
    disableSecurity() {
        this.securityEnabled = false;
        console.log('[MAIN-SECURITY] Security system disabled');
    }

    // Emergency lockdown
    lockdown() {
        console.log('[MAIN-SECURITY] Emergency lockdown initiated');
        this.botProtection.lockdown();
        this.firewall.enforceStrictMode();
        this.ids.activateAlertMode();
    }

    // Get security statistics
    getSecurityStats() {
        const botStats = this.botProtection.getStats();
        return {
            ...this.securityStats,
            ...botStats,
            systemStatus: this.securityEnabled ? 'ACTIVE' : 'DISABLED',
            timestamp: new Date().toISOString()
        };
    }

    // Validate input using the security system
    validateInput(input) {
        return this.validator.validateInput(input);
    }

    // Validate URL
    validateUrl(url) {
        return this.validator.validateUrl(url);
    }

    // Sanitize input
    sanitizeInput(input) {
        return this.validator.sanitizeInput(input);
    }

    // Validate file path
    validatePath(filePath) {
        return this.fileGuard.validatePath(filePath);
    }

    // Securely read file
    async secureReadFile(filePath) {
        return await this.fileGuard.secureReadFile(filePath);
    }

    // Securely write file
    async secureWriteFile(filePath, data) {
        return await this.fileGuard.secureWriteFile(filePath, data);
    }
}

// Create and export the main security system instance
const mainSecuritySystem = new MainSecuritySystem();

module.exports = mainSecuritySystem;