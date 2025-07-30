const Magzines = require('../models/magzinesSchema');

// create auto mid :
const createMid = async () => {
    try {
        const magzines = await Magzines.find({}); // Fetch all documents
        if (magzines.length === 0) {
            return 1;
        }
        // Find the maximum existing mid and increment it
        const maxMidDoc = await Magzines.findOne().sort({ mid: -1 }).limit(1);
        return maxMidDoc ? maxMidDoc.mid + 1 : 1;
    } catch (error) {
        console.error("Error generating MID:", error);
        throw new Error("Failed to generate magazine ID."); // Propagate error
    }
}

const createMagzine = async (req, res) => {
    try {
        // Validate input
        const { name, image, file, type } = req.body;
        if (!name || !image || !file || !type) {
            return res.status(400).json({ message: 'Missing required fields: name, image, file, or type.' });
        }

        // Validate that 'type' is either 'free' or 'pro'
        const allowedTypes = ['free', 'pro'];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ message: 'Invalid type. Type must be either "free" or "pro".' });
        }

        // Generate a new unique mid
        const newMid = await createMid();

        const magzine = new Magzines({ mid: newMid, name, image, file, type });
        await magzine.save();
        res.status(201).json({ message: 'Magzine created successfully', mid: newMid });

    } catch (error) {
        console.error("Error creating magzine:", error); // Use console.error for errors
        // Check for specific Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = createMagzine;