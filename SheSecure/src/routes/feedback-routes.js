import axios from 'axios';
import { api } from "../config/config";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Get user's feedback
export const getUserFeedback = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`${api}/feedback/user`, config);
    return response.data;
  } catch (error) {
    throw error; // Re-throw the error for component-level handling
  }
};

// Submit feedback
export const submitFeedback = async (feedbackData, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(
      `${api}/feedback/submit-feedback`, 
      feedbackData, 
      config
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all feedbacks (top 6 highest rated)
export const getAllFeedbacks = async () => {
  try {
    const response = await axios.get(`${api}/feedback/get-feedback`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to load feedbacks');
    throw error;
  }
};

// Get average rating
export const getAverageRating = async () => {
  try {
    const response = await axios.get(`${api}/feedback/average`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to load rating data');
    throw error;
  }
};