import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import  { verifyToken } from "../../../middleware/auth";

export default async function handler(

    req: NextApiRequest,
    res:NextApiResponse

) {
    //verificar token 
    if(!verifyToken(req,res)) return;

    const {cartItemId} = req.body;

    await prisma.cartItem.delete({
        where: {
            id:Number(cartItemId),
        }
    });

    return res.json({message: "Producto eliminado del carrito"});

}