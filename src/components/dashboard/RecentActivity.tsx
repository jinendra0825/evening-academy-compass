
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notifications } from "@/services/mockData";

export const RecentActivity = () => {
  // Sort notifications by date (newest first)
  const sortedActivities = [...notifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-4">
          {sortedActivities.map((activity) => (
            <li key={activity.id} className="flex items-start space-x-3">
              <div 
                className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'announcement' 
                    ? 'bg-blue-500' 
                    : activity.type === 'alert' 
                    ? 'bg-red-500' 
                    : 'bg-green-500'
                }`}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <span className="text-xs text-gray-500">{formatDate(activity.date)}</span>
                </div>
                <p className="text-xs text-gray-500">{activity.message}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
