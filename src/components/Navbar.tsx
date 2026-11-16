import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// ==========================================
// IDENTIDAD DE LA TIENDA
// ==========================================

type StoreIdentity = {
    storeName: string;
    logoUrl: string | null;
};

export default function Navbar() {
    const { openCart, cartItems } = useCart();
    const router = useRouter();

    // El diseño oscuro se utilizará únicamente en la portada.
    const isHome = router.pathname === "/";

    // ==========================================
    // ESTADOS
    // ==========================================

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [store, setStore] = useState<StoreIdentity>({
        storeName: "Martha Store",
        logoUrl: null,
    });

    const totalItems = cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
    );

    // ==========================================
    // COMPROBAR INICIO DE SESIÓN
    // ==========================================

    useEffect(() => {
        const checkLogin = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };

        checkLogin();

        router.events.on("routeChangeComplete", checkLogin);

        return () => {
            router.events.off("routeChangeComplete", checkLogin);
        };
    }, [router.events]);

    // ==========================================
    // CARGAR IDENTIDAD DESDE MYSQL
    // ==========================================

    useEffect(() => {
        const loadStore = async () => {
            try {
                const res = await fetch("/api/store/settings");

                if (!res.ok) {
                    throw new Error("No se pudo cargar la tienda");
                }

                const data = await res.json();

                setStore({
                    storeName: data.storeName || "Martha Store",
                    logoUrl: data.logoUrl || null,
                });
            } catch (error) {
                console.error(
                    "Error cargando identidad de la tienda:",
                    error
                );
            }
        };

        loadStore();
    }, []);

    // ==========================================
    // CERRAR SESIÓN
    // ==========================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        router.push("/login");
    };

    // ==========================================
    // ESTILOS DINÁMICOS
    // ==========================================

    const navClass = isHome
        ? "absolute left-0 top-0 z-30 w-full bg-transparent text-white"
        : "relative z-30 w-full bg-white text-gray-900 shadow-sm";

    const linkClass = isHome
        ? "text-sm font-medium text-white/90 transition hover:text-white hover:underline underline-offset-8 md:text-base"
        : "text-sm font-medium text-gray-600 transition hover:text-black hover:underline underline-offset-8 md:text-base";

    return (
        <nav className={navClass}>
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-6 md:px-12">

                {/* ==========================================
                    LOGO Y NOMBRE DINÁMICOS
                ========================================== */}

                <Link
                    href="/"
                    className="flex min-w-0 items-center gap-4"
                >
                    {store.logoUrl ? (
                        <img
                            src={store.logoUrl}
                            alt={`Logo de ${store.storeName}`}
                            className="h-14 w-14 rounded-md object-contain"
                        />
                    ) : (
                        <span className="font-serif text-5xl font-light">
                            M
                        </span>
                    )}

                    <div className="border-l border-current/40 pl-4">
                        <span className="block text-lg font-semibold uppercase tracking-[0.2em] sm:text-xl md:text-2xl">
                            {store.storeName}
                        </span>

                        <span className="mt-1 block text-[9px] uppercase tracking-[0.45em] opacity-70 sm:text-[10px]">
                            Fashion & Style
                        </span>
                    </div>
                </Link>

                {/* ==========================================
                    ENLACES DE NAVEGACIÓN
                ========================================== */}

                <div className="flex flex-wrap items-center gap-5 md:gap-8">

                    <Link href="/" className={linkClass}>
                        Productos
                    </Link>

                    {/* CARRITO */}

                    <button
                        type="button"
                        onClick={openCart}
                        aria-label={`Abrir carrito, ${totalItems} productos`}
                        className={`relative flex items-center gap-2 ${linkClass}`}
                    >
                        <span className="text-xl">🛒</span>

                        <span className="hidden sm:inline">
                            Carrito
                        </span>

                        {totalItems > 0 && (
                            <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {/* USUARIO SIN SESIÓN */}

                    {!isLoggedIn && (
                        <Link
                            href="/login"
                            className={linkClass}
                        >
                            Login
                        </Link>
                    )}

                    {/* USUARIO CON SESIÓN */}

                    {isLoggedIn && (
                        <>
                            <Link
                                href="/my-orders"
                                className={linkClass}
                            >
                                Mis pedidos
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className={linkClass}
                            >
                                Cerrar sesión
                            </button>
                        </>
                    )}

                </div>
            </div>
        </nav>
    );
}