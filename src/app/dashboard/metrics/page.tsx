"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BarChart3, TrendingUp, Activity } from "lucide-react";
import { 
  UptimeOverview, 
  UptimeComparisonChart, 
  UptimeStats,
  UptimeTrendChart 
} from "@/components/uptime-charts";

interface ServiceUptime {
  serviceId: string;
  serviceName: string;
  uptimePercentage: number;
  totalUptime: number;
  totalDowntime: number;
  lastIncident?: string;
  currentStatus: string;
}

export default function MetricsPage() {
  const [servicesUptime, setServicesUptime] = useState<ServiceUptime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('');
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchUptimeData();
  }, [timeRange]);

  const fetchUptimeData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/uptime?days=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch uptime data');
      const data = await response.json();
      setServicesUptime(data.servicesUptime);
      
      // Set first service as default selected
      if (data.servicesUptime.length > 0 && !selectedService) {
        setSelectedService(data.servicesUptime[0].serviceId);
      }
    } catch (error) {
      console.error('Error fetching uptime data:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Metrics & Analytics</h1>
          <p className="text-muted-foreground">
            Monitor service performance and uptime statistics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Uptime Statistics */}
      <UptimeStats servicesUptime={servicesUptime} />

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Uptime Overview */}
        <UptimeOverview servicesUptime={servicesUptime} />

        {/* Uptime Comparison */}
        <UptimeComparisonChart servicesUptime={servicesUptime} />
      </div>

      {/* Individual Service Trend */}
      {selectedService && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Service Uptime Trend</h2>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {servicesUptime.map((service) => (
                  <SelectItem key={service.serviceId} value={service.serviceId}>
                    {service.serviceName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <UptimeTrendChart serviceId={selectedService} />
        </div>
      )}

      {/* Detailed Service Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Service Performance Details
          </CardTitle>
          <CardDescription>
            Detailed uptime statistics for each service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Service</th>
                  <th className="text-left p-2">Uptime</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Last Incident</th>
                </tr>
              </thead>
              <tbody>
                {servicesUptime.map((service) => (
                  <tr key={service.serviceId} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{service.serviceName}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {service.uptimePercentage.toFixed(2)}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${service.uptimePercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        service.currentStatus === 'OPERATIONAL' ? 'bg-green-100 text-green-800' :
                        service.currentStatus === 'DEGRADED_PERFORMANCE' ? 'bg-yellow-100 text-yellow-800' :
                        service.currentStatus === 'PARTIAL_OUTAGE' ? 'bg-orange-100 text-orange-800' :
                        service.currentStatus === 'MAJOR_OUTAGE' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {service.currentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {service.lastIncident || 'No incidents'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 