"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import UptimeChart from "@/components/UptimeChart";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Server,
  TrendingUp,
  Users,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  serviceId: string;
  serviceName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Maintenance {
  id: string;
  title: string;
  description: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, incidentsRes, maintenanceRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/incidents'),
          fetch('/api/maintenance')
        ]);

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData);
        }

        if (incidentsRes.ok) {
          const incidentsData = await incidentsRes.json();
          setIncidents(incidentsData);
        }

        if (maintenanceRes.ok) {
          const maintenanceData = await maintenanceRes.json();
          setMaintenance(maintenanceData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats from real data
  const stats = {
    totalServices: services.length,
    operationalServices: services.filter(s => s.status === 'OPERATIONAL').length,
    activeIncidents: incidents.filter(i => ['INVESTIGATING', 'MONITORING', 'IDENTIFIED'].includes(i.status)).length,
    scheduledMaintenances: maintenance.filter(m => m.status === 'SCHEDULED').length,
    uptimePercentage: services.length > 0 
      ? Math.round((services.filter(s => s.status === 'OPERATIONAL').length / services.length) * 10000) / 100
      : 100,
    teamMembers: 5, // This would come from teams API if available
  };

  // Get recent incidents (last 5)
  const recentIncidents = incidents
    .filter(i => ['INVESTIGATING', 'MONITORING', 'IDENTIFIED'].includes(i.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Get service status counts
  const serviceStatusCounts = {
    operational: services.filter(s => s.status === 'OPERATIONAL').length,
    degraded: services.filter(s => s.status === 'DEGRADED').length,
    partial: services.filter(s => s.status === 'PARTIAL_OUTAGE').length,
    major: services.filter(s => s.status === 'MAJOR_OUTAGE').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Monitor your services and manage incidents from one place
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/dashboard/services/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </Link>
        <Link href="/dashboard/incidents/new">
          <Button variant="outline">
            <AlertCircle className="mr-2 h-4 w-4" />
            Report Incident
          </Button>
        </Link>
        <Link href="/dashboard/maintenance/new">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Schedule Maintenance
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.operationalServices} operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uptimePercentage}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active collaborators
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
          <CardDescription>
            Latest incidents affecting your services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentIncidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active incidents</p>
              <p className="text-sm">All systems are operational</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{incident.title}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{incident.serviceName || 'Unknown Service'}</span>
                      <span>•</span>
                      <span>
                        {new Date(incident.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        incident.severity === "HIGH"
                          ? "destructive"
                          : incident.severity === "MEDIUM"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {incident.severity.toLowerCase()}
                    </Badge>
                    <Badge variant="outline">
                      {incident.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>
            Current status of all monitored services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stats.operationalServices === stats.totalServices ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-medium">
                  {stats.operationalServices === stats.totalServices 
                    ? "All Systems Operational" 
                    : "Some Systems Affected"}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.operationalServices} of {stats.totalServices} services
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <span className="text-sm">Operational ({serviceStatusCounts.operational})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-600" />
                <span className="text-sm">Degraded ({serviceStatusCounts.degraded})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-600" />
                <span className="text-sm">Partial Outage ({serviceStatusCounts.partial})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600" />
                <span className="text-sm">Major Outage ({serviceStatusCounts.major})</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uptime Metrics */}
      <UptimeChart />
    </div>
  );
} 