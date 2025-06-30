"use client"
import Link from 'next/link';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/app/firebaseConfig';
import { User } from 'firebase/auth';
import { Menu } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function Navbar() {
    const [userLoggedIn, setUserLoggedIn] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserLoggedIn(user)
            } else {
                setUserLoggedIn(null)
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

                {userLoggedIn ? (
                    <div className="flex items-center gap-2 md:gap-40">
                        {/* Desktop Menu */}
                        <div className="hidden lg:flex gap-4">
                            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                            <Link href="/applications" className="hover:underline">Applications</Link>
                            <Link href="/analytics" className="hover:underline">Analytics</Link>
                            <Link href="/settings" className="hover:underline">Settings</Link>
                        </div>
                        {/* Mobile Hamburger Menu */}
                        <div className="lg:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Menu className="h-6 w-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-56 p-0">
                                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                    <nav className="flex flex-col gap-2 p-4">
                                        <Link href="/dashboard" className="py-2 px-3 rounded hover:bg-gray-100 transition font-medium">Dashboard</Link>
                                        <Link href="/applications" className="py-2 px-3 rounded hover:bg-gray-100 transition font-medium">My Applications</Link>
                                        <Link href="/analytics" className="py-2 px-3 rounded hover:bg-gray-100 transition font-medium">Analytics</Link>
                                        <Link href="/settings" className="py-2 px-3 rounded hover:bg-gray-100 transition font-medium">Settings</Link>
                                        <div className="border-t my-2" />
                                        <span className="block px-3 py-2 text-sm text-gray-500">Welcome back, {userLoggedIn.displayName}</span>
                                        <Button onClick={handleSignOut} className="mt-2 w-full">
                                            Sign Out
                                        </Button>
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                        {/* User Info and Sign Out (desktop) */}
                        <div className="hidden lg:inline">
                            <span className="ml-6 mr-4">Welcome back, {userLoggedIn.displayName}</span>
                            <Button onClick={handleSignOut} className="">
                                Sign Out
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Link href="/signup" className="">
                        <Button>
                            Sign Up
                        </Button>
                    </Link>
                )}
            </div>
        </nav>
    );
}
