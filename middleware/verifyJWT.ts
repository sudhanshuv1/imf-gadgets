import jwt from 'jsonwebtoken';

/**
 * Middleware to verify JSON Web Tokens (JWT).
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns 
 */
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if(!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) {
            return res.status(403).json({ message: "Forbidden" });
        }

        req.user = decoded.User;
        next();
    });
};

export default verifyJWT;