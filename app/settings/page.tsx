import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "../firebaseConfig";

export default function Settings (){
    const router = useRouter();
    
         useEffect(() => {
                const unsubscribe = onAuthStateChanged(auth, (user) => {
                    if (!user) {
                        router.replace("/");
                    }
                });
                return () => unsubscribe();
            }, [router]);
    
    return (
        <div>Settings</div>
    )
}