"use client"
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, MapPin, Calendar, Tag, FileText, ExternalLink, Edit } from "lucide-react";
import Link from "next/link";

interface ApplicationData {
    id: string;
    company: string;
    role: string;
    location: string;
    status: 'Applied' | 'Interview' | 'Rejected' | 'Offered' | 'Withdrawn';
    appliedDate: Date;
    notes?: string;
    resumeUrl?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export default function ApplicationDetail() {
    const router = useRouter();
    const params = useParams();
    const applicationId = params.id as string;
    
    const [user, setUser] = useState<User | null>(null);
    const [application, setApplication] = useState<ApplicationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

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

    // Fetch application details when user is available
    useEffect(() => {
        if (!user || !applicationId) return;

        const fetchApplication = async () => {
            try {
                const applicationDoc = doc(db, 'users', user.uid, 'applications', applicationId);
                const docSnapshot = await getDoc(applicationDoc);
                
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    const applicationData: ApplicationData = {
                        id: docSnapshot.id,
                        company: data.company ?? "",
                        role: data.role ?? "",
                        location: data.location ?? "",
                        status: data.status ?? "Applied",
                        appliedDate: typeof data.appliedDate === 'string' ? new Date(data.appliedDate) : new Date(),
                        notes: data.notes,
                        resumeUrl: data.resumeUrl,
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt,
                    };
                    setApplication(applicationData);
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error("Error fetching application:", error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
    }, [user, applicationId]);

    const getStatusColor = (status: string) => {
        const statusColors = {
            "applied": "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
            "interview": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
            "rejected": "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
            "offered": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
            "withdrawn": "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
        };
        return statusColors[status.toLowerCase() as keyof typeof statusColors] || statusColors["applied"];
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const formatDateTime = (timestamp: Timestamp) => {
        return timestamp.toDate().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!user || loading) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">Loading...</div>
                </div>
            </div>
        );
    }

    if (notFound || !application) {
        return (
            <div className="min-h-screen bg-background p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <Building className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Application not found</h3>
                        <p className="text-muted-foreground mb-6">
                            The application you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
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
            <div className="max-w-4xl mx-auto">
                {/* Header with back button */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link href="/applications">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Applications
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{application.role}</h1>
                            <p className="text-muted-foreground mt-1">at {application.company}</p>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic info card */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-card-foreground mb-4">Application Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Building className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Company</p>
                                        <p className="font-medium">{application.company}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="font-medium">{application.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Applied Date</p>
                                        <p className="font-medium">{formatDate(application.appliedDate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Tag className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}
                                        >
                                            {application.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes card */}
                        {application.notes && (
                            <div className="bg-card border border-border rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-card-foreground mb-4 flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Notes
                                </h2>
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                    <p className="text-muted-foreground whitespace-pre-wrap">{application.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions card */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-card-foreground mb-4">Actions</h3>
                            <div className="space-y-3">
                                {application.resumeUrl && (
                                    <Button variant="outline" className="w-full justify-start" asChild>
                                        <a
                                            href={application.resumeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View Resume
                                        </a>
                                    </Button>
                                )}
                                <Button variant="outline" className="w-full justify-start">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Application
                                </Button>
                            </div>
                        </div>

                        {/* Metadata card */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-card-foreground mb-4">Metadata</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Created</p>
                                    <p className="font-medium">{formatDateTime(application.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Last Updated</p>
                                    <p className="font-medium">{formatDateTime(application.updatedAt)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Application ID</p>
                                    <p className="font-mono text-xs bg-muted px-2 py-1 rounded">{application.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
