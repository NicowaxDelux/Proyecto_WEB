import { useRouter } from "next/router";
import { FaSignOutAlt } from "react-icons/fa";


export default function AdminNavbar(){

    const router = useRouter();

    const logout = () => {

        //Eliminar token almacenado
        localStorage.removeItem("token");

        //Redirigir a login
        router.push("/login");
    };

    return (

            <header className="h-24 bg-white border-b border-gray-200 px-10 flex items-center justify-between">

                {/*informacion del panel*/}

                <div>

                    <h1 className= "text-3-l font-semibold text-gray-900">
                        Panel de administracion
                    </h1>

                    <p className= "text-gray-500 mt-1">
                        Destiona productos, pedidos y ventas
                    </p>

                </div>

                {/*Acciones rapidas*/}  

                <div className="flex items-center gap-6">

                    {/*estado del sistema*/}

                    <div className="flex intems-center gap-2 bg-green-50 px-4 py-2 rounded-full">

                        <div
                            className="w-3 h-3 bg-green-500 rounded-full"
                        />

                        <span className="text-sm text-green-700 font-medium">

                            Sistema Online

                        </span>

                    </div>

                    {/*Fecha*/}

                    <span className="text-gray-500 text-sm">

                        {new Date().toLocaleDateString("es-CO")}

                    </span>

                    {/*Boton para cerrar cesion*/}

                    <button 

                        onClick={logout}
                    
                        className=" flex items-center gap-2 px-5 py-2 rounded-x1 boder border-gray-300 hover-bg-black
                                    hover:text-white transition-all"
                    >

                        <FaSignOutAlt/>

                        Salir

                    </button>

                </div>

            </header>
    );
}
