
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../middleware/auth";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Este endpoint solamente acepta solicitudes POST.
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).json({
            message: "Método no permitido",
        });
    }

    // Verificar que el usuario tenga una sesión válida.
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
        // Toda la operación se realiza en una transacción.
        // Si algo falla, no se crea una orden incompleta.
        const order = await prisma.$transaction(async (tx) => {

            // 1. Consultar el carrito con sus productos y variantes.
            const cartItems = await tx.cartItem.findMany({
                where: { userId },
                include: {
                    product: true,
                    variant: true,
                },
            });

            if (cartItems.length === 0) {
                throw new Error("CART_EMPTY");
            }

            // 2. Buscar al usuario.
            const currentUser = await tx.user.findUnique({
                where: { id: userId },
            });

            if (!currentUser) {
                throw new Error("USER_NOT_FOUND");
            }

            // 3. Validar variantes y existencias.
            for (const item of cartItems) {

                // Todos los productos deben tener talla y color.
                if (!item.variant) {
                    throw new Error("VARIANT_REQUIRED");
                }

                // La variante debe pertenecer al producto correcto.
                if (item.variant.productId !== item.productId) {
                    throw new Error("INVALID_VARIANT");
                }

                // Validar cantidad.
                if (
                    !Number.isInteger(item.quantity) ||
                    item.quantity <= 0
                ) {
                    throw new Error("INVALID_QUANTITY");
                }

                // Comprobar disponibilidad actual.
                if (item.variant.stock < item.quantity) {
                    throw new Error("INSUFFICIENT_STOCK");
                }

                // 4. Reservar el stock de forma atómica.
                // Esto evita que dos clientes compren simultáneamente
                // las mismas últimas unidades.
                const stockUpdate = await tx.productVariant.updateMany({
                    where: {
                        id: item.variant.id,
                        productId: item.productId,
                        stock: {
                            gte: item.quantity,
                        },
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        },
                    },
                });

                if (stockUpdate.count !== 1) {
                    throw new Error("STOCK_CHANGED");
                }
            }

            // 5. Calcular subtotal.
            const subtotal = cartItems.reduce(
                (acc, item) =>
                    acc + item.product.price * item.quantity,
                0
            );

            // 6. Aplicar beneficio de primera compra.
            let discountAmount = 0;
            let promoCode: string | null = null;

            if (
                currentUser.welcomeCode === "STYLE11" &&
                currentUser.welcomeDiscountUsed === false
            ) {
                discountAmount = Math.round(subtotal * 0.11);
                promoCode = "STYLE11";
            }

            const totalAmount = subtotal - discountAmount;

            // 7. Crear la orden con los detalles de cada producto.
            const newOrder = await tx.order.create({
                data: {
                    userId,

                    subtotal,
                    discountAmount,
                    promoCode,
                    totalAmount,

                    orderItems: {
                        create: cartItems.map((item) => ({
                            productId: item.productId,
                            variantId: item.variantId!,
                            quantity: item.quantity,
                            unitPrice: item.product.price,

                            // Guardamos una copia de la talla y el color.
                            size: item.variant!.size,
                            color: item.variant!.color,
                        })),
                    },
                },
                include: {
                    orderItems: {
                        include: {
                            product: true,
                            variant: true,
                        },
                    },
                },
            });

            // 8. Consumir el beneficio si se utilizó.
            if (promoCode === "STYLE11") {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        welcomeDiscountUsed: true,
                    },
                });
            }

            // 9. Vaciar el carrito después de crear la orden.
            await tx.cartItem.deleteMany({
                where: { userId },
            });

            return newOrder;
        });

        // Orden creada correctamente.
        return res.status(201).json({
            message: "Pedido creado correctamente",
            ...order,
        });

    } catch (error: any) {
        console.error("Error al crear pedido:", error);

        // Errores controlados.
        switch (error.message) {
            case "CART_EMPTY":
                return res.status(400).json({
                    message: "Tu carrito está vacío",
                });

            case "USER_NOT_FOUND":
                return res.status(404).json({
                    message: "Usuario no encontrado",
                });

            case "VARIANT_REQUIRED":
                return res.status(400).json({
                    message:
                        "Uno de tus productos no tiene talla y color seleccionados. Revisa tu carrito.",
                });

            case "INVALID_VARIANT":
                return res.status(400).json({
                    message: "Una de las variantes seleccionadas no es válida.",
                });

            case "INVALID_QUANTITY":
                return res.status(400).json({
                    message: "Una de las cantidades del carrito no es válida.",
                });

            case "INSUFFICIENT_STOCK":
            case "STOCK_CHANGED":
                return res.status(409).json({
                    message:
                        "Lo sentimos, las existencias de uno de tus productos cambiaron. Revisa tu carrito antes de continuar.",
                });

            default:
                return res.status(500).json({
                    message: "No se pudo crear tu pedido. Inténtalo nuevamente.",
                });
        }
    }
}
