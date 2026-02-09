"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users, Shield, Briefcase, UserCog, Megaphone, User, Trash2 } from "lucide-react";

// Types
interface ManagementUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

type MangementRole = "ADMIN" | "SALES" | "TECHNICAL" | "HR" | "MEDIA" | "EMPLOYEE";

// Role configuration with icons and colors
const roleConfig: Record<
    MangementRole,
    { label: string; icon: React.ReactElement; color: string; bgColor: string }
> = {
    ADMIN: {
        label: "Admin",
        icon: <Shield className="w-4 h-4" />,
        color: "text-red-600",
        bgColor: "bg-red-50 border-red-200",
    },
    SALES: {
        label: "Sales",
        icon: <Briefcase className="w-4 h-4" />,
        color: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
    },
    TECHNICAL: {
        label: "Technical",
        icon: <UserCog className="w-4 h-4" />,
        color: "text-purple-600",
        bgColor: "bg-purple-50 border-purple-200",
    },
    HR: {
        label: "HR",
        icon: <Users className="w-4 h-4" />,
        color: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
    },
    MEDIA: {
        label: "Media",
        icon: <Megaphone className="w-4 h-4" />,
        color: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
    },
    EMPLOYEE: {
        label: "Employee",
        icon: <User className="w-4 h-4" />,
        color: "text-gray-600",
        bgColor: "bg-gray-50 border-gray-200",
    },
};

export default function ManagementPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<ManagementUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<ManagementUser | null>(null);
    const [newRole, setNewRole] = useState<MangementRole | "">("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [updating, setUpdating] = useState(false);    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<ManagementUser | null>(null);
    const [deleting, setDeleting] = useState(false);
    // Fetch management users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/management");
            const data = await response.json();

            if (data.success) {
                setUsers(data.data);
            } else {
                setError(data.message || "Failed to fetch users");
            }
        } catch (err) {
            setError("An error occurred while fetching users");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async () => {
        if (!selectedUser || !newRole || !session?.user?.id) {
            return;
        }

        try {
            setUpdating(true);
            const response = await fetch("/api/management/update-role", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    adminId: session.user.id,
                    userId: selectedUser.id,
                    role: newRole,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Update the user in the local state
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === selectedUser.id ? { ...user, role: newRole } : user
                    )
                );
                setIsDialogOpen(false);
                setSelectedUser(null);
                setNewRole("");
            } else {
                alert(data.message || "Failed to update role");
            }
        } catch (err) {
            alert("An error occurred while updating the role");
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    const openRoleDialog = (user: ManagementUser) => {
        setSelectedUser(user);
        setNewRole(user.role as MangementRole);
        setIsDialogOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            setDeleting(true);
            const response = await fetch(`/api/management/${userToDelete.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                // Remove the user from the local state
                setUsers((prevUsers) =>
                    prevUsers.filter((user) => user.id !== userToDelete.id)
                );
                setIsDeleteDialogOpen(false);
                setUserToDelete(null);
                alert(`${userToDelete.name} has been deleted successfully`);
            } else {
                const data = await response.json();
                alert(data.error || "Failed to delete user");
            }
        } catch (err) {
            alert("An error occurred while deleting the user");
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    const openDeleteDialog = (user: ManagementUser) => {
        setUserToDelete(user);
        setIsDeleteDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading management users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="p-8 max-w-md text-center">
                    <div className="text-red-500 mb-4">
                        <Shield className="w-12 h-12 mx-auto" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={fetchUsers}>Try Again</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Management Team
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage roles and permissions for your team members
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Members</p>
                            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                        </div>
                        <Users className="w-12 h-12 text-blue-500 opacity-20" />
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Admins</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {users.filter((u) => u.role === "ADMIN").length}
                            </p>
                        </div>
                        <Shield className="w-12 h-12 text-red-500 opacity-20" />
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Active Roles</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {new Set(users.map((u) => u.role)).size}
                            </p>
                        </div>
                        <UserCog className="w-12 h-12 text-green-500 opacity-20" />
                    </div>
                </Card>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => {
                    const config = roleConfig[user.role as MangementRole];
                    return (
                        <Card
                            key={user.id}
                            className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2"
                        >
                            {/* User Avatar */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Role Badge */}
                            <div className="mb-4">
                                <div
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config?.bgColor} ${config?.color}`}
                                >
                                    {config?.icon}
                                    <span className="text-sm font-medium">{config?.label}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => openRoleDialog(user)}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    size="sm"
                                >
                                    Change Role
                                </Button>
                                <Button
                                    onClick={() => openDeleteDialog(user)}
                                    variant="destructive"
                                    size="sm"
                                    className="px-3"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Empty State */}
            {users.length === 0 && (
                <Card className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
                    <p className="text-gray-600">
                        There are no management users in the system yet.
                    </p>
                </Card>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-red-600">Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this user?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* User Info to Delete */}
                        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <p className="text-sm text-red-700 mb-2">
                                <strong>This action cannot be undone.</strong>
                            </p>
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">User to delete:</p>
                                <p className="font-semibold text-gray-900">{userToDelete?.name}</p>
                                <p className="text-sm text-gray-500">{userToDelete?.email}</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setUserToDelete(null);
                            }}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete User"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Role Update Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Update User Role</DialogTitle>
                        <DialogDescription>
                            Change the role for {selectedUser?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Current User Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">User</p>
                            <p className="font-semibold">{selectedUser?.name}</p>
                            <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Select New Role</Label>
                            <Select
                                value={newRole}
                                onValueChange={(value) => setNewRole(value as MangementRole)}
                            >
                                <SelectTrigger id="role" className="w-full">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(roleConfig).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            <div className="flex items-center gap-2">
                                                {config.icon}
                                                <span>{config.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Current vs New Role Preview */}
                        {newRole && selectedUser && newRole !== selectedUser.role && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                <p className="text-sm text-blue-800 mb-2">
                                    <strong>Change Preview:</strong>
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className={roleConfig[selectedUser.role as MangementRole]?.color}>
                                        {roleConfig[selectedUser.role as MangementRole]?.label}
                                    </span>
                                    <span>→</span>
                                    <span className={roleConfig[newRole]?.color}>
                                        {roleConfig[newRole]?.label}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsDialogOpen(false);
                                setSelectedUser(null);
                                setNewRole("");
                            }}
                            disabled={updating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRoleUpdate}
                            disabled={!newRole || newRole === selectedUser?.role || updating}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                            {updating ? "Updating..." : "Update Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
