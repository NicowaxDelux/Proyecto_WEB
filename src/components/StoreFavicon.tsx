
import { useEffect, useState } from "react";
import Head from "next/head";

// ==========================================
// CONFIGURACIÓN DEL FAVICON
// ==========================================

type StoreFaviconSettings = {
    storeName: string;
    faviconUrl: string | null;
};

export default function StoreFavicon() {

    const [settings, setSettings] =
        useState<StoreFaviconSettings>({
            storeName: "Martha Store",
            faviconUrl: null,
        });

    // ==========================================
    // CARGAR CONFIGURACIÓN PÚBLICA
    // ==========================================

    useEffect(() => {

        const loadSettings = async () => {

            try {

                const res = await fetch("/api/store/settings");

                if (!res.ok) {
                    throw new Error(
                        "No se pudo cargar el favicon"
                    );
                }

                const data = await res.json();

                setSettings({
                    storeName: data.storeName || "Martha Store",
                    faviconUrl: data.faviconUrl || null,
                });

            } catch (error) {

                console.error(
                    "Error cargando favicon:",
                    error
                );

            }
        };

        loadSettings();

    }, []);

    // ==========================================
    // ACTUALIZAR HEAD DEL NAVEGADOR
    // ==========================================

    return (
        <Head>
            <title>{settings.storeName}</title>

            {settings.faviconUrl && (
                <link
                    key="store-favicon"
                    rel="icon"
                    href={settings.faviconUrl}
                />
            )}
        </Head>
    );
}
