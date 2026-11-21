import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import { isAdmin } from "../../../../middleware/isAdmin";

const allowedStatuses = [
    "PENDING",
    "PREPARING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
];

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    // ==========================================
    // 1. VALIDAR MÉTODO HTTP
    // ==========================================

    if (req.method !== "PUT") {

        res.setHeader("Allow", ["PUT"]);

        return res.status(405).json({
            message: "Método no permitido",
        });
    }

    // ==========================================
    // 2. VERIFICAR AUTENTICACIÓN
    // ==========================================

    const auth = verifyToken(req, res);

    if (auth !== true) return;

    // ==========================================
    // 3. VERIFICAR ADMINISTRADOR
    // ==========================================

    const admin = isAdmin(req, res);

    if (admin !== true) return;

    // ==========================================
    // 4. VALIDAR ID Y ESTADO
    // ==========================================

    const orderId = Number(req.query.id);

    if (!Number.isInteger(orderId) || orderId <= 0) {

        return res.status(400).json({
            message: "ID de pedido inválido",
        });
    }

    const { status } = req.body ?? {};

    if (
        typeof status !== "string" ||
        !allowedStatuses.includes(status)
    ) {

        return res.status(400).json({
            message: "Estado de pedido inválido",
        });
    }

    try {

        // ==========================================
        // 5. TRANSACCIÓN SEGURA
        // ==========================================

        const updatedOrder = await prisma.$transaction(
            async (tx) => {

                // Bloquear la fila del pedido hasta terminar
                // la transacción. Esto evita que dos
                // cancelaciones simultáneas devuelvan
                // el inventario dos veces.

                const rows = await tx.$queryRaw<
                    Array<{ id: number }>
                >`
                    SELECT id
                    FROM \`Order\`
                    WHERE id = ${orderId}
                    FOR UPDATE
                `;

                if (rows.length === 0) {
                    throw new Error("ORDER_NOT_FOUND");
                }

                // Consultar pedido, productos y pagos.
                const order = await tx.order.findUnique({
                    where: {
                        id: orderId,
                    },

                    include: {
                        orderItems: true,

                        payment: {
                            select: {
                                status: true,
                            },
                        },
                    },
                });

                if (!order) {
                    throw new Error("ORDER_NOT_FOUND");
                }

                // ==========================================
                // 6. VALIDAR TRANSICIONES
                // ==========================================

                // No permitir reactivar pedidos cancelados.
                // Su inventario ya pudo ser liberado.

                if (order.status === "CANCELLED") {
                    throw new Error("ORDER_ALREADY_CANCELLED");
                }

                // Evitar cambiar estados de pedidos entregados.

                if (
                    order.status === "DELIVERED" &&
                    status !== "DELIVERED"
                ) {
                    throw new Error("ORDER_ALREADY_DELIVERED");
                }

                // Si el estado no cambia, no modificar nada.

                if (order.status === status) {
                    return order;
                }

                // ==========================================
                // 7. CANCELAR Y RESTAURAR STOCK
                // ==========================================

                if (status === "CANCELLED") {

                    // No cancelar pedidos con pagos confirmados.
                    const hasPaidPayment = order.payment.some(
                        (payment) => payment.status === "PAID"
                    );

                    if (hasPaidPayment) {
                        throw new Error("ORDER_HAS_CONFIRMED_PAYMENT");
                    }

                    // No cancelar pedidos enviados o entregados.
                    if (
                        order.status === "SHIPPED" ||
                        order.status === "DELIVERED"
                    ) {
                        throw new Error("ORDER_CANNOT_BE_CANCELLED");
                    }

                    // Restaurar las variantes originales.
                    for (const item of order.orderItems) {

                        if (!item.variantId) {
                            throw new Error("ORDER_VARIANT_MISSING");
                        }

                        if (
                            !Number.isInteger(item.quantity) ||
                            item.quantity <= 0
                        ) {
                            throw new Error("INVALID_ORDER_QUANTITY");
                        }

                        const restored = await tx.productVariant.updateMany({
                            where: {
                                id: item.variantId,
                                productId: item.productId,
                            },

                            data: {
                                stock: {
                                    increment: item.quantity,
                                },
                            },
                        });

                        if (restored.count !== 1) {
                            throw new Error("ORDER_VARIANT_MISSING");
                        }
                    }

                    // Marcar como cancelado dentro de
                    // la misma transacción.

                    // ==========================================
                    // 8. RESTAURAR DESCUENTO STYLE11
                    // ==========================================

                    let restoreWelcomeDiscount = false;

                    // Solo considerar pedidos que realmente
                    // consumieron el descuento.
                    if (
                        order.welcomeDiscountConsumed === true &&
                        order.welcomeDiscountRestored === false &&
                        order.promoCode === "STYLE11"
                    ) {

                        // Comprobar si existen otros pedidos
                        // activos del mismo usuario que hayan
                        // consumido STYLE11.
                        const otherWelcomeOrders = await tx.order.count({
                            where: {
                                userId: order.userId,

                                id: {
                                    not: order.id,
                                },

                                welcomeDiscountConsumed: true,

                                status: {
                                    not: "CANCELLED",
                                },
                            },
                        });

                        // Solo devolver el beneficio si no
                        // existe otro pedido activo que lo use.
                        restoreWelcomeDiscount =
                            otherWelcomeOrders === 0;
                    }

                    // ==========================================
                    // 9. ACTUALIZAR PEDIDO
                    // ==========================================

                    const cancelledOrder = await tx.order.update({
                        where: {
                            id: orderId,
                        },

                        data: {
                            status: "CANCELLED",

                            // Registrar que este pedido ya
                            // procesó la devolución del beneficio.
                            welcomeDiscountRestored:
                                restoreWelcomeDiscount
                                    ? true
                                    : order.welcomeDiscountRestored,
                        },
                    });

                    // ==========================================
                    // 10. DEVOLVER BENEFICIO AL USUARIO
                    // ==========================================

                    if (restoreWelcomeDiscount) {

                        await tx.user.update({
                            where: {
                                id: order.userId,
                            },

                            data: {
                                welcomeDiscountUsed: false,
                            },
                        });
                    }

                    return cancelledOrder;

                }

                // ==========================================
                // 8. ACTUALIZACIÓN NORMAL
                // ==========================================

                return tx.order.update({
                    where: {
                        id: orderId,
                    },

                    data: {
                        status,
                    },
                });

            },
            {
                isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
                maxWait: 5000,
                timeout: 10000,
            }
        );

        return res.status(200).json({
            message: "Estado del pedido actualizado correctamente",
            order: updatedOrder,
        });

    } catch (error: unknown) {

        console.error(
            "Error actualizando estado del pedido:",
            error
        );

        // ==========================================
        // 9. ERRORES CONTROLADOS
        // ==========================================

        const errorCode =
            error instanceof Error ? error.message : "";

        const errors: Record<
            string,
            { status: number; message: string }
        > = {

            ORDER_NOT_FOUND: {
                status: 404,
                message: "Pedido no encontrado",
            },

            ORDER_ALREADY_CANCELLED: {
                status: 409,
                message: "Este pedido ya está cancelado.",
            },

            ORDER_ALREADY_DELIVERED: {
                status: 409,
                message: "No se puede modificar un pedido entregado.",
            },

            ORDER_HAS_CONFIRMED_PAYMENT: {
                status: 409,
                message:
                    "No se puede cancelar un pedido con un pago confirmado.",
            },

            ORDER_CANNOT_BE_CANCELLED: {
                status: 409,
                message:
                    "No se puede cancelar un pedido enviado o entregado.",
            },

            ORDER_VARIANT_MISSING: {
                status: 409,
                message:
                    "No se puede restaurar el inventario porque falta una variante del pedido.",
            },

            INVALID_ORDER_QUANTITY: {
                status: 409,
                message:
                    "El pedido contiene una cantidad inválida.",
            },
        };

        const controlledError = errors[errorCode];

        if (controlledError) {
            return res.status(controlledError.status).json({
                message: controlledError.message,
            });
        }

        return res.status(500).json({
            message: "Error actualizando el pedido",
        });
    }
}