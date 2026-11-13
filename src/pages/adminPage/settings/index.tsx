
import AdminLayout from "../../../components/Admin/AdminLayout";

export default function SettingsPage() {
    return (
        <AdminLayout>
            <div className="mx-auto max-w-6xl space-y-8">

                {/* Encabezado */}
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Configuración
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Administra la identidad, información y apariencia de Martha Store.
                    </p>
                </div>

                {/* 1. IDENTIDAD DE LA TIENDA */}
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

                        {/* Nombre */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Nombre de la tienda
                            </label>

                            <input
                                type="text"
                                defaultValue="Martha Store"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                            />
                        </div>

                        {/* Logo */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Logo de la tienda
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                            />

                            <p className="mt-2 text-xs text-gray-400">
                                Formatos recomendados: PNG, JPG o WEBP.
                            </p>
                        </div>

                        {/* Favicon */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Favicon
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                            />

                            <p className="mt-2 text-xs text-gray-400">
                                Icono que aparece en la pestaña del navegador.
                            </p>
                        </div>

                        {/* Portada */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Imagen principal de portada
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                            />

                            <p className="mt-2 text-xs text-gray-400">
                                Fotografía principal que aparece en el inicio.
                            </p>
                        </div>

                    </div>
                </section>

                {/* 2. INFORMACIÓN DE CONTACTO */}
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="mb-6 border-b pb-5">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Información de contacto
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Configura los medios por los que tus clientes pueden comunicarse contigo.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Correo de atención al cliente
                            </label>

                            <input
                                type="email"
                                placeholder="contacto@tutienda.com"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                WhatsApp para pedidos
                            </label>

                            <input
                                type="tel"
                                placeholder="+57 300 000 0000"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Instagram
                            </label>

                            <input
                                type="url"
                                placeholder="https://instagram.com/tu_tienda"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Facebook
                            </label>

                            <input
                                type="url"
                                placeholder="https://facebook.com/tu_tienda"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Ciudad o ubicación
                            </label>

                            <input
                                type="text"
                                placeholder="Ejemplo: Bogotá, Colombia"
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                    </div>
                </section>

                {/* 3. INFORMACIÓN COMERCIAL */}
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="mb-6 border-b pb-5">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Información comercial
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Define la información que tus clientes necesitan conocer antes de comprar.
                        </p>
                    </div>

                    <div className="space-y-6">

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Descripción de la tienda
                            </label>

                            <textarea
                                rows={3}
                                placeholder="Describe tu tienda y lo que ofreces a tus clientes..."
                                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Información de envíos
                            </label>

                            <textarea
                                rows={3}
                                placeholder="Explica los tiempos, costos y condiciones de envío..."
                                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Políticas de cambios y devoluciones
                            </label>

                            <textarea
                                rows={4}
                                placeholder="Describe las condiciones para cambios y devoluciones..."
                                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Métodos de pago aceptados
                            </label>

                            <textarea
                                rows={3}
                                placeholder="Ejemplo: Nequi, transferencia bancaria, pago contra entrega..."
                                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                            />
                        </div>

                    </div>
                </section>

                {/* Próxima integración */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="text-sm text-gray-500">
                        La conexión para guardar y actualizar esta información se implementará en el siguiente paso.
                    </p>
                </div>

            </div>
        </AdminLayout>
    );
}