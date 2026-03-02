import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../middleware/auth";

export default async function handler(
    req:NextApiRequest,
    res:NextApiResponse
) {
   //Verificar que solo se permita POST
    if (req.method !== "POST") {
        return res.status(405).end();
    }
    
    //verificar token del user, si no tiene no puede acceder
    if(!verifyToken(req,res)) return;

    //obtener user del token
    const user = (req as any).user;

    //obtener los datos del request o frontend
    const { productId, quantity } = req.body;

    //Revisar si ya existe el carrito
    const existingItem = await prisma.cartItem.findFirst({
        where: {
            userId: user.userId,
            productId: Number(productId)
        },
    });

    //Si ya existe solo aumentar la cantidad
    if (existingItem){
        const update = await prisma.cartItem.update({
            where: {id: existingItem.id},
            data: {
                quantity: existingItem.quantity + Number(quantity),
            },
        });
        return res.json(update);
    }

    //si no existe, crear un nuevo carritó
    const newCart = await prisma.cartItem.create({
        data: {
            userId: user.userId,
            productId: Number(productId),
            quantity: Number(quantity),
        }
    });

    return res.status(201).json(newCart);
}