
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../lib/prisma";
import { verifyToken } from "../../../../../middleware/auth";
import { isAdmin } from "../../../../../middleware/isAdmin";   

const SIZES = ["S", "M", "L", "XL"];
const COLORS = ["Blanco", "Negro"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Este endpoint solo acepta solicitudes POST.
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      message: "Método no permitido",
    });
  }

  // Verificar el token antes de permitir cambios en el inventario.
  const auth = verifyToken(req, res);
  if (auth !== true) return;

  const admin = isAdmin(req,res);

  // Solo los administradores pueden crear variantes.
  if (!admin) {
    return res.status(403).json({
      message: "No tienes permisos para crear variantes",
    });
  }

  // Obtener y validar el ID del producto de la URL.
  const rawId = req.query.id;
  const productId =
    typeof rawId === "string" ? Number(rawId) : NaN;

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: "El ID del producto no es válido",
    });
  }

  try {
    // Verificar que el producto ya exista.
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    // Preparar las combinaciones sin cambiar el stock del producto.
    const variants = SIZES.flatMap((size) =>
      COLORS.map((color) => ({
        productId,
        size,
        color,
        stock: 0,
      }))
    );

    // Crear solo las combinaciones que aún no existan.
    // skipDuplicates aprovecha la restricción única
    // productId + size + color del modelo ProductVariant.
    const result = await prisma.productVariant.createMany({
      data: variants,
      skipDuplicates: true,
    });

    // Consultar las variantes existentes después de la operación.
    const savedVariants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: [
        { size: "asc" },
        { color: "asc" },
      ],
    });

    return res.status(200).json({
      message: "Variantes procesadas correctamente",
      product: {
        id: product.id,
        name: product.name,
        originalStock: product.stock,
      },
      created: result.count,
      totalVariants: savedVariants.length,
      variants: savedVariants,
    });
  } catch (error) {
    console.error("Error creando variantes:", error);

    return res.status(500).json({
      message: "No se pudieron crear las variantes",
    });
  }
}
