"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, TrendingUp, TrendingDown, Clock } from "lucide-react";

interface UptimeData {
  date: string;
  uptime: number;
  incidents: number;
  maintenance: number;
}

interface UptimeChartProps {
  serviceId?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
}

export default function UptimeChart({ serviceId, timeRange = '7d' }: UptimeChartProps) {
  const [data, setData] = useState<UptimeData[]>([]);
  const [selectedRange, setSelectedRange] = useState(timeRange);
  const [loading, setLoading] = useState(true);

  // Mock data - in production, this would come from the API
  const mockData: Record<string, UptimeData[]> = {
    '24h': Array.from({ length: 24 }, (_, i) => ({
      date: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
      uptime: 95 + Math.random() * 5,
      incidents: Math.random() > 0.8 ? 1 : 0,
      maintenance: Math.random() > 0.9 ? 1 : 0,
    })),
    '7d': Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
      uptime: 95 + Math.random() * 5,
      incidents: Math.random() > 0.7 ? 1 : 0,
      maintenance: Math.random() > 0.8 ? 1 : 0,
    })),
    '30d': Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      uptime: 95 + Math.random() * 5,
      incidents: Math.random() > 0.8 ? 1 : 0,
      maintenance: Math.random() > 0.9 ? 1 : 0,
    })),
    '90d': Array.from({ length: 90 }, (_, i) => ({
      date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString(),
      uptime: 95 + Math.random() * 5,
      incidents: Math.random() > 0.85 ? 1 : 0,
      maintenance: Math.random() > 0.95 ? 1 : 0,
    })),
  };

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData(mockData[selectedRange] || []);
      setLoading(false);
    }, 500);
  }, [selectedRange, serviceId]);

  const calculateStats = () => {
    if (data.length === 0) return { avg: 0, min: 0, max: 0, trend: 0 };

    const uptimes = data.map(d => d.uptime);
    const avg = uptimes.reduce((a, b) => a + b, 0) / uptimes.length;
    const min = Math.min(...uptimes);
    const max = Math.max(...uptimes);
    
    // Calculate trend (simple linear regression)
    const n = uptimes.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = uptimes.reduce((a, b) => a + b, 0);
    const sumXY = uptimes.reduce((a, b, i) => a + (b * i), 0);
    const sumX2 = uptimes.reduce((a, b, i) => a + (i * i), 0);
    
    const trend = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    return { avg, min, max, trend };
  };

  const stats = calculateStats();
  const totalIncidents = data.reduce((sum, d) => sum + d.incidents, 0);
  const totalMaintenance = data.reduce((sum, d) => sum + d.maintenance, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (selectedRange) {
      case '24h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case '7d':
        return date.toLocaleDateString([], { weekday: 'short' });
      case '30d':
      case '90d':
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Uptime Metrics</CardTitle>
          <CardDescription>Loading uptime data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Uptime Metrics
            </CardTitle>
            <CardDescription>
              Service availability over time
            </CardDescription>
          </div>
          <Select value={selectedRange} onValueChange={v => setSelectedRange(v as typeof selectedRange)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.avg.toFixed(2)}%</p>
            <p className="text-sm text-muted-foreground">Average</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.min.toFixed(2)}%</p>
            <p className="text-sm text-muted-foreground">Minimum</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.max.toFixed(2)}%</p>
            <p className="text-sm text-muted-foreground">Maximum</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              {stats.trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <p className="text-2xl font-bold">{Math.abs(stats.trend).toFixed(2)}%</p>
            </div>
            <p className="text-sm text-muted-foreground">Trend</p>
          </div>
        </div>

        {/* Simple Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uptime Timeline</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span>Downtime</span>
              </div>
            </div>
          </div>
          <div className="h-32 bg-muted rounded-lg p-4">
            <div className="flex items-end justify-between h-full gap-1">
              {data.map((point, i) => (
                <div
                  key={i}
                  className="flex-1 bg-green-500 rounded-t"
                  style={{
                    height: `${point.uptime}%`,
                    backgroundColor: point.uptime < 90 ? '#ef4444' : '#22c55e',
                  }}
                  title={`${formatDate(point.date)}: ${point.uptime.toFixed(1)}%`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatDate(data[0]?.date || '')}</span>
            <span>{formatDate(data[data.length - 1]?.date || '')}</span>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Incidents:</span>
              <Badge variant="secondary">{totalIncidents}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Maintenance:</span>
              <Badge variant="secondary">{totalMaintenance}</Badge>
            </div>
          </div>
          <Badge variant={stats.avg >= 99.9 ? "default" : stats.avg >= 99 ? "secondary" : "destructive"}>
            {stats.avg >= 99.9 ? "Excellent" : stats.avg >= 99 ? "Good" : "Needs Attention"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 