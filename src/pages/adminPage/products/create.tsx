import { useState } from "react";
import {useRouter} from "next/router";
import AdminLayout from "../../../components/Admin/AdminLayout";
import toast from "react-hot-toast";
import { error } from "node:console";
import { CldUploadWidget } from "next-cloudinary";


export default function CreateProduct() {

    const router = useRouter();


    //Estados del formulario
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    //estado para controlar si se esta enviando el formulario
    const[loading, setLoading] = useState(false);


    //crear producto
    const handleSubmit = async (e: React.FormEvent) => {

        //evitar que el navegador recargue la pagina
        e.preventDefault();

        //validaciones basicas
        if(!name.trim()) {

            toast.error("Ingresa un nombre para el producto");
            return;
        }

        if(!price || Number(price) <= 0) {

            toast.error("Ingresa un precio valido");
            return;
        }

        if(!stock || Number(stock) < 0) {

            toast.error("Ingresa un stock valido");
            return;
        }

        try {

            setLoading(true);

            const token = localStorage.getItem("token");

            const res = await fetch("/api/admin/products", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    name,
                    description,
                    price: Number(price),
                    stock: Number(stock),
                    imageUrl: imageUrl || null
                })
            });

            const data = await res.json();

            if(!res.ok) {

                toast.error( data.message || "No se pudo crear el producto");
                return;
            }

            //producto creado correctamente
            toast.success("Producto creado correctamente 🎉");

            //volver al listado
            router.push("/admin/products");

        } catch (error) {

            console.error("Error creando el producto", error);

            toast.error("Error de conexion con el servidor")

        } finally {

            setLoading(false);
        }

    };

    return (

        <AdminLayout>

            {/* Encabezado*/}

            <div className="mb-10">

                <button 
                    onClick={() => 
                        router.push("/admin/products")   
                    }

                    className="text-sm text-gray-500 hover:text-black transition"
                >
                     ← Volver a productos
                </button>

                <h1 className="text-4xl font-semibold mb-4">
                    Nuevo producto
                </h1>

                <p className="text-gray-500 mt-4">
                    Agrega un nuevo producto a tu tienda
                </p>

            </div>

            {/* Formulario*/}

            <form onSubmit={handleSubmit} className="bg-white border rounded-2xl p-8  max-w-4xl">

                {/* Nombre*/}

                <div className="mb-6">

                    <label className="block text-sm font-medium mb-2">

                        Nombre del producto

                    </label>

                    <input

                        type="text"

                        value={name}

                        onChange={(e) => setName(e.target.value)}

                        placeholder="Ej:Camiseta Oversize"
                    
                        className=" w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
                    />

                </div>


                {/*Descripcion */}
                <div className="mb-6">

                    <label className="block text-sm font-medium mb-2">

                        Descripción

                    </label>

                    <textarea

                        value={description}

                        onChange={(e) => setDescription(e.target.value)}

                        placeholder="Describe el prodcuto"

                        rows={5}

                        className=" w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
                    
                    />
                </div>

                {/*Precio y stock*/}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    
                    {/*Precio*/}

                    <div>

                        <label className="block text-sm font-medium mb-2">

                            Precio
                    
                        </label>

                        <input 
                        
                            type="number" 

                            min="0"

                            value={price}

                            onChange={(e) => setPrice(e.target.value)}

                            placeholder="80000"

                            className="w-full border rounded-xl p-3 outline-one focus:ring-2 focus:ring-black"
                            
                        />
                        
                    </div>

                    {/*Stock */}

                    <div>

                        <label className=" block text-sm font-medium mb-2">

                            Stock

                        </label>


                        <input
                        
                            type="number"

                            min="0"

                            value={stock}

                            onChange={(e) => setStock(e.target.value)}

                            placeholder="10"

                            className="w-full border rounded-xl p-3 outline-none focus:ring-2 focus:ring-black"
                        
                        />

                    </div>

                </div>

                {/*Url de imagen */}


                <div className="mb-8">

                    <label className="block text-sm font-medium mb-2">

                        URL de imagen

                    </label>

                    <CldUploadWidget
                    
                        uploadPreset="Tienda_productos"

                        onSuccess={(result) => {

                            const info = result.info as {
                                secure_url?: string;
                            };

                            if (info.secure_url) {
                                setImageUrl(info.secure_url);

                                toast.success("Imagen subida correctamente 📸");
                            }
                        }}
                    >

                        {({open}) => (

                            <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-black transition">

                                {!imageUrl ? (

                                    <button type="button" onClick={()=> open()} className="w-full py-10 text-gray-500 hover:text-black transition">

                                        <div className="text-4xl mb-3">
                                            📷
                                        </div>

                                        <p className="font-medium">
                                            Subir Imagen
                                        </p>

                                        <p className="text-sm text-gray-400 mt-1">
                                            JPG, PNG, WEBP
                                        </p>

                                    </button>
                                ) : (

                                    <div>
                                        
                                        <img 
                                            src={imageUrl} 
                                            alt="Vista previa" 
                                            className="w-full max-h-80 object-contain rounded-xl"
                                        />

                                        <button type="button"onClick={()=> {setImageUrl("")}} className="mt-4 text-sm text-gray-500 hover:text-black">

                                            Cambiar imagen  

                                        </button>

                                    </div>
                                )}
                                
                            </div>
                        )}

                    </CldUploadWidget>

                    <p className="text-xs text-gray-400 mt-2">

                        Recomendado:
                        imágenes verticales de buena calidad

                    </p>

                </div>

                {/*Boton */}

                <button
                    
                    type="submit"

                    disabled={loading}

                    className="
                            w-full
                            bg-black
                            text-white
                            py-4
                            rounded-xl
                            font-medium
                            hover:bg-gray-800
                            trasition
                            disabled:opacity-50
                    " 
                >
                    {loading
                        ? "Creando producto..."
                        : "Crear producto"
                    }

                </button>

            </form>

        </AdminLayout>
    );

}