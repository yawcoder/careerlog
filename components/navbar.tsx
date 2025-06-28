

import Link from 'next/link';
import { Button } from './ui/button';

export default function Navbar() {
    return (
        <nav className="w-full border-b px-4 py-3 md:px-8">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold">
                    CareerLog
                </Link>

                {/* Login Button */}
                <Link
                    href="/signup"
                    className=""
                >
                    <Button>
                        Sign Up
                    </Button>
                </Link>
            </div>
        </nav>
    );
}
