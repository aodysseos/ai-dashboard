import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../dashboard/components/card'
import { Badge } from '../dashboard/components/badge'
import { DashboardLayout } from '../dashboard/layout'
import { useHealthCheck, useApiStatus } from '../common/hooks/useApi'

export default function Home() {
  const { data: healthData, isLoading: healthLoading, error: healthError } = useHealthCheck()
  const { isLoading: apiLoading, error: apiError } = useApiStatus()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,250.00</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                -20% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45,678</div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Growth Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.5%</div>
              <p className="text-xs text-muted-foreground">
                +4.5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Here's what's happening with your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">New</Badge>
                    <span>Dashboard initialized successfully</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Just now</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Info</Badge>
                    <span>TanStack libraries integrated</span>
                  </div>
                  <span className="text-sm text-muted-foreground">2 min ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">Info</Badge>
                    <span>shadcn/ui components ready</span>
                  </div>
                  <span className="text-sm text-muted-foreground">3 min ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sample Data Table</CardTitle>
              <CardDescription>
                Example using TanStack Table with sorting, filtering, and pagination.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>This table demonstrates:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Column sorting with visual indicators</li>
                  <li>Status badges with different variants</li>
                  <li>Currency formatting</li>
                  <li>Color-coded growth indicators</li>
                  <li>Pagination controls</li>
                </ul>
                <div className="mt-4 space-y-2">
                  <p><strong>API Status:</strong></p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge variant={healthError ? "destructive" : "default"}>
                        {healthLoading ? "Loading..." : healthError ? "Error" : "Healthy"}
                      </Badge>
                      <span>Health Check</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={apiError ? "destructive" : "default"}>
                        {apiLoading ? "Loading..." : apiError ? "Error" : "Connected"}
                      </Badge>
                      <span>API Connection</span>
                    </div>
                  </div>
                  {healthData && (
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export const Route = createFileRoute('/')({
  component: Home,
})

