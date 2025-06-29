"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { auth } from "../firebaseConfig";

interface PasswordResetEmailInput {
    email: string
}

export default function ResetPassword() {
    const {register, handleSubmit} = useForm<PasswordResetEmailInput>();
    const [loading, setLoading] = useState(false)

    const onSubmit = async (formData: PasswordResetEmailInput) => {
        setLoading(true);
        try{
            await sendPasswordResetEmail(auth, formData.email)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            return { error: message }
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
                <h1 className="mb-4 text-2xl font-semibold text-foreground">Reset Your Password</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Email Address</label>
                        <Input
                            type="email"
                            required
                            className="w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                            placeholder="you@example.com"
                            {...register("email")}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full rounded-md bg-primary px-4 py-2 hover:bg-primary/90 cursor-pointer"
                    >
                        {loading ? "Sending..." : "Send Reset Email"}
                    </Button>
                </form>
            </div>
        </main>
    )
}