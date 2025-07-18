"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Info,
  XCircle,
  Zap,
  Calendar,
  TrendingUp,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { useSocket } from "@/hooks/use-socket";

interface Service {
  id: string;
  name: string;
  description: string | null;
  status: string;
  incidents: {
    id: string;
    title: string;
    status: string;
    severity: string;
    created_at: string;
  }[];
  maintenance?: {
    id: string;
    title: string;
    status: string;
    scheduled_start: string;
    scheduled_end: string;
  } | null;
}

interface Incident {
  id: string;
  title: string;
  status: string;
  severity: string;
  created_at: string;
  affected_services: {
    id: string;
    name: string;
  }[];
}

interface Maintenance {
  id: string;
  title: string;
  status: string;
  scheduled_start: string;
  scheduled_end: string;
  affected_services: {
    id: string;
    name: string;
  }[];
}

interface StatusData {
  organization: {
    name: string;
    slug: string;
    description: string | null;
  };
  status: {
    overall: string;
    uptime: number;
    services: {
      total: number;
      operational: number;
      degraded: number;
      partial_outage: number;
      major_outage: number;
      maintenance: number;
    };
  };
  services: Service[];
  incidents: Incident[];
  maintenance: Maintenance[];
  timestamp: string;
}

const statusConfig = {
  operational: {
    label: "Operational",
    color: "bg-green-500",
    icon: CheckCircle2,
    className: "text-green-600",
  },
  "degraded performance": {
    label: "Degraded Performance",
    color: "bg-yellow-500",
    icon: Zap,
    className: "text-yellow-600",
  },
  "partial outage": {
    label: "Partial Outage",
    color: "bg-orange-500",
    icon: AlertCircle,
    className: "text-orange-600",
  },
  "major outage": {
    label: "Major Outage",
    color: "bg-red-500",
    icon: XCircle,
    className: "text-red-600",
  },
  "under maintenance": {
    label: "Under Maintenance",
    color: "bg-blue-500",
    icon: Clock,
    className: "text-blue-600",
  },
};

