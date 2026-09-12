import type { NextApiRequest, NextApiResponse } from "next";
import { prisma} from "../../../../lib/prisma";
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

    //verificar JWT
    const token = verifyToken(req,res);

    if(token !== true) {
        return;
    }

    //verificar que sea admin
    const admin = isAdmin(req,res);

    if(admin !== true) {
        return;
    }

    try {

        //obtener todos los usuarios
        const users = await prisma.user.findMany({

            select:{
                id:true,
                name:true,
                email:true,
                role:true,
                createdAt:true,
            },

            orderBy:{
                createdAt: "desc"
            }
        });

        return res.status(200).json(users);

    }catch (error) {

        console.error(error);

        return res.status(500).json({message: "Error al obtener los usuarios"});
    }
}
