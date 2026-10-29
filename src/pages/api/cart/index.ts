import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { verifyToken } from "../../../middleware/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo permitimos consultar el carrito mediante GET.
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);

    return res.status(405).json({
      message: "Método no permitido",
    });
  }

  // Verificamos que el usuario esté autenticado.
  const auth = verifyToken(req, res);

  if (auth !== true) {
    return;
  }

  const user = (req as any).user;

  try {
    // Consultamos los artículos del carrito del usuario.
    const cartInfo = await prisma.cartItem.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        product: true,
        variant: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json(cartInfo);
  } catch (error) {
    console.error("Error consultando el carrito:", error);

    return res.status(500).json({
      message: "Error al consultar el carrito",
    });
  }
}
