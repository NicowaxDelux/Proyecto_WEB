import { useState } from "react";


export default function login() {
    
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
        localStorage.setItem("token", data.token);

        alert("Login exitoso 🔐");
    };

    return (

        <div>
            <h1>Login</h1>

            <input 
                placeholder="Email"
                onChange={e => setEmail(e.target.value)}
            />

            <input  
                type="password"
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>
                Iniciar sesión
            </button>
        </div>
    );
}