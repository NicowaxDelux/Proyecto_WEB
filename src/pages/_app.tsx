import "../styles/globals.css";
import type { AppProps } from "next/app";
import { CartProvider } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import { Toaster } from "react-hot-toast";

// Componente para actualizar el favicon y el título
import StoreFavicon from "../components/StoreFavicon";

export default function App({
    Component,
    pageProps,
}: AppProps) {

    return (
        <CartProvider>

            {/* ==========================================
                FAVICON Y NOMBRE DINÁMICOS
            ========================================== */}

            <StoreFavicon />

            {/* ==========================================
                NOTIFICACIONES
            ========================================== */}

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 2500,
                    style: {
                        background: "#111",
                        color: "#fff",
                        borderRadius: "12px",
                    },
                }}
            />

            {/* ==========================================
                CARRITO LATERAL
            ========================================== */}

            <CartDrawer />

            {/* ==========================================
                PÁGINA ACTUAL
            ========================================== */}

            <Component {...pageProps} />

        </CartProvider>
    );
}