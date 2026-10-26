import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import { isAdmin } from "../../../../middleware/isAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Verificar que el usuario tenga un token válido.
  const auth = verifyToken(req, res);
  if (auth !== true) return;

  // 2. Comprobar que el usuario tenga el rol ADMIN.
  const admin = isAdmin(req, res);
  if (admin !== true) return;

  // 3. GET: listar los productos y sus variantes.
  if (req.method === "GET") {
    try {
      const products = await prisma.product.findMany({
        orderBy: {
          createdAt: "desc",
        },
        // Incluimos las variantes para mostrarlas en el panel.
        include: {
          variants: {
            orderBy: [
              { size: "asc" },
              { color: "asc" },
            ],
          },
        },
      });

      return res.status(200).json(products);
    } catch (error) {
      console.error("Error obteniendo productos:", error);

      return res.status(500).json({
        message: "Error obteniendo productos",
      });
    }
  }

  // 4. POST: crear un producto y todas sus variantes.
  if (req.method === "POST") {
    try {
      const {
        name,
        description,
        price,
        imageUrl,
        sizes,
        colors,
      } = req.body;

      // Validar el nombre.
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "El nombre es obligatorio",
        });
      }

      // Validar que el precio sea un número válido mayor que cero.
      const numericPrice = Number(price);

      if (
        price === undefined ||
        price === null ||
        price === "" ||
        !Number.isFinite(numericPrice) ||
        numericPrice <= 0
      ) {
        return res.status(400).json({
          message: "El precio debe ser mayor a 0",
        });
      }

      // Validar las tallas y los colores recibidos desde el formulario.
      if (
        !Array.isArray(sizes) ||
        !Array.isArray(colors) ||
        sizes.length === 0 ||
        colors.length === 0
      ) {
        return res.status(400).json({
          message: "Debes agregar al menos una talla y un color",
        });
      }

      // Limitar el número de opciones para evitar crear accidentalmente
      // una cantidad excesiva de combinaciones.
      if (sizes.length > 50 || colors.length > 50) {
        return res.status(400).json({
          message: "Puedes agregar hasta 50 tallas y 50 colores por producto",
        });
      }

      // Comprobar que cada opción sea texto válido y no esté vacía.
      const validOptions = (options: unknown[]): boolean =>
        options.every(
          (option) =>
            typeof option === "string" &&
            option.trim().length > 0 &&
            option.trim().length <= 50
        );

      if (!validOptions(sizes) || !validOptions(colors)) {
        return res.status(400).json({
          message: "Las tallas y los colores deben ser textos válidos",
        });
      }

      // Limpiar espacios y eliminar duplicados sin distinguir mayúsculas.
      const cleanOptions = (options: string[]): string[] => {
        const unique = new Map<string, string>();

        for (const option of options) {
          const cleaned = option.trim();
          const key = cleaned.toLocaleLowerCase();

          if (!unique.has(key)) {
            unique.set(key, cleaned);
          }
        }

        return Array.from(unique.values());
      };

      const cleanSizes = cleanOptions(sizes as string[]);
      const cleanColors = cleanOptions(colors as string[]);

      // Evitar crear demasiadas variantes por una selección accidental.
      if (cleanSizes.length * cleanColors.length > 500) {
        return res.status(400).json({
          message: "El producto no puede tener más de 500 combinaciones",
        });
      }

      // Crear todas las combinaciones talla + color con stock 0.
      const variants = cleanSizes.flatMap((size) =>
        cleanColors.map((color) => ({
          size,
          color,
          stock: 0,
        }))
      );

      // Una transacción garantiza que el producto y sus variantes
      // se creen juntos: si algo falla, no queda un producto incompleto.
      const product = await prisma.$transaction(async (tx) => {
        const newProduct = await tx.product.create({
          data: {
            name: name.trim(),
            description:
              typeof description === "string"
                ? description.trim() || null
                : null,
            price: numericPrice,

            // El stock real se administrará en ProductVariant.
            // Dejamos en cero el campo antiguo del producto.
            stock: 0,

            imageUrl:
              typeof imageUrl === "string"
                ? imageUrl.trim() || null
                : null,
          },
        });

        await tx.productVariant.createMany({
          data: variants.map((variant) => ({
            productId: newProduct.id,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
          })),
        });

        // Devolvemos el producto con las variantes que acabamos de crear.
        return tx.product.findUniqueOrThrow({
          where: { id: newProduct.id },
          include: {
            variants: true,
          },
        });
      });

      return res.status(201).json({
        message: "Producto y variantes creados correctamente",
        product,
      });
    } catch (error) {
      console.error("Error creando producto y variantes:", error);

      return res.status(500).json({
        message: "Error creando el producto y sus variantes",
      });
    }
  }

  // 5. Rechazar los métodos HTTP que no soportamos.
  res.setHeader("Allow", ["GET", "POST"]);

  return res.status(405).json({
    message: "Método no soportado",
  });
}