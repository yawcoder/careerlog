"use client"
import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { logIn } from "@/lib/auth";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebaseConfig";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "./ui/alert-dialog";

interface LoginFormInputs {
    email: string;
    password: string;
}

const errorMessages: Record<string, string> = {
    "invalid-credential": "Email or Password is invalid"
};

function getFriendlyErrorMessage(error: string) {
    const match = error.match(/\(auth\/([^)]+)\)/);
    if (match && match[1]) {
        return errorMessages[match[1]] || "An unexpected error occurred. Please try again.";
    }
    return error;
}

export default function Login() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [signUpError, setSignupError] = useState<string | null>(null)
    const [alertBox, setAlertBox] = useState(false);
    const { register, handleSubmit } = useForm<LoginFormInputs>();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace("/dashboard")
            }
        });
        return () => unsubscribe();
    }, [router]);


    const onSubmit = async (formData: LoginFormInputs) => {
        setLoading(true);
        const result = await logIn(formData);
        if (result && result.error) {
            setAlertBox(true);
            setSignupError(getFriendlyErrorMessage(result.error));
            setLoading(false)
        }
    }

    return (
        <div className="w-full md:w-1/2 max-w-md rounded-lg border px-6 py-8 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold">Log in to your account</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                        type="email"
                        placeholder="you@example.com"
                        required
                        {...register("email")}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••"
                        required
                        {...register("password")}
                    />
                </div>
                <Button
                    type="submit"
                    className="w-full rounded-md bg-primary px-4 py-2 hover:bg-primary/90 hover: cursor-pointer"
                >
                    {loading ? "Please Wait..." : "Log In"}
                </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary underline">
                    Sign up
                </Link>
            </p>
            <AlertDialog open={alertBox} onOpenChange={setAlertBox}>
                <AlertDialogContent>
                    <AlertDialogTitle>Message</AlertDialogTitle>
                    <AlertDialogDescription>
                        {signUpError}
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => {
                            setAlertBox(false);
                        }}>Done</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}