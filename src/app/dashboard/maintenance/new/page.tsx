"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  status: string;
}

export default function NewMaintenancePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledStart: "",
    scheduledEnd: "",
  });

  // Fetch services for selection
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (selectedServices.length === 0) {
      toast({
        title: "No services selected",
        description: "Please select at least one service for maintenance.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          serviceIds: selectedServices,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create maintenance window");
      }

      toast({
        title: "Maintenance scheduled",
        description: "The maintenance window has been scheduled successfully.",
      });

      router.push("/dashboard/maintenance");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule maintenance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold">Schedule Maintenance</h1>
          <p className="text-muted-foreground mt-2">
            Schedule a maintenance window for specific services.
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
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Maintenance"}
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
 