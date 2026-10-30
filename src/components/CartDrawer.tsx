
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export default function CartDrawer() {
  const router = useRouter();

  const {
    isOpen,
    closeCart,
    cartItems,
    refreshCart,
    totalPrice,
  } = useCart();

  const [updatingItem, setUpdatingItem] = useState<number | null>(null);

  // Formato de precios en pesos colombianos.
  const formatPrice = (price: number) =>
    Number(price).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });

  // Elimina un artículo del carrito.
  const removeItem = async (id: number) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/cart/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItemId: id }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.message || "No se pudo eliminar el producto");
        return;
      }

      await refreshCart();
      toast.success("Producto eliminado");
    } catch (error) {
      console.error("Error eliminando artículo:", error);
      toast.error("Error al eliminar el producto");
    }
  };

  // Cambia la cantidad de un artículo.
  const updateQuantity = async (id: number, quantity: number) => {
    // Si llega a cero, eliminamos el artículo.
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    try {
      setUpdatingItem(id);

      const token = localStorage.getItem("token");

      const res = await fetch("/api/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cartItemId: id,
          quantity,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(data?.message || "No se pudo actualizar la cantidad");
        return;
      }

      await refreshCart();
    } catch (error) {
      console.error("Error actualizando cantidad:", error);
      toast.error("Error al actualizar la cantidad");
    } finally {
      setUpdatingItem(null);
    }
  };

  // Navega al checkout solo si hay artículos.
  const goToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Tu carrito está vacío");
      return;
    }

    closeCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Panel lateral */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col bg-white p-6 shadow-2xl"
          >
            {/* Encabezado */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Tu carrito 🛒</h2>
                <p className="text-sm text-gray-500">
                  {cartItems.length}{" "}
                  {cartItems.length === 1 ? "producto" : "productos"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCart}
                className="rounded-full p-2 text-xl transition hover:bg-gray-100"
                aria-label="Cerrar carrito"
              >
                ✕
              </button>
            </div>

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="text-6xl">🛍️</span>
                  <h3 className="mt-5 text-xl font-semibold">
                    Tu carrito está vacío
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Explora nuestros productos y encuentra algo que te guste.
                  </p>

                  <button
                    type="button"
                    onClick={closeCart}
                    className="mt-5 rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
                  >
                    Seguir comprando
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b py-4"
                  >
                    {/* Imagen */}
                    <img
                      src={item.product.imageUrl || "/placeholder.png"}
                      alt={item.product.name}
                      className="h-24 w-24 rounded-xl object-cover"
                    />

                    {/* Información */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">
                        {item.product.name}
                      </h3>

                      {/* Talla y color de la variante */}
                      {item.variant ? (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-md bg-gray-100 px-2 py-1">
                            Talla: {item.variant.size}
                          </span>
                          <span className="rounded-md bg-gray-100 px-2 py-1">
                            Color: {item.variant.color}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-amber-600">
                          Selección pendiente
                        </p>
                      )}

                      {/* Cantidades */}
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          disabled={updatingItem === item.id}
                          onClick={() =>
                            void updateQuantity(item.id, item.quantity - 1)
                          }
                          className="h-8 w-8 rounded-full bg-gray-100 transition hover:bg-gray-200 disabled:opacity-50"
                        >
                          −
                        </button>

                        <span className="min-w-5 text-center font-medium">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={updatingItem === item.id}
                          onClick={() =>
                            void updateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-8 w-8 rounded-full bg-gray-100 transition hover:bg-gray-200 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        className="mt-2 text-sm text-red-500 transition hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right text-sm font-semibold">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Resumen y checkout */}
            <div className="border-t pt-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="text-xl font-bold">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                type="button"
                disabled={cartItems.length === 0}
                onClick={goToCheckout}
                className="w-full rounded-xl bg-black py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ir al checkout
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                Los productos se confirmarán al completar tu pedido.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}