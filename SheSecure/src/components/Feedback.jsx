import { useState, useEffect } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { getUserFeedback, submitFeedback } from '../routes/feedback-routes';

const Feedback = () => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state)=>state.auth.token);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [userFeedback, setUserFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({ rating: false, review: false });

  useEffect(() => {
    const fetchUserFeedback = async () => {
      try {
        if (token) {
          const { data } = await getUserFeedback(token);
          if (data) {
            setUserFeedback(data);
          }
        }
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to fetch feedback');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFeedback();
  }, [user]);

  const validateForm = () => {
    const newErrors = {
      rating: rating === 0,
      review: review.trim() === ''
    };
    setErrors(newErrors);
    return !newErrors.rating && !newErrors.review;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please provide both rating and review');
      return;
    }

    try {
      const { data } = await submitFeedback(
        { rating, review },
        token
      );
      setUserFeedback(data);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit feedback');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (userFeedback) {
    return (
      <div className="my-45 max-w-md mx-4 sm:mx-auto bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl shadow-lg overflow-hidden p-6 border-2 border-green-100">
        <div className="flex items-center gap-2 text-green-600 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-bold text-green-800">Your Feedback</h2>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${i < userFeedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="ml-2 text-gray-700 font-medium">{userFeedback.rating}/5</span>
          </div>
          <div className="mt-4 bg-white/80 p-4 rounded-lg border border-green-100">
            <p className="text-gray-700">"{userFeedback.review}"</p>
          </div>
          <p className="text-sm text-green-600 mt-3 font-medium">
            Submitted on {new Date(userFeedback.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-4 sm:mx-auto bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden p-6 my-12 border-2 border-blue-100">
      <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Share Your Experience
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="block text-blue-700 mb-2 font-bold">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className={`flex items-center gap-1 bg-white/80 p-3 rounded-xl border-2 ${errors.rating ? 'border-red-300' : 'border-blue-200'}`}>
            {[...Array(5)].map((_, i) => {
              const ratingValue = i + 1;
              return (
                <button
                  type="button"
                  key={i}
                  className={`w-10 h-10 transition-all transform hover:scale-110 ${ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => {
                    setRating(ratingValue);
                    setErrors({...errors, rating: false});
                  }}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                >
                  <Star
                    className={`w-full h-full ${ratingValue <= (hover || rating) ? 'fill-current drop-shadow-lg' : ''}`}
                  />
                </button>
              );
            })}
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-500">Please select a rating</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="review" className="block text-blue-700 mb-2 font-bold">
            Your Review <span className="text-red-500">*</span>
          </label>
          <textarea
            id="review"
            rows="5"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 bg-white/80 transition-all ${
              errors.review 
                ? 'border-red-300 focus:ring-red-200' 
                : 'border-blue-200 focus:ring-purple-300 focus:border-transparent'
            }`}
            value={review}
            onChange={(e) => {
              setReview(e.target.value);
              setErrors({...errors, review: false});
            }}
            maxLength="200"
            placeholder="Tell us about your experience in detail..."
            required
          ></textarea>
          <div className="flex justify-between mt-1">
            {errors.review && (
              <p className="text-sm text-red-500">Please write your review</p>
            )}
            <p className={`text-xs ml-auto ${review.length === 200 ? 'text-red-500' : 'text-blue-500'} font-medium`}>
              {review.length}/200 characters
            </p>
          </div>
        </div>
        
        <button
          type="submit"
          className={`w-full py-3 px-6 rounded-xl font-bold transition-all bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer`}
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default Feedback;