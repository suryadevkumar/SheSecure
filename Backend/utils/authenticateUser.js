import jwt from 'jsonwebtoken';

const authenticateUser = (req, res, next) => {
    // Try to get token from cookies, then from Authorization header
    const token = req.cookies?.token || req.headers['authorization']?.replace('Bearer ', '').trim();

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication failed, token missing.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach full user object to request
        req.user = {
            _id: decoded._id,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            userType: decoded.userType
        };
        
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token.' 
        });
    }
};

export default authenticateUser;