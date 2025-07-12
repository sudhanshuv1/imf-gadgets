import { PrismaClient } from '../../generated/prisma'; 
import { getRandomArbitrary, generateCodename } from '../utils';
import { Request, Response } from 'express';
import { Status } from '../../generated/prisma';
import 'dotenv/config';
const Prisma = new PrismaClient();

export interface Gadget {
    id: string;
    name: string;
    status: Status; 
    decommissionedOn?: Date | null;
}

// @desc Create new gadget
// @route POST /gadgets
// @access Private
const createGadget = async (req: Request, res: Response) => {
    let newGadget: Gadget | null = null;

    try {

        const allGadgets: Gadget[] = await Prisma.gadget.findMany();
        const gadgetNames: string[] = allGadgets.map((gadget: Gadget) => gadget.name);

        const codename: string | undefined = await generateCodename(gadgetNames);

        if (!codename) {
            throw new Error("Codename could not be generated");
        }

        newGadget = await Prisma.gadget.create({
            data: {
                name: codename,
                status: Status.AVAILABLE,
            },
        });
        if (!newGadget) {
            throw new Error("Gadget could not be created");
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(400).json({ message: `Error: ${error.message}` });
        }
        return res.status(400).json({ message: `Unknown error occurred` });
    }
    return res.status(201).json({ message: `New gadget "${newGadget.name}" created successfully!`, gadget: newGadget });
}

//@desc Get all gadgets
//@route GET /gadgets
//@access Private
const getAllGadgets = async (req: Request, res: Response) => {

    const { status: gadgetStatus }: { status?: Status } = req.query;

    let withSuccessProbability;

    try {
        const allGadgets: Gadget[] = await Prisma.gadget.findMany({
            where: {
                status: gadgetStatus ? gadgetStatus : { not: undefined },
            }
        });
        if (!allGadgets) {
            throw new Error("Gadgets could not be retrieved!");
        }
        if (allGadgets.length === 0) {
            throw new Error(`No gadgets ${gadgetStatus ? `with status ${gadgetStatus}` : ''} found in the inventory!`);
        }
        withSuccessProbability = allGadgets.map((gadget: Gadget) => {
            return {
                [gadget.name]: `${getRandomArbitrary(0,100)}% success probability.`,
                id: gadget.id,
                Status: gadget.status,
                "Decommissioned On": gadget.decommissionedOn
            };
        })
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(400).json({ message: `Error: ${error.message}` });
        }
        return res.status(400).json({ message: `Unknown error occurred` });
    }

    res.status(200).json({ message: { Gadgets: withSuccessProbability } })
}

//@desc Update a gadget
//@route PATCH /gadgets
//@access Private
const updateGadget = async (req: Request, res: Response) => {

    let updatedGadget: Gadget | null = null;

    let gadgetId: string;

    try {

        const { id } = req.body;
        gadgetId = id;
        const {newName, newStatus} = req.body;

        if (!gadgetId) {
            throw new Error("Gadget ID is required for updating a gadget!");
        }

        const existingGadget = await Prisma.gadget.findUnique({
            where: {
                id: gadgetId,
            }
        })

        if(!existingGadget) {
            throw new Error(`Gadget with id ${gadgetId} not found!`);
        }

        updatedGadget = await Prisma.gadget.update({
            where: { id: gadgetId },
            data: {
                name: newName ? newName : existingGadget.name,
                status: newStatus ? newStatus : existingGadget.status
            },
        })

        if(!updatedGadget) {
            throw new Error(`Gadget with id ${gadgetId} could not be updated!`);
        }
    }
    catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(400).json({ message: `Error: ${error.message}` });
        }
        return res.status(400).json({ message: `Unknown error occurred` });
    }
    res.status(200).json({message: `Gadget with id ${gadgetId} updated successfully.`, "Updated gadget": updatedGadget})
}

//@desc Remove a gadget from the inventory
//@route DELETE /gadgets/:id
//@access Private
const removeGadget = async (req: Request, res: Response) => {
    let removedGadget: Gadget | null = null;
    let gadgetId: string;
    
    try {
        gadgetId = req.params.id;

        const existingGadget = await Prisma.gadget.findUnique({
            where: {
                id: gadgetId,
            }
        })

        if(!existingGadget) {
            throw new Error(`Gadget with id ${gadgetId} not found!`);
        }

        removedGadget = await Prisma.gadget.update({
            where: { id: gadgetId },
            data: {
                status: Status.DECOMMISSIONED,
                decommissionedOn: new Date(),
            },
        })

        if(!removedGadget) {
            throw new Error(`Gadget with id ${gadgetId} could not be removed!`);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(400).json({ message: `Error: ${error.message}` });
        }
        return res.status(400).json({ message: `Unknown error occurred` });
    }

    res.status(200).json({message: `Gadget with id ${gadgetId} removed successfully.`, "Removed gadget": removedGadget})
}

//@desc Trigger the self-desctruct sequence for a gadget
//@route POST /gadgets/:id/self-destruct
//@access Private
const selfDestructGadget = async (req: Request, res: Response) => {

    let gadgetId: string;


    let destroyedGadget: Gadget | null = null;

    try {

        const { confirmationCode } = req.body;
        gadgetId = req.params.id;

        const existingGadget = await Prisma.gadget.findUnique({
            where: {
                id: gadgetId,
            }
        })

        if(!existingGadget) {
            res.status(400).json({message: `Gadget with id ${gadgetId} not found!`})
        }

        if(!confirmationCode) {
            res.status(400).json({message: "Confirmation code required!"})
        }

        destroyedGadget = await Prisma.gadget.update({
            where: { id: gadgetId },
            data: {
                status: Status.DESTROYED,
            },
        })

        if(!destroyedGadget) {
            res.status(400).json({message: `Gadget with id ${gadgetId} could not self-destruct!`})
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(400).json({ message: `Error: ${error.message}` });
        }
        return res.status(400).json({ message: `Unknown error occurred` });
    }

    res.status(200).json({message: `Gadget with id ${gadgetId} self-destructed successfully.`, "Self-destructed gadget": destroyedGadget})
}

export {
    createGadget,
    getAllGadgets,
    updateGadget,
    removeGadget,
    selfDestructGadget
}