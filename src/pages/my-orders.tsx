
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

interface OrderPayment {
    id: number;
    provider: string;
    status: string;
    amount: number;
    reference: string | null;
    createdAt: string;
}

interface OrderItem {
    id: number;
    quantity: number;
    unitPrice: number;
    size: string | null;
    color: string | null;
    product: {
        id: number;
        name: string;
        imageUrl: string | null;
    };
}

interface Order {
    id: number;
    subtotal: number;
    discountAmount: number;
    promoCode: string | null;
    totalAmount: number;
    status: string;
    createdAt: string;
    orderItems: OrderItem[];
    payment: OrderPayment[];
}

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Formatear valores en pesos colombianos.
    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Traducir los estados de los pedidos.
    const getOrderStatus = (status: string) => {
        const statuses: Record<string, string> = {
            PENDING: "Pendiente",
            PREPARING: "En preparación",
            SHIPPED: "Enviado",
            DELIVERED: "Entregado",
            CANCELLED: "Cancelado",
        };

        return statuses[status] || status;
    };

    // Traducir los estados de los pagos.
    const getPaymentStatus = (status: string) => {
        const statuses: Record<string, string> = {
            PENDING: "Pendiente",
            PAID: "Pagado",
            CANCELLED: "Cancelado",
        };

        return statuses[status] || status;
    };

    // Obtener el color correspondiente al estado del pedido.
    const getOrderStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-800",
            PREPARING: "bg-blue-100 text-blue-800",
            SHIPPED: "bg-indigo-100 text-indigo-800",
            DELIVERED: "bg-green-100 text-green-800",
            CANCELLED: "bg-red-100 text-red-800",
        };

        return colors[status] || "bg-gray-100 text-gray-700";
    };

    // Obtener el color correspondiente al estado del pago.
    const getPaymentStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: "bg-yellow-100 text-yellow-800",
            PAID: "bg-green-100 text-green-800",
            CANCELLED: "bg-red-100 text-red-800",
        };

        return colors[status] || "bg-gray-100 text-gray-700";
    };

    // Consultar los pedidos del cliente autenticado.
    const loadOrders = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Debes iniciar sesión para consultar tus pedidos.");
                return;
            }

            const res = await fetch("/api/orders", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "No se pudieron cargar tus pedidos.");
                return;
            }

            setOrders(data);
        } catch (error) {
            console.error("Error al consultar pedidos:", error);
            setError("Ocurrió un error al cargar tus pedidos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-gray-50 px-4 py-10 md:px-8">
                <div className="mx-auto max-w-6xl">

                    {/* Encabezado */}
                    <div className="mb-10">
                        <Link
                            href="/"
                            className="text-sm text-gray-500 hover:text-black transition"
                        >
                            ← Volver a productos
                        </Link>

                        <h1 className="mt-5 text-3xl font-semibold text-gray-900 md:text-4xl">
                            Mis pedidos
                        </h1>

                        <p className="mt-2 text-gray-500">
                            Consulta tus compras y el estado de tus pedidos.
                        </p>
                    </div>

                    {/* Cargando */}
                    {loading && (
                        <div className="rounded-2xl border bg-white p-10 text-center">
                            <p className="text-gray-500">
                                Cargando tus pedidos...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
                            <p className="text-red-600">{error}</p>

                            <Link
                                href="/login"
                                className="mt-5 inline-block rounded-lg bg-black px-6 py-3 text-sm text-white hover:bg-gray-800 transition"
                            >
                                Iniciar sesión
                            </Link>
                        </div>
                    )}

                    {/* Sin pedidos */}
                    {!loading && !error && orders.length === 0 && (
                        <div className="rounded-2xl border bg-white px-6 py-16 text-center">
                            <div className="mb-4 text-5xl">
                                🛍️
                            </div>

                            <h2 className="text-xl font-semibold text-gray-900">
                                Todavía no tienes pedidos
                            </h2>

                            <p className="mt-2 text-gray-500">
                                Cuando realices tu primera compra, aparecerá aquí.
                            </p>

                            <Link
                                href="/"
                                className="mt-6 inline-block rounded-lg bg-black px-7 py-3 text-sm text-white hover:bg-gray-800 transition"
                            >
                                Explorar productos
                            </Link>
                        </div>
                    )}

                    {/* Lista de pedidos */}
                    {!loading && !error && orders.length > 0 && (
                        <div className="space-y-6">
                            {orders.map((order) => {
                                const latestPayment = order.payment?.[0];

                                return (
                                    <section
                                        key={order.id}
                                        className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                                    >
                                        {/* Información principal del pedido */}
                                        <div className="flex flex-col gap-5 border-b p-5 md:flex-row md:items-center md:justify-between md:p-6">

                                            <div>
                                                <p className="text-xs uppercase tracking-wider text-gray-400">
                                                    Número de pedido
                                                </p>

                                                <h2 className="mt-1 text-xl font-semibold">
                                                    #{order.id}
                                                </h2>

                                                <p className="mt-2 text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString(
                                                        "es-CO",
                                                        {
                                                            day: "numeric",
                                                            month: "long",
                                                            year: "numeric",
                                                        }
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                <div>
                                                    <p className="mb-2 text-xs text-gray-400">
                                                        Estado del pedido
                                                    </p>

                                                    <span
                                                        className={`rounded-full px-3 py-1.5 text-xs font-medium ${getOrderStatusColor(order.status)}`}
                                                    >
                                                        {getOrderStatus(order.status)}
                                                    </span>
                                                </div>

                                                <div>
                                                    <p className="mb-2 text-xs text-gray-400">
                                                        Estado del pago
                                                    </p>

                                                    {latestPayment ? (
                                                        <span
                                                            className={`rounded-full px-3 py-1.5 text-xs font-medium ${getPaymentStatusColor(latestPayment.status)}`}
                                                        >
                                                            {getPaymentStatus(latestPayment.status)}
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600">
                                                            Sin registro
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Productos del pedido */}
                                        <div className="space-y-5 p-5 md:p-6">
                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Productos comprados
                                            </h3>

                                            {order.orderItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex gap-4"
                                                >
                                                    {/* Imagen */}
                                                    <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                        {item.product.imageUrl ? (
                                                            <img
                                                                src={item.product.imageUrl}
                                                                alt={item.product.name}
                                                                className="h-full w-full object-contain"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center text-2xl text-gray-400">
                                                                👕
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Información del producto */}
                                                    <div className="flex flex-1 flex-col justify-center">
                                                        <h4 className="font-medium text-gray-900">
                                                            {item.product.name}
                                                        </h4>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Talla: {item.size || "No especificada"}
                                                        </p>

                                                        <p className="text-sm text-gray-500">
                                                            Color: {item.color || "No especificado"}
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Cantidad: {item.quantity}
                                                        </p>
                                                    </div>

                                                    {/* Precio */}
                                                    <div className="flex items-center text-sm font-medium text-gray-900">
                                                        {formatPrice(
                                                            item.unitPrice * item.quantity
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Resumen económico */}
                                        <div className="border-t bg-gray-50 p-5 md:p-6">
                                            <div className="ml-auto max-w-sm space-y-3">

                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>Subtotal</span>
                                                    <span>
                                                        {formatPrice(order.subtotal)}
                                                    </span>
                                                </div>

                                                {order.discountAmount > 0 && (
                                                    <div className="flex justify-between text-sm text-green-700">
                                                        <span>
                                                            Descuento {order.promoCode ? `(${order.promoCode})` : ""}
                                                        </span>

                                                        <span>
                                                            -{formatPrice(order.discountAmount)}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between border-t pt-3 text-base font-semibold text-gray-900">
                                                    <span>Total del pedido</span>

                                                    <span>
                                                        {formatPrice(order.totalAmount)}
                                                    </span>
                                                </div>

                                                {latestPayment && (
                                                    <p className="pt-1 text-right text-xs text-gray-400">
                                                        Referencia: {latestPayment.reference || `Pago #${latestPayment.id}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
