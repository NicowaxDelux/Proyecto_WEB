import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

// ==========================================
// CONFIGURACIÓN PÚBLICA DE LA TIENDA
// ==========================================

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Solo permitimos consultar la configuración.
    if (req.method !== "GET") {
        res.setHeader("Allow", ["GET"]);

        return res.status(405).json({
            message: "Método no permitido",
        });
    }

    try {
        // Buscamos la configuración guardada.
        const settings = await prisma.storeSettings.findFirst({
            select: {
                storeName: true,
                logoUrl: true,
                faviconUrl: true,
                heroImageUrl: true,
                contactEmail: true,
                whatsapp: true,
                instagramUrl: true,
                facebookUrl: true,
                description: true,
                shippingInfo: true,
                returnPolicy: true,
            },
        });

        // Si todavía no existe, usamos valores iniciales.
        if (!settings) {
            return res.status(200).json({
                storeName: "Martha Store",
                logoUrl: null,
                faviconUrl: null,
                heroImageUrl: null,
                contactEmail: null,
                whatsapp: null,
                instagramUrl: null,
                facebookUrl: null,
                description: null,
                shippingInfo: null,
                returnPolicy: null,
            });
        }

        // Enviamos únicamente los datos públicos.
        return res.status(200).json(settings);

    } catch (error) {
        console.error(
            "Error obteniendo configuración pública:",
            error
        );

        return res.status(500).json({
            message: "Error al cargar la configuración de la tienda",
        });
    }
}