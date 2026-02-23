const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authentication required. No token provided." });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required. Invalid token format." });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    // Block archived users: check on every request so already-logged-in sessions are invalidated
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'archived_at'] });
    if (user?.archived_at) {
      return res.status(403).json({ message: "Your account has been archived. Please contact your administrator to restore access." });
    }
    
    // Add user data to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please log in again." });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    }
    
    res.status(401).json({ message: "Authentication failed." });
  }
}; 