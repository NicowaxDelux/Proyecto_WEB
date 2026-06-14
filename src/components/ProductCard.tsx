import {motion} from "framer-motion"

export default function ProductCard ({product, addToCart}: any) {
    return (
        <motion.div
            whileHover={{ y:10 }}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl"
        >
            <img 
                src={product.imageUrl || "placeholder.png"} 
                className="h-60  md:h-72 w-full object-cover"
            />

            <div className="p-4">
                <h2 className="text-lg  font-semibold">
                    {product.name}
                </h2>

                <p  className="text-gray-500">
                    ${product.price}                    
                </p>|

                <motion.button
                    whileTap={{ scale:0.9}}
                    whileHover={{ scale:1.03}}

                    onClick={() => addToCart(product.id)}
                    className= "mt-4 w-full bg-black text-white py-2 rounded-x1 hover:bg-gray-800"
                >
                    Agregar al carrito
                </motion.button>

        
            </div>
        </motion.div>
    );
}