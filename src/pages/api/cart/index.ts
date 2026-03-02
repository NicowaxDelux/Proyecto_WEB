import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma"
import { verifyToken } from "../../../middleware/auth";

export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse
){

    //validar usuario
    if (!verifyToken(req, res)) return;

    //Obtener user del token
    const user = ( req as any ).user;

    //traer carrito con info del producto
    const cartInfo = await prisma.cartItem.findMany ({
        where: { userId: user.userId},

        include: {
            product: true, // JOIN automatico
        },
    });
    
    res.json(cartInfo);
}