import { motion } from  "framer-motion";


export default function Hero() {

    return( 
        <section className="h-[90vh] flex items-center justify-between px-12 bg-gradient-to-r from-black to-gray-900 text-white">

        {/* TEXTO  */}

        <div>

            <motion.h1
                initial={{opacity: 0, y: 50}}
                animate={{opacity: 1, y:0}}
                transition={{duration:0.8}}
                className="text-6xl font-bold leading-tight"
            >
                Viste tu mejor version
            </motion.h1>

            <motion.p
                initial={{ opacity:0 }}
                animate={{ opacity:1 }}
                transition={{ delay:0.5 }}
                className="mt-4 text-gray-300 text-lg"
            >
                Estilo moderno calidad premium
            </motion.p>
            
            <motion.a
                href="#products"
                whileHover={{ scale: 1.05 }}
                className="inline-block mt-6 bg-white text-black px-6 py-3 rounded-xl font-semibold"
            >
                Comprar ahora
            </motion.a>
        </div>

        {/* IMAGEN */}
        <motion.img
            src="../public/tomy.jpeg"
            alt="ropa"
            className="h-[500px] object-cover rounded-2xl shadow-2xl"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
        />

        </section>
    )

}