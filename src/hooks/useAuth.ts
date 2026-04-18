import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function useAuth() {

    //  Instancia del router para redirecciones
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
         //  Buscar el token en el navegador
        const token = localStorage.getItem("token");
    
        //  Si NO hay token → usuario no autenticado
        if( !token ) {
            // Redirigir al login
            router.push("/login");
        } else {
            setLoading(false);
        }
    },[]);// ← se ejecuta solo una vez

    return {loading};
}