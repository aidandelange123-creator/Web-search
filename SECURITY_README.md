# 24/7 Multi-Layer Security System

This security system provides comprehensive protection against various vulnerabilities including XSS, SSRF, open redirects, and more through multiple hidden security layers.

## Architecture

The security system consists of 5 hidden security layers:

1. **Input Validator** - Validates and sanitizes all inputs
2. **Firewall** - Handles rate limiting and IP blocking
3. **Intrusion Detection System** - Monitors for suspicious activity
4. **File System Guard** - Protects against file-based attacks
5. **Main Orchestrator** - Coordinates all security layers

## Security Features

- **XSS Protection**: Detects and blocks cross-site scripting attempts
- **SSRF Prevention**: Blocks server-side request forgery attacks
- **Open Redirect Prevention**: Prevents malicious redirects
- **Rate Limiting**: Prevents brute force and DoS attacks
- **File System Protection**: Prevents path traversal and unauthorized file access
- **IP Blocking**: Blocks malicious IP addresses
- **Security Headers**: Applies industry-standard security headers
- **Intrusion Detection**: Monitors and alerts on suspicious activity

## Installation

The security system is already integrated into the application. To use it:

```javascript
const securitySystem = require('./security');

// Apply to your Express app
securitySystem.setup(app);
```

## Usage

### Basic Setup
```javascript
const express = require('express');
const securitySystem = require('./security');

const app = express();

// Apply security middleware
app.use(securitySystem.getMiddleware());

// Your routes here
app.get('/', (req, res) => {
    res.send('Secure application');
});
```

### Manual Validation
```javascript
// Validate input
if (!securitySystem.validateInput(userInput)) {
    return res.status(400).send('Invalid input');
}

// Sanitize input
const safeInput = securitySystem.sanitizeInput(userInput);

// Validate URLs
if (!securitySystem.validateURL(redirectUrl)) {
    return res.status(400).send('Invalid URL');
}
```

### Security Status
```javascript
// Check security status
const stats = securitySystem.getStats();
console.log(stats);
```

## Hidden Security Files

The security system uses multiple hidden files for protection:
- `.secure/.main_security.js` - Main orchestrator
- `.secure/.layers/.hidden/.core/.validator.js` - Input validation
- `.secure/.layers/.hidden/.firewall.js` - Firewall functionality
- `.secure/.layers/.hidden/.ids.js` - Intrusion detection
- `.secure/.layers/.hidden/.filesystem_guard.js` - File system protection

## Emergency Features

- **Lockdown Mode**: `securitySystem.lockdown()` - Activates emergency security measures
- **Enable/Disable**: `securitySystem.enable()` / `securitySystem.disable()` - Control security system

## Protection Against Known Vulnerabilities

This system specifically addresses the vulnerabilities identified in the codebase:

1. **XSS Vulnerabilities**: All inputs are validated and sanitized
2. **SSRF Vulnerabilities**: URL validation prevents internal network access
3. **Open Redirect Vulnerabilities**: URL validation prevents malicious redirects
4. **Path Traversal**: File system guard prevents directory traversal
5. **Rate Limiting**: Prevents brute force attacks
6. **Session Management**: Secure session tokens with expiration

## Security Headers Applied

The system automatically applies these security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Content-Security-Policy`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy`

## Monitoring

The system continuously monitors for threats and logs security events to `.secure/.security_log.txt`.