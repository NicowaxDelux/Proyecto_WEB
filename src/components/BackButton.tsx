import {useRouter} from "next/router";

export default function BackButton() {


    const router = useRouter();

    return (

        <button
            onClick={ () => router.back()}
            className= "fixed bottom-4 left-4 bg-black text-white px-4 py-2 rounded-xl shadow-lg"
        >
            Volver
        </button>

    );
}