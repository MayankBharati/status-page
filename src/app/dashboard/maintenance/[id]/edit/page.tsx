"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  status: string;
}

interface MaintenanceService {
  id: string;
  serviceId: string;
  services: {
    id: string;
    name: string;
    status: string;
  };
}

interface Maintenance {
  id: string;
  title: string;
  description: string;
  status: string;
  scheduledStart: string;
  scheduledEnd: string;
  maintenance_services?: MaintenanceService[];
}

export default function EditMaintenancePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledStart: "",
    scheduledEnd: "",
    status: "",
  });

  // Fetch maintenance and services data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch maintenance details
        const maintenanceResponse = await fetch(`/api/maintenance/${params.id}`);
        if (!maintenanceResponse.ok) {
          throw new Error('Failed to fetch maintenance');
        }
        const maintenanceData = await maintenanceResponse.json();
        setMaintenance(maintenanceData);
        
        // Set form data
        setFormData({
          title: maintenanceData.title,
          description: maintenanceData.description,
          scheduledStart: new Date(maintenanceData.scheduledStart).toISOString().slice(0, 16),
          scheduledEnd: new Date(maintenanceData.scheduledEnd).toISOString().slice(0, 16),
          status: maintenanceData.status.toLowerCase(),
        });
        
        // Set selected services
        if (maintenanceData.maintenance_services) {
          setSelectedServices(maintenanceData.maintenance_services.map((ms: MaintenanceService) => ms.serviceId));
        }
        
        // Fetch all services for selection
        const servicesResponse = await fetch("/api/services");
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setServices(servicesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load maintenance data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, toast]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/maintenance/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          serviceIds: selectedServices,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update maintenance");
      }

      toast({
        title: "Maintenance updated",
        description: "The maintenance window has been updated successfully.",
      });

      router.push("/dashboard/maintenance");
    } catch {
      toast({
        title: "Error",
        description: "Failed to update maintenance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Maintenance not found</h1>
          <p className="text-muted-foreground mt-2">
            The maintenance window you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/dashboard/maintenance">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Maintenance
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/dashboard/maintenance">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Maintenance
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Edit Maintenance</h1>
          <p className="text-muted-foreground mt-2">
            Update maintenance window details and affected services.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Maintenance Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Database migration and optimization"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide details about the maintenance work"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledStart">Start Time</Label>
              <Input
                id="scheduledStart"
                type="datetime-local"
                value={formData.scheduledStart}
                onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledEnd">End Time</Label>
              <Input
                id="scheduledEnd"
                type="datetime-local"
                value={formData.scheduledEnd}
                onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service Selection */}
          <div className="space-y-4">
            <div>
              <Label>Affected Services</Label>
              <p className="text-sm text-muted-foreground">
                Select the services that will be affected by this maintenance
              </p>
            </div>
            
            <div className="grid gap-3">
              {services.map((service) => (
                <Card 
                  key={service.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedServices.includes(service.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-muted-foreground/20'
                  }`}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedServices.includes(service.id) 
                            ? 'bg-primary' 
                            : 'bg-muted'
                        }`}>
                          {selectedServices.includes(service.id) && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {service.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {selectedServices.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update Maintenance"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/maintenance")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 