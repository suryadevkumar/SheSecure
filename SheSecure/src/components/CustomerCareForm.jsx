import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { submitCustomerCareRequest } from '../routes/signup-login-otp-routes';
import { useSelector } from 'react-redux';

const CustomerCareForm = () => {
  const token = useSelector((state)=>state.auth.token);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await submitCustomerCareRequest({
        subject: formData.subject,
        message: formData.message
      }, token);
      
      toast.success('Your request has been submitted successfully!');
      setFormData({
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] bg-gradient-to-br from-blue-50 to-indigo-50 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Customer Support</h2>
          <p className="text-sm text-gray-600 mx-auto">
            We're here to help! Please describe your issue and we'll get back to you soon.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="What's this about?"
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Be specific about your issue (max 100 characters)
                </p>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  id="message"
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 text-gray-700 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Please describe your issue in detail..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Include any relevant details to help us assist you better
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer ${
                    isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-8 py-6 text-center">
            <p className="text-sm text-gray-500">
              Need immediate help? <a href="tel:+916264572767" className="font-medium text-blue-600 hover:text-blue-700">Call our support team</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCareForm;