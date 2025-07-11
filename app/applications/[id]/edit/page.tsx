"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Timestamp, doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useForm, Controller } from "react-hook-form";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/app/firebaseConfig";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Link from "next/link";

interface JobApplicationInputs {
    company: string;
    role: string;
    location: string;
    status?: 'Applied' | 'Interview' | 'Rejected' | 'Offered' | 'Withdrawn';
    appliedDate: Date;
    notes?: string;
    resumeUrl?: string;
}

export default function EditApplication() {
    const router = useRouter();
    const params = useParams();
    const applicationId = params.id as string;
    
    const [user, setUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [alertBox, setAlertBox] = useState(false);
    const [deleteConfirmBox, setDeleteConfirmBox] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const {register, handleSubmit, control, formState: { errors }, setValue} = useForm<JobApplicationInputs>({
        defaultValues: {
            company: "",
            role: "",
            location: "",
            status: undefined,
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

    // Fetch application data when user is available
    useEffect(() => {
        if (!user || !applicationId) return;

        const fetchApplication = async () => {
            try {
                const applicationDoc = doc(db, 'users', user.uid, 'applications', applicationId);
                const docSnapshot = await getDoc(applicationDoc);
                
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    
                    // Populate form with existing data
                    setValue("company", data.company || "");
                    setValue("role", data.role || "");
                    setValue("location", data.location || "");
                    setValue("status", data.status || undefined);
                    setValue("appliedDate", typeof data.appliedDate === 'string' ? new Date(data.appliedDate) : new Date());
                    setValue("notes", data.notes || "");
                    setValue("resumeUrl", data.resumeUrl || "");
                    
                    setLoading(false);
                } else {
                    setNotFound(true);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching application:", error);
                setNotFound(true);
                setLoading(false);
            }
        };

        fetchApplication();
    }, [user, applicationId, setValue]);

    const onSubmit = async (data: JobApplicationInputs) => {
        if (!user || !applicationId) {
            console.error("User not authenticated or application ID missing");
            return;
        }

        setIsSubmitting(true);

        try {
            const applicationData = {
                company: data.company,
                role: data.role,
                location: data.location,
                status: data.status,
                appliedDate: data.appliedDate ? data.appliedDate.toISOString().split('T')[0] : '',
                notes: data.notes || "",
                resumeUrl: data.resumeUrl || "",
                updatedAt: Timestamp.now()
            };

            // Update the application in Firestore
            const applicationDoc = doc(db, 'users', user.uid, 'applications', applicationId);
            await updateDoc(applicationDoc, applicationData);

            console.log("Application updated successfully");
            
            // Show success message
            setAlertMessage(`Application for ${data.company} updated successfully!`);
            setIsSuccess(true);
            setAlertBox(true);
            
        } catch (error) {
            console.error("Error updating application: ", error);
            
            // Show error message
            setAlertMessage("Error updating application. Please try again.");
            setIsSuccess(false);
            setAlertBox(true);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleDelete = async () => {
        if (!user || !applicationId) {
            console.error("User not authenticated or application ID missing");
            return;
        }

        setIsDeleting(true);

        try {
            // Delete the application from Firestore
            const applicationDoc = doc(db, 'users', user.uid, 'applications', applicationId);
            await deleteDoc(applicationDoc);

            console.log("Application deleted successfully");
            
            // Show success message
            setAlertMessage("Application deleted successfully!");
            setIsSuccess(true);
            setDeleteConfirmBox(false);
            setAlertBox(true);
            
        } catch (error) {
            console.error("Error deleting application: ", error);
            
            // Show error message
            setAlertMessage("Error deleting application. Please try again.");
            setIsSuccess(false);
            setDeleteConfirmBox(false);
            setAlertBox(true);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteAlertClose = () => {
        setAlertBox(false);
        if (isSuccess) {
            // Redirect to applications list on successful delete
            router.push('/applications');
        }
    };

    if (!user || loading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center py-12">Loading...</div>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Application not found</h3>
                        <p className="text-muted-foreground mb-6">
                            The application you are trying to edit does not exist or you don&apos;t have access to it.
                        </p>
                        <Link href="/applications">
                            <Button>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Applications
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <Link href={`/applications/${applicationId}`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 lg:mr-2" />
                            <span className="hidden lg:inline">Back to Application</span>
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">Edit Application</h1>
                </div>

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
                            {isSubmitting ? "Updating..." : "Update Application"}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => router.push(`/applications/${applicationId}`)}
                            variant="outline"
                            className="px-6 py-2 border border-border rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                        >
                            Cancel
                        </Button>
                    </div>
                    
                    {/* Delete Button */}
                    <div className="pt-6 border-t border-border">
                        <Button
                            type="button"
                            variant="destructive"
                            className="w-full bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                            onClick={() => setDeleteConfirmBox(true)}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete Application"}
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
                        <AlertDialogAction onClick={handleDeleteAlertClose}>
                            {isSuccess ? (alertMessage.includes("deleted") ? "Go to Applications" : "View Application") : "Try Again"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteConfirmBox} onOpenChange={setDeleteConfirmBox}>
                <AlertDialogContent>
                    <AlertDialogTitle>Delete Application</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete this application? This action cannot be undone.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
