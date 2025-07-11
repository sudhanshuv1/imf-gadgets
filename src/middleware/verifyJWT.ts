import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to verify JSON Web Tokens (JWT).
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function.
 * @returns 
 */
const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
    const authHeader: string | string[] | undefined = req.headers.authorization || req.headers.Authorization;
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    if (!headerValue?.startsWith('Bearer ')) {
        return res.status(401).json({ message: "No token" });
    }

    const token = headerValue.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err) {
            return res.status(403).json({ message: "Forbidden" });
        }

        req.user = (decoded as jwt.JwtPayload)?.User;
        next();
    });
};

export default verifyJWT;