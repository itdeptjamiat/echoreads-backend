const Magzines = require('../models/magzinesSchema');

const getAllMagzines = async (req, res) => {
    try {
        const magzines = await Magzines.find();
        res.status(200).json(magzines);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = getAllMagzines;