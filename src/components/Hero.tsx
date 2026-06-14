import { motion } from  "framer-motion";


export default function Hero() {

    return( 
        <section className="h-[90vh] flex flex-col md:flex-row items-center justify-between px-12 bg-gradient-to-r
                             from-black to-gray-900 text-white">

        {/* TEXTO  */}

        <div
            className="flex-1 text-center md:text-left"
        >

            <motion.h1
                initial={{opacity: 0, y: 50}}
                animate={{opacity: 1, y:0}}
                transition={{duration:0.7}}
                className="text-4xl md:text-6xl font-bold leading-tight"
            >
                Viste tu mejor version
            </motion.h1>

            <motion.p
                initial={{ opacity:0 }}
                animate={{ opacity:1 }}
                transition={{ delay:0.6 }}
                className="mt-4 text-gray-300 text-lg"
            >
                Estilo moderno calidad premium
            </motion.p>
            
        </div>

        {/* IMAGEN */}
        <motion.img
            src="../public/Yo2.png"
            alt="ropa"
            className="mt-10 md:mt-0 w-full ,ax-w-md rounded2x1 shadow-2x1"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
        />

        </section>
    )

}