import type {NextApiRequest, NextApiResponse} from "next";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

        // solo permitimos POST

        if (req.method !== "POST") {
            return res.status(405).json({error: "Metodo no permitdo"});
        }

        const {email, password, name} = req.body;

        //validacion de correo y contraseña que se debe llenar para poder ingresar

        if (!email || !password){
            return res.status(400).json({error: "Email y contraseña requeridos"});
        }

        //verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        //condicion para validar si el usario existe y no se duplique
        if (existingUser) {
            return res.status(409).json({error: "El usuario ya existe" });
        }

        //hashear contraseña 
        const hashedPassword = await bcrypt.hash(password, 10);

        //Guardar usuario en la base de datos 
        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            }
        });

        // devolvemos como repuesta el usuario que se ha registrado
        return res.status(201).json({ message: "Usuario registrado correctamente"});
}