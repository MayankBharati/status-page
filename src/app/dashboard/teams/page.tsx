"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/hooks/use-socket";
import { 
  MoreHorizontal, 
  Plus, 
  Users,
  Shield,
  UserPlus,
  Mail,
  Edit,
  Trash,
  UserMinus,
  Loader2
} from "lucide-react";

const roleConfig = {
  OWNER: {
    label: "Owner",
    description: "Full access to all features",
    icon: Shield,
    badgeVariant: "default" as const,
  },
  ADMIN: {
    label: "Admin",
    description: "Full access to all features",
    icon: Shield,
    badgeVariant: "default" as const,
  },
  MEMBER: {
    label: "Member",
    description: "Can manage services and incidents",
    icon: Users,
    badgeVariant: "secondary" as const,
  },
};

interface Team {
  id: string;
  name: string;
  description: string;
  members: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    joinedAt: Date;
  }>;
}

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  joinedAt: Date;
}

export default function TeamsPage() {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [createTeamDialog, setCreateTeamDialog] = useState(false);
  const [editTeamDialog, setEditTeamDialog] = useState(false);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [changeRoleDialog, setChangeRoleDialog] = useState(false);
  const [deleteTeamDialog, setDeleteTeamDialog] = useState(false);
  const [removeMemberDialog, setRemoveMemberDialog] = useState(false);
  const [transferOwnershipDialog, setTransferOwnershipDialog] = useState(false);
  
  // Selected items
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Form states
  const [createTeamForm, setCreateTeamForm] = useState({
    name: "",
    description: ""
  });
  
  const [editTeamForm, setEditTeamForm] = useState({
    name: "",
    description: ""
  });
  
  const [addMemberForm, setAddMemberForm] = useState({
    name: "",
    email: "",
    role: "MEMBER"
  });
  
  const [changeRoleForm, setChangeRoleForm] = useState({
    role: ""
  });

  // WebSocket connection for real-time updates
  const { isConnected } = useSocket({
    onServiceStatusChange: (data) => {
      // Refresh teams when any service status changes (might affect team permissions)
      fetchTeams();
    },
    onTeamMemberUpdate: (data) => {
      console.log('Team member update received:', data);
      // Refresh teams when team members are added, removed, or roles change
      fetchTeams();
    },
    onTeamUpdate: (data) => {
      console.log('Team update received:', data);
      // Refresh teams when teams are created or deleted
      fetchTeams();
    },
  });

  // Fetch teams data
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams', {
        // Add cache headers for better performance
        headers: {
          'Cache-Control': 'max-age=30' // Cache for 30 seconds
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      } else {
        console.error('Failed to fetch teams');
        toast({
          title: "Error",
          description: "Failed to load teams data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [toast]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const totalMembers = teams.reduce((acc, team) => acc + team.members.length, 0);
  const totalAdmins = teams.reduce(
    (acc, team) => acc + team.members.filter((m) => m.role === "ADMIN" || m.role === "OWNER").length,
    0
  );

  // Handle create team
  const handleCreateTeam = async () => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: createTeamForm.name,
          description: createTeamForm.description
        })
      });

      if (response.ok) {
        // Refresh teams data
        await fetchTeams();
        
        setCreateTeamDialog(false);
        setCreateTeamForm({ name: "", description: "" });
        
        toast({
          title: "Team created",
          description: "New team has been created successfully."
        });
      } else {
        throw new Error('Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive"
      });
    }
  };

  // Handle edit team
  const handleEditTeam = async () => {
    if (!selectedTeam) return;
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editTeamForm.name,
          description: editTeamForm.description
        })
      });

      if (response.ok) {
        // Refresh teams data
        await fetchTeams();
        
        setEditTeamDialog(false);
        setEditTeamForm({ name: "", description: "" });
        
        toast({
          title: "Team updated",
          description: "Team details have been updated successfully."
        });
      } else {
        throw new Error('Failed to update team');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive"
      });
    }
  };

  // Handle add member
  const handleAddMember = async () => {
    if (!selectedTeam) return;
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addMemberForm.name,
          email: addMemberForm.email,
          role: addMemberForm.role
        })
      });

      if (response.ok) {
        // Refresh teams data
        await fetchTeams();
        
        setAddMemberDialog(false);
        setAddMemberForm({ name: "", email: "", role: "MEMBER" });
        
        toast({
          title: "Member added",
          description: "Team member has been added successfully."
        });
      } else {
        throw new Error('Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive"
      });
    }
  };

  // Handle change role
  const handleChangeRole = async () => {
    if (!selectedTeam || !selectedMember) return;
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: changeRoleForm.role
        })
      });

      if (response.ok) {
        // Refresh teams data
        await fetchTeams();
        
        setChangeRoleDialog(false);
        setChangeRoleForm({ role: "" });
        
        toast({
          title: "Role updated",
          description: "Member role has been updated successfully."
        });
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive"
      });
    }
  };

  // Handle transfer ownership
  const handleTransferOwnership = async () => {
    if (!selectedTeam || !selectedMember) return;
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members/${selectedMember.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'transfer-ownership'
        })
      });

      if (response.ok) {
        // Refresh teams data
        await fetchTeams();
        
        setTransferOwnershipDialog(false);
        
        toast({
          title: "Ownership transferred",
          description: `Ownership has been transferred to ${selectedMember.name} successfully.`
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to transfer ownership');
      }
    } catch (error) {
      console.error('Error transferring ownership:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to transfer ownership",
        variant: "destructive"
      });
    }
  };

  // Handle delete team
  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh teams data
        await fetchTeams();
        
        setDeleteTeamDialog(false);
        
        toast({
          title: "Team deleted",
          description: "Team has been deleted successfully."
        });
      } else {
        throw new Error('Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive"
      });
    }
  };

  // Handle remove member
  const handleRemoveMember = async () => {
    if (!selectedTeam || !selectedMember) return;
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members/${selectedMember.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Refresh teams data
        await fetchTeams();
        
        setRemoveMemberDialog(false);
        
        toast({
          title: "Member removed",
          description: "Team member has been removed successfully."
        });
      } else {
        throw new Error('Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive"
      });
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
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Teams Skeleton */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 border rounded-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
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
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage your teams and team members
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (teams.length > 0) {
                setSelectedTeam(teams[0]);
                setAddMemberDialog(true);
              }
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
          <Button
            onClick={() => {
              setCreateTeamDialog(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <div className="space-y-4">
        {teams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No teams yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first team to start managing members
              </p>
              <Button
                onClick={() => {
                  setCreateTeamDialog(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Team
              </Button>
            </CardContent>
          </Card>
        ) : (
          teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>{team.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => console.log('Dropdown trigger clicked for team:', team.name)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Team Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          console.log('Edit Team clicked for:', team.name);
                          setSelectedTeam(team);
                          setEditTeamForm({
                            name: team.name,
                            description: team.description
                          });
                          setEditTeamDialog(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          console.log('Add Member clicked for team:', team.name);
                          setSelectedTeam(team);
                          setAddMemberDialog(true);
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          console.log('Delete Team clicked for:', team.name);
                          setSelectedTeam(team);
                          setDeleteTeamDialog(true);
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedTeam(team);
                        setAddMemberDialog(true);
                      }}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </div>

                  {team.members.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No members in this team</p>
                      <p className="text-sm">Add members to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {team.members.map((member) => {
                        const roleInfo = roleConfig[member.role as keyof typeof roleConfig];
                        
                        return (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={member.avatar || undefined} />
                                <AvatarFallback>
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {member.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={roleInfo.badgeVariant}>
                                {roleInfo.label}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => console.log('Member dropdown clicked for:', member.name)}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      console.log('Change Role clicked for:', member.name);
                                      setSelectedTeam(team);
                                      setSelectedMember(member);
                                      setChangeRoleForm({ role: member.role });
                                      setChangeRoleDialog(true);
                                    }}
                                  >
                                    <Shield className="mr-2 h-4 w-4" />
                                    Change Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      console.log('Remove Member clicked for:', member.name);
                                      setSelectedTeam(team);
                                      setSelectedMember(member);
                                      setRemoveMemberDialog(true);
                                    }}
                                  >
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    Remove from Team
                                  </DropdownMenuItem>
                                  {/* Only show Transfer Ownership for non-owners and if current user is owner */}
                                  {member.role !== 'OWNER' && (
                                    <DropdownMenuItem 
                                      className="text-blue-600"
                                      onClick={() => {
                                        console.log('Transfer Ownership clicked for:', member.name);
                                        setSelectedTeam(team);
                                        setSelectedMember(member);
                                        setTransferOwnershipDialog(true);
                                      }}
                                    >
                                      <Shield className="mr-2 h-4 w-4" />
                                      Transfer Ownership
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={createTeamDialog} onOpenChange={setCreateTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>
              Create a new team to organize your members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-team-name">Team Name</Label>
              <Input
                id="new-team-name"
                value={createTeamForm.name}
                onChange={(e) => setCreateTeamForm({ ...createTeamForm, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="new-team-description">Description</Label>
              <Textarea
                id="new-team-description"
                value={createTeamForm.description}
                onChange={(e) => setCreateTeamForm({ ...createTeamForm, description: e.target.value })}
                placeholder="Enter team description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTeamDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam}>Create Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={editTeamDialog} onOpenChange={setEditTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update the team name and description
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={editTeamForm.name}
                onChange={(e) => setEditTeamForm({ ...editTeamForm, name: e.target.value })}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={editTeamForm.description}
                onChange={(e) => setEditTeamForm({ ...editTeamForm, description: e.target.value })}
                placeholder="Enter team description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTeamDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTeam}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialog} onOpenChange={setAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to the team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                value={addMemberForm.name}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, name: e.target.value })}
                placeholder="Enter member name"
              />
            </div>
            <div>
              <Label htmlFor="member-email">Email</Label>
              <Input
                id="member-email"
                type="email"
                value={addMemberForm.email}
                onChange={(e) => setAddMemberForm({ ...addMemberForm, email: e.target.value })}
                placeholder="Enter member email"
              />
            </div>
            <div>
              <Label htmlFor="member-role">Role</Label>
              <Select
                value={addMemberForm.role}
                onValueChange={(value) => setAddMemberForm({ ...addMemberForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={changeRoleDialog} onOpenChange={setChangeRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={changeRoleForm.role}
                onValueChange={(value) => setChangeRoleForm({ role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Ownership Dialog */}
      <Dialog open={transferOwnershipDialog} onOpenChange={setTransferOwnershipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Ownership</DialogTitle>
            <DialogDescription>
              Are you sure you want to transfer ownership of &quot;{selectedTeam?.name}&quot; to {selectedMember?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOwnershipDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleTransferOwnership}>
              Transfer Ownership
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={deleteTeamDialog} onOpenChange={setDeleteTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedTeam?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTeamDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam}>
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={removeMemberDialog} onOpenChange={setRemoveMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedMember?.name} from the team?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveMemberDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 