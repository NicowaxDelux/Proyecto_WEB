import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import { isAdmin } from "../../../../middleware/isAdmin";

export default async function handler (

        req: NextApiRequest,
        res: NextApiResponse

){

    //Validar metodo GET
    if( req.method !== "GET") {
        return res.status(405).json({message: "Metodo no permitido"});
    }

    // Verificar JWT
    const token = verifyToken(req, res);

    if(token !== true) {
        return;
    }

    // Verificar que sea admin
    const admin = isAdmin(req, res);

    if( admin !== true) {
        return;
    }

    try {

        //obtener todos los pagos
        const payments = await prisma.payment.findMany({

            orderBy: {
                createdAt: "desc"
            },

            include: {
                order: {
                    include: {
                        user:{
                            select:{
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json(payments);


    } catch (error) {

        console.error(error);

        return res.status(500).json({message: "Error al obtener los pagos"});

    }
}