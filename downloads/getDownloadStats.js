const Magzines = require('../models/magzinesSchema');
const Account = require('../models/accountCreate');

const getDownloadStats = async (req, res) => {
    try {
        const { adminUid } = req.body;

        if (!adminUid) {
            return res.status(400).json({ 
                success: false,
                message: 'Admin User ID (adminUid) is required' 
            });
        }

        // Verify admin authorization
        const admin = await Account.findOne({ uid: adminUid });
        if (!admin) {
            return res.status(404).json({ 
                success: false,
                message: 'Admin user not found' 
            });
        }

        if (admin.userType !== 'admin') {
            return res.status(403).json({ 
                success: false,
                message: 'You are not authorized to view download statistics' 
            });
        }

        // Get all magazines with download statistics
        const magazines = await Magzines.find({ isActive: true })
            .select('mid name type category downloads rating createdAt')
            .sort({ downloads: -1 });

        // Calculate total downloads
        const totalDownloads = magazines.reduce((sum, magazine) => sum + magazine.downloads, 0);

        // Calculate statistics by magazine type
        const freeMagazines = magazines.filter(mag => mag.type === 'free');
        const proMagazines = magazines.filter(mag => mag.type === 'pro');

        const freeDownloads = freeMagazines.reduce((sum, mag) => sum + mag.downloads, 0);
        const proDownloads = proMagazines.reduce((sum, mag) => sum + mag.downloads, 0);

        // Get top downloaded magazines
        const topDownloaded = magazines.slice(0, 10);

        // Calculate average downloads
        const avgDownloads = magazines.length > 0 ? totalDownloads / magazines.length : 0;

        // Prepare comprehensive statistics
        const downloadStats = {
            success: true,
            overallStats: {
                totalMagazines: magazines.length,
                totalDownloads: totalDownloads,
                averageDownloads: Math.round(avgDownloads * 100) / 100,
                freeMagazines: freeMagazines.length,
                proMagazines: proMagazines.length
            },
            typeStats: {
                free: {
                    count: freeMagazines.length,
                    totalDownloads: freeDownloads,
                    averageDownloads: freeMagazines.length > 0 ? Math.round(freeDownloads / freeMagazines.length * 100) / 100 : 0
                },
                pro: {
                    count: proMagazines.length,
                    totalDownloads: proDownloads,
                    averageDownloads: proMagazines.length > 0 ? Math.round(proDownloads / proMagazines.length * 100) / 100 : 0
                }
            },
            topDownloaded: topDownloaded.map(magazine => ({
                mid: magazine.mid,
                name: magazine.name,
                type: magazine.type,
                category: magazine.category,
                downloads: magazine.downloads,
                rating: magazine.rating,
                createdAt: magazine.createdAt
            })),
            categoryStats: magazines.reduce((acc, magazine) => {
                const category = magazine.category || 'other';
                if (!acc[category]) {
                    acc[category] = { count: 0, downloads: 0 };
                }
                acc[category].count++;
                acc[category].downloads += magazine.downloads;
                return acc;
            }, {}),
            recentActivity: magazines
                .filter(mag => mag.downloads > 0)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(magazine => ({
                    mid: magazine.mid,
                    name: magazine.name,
                    type: magazine.type,
                    downloads: magazine.downloads,
                    createdAt: magazine.createdAt
                }))
        };

        res.status(200).json(downloadStats);

    } catch (error) {
        console.error('Get Download Stats Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

module.exports = getDownloadStats; 