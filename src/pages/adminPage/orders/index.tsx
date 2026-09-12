import AdminLayout from "../../../components/Admin/AdminLayout";
import {useEffect, useState} from "react";

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

                                <td className="p-5 text-gray-500">

                                    {order.status}

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