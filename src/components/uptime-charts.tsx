"use client";

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface UptimeData {
  date: string;
  uptime: number;
  downtime: number;
  totalMinutes: number;
}

interface ServiceUptime {
  serviceId: string;
  serviceName: string;
  uptimePercentage: number;
  totalUptime: number;
  totalDowntime: number;
  lastIncident?: string;
  currentStatus: string;
}

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'];

export function UptimeOverview({ servicesUptime }: { servicesUptime: ServiceUptime[] }) {
  const pieData = servicesUptime.map(service => ({
    name: service.serviceName,
    value: service.uptimePercentage,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Overall Uptime Overview
        </CardTitle>
        <CardDescription>
          Uptime percentages for all services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(2)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Uptime']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function UptimeTrendChart({ serviceId }: { serviceId: string }) {
  const [uptimeData, setUptimeData] = useState<UptimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState('30');

  useEffect(() => {
    fetchUptimeData();
  }, [serviceId, days]);

  const fetchUptimeData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/uptime?serviceId=${serviceId}&days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch uptime data');
      const data = await response.json();
      setUptimeData(data.uptimeData);
    } catch (error) {
      console.error('Error fetching uptime data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Uptime Trend</CardTitle>
            <CardDescription>Daily uptime percentage over time</CardDescription>
          </div>
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={uptimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Uptime']}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Area 
                type="monotone" 
                dataKey="uptime" 
                stroke="#4caf50" 
                fill="#4caf50" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function UptimeComparisonChart({ servicesUptime }: { servicesUptime: ServiceUptime[] }) {
  const chartData = servicesUptime.map(service => ({
    name: service.serviceName,
    uptime: service.uptimePercentage,
    downtime: 100 - service.uptimePercentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uptime Comparison</CardTitle>
        <CardDescription>Compare uptime across all services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              <Legend />
              <Bar dataKey="uptime" fill="#4caf50" name="Uptime" />
              <Bar dataKey="downtime" fill="#f44336" name="Downtime" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function UptimeStats({ servicesUptime }: { servicesUptime: ServiceUptime[] }) {
  const avgUptime = servicesUptime.reduce((sum, service) => sum + service.uptimePercentage, 0) / servicesUptime.length;
  const bestService = servicesUptime.reduce((best, current) => 
    current.uptimePercentage > best.uptimePercentage ? current : best
  );
  const worstService = servicesUptime.reduce((worst, current) => 
    current.uptimePercentage < worst.uptimePercentage ? current : worst
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgUptime.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground">
            Across all services
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Performing</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bestService.uptimePercentage.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground">
            {bestService.serviceName}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{worstService.uptimePercentage.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground">
            {worstService.serviceName}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 