import { useState } from "react";
import { useRouter } from "next/router";
import BackButton from "../components/BackButton"
import toast from "react-hot-toast";

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
                router.push("/admin");
            }else {
                router.push("/");
            }
        }
        catch (error) {
            console.error(error)
            toast.error("Error al iniciar sesión.")
        }
    };

    return (

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

                </div>
            </div>
        </div>
    );
}