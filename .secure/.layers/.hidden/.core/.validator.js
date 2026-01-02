// Input Validator Security Layer
// Enhanced with bot protection integration

const url = require('url');
const path = require('path');

class InputValidator {
    constructor() {
        console.log('[VALIDATOR] Input validation layer initialized');
    }

    // Validate input for malicious content
    validateInput(input) {
        if (typeof input !== 'string' && typeof input !== 'object') {
            return false;
        }

        const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
        
        // Check for XSS patterns
        const xssPatterns = [
            /<script/i,
            /javascript:/i,
            /vbscript:/i,
            /on\w+\s*=/i,
            /<iframe/i,
            /<object/i,
            /<embed/i,
            /eval\(/i,
            /expression\(/i
        ];

        for (const pattern of xssPatterns) {
            if (pattern.test(inputStr)) {
                console.log('[VALIDATOR] XSS attempt detected');
                return false;
            }
        }

        // Check for SQL injection patterns
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
            /(\b(OR|AND)\s+[\w\s='"]+\s*=\s*[\w\s='"]+\s*(--|#|\/\*|\*\/))/i,
            /(['"])\s*(--|#|\/\*|\*\/)/i
        ];

        for (const pattern of sqlPatterns) {
            if (pattern.test(inputStr)) {
                console.log('[VALIDATOR] SQL injection attempt detected');
                return false;
            }
        }

        return true;
    }

    // Validate URL for SSRF and open redirect protection
    validateUrl(inputUrl) {
        if (typeof inputUrl !== 'string') {
            return false;
        }

        try {
            const parsedUrl = new url.URL(inputUrl);
            
            // Check for internal IP addresses (SSRF protection)
            const hostname = parsedUrl.hostname;
            const internalPatterns = [
                /^localhost$/i,
                /^127\.0\.0\.1$/,
                /^10\.\d+\.\d+\.\d+$/,
                /^172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+$/,
                /^192\.168\.\d+\.\d+$/,
                /^169\.254\.\d+\.\d+$/,
                /^::1$/,
                /^fe80::/
            ];

            for (const pattern of internalPatterns) {
                if (pattern.test(hostname)) {
                    console.log('[VALIDATOR] SSRF attempt detected');
                    return false;
                }
            }

            // Additional checks for open redirects
            if (inputUrl.includes('..') || inputUrl.includes('://')) {
                // More specific validation would go here
            }

            return true;
        } catch (error) {
            console.log('[VALIDATOR] Invalid URL format');
            return false;
        }
    }

    // Sanitize input by removing potentially dangerous content
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }

        // Remove potentially dangerous characters/patterns
        let sanitized = input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/eval\(/gi, '')
            .replace(/expression\(/gi, '');

        return sanitized;
    }
}

module.exports = new InputValidator();