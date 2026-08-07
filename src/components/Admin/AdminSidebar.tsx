import Link from "next/link";
import {useRouter} from "next/router";

import {
    FaBox,
    FaClipboardList,
    FaCog,
    FaHome,
    FaSignOutAlt,
    FaUsers,
    FaMoneyBillWave
} from "react-icons/fa";


export default function AdminSidebar(){

    // Router de Next.js
    // Nos permitirá saber en qué página estamos.
    const router = useRouter();


    // ==========================
    // MENÚ DEL PANEL
    // ==========================
    // En lugar de escribir mucho HTML,
    // creamos un arreglo con toda la información.

    const menu = [

        {
            name:"DashBoard",
            icon: <FaHome/>,
            path: "/adminPage"
        },

        {
            name:"Productos",
            icon: <FaBox/>,
            path: "/adminPage/products"
        },

        {
            name:"Pedidos",
            icon: <FaClipboardList/>,
            path: "/adminPage/orders"
        },

        {
            name: "Pagos",
            icon: <FaMoneyBillWave/>,
            path: "/adminPage/payments"
        },

        {
            name: "Usuarios",
            icon: <FaUsers/>,
            path: "/adminPage/users"
        },

        {
            name: "Configuracion",
            icon: <FaCog/>,
            path: "/adminPage/settings"
        }
    ];

    return (

        <aside className= "w-72 bg-white border-r shadow-sm flex flex-col">
            
            **LOGO**

            <div className= "h-20 flex  items-center justify-center border-b">

                <h1 className= "text-2xl font-bold">

                    🛍 Martha Store

                </h1>

            </div>

            **MENU**

            <nav className= "flex-1 p-4">

                {
                    menu.map((item) => (

                        <Link 
                        
                            key={item.path}

                            href={item.path}

                            className={`flex items-center gap-4 p-4 rounden-x1 mb-2 trasition-all
                                
                                    ${router.pathname === item.path 

                                        ? "bg-black text-white"
                                        : "hover:bg-gray-100"
                                    }
                                 `}
                        >

                            {item.icon}

                            <span>
                                {item.name}
                            </span>
                                
                        </Link>
                    ))
                }

            </nav>

            **FOOTER**

            <div className= "border-t p-4">

                <div className= "mb-4">

                    <p className= "font-semibold">
                        Administrador
                    </p>

                    <p className= "text-sm text-gray-500">
                        Admin@gmail.com
                    </p>
                </div>

                <button className= "flex items-center gap-3 text-red-500 hover:text-red-700 trasition">

                    <FaSignOutAlt/>
                    cerrar sesión

                </button>
            </div>

        </aside>
    )

}
