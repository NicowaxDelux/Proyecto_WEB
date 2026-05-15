import { useState } from "react";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";

export default function Checkout() {

    const [orderId, setOrderId] = useState("");

    const createOrder = async () => {
        
        const token = localStorage.getItem("token");

        //crear orden desde carrito
        const res = await fetch("/api/orders/checkout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        setOrderId(data.id);
    };

    const pay = async () => {

        const token = localStorage.getItem("token");

        await fetch("/api/payments/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                orderId,
                provider: "NEQUI",
            }),
        });

        alert("Pago iniciado");

    };

    return (
        
        <div>

            <Navbar />
            
            <div className="p-10 max-w-x1 mx-auto">

                <BackButton />

                <h1 className="text-3x1 font-bold mb-6">
                    Checkout
                </h1>

                <div className="bg-white p-6 rounded-2x1 shadow">
                    <button onClick={createOrder}
                            className="w-full mb-4 bg-gray-200 py-3 rounded-xl"
                    >
                        Crear Orden
                    </button>

                    <button onClick={pay}
                            className="w-full bg-black text-white py-3 rounded-x1 hover:bg-gray-800"
                    >
                        Pagar
                    </button>
                </div>

            </div>
        </div>
    );
}