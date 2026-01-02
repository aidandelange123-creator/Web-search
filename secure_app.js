// Security Implementation Script
// This script demonstrates how to integrate the multi-layer security system with advanced bot protection into an application

const express = require('express');
const securitySystem = require('./security');

// Create an Express app (or you can use your existing app)
const app = express();

// Set up middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply the security system to the application (includes bot protection)
securitySystem.setup(app);

// Example secure route
app.get('/', (req, res) => {
    res.send('<h1>Secure Application with Bot Protection</h1><p>Your request has been processed through our multi-layer security system with advanced bot protection.</p>');
});

// Example route that handles user input securely
app.post('/user-data', (req, res) => {
    try {
        // The security system has already validated and sanitized the input
        const userData = req.body;
        
        // Additional validation can be done here if needed
        if (!securitySystem.validateInput(JSON.stringify(userData))) {
            return res.status(400).send('Invalid input detected');
        }
        
        res.json({ 
            status: 'success', 
            message: 'Data received securely', 
            receivedData: userData
        });
    } catch (error) {
        console.error('Error processing user data:', error);
        res.status(500).send('Internal server error');
    }
});

// Example file upload route with security
app.post('/upload', (req, res) => {
    // This would integrate with your file upload handling
    // The security system would validate the file before processing
    res.send('Upload endpoint with security validation');
});

// Endpoint to check security status
app.get('/security-status', (req, res) => {
    const stats = securitySystem.getStats();
    res.json(stats);
});

// Emergency lockdown endpoint (for admin use only, would require additional auth in production)
app.post('/lockdown', (req, res) => {
    securitySystem.lockdown();
    res.json({ message: 'Security lockdown initiated' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Secure application running on port ${PORT}`);
    console.log('Multi-layer security system with advanced bot protection is active and protecting this application');
    console.log('Hidden security bots are monitoring for threats...');
});

// Export the app in case it's used in another module
module.exports = app;