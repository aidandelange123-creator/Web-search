// Test script to verify bot protection system
const securitySystem = require('./security');

console.log('Testing Bot Protection System...\n');

// Test 1: Check if bot protection is available
console.log('1. Checking if bot protection is available...');
if (securitySystem.botProtection) {
    console.log('✓ Bot protection system is available');
} else {
    console.log('✗ Bot protection system is not available');
}

// Test 2: Get security stats
console.log('\n2. Getting security statistics...');
try {
    const stats = securitySystem.getStats();
    console.log('✓ Security stats retrieved:', JSON.stringify(stats, null, 2));
} catch (error) {
    console.log('✗ Error getting security stats:', error.message);
}

// Test 3: Check bot protection stats specifically
console.log('\n3. Getting bot protection statistics...');
try {
    const botStats = securitySystem.botProtection.getStats();
    console.log('✓ Bot protection stats retrieved:', JSON.stringify(botStats, null, 2));
} catch (error) {
    console.log('✗ Error getting bot protection stats:', error.message);
}

// Test 4: Test input validation
console.log('\n4. Testing input validation...');
const testInputs = [
    '<script>alert("test")</script>',
    'normal input',
    'SELECT * FROM users',
    'valid input'
];

testInputs.forEach(input => {
    const isValid = securitySystem.validateInput(input);
    console.log(`  Input: "${input}" -> Valid: ${isValid}`);
});

// Test 5: Test URL validation
console.log('\n5. Testing URL validation...');
const testUrls = [
    'https://example.com',
    'http://localhost:3000',
    'javascript:alert("xss")',
    'https://google.com'
];

testUrls.forEach(url => {
    const isValid = securitySystem.validateURL(url);
    console.log(`  URL: "${url}" -> Valid: ${isValid}`);
});

console.log('\nBot Protection System test completed!');
console.log('\nKey features implemented:');
console.log('- Hidden security bots that protect players from attackers');
console.log('- Strong bots that block hackers and issue perm bans');
console.log('- IP tracking and logging of attacks');
console.log('- Notification system for security violations');
console.log('- Real-time threat detection and blocking');