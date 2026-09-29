import type { NextApiRequest, NextApiResponse } from "next";
import { OAuth2Client } from "google-auth-library";
import jwt  from "jsonwebtoken";
import { prisma } from "../../../lib/prisma"

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
);

export default async function handler(

    req: NextApiRequest,
    res: NextApiResponse

){

    //Solo se permite POST
    if ( req.method !== "POST"){
        return res.status(405).json({message: "Metodo no permitido"});
    }

    try {

        //Recibimos la credencial de Google Requerida
        const {  credential } = req.body;

        if (!credential) {
            return res.status(400).json({message: "Credencial de google requerida"})
        }

        //Verificamos que la credencial venga realmente de google
        const ticket = await client.verifyIdToken({

            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });


        const payload = ticket.getPayload();

        if(!payload) {
            return res.status(401).json({message: "Credencial de Google invalida"})
        }

        const email = payload.email;
        const name = payload.name;


        if (!email) {
            return res.status(400).json({message: "Google no proporciono un email"})
        }

        //Buscamos si el usuario ya existe
        let user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        //si no existe lo creamos
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || null,
                    password: null,
                    role: "CLIENT"
                }
            });
        }

        //Gerenamos nuestro JWT
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });

    } catch (error){

        console.error("Error Google Login:", error);
        
        return res.status(401).json({message: "No se pudo autenticar en Google"});
    }

}