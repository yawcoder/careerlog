"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Timestamp, collection, addDoc } from "firebase/firestore";
import { useForm, Controller } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/app/firebaseConfig";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface JobApplicationInputs {
    company: string;
    role: string;
    location: string;
    status?: 'Applied' | 'Interview' | 'Rejected' | 'Offered' | 'Withdrawn';
    appliedDate: Date;
    notes?: string;
    resumeUrl?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export default function NewApplication() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertBox, setAlertBox] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const {register, handleSubmit, control, formState: { errors }, reset} = useForm<JobApplicationInputs>({
        defaultValues: {
            company: "",
            role: "",
            location: "",
            status: undefined, // This ensures the Select starts with undefined instead of a string
            appliedDate: undefined,
            notes: "",
            resumeUrl: ""
        }
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.replace("/");
            } else {
                setUser(user);
            }
        });
        return () => unsubscribe();
    }, [router]);

    const onSubmit = async (data: JobApplicationInputs) => {
        if (!user) {
            console.error("User not authenticated");
            return;
        }

        setIsSubmitting(true);

        try {
            const applicationData = {
                company: data.company,
                role: data.role,
                location: data.location,
                status: data.status,
                appliedDate: data.appliedDate ? data.appliedDate.toISOString().split('T')[0] : '', // Convert Date to string (YYYY-MM-DD)
                notes: data.notes || "",
                resumeUrl: data.resumeUrl || "",
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            // Save to Firestore: users/{userId}/applications/{applicationId}
            const applicationsRef = collection(db, 'users', user.uid, 'applications');
            const docRef = await addDoc(applicationsRef, applicationData);

            console.log("Application saved with ID: ", docRef.id);
            
            // Show success message
            setAlertMessage(`Application for ${data.company} saved successfully!`);
            setIsSuccess(true);
            setAlertBox(true);
            
            // Reset form
            reset();
            
        } catch (error) {
            console.error("Error adding application: ", error);
            
            // Show error message
            setAlertMessage("Error saving application. Please try again.");
            setIsSuccess(false);
            setAlertBox(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAlertClose = () => {
        setAlertBox(false);
        if (isSuccess) {
            // Only redirect to dashboard on success
            router.push('/dashboard');
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-8">Add New Application</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border rounded-lg p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="company" className="text-sm font-medium text-foreground">
                                Company *
                            </label>
                            <Input
                                type="text"
                                id="company"
                                {...register("company", { required: "Company name is required" })}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g. Google"
                            />
                            {errors.company && (
                                <p className="text-sm text-red-500">{errors.company.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="role" className="text-sm font-medium text-foreground">
                                Role *
                            </label>
                            <Input
                                type="text"
                                id="role"
                                {...register("role", { required: "Role is required" })}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g. Frontend Developer"
                            />
                            {errors.role && (
                                <p className="text-sm text-red-500">{errors.role.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="location" className="text-sm font-medium text-foreground">
                                Location *
                            </label>
                            <Input
                                type="text"
                                id="location"
                                {...register("location", { required: "Location is required" })}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="e.g. San Francisco, CA or Remote"
                            />
                            {errors.location && (
                                <p className="text-sm text-red-500">{errors.location.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="appliedDate" className="text-sm font-medium text-foreground">
                                Applied Date *
                            </label>
                            <Controller
                                name="appliedDate"
                                control={control}
                                rules={{ required: "Applied date is required" }}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? format(field.value, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.appliedDate && (
                                <p className="text-sm text-red-500">{errors.appliedDate.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium text-foreground">
                            Status *
                        </label>
                        <Controller
                            name="status"
                            control={control}
                            rules={{ required: "Status is required" }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Application Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Applied">Applied</SelectItem>
                                        <SelectItem value="Interview">Interview</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                        <SelectItem value="Offered">Offered</SelectItem>
                                        <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.status && (
                            <p className="text-sm text-red-500">{errors.status.message}</p>
                        )}
                    </div>


                    <div className="space-y-2">
                        <label htmlFor="resumeUrl" className="text-sm font-medium text-foreground">
                            Resume URL
                        </label>
                        <Input
                            type="url"
                            id="resumeUrl"
                            {...register("resumeUrl")}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="notes" className="text-sm font-medium text-foreground">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            {...register("notes")}
                            rows={4}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                            placeholder="Additional notes about this application..."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Application"}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => router.push('/dashboard')}
                            className="px-6 py-2 border border-border rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
            <AlertDialog open={alertBox} onOpenChange={setAlertBox}>
                <AlertDialogContent>
                    <AlertDialogTitle>
                        {isSuccess ? "Success!" : "Error"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {alertMessage}
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleAlertClose}>
                            {isSuccess ? "Go to Dashboard" : "Try Again"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}