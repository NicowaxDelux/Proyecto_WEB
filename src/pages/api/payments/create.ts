import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../middleware/auth";
import crypto from "crypto";



export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse
){

    //Verificar Usuario
    if (!verifyToken(req, res)) return;
    

    //obtener user del request
    const user = (req as any).user;

    //obtener lo datos del frontend 
    const { orderId, provider } = req.body;


    //verificar que la orden pertenece al usuario
    const order = await prisma.order.findFirst({
        where: { 
            id: Number(orderId),     
            userId: user.userId,
        },
    });

    if(!order){
        res.status(404).json({message:'Ordeb no encontrada'});
    }

    //generar ID simulando pasarela externa
    const providerPaymentId = crypto.randomUUID();

    //crear pago
    const payment = await prisma.payment.create({
        data: {
            orderId: order.id,
            provider,
            providerPaymentId,
            status: "PENDING",
            amount: order.totalAmount,
        },
    });

    //en producción aqui redirigiras a nequi SDK
    res.json({
        message: 'Pago iniciado',
        payment, 
        instructions: {
            provider,
            reference: providerPaymentId,
            amount: order.totalAmount,
        },
    });
}