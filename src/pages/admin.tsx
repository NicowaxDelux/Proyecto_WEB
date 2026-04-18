export default function Admin(){

    const createProduct  = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch("api/products/create", {
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: "Nueva camisa",
                    price: 50000,
                    stock: 10,
                }),
            });

            if(!res.ok) {
                throw new Error ("Error al crear prodcuto");
            }

            alert("Prodcuto creado correctamente");
        }catch (error) {
            alert("Hubo un error");
            console.error(error);
        }
    };

    return (
        <div className="p-10">

                <h1 className="text-3x1 font-bold mb-6">
                    Panel Admin ⚙️
                </h1>

                <button 
                    onClick={createProduct}
                    className="bg-black text-white px-6 py-3 rounded-x1"
                >
                    Crear producto
                </button>
        </div>
    );
}