import AdminLayout from "../../../components/Admin/AdminLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


export default function ProdcutsPage(){

    /*
    ======================================
    Estado donde se guardarán
    los productos que vienen de la API
    ======================================
    */
    const [ products, setProducts] = useState<any[]>([]);

    // ESTADOS PARA EDITAR PRODUCTOS 
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    // Datos del formulario(
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPrice, setEditPrice] = useState("");
    const [editStock, setEditStock] = useState("");
    const [editImageUrl, setEditImageUrl] = useState("");

    // Estado para evitar múltiples clics mientras guardamos
    const [savingProduct, setSavingProduct] = useState(false);

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

    const startEditing = (product: any) => {

        // Guardamos el producto seleccionado
        setEditingProduct(product);

        // Cargamos sus datos actuales en el formulario
        setEditName(product.name || "");

        setEditDescription(product.description || "");

        setEditPrice(product.price || "");

        setEditStock(product.stock || "");

        setEditImageUrl(product.imageUrl || "");
    };        

    const cancelEditing = () => {

        setEditingProduct(null);

        setEditName("");
        setEditDescription("");
        setEditPrice("");
        setEditStock("");
        setEditImageUrl("");
    };


    const saveProduct = async() => {

        // Verificar que exista un producto seleccionado
        if(!editingProduct) {
            return;
        }

        // Evitar múltiples envíos
        if(savingProduct) {
            return;
        }

        try {

            setSavingProduct(true);

            //obtener el token 
            const token = localStorage.getItem("token");

            // Enviar actualización al backend
            const res = await fetch (
                `/api/admin/products/${editingProduct.id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({

                        name: editName,
                        description: editDescription,
                        price: Number(editPrice),
                        stock: Number(editStock),
                        imageUrl: editImageUrl
                    }),
                }
            );

            // Obtener respuesta
            const data = await res.json();

            // Validar respuesta

            if(!res.ok) {

                alert(
                    data.message || "No se pudo actualizar el producto"
                );
            }


            // Actualización exitosa
            toast("Producto actualizado correctamente");

            // Recargar productos
            await loadProducts();

            // Cerrar editor
            cancelEditing();



        } catch (error){

            console.error("Error actualizando producto:",error);

            alert("Ocurrio un error al actualizar el producto");

        } finally {

            setSavingProduct(false);
        }

    };

    // ELIMINAR PRODUCTO
    
    const deleteProduct = async (productId: number) => {

         // Confirmación antes de eliminar
         const confirmed = window.confirm ("¿Estás seguro de que quieres eliminar este producto?")

         // Si el administrador cancela
         if (!confirmed) {
            return;
         }

         try {

            // Obtener token
            const token = localStorage.getItem("token");

            // Petición DELETE
            const res = await fetch (
                `/api/admin/products/${productId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`    
                    }
                }
            );

            // Obtener respuesta
            const data  = await res.json();

            // Validar respuesta
            if (!res.ok) {

                toast( data.message || "No se pudo eliminar el producto");

                return;
            };

            toast("Producto eliminado correctamente");

            // Recargar productos
            await loadProducts();

         }catch(error) {

            console.error("Error eliminando producto:", error);
            
            toast("Ocurrio un error al eliminar el producto");
         }

    }

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
                                   
                                            <button
                                                onClick={()=> startEditing(product)}
                                                className="mt-4 px-4 py-2 border rounded-lg hover:bg-black hover:text-white transition"
                                            >
                                               ✏️ Editar
                                            </button>

                                        </td>

                                        <td>

                                            <button 
                                                onClick={() => deleteProduct(product.id)}
                                                className="px-4 py-2 border border-read-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                                            >
                                                🗑️ Eliminar
                                            </button>

                                        </td>
                                        
                                    </tr>
                                ))
                            )
                        }

                    </tbody>

                </table>

            </div>

            {editingProduct && (

                <div className="mt-10 bg-white border rounded-2xl p-6 shadow-sm">

                    <div className="flex justifay-between items-center mb-6">

                        <div>

                            <p className="text-xs uppercase tracking-widest text-gray-400">
                                Administración
                            </p>

                            <h2 className=" text-2xl  font-semibold">
                                Editor producto
                            </h2>

                        </div>

                        <button
                            onClick={cancelEditing}
                            className="text-gray-500 hover:text-black"
                        >
                            ✕
                        </button>

                    </div>


                    {/* NOMBRE */}

                    <div className="mb-5">

                        <label className="block text-sm font-medium mb-2">
                            Nombre
                        </label>

                        <input 
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full border rounded-xl p-3"
                        />
                    </div>

                    {/* DESCRIPCION */}

                    <div className="mb-5">

                        <label className="block text-sm font-medium mb-2">
                            Descripción
                        </label>

                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            className="w-full border rounded-xl p-3 min-h-[100px]"
                        />

                    </div>

                    {/* PRECIO */}

                    <div className="mb-5">

                        <label className="block text-sm font-medium mb-2">
                            Precio
                        </label>

                        <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full border rounded-xl p-3"
                        />

                    </div>

                    {/* STOCK */}

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            Stock
                        </label>

                        <input 
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(e.target.value)}
                            className="w-full border rounded-xl p-3"
                        />
                    </div>


                    {/* URL DE IMAGEN */}

                    <div className="mb-6">

                        <label className="block text-sm font-medium mb-2">
                            Imagen
                        </label>

                        <input 
                            type="text" 
                            value={editImageUrl}
                            onChange={(e) => setEditImageUrl(e.target.value)}
                            className="w-full border rounded-xl p-3"
                            placeholder="URL de Cloudinary"
                        />

                    </div>

                    {/*  PREVISUALIZACION */}

                    {editImageUrl && (

                        <div className="mb-6">

                            <p className="text-sm text-gray-500 mb-2">
                                Vista previa
                            </p>

                            <img 
                                src={editImageUrl}
                                alt={editName}
                                className="w-40 h-40 object-cover rounded-xl"
                            />

                        </div>
                    )}

                    {/* BOTONES */}

                    <div className="flex gap-3">

                        <button onClick={cancelEditing} className="flex-1 border rounded-xl py-3 hover:bg-gray-100">
                            Cancelar 
                        </button>

                        <button
                            onClick={saveProduct}
                            disabled={savingProduct}
                            className="flex-1 bg-black text-white rounded-l py-3 hover:bg-gray-800 disabled:opacity-50"
                        >
                            {savingProduct
                                ? "Guardando..."
                                :"Guardar cambios"
                            }

                        </button>



                    </div>


                    

                </div>

            )}
                                

            </div>
            
        </AdminLayout>
    );
}