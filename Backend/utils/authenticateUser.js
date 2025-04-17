import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
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
            _id: decoded.id,
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

// Middleware to check if the user is an Admin
export const isAdmin = async (req, res, next) => {
    try {
        if (req.user.userType !== "Admin" ) {
            return res.status(403).json({success:false, message: "Access Denied. Admins only." });
        }
        next();
    } catch (error) {
        res.status(500).json({ success:false, message: "Authorization error." });
    }
};

// Middleware to check if the user is a regular User
export const isUser = async (req, res, next) => {
    try {
        if (req.user.userType !== "User") {
            return res.status(403).json({ success:false,message: "Access Denied. Users only." });
        }
        next();
    } catch (error) {
        res.status(500).json({ succeess: false,message: "Authorization error." });
    }
};

// Middleware to check if the user is a regular User
export const isCounselor = async (req, res, next) => {
    try {
        if (req.user.userType !== "Counsellor") {
            return res.status(403).json({success:false, message: "Access Denied. Counselors only." });
        }
        next();
    } catch (error) {
        res.status(500).json({ success:false, message: "Authorization error." });
    }
};

// Middleware to verify Super Admin access 
export const isSuperAdmin = (req, res, next) => {
    try {
        if (req.user.userType !== "SuperAdmin") {
            return res.status(403).json({success:false, message: "Access Denied. SuperAdmin only." });
        }
        next();
    } catch (error) {
        res.status(500).json({ success:false, message: "Authorization error." });
    }
};
