import CrimeInteraction from '../models/CrimeInteraction.js';
import CrimeReport from '../models/CrimeReport.js';
import Comment from '../models/Comment.js';

// Fetch support/unsupport counts for all crime reports
export const getCrimeStats = async (req, res) => {
    try {
        const stats = await CrimeInteraction.aggregate([
            {
                $group: {
                    _id: "$crimeReport",
                    supports: {
                        $sum: { $cond: [{ $eq: ["$supportStatus", "Support"] }, 1, 0] }
                    },
                    unsupports: {
                        $sum: { $cond: [{ $eq: ["$supportStatus", "Unsupport"] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    crimeId: "$_id",
                    supports: 1,
                    unsupports: 1,
                    _id: 0
                }
            }
        ]);

        res.json(stats);
    } catch (error) {
        console.error('Error fetching crime stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch interactions for a specific crime
export const getCrimeInteractions = async (req, res) => {
    try {
        const { crimeId } = req.params;
        const userId = req.user?._id;

        // Get all interactions for this crime report
        const interactions = await CrimeInteraction.find({ crimeReport: crimeId })
            .populate({
                path: 'user',
                select: 'firstName lastName additionalDetails',
                populate: {
                    path: 'additionalDetails',
                    select: 'image'
                }
            })
            .sort({ createdAt: -1 });

        // Count all supports and unsupports
        const supports = interactions.filter(int => int.supportStatus === 'Support').length;
        const unsupports = interactions.filter(int => int.supportStatus === 'Unsupport').length;

        // Get all comments for this crime report
        const comments = await Comment.find({ crimeReport: crimeId })
            .populate({
                path: 'user',
                select: 'firstName lastName additionalDetails',
                populate: {
                    path: 'additionalDetails',
                    select: 'image'
                }
            })
            .sort({ createdAt: -1 });

        // Get user's interaction if they're logged in
        let userInteraction = null;
        if (userId) {
            userInteraction = await CrimeInteraction.findOne({
                crimeReport: crimeId,
                user: userId
            });
        }

        res.json({
            supports,
            unsupports,
            comments,
            userInteraction
        });
    } catch (error) {
        console.error('Error fetching crime interactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add or update support/unsupport status
export const interactWithCrime = async (req, res) => {
    try {
        const { crimeId } = req.params;
        const { supportStatus } = req.body;
        const userId = req.user._id;

        const crimeExists = await CrimeReport.exists({ _id: crimeId });
        if (!crimeExists) {
            return res.status(404).json({ message: 'Crime report not found' });
        }

        // Find or create the user's interaction record
        let interaction = await CrimeInteraction.findOneAndUpdate(
            { crimeReport: crimeId, user: userId },
            { supportStatus, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        res.json(interaction);
    } catch (error) {
        console.error('Error updating interaction:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add a comment to a crime report
export const commentOnCrime = async (req, res) => {
    try {
        const { crimeId } = req.params;
        const { comment } = req.body;
        const userId = req.user._id;

        if (!comment || comment.trim() === '') {
            return res.status(400).json({ message: 'Comment cannot be empty' });
        }

        const crimeExists = await CrimeReport.exists({ _id: crimeId });
        if (!crimeExists) {
            return res.status(404).json({ message: 'Crime report not found' });
        }

        // Find or create user's interaction document
        let interaction = await CrimeInteraction.findOne({ 
            crimeReport: crimeId, 
            user: userId 
        });

        if (!interaction) {
            interaction = new CrimeInteraction({
                crimeReport: crimeId,
                user: userId,
                supportStatus: null
            });
        }

        // Create new comment
        const newComment = new Comment({
            text: comment.trim(),
            user: userId,
            crimeReport: crimeId
        });
        await newComment.save();

        // Add comment reference to interaction
        interaction.comments.push(newComment._id);
        await interaction.save();

        // Populate and return the new comment with user details
        const populatedComment = await Comment.findById(newComment._id)
            .populate({
                path: 'user',
                select: 'firstName lastName additionalDetails',
                populate: {
                    path: 'additionalDetails',
                    select: 'image'
                }
            });

        res.json(populatedComment);

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};