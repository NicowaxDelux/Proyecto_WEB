import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";   

type ProductVariant = {
  id: number;
  size: string;
  color: string;
  stock: number;
};

type Product = {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  variants: ProductVariant[];
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const { openCart, refreshCart } = useCart();

  // Carga los productos junto con sus variantes.
  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products", {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Error al consultar productos: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("La API no devolvió una lista de productos");
        }

        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Error cargando productos:", error);

        if (!cancelled) {
          toast.error("No se pudieron cargar los productos");
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // Agrega al carrito una combinación específica de talla y color.
  const addToCart = async (
    productId: number,
    variantId: number
  ): Promise<void> => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Inicia sesión para agregar productos al carrito");
      return;
    }

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity: 1,
        }),
      });

      const data = await res.json().catch(() => null);

      // Mostramos el mensaje real si el servidor rechaza la solicitud.
      if (!res.ok) {
        console.error("Error agregando al carrito:", res.status, data);

        toast.error(
          data?.message ||
            data?.error ||
            "No se pudo agregar el producto al carrito"
        );

        return;
      }

      // Actualizamos los artículos y el total antes de abrir el panel.
      await refreshCart();
      openCart();

      toast.success("Producto agregado al carrito 🛒");
    } catch (error) {
      console.error("Error de conexión con el carrito:", error);
      toast.error("No se pudo conectar con el carrito");
    }
  };

  return (
    <div>
      <Navbar />
      <Hero />

      <section id="productos" className="p-6 md:p-12">
        <h2 className="mb-8 text-3xl font-bold">
          Productos destacados
        </h2>

        {products.length === 0 ? (
          <p className="text-gray-500">
            No hay productos para mostrar.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}