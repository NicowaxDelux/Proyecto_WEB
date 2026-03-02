import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../middleware/auth";


export default async function handler(

    req: NextApiRequest,
    res: NextApiResponse
){

    //verificar useer con token
    if (!verifyToken(req,res)) return;

    //obtener user del token
    const user = ( req as any ).user;

    //obtener el user del carrito
    const cartItems = await prisma.cartItem.findMany({
        where: { userId: user.userId},
        include: { product: true },
    });

    //Validar que el carrito no esté vacío
    if  (cartItems.length === 0){
        res.status(400).json({message: 'Carrito vacío'});
    }
    
    //calcular total
    const totalAmount = cartItems.reduce((acc ,item) => {
        return acc + item.product.price * item.quantity;
    }, 0);

    //Crear orden
    const order = await prisma.order.create({
        data: {
            userId: user.userId,
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

    //vaciar carrito despues de crear la orden
    await prisma.cartItem.deleteMany({
        where: {userId: user.userId},
    }); 

    res.json(order);
}
