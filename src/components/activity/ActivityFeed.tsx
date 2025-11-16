import { Card, CardContent } from '@/components/ui/card';
import { Eye, Edit, MessageSquare, User, Clock } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  type: 'view' | 'edit' | 'comment' | 'created';
  user: string;
  timestamp: Date;
  details?: string;
  changes?: Array<{ field: string; oldValue: string; newValue: string }>;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>;
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <Card key={activity.id} className="bg-muted/30">
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {activity.type === 'view' && <Eye className="h-4 w-4 text-muted-foreground" />}
                {activity.type === 'edit' && <Edit className="h-4 w-4 text-primary" />}
                {activity.type === 'comment' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                {activity.type === 'created' && <Clock className="h-4 w-4 text-green-500" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{activity.user}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(activity.timestamp)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {activity.type === 'view' && 'viewed this object'}
                  {activity.type === 'created' && 'created this object'}
                  {activity.type === 'comment' && activity.details && (
                    <span>commented: "{activity.details}"</span>
                  )}
                  {activity.type === 'edit' && activity.changes && (
                    <div className="space-y-1 mt-1">
                      {activity.changes.map((change, i) => (
                        <div key={i} className="text-xs">
                          Updated <span className="font-medium">{change.field}</span>
                          {change.oldValue && (
                            <>
                              {' '}
                              from <span className="line-through">{change.oldValue}</span>
                            </>
                          )}{' '}
                          to <span className="font-medium">{change.newValue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
