// Main Security System Entry Point
// This is the primary interface for the 24/7 multi-layer security system

const mainSecurity = require('./.secure/.main_security');

// Export the main security system
module.exports = mainSecurity;

// Also provide a setup function for easy integration
module.exports.setup = function(app) {
    // Apply security middleware to the application
    app.use(mainSecurity.getMiddleware());
    
    console.log('[SECURITY] Security middleware applied to application');
    
    // Return the security system for additional configuration if needed
    return mainSecurity;
};

// Function to get security statistics
module.exports.getStats = function() {
    return mainSecurity.getSecurityStats();
};

// Function to enable security
module.exports.enable = function() {
    mainSecurity.enableSecurity();
};

// Function to disable security (for maintenance)
module.exports.disable = function() {
    mainSecurity.disableSecurity();
};

// Function to trigger emergency lockdown
module.exports.lockdown = function() {
    mainSecurity.lockdown();
};

// Function to validate input using the security system
module.exports.validateInput = function(input) {
    return mainSecurity.validator.validateInput(input);
};

// Function to validate URLs
module.exports.validateURL = function(url) {
    return mainSecurity.validator.validateUrl(url);
};

// Function to sanitize input
module.exports.sanitizeInput = function(input) {
    return mainSecurity.validator.sanitizeInput(input);
};

// Function to validate file paths
module.exports.validatePath = function(filePath) {
    return mainSecurity.fileGuard.validatePath(filePath);
};

// Function to securely read files
module.exports.secureReadFile = async function(filePath) {
    return await mainSecurity.fileGuard.secureReadFile(filePath);
};

// Function to securely write files
module.exports.secureWriteFile = async function(filePath, data) {
    return await mainSecurity.fileGuard.secureWriteFile(filePath, data);
};

console.log('[SECURITY] Multi-layer security system loaded and ready');