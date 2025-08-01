const Magzines = require('../models/magzinesSchema');

const deleteMagazin = async (req, res) => {
    try {
        const { mid } = req.body;

        if (!mid) {
            return res.status(400).json({ message: 'Magazine ID (mid) is required' });
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
