import type { NextApiRequest, NextApiResponse } from "next"; 
import {prisma} from "../../../../lib/prisma";
import {verifyToken} from "../../../../middleware/auth";
import {isAdmin} from "../../../../middleware/isAdmin";

/*
    Obtiene  todos los productos de la base de datos.
    Solo Admin
*/

export default async function handler (

        req: NextApiRequest,
        res: NextApiResponse
){

    //validar token

    const auth = verifyToken(req, res);

    if (auth !== true) return;

    // validar rol admin

    const admin = isAdmin( req, res);

    if (admin !== true) return;

    //GET
    // obtener todos los productos

    if (req.method === "GET"){

        try {

            const products = await prisma.product.findMany({

                orderBy:{
                    createdAt: "desc"
                }
            });

            return res.status(200).json(products);
        }
        catch (error) {

            console.error(error);

            return res.status(500).json({message: "Error obteniendo prodcutos"});
        }
    }


    //POST
    //Crear producto

    if (req.method === "POST") {

        try{

            // Obtener datos enviados por Frontend
            const {name, description, price, stock, imageUrl} = req.body;

            //Validaciones

            if (!name) {

                return res.status(400).json({message: "El nombre es obligatorio"});
            }

            if (price === undefined || Number(price) <= 0) {

                return res.status(400).json({message: "El precio debe ser mayor a 0"});
            }

            if (stock === undefined || Number(stock) <= 0) {

                return res.status(400).json({message: "El stock tiene que se mayor a 0"})
            }

            //Crear prodcuto en MySQL

            const product = await prisma.product.create({

                data: {

                    name: name.trim(),

                    description: description?.trim() || null,

                    price: Number(price),

                    stock: Number(stock),

                    imageUrl: imageUrl?.trim() || null
                }
            });

            return res.status(201).json({message: "Prodcuto creado correctamente", product});



        }catch (error){

            console.error("Error creando el producto", error);

            return res.status(500).json({message: "Error creando el producto"});
        }
    }

    //Metodo no soportado

    return res.status(405).json({message: "Metodo no soportado"});

}