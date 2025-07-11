import { PrismaClient } from '../../generated/prisma';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
const Prisma = new PrismaClient();

export interface User {
    id: string;
    email: string;
    password: string;
}

// @desc Create new user
// @route POST /users
// @access Private
const createUser = async (req: Request, res: Response) => {

    let newUser: User | null = null;

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            throw new Error("Email and Password are required!")
        }

        if(!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            throw new Error("Please provide a valid email address!");
        }

        const existingUser: User | null = await Prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new Error(`User with email ${email} already exists!`);
        }

        const hashedPwd = await bcrypt.hash(password, 10);

        newUser = await Prisma.user.create({
            data: {
                email,
                password: hashedPwd,
            },
        })

        if (!newUser) {
            throw new Error("User could not be created!");
        }
    }
    catch(error: unknown) {
        if (error instanceof Error) {
            return res.status(400).json({message: `Error: ${error.message}`});
        }
        return res.status(400).json({message: `Error: Unknown error occurred!`})
    }

    res.status(201).json({ message: `User with email ${newUser.email} created successfully!` });
}


// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = async (req: Request, res: Response) => {
    let updatedUser: User | null = null;


    try {

        const { id, email, password } = req.body;
        
        if (!id || !email || !password) {
            throw new Error("id, email and password are required!")
        }

        const existingUser: User | null = await Prisma.user.findUnique({
            where: { id }
        });

        if (!existingUser) {
            throw new Error(`User with id ${id} not found!`)
        }

        const duplicateUser: User | null = await Prisma.user.findUnique({
            where: { email }
        });

        if (duplicateUser && duplicateUser.id !== id) {
            throw new Error(`User with email ${email} already exists!`);
        }

        const hashedPwd = await bcrypt.hash(password, 10);

        updatedUser = await Prisma.user.update({
            where: { id },
            data: {
                email,
                password: hashedPwd,
            },
        });

        if (!updatedUser) {
            throw new Error("User could not be updated!");
        }
    } catch(error) {
        if(error instanceof Error) {
            return res.status(400).json({message: `Error: ${error.message}`})
        }
        return res.status(400).json({message: "Error: Unknown error occurred!"})
    }

    res.status(200).json({ message: `User with email ${updatedUser.email} updated successfully!` });
}

export { createUser, updateUser };