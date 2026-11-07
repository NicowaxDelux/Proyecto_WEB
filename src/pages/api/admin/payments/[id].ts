import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import { isAdmin } from "../../../../middleware/isAdmin";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    // Este endpoint solamente permite actualizar pagos.
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

    // 3. Obtener y validar el ID del pago.
    const paymentId = Number(req.query.id);

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
        return res.status(400).json({
            message: "ID de pago inválido",
        });
    }

    try {

        const { status } = req.body;

        // 4. Estados permitidos exclusivamente para pagos.
        const allowedStatuses = [
            "PENDING",
            "PAID",
            "CANCELLED",
        ];

        if (
            typeof status !== "string" ||
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                message: "Estado de pago inválido",
            });
        }

        // 5. Comprobar que el pago exista.
        const existingPayment = await prisma.payment.findUnique({
            where: {
                id: paymentId,
            },
        });

        if (!existingPayment) {
            return res.status(404).json({
                message: "Pago no encontrado",
            });
        }

        // 6. Actualizar únicamente el estado del pago.
        // IMPORTANTE: ya no modificamos Order.status.
        const updatedPayment = await prisma.payment.update({
            where: {
                id: paymentId,
            },
            data: {
                status,
            },
        });

        return res.status(200).json({
            message: "Estado del pago actualizado correctamente",
            payment: updatedPayment,
        });

    } catch (error) {

        console.error("Error actualizando el pago:", error);

        return res.status(500).json({
            message: "No se pudo actualizar el pago",
        });

    }
}