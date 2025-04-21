import Feedback from "../models/Feedback.js";

// Submit feedback
export const submitFeedback = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const userId = req.user._id;

    const feedback = new Feedback({
      userId,
      rating,
      review
    });

    await feedback.save();
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Check if user has submitted feedback
export const getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ userId: req.user._id });
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all feedbacks
export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate({
        path: 'userId',
        select: 'firstName lastName additionalDetails',
        populate: {
          path: 'additionalDetails',
          model: 'Profile',
        }
      })
      .sort({ rating: -1 }) // Sort by rating in descending order
      .limit(6); // Limit to maximum 6 feedbacks

    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get average rating
export const getAverageRating = async (req, res) => {
  try {
    const result = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    const average = result.length > 0 ? result[0].averageRating : 0;
    res.status(200).json({
      success: true,
      data: {
        averageRating: parseFloat(average.toFixed(1)),
        totalReviews: result.length > 0 ? result[0].count : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};