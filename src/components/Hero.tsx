import { motion } from  "framer-motion";


export default function Hero() {

    return( 
        <section className="h-[90vh] flex flex-col md:flex-row items-center justify-between px-12 bg-gradient-to-r
                             from-black to-gray-900 text-white">
                                

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gray-200 
            rounded-full blur-[180px] opacity-40"/>

        {/* TEXTO  */}

        <div
            className="flex-1 text-center md:text-left"
        >

            <motion.h1
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y:0}}
                transition={{duration:0.7}}
                className="text-sm md:text-2xl inline-block px-4 py-2 rounded-full
                 bg-black text-white font-semibold tracking-wide mb-6"
            >
                    NUEVA COLECCIÓN 2026
            </motion.h1>

            <motion.h1
                initial={{opacity: 0, y: -20}}
                animate={{opacity: 1, y:0}}
                transition={{duration:0.7}}
                className="text-5x1  md:text-7xl font-black leading-tight"
                 >
                    Viste tu
                    <span className="block text-gray-700">
                        Mejor version
                    </span>
            </motion.h1>

            <motion.p
                initial={{ opacity:0 }}
                animate={{ opacity:1 }}
                transition={{ delay:0.4 }}
                className="mt-8 text-gray-600 text-lg leading-8 max-w-x1"
            >
                Descubre prendas seleccionadas para quienes buscan calidad,
                estilo y comodidad en cada detalle. Estilo moderno calidad premium.
            </motion.p>
            
        </div>

        {/* IMAGEN */}
        <motion.img
            src="/images/Yo2.png"
            alt="ropa"
            className="w-[420px] md:w-[400px] mx-auto drop-shadow-2xl"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
        />

        </section>
        

    )

}