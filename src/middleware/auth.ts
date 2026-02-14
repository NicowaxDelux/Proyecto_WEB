import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

/*
*Middleware para verificar JWT
*/

export function verifyToken(
    req: NextApiRequest,
    res: NextApiResponse
) {
    //obtener el header Authorizatiom
    const authHeader = req.headers.authorization;

    //validar que exista

    if(!authHeader) {
        return res.status(401).json({message: 'Token Requerido'});
    }

    //El formato esperado es: Bearer TOKEN
    const token = authHeader.replace("Bearer ", "");

    //verificar que sea el esperado 
    if(!token) {
        return res.status(401).json({message: 'Token invalido'});
    }   

    try {
        //verificar token 
        //Validar firma y expiración
        const decoded = jwt.verify (
            token,
            process.env.JWT_SECRET as string
        );
        // Guardar el usuario decodificado en el request
        // (esto es CLAVE para las siguientes rutas)
        (req as any).user = decoded;

        return true;

    } catch(error) {
        return res.status(401).json({message:'Token invalido o expirado'});
    }
}