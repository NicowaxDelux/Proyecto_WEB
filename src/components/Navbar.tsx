export default function Navbar(){
    return (
        <nav className="w-full flex justify-between items-center px-8 py-4 bg-white shadow-sm">
            <h1 className="text-2xl font-bold tracking-wide">
                Tienda
            </h1>

            <div className="flex gap-6 items-center">
                <a href="/" className="hover:text-black text-gray-500">
                    Productos
                </a>
                <a href="/cart" className="hover:text-black text-gray-500">
                   Carrito 
                </a>
                <a href="/login" className="bg-black text-white px-4 py-2 rounded-xl hover:scale-105">
                    Login
                </a>

            </div>
        </nav>
    )
}