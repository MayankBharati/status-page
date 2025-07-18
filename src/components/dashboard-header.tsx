"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebSocketStatus } from "@/components/websocket-status";

export function DashboardHeader() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl">StatusPage</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <WebSocketStatus organizationSlug="demo" />
          <Link href="/status/demo" target="_blank">
            <Button variant="outline" size="sm">
              View Public Page
            </Button>
          </Link>
          <Link href="/api/docs" target="_blank">
            <Button variant="outline" size="sm">
              API Docs
            </Button>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
} 