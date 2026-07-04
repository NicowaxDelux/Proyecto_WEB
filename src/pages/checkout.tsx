import { useState } from "react";
import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";
import toast from "react-hot-toast";

export default function Checkout() {

    //ID orden creada
    const [orderId, setOrderId] = useState<number | null>(null);
    
    //metodod de pago seleccionado
    const [provider, setProvider] = useState("");

 
    const paymentMethods = {
    
        nequi: {
            title: "Pagar con Nequi",
            number: "310 399 0818"
        },

        llaves: {
            title: "Pagar con Llaves",
            number: "@310 399 0818"
        },

        bancolombia: {
            title: "Pagar con Bancolombia",
            number: "123456789"
        }
    };   


    const createOrder = async () => {
       try { 
            const token = localStorage.getItem("token");

            //crear orden desde carrito
            const res = await fetch("/api/orders/checkout", {
                method: "POST",
                headers: {
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if(!res.ok) {
                alert(data.message || "No se pudo crear");
                return;
            }

            setOrderId(data.id);

            toast.success(`Orden #${data.id} creada`)


       } 
        catch (error) {
            console.error("Los sentimos, hubo un error al crear la orden");
        }

    };


    console.log({orderId, provider});

    const pay = async () => {

        if(!orderId) {
            toast.error("Primero debes crear la orden");
            return;
        }

        if(!provider) {
            toast.error("Selecciona un metodo de pago")
            return;
        }

        try {

            const token = localStorage.getItem("token");

            // crear pago de la orden
            const pay = await fetch("/api/payments/create",

                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: 
                        JSON.stringify({ orderId, provider}),
                }
            );

            const data = await pay.json();

            if(!pay.ok) {
                toast.error(data.message);
                return;
            }
            
            //usar referencia de la orden para generar mensaje de whatsapp
            const reference = data.reference || `ORD-${orderId}`;

            const message = encodeURIComponent(
                `
                🛍️ NUEVA ORDEN

                ━━━━━━━━━━

                🧾 Orden:
                #${orderId}

                💳 Metodo de pago:            
                ${provider}

                🔖 Referencia:
                ${reference}

                ━━━━━━━━━━

                Hola 👋

                Ya realicé la transferencia.

                Adjuntaré el comprobante en este chat.

                Gracias.`
            );

            //abrir whatsapp con mensaje predefinido
            window.location.href = `https://wa.me/573103990818?text=${message}`;
            

        }
        catch (error) {
            console.error("Los sentimos, hubo un error al procesar el pago");
        }


    }

    return (
        
        <div className= "min-h-screen bg-gradient-to-b from-white to-gray-100">

            <Navbar />
            
            <div className="p-4 md:p-10 w-full max-w-3x1 mx-auto py-12 px-6">

                <BackButton />

                <p className="uppercase tracking-[9px] text-gray-400 text-lg">
                    Checkout
                </p>
                
                <h1 className= "text-5x1 font-black mt-2">
                    Finaliza tu compra
                </h1>

                <div className="bg-white p-10 rounded-3x1 shadow-x1 space-y-8">
                    <button onClick={createOrder}
                            className="w-full bg-black text-white py-5 rounded-full hover:scale-[1.02] duration-300 "
                    >
                        Crear Orden
                    </button>

                    {
                        orderId !== null && (
                            <>
                                <div className="bg-green-50 rounded-3x1 p-6">
                                    <label>
                                        Metodo de pago:
                                    </label>

                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value)}
                                        className= "w-full mt-2 p-5 border rounded-2x1"
                                    >
                                        <option value="">
                                            Selecciona un metodo de pago
                                        </option>

                                        {
                                            Object.entries(paymentMethods).map(([Key, value]) => (
                                                <option key={Key} value={Key}>
                                                    {value.title} {value.number}
                                                </option>
                                            ))    
                                        }
                                    </select>
                                </div>

                                {provider && (
                                    <div
                                        className= "bg-gray-50 rounded-3x1 p-8 "
                                    >
                                        <p className= "text-gray-500">
                                            Transferir a:
                                        </p>

                                        <h3 className="font-bold text-3x1">
                                            {paymentMethods[provider as keyof typeof paymentMethods].title}
                                        </h3>
                                        
                                    </div>   
                                )}

                                <button onClick={pay} 
                                        className="w-full bg-black text-white py-5 rounded-full hover:bg-gray-900"
                                >
                                    Enviar comprobante por WhatsApp
                                </button>
                            </>  
                        )
                    }
                </div>
            </div>
        </div>
    );
}