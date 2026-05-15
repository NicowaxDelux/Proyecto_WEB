import { useState } from "react";
import { useRouter } from "next/router";
import BackButton from "../components/BackButton"

export default function Login() {

    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email, password}),
        });

        const data = await res.json();

        //guardar token
        if(data.token){ 
            localStorage.setItem("token", data.token);
            
            router.push("/");
        } else {
            alert("Error al logearte")
        };


        alert("Login exitoso 🔐");
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