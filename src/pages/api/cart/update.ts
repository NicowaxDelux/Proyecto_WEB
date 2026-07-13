import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler (

    req: NextApiRequest,
    res: NextApiResponse

) {

    if (
        req.method !== "POST"
    ) {

        return res.status(405).json({ message:"Método no permitido"});
    }
   
    try {
        const { cartItemId, quantity} = req.body;

        console.log("Body:", req.body);


        //Validar
        if (!cartItemId) {
            return res.status(400).json({message:"cartitemId es requerido"});
        }
    
        //Buscar item del carrito
        const cartItem = await prisma.cartItem.findUnique({
            where: {
                id: Number(cartItemId)
            }
        });

        //No existe item del carrito
        if (!cartItem) {
            return res.status(404).json({message: "peoducto no existe"})
        }

        //si la cantida es <=0 eliminar
        if (quantity <= 0) {
            await prisma.cartItem.delete({
                where:{ 
                    id: Number(cartItemId)
                }
            });

            return res.json({ delete: true});
        }

        //Actualizar
        const cartUpdated = await prisma.cartItem.update({
            where: {
                id:Number(cartItemId)

            },
            data: {
                quantity: Number (quantity)
            }
        });

        return res.json(cartUpdated);

    } catch (error) {
        console.log(error);

        return res.status(500).json({message: "Error actualizado"});
    }
}