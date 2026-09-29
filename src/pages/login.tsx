import { useState } from "react";
import { useRouter } from "next/router";
import BackButton from "../components/BackButton"
import toast from "react-hot-toast";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function Login() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //enviar credenciales al backend para logearse y recibir un token
    const handleLogin = async () => {
        
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({email, password}),
            });

            const data = await res.json();

            //Validar que el login fue exitoso 
            if(!data.token) {
                toast.error("Correo o contraseña incorrectas!");
                return;
            }


            //guardar token
            localStorage.setItem("token", data.token);
                
            //consultar el perfil del usuario
            const profileRes = await fetch("/api/profile", {
                headers: {
                    Authorization: `Bearer ${data.token}`,
                },
            });

            const profileData = await profileRes.json();

            //obetener rol del usuario
            const role = profileData.user.role;

            toast.success("Login exitoso 🔐");

            //redireccionar al usuario segun su rol
            if(role === "ADMIN") {
                router.push("/adminPage");
            }else {
                router.push("/");
            }
        }
        catch (error) {
            console.error(error)
            toast.error("Error al iniciar sesión.")
        }
    };


    const handleGoogleLogin = async (credentialResponse: any) => {

        try {

            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({
                    credential: credentialResponse?.credential,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Error al iniciar con Google")
                return;
            }

            localStorage.setItem("token", data.token);

            toast.success("Login con Google exitoso");

            if (data.user.role === "ADMIN") {
                router.push("/adminPage");
            } else {
                router.push("/")
            }

        }catch(error){
            console.error(error);

            toast.error("Error al conectar Google");

        }
    }

    return (

        <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
            <div>

                <BackButton />

                <div className="h-screen flex items-center justify-center bg-gray-100">

                    <div className="bg-white p-8 rounded-2xl shadow-xl w-96">
                    <h1 className= "text-2x1 font-bold mb-6 text-center">
                        Login 🔐
                    </h1>

                    <input 
                        className="w-full mb-4 p-3 border rounded-x1"
                        placeholder="Email"
                        onChange={e => setEmail(e.target.value)}
                    />

                    <input  
                        type="password"
                        className="w-full mb-4 p-3 border rounded-1x"
                        placeholder="Password"
                        onChange={e => setPassword(e.target.value)}
                    />

                    <button 
                        onClick={handleLogin}
                        className="w-full bg-black text-white py-3 rounded-x1 hover:bg-yellow-600"
                    >

                        Iniciar sesión
                    </button>

                    <div className="flex items-center gap-3 my-6">
                        <div className="h-px bg-gray-300 flex-1"></div>

                        <span className=" text-sm text-gray-500">
                            O tambien puedes iniciar sesión con
                        </span>

                        <div className="h-px bg-gray-300 flex-1"></div>
                    </div>

                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => {
                            toast.error("No se pudo iniciar sesión con Google");
                        }}
                    />

                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
}