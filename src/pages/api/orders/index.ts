
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../middleware/auth";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Este endpoint solamente acepta solicitudes GET.
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);

        return res.status(405).json({
            message: "Método no permitido",
        });
    }

    // Verificar que el cliente tenga una sesión válida.
    const auth = verifyToken(req, res);

    if (auth !== true) return;

    const user = (req as any).user;
    const userId = user?.userId;

    if (!userId) {
        return res.status(401).json({
            message: "No se pudo identificar al usuario",
        });
    }

    try {
        // Consultar exclusivamente los pedidos del cliente autenticado.
        const orders = await prisma.order.findMany({
            where: {
                userId,
            },

            // Mostrar primero los pedidos más recientes.
            orderBy: {
                createdAt: "desc",
            },

            include: {
                // Información de los productos comprados.
                orderItems: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                imageUrl: true,
                            },
                        },
                    },
                },

                // Información de los pagos asociados al pedido.
                payment: {
                    select: {
                        id: true,
                        provider: true,
                        status: true,
                        amount: true,
                        reference: true,
                        createdAt: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        return res.status(200).json(orders);

    } catch (error) {
        console.error("Error al consultar los pedidos:", error);

        return res.status(500).json({
            message: "No se pudieron consultar tus pedidos",
        });
    }
}