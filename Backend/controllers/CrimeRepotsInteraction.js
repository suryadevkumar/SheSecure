import CrimeInteraction from '../models/CrimeInteraction.js';
import CrimeReport from '../models/CrimeReport.js';
import Comment from '../models/Comment.js';
import CrimeLike from '../models/CrimeLike.js';

// Fetch interactions for a specific crime
export const getCrimeInteractions = async (req, res) => {
    try {
        const { crimeId } = req.params;
        const userId = req.user?._id;

        // Get the crime report to access like counts
        const crimeReport = await CrimeReport.findById(crimeId);
        if (!crimeReport) {
            return res.status(404).json({ message: 'Crime report not found' });
        }

        // Get all interactions for this crime report with populated likes and comments
        const interactions = await CrimeInteraction.findOne({ crimeReport: crimeId })
            .populate({
                path: 'like'
            })
            .populate({
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'user',
                    select: 'firstName lastName additionalDetails',
                    populate: {
                        path: 'additionalDetails',
                        select: 'image'
                    }
                }
            });

        // Get user's like status if they're logged in
        let userLike = null;
        if (userId) {
            // Find if user has a like in the populated likes array
            if (interactions && interactions.like) {
                const userLikeObj = interactions.like.find(like => 
                    like.user && like.user._id.toString() === userId.toString()
                );
                userLike = userLikeObj ? userLikeObj.likeStatus : null;
            }
        }

        res.json({
            likeCount: crimeReport.likeCount,
            unlikeCount: crimeReport.unlikeCount,
            comments: interactions?.comments || [],
            userLike: userLike
        });
    } catch (error) {
        console.error('Error fetching crime interactions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add or update like/unlike status
export const interactWithCrime = async (req, res) => {
    try {
        const { crimeId } = req.params;
        const { likeStatus } = req.body; // This can be "Like", "Unlike", or null
        const userId = req.user._id;

        const crimeExists = await CrimeReport.exists({ _id: crimeId });
        if (!crimeExists) {
            return res.status(404).json({ message: 'Crime report not found' });
        }

        // Find or create crime interaction
        let crimeInteraction = await CrimeInteraction.findOne({ crimeReport: crimeId });
        
        if (!crimeInteraction) {
            crimeInteraction = new CrimeInteraction({
                crimeReport: crimeId,
                like: [],
                comments: []
            });
            await crimeInteraction.save();
        }

        // Find existing like for this user
        let existingLike = null;
        
        for (const likeId of crimeInteraction.like) {
            const like = await CrimeLike.findById(likeId);
            if (like && like.user.toString() === userId.toString()) {
                existingLike = like;
                break;
            }
        }

        const previousStatus = existingLike ? existingLike.likeStatus : null;

        let like;
        if (existingLike) {
            if (likeStatus === null) {
                // Remove the like completely
                await CrimeLike.findByIdAndDelete(existingLike._id);
                crimeInteraction.like = crimeInteraction.like.filter(
                    id => id.toString() !== existingLike._id.toString()
                );
                await crimeInteraction.save();
                like = null;
            } else {
                // Update existing like with the new status from frontend
                like = await CrimeLike.findByIdAndUpdate(
                    existingLike._id,
                    { likeStatus },
                    { new: true, runValidators: true }
                );
            }
        } else if (likeStatus !== null) {
            // Create new like only if status is not null
            like = new CrimeLike({
                user: userId,
                likeStatus
            });
            await like.save();
            
            // Add like reference to crime interaction
            crimeInteraction.like.push(like._id);
            await crimeInteraction.save();
        }

        // Update the like counts in the crime report
        const crimeReport = await CrimeReport.findById(crimeId);
        
        // Decrement previous status count only if it was set
        if (previousStatus === 'Like') {
            crimeReport.likeCount = Math.max(0, crimeReport.likeCount - 1);
        } else if (previousStatus === 'Unlike') {
            crimeReport.unlikeCount = Math.max(0, crimeReport.unlikeCount - 1);
        }
        
        // Increment new status count only if it's not null
        if (likeStatus === 'Like') {
            crimeReport.likeCount += 1;
        } else if (likeStatus === 'Unlike') {
            crimeReport.unlikeCount += 1;
        }
        
        await crimeReport.save();

        // Return the updated counts to frontend
        res.json({
            success: true,
            like: like?.likeStatus || null,
            likeCount: crimeReport.likeCount,
            unlikeCount: crimeReport.unlikeCount
        });
    } catch (error) {
        console.error('Error updating interaction:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// Add a comment to a crime report
export const commentOnCrime = async (req, res) => {
    try {
        const { crimeId } = req.params;
        const { comment } = req.body;
        const userId = req.user._id;

        if (!comment || comment.trim() === '') {
            return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
        }

        const crimeExists = await CrimeReport.exists({ _id: crimeId });
        if (!crimeExists) {
            return res.status(404).json({ success: false, message: 'Crime report not found' });
        }

        // Create new comment with user reference
        const newComment = new Comment({
            user: userId,
            text: comment.trim()
        });

        // Save the comment first
        await newComment.save();

        // Populate the user details after saving
        await newComment.populate({
            path: 'user',
            select: 'firstName lastName additionalDetails',
            populate: {
                path: 'additionalDetails',
                select: 'image'
            }
        });

        // Find or create crime interaction document
        let crimeInteraction = await CrimeInteraction.findOne({ 
            crimeReport: crimeId
        });

        if (!crimeInteraction) {
            crimeInteraction = new CrimeInteraction({
                crimeReport: crimeId,
                like: [],
                comments: []
            });
        }

        // Add comment reference to interaction
        crimeInteraction.comments.push(newComment._id);
        await crimeInteraction.save();

        // Return the populated comment directly to frontend
        res.json({
            success: true,
            comment: newComment
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: error.message 
        });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { crimeId, commentId } = req.params;
        const userId = req.user._id;

        // Check if the comment belongs to the user
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        // Find the interaction that contains this comment
        const interaction = await CrimeInteraction.findOne({
            crimeReport: crimeId,
            comments: commentId
        });

        if (!interaction) {
            return res.status(404).json({ message: 'Comment not found in interaction' });
        }

        // Remove comment from the interaction
        interaction.comments = interaction.comments.filter(
            comment => comment.toString() !== commentId
        );
        await interaction.save();

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};