"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Plus, 
  Search,
  Server,
  Edit,
  Trash,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { useSocket } from "@/hooks/use-socket";

interface Service {
  id: string;
  name: string;
  description: string | null;
  status: 'OPERATIONAL' | 'DEGRADED_PERFORMANCE' | 'PARTIAL_OUTAGE' | 'MAJOR_OUTAGE' | 'UNDER_MAINTENANCE';
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  OPERATIONAL: {
    label: "Operational",
    color: "bg-green-500",
    badgeVariant: "default" as const,
  },
  DEGRADED_PERFORMANCE: {
    label: "Degraded",
    color: "bg-yellow-500",
    badgeVariant: "secondary" as const,
  },
  PARTIAL_OUTAGE: {
    label: "Partial Outage",
    color: "bg-orange-500",
    badgeVariant: "secondary" as const,
  },
  MAJOR_OUTAGE: {
    label: "Major Outage",
    color: "bg-red-500",
    badgeVariant: "destructive" as const,
  },
  UNDER_MAINTENANCE: {
    label: "Maintenance",
    color: "bg-blue-500",
    badgeVariant: "secondary" as const,
  },
};

export default function ServicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [updateStatusDialog, setUpdateStatusDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [viewHistoryDialog, setViewHistoryDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    message: ""
  });
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    status: ""
  });

  // WebSocket connection for real-time updates
  const { isConnected } = useSocket({
    onServiceStatusChange: (data) => {
      console.log('Service status changed:', data);
      // Refresh services when status changes
      fetchServices();
    },
  });

  // Load services from API
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        console.error("Failed to fetch services:", response.status);
        toast({
          title: "Error",
          description: "Failed to load services.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: "Failed to load services.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedService) return;

    try {
      const response = await fetch(`/api/services/${selectedService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusUpdate.status,
          message: statusUpdate.message
        })
      });

      if (response.ok) {
        toast({
          title: "Status updated",
          description: `${selectedService.name} status has been updated.`
        });
        fetchServices();
        setUpdateStatusDialog(false);
        setStatusUpdate({ status: "", message: "" });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedService) return;

    try {
      const response = await fetch(`/api/services/${selectedService.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        toast({
          title: "Service updated",
          description: "Service details have been updated."
        });
        fetchServices();
        setEditDialog(false);
        setEditForm({ name: "", description: "", status: "" });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        title: "Error",
        description: "Failed to update service.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;

    try {
      const response = await fetch(`/api/services/${selectedService.id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast({
          title: "Service deleted",
          description: `${selectedService.name} has been deleted.`
        });
        fetchServices();
        setDeleteDialog(false);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service.",
        variant: "destructive"
      });
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPERATIONAL":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Operational</Badge>;
      case "DEGRADED_PERFORMANCE":
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Degraded</Badge>;
      case "PARTIAL_OUTAGE":
        return <Badge variant="default" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Partial Outage</Badge>;
      case "MAJOR_OUTAGE":
        return <Badge variant="destructive">Major Outage</Badge>;
      case "UNDER_MAINTENANCE":
        return <Badge variant="secondary">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground">
              Manage and monitor all your services
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your services
          </p>
        </div>
        <Link href="/dashboard/services/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => (
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    {service.name}
                  </CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(service.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedService(service);
                          setEditForm({
                            name: service.name,
                            description: service.description || "",
                            status: service.status
                          });
                          setEditDialog(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Service
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedService(service);
                          setViewHistoryDialog(true);
                        }}
                      >
                        <Activity className="mr-2 h-4 w-4" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setSelectedService(service);
                          setDeleteDialog(true);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Service
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(service.status)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm">
                    {new Date(service.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedService(service);
                                                setStatusUpdate({ status: service.status, message: "" });
                      setUpdateStatusDialog(true);
                    }}
                  >
                    Update Status
                  </Button>
                  <Link href={`/dashboard/incidents/new?serviceId=${service.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Report Incident
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Update Status Dialog */}
      <Dialog open={updateStatusDialog} onOpenChange={setUpdateStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Service Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedService?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusUpdate.status} onValueChange={(value) => setStatusUpdate({ ...statusUpdate, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERATIONAL">Operational</SelectItem>
                  <SelectItem value="DEGRADED_PERFORMANCE">Degraded Performance</SelectItem>
                  <SelectItem value="PARTIAL_OUTAGE">Partial Outage</SelectItem>
                  <SelectItem value="MAJOR_OUTAGE">Major Outage</SelectItem>
                  <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a message about this status change..."
                value={statusUpdate.message}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, message: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the service details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERATIONAL">Operational</SelectItem>
                  <SelectItem value="DEGRADED_PERFORMANCE">Degraded Performance</SelectItem>
                  <SelectItem value="PARTIAL_OUTAGE">Partial Outage</SelectItem>
                  <SelectItem value="MAJOR_OUTAGE">Major Outage</SelectItem>
                  <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Service Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedService?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View History Dialog */}
      <Dialog open={viewHistoryDialog} onOpenChange={setViewHistoryDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Service History - {selectedService?.name}</DialogTitle>
            <DialogDescription>
              View the complete history of status changes and updates for this service.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Recent Status Changes</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Status changed to Operational</p>
                    <p className="text-sm text-muted-foreground">System performance restored to normal levels</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">2 hours ago</p>
                    <p className="text-xs text-muted-foreground">by Admin</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Status changed to Degraded Performance</p>
                    <p className="text-sm text-muted-foreground">Experiencing slower response times</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">1 day ago</p>
                    <p className="text-xs text-muted-foreground">by System</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">Service created</p>
                    <p className="text-sm text-muted-foreground">Initial service setup</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">3 days ago</p>
                    <p className="text-xs text-muted-foreground">by Admin</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Service Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-muted-foreground">{selectedService?.createdAt ? new Date(selectedService.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Last Updated</p>
                  <p className="text-muted-foreground">{selectedService?.updatedAt ? new Date(selectedService.updatedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium">Current Status</p>
                  <p className="text-muted-foreground">{selectedService?.status}</p>
                </div>
                <div>
                  <p className="font-medium">Service ID</p>
                  <p className="text-muted-foreground font-mono text-xs">{selectedService?.id}</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setViewHistoryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 