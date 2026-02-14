import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";

    export default async function handler(
        req: NextApiRequest,
        res: NextApiResponse
    ){
        //solo permite el metodo post
        if (req.method !== "POST") {
            return res.status(405).json({message: "Metodo no permitido"});
        }

        //extraemos el email y el password del body
        const {email, password} = req.body;

        // buscamos el usuario por el email
        const user = await prisma.user.findUnique ({
            where: {email},
        });

        //validamos que el usuario ingrese bien el correo,
        //si no existe credenciales invalidas
        if (!user) {
            res.status(401).json({message: "Correo incorrecto"});
        }

        //comparamos el password del body con el de la base de datos
        const isValid = await bcrypt.compare(password, user.password);

        //validamos que la contraseña sea correcta, 
        //si no existe credenciales invalidas
        if (!isValid) {
            res.status(401).json({message: "Contraseña incorrecta"})
        }

        //Generamos el token 
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn:"7d",
            }
        );

        //Se envia el token al usuario 
        return res.status(200).json({token});
    }