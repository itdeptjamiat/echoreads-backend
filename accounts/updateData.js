const User = require('../models/accountCreate');

const updateDate = async (req, res) => {
    try {
        const { email, ...updateData } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = updateDate;
