const Magzines = require('../models/magzinesSchema');

const updateMagzin = async (req, res) => {
    try {
        const { mid, ...updateData } = req.body;

        if (!mid) {
            return res.status(400).json({ message: 'Magazine ID (mid) is required' });
        }

        const updatedMagazine = await Magzines.findOneAndUpdate(
            { mid },
            updateData,
            { new: true }
        );

        if (!updatedMagazine) {
            return res.status(404).json({ message: 'Magazine not found' });
        }

        res.status(200).json({
            message: 'Magazine updated successfully',
            magazine: updatedMagazine
        });
    } catch (error) {
        console.error('Update Magazine Error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = updateMagzin;
