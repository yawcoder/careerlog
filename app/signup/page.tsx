"use client"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface SignupFormInputs {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const errorMessages: Record<string, string> = {
    "email-already-in-use": "This email is already registered.",
    "invalid-email": "Please enter a valid email address.",
    "weak-password": "Password should be at least 6 characters.",
    "missing-password": "Please enter a password.",
};

function getFriendlyErrorMessage(error: string) {
    const match = error.match(/\(auth\/([^)]+)\)/);
    if (match && match[1]) {
        return errorMessages[match[1]] || "An unexpected error occurred. Please try again.";
    }
    return error;
}

export default function SignUpPage() {
    const router = useRouter();
    const [signUpError, setSignupError] = useState<String | null>(null)
    const [alertBox, setAlertBox] = useState(false);
    const [loading, setLoading] = useState(false)

    const {register, handleSubmit, watch, formState: { errors }} = useForm<SignupFormInputs>();

    const onSubmit = async (formData: SignupFormInputs) => {
        setLoading(true)
        setSignupError(null)
        const result = await signUp(formData)
        if (result && result.error) {
            setSignupError(getFriendlyErrorMessage(result.error))
            setAlertBox(true)
            setLoading(false)
        } else {
            setSignupError("Please check your inbox for comfirmation")
            setAlertBox(true);
            setLoading(false)
        }
        // Optionally handle success (e.g., redirect or show success message)
    }

    const password = watch("password");

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
                <h1 className="mb-4 text-2xl font-semibold text-foreground">Create an Account</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">First Name</label>
                        <Input
                            type="text"
                            required
                            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                            placeholder="John"
                            {...register("firstName")}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Last Name</label>
                        <Input
                            type="text"
                            required
                            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                            placeholder="Doe"
                            {...register("lastName")}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            required
                            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                            placeholder="you@example.com"
                            {...register("email")}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Password</label>
                        <Input
                            type="password"
                            required
                            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                            placeholder="••••••••"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters"
                                }
                            })}
                        />
                        {errors.password && (
                            <span className="text-xs text-red-500">{errors.password.message}</span>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Confirm Password</label>
                        <Input
                            type="password"
                            required
                            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                            placeholder="••••••••"
                            {...register("confirmPassword", {
                                required: "Please confirm your password",
                                validate: value =>
                                    value === password || "Passwords do not match"
                            })}
                        />
                        {errors.confirmPassword && (
                            <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full rounded-md bg-primary px-4 py-2 hover:bg-primary/90 cursor-pointer"
                    >
                        {loading ? "Please Wait..." : "Submit"}
                    </Button>
                </form>

                <p className="mt-4 text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/" className="text-primary underline">
                        Log in
                    </Link>
                </p>
            </div>
            <AlertDialog open={alertBox} onOpenChange={setAlertBox}>
                <AlertDialogContent>
                    <AlertDialogTitle>Message</AlertDialogTitle>
                    <AlertDialogDescription>
                        {signUpError}
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => {
                            setAlertBox(false);
                            if(signUpError === "Please check your inbox for comfirmation"){
                                router.push("/")
                            }
                        }}>Done</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </main>
    )
}