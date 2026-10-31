import { useEffect, useMemo, useState } from "react";
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
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  gender?: string | null;
  category?: string | null;
  variants: ProductVariant[];
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  // Estados de los filtros.
  const [search, setSearch] = useState("");
  const [selectedGender, setSelectedGender] = useState("TODOS");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");

  const { openCart, refreshCart } = useCart();

  // Carga los productos desde la API.
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

  // Normaliza textos para comparar sin distinguir mayúsculas ni tildes.
  const normalizeText = (value: string) => {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // Aplica los filtros y la búsqueda sin consultar nuevamente la API.
  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return products.filter((product) => {
      const matchesGender =
        selectedGender === "TODOS" ||
        product.gender === selectedGender;

      const matchesCategory =
        selectedCategory === "TODAS" ||
        product.category === selectedCategory;

      const searchableText = normalizeText(
        [
          product.name,
          product.description ?? "",
          product.gender ?? "",
          product.category ?? "",
        ].join(" ")
      );

      const matchesSearch =
        normalizedSearch === "" ||
        searchableText.includes(normalizedSearch);

      return matchesGender && matchesCategory && matchesSearch;
    });
  }, [products, search, selectedGender, selectedCategory]);

  // Limpia todos los filtros.
  const clearFilters = () => {
    setSearch("");
    setSelectedGender("TODOS");
    setSelectedCategory("TODAS");
  };

  // Agrega un producto al carrito.
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

      if (!res.ok) {
        console.error("Error agregando al carrito:", res.status, data);

        toast.error(
          data?.message ||
            data?.error ||
            "No se pudo agregar el producto al carrito"
        );

        return;
      }

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

      <section id="productos" className="px-4 py-10 md:px-12 md:py-16">
        {/* Encabezado */}
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-gray-500">
            Nuestra colección
          </p>

          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Encuentra tu estilo
          </h2>

          <p className="mt-2 text-gray-500">
            Explora nuestra colección y encuentra las prendas que buscas.
          </p>
        </div>

        {/* Buscador y filtros */}
        <div className="mb-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          {/* Buscador */}
          <div>
            <label
              htmlFor="product-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Buscar productos
            </label>

            <div className="relative">
              <input
                id="product-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Busca una camisa, pantalón, camiseta..."
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 outline-none transition focus:border-black focus:bg-white"
              />
            </div>
          </div>

          {/* Selectores */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="gender-filter"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Público
              </label>

              <select
                id="gender-filter"
                value={selectedGender}
                onChange={(event) =>
                  setSelectedGender(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-black"
              >
                <option value="TODOS">Todos</option>
                <option value="HOMBRE">Hombre</option>
                <option value="MUJER">Mujer</option>
                <option value="UNISEX">Unisex</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="category-filter"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Categoría
              </label>

              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
                className="w-full rounded-xl border border-gray-300 bg-white p-3 outline-none focus:border-black"
              >
                <option value="TODAS">Todas las categorías</option>
                <option value="CAMISETAS">Camisetas</option>
                <option value="CAMISAS">Camisas</option>
                <option value="SACOS">Sacos</option>
                <option value="SUDADERAS">Sudaderas</option>
                <option value="PANTALONES">Pantalones</option>
                <option value="OTRA">Otra</option>
              </select>
            </div>
          </div>

          {/* Resultados y limpiar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-gray-500">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "producto encontrado"
                : "productos encontrados"}
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:border-black hover:bg-black hover:text-white"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Productos filtrados */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-5 py-12 text-center">
            <h3 className="text-xl font-semibold">
              No encontramos productos
            </h3>

            <p className="mt-2 text-gray-500">
              Prueba con otra búsqueda o modifica los filtros.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
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
