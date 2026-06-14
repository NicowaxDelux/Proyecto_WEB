import { useEffect, useState } from "react";
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";   

type Product = {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
};

export default function Home() {

    //estado para guardar productos

    const [products, setProducts] = useState([]);

    const {openCart, refreshCart} = useCart();

    //se ejecuta cuando carga la pagina
    useEffect(() => {
        fetch("api/products")
        .then(res => res.json())
        .then(setProducts);
    },[]);

    //funcion de agragar el carrito

    const addToCart = async (productId: number) => {

        const token = localStorage.getItem("token");

        await fetch("/api/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // aqui tomamos el JWT
            },
            body: JSON.stringify({
                productId,
                quantity: 1,
            }),
        });

        await refreshCart();
        openCart();
        toast.success("Producto agregado 🛒")
    };

    return (
        <div>

            <Navbar />
            <Hero />

                <section id="productos" className="p-12">

                    <h2 className="text-3xl font-bold mb-8">
                        Productos destacados
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                        {products.map((p: any) => (
                            <ProductCard
                                key={p.id}
                                product={p}
                                addToCart={addToCart}
                            />
                        ))}

                    </div>

                </section>
        </div>
    );  
}
