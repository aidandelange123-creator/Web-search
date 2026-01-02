# Advanced Bot Protection System

## Overview

This security system implements a multi-layered bot protection system with hidden security bots that protect players from attackers. The system features strong bots that block hackers, issue permanent bans, and send notifications to attackers about their violations.

## Bot Protection Features

### Hidden Security Bots
The system deploys 5 different types of hidden security bots across different layers of the application:

1. **Input Validation Bot** - Detects XSS, SQL injection, and malicious input patterns
2. **Rate Limiting Bot** - Prevents brute force and DoS attacks by monitoring request frequency
3. **URL Validation Bot** - Prevents SSRF and open redirect attacks
4. **File Access Bot** - Protects against path traversal and unauthorized file access
5. **Session Protection Bot** - Detects suspicious user agents and session hijacking attempts

### Protection Mechanisms

#### Real-time Threat Detection
- All requests are scanned by multiple security bots simultaneously
- Threats are identified using pattern matching and behavioral analysis
- Suspicious requests are immediately blocked

#### Permanent Banning System
- Threatening IPs are added to a permanent ban list
- Bans are stored persistently in `.banned_ips.txt`
- Permanently banned IPs are blocked from accessing the system

#### Attack Logging
- All detected attacks are logged with detailed information
- Logs include IP address, request details, and threat types
- Logs are stored in `.security_attack_log.txt`

#### Notification System
- When an IP is banned, a simulated notification email is generated
- Notifications include details about the violations detected
- In a production system, this would send actual emails to the abuse contact

## Installation

The bot protection system is automatically integrated with the main security system. To use it:

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

// Apply security middleware (includes bot protection)
app.use(securitySystem.getMiddleware());

// Your routes here
app.get('/', (req, res) => {
    res.send('Secure application with bot protection');
});
```

### Checking Security Status
```javascript
// Check security status including bot protection stats
const stats = securitySystem.getStats();
console.log(stats);
```

### Emergency Lockdown
```javascript
// Trigger emergency lockdown to ban all suspicious IPs
securitySystem.lockdown();
```

## Bot Protection Specific Functions

### Direct Bot Access
```javascript
// Access bot protection directly
const botProtection = securitySystem.botProtection;

// Get bot protection stats
const botStats = botProtection.getStats();

// Apply bot protection middleware directly
app.use(botProtection.getMiddleware());
```

## Protection Against Known Vulnerabilities

This system specifically addresses common vulnerabilities:

1. **XSS Vulnerabilities** - Input validation bot detects and blocks XSS attempts
2. **SSRF Vulnerabilities** - URL validation bot prevents internal network access
3. **Open Redirect Vulnerabilities** - URL validation bot blocks malicious redirects
4. **Path Traversal** - File access bot prevents directory traversal
5. **Rate Limiting** - Rate limiting bot prevents brute force attacks
6. **Session Management** - Session protection bot detects hijacking attempts

## Security Headers

The system automatically applies these security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Content-Security-Policy`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy`

## Monitoring and Logging

The system continuously monitors for threats and logs security events. The bot protection system maintains:
- Count of active security bots
- List of suspicious IP addresses
- Permanent ban list
- Detailed attack logs with timestamps and request details

## Emergency Features

- **Lockdown Mode**: `securitySystem.lockdown()` - Activates emergency security measures
- **Ban Management**: Automatic permanent banning of attacking IPs
- **Notification System**: Alert system for security violations