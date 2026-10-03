import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import { isAdmin } from "../../../../middleware/isAdmin";


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    // ==========================================
    // Verificar JWT
    // ==========================================

    const token = verifyToken(req, res);

    if (token !== true) {
        return;
    }


    // ==========================================
    // Verificar que sea ADMIN
    // ==========================================

    const admin = isAdmin(req, res);

    if (admin !== true) {
        return;
    }


    // ==========================================
    // Obtener ID del pedido
    // ==========================================

    const { id } = req.query;

    const paymentId = Number(id);


    if (!Number.isInteger(paymentId)) {

        return res.status(400).json({
            message: "ID de pago inválido"
        });

    }


    // ==========================================
    // PUT
    // Cambiar estado del pago
    // ==========================================

    if (req.method === "PUT") {

        try {

            const { status } = req.body;


            // Estados permitidos
            const allowedStatuses = [
                "PENDING",
                "PENDING_PAYMENT",
                "PAID",
                "CANCELLED"
            ];


            // Verificar que el estado enviado
            // sea uno de los permitidos.

            if (!allowedStatuses.includes(status)) {

                return res.status(400).json({
                    message: "Estado de pago inválido"
                });

            }


            // Buscar primero el pago

            const existingPayment = await prisma.payment.findUnique({
                where: {
                    id: paymentId
                }
            });


            if (!existingPayment) {

                return res.status(404).json({
                    message: "Pago no encontrado"
                });

            }


            // Actualizar estado

            const updatedPayment = await prisma.payment.update({

                where: {
                    id: paymentId
                },

                data: {
                    status
                }

            });


            return res.status(200).json({

                message: "Estado del pago actualizado correctamente",

                payment: updatedPayment

            });

        } catch (error) {

            console.error(
                "Error actualizando estado del pago:",
                error
            );

            return res.status(500).json({
                message: "Error actualizando el pago"
            });

        }

    }


    // ==========================================
    // Método no soportado
    // ==========================================

    return res.status(405).json({
        message: "Método no permitido"
    });

}