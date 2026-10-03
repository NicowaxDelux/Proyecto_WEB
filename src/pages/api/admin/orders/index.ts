import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import { isAdmin } from "../../../../middleware/isAdmin";


export default async function handler (

        req: NextApiRequest,
        res: NextApiResponse

){

    //Permitir GET
    if ( req.method !== "GET") {
        return res.status(405).json({message: "Metodo no permitido"});
    }

    // Verificar JWT
    const token = verifyToken(req, res);

    if(token !== true) {
        return;
    }

    // Verificar que sea admin
    const admin = isAdmin(req, res);

    if (admin !== true){
        return;
    }

    try {
        
        //obtener todos los pedidos
        const orders = await prisma.order.findMany({

            orderBy: { 
                createdAt: "desc"
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                orderItems: {
                    include:{
                        product: true
                    }
                },

                payment: true,
            }
        });

        return res.status(200).json(orders);

    } catch (error){

        console.error(error);
        return res.status(500).json({message: "Error al obtener los pedidos"});
    }
}