import AdminLayout from "../../../components/Admin/AdminLayout";
import {useEffect, useState} from "react";
import { toast } from "react-hot-toast";

export default function PaymentsPage() {

    const [payments, setPayments] =useState<any[]>([]);

    const loadPayments = async () => {

        const token = localStorage.getItem("token");

        const res = await fetch("/api/admin/payments", {

            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (res.ok) {
            setPayments(data);
        }
    };


        const updatePaymentStatus = async (paymentId: number, newStatus: string) => {

        const token = localStorage.getItem("token");
        try {

            const res = await fetch(`/api/admin/payments/${paymentId}`, {
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

            // Actualizar solamente el pago
            // que acabamos de modificar.

            setPayments((currentPayments) => currentPayments.map((payment) => 

                payment.id === paymentId? {
                    ...payment,
                    status: data.payment.status
                }
                : payment
            ));

        } catch (error) {

            console.error(error);
            toast.error("Error al actualizar el estado del pago");
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    return (

        <AdminLayout>

            <div className="mb-10">

                <h1 className="text-4xl font-semibold">
                    Pagos
                </h1>

                <p className="text-gray-500 mt-2">
                    Consulta los pagos realizados por los clientes
                </p>

            </div>

            <div className="bg-white border rounded-2xl overflow-hidden">

                <table className="w-full">

                    <thead className="border-b">

                        <tr className="text-left">

                            <th className="p-5">
                                Referencia
                            </th>
                            
                            <th className="p-5">
                                Correo
                            </th>

                            <th className="p-5">
                                Método
                            </th>

                            <th className="p-5">
                                Monto
                            </th>

                            <th className="p-5">
                                Estado
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {payments.map((payment) => (

                            <tr
                                key={payment.id}
                                className="border-b hover:bg-gray-50"
                            >

                                <td className="p-5 font-medium">
                                    {payment.reference}
                                </td>

                                <td className="p-5">
                                    {payment.order?.user?.email}
                                </td>

                                <td className="p-5 uppercase">
                                    {payment.provider}
                                </td>

                                <td className="p-5">
                                    {payment.amount.toLocaleString()}
                                </td>

                                <td className="p-5">

                                    <select
                                        value={payment.status}
                                        onChange={(e) =>
                                            updatePaymentStatus(
                                                payment.id,
                                                e.target.value
                                            )
                                        }
                                        className="border rounded-lg px-3 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-black"
                                    >

                                        <option value="PENDING">
                                            PENDIENTE
                                        </option>

                                        <option value="PENDING_PAYMENT">
                                            PAGO PENDIENTE
                                        </option>

                                        <option value="PAID">
                                            PAGADO
                                        </option>

                                        <option value="CANCELLED">
                                            CANCELADO
                                        </option>

                                    </select>

                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>
            </div>

        </AdminLayout>
    )
}