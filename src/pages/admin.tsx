import { useState } from "react";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";


export default function Admin(){

    useAuth();

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState ("");

    const createProduct  = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch("api/products/create", {
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    price: Number(price),
                    stock: Number(stock),
                }),
            });

            if(!res.ok) {
                throw new Error ("Error al crear prodcuto");
            }

            alert("Prodcuto creado correctamente 🚀");
        }catch (error) {
            alert("Hubo un error");
            console.error(error);
        }
    };

    return (

        <div>
            
            <Navbar />

            <div className="p-10">

                    <h1 className="text-3x1 font-bold mb-6">
                        Panel Admin ⚙️
                    </h1>

                    <input 
                        placeholder="Nombre"
                        className="w-full mb-4 p-3 border rounded-xl"
                        onChange={e => setName(e.target.value)}
                    />
                    <input 
                        placeholder="Precio"
                        className="w-full mb-4 p-3 border rounded-xl"
                        onChange={e => setPrice(e.target.value)}
                    />
                    
                    <input 
                        placeholder="Stock"
                        className="w-full mb-4 p-3 border rounded-xl"
                        onChange={e => setStock(e.target.value)}
                    />
                    

                    <button 
                        onClick={createProduct}
                        className="bg-black text-white px-6 py-3 rounded-x1"
                    >
                        Crear producto
                    </button>
            </div>
        </div>
    );
}