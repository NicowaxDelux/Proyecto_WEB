import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Esta ruta pública solo permite consultar productos.
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    // Obtener productos junto con sus variantes de talla y color.
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        variants: {
          orderBy: [
            { size: "asc" },
            { color: "asc" },
          ],
          // Incluimos también las variantes agotadas.
          // Así la tienda puede mostrarlas deshabilitadas.
        },
      },
    });

    // Se devuelve un arreglo de productos, ahora con variants.
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error obteniendo productos:", error);

    return res.status(500).json({
      error: "Error del servidor al obtener los productos",
    });
  }
}