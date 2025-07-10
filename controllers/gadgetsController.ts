import { PrismaClient } from '@prisma/client';
import { getRandomArbitrary } from '../utils';
const Prisma = new PrismaClient();

export enum GadgetStatus {
    AVAILABLE = 'AVAILABLE',
    DEPLOYED = 'DEPLOYED',
    DECOMMISSIONED = 'DECOMMISSIONED',
    DESTROYED = 'DESTROYED',
}

export interface Gadget {
    id: string;
    name: string;
    status: GadgetStatus;
    decommissionedOn?: Date | null;
}

// @desc Create new gadget
// @route POST /gadgets
// @access Private
const createGadget = async (req, res) => {
    let newGadget;
    try {
        newGadget = await Prisma.gadget.create({
            data: {
                name: "The Nightangle",
                status: Prisma.status.AVAILABLE,
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
    return res.status(201).json({ message: `A new gadget "${newGadget.name}" created successfully!`, gadget: newGadget });
}

//@desc Get all gadgets
//@route GET /gadgets
//@access Private
const getAllGadgets = async (req, res) => {
    let withSuccessProbability;
    try {
        const allGadgets = await Prisma.gadget.findMany();
        if(!allGadgets) {
            throw new Error("Gadgets could not be retrieved!");
        }
        if(allGadgets.length === 0) {
            throw new Error("No gadgets found in the inventory!");
        }
        withSuccessProbability = allGadgets.map((gadget: Gadget) => {
            return `${gadget.name} - ${getRandomArbitrary(0,100)}% success probability.
                    \nid: ${gadget.id}
                    \nStatus: ${gadget.status}
                    \nDecommissioned On: ${gadget.decommissionedOn}`;
        })
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(400).json({ message: `Error: ${error.message}` });
        }
        return res.status(400).json({ message: `Unknown error occurred` });
    }

    res.status(200).json({ message: `Gadgets: ${withSuccessProbability}` })
}

//@desc Update a gadget
//@route PATCH /gadgets/:id
//@access Private
const updateGadget = async (req, res) => {
    const gadgetId = req.params.id;

    const {newName, newStatus} = req.body;

    const existingGadget = await Prisma.gadget.findUnique({
        where: {
            id: gadgetId,
        }
    })

    if(!existingGadget) {
        res.status(400).json({message: `Gadget with id ${gadgetId} not found!`})
    }

    const updatedGadget = await Prisma.gadget.update({
        where: { gadgetId },
        data: {
            name: newName ? newName : existingGadget.name,
            status: newStatus ? newStatus : existingGadget.status
        },
    })

    if(!updatedGadget) {
        res.status(400).json({message: `Gadget with id ${gadgetId} could not be updated!`})
    }

    res.status(200).json({message: `Gadget with id ${gadgetId} updated successfully: ${updatedGadget}`})
}

//@desc Remove a gadget from the inventory
//@route DELETE /gadgets/:id
//@access Private
const removeGadget = async (req, res) => {
    const gadgetId = req.params.id;

    const existingGadget = await Prisma.gadget.findUnique({
        where: {
            id: gadgetId,
        }
    })

    if(!existingGadget) {
        res.status(400).json({message: `Gadget with id ${gadgetId} not found!`})
    }

    const removedGadget = await Prisma.gadget.update({
        where: { gadgetId },
        data: {
            status: Prisma.status.DECOMMISSIONED,
            decommissionedOn: Date.now(),
        },
    })

    if(!removedGadget) {
        res.status(400).json({message: `Gadget with id ${gadgetId} could not be removed!`})
    }

    res.status(200).json({message: `Gadget with id ${gadgetId} removed successfully: ${removedGadget}`})
}

//@desc Trigger the self-desctruct sequence for a gadget
//@route POST /gadgets/:id/self-destruct
//@access Private
const selfDestructGadget = async (req, res) => {
    const gadgetId = req.params.id;

    const { confirmationCode } = req.body; 

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

    const destroyedGadget = await Prisma.gadget.update({
        where: { gadgetId },
        data: {
            status: Prisma.status.DESTROYED,
        },
    })

    if(!destroyedGadget) {
        res.status(400).json({message: `Gadget with id ${gadgetId} could not self-destruct!`})
    }

    res.status(200).json({message: `Gadget with id ${gadgetId} self-destructed successfully: ${destroyedGadget}`})
}

export {
    createGadget,
    getAllGadgets,
    updateGadget,
    removeGadget,
    selfDestructGadget
}