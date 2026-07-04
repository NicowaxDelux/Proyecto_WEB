import {motion, AnimatePresence} from 'framer-motion';
import {useCart} from '../context/CartContext';
import { useRouter } from 'next/router';

export default function CartDrawer() {

    const router = useRouter();

    const {
        isOpen, 
        closeCart,
        cartItems,
        refreshCart,
        totalPrice
    } = useCart();


    const removeItem = async (id: Number) => {

        const token = localStorage.getItem('token');

        await fetch('/api/cart/remove', {
            method: 'POST',
            headers: {
                "content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({cartItemId: id})
        });

        refreshCart();

    }
    

    const updateQuantity = async (id: Number, quantity: Number ) => {

        const token = localStorage.getItem('token');

        await fetch('/api/cart/update', {
            
            method: 'POST',
            headers: {
                "content-Type": "application/json",
                Authorization: `Bearer ${token}`

            },

            body:JSON.stringify({cartItemId: id, quantity})
        });

        refreshCart();
    }
    
    return (
        <AnimatePresence>
            {isOpen &&(
                
                    <>
                    {/* Fondo oscuro */ }
                    <motion.div
                        className= "fixed inset-0 bg-black/50 z-40"
                        initial={{ opacity:0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        
                    />

                    {/*PANEL*/}

                    <motion.div 
                        initial={{ x: 400 }}
                        animate={{ x: 0 }}
                        exit={{ x: 400 }}
                        transition={{ type: "spring", damping: 25}}
                        className='fixed top-0 right-0 w-full max-w-md h-screen bg-white z-50 shadow-2x1 p-6 flex flex-col'
                    >

                        {/* HEADER*/}

                        <div className='flex justify-between intems-center mb-6'>

                            <h2 className='text-2xl font-bold'>
                                Tu Carrito  🛒
                            </h2>                          

                            <button
                                onClick={closeCart}
                                className='"text-2x1'
                            >
                                ✕
                            </button>
                        </div>

                        {/* ITEMS */ }

                        <div  className='flex-1 overflow-y-auto'>

                            {
                                cartItems.map(item => (

                                    <div
                                        key={item.id}
                                        className=" flex  gap-4 border-b py-4 "
                                    >

                                        {/* IMAGEN PRODUCTO */}
                                        <img 
                                            src= {
                                                item.product.imageUrl ||
                                                "/placeholder.png"
                                            } 
                                        
                                            alt={item.product.name} 
                                            className=" w-24 h-24 object-cover rounded-x1   "
                                        />


                                        {/* DETALLES DEL PRODUCTO */ }
                                        <h3>
                                            {item.product.name}
                                        </h3>

                                        <p>
                                            ${item.product.price}
                                        </p>

                                        {/* CONTROLES DE CANTIDAD */}
                                        <div className=" flex items-center gap-3 mt-3">

                                            {/* BOTÓN DE RESTA */}
                                            <button
                                                onClick={()=>

                                                    updateQuantity(
                                                        item.id,
                                                        item.quantity-1
                                                    )
                                                }
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                                            >
                                                -
                                            </button>

                                            <span>
                                                {item.quantity}
                                            </span>

                                            {/* BOTÓN DE SUMA */}
                                            <button
                                                onClick={()=>

                                                    updateQuantity(
                                                        item.id,
                                                        item.quantity+1
                                                    )
                                                }
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300"
                                            >
                                                +
                                            </button>

                                        </div>

                                        {/* BOTÓN DE ELIMINAR */}
                                        <button
                                            onClick={()=>removeItem(
                                                item.id
                                            )}
                                            className="text-red-500 text-sm mt-3"
                                        >
                                            Eliminar
                                        </button>

                                    </div>
                                ))
                            }
                            

                       </div> 

                        {/* FOOTER */ }
                        <div className="pt-6 border-t">

                            <h2
                                className=' font-bold text-x1 mb-4'
                            >
                                Total: ${totalPrice}
                            </h2>

                            <button className="w-full bg-black text-white py-3 rounded-x1 hover:bg-gray-800" 
                                    onClick= {() => router.push("/checkout")}>

                                Ir al checkout
                            </button>

                        </div>
                    </motion.div>
                </>
            )}

        </AnimatePresence>
    );
}