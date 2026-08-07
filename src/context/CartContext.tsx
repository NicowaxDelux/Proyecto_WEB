import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react"

type CartItem ={
    id: number;
    quantity: number;

    product: {
        id: number;
        name: string;
        price: number;
        imageUrl?: string;
    }
};


type CartContextType = {

    isOpen: Boolean;
    cartItems: CartItem[];
    totalPrice: number;


    openCart: () => void;
    closeCart: () => void;
    refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType>(
    {} as CartContextType
);

export function CartProvider({

    children,
}:{
    children: ReactNode;
}) {

    //estado del carrito
    const [isOpen, setIsOpen] = useState(false);

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    
    const [totalPrice, setTotalPrice] = useState(0);
    
    //abrir carrito
    const openCart = () => setIsOpen(true);

    //cerrar carrito  
    const closeCart = () => setIsOpen(false);

    //refrescar carrito
    const refreshCart =async() =>{

        const token = localStorage.getItem("token");
        
        // Usuario no logueado
        if(!token) {
            setCartItems([]);
            setTotalPrice(0);
            return;
        } 
            
        const res = await fetch("api/cart",{
            headers: {
                Authorization: `Bearer ${token}`,
            }, 
        });

        const data = await res.json();
        
        // Si la API devolvió un error
        if(!Array.isArray(data)) {
            setCartItems([]);
            setTotalPrice(0);
            return;
        }

        setCartItems(data);

        //calcular precio total
        const totalPrice= data.reduce(
            (acc: any, item: any) => {
                return acc+ (item.product.price * item.quantity);
            },0
        );

        setTotalPrice(totalPrice);
    };

    //cargar carrito al iniciar la app
    useEffect(() => {
        refreshCart()

    },[]);


    return (
        <CartContext.Provider

            value={{
                isOpen,
                openCart,
                closeCart,
                cartItems,
                totalPrice,
                refreshCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);