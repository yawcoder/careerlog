"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/auth";
import Link from "next/link";
import { useForm } from "react-hook-form";

interface SignupFormInputs {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function SignUpPage() {

    const {register, handleSubmit, watch, formState: { errors }} = useForm<SignupFormInputs>();

    const onSubmit = (formData: SignupFormInputs) => {
        // console.log(formData)
        signUp(formData);
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
                        Sign Up
                    </Button>
                </form>

                <p className="mt-4 text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/" className="text-primary underline">
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    )
}
