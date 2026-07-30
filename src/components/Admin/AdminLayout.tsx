import {ReactNode} from 'react';
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