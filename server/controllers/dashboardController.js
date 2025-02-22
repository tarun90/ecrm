import Campaign from '../models/Campaign.js';
import OutReach from '../models/OutReach.js';
import Note from '../models/Note.js';

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

        // Get total campaigns count
        const totalCampaigns = await Campaign.countDocuments();

        // Get count of unique sourceFiles (CSV uploads)
        const csvUploads = await OutReach.distinct('sourceFile').then(files => 
            files.filter(file => file).length
        );

        // Get total outreach records
        const totalOutreach = await OutReach.countDocuments();

        // Get total touches (notes)
        const totalTouches = await Note.countDocuments();

        // Get number of campaigns which has outreach notes in last 7 days
        const activeCampaigns = await Note.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $lookup: {
                    from: 'outreaches',
                    localField: 'outreachId',
                    foreignField: '_id',
                    as: 'outreach'
                }
            },
            {
                $unwind: '$outreach'
            },
            {
                $group: {
                    _id: '$outreach.campaign'
                }
            },
            {
                $lookup: {
                    from: 'campaigns',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'campaign'
                }
            },
            {
                $count: 'count'
            }
        ]).then(result => result[0]?.count || 0);

        // Get unique outreach touches in last 7 days
        const uniqueTouchesLast7Days = await Note.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: '$outreachId'
                }
            },
            {
                $count: 'count'
            }
        ]).then(result => result[0]?.count || 0);

        // Get total touches in last 7 days
        const totalTouchesLast7Days = await Note.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Return all stats
        res.status(200).json({
            success: true,
            data: {
                totalCampaigns,
                csvUploads,
                totalOutreach,
                totalTouches,
                activeCampaigns,
                uniqueTouchesLast7Days,
                totalTouchesLast7Days
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

