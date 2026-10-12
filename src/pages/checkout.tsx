import { useState } from "react";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";

// 1. CONFIGURACIÓN DE LOS MÉTODOS DE PAGO
const paymentMethods = {
    nequi: {
        title: "Nequi",
        number: "310 399 0818",
    },
    llaves: {
        title: "Llaves",
        number: "@310 399 0818",
    },
    bancolombia: {
        title: "Bancolombia",
        number: "123456789",
    },
};

// 2. TIPO DE DATOS DE LA ORDEN

// Definimos la estructura de la orden que devuelve
// src/pages/api/orders/checkout.ts.
type OrderData = {
    id: number;
    subtotal: number;
    discountAmount: number;
    promoCode: string | null;
    totalAmount: number;
};

// ======================================================
// 3. COMPONENTE PRINCIPAL DEL CHECKOUT
// ======================================================

export default function Checkout() {
    // Guarda la orden completa recibida desde el backend.
    // Si todavía no se crea una orden, el valor será null.
    const [order, setOrder] = useState<OrderData | null>(null);

    // Guarda el método de pago seleccionado por el cliente.
    const [provider, setProvider] = useState("");

    // Evita que el usuario cree varias órdenes al mismo tiempo.
    const [creatingOrder, setCreatingOrder] = useState(false);

    // Evita enviar varias solicitudes de pago simultáneamente.
    const [processingPayment, setProcessingPayment] = useState(false);

    // 4. FORMATEAR PRECIOS EN PESOS COLOMBIANOS

    const formatCOP = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // 5. CREAR LA ORDEN

    const createOrder = async () => {
        // Evitamos solicitudes duplicadas mientras se procesa.
        if (creatingOrder) return;

        setCreatingOrder(true);

        try {
            // Recuperamos el JWT guardado cuando el usuario inició sesión.
            const token = localStorage.getItem("token");

            // Sin token, el cliente debe iniciar sesión.
            if (!token) {
                toast.error("Inicia sesión para continuar");
                return;
            }

            // Solicitamos al backend que cree la orden.
            const res = await fetch("/api/orders/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            // Convertimos la respuesta del servidor a JSON.
            const data = await res.json();

            // Si el backend devuelve un error, lo mostramos.
            if (!res.ok) {
                toast.error(
                    data.message || "No se pudo crear la orden"
                );
                return;
            }

            // Guardamos los valores calculados por el backend.
            // No calculamos el descuento aquí para evitar diferencias
            // entre el frontend y los valores oficiales de la orden.
            setOrder({
                id: data.id,
                subtotal: data.subtotal,
                discountAmount: data.discountAmount ?? 0,
                promoCode: data.promoCode ?? null,
                totalAmount: data.totalAmount,
            });

            // Confirmamos que la orden se creó.
            toast.success(`Orden #${data.id} creada correctamente`);
        } catch (error) {
            // Capturamos errores de conexión u otros errores inesperados.
            console.error("Error al crear la orden:", error);

            toast.error("Ocurrió un error al crear la orden");
        } finally {
            // Reactivamos el botón, incluso si ocurrió un error.
            setCreatingOrder(false);
        }
    };

    // 6. REGISTRAR EL PAGO Y ABRIR WHATSAPP

    const pay = async () => {
        // No se puede pagar si todavía no existe una orden.
        if (!order) {
            toast.error("Primero debes crear la orden");
            return;
        }

        // El cliente debe seleccionar un método de pago.
        if (!provider) {
            toast.error("Selecciona un método de pago");
            return;
        }

        // Evitamos solicitudes de pago duplicadas.
        if (processingPayment) return;

        setProcessingPayment(true);

        try {
            // Recuperamos el token de autenticación.
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Inicia sesión para continuar");
                return;
            }

            // Registramos el intento de pago en nuestra API.
            // La API recibe orderId y provider, como en tu implementación.
            const res = await fetch("/api/payments/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    orderId: order.id,
                    provider,
                }),
            });

            // Leemos la respuesta del backend.
            const data = await res.json();

            // Si no se pudo registrar el pago, detenemos el flujo.
            if (!res.ok) {
                toast.error(
                    data.message || "No se pudo registrar el pago"
                );
                return;
            }

            // Usamos la referencia devuelta por la API.
            // Si no existe, generamos una referencia visual alternativa.
            const reference = data.reference || `ORD-${order.id}`;

            // Obtenemos el nombre del método seleccionado.
            const selectedMethod =
                paymentMethods[
                    provider as keyof typeof paymentMethods
                ];

            // Construimos el mensaje con los datos de la orden.
            // encodeURIComponent permite enviar saltos de línea y emojis
            // correctamente dentro de la URL de WhatsApp.
            const messageText = [ 
                    "🛍️ NUEVA ORDEN - MARTHA STORE",
    "━━━━━━━━━━━━━━━━━━",
    `🧾 Orden: #${order.id}`,
    `💳 Método de pago: ${selectedMethod.title}`,
    `🔖 Referencia: ${reference}`,
    "",
    `💰 Subtotal: ${formatCOP(order.subtotal)}`,
    `🎁 Descuento: -${formatCOP(order.discountAmount)}`,
    ...(order.promoCode
        ? [`🏷️ Código aplicado: ${order.promoCode}`]
        : []),
    `✅ TOTAL A PAGAR: ${formatCOP(order.totalAmount)}`,
    "━━━━━━━━━━━━━━━━━━",
    "",
    "Hola 👋 Ya realicé la transferencia de mi orden.",
    "Adjuntaré el comprobante en este chat.",
    "Gracias."
            ].join("\n");

            const message= encodeURIComponent(messageText);

            // Abrimos WhatsApp con el número de atención del negocio
            // y el mensaje preparado para enviar.
            window.location.href =
                `https://wa.me/573103990818?text=${message}`;
        } catch (error) {
            // Registramos errores inesperados para poder diagnosticarlos.
            console.error("Error al procesar el pago:", error);

            toast.error("Ocurrió un error al procesar el pago");
        } finally {
            // Reactivamos el botón después de terminar la solicitud.
            setProcessingPayment(false);
        }
    };

    // 7. INTERFAZ DEL CHECKOUT

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
            {/* Barra de navegación de la tienda */}
            <Navbar />

            <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6 md:py-12">
                {/* Botón para volver a la página anterior */}
                <BackButton />

                {/* Encabezado de la página */}
                <p className="mt-6 text-sm font-semibold uppercase tracking-[0.35em] text-gray-400">
                    Checkout
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-5xl">
                    Finaliza tu compra
                </h1>

                <p className="mt-3 text-gray-500">
                    Revisa el valor de tu pedido y selecciona cómo quieres pagar.
                </p>

                {/* Contenedor principal del proceso de compra */}
                <section className="mt-8 space-y-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-xl md:p-8">

                    {/* ======================================
                        7.1. VISTA INICIAL: CREAR LA ORDEN
                    ====================================== */}

                    {!order && (
                        <>
                            <div className="rounded-2xl bg-gray-50 p-5">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Tu pedido está casi listo
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Crea tu orden para calcular el subtotal,
                                    aplicar el descuento disponible y conocer
                                    el total a pagar.
                                </p>
                            </div>

                            {/* Este botón llama a createOrder */}
                            <button
                                onClick={createOrder}
                                disabled={creatingOrder}
                                className="w-full rounded-full bg-black px-6 py-4 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {creatingOrder
                                    ? "Creando orden..."
                                    : "Crear mi orden"}
                            </button>
                        </>
                    )}

                    {/* ======================================
                        7.2. VISTA DESPUÉS DE CREAR LA ORDEN
                    ====================================== */}

                    {order && (
                        <>
                            {/* Número de orden y estado */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Número de orden
                                    </p>

                                    <h2 className="mt-1 text-2xl font-black text-gray-900">
                                        #{order.id}
                                    </h2>
                                </div>

                                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                                    Pendiente de pago
                                </span>
                            </div>

                            {/* ==================================
                                7.3. RESUMEN DE PRECIOS
                            ================================== */}

                            <div className="rounded-2xl border border-gray-100 p-5">
                                <h3 className="font-bold text-gray-900">
                                    Resumen de tu compra
                                </h3>

                                <div className="mt-5 space-y-4 text-sm">

                                    {/* Subtotal antes del descuento */}
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Subtotal
                                        </span>

                                        <span className="font-semibold text-gray-900">
                                            {formatCOP(order.subtotal)}
                                        </span>
                                    </div>

                                    {/* Dinero descontado por la promoción */}
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Descuento
                                        </span>

                                        <span className="font-semibold text-green-600">
                                            -{formatCOP(order.discountAmount)}
                                        </span>
                                    </div>

                                    {/* Mostramos el código si la orden lo tiene */}
                                    {order.promoCode && (
                                        <div className="flex items-center justify-between gap-4 rounded-xl bg-green-50 p-3">
                                            <div>
                                                <p className="text-xs text-green-700">
                                                    Código promocional aplicado
                                                </p>

                                                <p className="mt-1 font-black tracking-wider text-green-800">
                                                    {order.promoCode}
                                                </p>
                                            </div>

                                            <span className="text-sm font-bold text-green-700">
                                                ¡Ahorro aplicado!
                                            </span>
                                        </div>
                                    )}

                                    {/* Total definitivo devuelto por el backend */}
                                    <div className="border-t border-dashed border-gray-200 pt-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="font-bold text-gray-900">
                                                Total a pagar
                                            </span>

                                            <span className="text-2xl font-black text-gray-900">
                                                {formatCOP(order.totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ==================================
                                7.4. SELECCIONAR MÉTODO DE PAGO
                            ================================== */}

                            <div>
                                <label
                                    htmlFor="payment-method"
                                    className="font-bold text-gray-900"
                                >
                                    ¿Cómo deseas pagar?
                                </label>

                                <select
                                    id="payment-method"
                                    value={provider}
                                    onChange={(e) =>
                                        setProvider(e.target.value)
                                    }
                                    className="mt-3 w-full rounded-2xl border border-gray-200 bg-white p-4 outline-none transition focus:border-black"
                                >
                                    <option value="">
                                        Selecciona un método de pago
                                    </option>

                                    {/* Generamos las opciones desde paymentMethods */}
                                    {Object.entries(paymentMethods).map(
                                        ([key, method]) => (
                                            <option key={key} value={key}>
                                                {method.title}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* ==================================
                                7.5. DATOS DEL MÉTODO SELECCIONADO
                            ================================== */}

                            {provider && (
                                <div className="rounded-2xl bg-gray-50 p-5">
                                    <p className="text-sm text-gray-500">
                                        Datos para realizar tu transferencia
                                    </p>

                                    <h3 className="mt-2 text-xl font-black text-gray-900">
                                        {
                                            paymentMethods[
                                                provider as keyof typeof paymentMethods
                                            ].title
                                        }
                                    </h3>

                                    <p className="mt-2 text-lg font-bold tracking-wide text-gray-800">
                                        {
                                            paymentMethods[
                                                provider as keyof typeof paymentMethods
                                            ].number
                                        }
                                    </p>

                                    <p className="mt-3 text-sm text-gray-500">
                                        Transfiere exactamente{" "}
                                        <strong>
                                            {formatCOP(order.totalAmount)}
                                        </strong>
                                        . Después podrás enviar el comprobante
                                        por WhatsApp.
                                    </p>
                                </div>
                            )}

                            {/* ==================================
                                7.6. CONTINUAR A WHATSAPP
                            ================================== */}

                            <button
                                onClick={pay}
                                disabled={
                                    processingPayment || !provider
                                }
                                className="w-full rounded-full bg-black px-6 py-4 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processingPayment
                                    ? "Preparando pago..."
                                    : "Continuar por WhatsApp"}
                            </button>

                            {/* Aviso sobre la validación del pago */}
                            <p className="text-center text-xs leading-5 text-gray-400">
                                Tu pedido quedará pendiente hasta que se
                                verifique el pago y el comprobante.
                            </p>
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}