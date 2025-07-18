"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Plus, 
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  TrendingUp,
  Loader2,
  Eye,
  MessageSquarePlus,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/hooks/use-socket";

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  incident_services: {
    services: {
      id: string;
      name: string;
    };
  }[];
  incident_updates: {
    id: string;
    message: string;
    status: string;
    createdAt: string;
  }[];
}

const statusConfig = {
  INVESTIGATING: {
    label: "Investigating",
    icon: Search,
    color: "text-yellow-600",
    badgeVariant: "secondary" as const,
  },
  IDENTIFIED: {
    label: "Identified",
    icon: AlertCircle,
    color: "text-orange-600",
    badgeVariant: "secondary" as const,
  },
  MONITORING: {
    label: "Monitoring",
    icon: Clock,
    color: "text-blue-600",
    badgeVariant: "default" as const,
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "text-green-600",
    badgeVariant: "secondary" as const,
  },
};

const severityConfig = {
  MINOR: {
    label: "Minor",
    badgeVariant: "secondary" as const,
  },
  MAJOR: {
    label: "Major",
    badgeVariant: "default" as const,
  },
  CRITICAL: {
    label: "Critical",
    badgeVariant: "destructive" as const,
  },
};

export default function IncidentsPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const { toast } = useToast();

  // WebSocket connection for real-time updates
  const { isConnected } = useSocket({
    onIncidentUpdate: (data) => {
      console.log('Incident updated:', data);
      // Refresh incidents when updates occur
      fetchIncidents();
    },
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/incidents');
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast({
        title: "Error",
        description: "Failed to load incidents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUpdate = async (incidentId: string) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: updateMessage,
          status: updateStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add update');
      }

      toast({
        title: "Success",
        description: "Update added successfully",
      });

      fetchIncidents();
      setUpdateDialog(false);
      setUpdateMessage("");
      setUpdateStatus("");
      setSelectedIncident(null);
    } catch (error) {
      console.error('Error adding update:', error);
      toast({
        title: "Error",
        description: "Failed to add update",
        variant: "destructive",
      });
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'RESOLVED',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resolve incident');
      }

      toast({
        title: "Success",
        description: "Incident resolved successfully",
      });

      fetchIncidents();
    } catch (error) {
      console.error('Error resolving incident:', error);
      toast({
        title: "Error",
        description: "Failed to resolve incident",
        variant: "destructive",
      });
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== "RESOLVED");
  const resolvedIncidents = incidents.filter(i => i.status === "RESOLVED");

  const filteredIncidents = (activeTab === "active" ? activeIncidents : resolvedIncidents)
    .filter(incident =>
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.incident_services.some(service => 
        service.services.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
          <p className="text-muted-foreground">
            Manage and track service incidents
          </p>
        </div>
        <Link href="/dashboard/incidents/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Report Incident
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIncidents.length}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resolvedIncidents.filter(i => {
                const resolvedDate = new Date(i.resolvedAt || i.updatedAt);
                const today = new Date();
                return resolvedDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resolvedIncidents.length > 0 ? "2.5h" : "0h"}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Incidents</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeIncidents.filter(i => i.severity === "CRITICAL").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Tabs */}
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeIncidents.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({resolvedIncidents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredIncidents.map((incident) => {
              const statusInfo = statusConfig[incident.status as keyof typeof statusConfig];
              const StatusIcon = statusInfo.icon;
              const severityInfo = severityConfig[incident.severity as keyof typeof severityConfig];
              
              return (
                <Card key={incident.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                          {incident.title}
                        </CardTitle>
                        <CardDescription>
                          {incident.description}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={severityInfo.badgeVariant}>
                          {severityInfo.label}
                        </Badge>
                        <Badge variant={statusInfo.badgeVariant}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Affected Services</p>
                        <div className="flex flex-wrap gap-2">
                          {incident.incident_services.map((service) => (
                            <Badge key={service.services.id} variant="outline">
                              {service.services.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Timeline</p>
                        <p className="text-sm text-muted-foreground">
                          Started {format(new Date(incident.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {incident.incident_updates.length} update{incident.incident_updates.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedIncident(incident);
                          setUpdateStatus(incident.status);
                          setUpdateDialog(true);
                        }}
                      >
                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                        Add Update
                      </Button>
                      {incident.status !== "RESOLVED" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResolveIncident(incident.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredIncidents.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No {activeTab} incidents</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {activeTab === "active" 
                      ? "All systems are operating normally"
                      : "No incidents have been resolved yet"
                    }
                  </p>
                  {activeTab === "active" && (
                    <Link href="/dashboard/incidents/new">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Report Incident
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedIncident && !updateDialog} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedIncident?.title}</DialogTitle>
            <DialogDescription>
              {selectedIncident?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={statusConfig[selectedIncident?.status as keyof typeof statusConfig]?.badgeVariant}>
                  {statusConfig[selectedIncident?.status as keyof typeof statusConfig]?.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Severity</p>
                <Badge variant={severityConfig[selectedIncident?.severity as keyof typeof severityConfig]?.badgeVariant}>
                  {severityConfig[selectedIncident?.severity as keyof typeof severityConfig]?.label}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Affected Services</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedIncident?.incident_services.map((service) => (
                  <Badge key={service.services.id} variant="outline">
                    {service.services.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Timeline</p>
              <p className="text-sm text-muted-foreground">
                Started {selectedIncident && format(new Date(selectedIncident.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
              {selectedIncident?.resolvedAt && (
                <p className="text-sm text-muted-foreground">
                  Resolved {format(new Date(selectedIncident.resolvedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              )}
            </div>
            {selectedIncident?.incident_updates && selectedIncident.incident_updates.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-3">Updates</p>
                <div className="space-y-3">
                  {selectedIncident.incident_updates.map((update) => (
                    <div key={update.id} className="border-l-2 border-muted pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {update.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(update.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm">{update.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Update Dialog */}
      <Dialog open={updateDialog} onOpenChange={setUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Update</DialogTitle>
            <DialogDescription>
              Add a new update to the incident
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="INVESTIGATING">Investigating</option>
                <option value="IDENTIFIED">Identified</option>
                <option value="MONITORING">Monitoring</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                placeholder="Describe the current status and any updates..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedIncident && handleAddUpdate(selectedIncident.id)}
              disabled={!updateMessage.trim()}
            >
              Add Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
 
 