import Link from "next/link"
import { useCart } from "../context/CartContext"

export default function Navbar(){

    const {openCart , cartItems} = useCart();

    const totalItems = cartItems.reduce(
        (acc, item) => acc + item.quantity,
        0
    );

    return (
        <nav className="w-full flex justify-between items-center px-8 py-4 bg-white shadow-sm  top-0 z-30">
            
            <div className="max -w-7x1 mx-auto  px-4 md:px-8 py-4 flex justify-between  items-center">

                <h1 className="text-x1 md:text-2x1 font-bold curson-pointer px-4">
                    Tienda:
                </h1>

                {/* Navigation links */}
                <div className="flex items-center gap-3 md:gap-6">

                    <Link href="/" className=" text-sm md:text-base hover:text-black text-gray-500">
                        Productos
                    </Link>

                    <button
                        onClick={openCart}  
                        className="relative hover:text-black text-gray-500"
                    >
                        <span>
                            Carrito 🛒
                        </span>
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -left-3 bg-red-500 text-white  text-xs rounded-full px-2">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    <Link href="/login" className="text-sm md:text-base hover:text-black text-gray-500">
                        Login
                    </Link>

                </div>
            </div>

        </nav>
    )
}