"use client"
import Link from "next/link";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";

interface LoginFormInputs {
    email: string;
    password: string;
}

export default function Login() {

    const {register, handleSubmit} = useForm<LoginFormInputs>();

    const onSubmit = (formData: LoginFormInputs) => {
        // console.log(formData);
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
                    Log In
                </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary underline">
                    Sign up
                </Link>
            </p>
        </div>
    )
}