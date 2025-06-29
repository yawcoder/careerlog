"use client"
import Link from 'next/link';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/app/firebaseConfig';
import { User } from 'firebase/auth';

export default function Navbar() {
    const [userLoggedIn, setUserLoggedIn] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserLoggedIn(user)
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleSignOut = async () => {
        await signOut(auth);
        setUserLoggedIn(null)
        router.push("/")
    }


    return (
        <nav className="w-full border-b px-4 py-3 md:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold">
                    CareerLog
                </Link>

                {
                    userLoggedIn ?
                        <div>
                            <span className="mr-4">Welcome back, {userLoggedIn.displayName}</span>
                            <Button
                                onClick={handleSignOut}
                            >
                                Sign Out
                            </Button>
                        </div> :
                        <Link
                            href="/signup"
                            className=""
                        >
                            <Button>
                                Sign Up
                            </Button>
                        </Link>
                }
            </div>
        </nav>
    );
}
