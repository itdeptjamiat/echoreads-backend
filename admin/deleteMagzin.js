const Magzines = require('../models/magzinesSchema');
const Account = require('../models/accountCreate');

const deleteMagazin = async (req, res) => {
    try {
        const { mid, uid } = req.body;

        if (!mid) {
            return res.status(400).json({ message: 'Magazine ID (mid) is required' });
        }
        if (!uid) {
            return res.status(400).json({ message: 'User ID (uid) is required' });
        }

        const admin = await Account.findOne({ uid });
        if (!admin) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (admin.userType !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this magazine' });
        }

        const magazine = await Magzines.findOne({ mid });

        if (!magazine) {
            return res.status(404).json({ message: 'Magazine not found' });
        }

        await Magzines.deleteOne({ mid });

        return res.status(200).json({ message: 'Magazine deleted successfully' });
    } catch (error) {
        console.error('Delete Magazine Error:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = deleteMagazin;
