import { useEffect, useState } from "react";
import Link from "next/link";

// ==========================================
// INFORMACIÓN PÚBLICA DE MARTHA STORE
// ==========================================

type FooterSettings = {
    storeName: string;
    logoUrl: string | null;
    description: string | null;
    contactEmail: string | null;
    whatsapp: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    shippingInfo: string | null;
    returnPolicy: string | null;
};

const initialSettings: FooterSettings = {
    storeName: "Martha Store",
    logoUrl: null,
    description: null,
    contactEmail: null,
    whatsapp: null,
    instagramUrl: null,
    facebookUrl: null,
    shippingInfo: null,
    returnPolicy: null,
};

export default function Footer() {

    // ==========================================
    // ESTADOS
    // ==========================================

    const [settings, setSettings] =
        useState<FooterSettings>(initialSettings);

    const [activePolicy, setActivePolicy] =
        useState<"shipping" | "returns" | null>(null);

    // ==========================================
    // CARGAR CONFIGURACIÓN DESDE MYSQL
    // ==========================================

    useEffect(() => {

        let cancelled = false;

        const loadSettings = async () => {

            try {

                const res = await fetch("/api/store/settings");

                if (!res.ok) {
                    throw new Error(
                        "No se pudo cargar la información de la tienda"
                    );
                }

                const data = await res.json();

                if (!cancelled) {
                    setSettings({
                        storeName: data.storeName || "Martha Store",
                        logoUrl: data.logoUrl || null,
                        description: data.description || null,
                        contactEmail: data.contactEmail || null,
                        whatsapp: data.whatsapp || null,
                        instagramUrl: data.instagramUrl || null,
                        facebookUrl: data.facebookUrl || null,
                        shippingInfo: data.shippingInfo || null,
                        returnPolicy: data.returnPolicy || null,
                    });
                }

            } catch (error) {

                console.error(
                    "Error cargando Footer:",
                    error
                );

            }
        };

        void loadSettings();

        return () => {
            cancelled = true;
        };

    }, []);

    // ==========================================
    // PREPARAR ENLACE DE WHATSAPP
    // ==========================================

    const whatsappNumber = (settings.whatsapp || "")
        .replace(/\D/g, "");

    const whatsappUrl = whatsappNumber
        ? `https://wa.me/${whatsappNumber}`
        : null;

    // ==========================================
    // INTERFAZ
    // ==========================================

    return (
        <footer className="bg-[#090909] text-white">

            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 md:px-12">

                <div className="grid gap-12 md:grid-cols-3">

                    {/* ==================================
                        IDENTIDAD DE LA TIENDA
                    ================================== */}

                    <div>

                        <Link
                            href="/"
                            className="flex items-center gap-4"
                        >

                            {settings.logoUrl && (
                                <img
                                    src={settings.logoUrl}
                                    alt={`Logo de ${settings.storeName}`}
                                    className="h-14 w-14 object-contain"
                                />
                            )}

                            <div>
                                <h2 className="text-xl font-semibold uppercase tracking-[0.2em]">
                                    {settings.storeName}
                                </h2>

                                <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-gray-400">
                                    Fashion & Style
                                </p>
                            </div>

                        </Link>

                        <p className="mt-6 max-w-sm text-sm leading-7 text-gray-400">
                            {settings.description ||
                                "Moda con identidad, calidad y estilo. Viste tu mejor versión."}
                        </p>

                    </div>

                    {/* ==================================
                        ATENCIÓN AL CLIENTE
                    ================================== */}

                    <div>

                        <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.2em]">
                            Atención al cliente
                        </h3>

                        <div className="flex flex-col items-start gap-4 text-sm text-gray-400">

                            {whatsappUrl && (
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition hover:text-white"
                                >
                                    WhatsApp
                                </a>
                            )}

                            {settings.contactEmail && (
                                <p
                                    className="transition hover:text-white"
                                >
                                    {settings.contactEmail}
                                </p>
                            )}

                            {settings.shippingInfo && (
                                <button
                                    type="button"
                                    onClick={() => setActivePolicy("shipping")}
                                    className="text-left transition hover:text-white"
                                >
                                    Información de envíos
                                </button>
                            )}

                            {settings.returnPolicy && (
                                <button
                                    type="button"
                                    onClick={() => setActivePolicy("returns")}
                                    className="text-left transition hover:text-white"
                                >
                                    Cambios y devoluciones
                                </button>
                            )}

                        </div>

                    </div>

                    {/* ==================================
                        REDES SOCIALES
                    ================================== */}

                    <div>

                        <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.2em]">
                            Síguenos
                        </h3>

                        <div className="flex flex-col items-start gap-4 text-sm text-gray-400">

                            {settings.instagramUrl && (
                                <a
                                    href={settings.instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition hover:text-white"
                                >
                                    Instagram
                                </a>
                            )}

                            {settings.facebookUrl && (
                                <a
                                    href={settings.facebookUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="transition hover:text-white"
                                >
                                    Facebook
                                </a>
                            )}

                            {!settings.instagramUrl &&
                                !settings.facebookUrl && (
                                    <p className="text-xs text-gray-500">
                                        Próximamente
                                    </p>
                                )}

                        </div>

                    </div>

                </div>

                {/* ==================================
                    COPYRIGHT
                ================================== */}

                <div className="mt-16 border-t border-white/20 pt-6 text-center">

                    <p className="text-xs tracking-wide text-gray-500">
                        © {new Date().getFullYear()} {settings.storeName}.
                        Todos los derechos reservados.
                    </p>

                </div>

            </div>

            {/* ==================================
                VENTANA DE POLÍTICAS
            ================================== */}

            {activePolicy && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
                    onClick={() => setActivePolicy(null)}
                >

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="policy-title"
                        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 text-gray-900 shadow-2xl md:p-8"
                        onClick={(event) => event.stopPropagation()}
                    >

                        <div className="flex items-start justify-between gap-4">

                            <h2
                                id="policy-title"
                                className="text-xl font-semibold"
                            >
                                {activePolicy === "shipping"
                                    ? "Información de envíos"
                                    : "Cambios y devoluciones"}
                            </h2>

                            <button
                                type="button"
                                onClick={() => setActivePolicy(null)}
                                aria-label="Cerrar ventana"
                                className="text-2xl text-gray-500 hover:text-black"
                            >
                                ×
                            </button>

                        </div>

                        <p className="mt-6 whitespace-pre-line break-words text-sm leading-7 text-gray-600">
                            {activePolicy === "shipping"
                                ? settings.shippingInfo
                                : settings.returnPolicy}
                        </p>

                    </div>

                </div>

            )}

        </footer>
    );
}
