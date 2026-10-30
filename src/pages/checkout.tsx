
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

// Estructura de los productos que devuelve /api/cart.
type CheckoutItem = {
    id: number;
    quantity: number;
    product: {
        id: number;
        name: string;
        price: number;
        imageUrl?: string | null;
    };
    variant: {
        id: number;
        size: string;
        color: string;
        stock: number;
    } | null;
};

type CreatedOrder = {
    id: number;
    subtotal: number;
    discountAmount: number;
    promoCode: string | null;
    totalAmount: number;
    orderItems: {
        quantity: number;
        unitPrice: number;
        size: string | null;
        color: string | null;
        product: {
            name: string;
        };
    }[];
};

export default function Checkout() {
    const [cartItems, setCartItems] = useState<CheckoutItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [creatingOrder, setCreatingOrder] = useState(false);
    const [error, setError] = useState("");

    const { refreshCart } = useCart();

    // Formato de precios colombianos.
    const formatCOP = (amount: number) =>
        new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(amount);

    // Consultar el carrito sin crear ninguna orden.
    const loadCart = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Inicia sesión para continuar con tu compra.");
                return;
            }

            const res = await fetch("/api/cart", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "No se pudo consultar tu carrito.");
                return;
            }

            if (!Array.isArray(data)) {
                setError("No se pudo obtener la información del carrito.");
                return;
            }

            setCartItems(data);
        } catch (error) {
            console.error("Error consultando carrito:", error);
            setError("Ocurrió un error al cargar tu pedido.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    // Calcular el subtotal de los productos mostrados.
    const subtotal = cartItems.reduce(
        (total, item) =>
            total + item.product.price * item.quantity,
        0
    );

    // Comprobar que todos los productos tengan variante
    // y que todavía exista stock suficiente.
    const invalidItems = cartItems.filter(
        (item) =>
            !item.variant ||
            item.variant.stock < item.quantity ||
            item.quantity <= 0
    );

    const canCreateOrder =
        cartItems.length > 0 &&
        invalidItems.length === 0 &&
        !creatingOrder;

    // Crear la orden únicamente cuando el cliente lo solicite.
    const sendOrderToWhatsApp = async () => {
        if (creatingOrder) return;

        if (cartItems.length === 0) {
            toast.error("Tu carrito está vacío.");
            return;
        }

        if (invalidItems.length > 0) {
            toast.error(
                "Revisa las tallas, colores y existencias de tus productos."
            );
            return;
        }

        setCreatingOrder(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Inicia sesión para continuar.");
                return;
            }

            // Aquí se crea la orden en la base de datos.
            const res = await fetch("/api/orders/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data: CreatedOrder = await res.json();

            if (!res.ok) {
                toast.error(
                    (data as any).message || "No se pudo crear el pedido."
                );

                // Actualizar el carrito por si cambió el stock.
                await loadCart();
                return;
            }

            // Construir el detalle real devuelto por el backend.
            const productLines = data.orderItems.flatMap((item, index) => [
                `${index + 1}. ${item.product.name}`,
                `   Talla: ${item.size || "No especificada"}`,
                `   Color: ${item.color || "No especificado"}`,
                `   Cantidad: ${item.quantity}`,
                `   Precio: ${formatCOP(item.unitPrice * item.quantity)}`,
                "",
            ]);

            const messageText = [
                "🛍️ NUEVO PEDIDO - MARTHA STORE",
                "━━━━━━━━━━━━━━━━━━",
                `🧾 Número de pedido: #${data.id}`,
                "",
                "📦 DETALLE DE MI PEDIDO",
                ...productLines,
                "━━━━━━━━━━━━━━━━━━",
                `💰 Subtotal: ${formatCOP(data.subtotal)}`,
                `🎁 Descuento: -${formatCOP(data.discountAmount)}`,
                ...(data.promoCode
                    ? [`🏷️ Código aplicado: ${data.promoCode}`]
                    : []),
                `✅ TOTAL: ${formatCOP(data.totalAmount)}`,
                "━━━━━━━━━━━━━━━━━━",
                "",
                "Hola 👋 Acabo de enviar mi pedido desde Martha Store.",
                "Quisiera continuar con la compra y recibir información sobre los métodos de pago disponibles.",
                "",
                "¡Gracias! 😊",
            ].join("\n");

            const whatsappUrl =
                `https://wa.me/573103990818?text=${encodeURIComponent(messageText)}`;

            // Sincronizar el contexto del carrito.
            await refreshCart();

            // Abrir WhatsApp con el pedido preparado.
            window.location.href = whatsappUrl;

        } catch (error) {
            console.error("Error enviando pedido:", error);
            toast.error("Ocurrió un error al preparar tu pedido.");
        } finally {
            setCreatingOrder(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
            <Navbar />

            <main className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-12">
                <BackButton />

                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-gray-400">
                    Checkout
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-5xl">
                    Tu pedido
                </h1>

                <p className="mt-3 text-gray-500">
                    Revisa tus productos, tallas y colores antes de enviar
                    tu pedido a nuestro equipo.
                </p>

                <section className="mt-8 space-y-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl md:p-8">

                    {/* CARGANDO CARRITO */}
                    {loading && (
                        <div className="py-12 text-center">
                            <p className="font-semibold text-gray-700">
                                Cargando tu pedido...
                            </p>
                        </div>
                    )}

                    {/* ERROR */}
                    {!loading && error && (
                        <div className="rounded-2xl bg-red-50 p-5 text-center">
                            <p className="font-semibold text-red-700">
                                {error}
                            </p>

                            <button
                                onClick={loadCart}
                                className="mt-4 rounded-full bg-black px-6 py-3 text-sm font-bold text-white"
                            >
                                Intentar nuevamente
                            </button>
                        </div>
                    )}

                    {/* CARRITO VACÍO */}
                    {!loading && !error && cartItems.length === 0 && (
                        <div className="py-12 text-center">
                            <div className="text-5xl">🛍️</div>

                            <h2 className="mt-4 text-xl font-bold text-gray-900">
                                Tu carrito está vacío
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Agrega algunos productos para preparar tu pedido.
                            </p>
                        </div>
                    )}

                    {/* PRODUCTOS DEL PEDIDO */}
                    {!loading && !error && cartItems.length > 0 && (
                        <>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Productos seleccionados
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {cartItems.length} producto(s) en tu pedido
                                </p>
                            </div>

                            <div className="space-y-5">
                                {cartItems.map((item) => {
                                    const variantAvailable =
                                        item.variant !== null &&
                                        item.variant.stock >= item.quantity;

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-4 rounded-2xl border border-gray-100 p-4 sm:flex-row"
                                        >
                                            <img
                                                src={
                                                    item.product.imageUrl ||
                                                    "/placeholder.png"
                                                }
                                                alt={item.product.name}
                                                className="h-36 w-full rounded-xl object-cover sm:h-32 sm:w-28"
                                            />

                                            <div className="flex flex-1 flex-col justify-between">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">
                                                        {item.product.name}
                                                    </h3>

                                                    {item.variant ? (
                                                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                                                            <p>
                                                                Talla:{" "}
                                                                <strong className="text-gray-800">
                                                                    {item.variant.size}
                                                                </strong>
                                                            </p>

                                                            <p>
                                                                Color:{" "}
                                                                <strong className="text-gray-800">
                                                                    {item.variant.color}
                                                                </strong>
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-sm font-semibold text-red-600">
                                                            Falta seleccionar una variante.
                                                        </p>
                                                    )}

                                                    <p className="mt-2 text-sm text-gray-500">
                                                        Cantidad: {item.quantity}
                                                    </p>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between gap-3">
                                                    <span className="text-sm text-gray-500">
                                                        {formatCOP(item.product.price)} c/u
                                                    </span>

                                                    <strong className="text-lg text-gray-900">
                                                        {formatCOP(
                                                            item.product.price *
                                                            item.quantity
                                                        )}
                                                    </strong>
                                                </div>

                                                {!variantAvailable && (
                                                    <p className="mt-2 text-sm font-semibold text-red-600">
                                                        Producto no disponible en la cantidad seleccionada.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* RESUMEN DE PRECIOS */}
                            <div className="rounded-2xl bg-gray-50 p-5">
                                <h3 className="font-bold text-gray-900">
                                    Resumen de tu pedido
                                </h3>

                                <div className="mt-5 flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        Subtotal
                                    </span>

                                    <strong className="text-gray-900">
                                        {formatCOP(subtotal)}
                                    </strong>
                                </div>

                                <div className="mt-3 flex justify-between text-sm">
                                    <span className="text-gray-500">
                                        Descuentos
                                    </span>

                                    <span className="text-gray-600">
                                        Se calcularán al confirmar tu pedido.
                                    </span>
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
                                    <span className="font-bold text-gray-900">
                                        Total provisional
                                    </span>

                                    <strong className="text-2xl font-black text-gray-900">
                                        {formatCOP(subtotal)}
                                    </strong>
                                </div>

                                <p className="mt-3 text-xs leading-5 text-gray-500">
                                    Si tienes un beneficio promocional disponible,
                                    se aplicará al generar tu pedido. El total
                                    definitivo se mostrará en WhatsApp.
                                </p>
                            </div>

                            {/* INFORMACIÓN DE WHATSAPP */}
                            <div className="rounded-2xl border border-green-100 bg-green-50 p-5">
                                <h3 className="font-bold text-gray-900">
                                    Completa tu compra por WhatsApp
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    Al enviar tu pedido, nuestro equipo recibirá
                                    los productos y sus variantes. Un asesor te
                                    ayudará a completar la compra y coordinar
                                    el pago.
                                </p>
                            </div>

                            {/* VALIDACIÓN Y ENVÍO */}
                            {invalidItems.length > 0 && (
                                <p className="text-sm font-semibold text-red-600">
                                    Revisa los productos que presentan problemas
                                    de talla, color o disponibilidad antes de continuar.
                                </p>
                            )}

                            <button
                                onClick={sendOrderToWhatsApp}
                                disabled={!canCreateOrder}
                                className="flex w-full items-center justify-center gap-3 rounded-full bg-green-600 px-6 py-4 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <span className="text-xl">💬</span>

                                {creatingOrder
                                    ? "Preparando tu pedido..."
                                    : "Enviar pedido por WhatsApp"}
                            </button>

                            <p className="text-center text-xs leading-5 text-gray-400">
                                Tu pedido solo se registrará cuando pulses
                                el botón de envío. El pago se coordinará
                                directamente con nuestro asesor.
                            </p>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}
