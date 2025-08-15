const Account = require('../models/accountCreate');
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ✅ Correct R2 S3 API endpoint (no bucket name in URL)
const s3 = new AWS.S3({
    endpoint: 'https://ef6de2d4389d2f6608f081f1c3405a28.r2.cloudflarestorage.com',
    accessKeyId: 'e680e4254dfba4e0bf0d481cd0c7c0bf',
    secretAccessKey: '51d24d04769e166ac11db7f81e56ba62207cf31b4b6634cce08027f22dc7d37e',
    region: 'auto',
    signatureVersion: 'v4',
});

// ✅ Multer in-memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

const updateUserProfilePic = async (req, res) => {
    try {
        // ✅ Allow uid from JWT, URL param, or form-data for Postman testing
        const uid = req.user?.uid || req.params.uid || req.body.uid;

        if (!uid) {
            return res.status(400).json({ success: false, message: 'User ID (uid) is required' });
        }

        const numericUid = Number(uid);
        if (isNaN(numericUid)) {
            return res.status(400).json({ success: false, message: 'User ID (uid) must be a number' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Profile image is required' });
        }

        if (req.file.size > 5 * 1024 * 1024) {
            return res.status(400).json({ success: false, message: 'Image size must be less than 5MB' });
        }

        // ✅ Find user
        const user = await Account.findOne({ uid: numericUid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // ✅ Create unique filename
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `profile-pics/${numericUid}-${uuidv4()}${fileExtension}`;

        // ✅ Upload to Cloudflare R2
        const params = {
            Bucket: 'echoreads',
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            ContentDisposition: 'inline',
        };

        await s3.upload(params).promise();

        // ✅ Generate public R2 URL
        const publicUrl = `https://pub-b8050509235e4bcca261901d10608e30.r2.dev/${fileName}`;

        // ✅ Save to DB
        user.profilePic = publicUrl;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            data: { profilePic: publicUrl }
        });

    } catch (error) {
        console.error("Error updating profile picture:", error);

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Image size must be less than 5MB'
            });
        }

        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { updateUserProfilePic, upload };
