import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Cart() {

    const [cart, setCart] = useState<any[]>([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("api/cart",{
            headers: {
                Authorization: `Bearer ${token}`,
            }, 
        })
            .then(res => res.json())
            .then(data => setCart(data));
    }, []);

    return (
        <div className="p-10">
            <h1 className="text-3x1 font-bold mb-6">
                Tu carrito 🛒
            </h1>
            
            {cart.map(item =>(
                <div key={item.id}
                    className="bg-white p-4  rounded-x1 shadow flex justify-between items-center mb-4">
                    
                    <div>
                        <h2>{item.product.name}</h2>
                        <p className="text-gray-500">
                            Cantidad: {item.quantity}
                        </p>
                    </div>

                    <p className="font-bold">
                        ${item.product.price * item.quantity}
                    </p>
                </div>
            ))}
        </div>
    );
}