import PrismaClient from '@prisma/client';
import bcrypt from 'bcrypt';
const Prisma = new PrismaClient();

// @desc Create new user
// @route POST /users
// @access Private
const createUser = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required!" });
    }

    if(!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
        return res.status(400).json({ message: "Please provide a valid email address!" });
    }

    const existingUser = await Prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        return res.status(400).json({ message: `User with email ${email} already exists!` });
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    const newUser = await Prisma.user.create({
        data: {
            email,
            password: hashedPwd,
        },
    })

    if (!newUser) {
        return res.status(400).json({ message: "User could not be created!" });
    }

    res.status(201).json({ message: `User with email ${newUser.email} created successfully!` });
}


// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = async (req, res) => {
    const { id, email. password } = req.body;

    if (!id || !email || !password) {
        return res.status(400).json({ message: "ID, email, and password are required!" });
    }

    const existingUser = await Prisma.user.findUnique({
        where: { id }
    });

    if (!existingUser) {
        return res.status(404).json({ message: "User not found!" });
    }

    const duplicateUser = await Prisma.user.findUnique({
        where: { email }
    });

    if (duplicateUser && duplicateUser.id !== id) {
        return res.status(400).json({ message: `User with email ${email} already exists!` });
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    const updatedUser = await Prisma.user.update({
        where: { id },
        data: {
            email,
            password: hashedPwd,
        },
    });

    if (!updatedUser) {
        return res.status(400).json({ message: "User could not be updated!" });
    }

    res.status(200).json({ message: `User with email ${updatedUser.email} updated successfully!` });
}

export { createUser, updateUser };