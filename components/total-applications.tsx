import { BriefcaseBusiness } from "lucide-react";

interface TotalApplicationsProps {
  totalCount: number;
}

export default function TotalApplications({ totalCount }: TotalApplicationsProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <BriefcaseBusiness className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Total Applications</h3>
          <p className="text-3xl font-bold text-primary">{totalCount}</p>
        </div>
      </div>
    </div>
  );
}
