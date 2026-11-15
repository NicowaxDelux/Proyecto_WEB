import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "../../../components/Admin/AdminLayout";
import SettingsImageUpload from "../../../components/Admin/SettingsImageUpload";

// ==========================================
// TIPO DE DATOS DE CONFIGURACIÓN
// ==========================================

type StoreSettingsForm = {
    // Identidad de la tienda
    storeName: string;
    logoUrl: string;
    faviconUrl: string;
    heroImageUrl: string;

    // Información de contacto
    contactEmail: string;
    whatsapp: string;
    instagramUrl: string;
    facebookUrl: string;

    // Información comercial
    description: string;
    shippingInfo: string;
    returnPolicy: string;
};

// ==========================================
// VALORES INICIALES
// ==========================================

const initialSettings: StoreSettingsForm = {
    storeName: "Martha Store",
    logoUrl: "",
    faviconUrl: "",
    heroImageUrl: "",

    contactEmail: "",
    whatsapp: "",
    instagramUrl: "",
    facebookUrl: "",

    description: "",
    shippingInfo: "",
    returnPolicy: "",
};

export default function SettingsPage() {

    // ==========================================
    // ESTADOS
    // ==========================================

    const [settings, setSettings] =
        useState<StoreSettingsForm>(initialSettings);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // ==========================================
    // ACTUALIZAR CAMPOS DEL FORMULARIO
    // ==========================================

    const handleChange = (
        field: keyof StoreSettingsForm,
        value: string
    ) => {
        setSettings((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    // ==========================================
    // CARGAR CONFIGURACIÓN DESDE MYSQL
    // ==========================================

    useEffect(() => {

        const loadSettings = async () => {

            try {

                const token = localStorage.getItem("token");

                if (!token) {
                    toast.error("Debes iniciar sesión como administrador");
                    return;
                }

                const res = await fetch("/api/admin/settings", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(
                        data.message || "Error al cargar la configuración"
                    );
                }

                // Convertimos los valores null en cadenas vacías.
                setSettings({
                    storeName: data.storeName ?? "Martha Store",

                    // Imágenes almacenadas en Cloudinary
                    logoUrl: data.logoUrl ?? "",
                    faviconUrl: data.faviconUrl ?? "",
                    heroImageUrl: data.heroImageUrl ?? "",

                    // Contacto
                    contactEmail: data.contactEmail ?? "",
                    whatsapp: data.whatsapp ?? "",
                    instagramUrl: data.instagramUrl ?? "",
                    facebookUrl: data.facebookUrl ?? "",

                    // Información comercial
                    description: data.description ?? "",
                    shippingInfo: data.shippingInfo ?? "",
                    returnPolicy: data.returnPolicy ?? "",
                });

            } catch (error) {

                console.error(
                    "Error cargando configuración:",
                    error
                );

                toast.error("No se pudo cargar la configuración");

            } finally {

                setLoading(false);

            }
        };

        loadSettings();

    }, []);

    // ==========================================
    // GUARDAR CONFIGURACIÓN EN MYSQL
    // ==========================================

    const handleSave = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        if (!settings.storeName.trim()) {
            toast.error("El nombre de la tienda es obligatorio");
            return;
        }

        try {

            setSaving(true);

            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Debes iniciar sesión como administrador");
                return;
            }

            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...settings,
                    storeName: settings.storeName.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    "No se pudo guardar la configuración"
                );
            }

            toast.success("Configuración guardada correctamente");

        } catch (error) {

            console.error(
                "Error guardando configuración:",
                error
            );

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Error al guardar los cambios"
            );

        } finally {

            setSaving(false);

        }
    };

    // ==========================================
    // ESTILOS REUTILIZABLES
    // ==========================================

    const inputClass =
        "w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black";

    const textareaClass =
        "w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black";

    const fileClass =
        "w-full rounded-lg border border-gray-300 p-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100";

    return (
        <AdminLayout>

            <div className="mx-auto max-w-6xl space-y-8">

                {/* ENCABEZADO */}

                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Configuración
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Administra la identidad, información y apariencia
                        de Martha Store.
                    </p>
                </div>

                {loading ? (

                    <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
                        Cargando configuración...
                    </div>

                ) : (

                    <form
                        onSubmit={handleSave}
                        className="space-y-8"
                    >

                        {/* ==========================================
                            1. IDENTIDAD DE LA TIENDA
                        ========================================== */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                            <div className="mb-6 border-b pb-5">

                                <h2 className="text-xl font-semibold text-gray-900">
                                    Identidad de la tienda
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Personaliza la imagen y el nombre de tu negocio.
                                </p>

                            </div>

                            <div className="grid gap-6 md:grid-cols-2">

                                {/* NOMBRE */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Nombre de la tienda
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        value={settings.storeName}
                                        onChange={(e) =>
                                            handleChange(
                                                "storeName",
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                {/* LOGO */}

                                <div>
                                    {/* LOGO DE LA TIENDA */}
                                    <SettingsImageUpload
                                        label="Logo de la tienda"
                                        description="Se utilizará en el Navbar y en el panel de administración."
                                        imageUrl={settings.logoUrl}
                                        onChange={(url) => handleChange("logoUrl", url)}
                                        previewClassName="h-24 w-24 object-contain"
                                    />

                                    <p className="mt-2 text-xs text-gray-400">
                                        Formatos recomendados: PNG, JPG o WEBP.
                                    </p>
                                </div>

                                {/* FAVICON */}

                                <div>
                                     {/* FAVICON */}
                                    <SettingsImageUpload
                                        label="Favicon"
                                        description="Icono que aparecerá en la pestaña del navegador."
                                        imageUrl={settings.faviconUrl}
                                        onChange={(url) => handleChange("faviconUrl", url)}
                                        previewClassName="h-16 w-16 object-contain"
                                    />
                                </div>

                                {/* PORTADA */}

                                <div>
                                    {/* IMAGEN PRINCIPAL DE PORTADA */}
                                    <SettingsImageUpload
                                        label="Imagen principal de portada"
                                        description="Fotografía que aparecerá en la portada de Martha Store."
                                        imageUrl={settings.heroImageUrl}
                                        onChange={(url) => handleChange("heroImageUrl", url)}
                                        previewClassName="h-48 w-full object-cover"
                                    /> 
                                </div>

                            </div>
                        </section>

                        {/* ==========================================
                            2. INFORMACIÓN DE CONTACTO
                        ========================================== */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                            <div className="mb-6 border-b pb-5">

                                <h2 className="text-xl font-semibold text-gray-900">
                                    Información de contacto
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Configura los medios por los que tus clientes
                                    pueden comunicarse contigo.
                                </p>

                            </div>

                            <div className="grid gap-6 md:grid-cols-2">

                                {/* CORREO */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Correo de atención al cliente
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="contacto@tutienda.com"
                                        value={settings.contactEmail}
                                        onChange={(e) =>
                                            handleChange(
                                                "contactEmail",
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                {/* WHATSAPP */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        WhatsApp para pedidos
                                    </label>

                                    <input
                                        type="tel"
                                        placeholder="+57 300 000 0000"
                                        value={settings.whatsapp}
                                        onChange={(e) =>
                                            handleChange(
                                                "whatsapp",
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                {/* INSTAGRAM */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Instagram
                                    </label>

                                    <input
                                        type="url"
                                        placeholder="https://instagram.com/tu_tienda"
                                        value={settings.instagramUrl}
                                        onChange={(e) =>
                                            handleChange(
                                                "instagramUrl",
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                {/* FACEBOOK */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Facebook
                                    </label>

                                    <input
                                        type="url"
                                        placeholder="https://facebook.com/tu_tienda"
                                        value={settings.facebookUrl}
                                        onChange={(e) =>
                                            handleChange(
                                                "facebookUrl",
                                                e.target.value
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>

                                {/* UBICACIÓN FUTURA */}

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Ciudad o ubicación
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="Próximamente"
                                        disabled
                                        className={`${inputClass} cursor-not-allowed bg-gray-100`}
                                    />

                                    <p className="mt-2 text-xs text-gray-400">
                                        Esta funcionalidad estará disponible más adelante.
                                    </p>

                                </div>

                            </div>
                        </section>

                        {/* ==========================================
                            3. INFORMACIÓN COMERCIAL
                        ========================================== */}

                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                            <div className="mb-6 border-b pb-5">

                                <h2 className="text-xl font-semibold text-gray-900">
                                    Información comercial
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Define la información que tus clientes necesitan
                                    conocer antes de comprar.
                                </p>

                            </div>

                            <div className="space-y-6">

                                {/* DESCRIPCIÓN */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Descripción de la tienda
                                    </label>

                                    <textarea
                                        rows={3}
                                        placeholder="Describe tu tienda y lo que ofreces a tus clientes..."
                                        value={settings.description}
                                        onChange={(e) =>
                                            handleChange(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        className={textareaClass}
                                    />
                                </div>

                                {/* INFORMACIÓN DE ENVÍOS */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Información de envíos
                                    </label>

                                    <textarea
                                        rows={3}
                                        placeholder="Explica los tiempos, costos y condiciones de envío..."
                                        value={settings.shippingInfo}
                                        onChange={(e) =>
                                            handleChange(
                                                "shippingInfo",
                                                e.target.value
                                            )
                                        }
                                        className={textareaClass}
                                    />
                                </div>

                                {/* CAMBIOS Y DEVOLUCIONES */}

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Políticas de cambios y devoluciones
                                    </label>

                                    <textarea
                                        rows={4}
                                        placeholder="Describe las condiciones para cambios y devoluciones..."
                                        value={settings.returnPolicy}
                                        onChange={(e) =>
                                            handleChange(
                                                "returnPolicy",
                                                e.target.value
                                            )
                                        }
                                        className={textareaClass}
                                    />
                                </div>

                            </div>
                        </section>

                        {/* ==========================================
                            GUARDAR CAMBIOS
                        ========================================== */}

                        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-sm text-gray-500">
                                Guarda los cambios para actualizar la información
                                de Martha Store.
                            </p>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Guardando..."
                                    : "Guardar cambios"}
                            </button>

                        </div>

                    </form>
                )}

            </div>

        </AdminLayout>
    );
}
