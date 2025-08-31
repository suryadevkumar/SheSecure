import cloudinary from 'cloudinary';

// Initialize as v2 (your way also works)
const cloudinaryV2 = cloudinary.v2;

export const cloudinaryConnect = () => {
    try {
        cloudinaryV2.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
            secure: true // Always use HTTPS
        });
        console.log('Cloudinary connected successfully');
    } catch (error) {
        console.error('Cloudinary connection failed:', error);
        throw error;
    }
};