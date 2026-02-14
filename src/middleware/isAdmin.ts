import { NextApiRequest, NextApiResponse } from "next";

export function isAdmin(
    req:NextApiRequest,
    res:NextApiResponse
) {
    //Obtener el usuario desde el request 
    const user = (req as any).user

    //Validar que el usuario tenga el rol de ADMIN y obtengan el permiso.
    if (user.role !== "ADMIN"){
        return res.status(403).json({message:'Acceso solo para administradores'});
    }

    return true;
}