import { CldUploadWidget } from "next-cloudinary";
import { toast } from "react-hot-toast";

// ==========================================
// PROPIEDADES DEL COMPONENTE
// ==========================================

type SettingsImageUploadProps = {
    label: string;
    description: string;
    imageUrl: string;
    onChange: (url: string) => void;
    previewClassName?: string;
};

export default function SettingsImageUpload({
    label,
    description,
    imageUrl,
    onChange,
    previewClassName = "h-40 w-full object-contain",
}: SettingsImageUploadProps) {

    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <CldUploadWidget
                uploadPreset="Tienda_productos"
                onSuccess={(result) => {

                    const info = result.info as {
                        secure_url?: string;
                    };

                    if (info?.secure_url) {
                        // Guardamos la URL temporalmente en React.
                        onChange(info.secure_url);

                        toast.success("Imagen subida correctamente");
                    }
                }}
            >
                {({ open }) => (
                    <div className="rounded-xl border border-dashed border-gray-300 p-4 transition hover:border-black">

                        {imageUrl ? (
                            <div className="text-center">

                                {/* Vista previa */}
                                <img
                                    src={imageUrl}
                                    alt={label}
                                    className={`mx-auto rounded-lg ${previewClassName}`}
                                />

                                <button
                                    type="button"
                                    onClick={() => open()}
                                    className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
                                >
                                    Cambiar imagen
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onChange("")}
                                    className="ml-3 text-sm text-red-600 hover:text-red-700"
                                >
                                    Quitar
                                </button>

                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => open()}
                                className="w-full py-8 text-center"
                            >
                                <span className="mb-3 block text-3xl">
                                    📷
                                </span>

                                <span className="block font-medium text-gray-800">
                                    Subir imagen
                                </span>

                                <span className="mt-1 block text-xs text-gray-400">
                                    PNG, JPG o WEBP
                                </span>
                            </button>
                        )}
                    </div>
                )}
            </CldUploadWidget>

            <p className="mt-2 text-xs text-gray-400">
                {description}
            </p>
        </div>
    );
}