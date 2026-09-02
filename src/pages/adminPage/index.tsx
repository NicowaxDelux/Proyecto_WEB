import AdminLayout from "../../components/Admin/AdminLayout";

//iconos
import {
    FaBoxOpen,
    FaShoppingBag,
    FaDollarSign,
    FaExclamationTriangle,
    FaPlus
} from "react-icons/fa"

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function AdminDashboard() {

    const router = useRouter();
    /*
        Informacion del dashboard
    */

    const [stats, setStats] = useState({

        totalProducts: 0,
        totalOrders: 0,
        totalSales: 0,
        lowStock: 0
    })


    const loadDashboard = async () => {

        const token = localStorage.getItem('token');

        const res = await fetch ("/api/admin/dashboard", {

            headers: {
                'Authorization': `Bearer ${token}`
            }
        });


        const data = await res.json();

        setStats(data);
    }

    useEffect(() => {
    
        loadDashboard();
    
    }, []);


    return (

        <AdminLayout>
            {/* Encabezado*/}

            <section className="mb-12">

                <h2 className= "text-4xl font-semibold">
                    Bienvenido al panel
                </h2>
                
                <p className= "text-gray-500 mt-2">
                    Aqui puedes administrar desde un solo lugar
                </p>
            </section>

            {/*tarjetas*/}

            <section className= " grid grid-cols-4 gap-6 m-12">

                <Card
                    icon={<FaBoxOpen/>}
                    title="Productos"
                    value= {String(stats.totalProducts)}
                />

                <Card
                    icon={<FaShoppingBag/>}
                    title="Pedidos"
                    value= {String(stats.totalOrders)} 
                />

                <Card
                    icon={<FaDollarSign/>}
                    title="Ventas"
                    value= {`$${stats.totalSales?.toLocaleString()}`}
                />

                <Card
                    icon={<FaExclamationTriangle/>}
                    title="Stock bajo"
                    value= {String(stats.lowStock)}
                />
            </section>

            {/*Secciones Rapidas*/}

            <section className="bg-white rounded-2xl p-8 border">

                    <h3 className="text-xl font-semibold">
                        Acciones rápidas
                    </h3>

                    <div className="flex gap-4 mt-6">

                        <button onClick={() => router.push("/adminPage/products/create")} className="bg-black text-white  px-6 py-3 rounded-xl hover:opacity-90 transition">

                            <FaPlus className=" inline mr-2"/>

                            Nuevo Producto

                        </button>

                    </div>

            </section>

        </AdminLayout>

    )
}

{/* Componentes Reutilizables para tarjetas*/}

interface CardProps {

    icon:any;
    title:string;
    value:string;

}

function Card({

    icon,
    title,
    value
    
}: CardProps) {

    return(

        <div className= "bg-white rounded-2xl border p-8">

                <div className="text-2xl mb-6">

                    {icon}

                </div>

                <p className="text-gray-500">

                    {title}

                </p>

                <h2 className="text-4xl font-bold mt-2">

                    {value}

                </h2>
        </div>
    )
}