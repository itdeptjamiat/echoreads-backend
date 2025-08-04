/**
 * Test script for the new set-new-password-after-otp API
 * This demonstrates the complete password reset flow
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Adjust to your server URL

async function testPasswordResetFlow() {
  try {
    console.log('🧪 Testing Password Reset Flow with New API');
    console.log('==========================================\n');

    // Step 1: Request password reset OTP
    console.log('1️⃣ Requesting password reset OTP...');
    const resetResponse = await axios.post(`${BASE_URL}/api/v1/user/request-password-reset`, {
      email: 'test@example.com'
    });
    console.log('✅ OTP sent successfully');
    console.log('Response:', resetResponse.data);
    console.log('');

    // Step 2: Verify OTP (this would normally be done by user entering OTP)
    console.log('2️⃣ Verifying OTP...');
    const verifyResponse = await axios.post(`${BASE_URL}/api/v1/user/verify-otp`, {
      email: 'test@example.com',
      otp: '123456' // This would be the actual OTP sent to email
    });
    console.log('✅ OTP verified successfully');
    console.log('Response:', verifyResponse.data);
    console.log('');

    // Step 3: Set new password using the new API
    console.log('3️⃣ Setting new password after OTP verification...');
    const newPasswordResponse = await axios.post(`${BASE_URL}/api/v1/user/set-new-password-after-otp`, {
      email: 'test@example.com',
      otp: '123456', // Same OTP used for verification
      newPassword: 'NewSecurePass123!',
      confirmPassword: 'NewSecurePass123!'
    });
    console.log('✅ Password changed successfully');
    console.log('Response:', newPasswordResponse.data);
    console.log('');

    console.log('🎉 Password reset flow completed successfully!');
    console.log('');
    console.log('📋 API Endpoints Used:');
    console.log('   - POST /api/v1/user/request-password-reset');
    console.log('   - POST /api/v1/user/verify-otp');
    console.log('   - POST /api/v1/user/set-new-password-after-otp');
    console.log('');
    console.log('🔄 Alternative Flow (using reset token):');
    console.log('   - POST /api/v1/user/request-password-reset');
    console.log('   - POST /api/v1/user/verify-otp (returns reset token)');
    console.log('   - POST /api/v1/user/reset-password (uses reset token)');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Example usage of the new API
async function exampleUsage() {
  console.log('📝 Example Usage of New API');
  console.log('============================\n');

  const exampleRequest = {
    email: 'user@example.com',
    otp: '123456',
    newPassword: 'MyNewSecurePassword123!',
    confirmPassword: 'MyNewSecurePassword123!'
  };

  console.log('Request Body:');
  console.log(JSON.stringify(exampleRequest, null, 2));
  console.log('');

  console.log('Expected Response:');
  const expectedResponse = {
    success: true,
    message: 'Password changed successfully. You can now login with your new password.',
    data: {
      email: 'user@example.com',
      username: 'username'
    }
  };
  console.log(JSON.stringify(expectedResponse, null, 2));
  console.log('');

  console.log('🔒 Password Requirements:');
  console.log('   - At least 8 characters long');
  console.log('   - Contains at least one uppercase letter');
  console.log('   - Contains at least one lowercase letter');
  console.log('   - Contains at least one number');
  console.log('   - Contains at least one special character');
  console.log('   - Passwords must match');
}

// Run the test
if (require.main === module) {
  // Uncomment the line below to run the actual test
  // testPasswordResetFlow();
  
  // Show example usage
  exampleUsage();
}

module.exports = { testPasswordResetFlow, exampleUsage }; 