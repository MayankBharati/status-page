"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Settings, 
  Save, 
  TestTube
} from "lucide-react";

interface EmailSettings {
  emailUser: string;
  emailPass: string;
  emailFrom: string;
  adminEmail: string;
  emailEnabled: boolean;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    emailUser: "",
    emailPass: "",
    emailFrom: "",
    adminEmail: "",
    emailEnabled: true
  });

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      
      if (response.ok) {
        const data = await response.json();
        const currentSettings = data.emailSettings;
        
        // Always use current user's email from Clerk
        const userEmail = user?.primaryEmailAddress?.emailAddress || "";
        
        setEmailSettings({
          emailUser: userEmail, // Always use current user's email
          emailPass: currentSettings.emailPass || "",
          emailFrom: userEmail, // Always use current user's email
          adminEmail: currentSettings.adminEmail || userEmail,
          emailEnabled: currentSettings.emailEnabled !== undefined ? currentSettings.emailEnabled : true
        });
      } else {
        console.error('Failed to fetch settings');
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user, toast]);

  // Handle form changes
  const handleEmailSettingChange = (field: keyof EmailSettings, value: string | boolean) => {
    setEmailSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save settings
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailSettings
        })
      });

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Email settings have been updated successfully."
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Test email configuration
  const handleTestEmail = async () => {
    try {
      setTesting(true);
      const response = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailSettings
        })
      });

      if (response.ok) {
        toast({
          title: "Test email sent",
          description: "A test email has been sent to verify your configuration."
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 border rounded-lg">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your application settings
          </p>
        </div>
      </div>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure email notifications for status updates, incidents, and maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Turn on or off email notifications for all events
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={emailSettings.emailEnabled}
              onCheckedChange={(checked: boolean) => handleEmailSettingChange('emailEnabled', checked)}
            />
          </div>

          <Separator />

          {/* Email Configuration Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email-user">Email User</Label>
              <Input
                id="email-user"
                type="email"
                placeholder="your-email@gmail.com"
                value={emailSettings.emailUser}
                onChange={(e) => handleEmailSettingChange('emailUser', e.target.value)}
                disabled={!emailSettings.emailEnabled}
              />
              <p className="text-sm text-muted-foreground">
                Gmail address for sending notifications (should match your login email)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-pass">Email Password</Label>
              <Input
                id="email-pass"
                type="password"
                placeholder="App Password"
                value={emailSettings.emailPass}
                onChange={(e) => handleEmailSettingChange('emailPass', e.target.value)}
                disabled={!emailSettings.emailEnabled}
              />
              <p className="text-sm text-muted-foreground">
                Gmail App Password (not your regular password)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-from">From Email</Label>
              <Input
                id="email-from"
                type="email"
                placeholder="noreply@yourcompany.com"
                value={emailSettings.emailFrom}
                onChange={(e) => handleEmailSettingChange('emailFrom', e.target.value)}
                disabled={!emailSettings.emailEnabled}
              />
              <p className="text-sm text-muted-foreground">
                Email address that appears as sender (should match your login email)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@yourcompany.com"
                value={emailSettings.adminEmail}
                onChange={(e) => handleEmailSettingChange('adminEmail', e.target.value)}
                disabled={!emailSettings.emailEnabled}
              />
              <p className="text-sm text-muted-foreground">
                Email address to receive all notifications
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSaveSettings}
              disabled={saving || !emailSettings.emailEnabled}
            >
              {saving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleTestEmail}
              disabled={testing || !emailSettings.emailEnabled}
            >
              {testing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test Email
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Gmail Setup Instructions</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Enable 2-Factor Authentication on your Gmail account</li>
              <li>2. Generate an App Password: Google Account → Security → App Passwords</li>
              <li>3. Use the App Password (not your regular password) in the Email Password field</li>
              <li>4. Test the configuration using the &quot;Test Email&quot; button</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Other Settings (Future) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Other Settings
          </CardTitle>
          <CardDescription>
            Additional application configuration options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            More settings will be available here in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 