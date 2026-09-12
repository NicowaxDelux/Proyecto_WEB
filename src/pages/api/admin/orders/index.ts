import { NextApiRequest, NextApiResponse } from "next";
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
    const admin = isAdmin(req, res)
}