import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import { isAdmin } from "../../../../middleware/isAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Solo permitimos editar o eliminar productos.
  if (req.method !== "PUT" && req.method !== "DELETE") {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    return res.status(405).json({
      message: "Método no permitido",
    });
  }

  // Verificamos autenticación y permisos de administrador.
  const auth = verifyToken(req, res);
  if (auth !== true) return;

  const admin = isAdmin(req, res);
  if (admin !== true) return;

  const rawId = req.query.id;
  const productId = Number(
    Array.isArray(rawId) ? rawId[0] : rawId
  );

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({
      message: "El identificador del producto no es válido",
    });
  }

  try {
    // ELIMINAR PRODUCTO
    if (req.method === "DELETE") {
      try {
        await prisma.product.delete({
          where: { id: productId },
        });

        return res.status(200).json({
          message: "Producto eliminado correctamente",
        });
      } catch (error: any) {
        if (error?.code === "P2003" || error?.code === "P2014") {
          return res.status(409).json({
            message:
              "No se puede eliminar el producto porque tiene registros relacionados.",
          });
        }

        if (error?.code === "P2025") {
          return res.status(404).json({
            message: "El producto no existe",
          });
        }

        throw error;
      }
    }

    // DATOS RECIBIDOS DEL FORMULARIO
    const {
      name,
      description,
      price,
      imageUrl,
      variants,
    } = req.body ?? {};

    // El stock general ya no es obligatorio:
    // las existencias se administran por variante.
    if (
      typeof name !== "string" ||
      !name.trim() ||
      price === "" ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        message: "El nombre y un precio válido son obligatorios",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "La descripción no es válida",
      });
    }

    if (
      imageUrl !== undefined &&
      imageUrl !== null &&
      typeof imageUrl !== "string"
    ) {
      return res.status(400).json({
        message: "La URL de imagen no es válida",
      });
    }

    if (variants !== undefined && !Array.isArray(variants)) {
      return res.status(400).json({
        message: "La lista de variantes no es válida",
      });
    }

    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!currentProduct) {
      return res.status(404).json({
        message: "El producto no existe",
      });
    }

    // Validamos las variantes antes de escribir en la base de datos.
    const normalizedVariants: Array<{
      id?: number;
      size: string;
      color: string;
      stock: number;
    }> = [];

    const combinations = new Set<string>();
    const ids = new Set<number>();

    for (const item of variants ?? []) {
      const size =
        typeof item.size === "string" ? item.size.trim() : "";

      const color =
        typeof item.color === "string" ? item.color.trim() : "";

      const stock = Number(item.stock);

      if (
        !size ||
        !color ||
        !Number.isInteger(stock) ||
        stock < 0
      ) {
        return res.status(400).json({
          message:
            "Cada variante debe tener talla, color y stock entero mayor o igual a cero.",
        });
      }

      const key = `${size.toLowerCase()}::${color.toLowerCase()}`;

      if (combinations.has(key)) {
        return res.status(400).json({
          message: `La combinación ${size} / ${color} está repetida.`,
        });
      }

      combinations.add(key);

      let id: number | undefined;

      if (item.id !== undefined && item.id !== null) {
        id = Number(item.id);

        if (!Number.isInteger(id) || id <= 0 || ids.has(id)) {
          return res.status(400).json({
            message: "Hay un identificador de variante inválido.",
          });
        }

        ids.add(id);
      }

      normalizedVariants.push({
        ...(id !== undefined ? { id } : {}),
        size,
        color,
        stock,
      });
    }

    // Comprobamos que todos los IDs existentes sean de este producto.
    const existingIds = normalizedVariants
      .filter((item) => item.id !== undefined)
      .map((item) => item.id as number);

    if (existingIds.length > 0) {
      const ownedVariants = await prisma.productVariant.findMany({
        where: {
          productId,
          id: { in: existingIds },
        },
        select: {
          id: true,
          size: true,
          color: true,
        },
      });

      if (ownedVariants.length !== existingIds.length) {
        return res.status(400).json({
          message: "Una variante no pertenece a este producto.",
        });
      }

      // No permitimos cambiar la identidad de una variante existente.
      for (const item of normalizedVariants) {
        if (item.id === undefined) continue;

        const original = ownedVariants.find(
          (variant) => variant.id === item.id
        );

        if (
          !original ||
          original.size !== item.size ||
          original.color !== item.color
        ) {
          return res.status(400).json({
            message:
              "No se puede cambiar la talla o el color de una variante existente.",
          });
        }
      }
    }

    // Si hay variantes en el formulario, el stock general será
    // la suma de sus existencias. No se exige enviarlo por separado.
    const totalStock =
      variants !== undefined
        ? normalizedVariants.reduce(
            (total, item) => total + item.stock,
            0
          )
        : currentProduct.stock;

    // Actualizamos el producto y sus variantes en una transacción.
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name: name.trim(),
          description:
            description === undefined
              ? currentProduct.description
              : description?.trim() || null,
          price: Number(price),
          imageUrl:
            imageUrl === undefined
              ? currentProduct.imageUrl
              : imageUrl?.trim() || null,
          stock: totalStock,
        },
      });

      for (const item of normalizedVariants) {
        if (item.id !== undefined) {
          // Actualizamos la cantidad de una variante existente.
          await tx.productVariant.update({
            where: { id: item.id },
            data: { stock: item.stock },
          });
        } else {
          // Creamos una combinación nueva o actualizamos su stock
          // si ya existe para este producto.
          await tx.productVariant.upsert({
            where: {
              productId_size_color: {
                productId,
                size: item.size,
                color: item.color,
              },
            },
            create: {
              productId,
              size: item.size,
              color: item.color,
              stock: item.stock,
            },
            update: {
              stock: item.stock,
            },
          });
        }
      }
    });

    // Devolvemos el producto actualizado con su inventario.
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          orderBy: [{ size: "asc" }, { color: "asc" }],
        },
      },
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error actualizando producto e inventario:", error);

    return res.status(500).json({
      message: "No se pudieron guardar los cambios del producto.",
    });
  }
}
