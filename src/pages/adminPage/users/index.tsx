import AdminLayout from '../../../components/Admin/AdminLayout';
import {useEffect, useState} from 'react';


export default function Users() {

    const [users, setUsers] = useState<any[]>([]);

    const loadUsers =async () => {

        const token = localStorage.getItem("token");

        const res = await fetch("/api/admin/users", {

            headers: {
                Autorization: `Bearer${token}`
            }
        });

        const data = await res.json();

        if (res.ok) {
            setUsers(data);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);


    return (

        <AdminLayout>

            <div>
                
                <h1 className="text-2xl font-semibold">
                    Usuarios
                </h1>

                <p className="text-gray-500 mt-2">
                    Usuarios registrados en la tienda
                </p>

            </div>

            <div className="bg-white border rounded-2xl overflow-hidden">

                <table className="w-full">

                    <thead  className="border-b">

                        <tr className="text-left">

                            <th className="p-5">
                                Usuario
                            </th>

                            <th className="p-5">
                                Email 
                            </th>

                            <th className="p-5">
                                Rol
                            </th>

                            <th className="p-5">
                                Registro
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {users.map((user) => (

                            <tr
                                key={user.id}
                                className="border-b hover:bg-gray-50"
                            >

                                <td className="p-5 font-medium">

                                    {user.name || "Sin nombre"}

                                </td>

                                <td className="p-5 text-gray-500">

                                    {user.email}

                                </td>

                                <td className="p-5">

                                    {user.role}

                                </td>

                                <td className="p-5 text-gray-500">

                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString()}

                                </td>

                            </tr>

                        ) )}

                    </tbody>

                </table>

            </div>

        </AdminLayout>
    );
}