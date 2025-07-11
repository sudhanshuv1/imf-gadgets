import { PrismaClient } from '../../generated/prisma'; 
const Prisma = new PrismaClient();
import { Request, Response } from 'express';
import { User } from './usersController'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//@desc login
//@route POST /auth
//@access Public
const login = async (req: Request, res: Response) => {

    const { email, password } = req.body;
    let foundUser: User | null = null, accessToken: string | null = null;

    try {
        if (!email || !password) {
            throw new Error("Email and Password are required!")
        }

        foundUser = await Prisma.user.findUnique({
            where: { email }
        });

        if (!foundUser) {
            throw new Error(`User with email ${email} not found!`);
        }

        const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordCorrect) {
            throw new Error("Error signing in: Incorrect password!");
        }

        // Generate JWT token
        const payload = {
            "User": {
                "id": foundUser.id,
                "email": foundUser.email,
            }
        }

        accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
    }
    catch(error) {
        if(error instanceof Error) {
            return res.status(400).json({message: `Error: ${error.message}`});
        }
        return res.status(400).json({message: `Error: Unknown error occurred!`})
    }
    
    res.status(200).json({ message: `User with email ${foundUser.email} logged in successfully!
                                    \nAccess Token: ${accessToken}
                                    \nUser: ${foundUser}` });
};

//@desc refresh token
//@route POST /auth/refresh
//@access Public
const refresh = async (req: Request, res: Response) => {
    const { cookies } = req;

    let newAccessToken: string | null = null;

    try {
        if(!cookies?.refreshToken) {
            throw new Error("Unauthorized!")
        }

        const refreshToken = cookies.refreshToken;

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err: unknown, decoded: unknown) => {
            if (err) {
                throw new Error("Forbidden");
            }

            const foundUser: User | null = await Prisma.user.findUnique({
                where: {
                    email: (decoded as jwt.JwtPayload)?.User.email,
                },
            });

            if (!foundUser) {
                throw new Error("Unauthorized");
            }

            const payload = {
                "User": {
                    "id": (decoded as jwt.JwtPayload)?.User.id,
                    "email": (decoded as jwt.JwtPayload)?.User.email,
                }
            };

            newAccessToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' });

        });
    } catch(error: unknown) {
        if(error instanceof Error) {
            return res.status(400).json({message: `Error: ${error.message}`})
        }
        return res.status(400).json({message: "Unknown error occurred!"});
    }
 
    res.status(200).json({ accessToken: newAccessToken });
}

//@desc logout
//@route POST /auth/logout
//@access Public
const logout = async (req: Request, res: Response) => {
    const { cookies } = req;

    try {
        if (!cookies?.refreshToken) {
            throw new Error("No content!");
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        });
    } catch(error) {
        if(error instanceof Error) {
            return res.status(400).json({message: `Error: ${error.message}`})
        }
        return res.status(400).json({message: `Error: Unknown error occurred!`});
    }
    
    res.status(200).json({ message: "User logged out successfully!" });
}

export { login, refresh, logout };