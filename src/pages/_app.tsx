import "../styles/globals.css";
import type { AppProps } from "next/app";
import { CartProvider } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import { Toaster} from 'react-hot-toast';


export default function App({ 
  
  Component, 
  pageProps, 

}: AppProps) {

  return (
  
    <CartProvider>
      {/* TOASTER */}
      <Toaster 
        position= "top-right"
        toastOptions={{
          duration:2500,
          style: {
            background: "#111",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      />

      <CartDrawer />

      <Component {...pageProps} />

    </CartProvider>


  );
}