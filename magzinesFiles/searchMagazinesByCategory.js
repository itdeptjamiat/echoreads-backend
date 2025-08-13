const Magzines = require('../models/magzinesSchema');

const searchMagazinesByCategory = async (req, res) => {
    try {
        const { category } = req.body;

        // Validate category parameter
        if (!category || typeof category !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Category is required and must be a string'
            });
        }

        // Search magazines by category (case-insensitive)
        const magazines = await Magzines.find({
            category: { $regex: category, $options: 'i' },
            isActive: true // Only return active magazines
        }).select('-__v'); // Exclude version key

        if (magazines.length === 0) {
            return res.status(200).json({
                success: true,
                message: `No magazines found for category: ${category}`,
                data: [],
                count: 0
            });
        }

        res.status(200).json({
            success: true,
            message: `Magazines found for category: ${category}`,
            data: magazines,
            count: magazines.length
        });

    } catch (error) {
        console.log('Error searching magazines by category:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error while searching magazines' 
        });
    }
}

module.exports = searchMagazinesByCategory; 