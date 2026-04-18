import { stringify } from "node:querystring";
import { useState } from "react";

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
            <h1>Checkout</h1>

            <button onClick={createOrder}>
                Crear Orden
            </button>

            <button onClick={pay}>
                Pagar
            </button>
        </div>
    );
}