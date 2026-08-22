import AdminLayout from "../../../components/Admin/AdminLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export default function ProdcutsPage(){

    /*
    ======================================
    Estado donde se guardarán
    los productos que vienen de la API
    ======================================
    */
    const [ products, setProducts] = useState<any[]>([]);

    const router = useRouter();


    const loadProducts = async() => {

        const token = localStorage.getItem("token");
    

        const res = await fetch ("/api/admin/products", {

            headers: {
                Authorization: `Bearer ${token}` 
            }
        });

        const data = await res.json();

        setProducts(data);

    };

    // CARGAR PRODUCTOS AL ENTRAR A LA PÁGINA
    useEffect(() => {
        loadProducts();
    },[]);

    return (

        <AdminLayout> 

            <div>
                
                <div>
                    <h1 className= "text-4xl font-semibold">
                        Productos
                    </h1>
                </div>

            <button 
                    onClick={() => router.push("/adminPage/products/create")}
                    className= "bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition"
            >
                Agregar producto
            </button>


            <div className="bg-white rounded-2xl border overflow-hidden">

                <table className="w-full">

                    <thead className="bg-gray-100">

                        <tr>

                            <th className="text-left p-5">
                                Imagen
                            </th>

                            <th className="text-left p-5">
                                Nombre
                            </th>

                            <th className="text-left p-5">
                                Precio
                            </th>

                            <th className="text-left p-5">
                                Stock
                            </th>

                            <th className="text-left p-5">
                                Acciones
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        { 
                            products.length === 0 ?
                            (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-gray-500">
                                        No hay productos registrados
                                    </td>
                                </tr>
                            )
                            :
                            (
                                products.map(product => (

                                    <tr key={product.id} className="border-t">

                                        <td className="p-4">

                                            <img 
                                                src={product.imageUrl || "/placeholder.png"}
                                                
                                                className="w-20 h-20 object-cover rounded-xl"
                                            />

                                        </td>

                                        <td>

                                            {product.name}
                                        
                                        </td>

                                        <td>

                                            ${product.price.toLocaleString()}

                                        </td>

                                        <td>

                                            {product.stock}

                                        </td>

                                        <td>
                                   
                                            Editar

                                        </td>
                                        
                                    </tr>
                                ))
                            )
                        }

                    </tbody>

                </table>

            </div>
                                

            </div>
            
        </AdminLayout>
    );
}