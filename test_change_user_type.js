/**
 * Test script for the new admin change user type API
 * This demonstrates how admins can promote users to admin or demote admins to user
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000'; // Adjust to your server URL
const ADMIN_TOKEN = 'your_admin_jwt_token_here'; // Replace with actual admin token

async function testChangeUserType() {
  try {
    console.log('🧪 Testing Admin Change User Type API');
    console.log('=====================================\n');

    // Example 1: Promote a user to admin
    console.log('1️⃣ Promoting a user to admin...');
    const promoteResponse = await axios.put(`${BASE_URL}/api/v1/admin/change-user-type`, {
      userId: '507f1f77bcf86cd799439011', // Replace with actual user ID
      newUserType: 'admin'
    }, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ User promoted to admin successfully');
    console.log('Response:', promoteResponse.data);
    console.log('');

    // Example 2: Demote an admin to user
    console.log('2️⃣ Demoting an admin to user...');
    const demoteResponse = await axios.put(`${BASE_URL}/api/v1/admin/change-user-type`, {
      userId: '507f1f77bcf86cd799439012', // Replace with actual admin ID
      newUserType: 'user'
    }, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Admin demoted to user successfully');
    console.log('Response:', demoteResponse.data);
    console.log('');

    // Example 3: Get user type statistics
    console.log('3️⃣ Getting user type statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/api/v1/admin/user-type-stats`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    console.log('✅ User type statistics retrieved');
    console.log('Response:', statsResponse.data);
    console.log('');

    console.log('🎉 All admin user type operations completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Example usage and documentation
function showExampleUsage() {
  console.log('📝 Admin Change User Type API Examples');
  console.log('======================================\n');

  console.log('🔐 Authentication Required:');
  console.log('   - Must be logged in as admin');
  console.log('   - Include JWT token in Authorization header');
  console.log('   - Token must have admin privileges');
  console.log('');

  console.log('📋 API Endpoints:');
  console.log('   1. PUT /api/v1/admin/change-user-type');
  console.log('   2. GET /api/v1/admin/user-type-stats');
  console.log('');

  console.log('🔄 Change User Type Request:');
  const changeUserTypeRequest = {
    userId: '507f1f77bcf86cd799439011',
    newUserType: 'admin' // or 'user'
  };
  console.log(JSON.stringify(changeUserTypeRequest, null, 2));
  console.log('');

  console.log('✅ Expected Response:');
  const expectedResponse = {
    success: true,
    message: 'User type changed successfully from user to admin.',
    data: {
      userId: '507f1f77bcf86cd799439011',
      username: 'john_doe',
      email: 'john@example.com',
      oldUserType: 'user',
      newUserType: 'admin',
      changedBy: 'admin_user',
      changedAt: '2024-01-01T00:00:00.000Z'
    }
  };
  console.log(JSON.stringify(expectedResponse, null, 2));
  console.log('');

  console.log('📊 User Type Statistics Response:');
  const statsResponse = {
    success: true,
    message: 'User type statistics retrieved successfully.',
    data: {
      admin: 3,
      user: 150,
      total: 153
    }
  };
  console.log(JSON.stringify(statsResponse, null, 2));
  console.log('');

  console.log('🔒 Security Features:');
  console.log('   - Only admins can change user types');
  console.log('   - Admins cannot change their own type');
  console.log('   - Email notification sent to user');
  console.log('   - Audit trail with changedBy and changedAt');
  console.log('');

  console.log('📧 Email Notifications:');
  console.log('   - Promotion: Congratulations email with admin privileges');
  console.log('   - Demotion: Account type update notification');
  console.log('   - Includes changed by admin and date');
  console.log('');

  console.log('❌ Error Cases:');
  console.log('   - Invalid user ID: 404 User not found');
  console.log('   - Invalid user type: 400 Invalid user type');
  console.log('   - Self-change attempt: 400 Cannot change own type');
  console.log('   - Unauthorized: 403 Access denied');
  console.log('   - Invalid token: 401 Invalid or expired token');
}

// Run the test
if (require.main === module) {
  // Uncomment the line below to run the actual test
  // testChangeUserType();
  
  // Show example usage
  showExampleUsage();
}

module.exports = { testChangeUserType, showExampleUsage }; 