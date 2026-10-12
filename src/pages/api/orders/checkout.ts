import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../middleware/auth";


export default async function handler(

    req: NextApiRequest,
    res: NextApiResponse
){
    
    //veriificar usuario con token
    const auth = verifyToken(req, res);

    if (auth !== true) return;

    //obtener usuario del token
    const user = (req as any).user;

    //obtener el carrito del usuario
    const cartItems = await prisma.cartItem.findMany({

        where: {
            userId: user.Id
        },
        include: {
            product:true
        },

    });


    //validar que el carrito no este vacio
    if (cartItems.length === 0) {

        return res.status(400).json({ message: "El carrito esta vacio" });

    }

    //calcular subtotal
    const  subtotal = cartItems.reduce ((acc, item) => {

        return acc + item.product.price * item.quantity;
    }, 0);

    //buscar el usuario en la base de datos

    const currentUser = await prisma.user.findUnique({
        where: {
            id: user.userId
        }
    });


    if (!currentUser) {
        return res.status(404).json({ message: "Usuario no encontrado" });
    }



       // ==========================================
    // BENEFICIO DE PRIMERA COMPRA
    // ==========================================

    let discountAmount = 0;
    let promoCode: string | null = null;


    // El usuario tiene derecho al beneficio
    if (
        currentUser.welcomeCode === "STYLE11" &&
        currentUser.welcomeDiscountUsed === false
    ) {

        // Calcular 11% de descuento
        discountAmount = Math.round(subtotal * 0.11);

        promoCode = "STYLE11";
    }


    // Calcular total final
    const totalAmount = subtotal - discountAmount;


    // ==========================================
    // CREAR ORDEN
    // ==========================================

    const order = await prisma.order.create({

        data: {

            userId: user.userId,

            // Precio antes del descuento
            subtotal,

            // Valor descontado
            discountAmount,

            // Código utilizado
            promoCode,

            // Precio final
            totalAmount,

            // Nested Write
            orderItems: {

                create: cartItems.map(item => ({

                    productId: item.productId,

                    quantity: item.quantity,

                    unitPrice: item.product.price,

                })),

            },

        },

        // Traer los items creados junto con la orden
        include: {
            orderItems: true,
        },

    });


    // Vaciar carrito después de crear la orden
    await prisma.cartItem.deleteMany({
        where: {
            userId: user.userId
        },
    });


    return res.status(200).json(order);

}
