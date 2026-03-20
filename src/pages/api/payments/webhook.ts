import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";


/*Aqui se da la confirmación real de pago y la actualización de
* del pago y estado aprovado.
*/

export default async function handles (

    req:NextApiRequest,
    res:NextApiResponse
) {
    //datos sacados del request
    const { providerPaymentId, status } = req.body;

   // buscar payment usando ID externo
   const payment = await prisma.payment.findFirst({
    where: { providerPaymentId },
   });

   if (!payment) {
    res.status(404).json({ message: "Pago no encontrado"});
   }
   
   //actualizar estado de pago
   await prisma.payment.update({
    where: { id: payment.id},
    data: { status },
   });

   //si aprobado -> marcar orden paga
   if (status === "APPROVED"){
    await prisma.order.update({
        where: {id: payment.orderId},
        data: { status: "PAID"},
    });
   }

   res.json({ received:true});

}