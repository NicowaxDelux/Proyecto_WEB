import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  try {

    //Obtiene la lista de productos disponibles de forma descendente(desde la ultima a la primera)
    if (req.method === "GET") {
      const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
      return res.status(200).json(products);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
