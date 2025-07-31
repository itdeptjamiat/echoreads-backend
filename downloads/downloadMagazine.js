const Magzines = require('../models/magzinesSchema');
const Account = require('../models/accountCreate');

const downloadMagazine = async (req, res) => {
    try {
        const { mid, uid } = req.body;

        // Validate required parameters
        if (!mid) {
            return res.status(400).json({ 
                success: false,
                message: 'Magazine ID (mid) is required' 
            });
        }
        if (!uid) {
            return res.status(400).json({ 
                success: false,
                message: 'User ID (uid) is required' 
            });
        }

        // Check if user exists
        const user = await Account.findOne({ uid });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Check if magazine exists
        const magazine = await Magzines.findOne({ mid });
        if (!magazine) {
            return res.status(404).json({ 
                success: false,
                message: 'Magazine not found' 
            });
        }

        // Check if magazine is active
        if (!magazine.isActive) {
            return res.status(403).json({ 
                success: false,
                message: 'This magazine is not available for download' 
            });
        }

        // Access control based on magazine type and user plan
        const userPlan = user.plan;
        const magazineType = magazine.type;

        // Free magazines - accessible to all users
        if (magazineType === 'free') {
            // Allow download for all users
        } 
        // Pro magazines - only accessible to pro users, pro+ users, and admins
        else if (magazineType === 'pro') {
            if (userPlan === 'free' && user.userType !== 'admin') {
                return res.status(403).json({ 
                    success: false,
                    message: 'This magazine requires a pro subscription. Please upgrade your plan to access this content.',
                    requiredPlan: 'echopro'
                });
            }
        }

        // Check if user's plan is still active (for paid plans)
        if (userPlan !== 'free' && user.planExpiry) {
            const currentDate = new Date();
            if (currentDate > user.planExpiry) {
                return res.status(403).json({ 
                    success: false,
                    message: 'Your subscription has expired. Please renew your plan to continue downloading.',
                    expired: true
                });
            }
        }

        // Increment download count
        await Magzines.findOneAndUpdate(
            { mid },
            { $inc: { downloads: 1 } }
        );

        // Prepare download response
        const downloadData = {
            success: true,
            message: 'Download link generated successfully',
            magazine: {
                mid: magazine.mid,
                name: magazine.name,
                file: magazine.file,
                fileType: magazine.fileType,
                type: magazine.type,
                category: magazine.category
            },
            user: {
                uid: user.uid,
                username: user.username,
                plan: user.plan,
                userType: user.userType
            },
            downloadTime: new Date()
        };

        res.status(200).json(downloadData);

    } catch (error) {
        console.error('Download Magazine Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

module.exports = downloadMagazine; 