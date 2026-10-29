
import { useState } from "react";
import { motion } from "framer-motion";

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
  variants?: ProductVariant[];
};

type ProductCardProps = {
  product: Product;
  addToCart: (productId: number, variantId: number) => Promise<void>;
};

export default function ProductCard({
  product,
  addToCart,
}: ProductCardProps) {
  // Solo mostramos opciones que tengan existencias.
  const availableVariants = (product.variants ?? []).filter(
    (variant) => variant.stock > 0
  );

  const [selectedSize, setSelectedSize] = useState(
    availableVariants[0]?.size ?? ""
  );

  const [selectedColor, setSelectedColor] = useState(
    availableVariants[0]?.color ?? ""
  );

  const sizes = Array.from(
    new Set(availableVariants.map((variant) => variant.size))
  );

  const availableColors = Array.from(
    new Set(
      availableVariants
        .filter((variant) => variant.size === selectedSize)
        .map((variant) => variant.color)
    )
  );

  // Encontramos la combinación exacta de talla y color.
  const selectedVariant = availableVariants.find(
    (variant) =>
      variant.size === selectedSize &&
      variant.color === selectedColor
  );

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);

    // Al cambiar la talla, seleccionamos un color válido.
    const firstVariant = availableVariants.find(
      (variant) => variant.size === size
    );

    setSelectedColor(firstVariant?.color ?? "");
  };

  const hasStock = availableVariants.length > 0;

  return (
    <motion.div
      whileHover={{ y: 5 }}
      className="overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl"
    >
      <img
        src={product.imageUrl || "/placeholder.png"}
        alt={product.name}
        className="h-60 w-full object-cover md:h-72"
      />

      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {product.name}
        </h2>

        <p className="mt-1 text-lg font-bold text-gray-800">
          {Number(product.price).toLocaleString("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          })}
        </p>

        {hasStock && (
          <div className="mt-4 space-y-3">
            <div>
              <label
                htmlFor={`size-${product.id}`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Talla
              </label>

              <select
                id={`size-${product.id}`}
                value={selectedSize}
                onChange={(event) =>
                  handleSizeChange(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none"
              >
                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={`color-${product.id}`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Color
              </label>

              <select
                id={`color-${product.id}`}
                value={selectedColor}
                onChange={(event) =>
                  setSelectedColor(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-black focus:outline-none"
              >
                {availableColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            {selectedVariant && (
              <p className="text-sm text-gray-500">
                {selectedVariant.stock} unidades disponibles
              </p>
            )}
          </div>
        )}

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={!selectedVariant}
          onClick={() => {
            if (selectedVariant) {
              void addToCart(product.id, selectedVariant.id);
            }
          }}
          className="mt-4 w-full rounded-lg bg-black py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
        >
          {!hasStock
            ? "Agotado"
            : selectedVariant
              ? "Agregar al carrito"
              : "Selecciona una opción"}
        </motion.button>
      </div>
    </motion.div>
  );
}
