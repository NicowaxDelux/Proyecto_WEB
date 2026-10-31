
import AdminLayout from "../../../components/Admin/AdminLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type ProductVariant = {
  id?: number;
  size: string;
  color: string;
  stock: number;
};

type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  gender?: string | null;
  category?: string | null;
  variants?: ProductVariant[];
};

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // Nuevos campos de clasificación.
  const [editGender, setEditGender] = useState("UNISEX");
  const [editCategory, setEditCategory] = useState("OTRA");

  // Contiene las variantes existentes y las nuevas aún no guardadas.
  const [editVariants, setEditVariants] = useState<ProductVariant[]>([]);

  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newStock, setNewStock] = useState("0");

  const [savingProduct, setSavingProduct] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Obtiene productos y variantes desde el backend.
  const loadProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Inicia sesión para acceder al administrador");
        return;
      }

      const res = await fetch("/api/admin/products", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !Array.isArray(data)) {
        throw new Error(
          data?.message || "No se pudieron cargar los productos"
        );
      }

      setProducts(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cargar los productos"
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  // Suma el inventario real de todas las variantes.
  const getVariantStock = (product: Product) => {
    return (product.variants ?? []).reduce(
      (total, variant) => total + Number(variant.stock),
      0
    );
  };

  // Carga los datos del producto seleccionado en el formulario.
  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name ?? "");
    setEditDescription(product.description ?? "");
    setEditPrice(String(product.price ?? ""));
    setEditImageUrl(product.imageUrl ?? "");

    // Si el producto antiguo no tiene clasificación, asigna valores válidos.
    setEditGender(product.gender || "UNISEX");
    setEditCategory(product.category || "OTRA");

    setEditVariants(
      (product.variants ?? []).map((variant) => ({
        id: variant.id,
        size: variant.size,
        color: variant.color,
        stock: Number(variant.stock),
      }))
    );

    setNewSize("");
    setNewColor("");
    setNewStock("0");

    // Desplaza la pantalla hasta el editor.
    setTimeout(() => {
      document
        .getElementById("product-editor")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    setEditName("");
    setEditDescription("");
    setEditPrice("");
    setEditImageUrl("");
    setEditGender("UNISEX");
    setEditCategory("OTRA");
    setEditVariants([]);
    setNewSize("");
    setNewColor("");
    setNewStock("0");
  };

  // Agrega una talla y un color a la lista que se guardará.
  const addVariant = () => {
    const size = newSize.trim();
    const color = newColor.trim();
    const stock = Number(newStock);

    if (!size || !color) {
      toast.error("Escribe la talla y el color");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("El stock debe ser un entero igual o mayor que cero");
      return;
    }

    const alreadyExists = editVariants.some(
      (variant) =>
        variant.size.toLowerCase() === size.toLowerCase() &&
        variant.color.toLowerCase() === color.toLowerCase()
    );

    if (alreadyExists) {
      toast.error("Esa combinación de talla y color ya está en la lista");
      return;
    }

    setEditVariants((current) => [
      ...current,
      { size, color, stock },
    ]);

    setNewSize("");
    setNewColor("");
    setNewStock("0");

    toast.success("Variante añadida. Recuerda guardar los cambios.");
  };

  // Actualiza el stock de una variante sin modificar las demás.
  const updateVariantStock = (index: number, value: string) => {
    const stock = value === "" ? 0 : Number(value);

    setEditVariants((current) =>
      current.map((variant, currentIndex) =>
        currentIndex === index
          ? { ...variant, stock }
          : variant
      )
    );
  };

  // Permite quitar del formulario solamente variantes nuevas no guardadas.
  const removeNewVariant = (index: number) => {
    const variant = editVariants[index];

    if (variant?.id !== undefined) {
      return;
    }

    setEditVariants((current) =>
      current.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const saveProduct = async () => {
    if (!editingProduct || savingProduct) return;

    if (!editName.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    if (
      editPrice.trim() === "" ||
      !Number.isFinite(Number(editPrice)) ||
      Number(editPrice) < 0
    ) {
      toast.error("Escribe un precio válido");
      return;
    }

    if (
      editVariants.some(
        (variant) =>
          !Number.isInteger(variant.stock) || variant.stock < 0
      )
    ) {
      toast.error("Revisa las cantidades de las variantes");
      return;
    }

    try {
      setSavingProduct(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Tu sesión ha expirado. Inicia sesión nuevamente.");
        return;
      }

      const res = await fetch(
        `/api/admin/products/${editingProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName.trim(),
            description: editDescription,
            price: Number(editPrice),
            imageUrl: editImageUrl,

            // Nuevos campos enviados a la API.
            gender: editGender,
            category: editCategory,

            // Incluye las variantes existentes y las nuevas.
            variants: editVariants,
          }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(
          data?.message || "No se pudo actualizar el producto"
        );
        return;
      }

      toast.success("Producto e inventario actualizados correctamente");

      await loadProducts();
      cancelEditing();
    } catch (error) {
      console.error("Error actualizando el producto:", error);
      toast.error("Ocurrió un error al guardar los cambios");
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que quieres eliminar este producto?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(
          data?.message || "No se pudo eliminar el producto"
        );
        return;
      }

      toast.success("Producto eliminado correctamente");

      if (editingProduct?.id === productId) {
        cancelEditing();
      }

      await loadProducts();
    } catch (error) {
      console.error("Error eliminando el producto:", error);
      toast.error("Ocurrió un error al eliminar el producto");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-gray-500">
              Administración de la tienda
            </p>

            <h1 className="mt-1 text-3xl font-semibold md:text-4xl">
              Productos
            </h1>
          </div>

          <button
            type="button"
            onClick={() => router.push("/adminPage/products/create")}
            className="rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
          >
            + Agregar producto
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
          <table className="w-full min-w-[650px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Imagen</th>
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-left">Precio</th>
                <th className="p-4 text-left">Stock de variantes</th>
                <th className="p-4 text-left">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loadingProducts ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Cargando productos...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No hay productos registrados.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="p-4">
                      <img
                        src={product.imageUrl || "/placeholder.png"}
                        alt={product.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    </td>

                    <td className="p-4 font-medium">{product.name}</td>

                    <td className="p-4">
                      {Number(product.price).toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        maximumFractionDigits: 0,
                      })}
                    </td>

                    <td className="p-4">
                      <span className="font-semibold">
                        {getVariantStock(product)}
                      </span>
                      <p className="text-xs text-gray-500">
                        {(product.variants ?? []).length} combinaciones
                      </p>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(product)}
                          className="rounded-lg border px-3 py-2 transition hover:bg-black hover:text-white"
                        >
                          ✏️ Editar
                        </button>

                        <button
                          type="button"
                          onClick={() => void deleteProduct(product.id)}
                          className="rounded-lg border border-red-300 px-3 py-2 text-red-600 transition hover:bg-red-600 hover:text-white"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {editingProduct && (
          <section
            id="product-editor"
            className="scroll-mt-6 space-y-6 rounded-2xl border bg-white p-5 shadow-sm md:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500">
                  Editando producto #{editingProduct.id}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {editingProduct.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-black"
                aria-label="Cerrar editor"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Nombre
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="w-full rounded-xl border p-3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Precio (COP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={editPrice}
                  onChange={(event) => setEditPrice(event.target.value)}
                  className="w-full rounded-xl border p-3"
                />
              </div>

              {/* Clasificación del producto */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Público
                </label>
                <select
                  value={editGender}
                  onChange={(event) => setEditGender(event.target.value)}
                  className="w-full rounded-xl border bg-white p-3"
                >
                  <option value="HOMBRE">Hombre</option>
                  <option value="MUJER">Mujer</option>
                  <option value="UNISEX">Unisex</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Categoría
                </label>
                <select
                  value={editCategory}
                  onChange={(event) => setEditCategory(event.target.value)}
                  className="w-full rounded-xl border bg-white p-3"
                >
                  <option value="CAMISETAS">Camisetas</option>
                  <option value="CAMISAS">Camisas</option>
                  <option value="SACOS">Sacos</option>
                  <option value="SUDADERAS">Sudaderas</option>
                  <option value="PANTALONES">Pantalones</option>
                  <option value="OTRA">Otra</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Descripción
                </label>
                <textarea
                  value={editDescription}
                  onChange={(event) =>
                    setEditDescription(event.target.value)
                  }
                  className="min-h-[100px] w-full rounded-xl border p-3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  URL de imagen
                </label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(event) => setEditImageUrl(event.target.value)}
                  className="w-full rounded-xl border p-3"
                  placeholder="URL de Cloudinary"
                />

                {editImageUrl && (
                  <img
                    src={editImageUrl}
                    alt={`Vista previa de ${editName}`}
                    className="mt-3 h-32 w-32 rounded-xl object-cover"
                  />
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold">
                  Inventario por talla y color
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Ajusta las unidades de cada combinación. El stock que
                  aparece en la tienda se calcula con estas cantidades.
                </p>
              </div>

              {editVariants.length > 0 ? (
                <div className="space-y-3">
                  {editVariants.map((variant, index) => (
                    <div
                      key={variant.id ?? `new-${index}`}
                      className="grid grid-cols-1 items-end gap-3 rounded-xl border bg-gray-50 p-4 sm:grid-cols-[1fr_1fr_120px_auto]"
                    >
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">
                          Talla
                        </label>
                        <div className="rounded-lg border bg-white p-3">
                          {variant.size}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs text-gray-500">
                          Color
                        </label>
                        <div className="rounded-lg border bg-white p-3">
                          {variant.color}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor={`variant-stock-${index}`}
                          className="mb-1 block text-xs text-gray-500"
                        >
                          Unidades
                        </label>
                        <input
                          id={`variant-stock-${index}`}
                          type="number"
                          min="0"
                          step="1"
                          value={variant.stock}
                          onChange={(event) =>
                            updateVariantStock(index, event.target.value)
                          }
                          className="w-full rounded-lg border bg-white p-3"
                        />
                      </div>

                      {variant.id === undefined && (
                        <button
                          type="button"
                          onClick={() => removeNewVariant(index)}
                          className="rounded-lg border border-red-300 px-3 py-3 text-sm text-red-600 hover:bg-red-50"
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-5 text-sm text-gray-500">
                  Este producto todavía no tiene variantes. Crea la primera
                  combinación utilizando el formulario de abajo.
                </div>
              )}

              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <h4 className="font-semibold">Agregar otra combinación</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Por ejemplo: talla M, color Blanco, 5 unidades.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label
                      htmlFor="new-size"
                      className="mb-1 block text-sm font-medium"
                    >
                      Talla
                    </label>
                    <input
                      id="new-size"
                      type="text"
                      value={newSize}
                      onChange={(event) => setNewSize(event.target.value)}
                      placeholder="Ej. M"
                      className="w-full rounded-lg border bg-white p-3"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-color"
                      className="mb-1 block text-sm font-medium"
                    >
                      Color
                    </label>
                    <input
                      id="new-color"
                      type="text"
                      value={newColor}
                      onChange={(event) => setNewColor(event.target.value)}
                      placeholder="Ej. Blanco"
                      className="w-full rounded-lg border bg-white p-3"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-stock"
                      className="mb-1 block text-sm font-medium"
                    >
                      Stock inicial
                    </label>
                    <input
                      id="new-stock"
                      type="number"
                      min="0"
                      step="1"
                      value={newStock}
                      onChange={(event) => setNewStock(event.target.value)}
                      className="w-full rounded-lg border bg-white p-3"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addVariant}
                      className="w-full rounded-lg border border-black px-4 py-3 font-medium transition hover:bg-black hover:text-white"
                    >
                      + Añadir variante
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600">
                Stock total del producto:{" "}
                <strong>
                  {editVariants.reduce(
                    (total, variant) => total + (Number(variant.stock) || 0),
                    0
                  )}
                </strong>{" "}
                unidades
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={cancelEditing}
                className="flex-1 rounded-xl border py-3 transition hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => void saveProduct()}
                disabled={savingProduct}
                className="flex-1 rounded-xl bg-black py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProduct ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </section>
        )}
      </div>
    </AdminLayout>
  );
}
