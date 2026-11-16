import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ==========================================
// CONFIGURACIÓN PÚBLICA DE LA PORTADA
// ==========================================

type HeroSettings = {
    storeName: string;
    heroImageUrl: string | null;
    description: string | null;
};

export default function Hero() {

    // ==========================================
    // ESTADOS
    // ==========================================

    const [store, setStore] = useState<HeroSettings>({
        storeName: "Martha Store",
        heroImageUrl: null,
        description: null,
    });

    // ==========================================
    // CARGAR CONFIGURACIÓN DESDE MYSQL
    // ==========================================

    useEffect(() => {

        const loadHero = async () => {

            try {

                const res = await fetch("/api/store/settings");

                if (!res.ok) {
                    throw new Error("No se pudo cargar la portada");
                }

                const data = await res.json();

                setStore({
                    storeName: data.storeName || "Martha Store",
                    heroImageUrl: data.heroImageUrl || null,
                    description: data.description || null,
                });

            } catch (error) {

                console.error(
                    "Error cargando portada:",
                    error
                );

            }
        };

        loadHero();

    }, []);

    // ==========================================
    // DESCRIPCIÓN PREDETERMINADA
    // ==========================================

    const description =
        store.description ||
        "Descubre prendas seleccionadas para quienes buscan calidad, estilo y comodidad en cada detalle.";

    // ==========================================
    // INTERFAZ
    // ==========================================

    return (
        <section
            className="
                relative isolate w-full overflow-hidden
                bg-[#090909] text-white
                min-h-[100svh]
            "
        >

            {/* ==========================================
                FONDO EDITORIAL
            ========================================== */}

            <div
                className="
                    pointer-events-none absolute inset-0
                    bg-gradient-to-r
                    from-black via-[#101010] to-[#242424]
                "
            />

            {/* Iluminación decorativa */}

            <div
                className="
                    pointer-events-none absolute
                    right-[-15%] top-[-20%]
                    h-[700px] w-[700px]
                    rounded-full bg-white/5
                    blur-[150px]
                "
            />

            {/* ==========================================
                CONTENIDO PRINCIPAL
            ========================================== */}

            <div
                className="
                    relative z-10 mx-auto
                    grid w-full max-w-7xl
                    grid-cols-1 items-center
                    gap-8 px-6
                    pb-12 pt-40
                    md:px-12
                    lg:min-h-[100svh]
                    lg:grid-cols-2
                    lg:gap-12
                    lg:pb-8 lg:pt-32
                "
            >

                {/* ==========================================
                    CONTENIDO EDITORIAL
                ========================================== */}

                <div className="relative z-20 text-center lg:text-left">

                    {/* Etiqueta de colección */}

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="
                            mb-10 inline-flex
                            border border-white/40
                            px-6 py-3
                            text-xs font-medium
                            uppercase tracking-[0.35em]
                            text-white
                        "
                    >
                        Nueva colección
                    </motion.div>

                    {/* Título principal */}

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.1 }}
                        className="
                            text-5xl font-light
                            uppercase leading-[1.08]
                            tracking-tight
                            sm:text-6xl
                            xl:text-7xl
                        "
                    >
                        Viste tu

                        <span
                            className="
                                mt-2 block font-semibold
                                tracking-[-0.04em]
                            "
                        >
                            mejor versión
                        </span>
                    </motion.h1>

                    {/* Descripción dinámica */}

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="
                            mx-auto mt-9 max-w-xl
                            text-base leading-8
                            text-gray-300
                            lg:mx-0 lg:text-lg
                        "
                    >
                        {description}
                    </motion.p>

                    {/* Botón explorar */}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mt-12"
                    >
                        <a
                            href="#productos"
                            className="
                                inline-flex items-center
                                justify-center gap-5
                                border border-white
                                bg-white px-9 py-4
                                text-xs font-semibold
                                uppercase tracking-[0.2em]
                                text-black
                                transition duration-300
                                hover:bg-transparent
                                hover:text-white
                            "
                        >
                            Explorar colección

                            <span aria-hidden="true">
                                →
                            </span>
                        </a>
                    </motion.div>

                </div>

                {/* ==========================================
                    FOTOGRAFÍA PRINCIPAL
                ========================================== */}

                <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                        duration: 1,
                        delay: 0.2,
                    }}
                    className="
                        relative mx-auto
                        h-[380px] w-full
                        max-w-[560px]
                        overflow-hidden
                        sm:h-[480px]
                        lg:h-[calc(100svh-170px)]
                        lg:max-h-[650px]
                    "
                >

                    {/* Imagen cargada desde Cloudinary */}

                    <img
                        src={
                            store.heroImageUrl ||
                            "/images/Yo2.png"
                        }
                        alt={`Nueva colección de ${store.storeName}`}
                        className="
                            h-full w-full
                            object-cover
                            object-center
                        "
                    />

                    {/* Sombra inferior */}

                    <div
                        className="
                            pointer-events-none
                            absolute inset-x-0 bottom-0
                            h-24
                            bg-gradient-to-t
                            from-black/50 to-transparent
                        "
                    />

                </motion.div>

            </div>

        </section>
    );
}
