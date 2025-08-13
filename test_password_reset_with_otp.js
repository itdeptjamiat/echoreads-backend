// Test file for password reset with OTP verification
// This demonstrates the 2-step password reset process

const axios = require('axios');

// Test Step 1: Request OTP
async function testRequestOtp() {
    try {
        console.log('🧪 Step 1: Requesting OTP for password reset...\n');
        
        const response = await axios.post('http://localhost:3000/api/v1/user/request-password-reset-otp', {
            email: 'user@example.com'  // Replace with actual email
        });

        console.log('✅ OTP Request Successful!');
        console.log('Status:', response.status);
        console.log('Message:', response.data.message);
        console.log('Expires in:', response.data.data.expiresIn);
        
        return true;
        
    } catch (error) {
        console.log('❌ OTP Request Failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('Error:', error.message);
        }
        return false;
    }
}

// Test Step 2: Reset password with OTP
async function testResetPasswordWithOtp(otp) {
    try {
        console.log('\n🧪 Step 2: Resetting password with OTP...\n');
        
        const response = await axios.post('http://localhost:3000/api/v1/user/reset-password-with-otp', {
            email: 'user@example.com',        // Replace with actual email
            otp: otp,                        // Use the OTP from step 1
            newPassword: 'newpassword123'    // Replace with desired password
        });

        console.log('✅ Password Reset Successful!');
        console.log('Status:', response.status);
        console.log('Message:', response.data.message);
        console.log('Username:', response.data.data.username);
        
        return true;
        
    } catch (error) {
        console.log('❌ Password Reset Failed:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        } else {
            console.log('Error:', error.message);
        }
        return false;
    }
}

// Test rate limiting
async function testRateLimiting() {
    try {
        console.log('\n🧪 Testing rate limiting (should fail on second request)...\n');
        
        // First request
        console.log('Making first OTP request...');
        await axios.post('http://localhost:3000/api/v1/user/request-password-reset-otp', {
            email: 'user@example.com'
        });
        
        // Second request (should fail due to rate limiting)
        console.log('Making second OTP request (should fail)...');
        await axios.post('http://localhost:3000/api/v1/user/request-password-reset-otp', {
            email: 'user@example.com'
        });
        
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log('✅ Rate limiting working correctly:');
            console.log('Message:', error.response.data.message);
        } else {
            console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
        }
    }
}

// Test with invalid OTP
async function testInvalidOtp() {
    try {
        console.log('\n🧪 Testing with invalid OTP...\n');
        
        const response = await axios.post('http://localhost:3000/api/v1/user/reset-password-with-otp', {
            email: 'user@example.com',
            otp: '000000',  // Invalid OTP
            newPassword: 'newpassword123'
        });
        
    } catch (error) {
        if (error.response) {
            console.log('✅ Correctly caught invalid OTP:');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        }
    }
}

// Test with missing fields
async function testMissingFields() {
    try {
        console.log('\n🧪 Testing with missing fields...\n');
        
        const response = await axios.post('http://localhost:3000/api/v1/user/reset-password-with-otp', {
            email: 'user@example.com'
            // Missing OTP and newPassword
        });
        
    } catch (error) {
        if (error.response) {
            console.log('✅ Correctly caught missing fields:');
            console.log('Status:', error.response.status);
            console.log('Message:', error.response.data.message);
        }
    }
}

// Main test function
async function runAllTests() {
    console.log('🚀 Testing Password Reset with OTP API\n');
    console.log('=====================================\n');
    
    // Test the complete flow
    const otpRequested = await testRequestOtp();
    
    if (otpRequested) {
        console.log('\n📧 Check your email for the OTP!');
        console.log('Then run the second test with the actual OTP.\n');
        
        // For testing purposes, you can manually enter the OTP here
        // const testOtp = '123456'; // Replace with actual OTP from email
        // await testResetPasswordWithOtp(testOtp);
    }
    
    // Test error cases
    await testRateLimiting();
    await testInvalidOtp();
    await testMissingFields();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📝 How to use the OTP-based Password Reset API:');
    console.log('\nStep 1: Request OTP');
    console.log('POST /api/v1/user/request-password-reset-otp');
    console.log('Body: { "email": "user@email.com" }');
    
    console.log('\nStep 2: Reset password with OTP');
    console.log('POST /api/v1/user/reset-password-with-otp');
    console.log('Body: { "email": "user@email.com", "otp": "123456", "newPassword": "newpass123" }');
    
    console.log('\n✨ Simple 2-step process with OTP verification!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    testRequestOtp,
    testResetPasswordWithOtp,
    testRateLimiting,
    testInvalidOtp,
    testMissingFields,
    runAllTests
}; 