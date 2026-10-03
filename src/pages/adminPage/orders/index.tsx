import AdminLayout from "../../../components/Admin/AdminLayout";
import {useEffect, useState} from "react";
import { toast } from "react-hot-toast";

export default function OrdersPage() {

    const [orders, setOrders] = useState<any[]>([]);

    const loadOrders = async () => {

        const  token = localStorage.getItem("token");

        const res = await fetch("/api/admin/orders", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
        });

        const data = await res.json();

        if (res.ok) {
            setOrders(data);
        }
    };
    
    const updateOrderStatus = async (orderId: number, newStatus: string) => {

        const token = localStorage.getItem("token");
        try {

            const res = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error("Error al actualizar el estado del pedido", data);

                return;
            }

            // Actualizar solamente el pedido
            // que acabamos de modificar.

            setOrders((currentOrders) => currentOrders.map((order) => 

                order.id === orderId? {
                    ...order,
                    status: data.order.status
                }
                : order
            ));

        } catch (error) {

            console.error(error);
            toast.error("Error al actualizar el estado del pedido");
        }
    };


    useEffect(() => {
        loadOrders();
    }, []);

    return (
        <AdminLayout>
            
            <div className="mb-10">

                <h1 className="text-4xl font-semibold">
                    Pedidos
                </h1>

                <p className="text-gray-500 mt-2">
                    Gestiona los pedidos realizados en la tienda
                </p>
    
            </div>

            <div className="bg-white border rounded-2xl overflow-hidden">

                <table className="w-full">

                    <thead className="border-b">

                        <tr className="text-left">

                            <th className= "p-5">
                                Pedido
                            </th>

                            <th className= "p-5">
                                Cliente
                            </th>

                            <th className= "p-5">
                                Total
                            </th>
                            
                            <th className= "p-5">
                                Estado
                            </th>

                            <th className= "p-5">
                                Fecha
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {orders.map((order)=> (

                            <tr key={order.id} className="border-b hover:bg-gray-50">

                                <td className= "p-5 font-medium">
                                    #{order.id}
                                </td>

                                <td className= "p-5">

                                    <p className="font-medium">
                                        {order.user?.name || "Cliente"}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                        {order.user?.email}
                                    </p>

                                </td>

                                <td className= "p-5 font-medium">

                                    ${order.totalAmount.toLocaleString()}

                                </td>

                                <td className="p-5">

                                    <select
                                        value={order.status}
                                        onChange={(e) =>
                                            updateOrderStatus(
                                                order.id,
                                                e.target.value
                                            )
                                        }
                                        className="border rounded-lg px-3 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-black"
                                    >

                                        <option value="PENDING">
                                            PENDIENTE
                                        </option>

                                        <option value="PENDING_PAYMENT">
                                            VIAJANDO AL DESTINO
                                        </option>

                                        <option value="PAID">
                                            ENTREGADO
                                        </option>

                                        <option value="CANCELLED">
                                            CANCELADO
                                        </option>

                                    </select>

                                </td>
                             
                                <td className= "p-5 text-gray-500">
                                
                                    {new Date(order.createdAt).toLocaleDateString()}

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>
            </div>
            
        </AdminLayout>
    )

}