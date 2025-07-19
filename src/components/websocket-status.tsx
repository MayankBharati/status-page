"use client";

import { useSocket } from "@/hooks/use-socket";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Globe } from "lucide-react";

interface WebSocketStatusProps {
  organizationSlug?: string;
}

export function WebSocketStatus({ organizationSlug }: WebSocketStatusProps) {
  const { isConnected } = useSocket({
    organizationSlug,
  });

  // Check if we're on Vercel deployment
  const isVercelDeployment = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

  if (isVercelDeployment) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Globe className="h-3 w-3" />
        Live
      </Badge>
    );
  }

  if (isConnected) {
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Wifi className="h-3 w-3" />
        Connected
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="flex items-center gap-1">
      <WifiOff className="h-3 w-3" />
      Disconnected
    </Badge>
  );
} 