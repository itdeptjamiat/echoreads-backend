const Account = require('../models/accountCreate');
const nodemailer = require('nodemailer');

/**
 * Change user type (admin only)
 */
const changeUserType = async (req, res) => {
  try {
    const { userId, newUserType, adminId } = req.body;

    if (!userId || !newUserType || !adminId) {
      return res.status(400).json({
        success: false,
        message: 'User ID, new user type, and admin ID are required.'
      });
    }
    
    if (!['admin', 'user'].includes(newUserType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be either "admin" or "user".'
      });
    }

    const [adminUser, targetUser] = await Promise.all([
      Account.findOne({ uid: adminId }),
      Account.findOne({ uid: userId })
    ]);

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found.'
      });
    }

    if (adminUser.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can change user types.'
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (targetUser.uid === adminUser.uid) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own user type.'
      });
    }

    if (targetUser.userType === 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change super_admin user types.'
      });
    }

    const oldUserType = targetUser.userType;
    targetUser.userType = newUserType;
    await targetUser.save();

    await sendUserTypeChangeNotification(targetUser.email, targetUser.username, newUserType, adminUser.username);

    return res.status(200).json({
      success: true,
      message: `User type changed from ${oldUserType} to ${newUserType}.`,
      data: {
        userId: targetUser.uid,
        username: targetUser.username,
        email: targetUser.email,
        oldUserType,
        newUserType,
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
 * Send notification email for user type change
 */
async function sendUserTypeChangeNotification(email, username, newUserType, changedByAdmin) {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const isPromoted = newUserType === 'admin';
    const subject = isPromoted 
      ? '🎉 Promoted to Admin - EchoReads'
      : '📋 Account Type Updated - EchoReads';

    const mailOptions = {
      from: `"EchoReads Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: `
        <div style="max-width:500px;margin:30px auto;padding:32px 24px;background:linear-gradient(135deg,${isPromoted ? '#f0fdf4 60%,#dcfce7 100%' : '#fef3c7 60%,#fde68a 100%'});border-radius:18px;box-shadow:0 4px 24px rgba(60,60,120,0.10);font-family:'Segoe UI',Arial,sans-serif;">
          <div style="text-align:center;">
            <h2 style="color:${isPromoted ? '#166534' : '#92400e'}">
              ${isPromoted ? 'Congratulations! You are now an Admin' : 'Account Type Updated'}
            </h2>
            <p style="color:#475569">
              Hello ${username},<br>
              ${isPromoted ? 'You have been promoted to Admin status.' : 'Your account type has been updated.'}
            </p>
            <div style="background:${isPromoted ? '#dcfce7' : '#fef3c7'};border:1px solid ${isPromoted ? '#16a34a' : '#f59e0b'};border-radius:8px;padding:12px;margin:16px 0;">
              <p style="color:${isPromoted ? '#166534' : '#92400e'}">
                New Role: ${newUserType.toUpperCase()}<br>
                Changed by: ${changedByAdmin}<br>
                Date: ${new Date().toLocaleDateString()}
              </p>
            </div>
            ${isPromoted ? `
            <div style="background:#dbeafe;border:1px solid #2563eb;border-radius:8px;padding:12px">
              <p style="color:#1e40af">
                <strong>Admin Privileges:</strong><br>
                • Manage users and accounts<br>
                • Manage subscription plans<br>
                • Upload and manage magazines<br>
                • Access analytics
              </p>
            </div>
            ` : ''}
          </div>
        </div>
      `,
      text: `Hello ${username},\n\n${isPromoted ? 'You have been promoted to Admin status.' : 'Your account type has been updated.'}\n\nNew Role: ${newUserType.toUpperCase()}\nChanged by: ${changedByAdmin}\nDate: ${new Date().toLocaleDateString()}\n\nBest regards,\nEchoReads Admin Team`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
}

/**
 * Get user type statistics (admin only)
 */
const getUserTypeStats = async (req, res) => {
  try {
    const userStats = await Account.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 }
        }
      }
    ]);

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
      message: 'User statistics retrieved successfully.',
      data: stats
    });

  } catch (error) {
    console.error('Get User Stats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error, please try again later.'
    });
  }
};

module.exports = { changeUserType, getUserTypeStats };