import { TrendingUp } from "lucide-react";

interface StatusCount {
  status: string;
  count: number;
  color: string;
}

interface ApplicationsPerStatusProps {
  statusCounts: StatusCount[];
}

export default function ApplicationsPerStatus({ statusCounts }: ApplicationsPerStatusProps) {
  const getStatusColor = (color: string) => {
    const colorClasses = {
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      green: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      red: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      gray: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
    };
    return colorClasses[color as keyof typeof colorClasses] || colorClasses.gray;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-primary/10 p-3 rounded-full">
          <TrendingUp className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground">Applications by Status</h3>
      </div>
      
      <div className="space-y-3">
        {statusCounts.length > 0 ? (
          statusCounts.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.color)}`}
              >
                {item.status}
              </span>
              <span className="text-lg font-semibold text-card-foreground">{item.count}</span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No applications yet</p>
        )}
      </div>
    </div>
  );
}
