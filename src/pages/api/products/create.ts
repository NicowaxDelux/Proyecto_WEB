import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../middleware/auth";
import { isAdmin } from "../../../middleware/isAdmin";


export default async function handler(
    req:NextApiRequest,
    res:NextApiResponse
) {
    
    //Valida el metodo HTTP si es un POST
    if(req.method !== "POST")
        return res.status(401).end();

    //Verificar el token del usuario, para poder acceder
    if(!verifyToken(req,res)) return;

    /*Verificar si es administrador, sino lo es, le enviara un mensaje
    *diciendo que solo el administrador puede hacerlo.
    */
    if(!isAdmin(req,res)) return;

    //Extrae los datos enviados desde frontend o Postman. 
    const {name, price, imageUrl, stock} = req.body;

    //Crea el producto en la Base de Datos
    const product = await prisma.product.create({
       data: {
        name,
        price,
        imageUrl,
        stock,
       }, 
    });

    //devuelve proucto creado
    return res.status(201).json(product);

}
