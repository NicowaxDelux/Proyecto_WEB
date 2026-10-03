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

    const orderId = Number(id);


    if (!Number.isInteger(orderId)) {

        return res.status(400).json({
            message: "ID de pedido inválido"
        });

    }


    // ==========================================
    // PUT
    // Cambiar estado del pedido
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
                    message: "Estado de pedido inválido"
                });

            }


            // Buscar primero el pedido

            const existingOrder = await prisma.order.findUnique({
                where: {
                    id: orderId
                }
            });


            if (!existingOrder) {

                return res.status(404).json({
                    message: "Pedido no encontrado"
                });

            }


            // Actualizar estado

            const updatedOrder = await prisma.order.update({

                where: {
                    id: orderId
                },

                data: {
                    status
                }

            });


            return res.status(200).json({

                message: "Estado del pedido actualizado correctamente",

                order: updatedOrder

            });

        } catch (error) {

            console.error(
                "Error actualizando estado del pedido:",
                error
            );

            return res.status(500).json({
                message: "Error actualizando el pedido"
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