import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/router";
import AdminLayout from "../../../components/Admin/AdminLayout";
import toast from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";

export default function CreateProduct() {
  const router = useRouter();

  // ==========================================
  // DATOS PRINCIPALES DEL PRODUCTO
  // ==========================================
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Clasificación del producto.
  const [gender, setGender] = useState("UNISEX");
  const [category, setCategory] = useState("CAMISETAS");

  // ==========================================
  // TALLAS Y COLORES
  // ==========================================
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");

  const [sizes, setSizes] = useState<string[]>([
    "S",
    "M",
    "L",
    "XL",
  ]);

  const [colors, setColors] = useState<string[]>([
    "Blanco",
    "Negro",
  ]);

  // Evita envíos repetidos.
  const [loading, setLoading] = useState(false);

  // ==========================================
  // AGREGAR TALLAS O COLORES
  // ==========================================
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

    // Evitamos duplicados.
    if (
      options.some(
        (option) => option.toLowerCase() === cleaned.toLowerCase()
      )
    ) {
      toast.error("Esa opción ya existe");
      return;
    }

    setOptions([...options, cleaned]);
    clearInput();
  };

  // ==========================================
  // ELIMINAR TALLAS O COLORES
  // ==========================================
  const removeOption = (
    value: string,
    options: string[],
    setOptions: (options: string[]) => void
  ) => {
    setOptions(options.filter((option) => option !== value));
  };

  // ==========================================
  // CREAR PRODUCTO
  // ==========================================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Ingresa el nombre del producto");
      return;
    }

    if (
      !price.trim() ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      toast.error("Ingresa un precio válido");
      return;
    }

    if (sizes.length === 0 || colors.length === 0) {
      toast.error("Agrega al menos una talla y un color");
      return;
    }

    if (!gender || !category) {
      toast.error("Selecciona el público y la categoría");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Debes iniciar sesión como administrador");
        return;
      }

      // Enviamos los datos a la API.
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

          // Nuevos campos de clasificación.
          gender,
          category,

          // Variantes del producto.
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

  // ==========================================
  // INTERFAZ
  // ==========================================
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

        <h1 className="mb-4 mt-5 text-4xl font-semibold">
          Nuevo producto
        </h1>

        <p className="mt-4 text-gray-500">
          Registra el producto, clasifícalo y define sus combinaciones disponibles.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl rounded-2xl border bg-white p-8"
      >
        {/* NOMBRE */}
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

        {/* DESCRIPCIÓN */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">
            Descripción
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el producto"
            rows={5}
            className="w-full rounded-xl border p-3 outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* PRECIO */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium">
            Precio (COP)
          </label>

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

        {/* =====================================
            CLASIFICACIÓN DEL PRODUCTO
        ====================================== */}
        <section className="mb-6 rounded-xl border bg-gray-50 p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Clasificación del producto
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Esta información permitirá a los clientes encontrar productos
              según sus preferencias.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* PÚBLICO */}
            <div>
              <label
                htmlFor="gender"
                className="mb-2 block text-sm font-medium"
              >
                ¿Para quién es?
              </label>

              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full rounded-xl border bg-white p-3 outline-none focus:ring-2 focus:ring-black"
                required
              >
                <option value="HOMBRE">Hombre</option>
                <option value="MUJER">Mujer</option>
                <option value="UNISEX">Unisex</option>
              </select>
            </div>

            {/* CATEGORÍA */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium"
              >
                Categoría
              </label>

              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border bg-white p-3 outline-none focus:ring-2 focus:ring-black"
                required
              >
                <option value="CAMISETAS">Camisetas</option>
                <option value="CAMISAS">Camisas</option>
                <option value="SACOS">Sacos</option>
                <option value="SUDADERAS">Sudaderas</option>
                <option value="PANTALONES">Pantalones</option>
                <option value="OTRA">Otra</option>
              </select>
            </div>
          </div>
        </section>

        {/* =====================================
            TALLAS
        ====================================== */}
        <section className="mb-6 rounded-xl border p-5">
          <h2 className="mb-3 text-lg font-semibold">
            Tallas
          </h2>

          <div className="mb-4 flex gap-2">
            <input
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  addOption(
                    sizeInput,
                    sizes,
                    setSizes,
                    () => setSizeInput("")
                  );
                }
              }}
              placeholder="Ej. XXL, 28, 30, Única"
              className="min-w-0 flex-1 rounded-xl border p-3"
            />

            <button
              type="button"
              onClick={() =>
                addOption(
                  sizeInput,
                  sizes,
                  setSizes,
                  () => setSizeInput("")
                )
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

        {/* =====================================
            COLORES
        ====================================== */}
        <section className="mb-6 rounded-xl border p-5">
          <h2 className="mb-3 text-lg font-semibold">
            Colores
          </h2>

          <div className="mb-4 flex gap-2">
            <input
              value={colorInput}
              onChange={(e) => setColorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();

                  addOption(
                    colorInput,
                    colors,
                    setColors,
                    () => setColorInput("")
                  );
                }
              }}
              placeholder="Ej. Azul, Beige, Verde oliva"
              className="min-w-0 flex-1 rounded-xl border p-3"
            />

            <button
              type="button"
              onClick={() =>
                addOption(
                  colorInput,
                  colors,
                  setColors,
                  () => setColorInput("")
                )
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

        {/* RESUMEN DE VARIANTES */}
        <p className="mb-6 text-sm text-gray-500">
          Se crearán{" "}
          <strong>{sizes.length * colors.length}</strong>{" "}
          combinaciones, todas con stock inicial de 0.
        </p>

        {/* =====================================
            IMAGEN CLOUDINARY
        ====================================== */}
        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium">
            Imagen del producto
          </label>

          <CldUploadWidget
            uploadPreset="Tienda_productos"
            onSuccess={(result) => {
              const info = result.info as {
                secure_url?: string;
              };

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
                    <span className="mb-3 block text-4xl">
                      📷
                    </span>

                    <span className="font-medium">
                      Subir imagen
                    </span>

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

        {/* CREAR PRODUCTO */}
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
