const Magzines = require('../models/magzinesSchema');

const getAllMagzines = async (req, res) => {
    try {
        const magzines = await Magzines.find();
        res.status(200).json({
            success: true,
            message: 'Magazines fetched successfully',
            data: magzines
        });
    } catch (error) {
        console.log('Error fetching magazines:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
}

module.exports = getAllMagzines;