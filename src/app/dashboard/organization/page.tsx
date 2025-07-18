"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Upload, 
  Copy, 
  Trash2, 
  Globe,
  Link as LinkIcon,
  Save,
  AlertTriangle
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function OrganizationPage() {
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "Acme Corporation",
    slug: "acme",
    description: "Leading technology solutions provider",
    website: "https://acme.com",
    logo: "/logo.png"
  });

  const statusPageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/status/${formData.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(statusPageUrl);
    toast({
      title: "Link copied",
      description: "Status page link has been copied to your clipboard.",
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement actual file upload to cloud storage
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, logo: e.target?.result as string });
        toast({
          title: "Logo uploaded",
          description: "Organization logo has been updated.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to update organization
      toast({
        title: "Settings saved",
        description: "Organization settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrganization = async () => {
    try {
      // TODO: Implement API call to delete organization
      toast({
        title: "Organization deleted",
        description: "Your organization has been deleted successfully.",
      });
      setDeleteDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete organization. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your organization&apos;s profile and settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Organization Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Profile
            </CardTitle>
            <CardDescription>
              Update your organization&apos;s basic information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/status/
                </span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <Button onClick={handleSave} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Logo & Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Logo & Branding</CardTitle>
            <CardDescription>
              Upload your organization&apos;s logo and customize branding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.logo} alt={formData.name} />
                <AvatarFallback className="text-lg">
                  {formData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </span>
                  </Button>
                </Label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground">
                  Recommended: 256x256px, PNG or JPG
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Page */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Public Status Page
            </CardTitle>
            <CardDescription>
              Your public status page URL and settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status Page URL</Label>
              <div className="flex items-center gap-2">
                <Input value={statusPageUrl} readOnly />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">Public</Badge>
              <span className="text-sm text-muted-foreground">
                Anyone with the link can view your status page
              </span>
            </div>

            <Button variant="outline" className="w-full">
              <LinkIcon className="mr-2 h-4 w-4" />
              View Status Page
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Delete Organization</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your organization and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setDeleteDialog(true)}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Organization
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
                         <DialogDescription>
               Are you sure you want to delete &quot;{formData.name}&quot;? This action will:
             </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Permanently delete all services and their data</li>
              <li>Remove all incidents and maintenance records</li>
              <li>Delete all team members and their access</li>
              <li>Make the status page inaccessible</li>
            </ul>
            <p className="text-sm font-medium text-destructive mt-4">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteOrganization}>
              Delete Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
 
 