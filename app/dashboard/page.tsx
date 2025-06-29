"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebaseConfig";

export default function Dashboard() {
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
        <div>
            Dashboard
        </div>
    );
}