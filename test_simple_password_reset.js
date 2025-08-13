// Simple test for the easy password reset API
// This API is much simpler - just email and new password!

const axios = require('axios');

// Test the simple password reset API
async function testSimplePasswordReset() {
    try {
        console.log('🧪 Testing Simple Password Reset API...\n');
        
        const response = await axios.post('http://localhost:3000/api/v1/user/simple-password-reset', {
            email: 'user@example.com',        // Replace with actual email
            newPassword: 'newpassword123'     // Replace with desired password
        });

        console.log('✅ Success!');
        console.log('Status:', response.status);
        console.log('Message:', response.data.message);
        console.log('User:', response.data.data.username);
        
    } catch (error) {
        console.log('❌ Error occurred:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('Error:', error.message);
        }
    }
}

// Test with missing email
async function testMissingEmail() {
    try {
        console.log('\n🧪 Testing with missing email...');
        
        const response = await axios.post('http://localhost:3000/api/v1/user/simple-password-reset', {
            newPassword: 'newpassword123'
        });
        
    } catch (error) {
        if (error.response) {
            console.log('✅ Correctly caught error:');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        }
    }
}

// Test with short password
async function testShortPassword() {
    try {
        console.log('\n🧪 Testing with short password...');
        
        const response = await axios.post('http://localhost:3000/api/v1/user/simple-password-reset', {
            email: 'user@example.com',
            newPassword: '123'  // Too short
        });
        
    } catch (error) {
        if (error.response) {
            console.log('✅ Correctly caught error:');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        }
    }
}

// Run all tests
async function runAllTests() {
    await testSimplePasswordReset();
    await testMissingEmail();
    await testShortPassword();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📝 How to use the Simple Password Reset API:');
    console.log('POST /api/v1/user/simple-password-reset');
    console.log('Body: { "email": "user@email.com", "newPassword": "newpassword123" }');
    console.log('\n✨ That\'s it! No OTP, no tokens, no complex steps!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testSimplePasswordReset,
    testMissingEmail,
    testShortPassword,
    runAllTests
}; 