import AdminLayout from "../../../components/Admin/AdminLayout";
import {useEffect, useState} from "react";

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
                                    {payment.status}
                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>
            </div>

        </AdminLayout>
    )
}