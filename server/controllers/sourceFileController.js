import OutReach from '../models/Outreach.js';

export const getUniqueSourceFiles = async (req, res) => {
    try {
        // Using MongoDB aggregation to get unique sourceFiles with their campaign names
        const sourceFilesWithCampaigns = await OutReach.aggregate([
            // Match only documents with non-null sourceFile
            {
                $match: {
                    sourceFile: { 
                        $exists: true, 
                        $ne: null,
                        $ne: '' 
                    }
                }
            },
            // Lookup campaign information
            {
                $lookup: {
                    from: 'campaigns',
                    localField: 'campaign',
                    foreignField: '_id',
                    as: 'campaignInfo'
                }
            },
            // Unwind the campaign array (created by lookup)
            {
                $unwind: '$campaignInfo'
            },
            // Group by sourceFile and campaign
            {
                $group: {
                    _id: '$sourceFile',
                    campaignName: { $first: '$campaignInfo.campaignName' },
                    campaignId: { $first: '$campaignInfo._id' },
                    count: { $sum: 1 }  // Count records per source file
                }
            },
            // Project the final shape of the documents
            {
                $project: {
                    _id: 0,
                    sourceFile: '$_id',
                    campaignName: 1,
                    campaignId: 1,
                    count: 1
                }
            },
            // Sort by sourceFile
            {
                $sort: { 
                    sourceFile: 1 
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            count: sourceFilesWithCampaigns.length,
            data: sourceFilesWithCampaigns
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching source files',
            error: error.message
        });
    }
}
