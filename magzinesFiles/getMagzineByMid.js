const Magzines = require('../models/magzinesSchema');

const getMagzineByMid = async (req, res) => {
    try {
        const { mid } = req.params;
        
        // Validate that mid is provided and is a number
        if (!mid) {
            return res.status(400).json({ message: 'Magazine ID (mid) is required' });
        }
        
        const midNumber = parseInt(mid);
        if (isNaN(midNumber)) {
            return res.status(400).json({ message: 'Magazine ID must be a valid number' });
        }

        // Find magazine by mid
        const magzine = await Magzines.findOne({ mid: midNumber });
        
        if (!magzine) {
            return res.status(404).json({ message: 'Magazine not found' });
        }

        // Check if magazine is active
        if (!magzine.isActive) {
            return res.status(404).json({ message: 'Magazine is not available' });
        }

        res.status(200).json({
            success: true,
            message: 'Magazine fetched successfully',
            data: magzine
        });
        
    } catch (error) {
        console.error("Error fetching magazine by mid:", error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
}

module.exports = getMagzineByMid; 