import type { NextApiRequest, NextApiResponse } from 'next';
import {prisma} from '../../../lib/prisma';
import {verifyToken} from '../../../middleware/auth';
import {isAdmin} from '../../../middleware/isAdmin';


{/* 
    Dashboard del panel de administración. Devuelve estadísticas
    y datos relevantes para el administrador.
*/}

export default async function handler(

    req: NextApiRequest,
    res: NextApiResponse

) {

    // Solo se permite el método GET
    if (req.method !== 'GET') {
        return res.status(405).json({message: 'Metodo no permitido'});
    }

    // Verificar el token de autenticación
    const token = verifyToken(req , res);

    if(token !== true) return;

    // Verificar si el usuario es administrador

    const admin = isAdmin(req,res);

    if (admin !== true) return;

    /*
    Consultas a la base de datos
    */

    //total productos
    const totalProducts = await prisma.product.count();

    //total pedidos
    const totalOrders = await prisma.order.count();

    //total ventas
    const totalSales = await prisma.order.aggregate({
        _sum: {
            totalAmount: true
        }
    });

    //productos con poco stock

    const lowStock = await prisma.product.count({

        where: {
            stock: {
                lte: 5 
            }
        }
    });

    /*
        Respuesta
    */

    return res.status(200).json({

        totalProducts,

        totalOrders,

        totalSales: totalSales._sum.totalAmount || 0,

        lowStock
    });
}