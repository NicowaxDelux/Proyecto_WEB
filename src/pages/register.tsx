import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import toast from "react-hot-toast";
import BackButton from "../components/BackButton";
import {
    GoogleLogin,
    GoogleOAuthProvider
} from "@react-oauth/google";

export default function Register() {

    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar que las contraseñas coincidan
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        // Evitar contraseñas demasiado cortas
        if (password.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        try {

            setLoading(true);

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "No se pudo crear la cuenta");
                return;
            }

            // Guardamos el JWT
            localStorage.setItem("token", data.token);

            toast.success("¡Cuenta creada! Recibiste 11% en tu primera compra 🎁");

            // Llevar al usuario a la tienda
            router.push("/");

        } catch (error) {

            console.error("Error registrando usuario:", error);

            toast.error("Ocurrió un error al crear la cuenta");

        } finally {

            setLoading(false);

        }
    };


    // Registro / login con Google
    const handleGoogleRegister = async (credential: string) => {

        try {

            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    credential
                })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "No se pudo iniciar con Google");
                return;
            }

            localStorage.setItem("token", data.token);

            toast.success("¡Bienvenido! 🎉");

            if (data.user?.role === "ADMIN") {
                router.push("/adminPage");
            } else {
                router.push("/");
            }

        } catch (error) {

            console.error("Error con Google:", error);

            toast.error("No se pudo conectar con Google");

        }
    };


    return (
        <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >

            <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">

                <div className="max-w-md mx-auto px-6 py-10">

                    <BackButton />

                    {/* Encabezado */}

                    <div className="text-center mt-8 mb-8">

                        <p className="uppercase tracking-[6px] text-gray-400 text-sm">
                            Crear cuenta
                        </p>

                        <h1 className="text-4xl font-black mt-3">
                            Únete a nosotros
                        </h1>

                        <p className="text-gray-500 mt-3">
                            Regístrate para disfrutar una mejor experiencia.
                        </p>

                    </div>


                    {/* Beneficio */}

                    <div className="bg-black text-white rounded-3xl p-6 mb-6">

                        <p className="text-sm text-gray-300">
                            BENEFICIO DE BIENVENIDA
                        </p>

                        <h2 className="text-2xl font-bold mt-2">
                            🎁 11% de descuento?
                        </h2>

                        <p className="text-sm text-gray-300 mt-2">
                            Regístrate y recibe un 11% de descuento
                            en tu primera compra.
                        </p>

                        <p className="text-xs text-gray-400 mt-3">
                            Beneficio exclusivo para nuevos usuarios.
                        </p>

                    </div>


                    {/* Formulario */}

                    <form
                        onSubmit={handleRegister}
                        className="bg-white rounded-3xl shadow-xl p-8 space-y-5"
                    >

                        {/* Nombre */}

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Nombre
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tu nombre"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                required
                            />

                        </div>


                        {/* Email */}

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Correo electrónico
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                required
                            />

                        </div>


                        {/* Contraseña */}

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Contraseña
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                required
                            />

                        </div>


                        {/* Confirmar contraseña */}

                        <div>

                            <label className="block text-sm font-medium mb-2">
                                Confirmar contraseña
                            </label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                                required
                            />

                        </div>


                        {/* Botón */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                        >

                            {loading
                                ? "Creando cuenta..."
                                : "Crear mi cuenta y obtener 11%"
                            }

                        </button>


                        {/* Separador */}

                        <div className="flex items-center gap-4">

                            <div className="h-px bg-gray-200 flex-1" />

                            <span className="text-sm text-gray-400">
                                o
                            </span>

                            <div className="h-px bg-gray-200 flex-1" />

                        </div>


                        {/* Google */}

                        <div className="flex justify-center">

                            <GoogleLogin
                                onSuccess={(credentialResponse) => {

                                    if (credentialResponse.credential) {
                                        handleGoogleRegister(
                                            credentialResponse.credential
                                        );
                                    }

                                }}

                                onError={() => {
                                    toast.error(
                                        "No se pudo registrar con Google"
                                    );
                                }}
                            />

                        </div>

                    </form>


                    {/* Login */}

                    <div className="text-center mt-6 text-sm text-gray-500">

                        ¿Ya tienes una cuenta?{" "}

                        <Link
                            href="/login"
                            className="text-black font-semibold hover:underline"
                        >
                            Inicia sesión
                        </Link>

                    </div>

                </div>

            </div>

        </GoogleOAuthProvider>
    );
}