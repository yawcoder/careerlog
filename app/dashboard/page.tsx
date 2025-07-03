"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/app/firebaseConfig";
import TotalApplications from "@/components/total-applications";
import ApplicationsPerStatus from "@/components/applications-per-status";
import RecentApplications from "@/components/recent-applications";

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

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

    // Mock data - replace with actual data from your backend/database
    const totalApplicationsCount = 12;
    
    const statusCounts = [
        { status: "Applied", count: 5, color: "blue" },
        { status: "Interview", count: 3, color: "yellow" },
        { status: "Rejected", count: 2, color: "red" },
        { status: "Offered", count: 1, color: "green" },
        { status: "Withdrawn", count: 1, color: "gray" }
    ];

    const recentApplications = [
        {
            id: "1",
            company: "Tech Corp",
            position: "Frontend Developer",
            location: "San Francisco, CA",
            appliedDate: "2025-07-01",
            status: "Applied"
        },
        {
            id: "2",
            company: "StartupXYZ",
            position: "Full Stack Engineer",
            location: "Remote",
            appliedDate: "2025-06-28",
            status: "Interview"
        },
        {
            id: "3",
            company: "Big Company",
            position: "Software Engineer",
            location: "New York, NY",
            appliedDate: "2025-06-25",
            status: "Rejected"
        }
    ];

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>
                
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