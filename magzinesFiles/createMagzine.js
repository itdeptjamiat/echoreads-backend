const Magzines = require('../models/magzinesSchema');

// create auto mid :
const createMid = async () => {
    try {
        let newMid;
        let isUnique = false;
        
        // Keep generating random 6-digit numbers until we find a unique one
        while (!isUnique) {
            newMid = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit random number
            
            // Check if this mid already exists
            const existingMagzine = await Magzines.findOne({ mid: newMid });
            if (!existingMagzine) {
                isUnique = true;
            }
        }
        
        return newMid;
    } catch (error) {
        console.error("Error generating MID:", error);
        throw new Error("Failed to generate magazine ID."); // Propagate error
    }
}

const createMagzine = async (req, res) => {
    try {
        // Validate input
        const { 
            name, 
            image, 
            file, 
            type, 
            fileType = 'pdf', 
            magzineType = 'magzine',
            category = 'other', 
            description = '' ,
            audioFile = ''
        } = req.body;
        
        if (!name || !image || !file || !type) {
            return res.status(400).json({ message: 'Missing required fields: name, image, file, or type.' });
        }

        // Validate that 'type' is either 'free' or 'pro'
        const allowedTypes = ['free', 'pro'];
        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ message: 'Invalid type. Type must be either "free" or "pro".' });
        }

        // Validate that 'magzineType' is one of the allowed values
        const allowedMagzineTypes = ['magzine', 'article', 'digest'];
        if (!allowedMagzineTypes.includes(magzineType)) {
            return res.status(400).json({ 
                message: 'Invalid magzineType. Must be one of: "magzine", "article", "digest".' 
            });
        }

        // Generate a new unique 6-digit random mid
        const newMid = await createMid();

        // Create new magazine with all fields from schema
        const magzine = new Magzines({
            mid: newMid,
            name,
            image,
            file,
            type,
            fileType,
            magzineType,
            category,
            description,
            isActive: true,
            downloads: 0,
            rating: 0,
            reviews: [],
            createdAt: new Date(),
            audioFile
        });

        await magzine.save();
        res.status(201).json({ 
            message: 'Magazine created successfully', 
            magazine: magzine 
        });

    } catch (error) {
        console.error("Error creating magazine:", error);
        // Check for specific Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = createMagzine;