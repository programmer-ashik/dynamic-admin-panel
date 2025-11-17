import { Clock, Star, CheckSquare, Mail, BookMarked, TrendingUp, Eye, Filter } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { formatRelativeDate } from '../lib/utils';
import {
  STATIC_COLLECTIONS,
  STATIC_OBJECTS,
  STATIC_SAVED_VIEWS,
  STATIC_WIKI,
} from '../shared/mockData/mockData';

export default function DashboardPage() {
  const allObjects = STATIC_OBJECTS;
  const collections = STATIC_COLLECTIONS;
  const savedViews = STATIC_SAVED_VIEWS;
  const wikiPages = STATIC_WIKI;
  // Recent
  const recentObjects = [...allObjects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const myTasks = allObjects.filter((o) => o.type === 'task' && o.properties?.Status !== 'Done');

  // Follow-up Emails
  const followUpEmails = allObjects.filter(
    (o) =>
      o.type === 'email' &&
      Array.isArray(o.properties?.Labels) &&
      o.properties?.Labels.includes('Follow Up'),
  );
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Static Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{allObjects.length}</div>
                <div className="text-xs text-muted-foreground">Total Objects</div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{collections.length}</div>
                <div className="text-xs text-muted-foreground">Collections</div>
              </div>
              <Star className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{myTasks.length}</div>
                <div className="text-xs text-muted-foreground">Active Tasks</div>
              </div>
              <CheckSquare className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{wikiPages.length}</div>
                <div className="text-xs text-muted-foreground">Wiki Pages</div>
              </div>
              <BookMarked className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Views */}
      {savedViews.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Saved Views
            <Badge variant="secondary">{savedViews.length}</Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedViews.map((view) => {
              const viewCollection = collections.find((c) => c.id === view.collectionId);

              return (
                <Card key={view.id} className="cursor-pointer p-3">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      {view.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-muted-foreground">{view.description}</p>

                    <div className="flex items-center justify-between text-xs mt-3">
                      {viewCollection ? (
                        <div className="flex items-center gap-1">
                          <span>{viewCollection.icon}</span>
                          <span className="text-muted-foreground">{viewCollection.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">All</span>
                      )}

                      <Badge variant={view.isPrivate ? 'outline' : 'secondary'} className="text-xs">
                        {view.isPrivate ? 'Private' : 'Team'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {recentObjects.map((obj) => (
            <div
              key={obj.id}
              className="w-full p-3 border rounded-md text-left flex items-center gap-3"
            >
              <span className="text-xl">{obj.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{obj.title}</div>
                <div className="text-xs text-muted-foreground">
                  {formatRelativeDate(obj.updatedAt)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            My Tasks
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          {myTasks.map((task) => (
            <div key={task.id} className="p-3 border rounded-md">
              <div className="font-medium">{task.title}</div>
              <div className="text-xs text-muted-foreground">
                {task.properties.Status} • {task.properties.Priority}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Follow up Emails */}
      {followUpEmails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Follow Up Emails
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {followUpEmails.map((email) => (
              <div key={email.id} className="p-3 border rounded-md">
                <div className="font-medium">{email.title}</div>
                <div className="text-xs text-muted-foreground">
                  {formatRelativeDate(email.updatedAt)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
