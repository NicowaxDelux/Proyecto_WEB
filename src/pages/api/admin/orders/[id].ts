import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import { isAdmin } from "../../../../middleware/isAdmin";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    // Este endpoint solamente permite actualizar pedidos.
    if (req.method !== "PUT") {
        res.setHeader("Allow", ["PUT"]);

        return res.status(405).json({
            message: "Método no permitido",
        });
    }

    // 1. Verificar que exista una sesión válida.
    const token = verifyToken(req, res);

    if (token !== true) {
        return;
    }

    // 2. Verificar que el usuario sea administrador.
    const admin = isAdmin(req, res);

    if (admin !== true) {
        return;
    }

    // 3. Obtener y validar el ID del pedido.
    const orderId = Number(req.query.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
            message: "ID de pedido inválido",
        });
    }

    try {

        const { status } = req.body;

        // 4. Estados permitidos para el seguimiento del pedido.
        const allowedStatuses = [
            "PENDING",
            "PREPARING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
        ];

        if (
            typeof status !== "string" ||
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: "Estado de pedido inválido",
            });
        }

        // 5. Comprobar que el pedido exista.
        const existingOrder = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
        });

        if (!existingOrder) {
            return res.status(404).json({
                message: "Pedido no encontrado",
            });
        }

        // 6. Actualizar únicamente el estado del pedido.
        // El estado del pago permanece independiente.
        const updatedOrder = await prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                status,
            },
        });

        return res.status(200).json({
            message: "Estado del pedido actualizado correctamente",
            order: updatedOrder,
        });

    } catch (error) {

        console.error(
            "Error actualizando estado del pedido:",
            error
        );

        return res.status(500).json({
            message: "Error actualizando el pedido",
        });

    }
}
