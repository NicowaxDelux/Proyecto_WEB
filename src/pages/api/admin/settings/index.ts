import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../lib/prisma";
import { verifyToken } from "../../../../middleware/auth";
import { isAdmin } from "../../../../middleware/isAdmin";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // =====================================
    // 1. VERIFICAR AUTENTICACIÓN
    // =====================================

    const token = verifyToken(req, res);

    if (token !== true) return;

    // =====================================
    // 2. VERIFICAR PERMISOS DE ADMINISTRADOR
    // =====================================

    const admin = isAdmin(req, res);

    if (admin !== true) return;

    try {

        // =====================================
        // 3. CONSULTAR CONFIGURACIÓN (GET)
        // =====================================

        if (req.method === "GET") {

            let settings = await prisma.storeSettings.findFirst();

            // Si todavía no existe configuración,
            // creamos el registro inicial.
            if (!settings) {
                settings = await prisma.storeSettings.create({
                    data: {
                        storeName: "Martha Store",
                    },
                });
            }

            return res.status(200).json(settings);
        }

        // =====================================
        // 4. ACTUALIZAR CONFIGURACIÓN (PUT)
        // =====================================

        if (req.method === "PUT") {

            const {
                storeName,
                logoUrl,
                faviconUrl,
                heroImageUrl,
                contactEmail,
                whatsapp,
                instagramUrl,
                facebookUrl,
                description,
                shippingInfo,
                returnPolicy,
            } = req.body;

            if (!storeName || !storeName.trim()) {
                return res.status(400).json({
                    message: "El nombre de la tienda es obligatorio",
                });
            }

            // Buscamos el registro existente.
            let settings = await prisma.storeSettings.findFirst();

            if (!settings) {

                // Si no existe, lo creamos.
                settings = await prisma.storeSettings.create({
                    data: {
                        storeName: storeName.trim(),
                        logoUrl,
                        faviconUrl,
                        heroImageUrl,
                        contactEmail,
                        whatsapp,
                        instagramUrl,
                        facebookUrl,
                        description,
                        shippingInfo,
                        returnPolicy,
                    },
                });

            } else {

                // Si existe, actualizamos sus datos.
                settings = await prisma.storeSettings.update({
                    where: {
                        id: settings.id,
                    },
                    data: {
                        storeName: storeName.trim(),
                        logoUrl,
                        faviconUrl,
                        heroImageUrl,
                        contactEmail,
                        whatsapp,
                        instagramUrl,
                        facebookUrl,
                        description,
                        shippingInfo,
                        returnPolicy,
                    },
                });

            }

            return res.status(200).json({
                message: "Configuración actualizada correctamente",
                settings,
            });
        }

        // =====================================
        // 5. MÉTODOS NO PERMITIDOS
        // =====================================

        res.setHeader("Allow", ["GET", "PUT"]);

        return res.status(405).json({
            message: "Método no permitido",
        });

    } catch (error) {

        console.error("Error en la configuración de la tienda:", error);

        return res.status(500).json({
            message: "Error al procesar la configuración de la tienda",
        });

    }
}