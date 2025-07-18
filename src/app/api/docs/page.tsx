"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Code } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function APIDocsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API endpoint copied to clipboard",
    });
  };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const exampleOrg = 'demo';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-muted-foreground">
          External API for status checks and monitoring integration
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="formats">Response Formats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>External Status API</CardTitle>
              <CardDescription>
                A simple REST API for external monitoring tools and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Real-time service status information</li>
                  <li>Active incidents and maintenance windows</li>
                  <li>Multiple response formats (JSON, XML, Text)</li>
                  <li>Organization-scoped data</li>
                  <li>No authentication required for public data</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Base URL</h3>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {baseUrl}/api/external/status
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${baseUrl}/api/external/status`)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GET /api/external/status</CardTitle>
              <CardDescription>
                Retrieve status information for an organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Query Parameters</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Required</Badge>
                    <code className="text-sm">org</code>
                    <span className="text-sm text-muted-foreground">
                      Organization slug (e.g., &quot;demo&quot;)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Optional</Badge>
                    <code className="text-sm">service</code>
                    <span className="text-sm text-muted-foreground">
                      Specific service ID to filter
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Optional</Badge>
                    <code className="text-sm">format</code>
                    <span className="text-sm text-muted-foreground">
                      Response format: json, xml, or txt (default: json)
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Example Request</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">
                    GET {baseUrl}/api/external/status?org={exampleOrg}&format=json
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  JSON Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm">
                      {baseUrl}/api/external/status?org={exampleOrg}&format=json
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${baseUrl}/api/external/status?org=${exampleOrg}&format=json`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`${baseUrl}/api/external/status?org=${exampleOrg}&format=json`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test API
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  XML Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm">
                      {baseUrl}/api/external/status?org={exampleOrg}&format=xml
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${baseUrl}/api/external/status?org=${exampleOrg}&format=xml`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`${baseUrl}/api/external/status?org=${exampleOrg}&format=xml`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test API
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Text Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm">
                      {baseUrl}/api/external/status?org={exampleOrg}&format=txt
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${baseUrl}/api/external/status?org=${exampleOrg}&format=txt`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`${baseUrl}/api/external/status?org=${exampleOrg}&format=txt`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test API
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Specific Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm">
                      {baseUrl}/api/external/status?org={exampleOrg}&service=SERVICE_ID
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(`${baseUrl}/api/external/status?org=${exampleOrg}&service=SERVICE_ID`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Replace SERVICE_ID with actual service ID
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Response Formats</CardTitle>
              <CardDescription>
                The API supports multiple response formats for different use cases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">JSON Format (Default)</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Structured data format ideal for applications and integrations
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
{`{
  "organization": {
    "name": "Demo Organization",
    "slug": "demo",
    "description": "Demo status page"
  },
  "status": {
    "overall": "operational",
    "uptime": 99.5,
    "services": {
      "total": 5,
      "operational": 4,
      "degraded": 1,
      "partial_outage": 0,
      "major_outage": 0,
      "maintenance": 0
    }
  },
  "services": [...],
  "incidents": [...],
  "maintenance": [...],
  "timestamp": "2024-01-01T12:00:00.000Z"
}`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">XML Format</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  XML format for legacy systems and enterprise integrations
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
{`<?xml version="1.0" encoding="UTF-8"?>
<status>
  <organization>
    <name>Demo Organization</name>
    <slug>demo</slug>
  </organization>
  <status>
    <overall>operational</overall>
    <uptime>99.5</uptime>
  </status>
  <services>...</services>
</status>`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Text Format</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Human-readable format for monitoring tools and logs
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
{`Demo Organization Status Page
==============================

Overall Status: OPERATIONAL
Uptime: 99.5%

Services (5 total):
- Operational: 4
- Degraded: 1
- Partial Outage: 0
- Major Outage: 0
- Under Maintenance: 0

Service Status:
- API Gateway: operational
- Web Application: operational
- Database: operational
- Email Service: degraded performance

Last updated: 1/1/2024, 12:00:00 PM`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
 
 