import jwt from 'jsonwebtoken';

const authenticateUser = (req, res, next) => {
    // Log the incoming request headers and cookies for debugging
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);

    const token = req.cookies?.token || req.headers['authorization']?.replace('Bearer ', '').trim();

    console.log('Token:', token); // Check if the token is being printed

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication failed, token missing.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

export default authenticateUser;