export default function PublicStatusPage({ params }: { params: { slug: string } }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatusData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/status?org=${params.slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch status data');
      }
      const data = await response.json();
      setStatusData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status data');
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection for real-time updates
  const { isConnected } = useSocket({
    organizationSlug: params.slug,
    onServiceStatusChange: (data) => {
      console.log('Service status changed:', data);
      // Refresh data when service status changes
      fetchStatusData();
    },
    onIncidentUpdate: (data) => {
      console.log('Incident updated:', data);
      // Refresh data when incident updates
      fetchStatusData();
    },
    onMaintenanceUpdate: (data) => {
      console.log('Maintenance updated:', data);
      // Refresh data when maintenance updates
      fetchStatusData();
    },
  });

  useEffect(() => {
    fetchStatusData();
    
    // Refresh data every 30 seconds (fallback)
    const interval = setInterval(fetchStatusData, 30000);
    
    return () => clearInterval(interval);
  }, [params.slug]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading status page...</p>
        </div>
      </div>
    );
  }

  if (error || !statusData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">Failed to load status page</p>
          <p className="text-muted-foreground text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  // Calculate overall status
  const hasOutage = statusData.services.some(s => 
    s.status === "major outage" || s.status === "partial outage"
  );
  const hasDegraded = statusData.services.some(s => 
    s.status === "degraded performance"
  );
  const overallStatus = hasOutage ? "experiencing issues" : hasDegraded ? "degraded performance" : "operational";



  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="h-6 w-6 text-blue-600" />
                {statusData.organization.name} Status
              </h1>
              <p className="text-muted-foreground mt-1">
                {statusData.organization.description || "Service status and incident updates"}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? 'Live updates' : 'Offline'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Last updated
              </p>
              <p className="text-sm font-medium">
                {format(currentTime, "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Overall Status Banner */}
      <div className={`py-8 ${
        hasOutage ? "bg-red-50 dark:bg-red-950/20" : 
        hasDegraded ? "bg-yellow-50 dark:bg-yellow-950/20" : 
        "bg-green-50 dark:bg-green-950/20"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-3">
            {hasOutage ? (
              <XCircle className="h-8 w-8 text-red-600" />
            ) : hasDegraded ? (
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            ) : (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            )}
            <h2 className="text-2xl font-semibold">
              {hasOutage ? "Some systems are experiencing issues" :
               hasDegraded ? "Some systems have degraded performance" :
               "All systems operational"}
            </h2>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Active Incidents Alert */}
        {statusData.incidents.length > 0 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle>Active Incidents</AlertTitle>
            <AlertDescription>
              We are currently experiencing {statusData.incidents.length} active incident{statusData.incidents.length > 1 ? 's' : ''}.
            </AlertDescription>
          </Alert>
        )}

        {/* Scheduled Maintenance Alert */}
        {statusData.maintenance.length > 0 && (
          <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle>Scheduled Maintenance</AlertTitle>
            <AlertDescription>
              {statusData.maintenance.length} maintenance window{statusData.maintenance.length > 1 ? 's' : ''} scheduled.
            </AlertDescription>
          </Alert>
        )}

        {/* Services Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {statusData.services.map((service) => {
            const config = statusConfig[service.status as keyof typeof statusConfig] || statusConfig.operational;
            const Icon = config.icon;
            
            return (
              <Card key={service.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${config.color}`} />
                      <Badge variant="secondary" className={config.className}>
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  {service.description && (
                    <CardDescription>{service.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Last Incident */}
                    {service.incidents.length > 0 && (
                      <div className="text-sm">
                        <p className="font-medium text-orange-600">Last Incident</p>
                        <p className="text-muted-foreground">{service.incidents[0].title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(service.incidents[0].created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    )}
                    
                    {/* Scheduled Maintenance */}
                    {service.maintenance && (
                      <div className="text-sm">
                        <p className="font-medium text-blue-600">Scheduled Maintenance</p>
                        <p className="text-muted-foreground">{service.maintenance.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(service.maintenance.scheduled_start), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Active Incidents Section */}
        {statusData.incidents.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Active Incidents
              </CardTitle>
              <CardDescription>
                Current issues affecting our services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusData.incidents.map((incident) => (
                  <div key={incident.id} className="border-l-4 border-orange-500 pl-4 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-600">{incident.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Affecting: {incident.affected_services.map(service => service.name).join(', ')}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            {incident.status}
                          </Badge>
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            {incident.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Started {format(new Date(incident.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

                {/* Scheduled Maintenance Section */}
        {statusData.maintenance.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Scheduled Maintenance
              </CardTitle>
              <CardDescription>
                Upcoming maintenance windows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusData.maintenance.map((maintenance) => {
                  const startDate = new Date(maintenance.scheduled_start);
                  const endDate = new Date(maintenance.scheduled_end);
                  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));
                  
                  return (
                    <div key={maintenance.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-600">{maintenance.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {maintenance.affected_services && maintenance.affected_services.length > 0 
                              ? `Affecting: ${maintenance.affected_services.map(service => service.name).join(', ')}`
                              : 'Organization-wide maintenance'
                            }
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-600">
                              {maintenance.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(startDate, "MMM d, yyyy 'at' h:mm a")} - {format(endDate, "h:mm a")} ({duration} hours)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              System Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{statusData.status.services.operational}</p>
                <p className="text-sm text-muted-foreground">Operational</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{statusData.status.services.degraded}</p>
                <p className="text-sm text-muted-foreground">Degraded</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{statusData.status.services.partial_outage}</p>
                <p className="text-sm text-muted-foreground">Partial Outage</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{statusData.status.services.major_outage}</p>
                <p className="text-sm text-muted-foreground">Major Outage</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{statusData.status.services.maintenance}</p>
                <p className="text-sm text-muted-foreground">Maintenance</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{statusData.status.uptime}%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 