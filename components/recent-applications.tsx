import { Clock, MapPin, Building } from "lucide-react";

interface RecentApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  appliedDate: string;
  status: string;
}

interface RecentApplicationsProps {
  applications: RecentApplication[];
}

export default function RecentApplications({ applications }: RecentApplicationsProps) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm w-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground">Recent Applications</h3>
      </div>
      
      <div className="space-y-4">
        {applications.length > 0 ? (
          applications.slice(0, 3).map((app) => (
            <div key={app.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-card-foreground mb-1">{app.role}</h4>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>{app.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{app.location}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}
                >
                  {app.status}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Applied on {formatDate(app.appliedDate)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No recent applications</p>
            <p className="text-sm text-muted-foreground/70">Start tracking your job applications</p>
          </div>
        )}
      </div>
    </div>
  );
}
