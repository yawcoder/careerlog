"use client"
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { useRouter } from "next/navigation";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Plus, Building, MapPin, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

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

export default function Applications() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const applicationsPerPage = 10;

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

    // Fetch applications when user is available
    useEffect(() => {
        if (!user) return;

        const applicationsRef = collection(db, 'users', user.uid, 'applications');
        const q = query(applicationsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const applicationsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    company: data.company ?? "",
                    role: data.role ?? "",
                    location: data.location ?? "",
                    status: data.status ?? "Applied",
                    appliedDate: typeof data.appliedDate === 'string' ? new Date(data.appliedDate) : new Date(),
                    notes: data.notes,
                    resumeUrl: data.resumeUrl,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                } as ApplicationData;
            });
            setApplications(applicationsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching applications:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Pagination logic
    const totalPages = Math.ceil(applications.length / applicationsPerPage);
    const startIndex = (currentPage - 1) * applicationsPerPage;
    const endIndex = startIndex + applicationsPerPage;
    const currentApplications = applications.slice(startIndex, endIndex);

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
            month: 'short', 
            day: 'numeric' 
        });
    };

    if (!user || loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">All Applications</h1>
                        <p className="text-muted-foreground mt-1">
                            {applications.length} {applications.length === 1 ? 'application' : 'applications'} total
                        </p>
                    </div>
                    <Link href="/new-application">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">New Application</span>
                            <span className="sm:hidden">New</span>
                        </Button>
                    </Link>
                </div>

                {/* Applications Grid */}
                {currentApplications.length > 0 ? (
                    <div className="space-y-4">
                        {currentApplications.map((app) => (
                            <Link key={app.id} href={`/applications/${app.id}`} className="block">
                                <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer mb-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 md:hidden ${getStatusColor(app.status)}`}
                                            >
                                                <Tag className="h-3 w-3 mr-1" />
                                                {app.status}
                                            </span>
                                            <h3 className="text-xl font-semibold text-card-foreground mb-2">
                                                {app.role}
                                            </h3>
                                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                                <div className="flex items-center space-x-1">
                                                    <Building className="h-4 w-4" />
                                                    <span>{app.company}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{app.location}</span>
                                                </div>
                                                <div className="hidden md:flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Applied {formatDate(app.appliedDate)}</span>
                                                </div>
                                            </div>
                                            {app.notes && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {app.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <span
                                                className={`hidden md:inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}
                                            >
                                                <Tag className="h-3 w-3 mr-1" />
                                                {app.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Building className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No applications yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Start tracking your job applications by adding your first one
                        </p>
                        <Link href="/new-application">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Application
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => setCurrentPage(page)}
                                            isActive={currentPage === page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                
                                <PaginationItem>
                                    <PaginationNext 
                                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </div>
    );
}