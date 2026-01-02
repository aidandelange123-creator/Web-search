// Main Security System Entry Point
// This is the primary interface for the 24/7 multi-layer security system

const mainSecurity = require('./.secure/.main_security');
const botProtection = require('./security/bot_protection');

// Export the main security system with bot protection
const securitySystem = { ...mainSecurity };

// Add bot protection functions to the main export
securitySystem.botProtection = botProtection;

// Also provide a setup function for easy integration
securitySystem.setup = function(app) {
    // Apply security middleware to the application
    app.use(mainSecurity.getMiddleware());
    
    console.log('[SECURITY] Security middleware applied to application');
    
    // Return the security system for additional configuration if needed
    return securitySystem;
};

// Function to get security statistics
securitySystem.getStats = function() {
    return mainSecurity.getSecurityStats();
};

// Function to enable security
securitySystem.enable = function() {
    mainSecurity.enableSecurity();
};

// Function to disable security (for maintenance)
securitySystem.disable = function() {
    mainSecurity.disableSecurity();
};

// Function to trigger emergency lockdown
securitySystem.lockdown = function() {
    mainSecurity.lockdown();
};

// Function to validate input using the security system
securitySystem.validateInput = function(input) {
    return mainSecurity.validator.validateInput(input);
};

// Function to validate URLs
securitySystem.validateURL = function(url) {
    return mainSecurity.validator.validateUrl(url);
};

// Function to sanitize input
securitySystem.sanitizeInput = function(input) {
    return mainSecurity.validator.sanitizeInput(input);
};

// Function to validate file paths
securitySystem.validatePath = function(filePath) {
    return mainSecurity.fileGuard.validatePath(filePath);
};

// Function to securely read files
securitySystem.secureReadFile = async function(filePath) {
    return await mainSecurity.fileGuard.secureReadFile(filePath);
};

// Function to securely write files
securitySystem.secureWriteFile = async function(filePath, data) {
    return await mainSecurity.fileGuard.secureWriteFile(filePath, data);
};

console.log('[SECURITY] Multi-layer security system with bot protection loaded and ready');

module.exports = securitySystem;