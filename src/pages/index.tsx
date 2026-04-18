import { useEffect, useState } from "react";
import Navbar from "../components/Navbar"

type Product = {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
};

export default function Home() {

    //estado para guardar productos

    const [products, setProducts] = useState<Product[]>([]);

    //se ejecuta cuando caga la pagina
    useEffect(() => {
        fetch("api/products")
        .then(res => res.json())
        .then(data => setProducts(data));
    },[]);

    //funcion de agragar el carrito

    const addToCart = async (productId: number) => {

        const token = localStorage.getItem("token");

        await fetch("/api/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // aqui tomamos el JWT
            },
            body: JSON.stringify({
                productId,
                quantity: 1,
            }),
        });

        alert("Producdo agregado 🛒");
    };

    return (
        <div>

            <Navbar />

            <div className="p-10">

                <h1 className="text text-4xl font-bold mb-10">
                  Nueva Colección 👕
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
                    {products.map(product => (
                        <div key={product.id}
                            className="bg-white rounded-2x1 shadow-md p-4 hover: shadow-x1 hover:-translate-y-2" >

                            <img src={ product.imageUrl || "/placeholder.png"}
                            className="rounded-x1 h-60 w-full object-cover"/>
                            <h2 className="text-xl font-semibold mt-4"
                            >{product.name}
                            </h2>

                            <p className="text-gray-500"
                            >${product.price}
                            </p>

                            <button onClick={() => addToCart(product.id)}
                                className="mt-4 w-full bg-black text-white py-2 rounded-xl hover:bg-gray-800">
                                Agregar carrito
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );  
}
