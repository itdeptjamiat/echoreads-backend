const Account = require('../models/accountCreate');

/**
 * Change user type (admin only)
 * Allows admins to promote users to admin or demote admins to user
 */
const changeUserType = async (req, res) => {
  try {
    const { userId, newUserType } = req.body;

    // Validate input
    if (!userId || !newUserType) {
      return res.status(400).json({
        success: false,
        message: 'User ID and new user type are required.'
      });
    }

    // Validate user type
    if (!['admin', 'user'].includes(newUserType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be either "admin" or "user".'
      });
    }

    // Find the user to be changed
    const targetUser = await Account.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Get the admin making the change
    const adminUser = req.user;

    // Prevent admin from changing their own type
    if (targetUser._id.toString() === adminUser._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own user type.'
      });
    }

    // Store the old user type for logging
    const oldUserType = targetUser.userType;

    // Update user type
    targetUser.userType = newUserType;
    await targetUser.save();

    // Send confirmation email to the user whose type was changed
    await sendUserTypeChangeNotification(targetUser.email, targetUser.username, newUserType, adminUser.username);

    return res.status(200).json({
      success: true,
      message: `User type changed successfully from ${oldUserType} to ${newUserType}.`,
      data: {
        userId: targetUser._id,
        username: targetUser.username,
        email: targetUser.email,
        oldUserType: oldUserType,
        newUserType: newUserType,
        changedBy: adminUser.username,
        changedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Change User Type Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later.'
    });
  }
};

/**
 * Send notification email when user type is changed
 */
async function sendUserTypeChangeNotification(email, username, newUserType, changedByAdmin) {
  try {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const isPromoted = newUserType === 'admin';
    const subject = isPromoted 
      ? '🎉 You have been promoted to Admin - EchoReads'
      : '📋 Your account type has been updated - EchoReads';

    const mailOptions = {
      from: `"EchoReads Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: `
        <div style="max-width:500px;margin:30px auto;padding:32px 24px;background:linear-gradient(135deg,${isPromoted ? '#f0fdf4 60%,#dcfce7 100%' : '#fef3c7 60%,#fde68a 100%'});border-radius:18px;box-shadow:0 4px 24px rgba(60,60,120,0.10);font-family:'Segoe UI',Arial,sans-serif;">
          <div style="text-align:center;">
            <img src="${isPromoted ? 'https://cdn-icons-png.flaticon.com/512/190/190411.png' : 'https://cdn-icons-png.flaticon.com/512/1828/1828640.png'}" alt="${isPromoted ? 'Promotion Icon' : 'Update Icon'}" width="64" style="margin-bottom:16px;" />
            <h2 style="color:${isPromoted ? '#166534' : '#92400e'};margin-bottom:8px;">
              ${isPromoted ? 'Congratulations! You are now an Admin' : 'Account Type Updated'}
            </h2>
            <p style="color:#475569;font-size:16px;margin-bottom:8px;">
              Hello <strong>${username}</strong>,<br>
              ${isPromoted 
                ? 'You have been promoted to Admin status by our system administrator.'
                : 'Your account type has been updated by our system administrator.'
              }
            </p>
            <div style="background:${isPromoted ? '#dcfce7' : '#fef3c7'};border:1px solid ${isPromoted ? '#16a34a' : '#f59e0b'};border-radius:8px;padding:12px;margin:16px 0;">
              <p style="color:${isPromoted ? '#166534' : '#92400e'};font-size:14px;margin:0;">
                <strong>New Role:</strong> ${newUserType.toUpperCase()}<br>
                <strong>Changed by:</strong> ${changedByAdmin}<br>
                <strong>Date:</strong> ${new Date().toLocaleDateString()}
              </p>
            </div>
            ${isPromoted ? `
            <div style="background:#dbeafe;border:1px solid #2563eb;border-radius:8px;padding:12px;margin:16px 0;">
              <p style="color:#1e40af;font-size:14px;margin:0;">
                <strong>Admin Privileges:</strong><br>
                • Manage all users and accounts<br>
                • Create and manage subscription plans<br>
                • Upload and manage magazines<br>
                • Access payment analytics<br>
                • Monitor system statistics
              </p>
            </div>
            ` : ''}
            <p style="color:#64748b;font-size:14px;margin-top:24px;">
              If you have any questions about your new role, please contact support.<br>
              <span style="font-size:12px;color:#a1a1aa;">&copy; ${new Date().getFullYear()} EchoReads. All rights reserved.</span>
            </p>
          </div>
        </div>
      `,
      text: `Hello ${username},\n\n${isPromoted 
        ? 'Congratulations! You have been promoted to Admin status by our system administrator.'
        : 'Your account type has been updated by our system administrator.'
      }\n\nNew Role: ${newUserType.toUpperCase()}\nChanged by: ${changedByAdmin}\nDate: ${new Date().toLocaleDateString()}\n\n${isPromoted ? 'As an admin, you now have access to manage users, plans, magazines, and system analytics.\n\n' : ''}If you have any questions about your new role, please contact support.\n\nBest regards,\nEchoReads Admin Team`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('User type change notification email error:', error);
    return false;
  }
}

/**
 * Get user types statistics (admin only)
 */
const getUserTypeStats = async (req, res) => {
  try {
    // Get count of users by type
    const userStats = await Account.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert to object format
    const stats = {
      admin: 0,
      user: 0,
      total: 0
    };

    userStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    return res.status(200).json({
      success: true,
      message: 'User type statistics retrieved successfully.',
      data: stats
    });

  } catch (error) {
    console.error('Get User Type Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later.'
    });
  }
};

module.exports = { changeUserType, getUserTypeStats }; 