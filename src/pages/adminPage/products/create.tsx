import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/Admin/AdminLayout";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";

export default function CreateProduct() {
  const router = useRouter();

  // Datos principales del producto.
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Opciones dinámicas: el administrador puede escribir las que necesite.
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL"]);
  const [colors, setColors] = useState<string[]>(["Blanco", "Negro"]);

  // Evita que se envíe el formulario varias veces.
  const [loading, setLoading] = useState(false);

  // Agrega una talla o color sin permitir duplicados.
  const addOption = (
    value: string,
    options: string[],
    setOptions: (options: string[]) => void,
    clearInput: () => void
  ) => {
    const cleaned = value.trim();

    if (!cleaned) {
      toast.error("Escribe una opción primero");
      return;
    }

    // Comparamos sin distinguir mayúsculas para evitar duplicados como "azul" y "Azul".
    if (options.some((option) => option.toLowerCase() === cleaned.toLowerCase())) {
      toast.error("Esa opción ya existe");
      return;
    }

    setOptions([...options, cleaned]);
    clearInput();
  };

  // Elimina una opción seleccionada de la lista.
  const removeOption = (
    value: string,
    options: string[],
    setOptions: (options: string[]) => void
  ) => {
    setOptions(options.filter((option) => option !== value));
  };

  // Crea el producto y sus variantes a través de la API.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Ingresa el nombre del producto");
      return;
    }

    if (!price.trim() || !Number.isFinite(Number(price)) || Number(price) <= 0) {
      toast.error("Ingresa un precio válido");
      return;
    }

    if (sizes.length === 0 || colors.length === 0) {
      toast.error("Agrega al menos una talla y un color");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Debes iniciar sesión como administrador");
        return;
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: Number(price),
          imageUrl: imageUrl || null,
          sizes,
          colors,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "No se pudo crear el producto");
        return;
      }

      toast.success("Producto y variantes creados correctamente");
      await router.push("/adminPage/products");
    } catch (error) {
      console.error("Error creando el producto:", error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-10">
        <button
          type="button"
          onClick={() => router.push("/adminPage/products")}
          className="text-sm text-gray-500 transition hover:text-black"
        >
          ← Volver a productos
        </button>

        <h1 className="mb-4 mt-5 text-4xl font-semibold">Nuevo producto</h1>
        <p className="mt-4 text-gray-500">
          Registra el producto y define las combinaciones disponibles.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl rounded-2xl border bg-white p-8"
      >
        {/* Nombre del producto */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">
            Nombre del producto
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Camiseta oversize"
            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* Descripción del producto */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el producto"
            rows={5}
            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Precio de venta; el stock se controla por variante. */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">Precio (COP)</label>
          <input
            type="number"
            min="1"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="80000"
            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
            required
          />
        </div>

        {/* Configuración dinámica de tallas */}
        <section className="mb-6 rounded-xl border p-5">
          <h2 className="mb-3 text-lg font-semibold">Tallas</h2>

          <div className="mb-4 flex gap-2">
            <input
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption(sizeInput, sizes, setSizes, () => setSizeInput(""));
                }
              }}
              placeholder="Ej. XXL, 28, 30, Única"
              className="min-w-0 flex-1 rounded-xl border p-3"
            />
            <button
              type="button"
              onClick={() =>
                addOption(sizeInput, sizes, setSizes, () => setSizeInput(""))
              }
              className="rounded-xl bg-black px-4 text-white"
            >
              Añadir
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <span
                key={size}
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                {size}
                <button
                  type="button"
                  aria-label={`Eliminar talla ${size}`}
                  onClick={() => removeOption(size, sizes, setSizes)}
                  className="text-gray-500 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        {/* Configuración dinámica de colores */}
        <section className="mb-6 rounded-xl border p-5">
          <h2 className="mb-3 text-lg font-semibold">Colores</h2>

          <div className="mb-4 flex gap-2">
            <input
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOption(colorInput, colors, setColors, () => setColorInput(""));
                }
              }}
              placeholder="Ej. Azul, Beige, Verde oliva"
              className="min-w-0 flex-1 rounded-xl border p-3"
            />
            <button
              type="button"
              onClick={() =>
                addOption(colorInput, colors, setColors, () => setColorInput(""))
              }
              className="rounded-xl bg-black px-4 text-white"
            >
              Añadir
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <span
                key={color}
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                {color}
                <button
                  type="button"
                  aria-label={`Eliminar color ${color}`}
                  onClick={() => removeOption(color, colors, setColors)}
                  className="text-gray-500 hover:text-red-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        <p className="mb-6 text-sm text-gray-500">
          Se crearán {sizes.length * colors.length} combinaciones, todas con
          stock inicial de 0.
        </p>

        {/* Subida de imagen a Cloudinary: conserva el sistema original. */}
        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium">
            Imagen del producto
          </label>

          <CldUploadWidget
            uploadPreset="Tienda_productos"
            onSuccess={(result) => {
              const info = result.info as { secure_url?: string };

              if (info.secure_url) {
                setImageUrl(info.secure_url);
                toast.success("Imagen subida correctamente");
              }
            }}
          >
            {({ open }) => (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center hover:border-black">
                {!imageUrl ? (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="w-full py-10 text-gray-500 hover:text-black"
                  >
                    <span className="mb-3 block text-4xl">📷</span>
                    <span className="font-medium">Subir imagen</span>
                    <span className="mt-1 block text-sm text-gray-400">
                      JPG, PNG o WEBP
                    </span>
                  </button>
                ) : (
                  <div>
                    <img
                      src={imageUrl}
                      alt="Vista previa del producto"
                      className="mx-auto max-h-80 rounded-xl object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="mt-4 text-sm text-gray-500 hover:text-black"
                    >
                      Cambiar imagen
                    </button>
                  </div>
                )}
              </div>
            )}
          </CldUploadWidget>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black py-4 font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Creando producto..." : "Crear producto"}
        </button>
      </form>
    </AdminLayout>
  );
}
