import {ReactNode, useEffect, useState} from 'react';
import { useRouter } from 'next/router';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

// Definimos las propiedades que recibirá el Layout.
interface AdminLayoutProps {

    // "children" representa la página que se mostrará
    // dentro del panel.
    children: ReactNode;
}

export default function AdminLayout({

    children
}: AdminLayoutProps) {

    const router = useRouter();

    //mientras comprobamos el usuario
    //no mostramos el panel
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {

        const checkAdmin = async () => {
            
            //buscamos el token guardado al hacer login
            const token = localStorage.getItem("token");

            //si no hay token, se devuelve al login
            if (!token) {
                router.replace("/login");
                return;
            }

            try {
             
                //intentamos acceder a una API exclusiva para administradores
                const res = await fetch("/api/admin/dashboard", {

                    headers: {
                        Authorization: `Bearer ${token}`
                    }

                });

                // Token invalido o usuario no es ADMIN
                if (!res.ok) {

                    //token invalido o experidado
                    if (res.status === 401) {
                        localStorage.removeItem("token");
                        router.replace("/login");
                        return;
                    }

                    //Esta logueado pero no es admin
                    if (res.status === 403) {
                        router.replace("/");
                        return;
                    }

                    //tambien cualquier otro error tambien evita que mostremos el panel
                    router.replace("/");
                    return;
                }

                //si todo va bien, ya podemos mostrar el panel
                setCheckingAuth(false);

            } catch (error) {

                console.error("Error al verificar el token ADMIN:", error);

                router.replace("/");

            }

        };

        checkAdmin();

    }, [router]);


    //mientras verificamos el acceso,
    //no mostramos el contenido del administrador
    if (checkingAuth) {
        return (
            <div className = "min-h-srcreen flex items-center justify-center bg-gray-50">

                <p className = "text-gray-500">
                    Verificando acceso al panel de administración...
                </p>

            </div>
        );
    }




    return (

        <div className= "flex min-h-screen bg" >

            {/* ===============================
                Sidebar izquierdo
            =============================== */}

            <AdminSidebar/>

            {/* ===============================
                Contenido principal
            =============================== */}

            <div className= "flex-1 flex flex-col">

                 {/* Barra superior */}
                <AdminNavbar/>

                {/* Aquí aparecerá cada página */}
                <main className= "p-8">
                    {children}
                </main>

            </div>

        </div>
    );
}