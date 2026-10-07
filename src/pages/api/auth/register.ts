import type {NextApiRequest, NextApiResponse} from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

        // solo permitimos POST

        if (req.method !== "POST") {
            return res.status(405).json({error: "Metodo no permitdo"});
        }


        try {

            const {email, password, name} = req.body;

            //validar campos vacios
            if (!email || !password || !name) {
                return res.status(400).json({message: "Todos los campos son obligatorios"});
            }

            //validar longitud de contraseña
            if (password.lenght < 6) {
                return res.status(400).json({message: "La contraseña debe tener al menos 6 caracteres"});   
            }

            //normalizar email
            const normalizedEmail = email.trim().tolowerCase();

            //comprobar si el correo existe
            const existingUser = await prisma.user.findUnique({
                where: {
                    email: normalizedEmail,
                }
            });

            if (existingUser) {
                return res.status(400).json({message: "Este correo ya esta registrado. Inicia sesión para continuar"});
            }

            //encriptar contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            //crear usuario
            const user = await prisma.user.create({
                data: {

                    name: name.trim(),
                    email: normalizedEmail,
                    password: hashedPassword,
                    role: "CLIENT",

                    //Beneficio exclusivo para el primer registro
                    welcomeCode: "STYLE11",
                    welcomeDiscountUsed: false
                }
            });

            //crear jwt token
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

            return res.status(201).json(
                {
                    message: "Cuenta creada correctamente",
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }

                });


        }catch (error) {
            console.error(error);
            return res.status(500).json({message: "Error al crear la cuenta"});
        }

}