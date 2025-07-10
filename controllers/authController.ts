import PrismaClient from '@prisma/client';
const Prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//@desc login
//@route POST /auth
//@access Public
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    const foundUser = await Prisma.user.findUnique({
        where: { email }
    });

    if (!foundUser) {
        return res.status(404).json({ message: `User with email ${email} not found!` });
    }

    const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Error signing in: Invalid password!" });
    }

    // Generate JWT token
    const payload = {
        "User": {
            "id": foundUser.id,
            "email": foundUser.email,
        }
    }

    const accessToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1h'});
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ message: `User with email ${foundUser.email} logged in successfully!
                                    \nAccess Token: ${accessToken}
                                    \nUser: ${foundUser}` });
};

//@desc refresh token
//@route POST /auth/refresh
//@access Public
const refresh = async (req, res) => {
    const { cookies } = req.cookies;

    if(!cookies?.refreshToken) {
        return res.status(401).json({message: "Unauthorized"});
    }

    const refreshToken = cookies.refreshToken;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({message: "Forbidden"});
        }

        const foundUser = await Prisma.user.findUnique({
            where: {
                email: decoded.User.email,
            },
        });

        if (!foundUser) {
            return res.status(401).json({message: "Unauthorized"});
        }

        const payload = {
            "User": {
                "id": decoded.User.id,
                "email": decoded.User.email,
            }
        };

        const newAccessToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' });

        res.status(200).json({ accessToken: newAccessToken });
    });
}

//@desc logout
//@route POST /auth/logout
//@access Public
const logout = async (req, res) => {
    const { cookies } = req.cookies;

    if (!cookies?.refreshToken) {
        return res.status(204).json({ message: "No content" });
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
    });

    res.status(200).json({ message: "User logged out successfully!" });
}

export { login, refresh, logout };