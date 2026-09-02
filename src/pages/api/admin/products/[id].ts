import { NextApiRequest, NextApiResponse } from "next";
import  {prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import { isAdmin } from "../../../../middleware/isAdmin";


// API PARA ACTUALIZAR UN PRODUCTO

export default async function handler (

        req: NextApiRequest,
        res: NextApiResponse

){

     // 1. VERIFICAR QUE EL MÉTODO SEA PUT
     if( req.method !== "PUT" && req.method !== "DELETE") {
        
        return res.status(405).json({message: "Metodo no permitido"});
     }

     // 2. VERIFICAR TOKEN JWT

     const token = verifyToken(req, res);

     if (token !== true) {
        return;
     }

     // 3. VERIFICAR QUE SEA ADMIN

     const admin = isAdmin(req, res);

     if(admin !== true) {
        return;
     }

     // 4. OBTENER EL ID DEL PRODUCTO

     const {id} = req.query;
     
     const productId = Number(id);

     // ELIMINAR PRODUCTO

    if (req.method === "DELETE") {

        try {

            // Buscar primero el producto
            const product = await prisma.product.findUnique({
                
                where: {
                    id: productId
                }
            });

            // Verificar que exista
            if(!product) {
                return res.status(404).json({message:"Producto no encontrado"});
            }

            // Eliminar producto
            await prisma.product.delete({
                
                where: {
                    id: productId
                }
            });

            // Respuesta exitosa
            return res.status(200).json({ success: true, message: "Producto elimidado correctamne "});

        }catch(error){

            console.error("Error al eliminar el producto", error);

            // Error relacionado con relaciones de Prisma
            return res.status(409).json({message:"No se puede eliminar este producto porque tiene registros relacionados, por ejemplo órdenes o carritos."})

        }
    }

     // 5. VALIDAR EL ID

     if (isNaN(productId)) {
        return res.status(400).json({message:"ID de prodcuto invalido"});
     }

     try {

        // 6. OBTENER LOS DATOS ENVIADOS
        const {
            name,
            description,
            price,
            stock,
            imageUrl
        } = req.body;

        // 7. VALIDAR DATOS IMPORTANTES

        if (!name || price === undefined || stock ===undefined) {
            return res.status(400).json({message: "Nombre, precio y stock son obligatorios"})
        }

        // 8. ACTUALIZAR PRODUCTO
        
        const updateProduct = await prisma.product.update({

            where: {
                id: productId,
            },
            
            data: {
                name, 
                description,
                price: Number(price),
                stock: Number(stock),
                imageUrl
            }
        });

        // 9. DEVOLVER PRODUCTO ACTUALIZADO

        return res.status(200).json(updateProduct);

    }catch(error){

        console.error(
            "Error al actualizar producto",
            error
        );

        return res.status(500).json({
            message: "Error al actualizar producto"
        });
     
    }
}
