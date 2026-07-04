import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../middleware/auth";


export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse
){

   if(req.method !== "POST") {

        return res.status(405).json({ message: "Metodo no permitido"});
   } 


   try {

        const user =  verifyToken( req, res);

        if(!user) {
            return;
        }


        const {orderId, provider} = req.body;

        console.log( "Body", req.body);
        console.log("OrderId", orderId);

        const order = await prisma.order.findUnique({

            where: {
                id: Number(orderId)
            }
        });

        if(!order) {
            return res.status(404).json({message: "Orden no encontrada"})
        }

        const reference =  `ORD-${orderId}`;

        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                provider,
                amount: order.totalAmount,
                status: "PENDIENTE",
                reference,
            },
        });

        return res.status(200).json({success: true, id: payment.id, reference});

   }
   catch (error) {

        console.log(error);
        return res.status(500).json({message: "Error al crear el pago"});
   }
}