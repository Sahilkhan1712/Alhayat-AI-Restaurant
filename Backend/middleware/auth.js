const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && (authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access denied. Login required."
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

        req.user = decoded;
        next();
    });
}

module.exports = { authenticateToken };
