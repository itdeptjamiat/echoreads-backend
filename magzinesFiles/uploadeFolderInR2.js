const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Magzines = require('../models/magzinesSchema'); // Update to match schema export name

// ✅ Correct R2 S3 API endpoint (no bucket name in URL)
const s3 = new AWS.S3({
    endpoint: 'https://ef6de2d4389d2f6608f081f1c3405a28.r2.cloudflarestorage.com',
    accessKeyId: 'e680e4254dfba4e0bf0d481cd0c7c0bf',
    secretAccessKey: '51d24d04769e166ac11db7f81e56ba62207cf31b4b6634cce08027f22dc7d37e',
    region: 'auto',
    signatureVersion: 'v4',
});

// ✅ Multer configuration for handling multiple files in a folder
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit per file
    fileFilter: (req, file, cb) => {
        // Allow common file types for magazines/documents
        const allowedTypes = /pdf|jpeg|jpg|png|gif|webp|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf' || file.mimetype.includes('document');
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only document and image files are allowed'));
        }
    }
});

const uploadFolderToR2 = async (req, res) => {
    try {
        // Check if files are uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded. Please select files to upload.'
            });
        }

        // Get magazine ID from request body
        const { mid } = req.body;
        if (!mid) {
            return res.status(400).json({
                success: false,
                message: 'Magazine ID (mid) is required.'
            });
        }

        // Validate mid is a number
        const numericMid = Number(mid);
        if (isNaN(numericMid)) {
            return res.status(400).json({
                success: false,
                message: 'Magazine ID (mid) must be a number.'
            });
        }

        // Check if magazine exists
        const magazine = await Magzines.findOne({ mid: numericMid });
        if (!magazine) {
            return res.status(404).json({
                success: false,
                message: 'Magazine not found.'
            });
        }

        // Get folder name from request body or generate one
        const folderName = req.body.folderName || `magazine-${numericMid}-${uuidv4()}`;

        // Array to store uploaded file information
        const uploadedFiles = [];
        const uploadPromises = [];

        // Process each file
        for (const file of req.files) {
            // Create unique filename with folder structure
            const fileExtension = path.extname(file.originalname);
            const fileName = `magazines/${folderName}/${file.originalname.replace(fileExtension, '')}-${uuidv4()}${fileExtension}`;

            // Upload parameters
            const params = {
                Bucket: 'echoreads',
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
                ContentDisposition: 'inline',
            };

            // Create upload promise
            const uploadPromise = s3.upload(params).promise()
                .then((result) => {
                    // Generate public R2 URL
                    const publicUrl = `https://pub-b8050509235e4bcca261901d10608e30.r2.dev/${fileName}`;

                    uploadedFiles.push({
                        originalName: file.originalname,
                        fileName: fileName,
                        publicUrl: publicUrl,
                        size: file.size,
                        mimetype: file.mimetype
                    });
                })
                .catch((error) => {
                    throw new Error(`Failed to upload ${file.originalname}: ${error.message}`);
                });

            uploadPromises.push(uploadPromise);
        }

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        // Generate folder public URL (base path)
        const folderPublicUrl = `https://pub-b8050509235e4bcca261901d10608e30.r2.dev/magazines/${folderName}/`;

        // Update magazine with folder URL using the file field from schema
        magazine.file = folderPublicUrl; // Using existing 'file' field from schema
        await magazine.save();

        res.status(200).json({
            success: true,
            message: 'Folder uploaded successfully to R2 storage and magazine updated',
            data: {
                mid: numericMid,
                folderName: folderName,
                folderPublicUrl: folderPublicUrl,
                totalFiles: uploadedFiles.length,
                files: uploadedFiles
            }
        });

    } catch (error) {
        console.error("Error uploading folder to R2:", error);

        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'One or more files exceed the 1GB size limit'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error while uploading folder',
            error: error.message
        });
    }
};

module.exports = { uploadFolderToR2, upload };
