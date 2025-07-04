"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/app/firebaseConfig";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import TotalApplications from "@/components/total-applications";
import ApplicationsPerStatus from "@/components/applications-per-status";
import RecentApplications from "@/components/recent-applications";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [applications, setApplications] = useState<ApplicationData[]>([]);
    const [loading, setLoading] = useState(true);

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

    // Calculate dashboard metrics from real data
    const totalApplicationsCount = applications.length;

    const statusCounts = applications.reduce((acc, app) => {
        const statusMap = {
            'Applied': { color: 'blue' },
            'Interview': { color: 'yellow' },
            'Rejected': { color: 'red' },
            'Offered': { color: 'green' },
            'Withdrawn': { color: 'gray' }
        };

        const existingStatus = acc.find(item => item.status === app.status);
        if (existingStatus) {
            existingStatus.count += 1;
        } else {
            acc.push({
                status: app.status,
                count: 1,
                color: statusMap[app.status as keyof typeof statusMap]?.color || 'gray'
            });
        }
        return acc;
    }, [] as { status: string; count: number; color: string; }[]);

    // Get recent applications (first 3)
    const recentApplications = applications.slice(0, 3).map(app => ({
        id: app.id,
        company: app.company,
        role: app.role,
        location: app.location,
        appliedDate: app.appliedDate instanceof Date ? app.appliedDate.toISOString() : String(app.appliedDate),
        status: app.status
    }));

    if (!user || loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <Link href="/new-application">
                        <Button className="flex items-center gap-2 cursor-pointer">
                            <Plus className="h-4 w-4" />
                            New Application
                        </Button>
                    </Link>
                </div>

                {/* Top row with Total Applications and Applications per Status side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <TotalApplications totalCount={totalApplicationsCount} />
                    <ApplicationsPerStatus statusCounts={statusCounts} />
                </div>

                {/* Recent Applications full width below */}
                <RecentApplications applications={recentApplications} />
            </div>
        </div>
    );
}