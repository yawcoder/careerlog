"use client"
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../firebaseConfig";
import { useRouter } from "next/navigation";

export default function Analytics (){
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
        <div>Analytics: Coming Soon</div>
    )
}