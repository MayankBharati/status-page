"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2, Eye, Edit, X, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSocket } from "@/hooks/use-socket";

interface Maintenance {
  id: string;
  title: string;
  description: string;
  status: string;
  organizationId: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  createdAt: string;
  updatedAt: string;
  maintenance_services?: Array<{
    id: string;
    serviceId: string;
    services: {
      id: string;
      name: string;
      status: string;
    };
  }>;
}

const statusConfig = {
  SCHEDULED: {
    label: "Scheduled",
    badgeVariant: "default" as const,
    color: "text-blue-600",
  },
  IN_PROGRESS: {
    label: "In Progress",
    badgeVariant: "secondary" as const,
    color: "text-yellow-600",
  },
  COMPLETED: {
    label: "Completed",
    badgeVariant: "secondary" as const,
    color: "text-green-600",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeVariant: "outline" as const,
    color: "text-gray-600",
  },
};

export default function MaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const { toast } = useToast();

  // WebSocket connection for real-time updates
  const { } = useSocket({
    onMaintenanceUpdate: (data) => {
      console.log('Maintenance updated:', data);
      // Refresh maintenance when updates occur
      fetchMaintenances();
    },
  });

  const fetchMaintenances = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/maintenance');
      if (!response.ok) {
        throw new Error('Failed to fetch maintenance');
      }
      const data = await response.json();
      setMaintenances(data);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  const handleCancelMaintenance = async (maintenanceId: string) => {
    try {
      const response = await fetch(`/api/maintenance/${maintenanceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel maintenance');
      }

      toast({
        title: "Success",
        description: "Maintenance cancelled successfully",
      });

      fetchMaintenances();
      setCancelDialog(false);
      setSelectedMaintenance(null);
    } catch (error) {
      console.error('Error cancelling maintenance:', error);
      toast({
        title: "Error",
        description: "Failed to cancel maintenance",
        variant: "destructive",
      });
    }
  };

  const upcomingMaintenances = maintenances.filter(m => m.status === "SCHEDULED");
  const inProgressMaintenances = maintenances.filter(m => m.status === "IN_PROGRESS");
  const completedMaintenances = maintenances.filter(m => m.status === "COMPLETED" || m.status === "CANCELLED");

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minutes`;
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground">
            Schedule and manage maintenance windows
          </p>
        </div>
        <Link href="/dashboard/maintenance/new">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Maintenance
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMaintenances.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled maintenances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressMaintenances.length}</div>
            <p className="text-xs text-muted-foreground">
              Active maintenances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMaintenances.length}</div>
            <p className="text-xs text-muted-foreground">
              Finished maintenances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenances.length}</div>
            <p className="text-xs text-muted-foreground">
              All maintenances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Maintenances */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upcoming Maintenance</h2>
        {upcomingMaintenances.length > 0 ? (
          <div className="space-y-4">
            {upcomingMaintenances.map((maintenance) => {
              const statusInfo = statusConfig[maintenance.status as keyof typeof statusConfig];
              
              return (
                <Card key={maintenance.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className={`h-5 w-5 ${statusInfo.color}`} />
                          {maintenance.title}
                        </CardTitle>
                        <CardDescription>
                          {maintenance.description}
                        </CardDescription>
                      </div>
                      <Badge variant={statusInfo.badgeVariant}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Schedule</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(maintenance.scheduledStart), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Duration: {calculateDuration(maintenance.scheduledStart, maintenance.scheduledEnd)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Created</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(maintenance.createdAt), "MMM d, yyyy")}
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Affected Services</p>
                          {maintenance.maintenance_services && maintenance.maintenance_services.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {maintenance.maintenance_services.map((ms) => (
                                <Badge key={ms.id} variant="outline" className="text-xs">
                                  {ms.services.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">All services</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedMaintenance(maintenance)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Link href={`/dashboard/maintenance/${maintenance.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Schedule
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => {
                          setSelectedMaintenance(maintenance);
                          setCancelDialog(true);
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel Maintenance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No upcoming maintenance</p>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule maintenance windows to inform users in advance
              </p>
              <Link href="/dashboard/maintenance/new">
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Maintenance
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* In Progress Maintenances */}
      {inProgressMaintenances.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">In Progress Maintenance</h2>
          <div className="space-y-4">
            {inProgressMaintenances.map((maintenance) => {
              const statusInfo = statusConfig[maintenance.status as keyof typeof statusConfig];
              
              return (
                <Card key={maintenance.id} className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className={`h-5 w-5 ${statusInfo.color}`} />
                          {maintenance.title}
                        </CardTitle>
                        <CardDescription>
                          {maintenance.description}
                        </CardDescription>
                      </div>
                      <Badge variant={statusInfo.badgeVariant}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Schedule</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(maintenance.scheduledStart), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Duration: {calculateDuration(maintenance.scheduledStart, maintenance.scheduledEnd)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Started</p>
                        <p className="text-sm text-muted-foreground">
                          {maintenance.actualStart 
                            ? format(new Date(maintenance.actualStart), "MMM d, yyyy 'at' h:mm a")
                            : "Not started yet"
                          }
                        </p>
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Affected Services</p>
                          {maintenance.maintenance_services && maintenance.maintenance_services.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {maintenance.maintenance_services.map((ms) => (
                                <Badge key={ms.id} variant="outline" className="text-xs">
                                  {ms.services.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">All services</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedMaintenance(maintenance)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                      <Link href={`/dashboard/maintenance/${maintenance.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Schedule
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => {
                          setSelectedMaintenance(maintenance);
                          setCancelDialog(true);
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel Maintenance
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancel Maintenance Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Cancel Maintenance
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel &quot;{selectedMaintenance?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Keep Scheduled
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedMaintenance && handleCancelMaintenance(selectedMaintenance.id)}
            >
              Cancel Maintenance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!selectedMaintenance && !cancelDialog} onOpenChange={() => setSelectedMaintenance(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMaintenance?.title}</DialogTitle>
            <DialogDescription>
              {selectedMaintenance?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Status</p>
                <Badge variant={statusConfig[selectedMaintenance?.status as keyof typeof statusConfig]?.badgeVariant}>
                  {statusConfig[selectedMaintenance?.status as keyof typeof statusConfig]?.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMaintenance && calculateDuration(selectedMaintenance.scheduledStart, selectedMaintenance.scheduledEnd)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Scheduled Start</p>
              <p className="text-sm text-muted-foreground">
                {selectedMaintenance && format(new Date(selectedMaintenance.scheduledStart), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Scheduled End</p>
              <p className="text-sm text-muted-foreground">
                {selectedMaintenance && format(new Date(selectedMaintenance.scheduledEnd), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">
                {selectedMaintenance && format(new Date(selectedMaintenance.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Affected Services</p>
              {selectedMaintenance?.maintenance_services && selectedMaintenance.maintenance_services.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMaintenance.maintenance_services.map((ms) => (
                    <Badge key={ms.id} variant="outline">
                      {ms.services.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">All services</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 