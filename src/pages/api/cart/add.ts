import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../middleware/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Esta ruta solo permite agregar artículos mediante POST.
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      message: "Método no permitido",
    });
  }

  // Verificar la sesión del usuario.
  const auth = verifyToken(req, res);
  if (auth !== true) return;

  const user = (req as any).user;

  // Recibir producto, variante y cantidad desde el frontend.
  const { productId, variantId, quantity } = req.body;

  const numericProductId = Number(productId);
  const numericVariantId = Number(variantId);
  const numericQuantity = Number(quantity);

  // Validar los identificadores y la cantidad solicitada.
  if (
    !Number.isInteger(numericProductId) ||
    numericProductId <= 0 ||
    !Number.isInteger(numericVariantId) ||
    numericVariantId <= 0 ||
    !Number.isInteger(numericQuantity) ||
    numericQuantity <= 0
  ) {
    return res.status(400).json({
      message: "Producto, variante o cantidad inválidos",
    });
  }

  try {
    // Buscar la variante y comprobar que pertenece al producto.
    const variant = await prisma.productVariant.findFirst({
      where: {
        id: numericVariantId,
        productId: numericProductId,
      },
      include: {
        product: true,
      },
    });

    if (!variant) {
      return res.status(404).json({
        message: "La combinación seleccionada no existe para este producto",
      });
    }

    // No permitir agregar variantes agotadas.
    if (variant.stock <= 0) {
      return res.status(409).json({
        message: "Esta combinación está agotada",
      });
    }

    // Buscar el artículo exacto: mismo usuario, producto y variante.
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.userId,
        productId: numericProductId,
        variantId: numericVariantId,
      },
    });

    // Sumar la cantidad actual del carrito a la nueva cantidad solicitada.
    const totalQuantity =
      (existingItem?.quantity ?? 0) + numericQuantity;

    // No permitir que el carrito supere las existencias disponibles.
    if (totalQuantity > variant.stock) {
      return res.status(409).json({
        message: `Solo hay ${variant.stock} unidades disponibles de la talla ${variant.size}, color ${variant.color}`,
      });
    }

    // Crear o actualizar el artículo del carrito.
    const cartItem = await prisma.$transaction(async (tx) => {
      if (existingItem) {
        return tx.cartItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity: totalQuantity,
          },
        });
      }

      return tx.cartItem.create({
        data: {
          userId: user.userId,
          productId: numericProductId,
          variantId: numericVariantId,
          quantity: numericQuantity,
        },
      });
    });

    return res.status(existingItem ? 200 : 201).json({
      message: "Producto agregado al carrito",
      cartItem,
    });
  } catch (error) {
    console.error("Error agregando producto al carrito:", error);

    return res.status(500).json({
      message: "Error al agregar el producto al carrito",
    });
  }
}
